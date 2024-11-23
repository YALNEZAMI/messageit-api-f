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
> {
  async create(data: any, params?: any): Promise<any> {
    return await super._create(data, params)
  }
  //remove acceptations linked to @params.query.id
  async remove(id: any, params: any): Promise<any> {
    const acc = await this.find(params)
    if (acc.total == 0) {
      return { status: 500, message: 'Acceptation déjà supprimée' }
    }
    acc.data.map(async (acc: any) => {
      await super._remove(acc._id as string)
    })
    return { status: 200, message: 'accepations cleared' }
  }
  async find(params: any): Promise<any> {
    const currentUserId = params.user._id.toString()

    return await super.find({
      query: {
        $or: [
          {
            sender: currentUserId
          },
          {
            recipient: currentUserId
          }
        ]
      }
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('friend-acceptations'))
  }
}
