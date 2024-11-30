// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Emojis, EmojisData, EmojisPatch, EmojisQuery } from './emojis.schema'

export type { Emojis, EmojisData, EmojisPatch, EmojisQuery }

export interface EmojisParams extends MongoDBAdapterParams<EmojisQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class EmojisService<ServiceParams extends Params = EmojisParams> extends MongoDBService<
  Emojis,
  EmojisData,
  EmojisParams,
  EmojisPatch
> {
  async create(body: any, params: any): Promise<any> {
    const availableEmojis = ['👍', '❤️', '😊', '😔', '😡']
    if (!availableEmojis.includes(body.emoji)) {
      return {
        status: 500,
        message: 'Not allowed emoji'
      }
    } else {
      return await super._create(body, params)
    }
  }
  async patch(_id: any, body: any, params: any): Promise<any> {
    const availableEmojis = ['👍', '❤️', '😊', '😔', '😡']
    if (!availableEmojis.includes(body.emoji)) {
      return {
        status: 500,
        message: 'Not allowed emoji'
      }
    } else {
      return await super._patch(_id, body, params)
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('emojis'))
  }
}
