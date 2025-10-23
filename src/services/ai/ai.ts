// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  aiDataValidator,
  aiPatchValidator,
  aiQueryValidator,
  aiResolver,
  aiExternalResolver,
  aiDataResolver,
  aiPatchResolver,
  aiQueryResolver
} from './ai.schema'

import type { Application } from '../../declarations'
import { AiService, getOptions } from './ai.class'
import { aiPath, aiMethods } from './ai.shared'
import { validateMembership } from '../../hooks/convValidation'

export * from './ai.class'
export * from './ai.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const ai = (app: Application) => {
  // Register our service on the Feathers application
  app.use(aiPath, new AiService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: aiMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(aiPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(aiExternalResolver),
        schemaHooks.resolveResult(aiResolver)
      ]
    },
    before: {
      all: [
        validateMembership(),
        schemaHooks.validateQuery(aiQueryValidator),
        schemaHooks.resolveQuery(aiQueryResolver)
      ],
      find: [],
      get: [],
      create: [schemaHooks.validateData(aiDataValidator), schemaHooks.resolveData(aiDataResolver)],
      patch: [schemaHooks.validateData(aiPatchValidator), schemaHooks.resolveData(aiPatchResolver)],
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
    [aiPath]: AiService
  }
}
