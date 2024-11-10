// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { MyUsers, MyUsersData, MyUsersPatch, MyUsersQuery, MyUsersService } from './my-users.class'

export type { MyUsers, MyUsersData, MyUsersPatch, MyUsersQuery }

export type MyUsersClientService = Pick<MyUsersService<Params<MyUsersQuery>>, (typeof myUsersMethods)[number]>

export const myUsersPath = 'my-users'

export const myUsersMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const myUsersClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(myUsersPath, connection.service(myUsersPath), {
    methods: myUsersMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [myUsersPath]: MyUsersClientService
  }
}
