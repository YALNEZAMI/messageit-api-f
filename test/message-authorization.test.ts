import assert from 'assert'
import { Forbidden } from '@feathersjs/errors'
import { MongoDBService } from '@feathersjs/mongodb'
import '../src/app'
import { authorizeMessage } from '../src/hooks/messageAuthorization'
import { ConversationsService } from '../src/services/conversations/conversations.class'
import { privateConversationExistHook } from '../src/services/conversations/conversations.hooks'

describe('message and conversation authorization', () => {
  const messages: Record<string, any> = {
    own: { conversation: 'mine', sender: 'me' },
    other: { conversation: 'mine', sender: 'friend' },
    secret: { conversation: 'private', sender: 'stranger' }
  }
  const fakeApp = {
    service(name: string) {
      if (name === 'messages') return { _get: async (id: string) => messages[id] }
      if (name === 'conversations') return {
        get: async (id: string, params: any) => {
          if (id !== 'mine' || params.user._id !== 'me') throw new Forbidden()
          return { members: ['me'] }
        }
      }
      throw new Error(`Unexpected service ${name}`)
    }
  }
  const context = (method: string, options: any = {}) => ({
    app: fakeApp,
    method,
    id: options.id,
    data: options.data,
    params: { user: { _id: 'me' }, query: options.query || {}, provider: 'rest' }
  }) as any
  const forbidden = (error: any) => error.code === 403

  it('uses the conversation in the message, not a forged query', async () => {
    const hook = authorizeMessage()
    await assert.rejects(() => hook(context('get', { id: 'secret', query: { conversation: 'mine' } })), forbidden)
    await assert.rejects(() => hook(context('get', { id: 'secret' })), forbidden)
    await assert.rejects(() => hook(context('create', {
      data: { conversation: 'private', sender: 'me', type: 'message' }, query: { conversation: 'mine' }
    })), forbidden)
    await assert.rejects(() => hook(context('find', { query: { conversation: { $ne: 'private' } } })), forbidden)
    const valid = context('get', { id: 'own' })
    await hook(valid)
    assert.strictEqual(valid.params.query.conversation, 'mine')
  })

  it('binds the sender to the authenticated user and rejects foreign references', async () => {
    const hook = authorizeMessage()
    const valid = context('create', { data: { conversation: 'mine', sender: 'friend', type: 'message', referedMessage: 'own' } })
    await hook(valid)
    assert.strictEqual(valid.data.sender, 'me')
    await assert.rejects(() => hook(context('create', {
      data: { conversation: 'mine', type: 'message', referedMessage: 'secret' }
    })), forbidden)
    await assert.rejects(() => hook(context('create', {
      data: { conversation: 'mine', type: 'notification' }
    })), forbidden)
  })

  it('only lets the author edit text or delete a message', async () => {
    const hook = authorizeMessage()
    await assert.rejects(() => hook(context('patch', { id: 'other', data: { text: 'changed' } })), forbidden)
    await assert.rejects(() => hook(context('remove', { id: 'other' })), forbidden)
    await assert.rejects(() => hook(context('remove', { id: null })), forbidden)
    await assert.rejects(() => hook(context('patch', { id: 'own', data: { sender: 'friend' } })), forbidden)
    await hook(context('patch', { id: 'own', data: { text: 'changed' } }))
    await hook(context('remove', { id: 'own' }))
  })

  it('checks membership before populating a conversation', async () => {
    const original = MongoDBService.prototype._get
    MongoDBService.prototype._get = async () => ({ members: ['me'], _id: 'mine' }) as any
    let populated = 0
    const service = { populateConversations: async (conversations: any[]) => { populated++; return conversations } }
    try {
      await assert.rejects(() => ConversationsService.prototype.get.call(service, 'mine', {
        provider: 'rest', user: { _id: 'outsider' }
      }), forbidden)
      assert.strictEqual(populated, 0)
      await ConversationsService.prototype.get.call(service, 'mine', { user: { _id: 'me' } })
      assert.strictEqual(populated, 1)
    } finally {
      MongoDBService.prototype._get = original
    }
  })

  it('does not return an existing conversation to a caller who is not a member', async () => {
    const hook = privateConversationExistHook()
    const invalid = context('create', { data: { type: 'private', members: ['friend', 'stranger'] } })
    await assert.rejects(() => hook(invalid), forbidden)
    const forged = context('create', { data: { type: 'private', members: ['friend', 'stranger', 'me'] } })
    await assert.rejects(() => hook(forged))
    const ai = context('create', { data: { type: 'ai', members: ['me'], name: 'stranger' } })
    await hook(ai)
    assert.strictEqual(ai.data.name, 'me')
  })
})
