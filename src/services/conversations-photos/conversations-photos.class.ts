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
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations-photos'))
  }
}
