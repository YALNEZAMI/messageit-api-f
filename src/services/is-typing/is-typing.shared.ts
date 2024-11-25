// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { IsTyping, IsTypingData, IsTypingPatch, IsTypingQuery, IsTypingService } from './is-typing.class'

export type { IsTyping, IsTypingData, IsTypingPatch, IsTypingQuery }

export type IsTypingClientService = Pick<
  IsTypingService<Params<IsTypingQuery>>,
  (typeof isTypingMethods)[number]
>

export const isTypingPath = 'is-typing'

export const isTypingMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const isTypingClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(isTypingPath, connection.service(isTypingPath), {
    methods: isTypingMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [isTypingPath]: IsTypingClientService
  }
}
