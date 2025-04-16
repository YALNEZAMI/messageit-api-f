// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { messageFilesClient } from './services/message-files/message-files.shared'
export type {
  MessageFiles,
  MessageFilesData,
  MessageFilesQuery,
  MessageFilesPatch
} from './services/message-files/message-files.shared'

import { conversationsPhotosClient } from './services/conversations-photos/conversations-photos.shared'
export type {
  ConversationsPhotos,
  ConversationsPhotosData,
  ConversationsPhotosQuery,
  ConversationsPhotosPatch
} from './services/conversations-photos/conversations-photos.shared'

import { groupRightsClient } from './services/group-rights/group-rights.shared'
export type {
  GroupRights,
  GroupRightsData,
  GroupRightsQuery,
  GroupRightsPatch
} from './services/group-rights/group-rights.shared'

import { emojisClient } from './services/emojis/emojis.shared'
export type { Emojis, EmojisData, EmojisQuery, EmojisPatch } from './services/emojis/emojis.shared'

import { messageSeenClient } from './services/message-seen/message-seen.shared'
export type {
  MessageSeen,
  MessageSeenData,
  MessageSeenQuery,
  MessageSeenPatch
} from './services/message-seen/message-seen.shared'

import { messageRecievingClient } from './services/message-recieving/message-recieving.shared'
export type {
  MessageRecieving,
  MessageRecievingData,
  MessageRecievingQuery,
  MessageRecievingPatch
} from './services/message-recieving/message-recieving.shared'

import { isTypingClient } from './services/is-typing/is-typing.shared'
export type {
  IsTyping,
  IsTypingData,
  IsTypingQuery,
  IsTypingPatch
} from './services/is-typing/is-typing.shared'

import { messageVisibilityClient } from './services/message-visibility/message-visibility.shared'
export type {
  MessageVisibility,
  MessageVisibilityData,
  MessageVisibilityQuery,
  MessageVisibilityPatch
} from './services/message-visibility/message-visibility.shared'

import { messagesClient } from './services/messages/messages.shared'
export type {
  Messages,
  MessagesData,
  MessagesQuery,
  MessagesPatch
} from './services/messages/messages.shared'

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
  client.configure(messagesClient)
  client.configure(messageVisibilityClient)
  client.configure(isTypingClient)
  client.configure(messageRecievingClient)
  client.configure(messageSeenClient)
  client.configure(emojisClient)
  client.configure(groupRightsClient)
  client.configure(conversationsPhotosClient)
  client.configure(messageFilesClient)
  return client
}
