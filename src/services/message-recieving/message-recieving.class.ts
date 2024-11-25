// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  MessageRecieving,
  MessageRecievingData,
  MessageRecievingPatch,
  MessageRecievingQuery
} from './message-recieving.schema'

export type { MessageRecieving, MessageRecievingData, MessageRecievingPatch, MessageRecievingQuery }

export interface MessageRecievingParams extends MongoDBAdapterParams<MessageRecievingQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageRecievingService<
  ServiceParams extends Params = MessageRecievingParams
> extends MongoDBService<
  MessageRecieving,
  MessageRecievingData,
  MessageRecievingParams,
  MessageRecievingPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message-recieving'))
  }
}
