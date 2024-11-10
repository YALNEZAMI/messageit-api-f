// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Friends, FriendsData, FriendsPatch, FriendsQuery, FriendsService } from './friends.class'

export type { Friends, FriendsData, FriendsPatch, FriendsQuery }

export type FriendsClientService = Pick<FriendsService<Params<FriendsQuery>>, (typeof friendsMethods)[number]>

export const friendsPath = 'friends'

export const friendsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const friendsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(friendsPath, connection.service(friendsPath), {
    methods: friendsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [friendsPath]: FriendsClientService
  }
}
