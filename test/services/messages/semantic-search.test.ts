import assert from 'assert'
import { createServer, Server } from 'http'
import { AddressInfo } from 'net'
import { Db, MongoClient, ObjectId } from 'mongodb'
import { cosineSimilarity, searchVisibleMessages } from '../../../src/services/messages/semantic-search'

describe('local semantic search', function () {
  const uri = process.env.SEMANTIC_TEST_MONGODB_URI
  let client: MongoClient
  let db: Db
  let server: Server
  let originalHost: string | undefined
  let calls: string[][] = []
  let fail = false
  const user = 'user-1'
  const conversation = 'conversation-1'
  const beach = new ObjectId()
  const work = new ObjectId()
  const hidden = new ObjectId()
  const otherConversation = new ObjectId()

  before(async function () {
    if (!uri) return this.skip()
    this.timeout(15000)
    originalHost = process.env.OLLAMA_HOST
    server = createServer((req, res) => {
      let raw = ''
      req.on('data', (chunk) => { raw += chunk })
      req.on('end', () => {
        if (fail) {
          res.writeHead(503).end()
          return
        }
        const body = JSON.parse(raw) as { input: string[]; truncate: boolean }
        assert.strictEqual(body.truncate, false)
        calls.push(body.input)
        const vectors = body.input.map((text) =>
          /voyage|plage/i.test(text) ? [1, 0] : [0, 1]
        )
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ embeddings: vectors }))
      })
    })
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    process.env.OLLAMA_HOST = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    client = await MongoClient.connect(uri)
    db = client.db(`semantic_test_${new ObjectId().toHexString()}`)
    await db.collection('messages').insertMany([
      { _id: beach, conversation, type: 'message', text: 'Allons à la plage' },
      { _id: work, conversation, type: 'message', text: 'Réunion au bureau' },
      { _id: hidden, conversation, type: 'message', text: 'voyage secret' },
      { _id: otherConversation, conversation: 'conversation-2', type: 'message', text: 'voyage ailleurs' }
    ])
    await db.collection('message-visibility').insertMany([
      { userId: user, conversationId: conversation, messageId: beach.toString() },
      { userId: user, conversationId: conversation, messageId: work.toString() },
      { userId: 'other-user', conversationId: conversation, messageId: hidden.toString() },
      { userId: user, conversationId: 'conversation-2', messageId: otherConversation.toString() }
    ])
  })

  after(async () => {
    if (client) {
      await db.dropDatabase()
      await client.close()
    }
    if (server) await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    if (originalHost === undefined) delete process.env.OLLAMA_HOST
    else process.env.OLLAMA_HOST = originalHost
  })

  it('ranks visible messages by meaning and reuses cached vectors', async () => {
    const first = await searchVisibleMessages(db, conversation, user, 'voyage')
    assert.deepStrictEqual(first.map((message) => message._id.toString()), [beach.toString(), work.toString()])
    const previousCalls = calls.length
    await searchVisibleMessages(db, conversation, user, 'voyage')
    assert.strictEqual(calls.length, previousCalls)
    assert(!calls.flat().includes('voyage secret'))
    assert(!calls.flat().includes('voyage ailleurs'))
  })

  it('uses the changed text and removes revoked messages from results', async () => {
    await db.collection('messages').updateOne({ _id: work }, { $set: { text: 'voyage en train' } })
    await db.collection('message-visibility').deleteOne({ userId: user, messageId: beach.toString() })
    const result = await searchVisibleMessages(db, conversation, user, 'voyage')
    assert.deepStrictEqual(result.map((message) => message._id.toString()), [work.toString()])
    assert(calls.flat().includes('voyage en train'))
  })

  it('searches long messages in chunks and returns at most 20 results', async () => {
    const longId = new ObjectId()
    const additional = Array.from({ length: 25 }, (_, index) => ({
      _id: new ObjectId(), conversation, type: 'message', text: `bureau ${index}`
    }))
    await db.collection('messages').insertMany([
      { _id: longId, conversation, type: 'message', text: `${'bureau '.repeat(350)}voyage` },
      ...additional
    ])
    await db.collection('message-visibility').insertMany([longId, ...additional.map((message) => message._id)]
      .map((id) => ({ userId: user, conversationId: conversation, messageId: id.toString() })))
    const result = await searchVisibleMessages(db, conversation, user, 'voyage')
    assert.strictEqual(result.length, 20)
    assert(result.some((message) => message._id.equals(longId)))
    assert(calls.flat().some((text) => text.endsWith('voyage') && text.length > 10 && text.length < 2000))
  })

  it('surfaces embedding errors and rejects invalid input', async () => {
    await assert.rejects(() => searchVisibleMessages(db, conversation, user, ' '.repeat(2)), /entre 1 et 1000/)
    fail = true
    try {
      await assert.rejects(() => searchVisibleMessages(db, conversation, user, 'une requête inédite'), /indisponible/)
    } finally {
      fail = false
    }
  })

  it('refuses a remote embedding host', async () => {
    const localHost = process.env.OLLAMA_HOST
    process.env.OLLAMA_HOST = 'http://example.invalid:11434'
    try {
      await assert.rejects(() => searchVisibleMessages(db, conversation, user, 'requête différente'),
        /serveur Ollama local/)
    } finally {
      process.env.OLLAMA_HOST = localHost
    }
  })
})

describe('cosine similarity', () => {
  it('orders matching vectors and rejects incompatible dimensions', () => {
    assert.strictEqual(cosineSimilarity([1, 0], [1, 0]), 1)
    assert.strictEqual(cosineSimilarity([1, 0], [0, 1]), 0)
    assert.throws(() => cosineSimilarity([1], [1, 2]), /incompatibles/)
  })
})
