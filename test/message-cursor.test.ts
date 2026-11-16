import assert from 'assert'
import { ObjectId } from 'mongodb'
import { MongoDBService } from '@feathersjs/mongodb'
import { app } from '../src/app'
import { MessagesService } from '../src/services/messages/messages.class'
import { olderMessageCursor } from '../src/services/messages/message-cursor'

describe('message pagination cursor', () => {
  it('orders older timestamps and breaks ties by id', () => {
    const id = '65a000000000000000000001'
    const date = '2024-01-01T00:00:00.000Z'
    assert.deepStrictEqual(olderMessageCursor(date, id), {
      $or: [{ createdAt: { $lt: date } }, { createdAt: date, _id: { $lt: new ObjectId(id) } }]
    })
    assert.strictEqual(olderMessageCursor(), undefined)
    assert.throws(() => olderMessageCursor(date), /invalide/)
    assert.throws(() => olderMessageCursor('invalid', id), /invalide/)
    assert.throws(() => olderMessageCursor(date, 'bad-id'), /invalide/)
  })

  it('combines the cursor with the visibility filter in the actual message service', async () => {
    const visibility = app.service('message-visibility')
    const originalVisibility = visibility.find
    const originalFind = MongoDBService.prototype.find
    const id = '65a000000000000000000001'
    let captured: any
    Object.defineProperty(visibility, 'find', { configurable: true, value: async () => [{ messageId: id }] })
    MongoDBService.prototype.find = async (params: any) => {
      captured = params.query
      return { total: 0, limit: 25, skip: 0, data: [] } as any
    }
    try {
      const service = new MessagesService({ Model: Promise.resolve({} as any) })
      await service.find({
        user: { _id: 'me' },
        query: {
          conversation: 'conv', olderThanId: id, olderThanCreatedAt: '2024-01-01T00:00:00.000Z',
          $sort: { createdAt: -1, _id: -1 }, $limit: 25
        }
      })
      assert.strictEqual(captured.conversation, 'conv')
      assert(captured._id.$in[0].equals(new ObjectId(id)))
      assert(captured.$and[0].$or[1]._id.$lt.equals(new ObjectId(id)))
      assert.strictEqual(captured.olderThanId, undefined)
    } finally {
      Object.defineProperty(visibility, 'find', { configurable: true, writable: true, value: originalVisibility })
      MongoDBService.prototype.find = originalFind
    }
  })
})
