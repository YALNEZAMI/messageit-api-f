// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  GroupRights,
  GroupRightsData,
  GroupRightsPatch,
  GroupRightsQuery,
  GroupRightsService
} from './group-rights.class'

export type { GroupRights, GroupRightsData, GroupRightsPatch, GroupRightsQuery }

export type GroupRightsClientService = Pick<
  GroupRightsService<Params<GroupRightsQuery>>,
  (typeof groupRightsMethods)[number]
>

export const groupRightsPath = 'group-rights'

export const groupRightsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const groupRightsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(groupRightsPath, connection.service(groupRightsPath), {
    methods: groupRightsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [groupRightsPath]: GroupRightsClientService
  }
}
