// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  MessageVisibility,
  MessageVisibilityData,
  MessageVisibilityPatch,
  MessageVisibilityQuery,
  MessageVisibilityService
} from './message-visibility.class'

export type { MessageVisibility, MessageVisibilityData, MessageVisibilityPatch, MessageVisibilityQuery }

export type MessageVisibilityClientService = Pick<
  MessageVisibilityService<Params<MessageVisibilityQuery>>,
  (typeof messageVisibilityMethods)[number]
>

export const messageVisibilityPath = 'message-visibility'

export const messageVisibilityMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const messageVisibilityClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(messageVisibilityPath, connection.service(messageVisibilityPath), {
    methods: messageVisibilityMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [messageVisibilityPath]: MessageVisibilityClientService
  }
}
