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
> {
  async patch(id: any, data: any, params?: any): Promise<any> {
    const currentUserId = params.user._id.toString()
    const rights = await super._find({
      query: {
        conversation: params.query.conversation
      }
    })
    const right = rights.data[0]
    //admin operation
    const admin = params.query.admin
    if (admin && right.chef == currentUserId) {
      if (right.admins.includes(admin)) {
        //remove admin
        right.admins = right.admins.filter((adminFilter) => {
          return admin != adminFilter
        })
      } else {
        right.admins.push(admin)
      }
    }
    return await super._patch(id, right, {
      ...params,
      query: {
        conversation: params.query.conversation
      }
    })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('group-rights')),
    multi: ['patch']
  }
}
