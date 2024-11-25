// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  messageRecievingDataValidator,
  messageRecievingPatchValidator,
  messageRecievingQueryValidator,
  messageRecievingResolver,
  messageRecievingExternalResolver,
  messageRecievingDataResolver,
  messageRecievingPatchResolver,
  messageRecievingQueryResolver
} from './message-recieving.schema'

import type { Application } from '../../declarations'
import { MessageRecievingService, getOptions } from './message-recieving.class'
import { messageRecievingPath, messageRecievingMethods } from './message-recieving.shared'
import setTimestamps from '../../hooks/dating'

export * from './message-recieving.class'
export * from './message-recieving.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const messageRecieving = (app: Application) => {
  // Register our service on the Feathers application
  app.use(messageRecievingPath, new MessageRecievingService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: messageRecievingMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(messageRecievingPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(messageRecievingExternalResolver),
        schemaHooks.resolveResult(messageRecievingResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(messageRecievingQueryValidator),
        schemaHooks.resolveQuery(messageRecievingQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        setTimestamps(),
        schemaHooks.validateData(messageRecievingDataValidator),
        schemaHooks.resolveData(messageRecievingDataResolver)
      ],
      patch: [
        schemaHooks.validateData(messageRecievingPatchValidator),
        schemaHooks.resolveData(messageRecievingPatchResolver)
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
    [messageRecievingPath]: MessageRecievingService
  }
}
