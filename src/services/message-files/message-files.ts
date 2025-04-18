// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  messageFilesDataValidator,
  messageFilesPatchValidator,
  messageFilesQueryValidator,
  messageFilesResolver,
  messageFilesExternalResolver,
  messageFilesDataResolver,
  messageFilesPatchResolver,
  messageFilesQueryResolver
} from './message-files.schema'

import type { Application } from '../../declarations'
import { MessageFilesService, getOptions } from './message-files.class'
import { messageFilesPath, messageFilesMethods } from './message-files.shared'

export * from './message-files.class'
export * from './message-files.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const messageFiles = (app: Application) => {
  // Register our service on the Feathers application
  app.use(messageFilesPath, new MessageFilesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: messageFilesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(messageFilesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(messageFilesExternalResolver),
        schemaHooks.resolveResult(messageFilesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(messageFilesQueryValidator),
        schemaHooks.resolveQuery(messageFilesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(messageFilesDataValidator),
        schemaHooks.resolveData(messageFilesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(messageFilesPatchValidator),
        schemaHooks.resolveData(messageFilesPatchResolver)
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
    [messageFilesPath]: MessageFilesService
  }
}
