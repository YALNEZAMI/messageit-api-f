// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  conversationsDataValidator,
  conversationsPatchValidator,
  conversationsQueryValidator,
  conversationsResolver,
  conversationsExternalResolver,
  conversationsDataResolver,
  conversationsPatchResolver,
  conversationsQueryResolver
} from './conversations.schema'

import type { Application } from '../../declarations'
import { ConversationsService, getOptions } from './conversations.class'
import { conversationsPath, conversationsMethods } from './conversations.shared'
import setTimestamps from '../../hooks/dating'

export * from './conversations.class'
export * from './conversations.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const conversations = (app: Application) => {
  // Register our service on the Feathers application
  app.use(conversationsPath, new ConversationsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: conversationsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(conversationsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(conversationsExternalResolver),
        schemaHooks.resolveResult(conversationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(conversationsQueryValidator),
        schemaHooks.resolveQuery(conversationsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        setTimestamps(),
        schemaHooks.validateData(conversationsDataValidator),
        schemaHooks.resolveData(conversationsDataResolver)
      ],
      patch: [
        setTimestamps(),
        schemaHooks.validateData(conversationsPatchValidator),
        schemaHooks.resolveData(conversationsPatchResolver)
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
    [conversationsPath]: ConversationsService
  }
}
