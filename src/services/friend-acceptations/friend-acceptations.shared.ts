// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  FriendAcceptations,
  FriendAcceptationsData,
  FriendAcceptationsPatch,
  FriendAcceptationsQuery,
  FriendAcceptationsService
} from './friend-acceptations.class'

export type { FriendAcceptations, FriendAcceptationsData, FriendAcceptationsPatch, FriendAcceptationsQuery }

export type FriendAcceptationsClientService = Pick<
  FriendAcceptationsService<Params<FriendAcceptationsQuery>>,
  (typeof friendAcceptationsMethods)[number]
>

export const friendAcceptationsPath = 'friend-acceptations'

export const friendAcceptationsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const friendAcceptationsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(friendAcceptationsPath, connection.service(friendAcceptationsPath), {
    methods: friendAcceptationsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [friendAcceptationsPath]: FriendAcceptationsClientService
  }
}
