// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import { userQuerySchema, type User, type UserData, type UserPatch, type UserQuery } from './users.schema'
import { app } from '../../app'
import { getDatingProperties } from '../../hooks/dating'

export type { User, UserData, UserPatch, UserQuery }

export interface UserParams extends MongoDBAdapterParams<UserQuery> {}
//TODO try $regex in back end to search peaple
// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class UserService<ServiceParams extends Params = UserParams> extends MongoDBService<
  User,
  UserData,
  UserParams,
  UserPatch
> {
  async create(data: any, params?: any): Promise<any> {
    data.email = data.email.toLowerCase()
    const query: UserQuery = params.query!
    const userExistByEmail = await this.find({
      query: { email: data.email }
    })
    const userExistByName = await app.service('my-users').find({
      query: { name: query.name }
    })
    if (userExistByEmail.total > 0) {
      return {
        status: 500,
        message: 'Email déjà utilisé',
        inputId: 'email'
      }
    }
    if (userExistByName.total > 0) {
      return {
        status: 500,
        message: "Nom d'utilisateur déjà utilisé",
        inputId: 'name'
      }
    }

    const creating: any = await super._create(data, params)
    const creating2: any = await app.service('my-users')._create({
      _id: creating._id,
      theme: {
        name: 'Basique',
        _id: 'basic'
      },
      ...params.query,
      ...getDatingProperties()
    })
    return creating2
  }
  async patch(id: any, data: any): Promise<any> {
    const userExistByEmail = await this.find({
      query: {
        email: data.email
      }
    })
    if (userExistByEmail.total > 0 && userExistByEmail.data[0]._id.toString() != id) {
      return {
        status: 500,
        message: 'Email déjà utilisé ',
        inputId: 'email'
      }
    } else {
      return await super._patch(id, data)
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('users'))
  }
}
