// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  messageVisibilityDataValidator,
  messageVisibilityPatchValidator,
  messageVisibilityQueryValidator,
  messageVisibilityResolver,
  messageVisibilityExternalResolver,
  messageVisibilityDataResolver,
  messageVisibilityPatchResolver,
  messageVisibilityQueryResolver
} from './message-visibility.schema'

import type { Application } from '../../declarations'
import { MessageVisibilityService, getOptions } from './message-visibility.class'
import { messageVisibilityPath, messageVisibilityMethods } from './message-visibility.shared'

export * from './message-visibility.class'
export * from './message-visibility.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const messageVisibility = (app: Application) => {
  // Register our service on the Feathers application
  app.use(messageVisibilityPath, new MessageVisibilityService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: messageVisibilityMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(messageVisibilityPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(messageVisibilityExternalResolver),
        schemaHooks.resolveResult(messageVisibilityResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(messageVisibilityQueryValidator),
        schemaHooks.resolveQuery(messageVisibilityQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(messageVisibilityDataValidator),
        schemaHooks.resolveData(messageVisibilityDataResolver)
      ],
      patch: [
        schemaHooks.validateData(messageVisibilityPatchValidator),
        schemaHooks.resolveData(messageVisibilityPatchResolver)
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
    [messageVisibilityPath]: MessageVisibilityService
  }
}
