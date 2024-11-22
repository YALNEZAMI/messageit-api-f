// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  MessageVisibility,
  MessageVisibilityData,
  MessageVisibilityPatch,
  MessageVisibilityQuery
} from './message-visibility.schema'

export type { MessageVisibility, MessageVisibilityData, MessageVisibilityPatch, MessageVisibilityQuery }

export interface MessageVisibilityParams extends MongoDBAdapterParams<MessageVisibilityQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageVisibilityService<
  ServiceParams extends Params = MessageVisibilityParams
> extends MongoDBService<
  MessageVisibility,
  MessageVisibilityData,
  MessageVisibilityParams,
  MessageVisibilityPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message-visibility')),
    multi: ['remove'] // Enable bulk removal
  }
}
