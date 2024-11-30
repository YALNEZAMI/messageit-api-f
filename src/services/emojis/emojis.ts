// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  emojisDataValidator,
  emojisPatchValidator,
  emojisQueryValidator,
  emojisResolver,
  emojisExternalResolver,
  emojisDataResolver,
  emojisPatchResolver,
  emojisQueryResolver
} from './emojis.schema'

import type { Application } from '../../declarations'
import { EmojisService, getOptions } from './emojis.class'
import { emojisPath, emojisMethods } from './emojis.shared'

export * from './emojis.class'
export * from './emojis.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const emojis = (app: Application) => {
  // Register our service on the Feathers application
  app.use(emojisPath, new EmojisService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: emojisMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(emojisPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(emojisExternalResolver),
        schemaHooks.resolveResult(emojisResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(emojisQueryValidator), schemaHooks.resolveQuery(emojisQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(emojisDataValidator), schemaHooks.resolveData(emojisDataResolver)],
      patch: [schemaHooks.validateData(emojisPatchValidator), schemaHooks.resolveData(emojisPatchResolver)],
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
    [emojisPath]: EmojisService
  }
}
