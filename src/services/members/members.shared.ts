// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Members, MembersData, MembersPatch, MembersQuery, MembersService } from './members.class'

export type { Members, MembersData, MembersPatch, MembersQuery }

export type MembersClientService = Pick<MembersService<Params<MembersQuery>>, (typeof membersMethods)[number]>

export const membersPath = 'members'

export const membersMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const membersClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(membersPath, connection.service(membersPath), {
    methods: membersMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [membersPath]: MembersClientService
  }
}
