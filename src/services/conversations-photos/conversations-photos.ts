// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  conversationsPhotosDataValidator,
  conversationsPhotosPatchValidator,
  conversationsPhotosQueryValidator,
  conversationsPhotosResolver,
  conversationsPhotosExternalResolver,
  conversationsPhotosDataResolver,
  conversationsPhotosPatchResolver,
  conversationsPhotosQueryResolver
} from './conversations-photos.schema'

import type { Application } from '../../declarations'
import { ConversationsPhotosService, getOptions } from './conversations-photos.class'
import { conversationsPhotosPath, conversationsPhotosMethods } from './conversations-photos.shared'

export * from './conversations-photos.class'
export * from './conversations-photos.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const conversationsPhotos = (app: Application) => {
  // Register our service on the Feathers application
  app.use(conversationsPhotosPath, new ConversationsPhotosService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: conversationsPhotosMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(conversationsPhotosPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(conversationsPhotosExternalResolver),
        schemaHooks.resolveResult(conversationsPhotosResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(conversationsPhotosQueryValidator),
        schemaHooks.resolveQuery(conversationsPhotosQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(conversationsPhotosDataValidator),
        schemaHooks.resolveData(conversationsPhotosDataResolver)
      ],
      patch: [
        schemaHooks.validateData(conversationsPhotosPatchValidator),
        schemaHooks.resolveData(conversationsPhotosPatchResolver)
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
    [conversationsPhotosPath]: ConversationsPhotosService
  }
}
