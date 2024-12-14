// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  ConversationsPhotos,
  ConversationsPhotosData,
  ConversationsPhotosPatch,
  ConversationsPhotosQuery
} from './conversations-photos.schema'
import { BadRequest } from '@feathersjs/errors'
import fs from 'fs'
import path from 'path'
import { app } from '../../app'
export type {
  ConversationsPhotos,
  ConversationsPhotosData,
  ConversationsPhotosPatch,
  ConversationsPhotosQuery
}

export interface ConversationsPhotosParams extends MongoDBAdapterParams<ConversationsPhotosQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ConversationsPhotosService<
  ServiceParams extends Params = ConversationsPhotosParams
> extends MongoDBService<
  ConversationsPhotos,
  ConversationsPhotosData,
  ConversationsPhotosParams,
  ConversationsPhotosPatch
> {
  async create(data: any, params: any): Promise<any> {
    if (!data.file) {
      throw new BadRequest('No file provided')
    }

    const { buffer, originalname } = data.file
    const uploadsDir = path.join(__dirname, '..', '..', '..', 'public', 'conversationsPhotos')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    let conversationId = params?.query!.conversationId
    let extSplit = originalname.split('.')
    const ext = extSplit[extSplit.length - 1]
    const finalFileName = conversationId + '.' + ext
    const filePath = path.join(uploadsDir, finalFileName)

    // Write the file buffer to disk
    fs.writeFileSync(filePath, buffer)
    //set my-users image
    const port = app.get('port')
    const host = app.get('host')
    const devMode = process.env.DEV_MODE
    const photoUrl =
      devMode === 'true'
        ? `http://${host}:${port}/conversationsPhotos/${finalFileName}`
        : `https://${host}:${port}/conversationsPhotos/${finalFileName}`

    await app.service('conversations').patch(
      conversationId,
      {
        image: photoUrl
      },
      params
    )
    await app
      .service('messages')
      .createNotification(conversationId, 'a changé la photo de la conversation.', params)
    return {
      message: 'File uploaded successfully',
      path: filePath
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations-photos'))
  }
}
