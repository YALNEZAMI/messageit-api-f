// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  friendsDataValidator,
  friendsPatchValidator,
  friendsQueryValidator,
  friendsResolver,
  friendsExternalResolver,
  friendsDataResolver,
  friendsPatchResolver,
  friendsQueryResolver
} from './friends.schema'

import type { Application } from '../../declarations'
import { FriendsService, getOptions } from './friends.class'
import { friendsPath, friendsMethods } from './friends.shared'

export * from './friends.class'
export * from './friends.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const friends = (app: Application) => {
  // Register our service on the Feathers application
  app.use(friendsPath, new FriendsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: friendsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(friendsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(friendsExternalResolver),
        schemaHooks.resolveResult(friendsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(friendsQueryValidator), schemaHooks.resolveQuery(friendsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(friendsDataValidator), schemaHooks.resolveData(friendsDataResolver)],
      patch: [schemaHooks.validateData(friendsPatchValidator), schemaHooks.resolveData(friendsPatchResolver)],
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
    [friendsPath]: FriendsService
  }
}
