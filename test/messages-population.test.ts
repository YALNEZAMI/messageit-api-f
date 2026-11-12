import assert from 'assert'
import { app } from '../src/app'
import { MessagesService } from '../src/services/messages/messages.class'

describe('message population', () => {
  it('reuses user and conversation lookups within a batch and preserves order', async () => {
    const users = app.service('my-users')
    const conversations = app.service('conversations')
    const messages = app.service('messages')
    const originals = [users.get, conversations.get, messages.get]
    const calls = { users: 0, conversations: 0, references: 0 }

    Object.defineProperty(users, 'get', { configurable: true, value: async (id: string) => {
      calls.users++
      return { _id: id }
    } })
    Object.defineProperty(conversations, 'get', { configurable: true, value: async (id: string) => {
      calls.conversations++
      return { _id: id }
    } })
    Object.defineProperty(messages, 'get', { configurable: true, value: async (id: string) => {
      calls.references++
      return { _id: id, sender: 'user-2' }
    } })
    try {
      const result = await MessagesService.populateMessages([
        { _id: '1', type: 'message', sender: 'user-1', conversation: 'conv' },
        { _id: '2', type: 'message', sender: 'user-1', conversation: 'conv', referedMessage: 'old' },
        { _id: '3', type: 'notification' },
        { _id: '4', type: 'message', sender: 'user-2', conversation: 'conv' }
      ], {})
      assert.deepStrictEqual(result.map((message) => message._id), ['1', '2', '3', '4'])
      assert.deepStrictEqual(calls, { users: 2, conversations: 1, references: 1 })
      assert.strictEqual(result[1].referedMessage.sender._id, 'user-2')
      assert.strictEqual(result[0].conversation._id, 'conv')
    } finally {
      Object.defineProperty(users, 'get', { configurable: true, writable: true, value: originals[0] })
      Object.defineProperty(conversations, 'get', { configurable: true, writable: true, value: originals[1] })
      Object.defineProperty(messages, 'get', { configurable: true, writable: true, value: originals[2] })
    }
  })
})
