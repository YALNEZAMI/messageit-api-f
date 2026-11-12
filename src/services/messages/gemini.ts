import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Content, Part } from '@google/generative-ai'
import { GeneralError, Unavailable } from '@feathersjs/errors'
import { logger } from '../../logger'

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'

export function buildGeminiContents(
  messages: Array<{ sender?: unknown; text?: string; type: string }>,
  sender: string,
  text: string,
  media: Part[] = []
): Content[] {
  const contents: Content[] = messages
    .filter((message) => message.type === 'message' && message.text?.trim())
    .map((message) => ({
      role: String(message.sender) === sender ? 'user' : 'model',
      parts: [{ text: message.text! }]
    }))

  const parts: Part[] = []
  if (text?.trim()) parts.push({ text })
  parts.push(...media)
  contents.push({ role: 'user', parts })
  return contents
}

export async function generateGeminiResponse(contents: Content[]): Promise<string> {
  const key = process.env.GEMINI_KEY
  if (!key) throw new GeneralError('La clé Gemini est absente de la configuration du serveur.')

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL
  try {
    const client = new GoogleGenerativeAI(key)
    const response = await client.getGenerativeModel({ model }).generateContent({ contents })
    const text = response.response.text()
    if (!text) throw new Error('Empty Gemini response')
    return text
  } catch (error) {
    const status = typeof error === 'object' && error !== null && 'status' in error
      ? String(error.status)
      : 'unknown'
    logger.error(`Gemini generation failed (status: ${status}).`)
    throw new Unavailable('La réponse de l’assistant est indisponible. Réessayez ou vérifiez la configuration Gemini.')
  }
}
