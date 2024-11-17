// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  myUsersDataValidator,
  myUsersPatchValidator,
  myUsersQueryValidator,
  myUsersResolver,
  myUsersExternalResolver,
  myUsersDataResolver,
  myUsersPatchResolver,
  myUsersQueryResolver
} from './my-users.schema'

import type { Application } from '../../declarations'
import { MyUsersService, getOptions } from './my-users.class'
import { myUsersPath, myUsersMethods } from './my-users.shared'

export * from './my-users.class'
export * from './my-users.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const myUsers = (app: Application) => {
  // Register our service on the Feathers application
  app.use(myUsersPath, new MyUsersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: myUsersMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(myUsersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(myUsersExternalResolver),
        schemaHooks.resolveResult(myUsersResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(myUsersQueryValidator), schemaHooks.resolveQuery(myUsersQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(myUsersDataValidator), schemaHooks.resolveData(myUsersDataResolver)],
      patch: [schemaHooks.validateData(myUsersPatchValidator), schemaHooks.resolveData(myUsersPatchResolver)],
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
    [myUsersPath]: MyUsersService
  }
}
