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
import { app } from '../../app'

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
> {
  async remove(id: any, params: any): Promise<any> {
    const messageId = params.query.messageId
    const visibility = await super.find({
      query: {
        messageId,
        $limit: 0
      },
      paginate: false
    })
    if (visibility.total == 1) {
      await app.service('messages')._remove(messageId)
    }
    return await super.remove(id, params)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message-visibility')),
    multi: ['remove'] // Enable bulk removal
  }
}
