// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Friends, FriendsData, FriendsPatch, FriendsQuery } from './friends.schema'
import { app } from '../../app'
import { getDatingProperties } from '../../hooks/dating'

export type { Friends, FriendsData, FriendsPatch, FriendsQuery }

export interface FriendsParams extends MongoDBAdapterParams<FriendsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class FriendsService<ServiceParams extends Params = FriendsParams> extends MongoDBService<
  Friends,
  FriendsData,
  FriendsParams,
  FriendsPatch
> {
  async create(data: any, params: FriendsParams): Promise<any> {
    data.recipient = params.user!._id.toString() as string
    const areFriends = await this.areFriends(data.recipient, data.sender)
    if (areFriends) {
      return { status: 500, message: 'Vous êtes déjà amis !' }
    }
    await app.service('friend-acceptations')._create(
      {
        seen: false,
        ...data
      },
      params
    )
    const queryRemoveRequest: FriendsQuery = {
      sender: data.sender,
      recipient: data.recipient,
      ...getDatingProperties()
    }
    await app.service('friend-requests').remove('', {
      ...params,
      query: {
        otherUserId: data.sender
      }
    })
    return await super._create(data, params)
  }
  async areFriends(id: string, id2: string): Promise<boolean> {
    const req = await super._find({
      query: {
        $or: [
          {
            recipient: id,
            sender: id2
          },
          {
            recipient: id2,
            sender: id
          }
        ]
      }
    })
    return req.total != 0
  }
  // if @params.query.original then return all friends otherwise
  //return friends of user linked to @params.query.id
  async find(params: any): Promise<any> {
    const query: FriendsQuery = params.query!
    if (query.original) {
      delete query.original
      return super._find(params)
    }
    const id = query.id

    // Find friendships where either sender or recipient matches the user's id
    const friendShips = await super._find({
      query: {
        $or: [{ sender: id }, { recipient: id }]
      }
    })

    const friendsIds: string[] = []

    // Using a for...of loop to handle async calls in a sequential manner
    for (const fs of friendShips.data) {
      if (fs.sender == id) {
        friendsIds.push(fs.recipient!)
      } else {
        friendsIds.push(fs.sender!)
      }
    }
    const friends: any[] = []

    for (const id of friendsIds) {
      const user = await app.service('my-users').get(id, {
        ...params,
        query: {}
      })
      friends.push(user)
    }

    return friends
  }
  async remove(id: any, params: FriendsParams): Promise<any> {
    const query: FriendsQuery = params.query!

    const friendRequest = await this.find({
      query: {
        original: true,
        $or: [
          { sender: query.sender, recipient: query.recipient },
          { recipient: query.sender, sender: query.recipient }
        ]
      }
    })
    if (friendRequest.total == 0) {
      return { status: 500, message: 'Déjà supprimé' }
    }
    const idFR = friendRequest.data[0]._id
    return await super._remove(idFR)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('friends'))
  }
}
