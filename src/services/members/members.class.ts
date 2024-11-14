// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Members, MembersData, MembersPatch, MembersQuery } from './members.schema'

export type { Members, MembersData, MembersPatch, MembersQuery }

export interface MembersParams extends MongoDBAdapterParams<MembersQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MembersService<ServiceParams extends Params = MembersParams> extends MongoDBService<
  Members,
  MembersData,
  MembersParams,
  MembersPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('members'))
  }
}
