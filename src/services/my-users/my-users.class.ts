// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { MyUsers, MyUsersData, MyUsersPatch, MyUsersQuery } from './my-users.schema'
import { app } from '../../app'
import { FriendsService } from '../friends/friends.class'

export type { MyUsers, MyUsersData, MyUsersPatch, MyUsersQuery }

export interface MyUsersParams extends MongoDBAdapterParams<MyUsersQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MyUsersService<ServiceParams extends Params = MyUsersParams> extends MongoDBService<
  MyUsers,
  MyUsersData,
  MyUsersParams,
  MyUsersPatch
> {
  async find(params: any): Promise<any> {
    const name: string = params.query?.name
    const currentUserId = params.user._id.toString()
    const myusers: any = await super._find({
      query: {
        $select: {
          theme: 0,
          email: 0,
          updatedAt: 0
        }
      },
      paginate: false
    } as any)

    let filtered = myusers.filter((user: any) => {
      return (
        user.name.toLowerCase().trim().includes(name.toLowerCase().trim()) &&
        user._id != currentUserId &&
        !user.aiUser
      )
    })
    // filtered = filtered.map(async (user: any) => {
    //   //formating based on friendship

    //   const areFriend = await FriendsService.areFriends(user._id, params)
    //   if (!areFriend) {
    //     return {
    //       image: user.image,
    //       _id: user._id,
    //       name: user.name
    //     }
    //   }
    //   return user
    // })

    return filtered
  }

  async get(id: any, params: any): Promise<any> {
    if (!params.user && !id) {
      return {
        _id: 0,
        name: 'unknown'
      }
    }
    if (!params.user) {
      return await super._get(id, params)
    }
    const currentUserId = params.user._id.toString()
    if (!id) {
      return await super._get(currentUserId, params)
    }
    if (id == currentUserId) {
      return await super._get(id, params)
    }

    let query = {
      $select: {
        theme: 0,
        email: 0,
        updatedAt: 0
      }
    }
    return await super._get(id, {
      ...params,
      query
    })
  }
  async patch(id: any, data: any, params: any): Promise<any> {
    // Check if the user already exists by name

    const userExistByName = await this._find({
      query: {
        name: data.name
      }
    })

    // Check if the user already exists by email
    const userExistByEmail = await this._find({
      query: {
        email: data.email
      }
    })

    // Check for conflicting names and emails
    if (userExistByName.total > 0 && userExistByName.data[0]._id.toString() !== id) {
      return {
        status: 500,
        message: "Nom d'utilisateur déjà utilisé",
        inputId: 'name'
      }
    }

    if (userExistByEmail.total > 0 && userExistByEmail.data[0]._id.toString() !== id) {
      return {
        status: 500,
        message: 'Email déjà utilisé',
        inputId: 'email'
      }
    }
    // Proceed with the patch operation
    return await super._patch(id, data)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('my-users'))
  }
}
