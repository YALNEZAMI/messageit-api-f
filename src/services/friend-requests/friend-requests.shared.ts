// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  FriendRequests,
  FriendRequestsData,
  FriendRequestsPatch,
  FriendRequestsQuery,
  FriendRequestsService
} from './friend-requests.class'

export type { FriendRequests, FriendRequestsData, FriendRequestsPatch, FriendRequestsQuery }

export type FriendRequestsClientService = Pick<
  FriendRequestsService<Params<FriendRequestsQuery>>,
  (typeof friendRequestsMethods)[number]
>

export const friendRequestsPath = 'friend-requests'

export const friendRequestsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const friendRequestsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(friendRequestsPath, connection.service(friendRequestsPath), {
    methods: friendRequestsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [friendRequestsPath]: FriendRequestsClientService
  }
}
