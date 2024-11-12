// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { MyUsers, MyUsersData, MyUsersPatch, MyUsersQuery } from './my-users.schema'

export type { MyUsers, MyUsersData, MyUsersPatch, MyUsersQuery }

export interface MyUsersParams extends MongoDBAdapterParams<MyUsersQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MyUsersService<ServiceParams extends Params = MyUsersParams> extends MongoDBService<
  MyUsers,
  MyUsersData,
  MyUsersParams,
  MyUsersPatch
> {
  async patch(id: any, data: any): Promise<any> {
    const userExistByName = await this.find({
      query: {
        name: data.name
      }
    })
    const userExistByEmail = await this.find({
      query: {
        email: data.email
      }
    })
    if (userExistByName.total > 0 && userExistByName.data[0]._id.toString() != id) {
      return {
        status: 500,
        message: "Nom d'utilisateur déjà utilisé",
        inputId: 'name'
      }
    }
    if (userExistByEmail.total > 0 && userExistByEmail.data[0]._id.toString() != id) {
      return {
        status: 500,
        message: 'Email déjà utilisé',
        inputId: 'email'
      }
    }
    return await super._patch(id, data)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('my-users'))
  }
}
