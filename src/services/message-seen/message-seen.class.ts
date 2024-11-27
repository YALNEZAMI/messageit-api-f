// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { MessageSeen, MessageSeenData, MessageSeenPatch, MessageSeenQuery } from './message-seen.schema'

export type { MessageSeen, MessageSeenData, MessageSeenPatch, MessageSeenQuery }

export interface MessageSeenParams extends MongoDBAdapterParams<MessageSeenQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageSeenService<ServiceParams extends Params = MessageSeenParams> extends MongoDBService<
  MessageSeen,
  MessageSeenData,
  MessageSeenParams,
  MessageSeenPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message-seen')),
    multi: ['remove']
  }
}
