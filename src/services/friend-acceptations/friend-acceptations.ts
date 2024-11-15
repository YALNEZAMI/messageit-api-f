// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  friendAcceptationsDataValidator,
  friendAcceptationsPatchValidator,
  friendAcceptationsQueryValidator,
  friendAcceptationsResolver,
  friendAcceptationsExternalResolver,
  friendAcceptationsDataResolver,
  friendAcceptationsPatchResolver,
  friendAcceptationsQueryResolver
} from './friend-acceptations.schema'

import type { Application } from '../../declarations'
import { FriendAcceptationsService, getOptions } from './friend-acceptations.class'
import { friendAcceptationsPath, friendAcceptationsMethods } from './friend-acceptations.shared'
import setTimestamps from '../../hooks/dating'

export * from './friend-acceptations.class'
export * from './friend-acceptations.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const friendAcceptations = (app: Application) => {
  // Register our service on the Feathers application
  app.use(friendAcceptationsPath, new FriendAcceptationsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: friendAcceptationsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(friendAcceptationsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(friendAcceptationsExternalResolver),
        schemaHooks.resolveResult(friendAcceptationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(friendAcceptationsQueryValidator),
        schemaHooks.resolveQuery(friendAcceptationsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        setTimestamps(),

        schemaHooks.validateData(friendAcceptationsDataValidator),
        schemaHooks.resolveData(friendAcceptationsDataResolver)
      ],
      patch: [
        setTimestamps(),

        schemaHooks.validateData(friendAcceptationsPatchValidator),
        schemaHooks.resolveData(friendAcceptationsPatchResolver)
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
    [friendAcceptationsPath]: FriendAcceptationsService
  }
}
