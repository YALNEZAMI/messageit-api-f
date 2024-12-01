// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  UsersPhotos,
  UsersPhotosData,
  UsersPhotosPatch,
  UsersPhotosQuery,
  UsersPhotosService
} from './users-photos.class'

export type { UsersPhotos, UsersPhotosData, UsersPhotosPatch, UsersPhotosQuery }

export type UsersPhotosClientService = Pick<
  UsersPhotosService<Params<UsersPhotosQuery>>,
  (typeof usersPhotosMethods)[number]
>

export const usersPhotosPath = 'users-photos'

export const usersPhotosMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const usersPhotosClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(usersPhotosPath, connection.service(usersPhotosPath), {
    methods: usersPhotosMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [usersPhotosPath]: UsersPhotosClientService
  }
}
