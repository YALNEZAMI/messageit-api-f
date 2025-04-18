// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  MessageFiles,
  MessageFilesData,
  MessageFilesPatch,
  MessageFilesQuery
} from './message-files.schema'
import { BadRequest } from '@feathersjs/errors'
import fs from 'fs'
import path from 'path'
import { app } from '../../app'
export type { MessageFiles, MessageFilesData, MessageFilesPatch, MessageFilesQuery }

export interface MessageFilesParams extends MongoDBAdapterParams<MessageFilesQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessageFilesService<ServiceParams extends Params = MessageFilesParams> extends MongoDBService<
  MessageFiles,
  MessageFilesData,
  MessageFilesParams,
  MessageFilesPatch
> {
  async create(data: any, params: any): Promise<any> {
    return await this._create(data)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message-files')),
    multi: ['remove']
  }
}
