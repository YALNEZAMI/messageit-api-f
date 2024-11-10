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
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('my-users'))
  }
}
