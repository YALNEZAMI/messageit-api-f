// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { UsersPhotosService } from './users-photos.class'

// Main data model schema
export const usersPhotosSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    file: Type.Optional(Type.Any())
  },
  { $id: 'UsersPhotos', additionalProperties: false }
)
export type UsersPhotos = Static<typeof usersPhotosSchema>
export const usersPhotosValidator = getValidator(usersPhotosSchema, dataValidator)
export const usersPhotosResolver = resolve<UsersPhotos, HookContext<UsersPhotosService>>({})

export const usersPhotosExternalResolver = resolve<UsersPhotos, HookContext<UsersPhotosService>>({})

// Schema for creating new entries
export const usersPhotosDataSchema = Type.Pick(usersPhotosSchema, ['file'], {
  $id: 'UsersPhotosData'
})
export type UsersPhotosData = Static<typeof usersPhotosDataSchema>
export const usersPhotosDataValidator = getValidator(usersPhotosDataSchema, dataValidator)
export const usersPhotosDataResolver = resolve<UsersPhotos, HookContext<UsersPhotosService>>({})

// Schema for updating existing entries
export const usersPhotosPatchSchema = Type.Partial(usersPhotosSchema, {
  $id: 'UsersPhotosPatch'
})
export type UsersPhotosPatch = Static<typeof usersPhotosPatchSchema>
export const usersPhotosPatchValidator = getValidator(usersPhotosPatchSchema, dataValidator)
export const usersPhotosPatchResolver = resolve<UsersPhotos, HookContext<UsersPhotosService>>({})

// Schema for allowed query properties
export const usersPhotosQueryProperties = Type.Pick(usersPhotosSchema, ['_id'])
export const usersPhotosQuerySchema = Type.Intersect(
  [
    querySyntax(usersPhotosQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type UsersPhotosQuery = Static<typeof usersPhotosQuerySchema>
export const usersPhotosQueryValidator = getValidator(usersPhotosQuerySchema, queryValidator)
export const usersPhotosQueryResolver = resolve<UsersPhotosQuery, HookContext<UsersPhotosService>>({})
