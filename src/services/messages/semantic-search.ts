import { createHash } from 'crypto'
import { BadRequest, Unavailable } from '@feathersjs/errors'
import type { Db } from 'mongodb'
import { ObjectId } from 'mongodb'
import { logger } from '../../logger'

const MODEL = process.env.EMBEDDING_MODEL || 'bge-m3'
const BATCH_SIZE = 24
const CACHE_LIMIT = 5000
const CHUNK_SIZE = 2000
const cache = new Map<string, number[]>()

export interface SearchableMessage {
  _id: ObjectId
  conversation: string
  type: string
  text?: string
  [key: string]: unknown
}

function cacheKey(text: string): string {
  return createHash('sha256').update(MODEL).update('\0').update(text).digest('hex')
}

async function embeddings(texts: string[]): Promise<number[][]> {
  const result: Array<number[] | undefined> = texts.map((text) => cache.get(cacheKey(text)))
  const missing = texts.flatMap((text, index) => result[index] ? [] : [{ text, index }])
  if (missing.length) {
    let host: URL
    try {
      host = new URL(process.env.OLLAMA_HOST || 'http://127.0.0.1:11434')
    } catch {
      throw new Unavailable('Adresse du serveur Ollama invalide.')
    }
    if (host.protocol !== 'http:' || host.username || host.password ||
      !['localhost', '127.0.0.1', '[::1]', 'ollama'].includes(host.hostname)) {
      throw new Unavailable('La recherche sémantique exige un serveur Ollama local.')
    }
    let response: Response
    try {
      response = await fetch(new URL('/api/embed', host), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, input: missing.map((item) => item.text), truncate: false }),
        redirect: 'error',
        signal: AbortSignal.timeout(120000)
      })
      if (!response.ok) throw new Error(`Ollama status ${response.status}`)
      const body: unknown = await response.json()
      if (!body || typeof body !== 'object' || !('embeddings' in body) ||
        !Array.isArray(body.embeddings) || body.embeddings.length !== missing.length) {
        throw new Error('Invalid embedding response')
      }
      for (const [i, item] of missing.entries()) {
        const vector: unknown = body.embeddings[i]
        if (!Array.isArray(vector) || vector.length === 0 ||
          !vector.every((value) => typeof value === 'number' && Number.isFinite(value)) ||
          !vector.some((value) => value !== 0)) {
          throw new Error('Invalid embedding vector')
        }
        result[item.index] = vector
        if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!)
        cache.set(cacheKey(item.text), vector)
      }
    } catch (error) {
      logger.error(`Local embedding request failed: ${error instanceof Error ? error.message : 'unknown error'}`)
      throw new Unavailable(`Recherche sémantique indisponible : vérifiez Ollama et le modèle ${MODEL}.`)
    }
  }
  return result.map((vector) => {
    if (!vector) throw new Unavailable('Vecteur sémantique manquant.')
    return vector
  })
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) throw new Unavailable('Dimensions des vecteurs incompatibles.')
  let dot = 0
  let aa = 0
  let bb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    aa += a[i] * a[i]
    bb += b[i] * b[i]
  }
  if (!aa || !bb) throw new Unavailable('Vecteur sémantique invalide.')
  return dot / Math.sqrt(aa * bb)
}

export async function searchVisibleMessages(
  db: Db, conversation: string, userId: string, query: string
): Promise<SearchableMessage[]> {
  const key = query.trim()
  if (!key || key.length > 1000) throw new BadRequest('La recherche doit contenir entre 1 et 1000 caractères.')

  const [queryVector] = await embeddings([key])
  const results: Array<{ message: SearchableMessage; score: number }> = []
  const visibility = db.collection('message-visibility').find(
    { userId, conversationId: conversation },
    { projection: { messageId: 1 } }
  )

  const scoreBatch = async (ids: ObjectId[]) => {
    if (!ids.length) return
    const messages = await db.collection<SearchableMessage>('messages').find({
      _id: { $in: ids }, conversation, type: 'message', text: { $type: 'string', $ne: '' }
    }).toArray()
    const chunks: Array<{ message: SearchableMessage; text: string }> = []
    for (const message of messages) {
      const text = message.text?.trim()
      if (!text) continue
      for (let offset = 0; offset < text.length; offset += CHUNK_SIZE) {
        chunks.push({ message, text: text.slice(offset, offset + CHUNK_SIZE) })
      }
    }
    const scores = new Map<string, { message: SearchableMessage; score: number }>()
    for (let offset = 0; offset < chunks.length; offset += BATCH_SIZE) {
      const batch = chunks.slice(offset, offset + BATCH_SIZE)
      const vectors = await embeddings(batch.map((chunk) => chunk.text))
      for (const [index, chunk] of batch.entries()) {
        const score = cosineSimilarity(queryVector, vectors[index])
        const id = chunk.message._id.toString()
        if (!scores.has(id) || score > scores.get(id)!.score) scores.set(id, { message: chunk.message, score })
      }
    }
    for (const candidate of scores.values()) {
      const previous = results.findIndex((entry) => entry.message._id.equals(candidate.message._id))
      if (previous !== -1) results.splice(previous, 1)
      results.push(candidate)
    }
    results.sort((a, b) => b.score - a.score)
    results.splice(20)
  }

  let ids: ObjectId[] = []
  for await (const item of visibility) {
    if (!ObjectId.isValid(item.messageId)) continue
    ids.push(new ObjectId(item.messageId))
    if (ids.length === BATCH_SIZE) {
      await scoreBatch(ids)
      ids = []
    }
  }
  await scoreBatch(ids)
  const resultIds = results.map((result) => result.message._id.toString())
  const stillVisible = await db.collection('message-visibility').find({
    userId, conversationId: conversation, messageId: { $in: resultIds }
  }).toArray()
  const allowed = new Set(stillVisible.map((item) => item.messageId))
  const current = await db.collection<SearchableMessage>('messages').find({
    _id: { $in: resultIds.filter((id) => allowed.has(id)).map((id) => new ObjectId(id)) },
    conversation, type: 'message'
  }).toArray()
  const currentById = new Map(current.map((message) => [message._id.toString(), message]))
  return results.flatMap(({ message }) => {
    const updated = currentById.get(message._id.toString())
    return updated && updated.text === message.text ? [updated] : []
  })
}
