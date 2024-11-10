// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { User, UserData, UserPatch, UserQuery } from './users.schema'
import { app } from '../../app'

export type { User, UserData, UserPatch, UserQuery }

export interface UserParams extends MongoDBAdapterParams<UserQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class UserService<ServiceParams extends Params = UserParams> extends MongoDBService<
  User,
  UserData,
  UserParams,
  UserPatch
> {
  async create(data: any, params?: any): Promise<any> {
    const userExist = await this.find({
      query: { email: data.email }
    })
    if (userExist.total > 0) {
      return {
        status: 500,
        message: 'Email déjà utilisé'
      }
    } else {
      const creating: any = await super._create(data, params)
      const creating2: any = await app.service('my-users')._create({
        _id: creating._id,
        ...params.query
      })
      return creating2
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('users'))
  }
}
