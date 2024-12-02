// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  groupRightsDataValidator,
  groupRightsPatchValidator,
  groupRightsQueryValidator,
  groupRightsResolver,
  groupRightsExternalResolver,
  groupRightsDataResolver,
  groupRightsPatchResolver,
  groupRightsQueryResolver
} from './group-rights.schema'

import type { Application } from '../../declarations'
import { GroupRightsService, getOptions } from './group-rights.class'
import { groupRightsPath, groupRightsMethods } from './group-rights.shared'

export * from './group-rights.class'
export * from './group-rights.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const groupRights = (app: Application) => {
  // Register our service on the Feathers application
  app.use(groupRightsPath, new GroupRightsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: groupRightsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(groupRightsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(groupRightsExternalResolver),
        schemaHooks.resolveResult(groupRightsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(groupRightsQueryValidator),
        schemaHooks.resolveQuery(groupRightsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(groupRightsDataValidator),
        schemaHooks.resolveData(groupRightsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(groupRightsPatchValidator),
        schemaHooks.resolveData(groupRightsPatchResolver)
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
    [groupRightsPath]: GroupRightsService
  }
}
