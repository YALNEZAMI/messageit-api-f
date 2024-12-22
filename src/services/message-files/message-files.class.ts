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
    if (!data.files) {
      throw new BadRequest('No file provided')
    }
    const urls = []
    let message = params?.query!.message
    for (const file of data.files) {
      if (!file) {
        continue
      }
      const { buffer, originalname } = file
      const uploadsDir = path.join(__dirname, '..', '..', '..', 'public', 'messageFiles')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      let extSplit = originalname.split('.')
      const ext = extSplit[extSplit.length - 1]
      const finalFileName = `${message}-${originalname}.${ext}`
      const filePath = path.join(uploadsDir, finalFileName)

      // Write the file buffer to disk
      fs.writeFileSync(filePath, buffer)
      //set my-users image
      const port = app.get('port')
      const host = app.get('host')
      const devMode = process.env.DEV_MODE
      const url =
        devMode === 'true'
          ? `http://${host}:${port}/messageFiles/${finalFileName}`
          : `https://${host}:${port}/messageFiles/${finalFileName}`
      urls.push(url)
    }
    const messageObject = await app.service('messages')._get(message)
    await this._create({
      conversation: messageObject.conversation,
      message,
      urls
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('message-files')),
    multi: ['remove']
  }
}
