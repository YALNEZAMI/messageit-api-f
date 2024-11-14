// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  Conversations,
  ConversationsData,
  ConversationsPatch,
  ConversationsQuery
} from './conversations.schema'

export type { Conversations, ConversationsData, ConversationsPatch, ConversationsQuery }

export interface ConversationsParams extends MongoDBAdapterParams<ConversationsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ConversationsService<ServiceParams extends Params = ConversationsParams> extends MongoDBService<
  Conversations,
  ConversationsData,
  ConversationsParams,
  ConversationsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations'))
  }
}
