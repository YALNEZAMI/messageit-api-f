// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Conversations,
  ConversationsData,
  ConversationsPatch,
  ConversationsQuery,
  ConversationsService
} from './conversations.class'

export type { Conversations, ConversationsData, ConversationsPatch, ConversationsQuery }

export type ConversationsClientService = Pick<
  ConversationsService<Params<ConversationsQuery>>,
  (typeof conversationsMethods)[number]
>

export const conversationsPath = 'conversations'

export const conversationsMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const conversationsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(conversationsPath, connection.service(conversationsPath), {
    methods: conversationsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [conversationsPath]: ConversationsClientService
  }
}
