// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  messageSeenDataValidator,
  messageSeenPatchValidator,
  messageSeenQueryValidator,
  messageSeenResolver,
  messageSeenExternalResolver,
  messageSeenDataResolver,
  messageSeenPatchResolver,
  messageSeenQueryResolver
} from './message-seen.schema'

import type { Application } from '../../declarations'
import { MessageSeenService, getOptions } from './message-seen.class'
import { messageSeenPath, messageSeenMethods } from './message-seen.shared'
import setTimestamps from '../../hooks/dating'

export * from './message-seen.class'
export * from './message-seen.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const messageSeen = (app: Application) => {
  // Register our service on the Feathers application
  app.use(messageSeenPath, new MessageSeenService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: messageSeenMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(messageSeenPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(messageSeenExternalResolver),
        schemaHooks.resolveResult(messageSeenResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(messageSeenQueryValidator),
        schemaHooks.resolveQuery(messageSeenQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        setTimestamps(),
        schemaHooks.validateData(messageSeenDataValidator),
        schemaHooks.resolveData(messageSeenDataResolver)
      ],
      patch: [
        setTimestamps(),

        schemaHooks.validateData(messageSeenPatchValidator),
        schemaHooks.resolveData(messageSeenPatchResolver)
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
    [messageSeenPath]: MessageSeenService
  }
}
