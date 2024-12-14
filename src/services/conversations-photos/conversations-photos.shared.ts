// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  ConversationsPhotos,
  ConversationsPhotosData,
  ConversationsPhotosPatch,
  ConversationsPhotosQuery,
  ConversationsPhotosService
} from './conversations-photos.class'

export type {
  ConversationsPhotos,
  ConversationsPhotosData,
  ConversationsPhotosPatch,
  ConversationsPhotosQuery
}

export type ConversationsPhotosClientService = Pick<
  ConversationsPhotosService<Params<ConversationsPhotosQuery>>,
  (typeof conversationsPhotosMethods)[number]
>

export const conversationsPhotosPath = 'conversations-photos'

export const conversationsPhotosMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const conversationsPhotosClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(conversationsPhotosPath, connection.service(conversationsPhotosPath), {
    methods: conversationsPhotosMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [conversationsPhotosPath]: ConversationsPhotosClientService
  }
}
