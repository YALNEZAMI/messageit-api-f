// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { GroupRights, GroupRightsData, GroupRightsPatch, GroupRightsQuery } from './group-rights.schema'

export type { GroupRights, GroupRightsData, GroupRightsPatch, GroupRightsQuery }

export interface GroupRightsParams extends MongoDBAdapterParams<GroupRightsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class GroupRightsService<ServiceParams extends Params = GroupRightsParams> extends MongoDBService<
  GroupRights,
  GroupRightsData,
  GroupRightsParams,
  GroupRightsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('group-rights'))
  }
}
