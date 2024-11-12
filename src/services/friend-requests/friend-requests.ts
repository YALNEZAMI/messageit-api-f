import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  friendRequestsDataValidator,
  friendRequestsPatchValidator,
  friendRequestsQueryValidator,
  friendRequestsResolver,
  friendRequestsExternalResolver,
  friendRequestsDataResolver,
  friendRequestsPatchResolver,
  friendRequestsQueryResolver
} from './friend-requests.schema'

import type { Application } from '../../declarations'
import { FriendRequestsService, getOptions } from './friend-requests.class'
import { friendRequestsPath, friendRequestsMethods } from './friend-requests.shared'

export * from './friend-requests.class'
export * from './friend-requests.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const friendRequests = (app: Application) => {
  // Register our service on the Feathers application
  app.use(friendRequestsPath, new FriendRequestsService(getOptions(app)), {
    methods: friendRequestsMethods,
    events: [] // You can add additional custom events here if needed
  })

  // Get the registered service instance with event capabilities
  const service = app.service(friendRequestsPath)

  // Listen to the 'created' event to send a real-time notification
  // service.on('created', (data, context) => {
  //   app.channel(`userId=${data.recipient}`).send({
  //     action: 'friend-request',
  //     message: 'veut devenir votre ami!',
  //     data: {
  //       _id: data._id,
  //       sender: data.sender,
  //       recipient: data.recipient
  //     }
  //   })
  // })

  // Initialize hooks
  service.hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(friendRequestsExternalResolver),
        schemaHooks.resolveResult(friendRequestsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(friendRequestsQueryValidator),
        schemaHooks.resolveQuery(friendRequestsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(friendRequestsDataValidator),
        schemaHooks.resolveData(friendRequestsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(friendRequestsPatchValidator),
        schemaHooks.resolveData(friendRequestsPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [friendRequestsPath]: FriendRequestsService
  }
}
