// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  FriendRequests,
  FriendRequestsData,
  FriendRequestsPatch,
  FriendRequestsQuery
} from './friend-requests.schema'
import { app } from '../../app'

export type { FriendRequests, FriendRequestsData, FriendRequestsPatch, FriendRequestsQuery }

export interface FriendRequestsParams extends MongoDBAdapterParams<FriendRequestsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class FriendRequestsService<
  ServiceParams extends Params = FriendRequestsParams
> extends MongoDBService<FriendRequests, FriendRequestsData, FriendRequestsParams, FriendRequestsPatch> {
  async create(data: any, params?: any): Promise<any> {
    data.sender = params.user._id.toString()
    const friendRequestsExist = await this._find({
      query: {
        $or: [
          {
            sender: data.sender,
            recipient: data.recipient
          },
          {
            sender: data.recipient,
            recipient: data.sender
          }
        ]
      }
    })

    if (friendRequestsExist.total != 0) {
      return {
        status: 500,
        message: "Utilisatuer en demande d'amitié"
      }
    }

    const creating = await super._create(data, params)
    return creating
  }
  async remove(id: any, params: any): Promise<any> {
    const otherUserId: FriendRequestsQuery = params.query!.otherUserId
    const currentUserId = params.user._id.toString()
    const friendReqs = await this._find({
      query: {
        $or: [
          { sender: currentUserId, recipient: otherUserId },
          { recipient: currentUserId, sender: otherUserId }
        ]
      }
    })
    if (friendReqs.total == 0) {
      return {
        status: 500,
        message: "Demande d'amitié déjà supprimée."
      }
    }
    const friendReqId: any = friendReqs.data[0]._id
    const removing = await super._remove(friendReqId, {})
    return removing
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
    Model: app.get('mongodbClient').then((db) => db.collection('friend-requests'))
  }
}
