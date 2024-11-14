// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  membersDataValidator,
  membersPatchValidator,
  membersQueryValidator,
  membersResolver,
  membersExternalResolver,
  membersDataResolver,
  membersPatchResolver,
  membersQueryResolver
} from './members.schema'

import type { Application } from '../../declarations'
import { MembersService, getOptions } from './members.class'
import { membersPath, membersMethods } from './members.shared'

export * from './members.class'
export * from './members.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const members = (app: Application) => {
  // Register our service on the Feathers application
  app.use(membersPath, new MembersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: membersMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(membersPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(membersExternalResolver),
        schemaHooks.resolveResult(membersResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(membersQueryValidator), schemaHooks.resolveQuery(membersQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(membersDataValidator), schemaHooks.resolveData(membersDataResolver)],
      patch: [schemaHooks.validateData(membersPatchValidator), schemaHooks.resolveData(membersPatchResolver)],
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
    [membersPath]: MembersService
  }
}
