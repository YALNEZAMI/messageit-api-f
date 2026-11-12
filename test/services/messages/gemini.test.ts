import assert from 'assert'
import { buildGeminiContents, DEFAULT_GEMINI_MODEL, generateGeminiResponse } from '../../../src/services/messages/gemini'

describe('Gemini integration', () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.GEMINI_KEY
  const originalModel = process.env.GEMINI_MODEL

  afterEach(() => {
    globalThis.fetch = originalFetch
    if (originalKey === undefined) delete process.env.GEMINI_KEY
    else process.env.GEMINI_KEY = originalKey
    if (originalModel === undefined) delete process.env.GEMINI_MODEL
    else process.env.GEMINI_MODEL = originalModel
  })

  it('builds a chronological conversation with array parts and the current message only once', () => {
    const contents = buildGeminiContents(
      [
        { type: 'message', sender: 'user-id', text: 'Bonjour' },
        { type: 'message', sender: 'bot-id', text: 'Bonjour !' },
        { type: 'notification', sender: 'bot-id', text: 'joined' },
        { type: 'message', sender: 'user-id', text: '' }
      ],
      'user-id',
      'Comment vas-tu ?'
    )

    assert.deepStrictEqual(contents, [
      { role: 'user', parts: [{ text: 'Bonjour' }] },
      { role: 'model', parts: [{ text: 'Bonjour !' }] },
      { role: 'user', parts: [{ text: 'Comment vas-tu ?' }] }
    ])
  })

  it('uses the configured model and sends text and images to Gemini', async () => {
    process.env.GEMINI_KEY = 'test-key'
    process.env.GEMINI_MODEL = 'test-model'
    let requestUrl = ''
    let requestBody = ''
    globalThis.fetch = async (input, init) => {
      requestUrl = String(input)
      requestBody = String(init?.body)
      return new Response(JSON.stringify({
        candidates: [{ content: { role: 'model', parts: [{ text: 'Réponse' }] }, finishReason: 'STOP' }]
      }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    const contents = buildGeminiContents([], 'user-id', 'Que vois-tu ?', [
      { inlineData: { mimeType: 'image/png', data: 'aW1hZ2U=' } }
    ])
    assert.strictEqual(await generateGeminiResponse(contents), 'Réponse')
    assert.ok(requestUrl.includes('/models/test-model:generateContent'))
    assert.deepStrictEqual(JSON.parse(requestBody).contents, contents)
  })

  it('uses the default model and surfaces Gemini errors instead of a fake answer', async () => {
    process.env.GEMINI_KEY = 'test-key'
    delete process.env.GEMINI_MODEL
    let requestUrl = ''
    globalThis.fetch = async (input) => {
      requestUrl = String(input)
      return new Response(JSON.stringify({ error: { message: 'Unavailable' } }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await assert.rejects(
      generateGeminiResponse(buildGeminiContents([], 'user-id', 'Bonjour')),
      /réponse de l’assistant est indisponible/
    )
    assert.ok(requestUrl.includes(`/models/${DEFAULT_GEMINI_MODEL}:generateContent`))
  })

  it('reports a missing key before contacting Gemini', async () => {
    delete process.env.GEMINI_KEY
    globalThis.fetch = async () => {
      throw new Error('Unexpected request')
    }
    await assert.rejects(
      generateGeminiResponse(buildGeminiContents([], 'user-id', 'Bonjour')),
      /clé Gemini est absente/
    )
  })
})
