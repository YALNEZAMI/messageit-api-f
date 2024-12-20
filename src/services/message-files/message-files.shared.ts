// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  MessageFiles,
  MessageFilesData,
  MessageFilesPatch,
  MessageFilesQuery,
  MessageFilesService
} from './message-files.class'

export type { MessageFiles, MessageFilesData, MessageFilesPatch, MessageFilesQuery }

export type MessageFilesClientService = Pick<
  MessageFilesService<Params<MessageFilesQuery>>,
  (typeof messageFilesMethods)[number]
>

export const messageFilesPath = 'message-files'

export const messageFilesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const messageFilesClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(messageFilesPath, connection.service(messageFilesPath), {
    methods: messageFilesMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [messageFilesPath]: MessageFilesClientService
  }
}
