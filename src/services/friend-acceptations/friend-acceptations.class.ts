// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  FriendAcceptations,
  FriendAcceptationsData,
  FriendAcceptationsPatch,
  FriendAcceptationsQuery
} from './friend-acceptations.schema'

export type { FriendAcceptations, FriendAcceptationsData, FriendAcceptationsPatch, FriendAcceptationsQuery }

export interface FriendAcceptationsParams extends MongoDBAdapterParams<FriendAcceptationsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class FriendAcceptationsService<
  ServiceParams extends Params = FriendAcceptationsParams
> extends MongoDBService<
  FriendAcceptations,
  FriendAcceptationsData,
  FriendAcceptationsParams,
  FriendAcceptationsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('friend-acceptations'))
  }
}
