import { MongoDBAdapterOptions, MongoDBService } from '@feathersjs/mongodb'
import type { Application } from '../../declarations'
import type { Params } from '@feathersjs/feathers'
import { UsersPhotos, UsersPhotosPatch, UsersPhotosQuery } from './users-photos.schema'

export type { UsersPhotos, UsersPhotosData, UsersPhotosPatch, UsersPhotosQuery }

export interface UsersPhotosParams extends Params {}
import { BadRequest } from '@feathersjs/errors'
import fs from 'fs'
import path from 'path'
import { app } from '../../app'

interface FileData {
  buffer: Buffer
  originalname: string
}

interface UsersPhotosData {
  file?: FileData
  name?: string
}

interface UsersPhotosResult {
  message: string
  path: string
}
// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class UsersPhotosService<ServiceParams extends Params = UsersPhotosParams> extends MongoDBService<
  UsersPhotos,
  UsersPhotosData,
  UsersPhotosParams,
  UsersPhotosPatch
> {
  async create(data: any, params?: Params): Promise<any> {
    if (!data.file) {
      throw new BadRequest('No file provided')
    }

    const { buffer, originalname } = data.file
    const uploadsDir = path.join(__dirname, '..', '..', '..', 'public', 'usersPhotos')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    let userId = params?.user!._id.toString()
    let extSplit = originalname.split('.')
    const ext = extSplit[extSplit.length - 1]
    const finalFileName = userId + '.' + ext
    const filePath = path.join(uploadsDir, finalFileName)

    // Write the file buffer to disk
    fs.writeFileSync(filePath, buffer)
    //set my-users image
    const port = app.get('port')
    const host = app.get('host')
    const devMode = process.env.DEV_MODE
    const photoUrl =
      devMode === 'true'
        ? `http://${host}:${port}/usersPhotos/${finalFileName}`
        : `https://${host}:${port}/usersPhotos/${finalFileName}`

    await app.service('my-users').patch(
      userId,
      {
        image: photoUrl
      },
      params
    )
    return {
      message: 'File uploaded successfully',
      path: filePath
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('users-photos'))
  }
}
