// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { IsTyping, IsTypingData, IsTypingPatch, IsTypingQuery } from './is-typing.schema'

export type { IsTyping, IsTypingData, IsTypingPatch, IsTypingQuery }

export interface IsTypingParams extends MongoDBAdapterParams<IsTypingQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class IsTypingService<ServiceParams extends Params = IsTypingParams> extends MongoDBService<
  IsTyping,
  IsTypingData,
  IsTypingParams,
  IsTypingPatch
> {
  async create(body: any): Promise<any> {
    const creating = await super.create(body)
    setTimeout(async () => {
      await super._remove(creating._id.toString())
    }, 10000)
    return creating
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('is-typing'))
  }
}
