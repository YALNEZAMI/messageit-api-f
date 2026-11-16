import { BadRequest } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'

export function olderMessageCursor(createdAt?: string, id?: string) {
  if (createdAt === undefined && id === undefined) return undefined
  if (!createdAt || !id || !ObjectId.isValid(id) || Number.isNaN(Date.parse(createdAt))) {
    throw new BadRequest('Curseur de pagination invalide.')
  }
  return {
    $or: [
      { createdAt: { $lt: createdAt } },
      { createdAt, _id: { $lt: new ObjectId(id) } }
    ]
  }
}
