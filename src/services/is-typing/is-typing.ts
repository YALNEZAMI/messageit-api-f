// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  isTypingDataValidator,
  isTypingPatchValidator,
  isTypingQueryValidator,
  isTypingResolver,
  isTypingExternalResolver,
  isTypingDataResolver,
  isTypingPatchResolver,
  isTypingQueryResolver
} from './is-typing.schema'

import type { Application } from '../../declarations'
import { IsTypingService, getOptions } from './is-typing.class'
import { isTypingPath, isTypingMethods } from './is-typing.shared'
import setTimestamps from '../../hooks/dating'

export * from './is-typing.class'
export * from './is-typing.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const isTyping = (app: Application) => {
  // Register our service on the Feathers application
  app.use(isTypingPath, new IsTypingService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: isTypingMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(isTypingPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(isTypingExternalResolver),
        schemaHooks.resolveResult(isTypingResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(isTypingQueryValidator),
        schemaHooks.resolveQuery(isTypingQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        setTimestamps(),
        schemaHooks.validateData(isTypingDataValidator),
        schemaHooks.resolveData(isTypingDataResolver)
      ],
      patch: [
        schemaHooks.validateData(isTypingPatchValidator),
        schemaHooks.resolveData(isTypingPatchResolver)
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
    [isTypingPath]: IsTypingService
  }
}
