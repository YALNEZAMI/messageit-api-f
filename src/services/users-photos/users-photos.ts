// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  usersPhotosDataValidator,
  usersPhotosPatchValidator,
  usersPhotosQueryValidator,
  usersPhotosResolver,
  usersPhotosExternalResolver,
  usersPhotosDataResolver,
  usersPhotosPatchResolver,
  usersPhotosQueryResolver
} from './users-photos.schema'

import type { Application } from '../../declarations'
import { UsersPhotosService, getOptions } from './users-photos.class'
import { usersPhotosPath, usersPhotosMethods } from './users-photos.shared'
import { fileHook } from './users-photos.hooks'

export * from './users-photos.class'

// A configure function that registers the service and its hooks via `app.configure`
export const usersPhotos = (app: Application) => {
  // Register our service on the Feathers application
  app.use(usersPhotosPath, new UsersPhotosService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: usersPhotosMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(usersPhotosPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(usersPhotosExternalResolver),
        schemaHooks.resolveResult(usersPhotosResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(usersPhotosQueryValidator),
        schemaHooks.resolveQuery(usersPhotosQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        fileHook(),
        schemaHooks.validateData(usersPhotosDataValidator),
        schemaHooks.resolveData(usersPhotosDataResolver)
      ],
      patch: [
        schemaHooks.validateData(usersPhotosPatchValidator),
        schemaHooks.resolveData(usersPhotosPatchResolver)
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
    [usersPhotosPath]: UsersPhotosService
  }
}
