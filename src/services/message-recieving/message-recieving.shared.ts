// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  MessageRecieving,
  MessageRecievingData,
  MessageRecievingPatch,
  MessageRecievingQuery,
  MessageRecievingService
} from './message-recieving.class'

export type { MessageRecieving, MessageRecievingData, MessageRecievingPatch, MessageRecievingQuery }

export type MessageRecievingClientService = Pick<
  MessageRecievingService<Params<MessageRecievingQuery>>,
  (typeof messageRecievingMethods)[number]
>

export const messageRecievingPath = 'message-recieving'

export const messageRecievingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const messageRecievingClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(messageRecievingPath, connection.service(messageRecievingPath), {
    methods: messageRecievingMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [messageRecievingPath]: MessageRecievingClientService
  }
}
