// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { membersClient } from './services/members/members.shared'
export type { Members, MembersData, MembersQuery, MembersPatch } from './services/members/members.shared'

import { conversationsClient } from './services/conversations/conversations.shared'
export type {
  Conversations,
  ConversationsData,
  ConversationsQuery,
  ConversationsPatch
} from './services/conversations/conversations.shared'

import { friendAcceptationsClient } from './services/friend-acceptations/friend-acceptations.shared'
export type {
  FriendAcceptations,
  FriendAcceptationsData,
  FriendAcceptationsQuery,
  FriendAcceptationsPatch
} from './services/friend-acceptations/friend-acceptations.shared'

import { friendsClient } from './services/friends/friends.shared'
export type { Friends, FriendsData, FriendsQuery, FriendsPatch } from './services/friends/friends.shared'

import { friendRequestsClient } from './services/friend-requests/friend-requests.shared'
export type {
  FriendRequests,
  FriendRequestsData,
  FriendRequestsQuery,
  FriendRequestsPatch
} from './services/friend-requests/friend-requests.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the messageit-api-f app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(friendRequestsClient)
  client.configure(friendsClient)
  client.configure(friendAcceptationsClient)
  client.configure(conversationsClient)
  client.configure(membersClient)
  return client
}
