// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  MessageSeen,
  MessageSeenData,
  MessageSeenPatch,
  MessageSeenQuery,
  MessageSeenService
} from './message-seen.class'

export type { MessageSeen, MessageSeenData, MessageSeenPatch, MessageSeenQuery }

export type MessageSeenClientService = Pick<
  MessageSeenService<Params<MessageSeenQuery>>,
  (typeof messageSeenMethods)[number]
>

export const messageSeenPath = 'message-seen'

export const messageSeenMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const messageSeenClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(messageSeenPath, connection.service(messageSeenPath), {
    methods: messageSeenMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [messageSeenPath]: MessageSeenClientService
  }
}
