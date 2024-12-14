// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ConversationsPhotosService } from './conversations-photos.class'

// Main data model schema
export const conversationsPhotosSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    file: Type.Optional(Type.Any())
  },
  { $id: 'ConversationsPhotos', additionalProperties: false }
)
export type ConversationsPhotos = Static<typeof conversationsPhotosSchema>
export const conversationsPhotosValidator = getValidator(conversationsPhotosSchema, dataValidator)
export const conversationsPhotosResolver = resolve<
  ConversationsPhotos,
  HookContext<ConversationsPhotosService>
>({})

export const conversationsPhotosExternalResolver = resolve<
  ConversationsPhotos,
  HookContext<ConversationsPhotosService>
>({})

// Schema for creating new entries
export const conversationsPhotosDataSchema = Type.Pick(conversationsPhotosSchema, ['file'], {
  $id: 'ConversationsPhotosData'
})
export type ConversationsPhotosData = Static<typeof conversationsPhotosDataSchema>
export const conversationsPhotosDataValidator = getValidator(conversationsPhotosDataSchema, dataValidator)
export const conversationsPhotosDataResolver = resolve<
  ConversationsPhotos,
  HookContext<ConversationsPhotosService>
>({})

// Schema for updating existing entries
export const conversationsPhotosPatchSchema = Type.Partial(conversationsPhotosSchema, {
  $id: 'ConversationsPhotosPatch'
})
export type ConversationsPhotosPatch = Static<typeof conversationsPhotosPatchSchema>
export const conversationsPhotosPatchValidator = getValidator(conversationsPhotosPatchSchema, dataValidator)
export const conversationsPhotosPatchResolver = resolve<
  ConversationsPhotos,
  HookContext<ConversationsPhotosService>
>({})

// Schema for allowed query properties
export const conversationsPhotosQueryProperties = Type.Pick(conversationsPhotosSchema, ['_id'])
export const conversationsPhotosQuerySchema = Type.Intersect(
  [
    querySyntax(conversationsPhotosQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        conversationId: Type.String()
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type ConversationsPhotosQuery = Static<typeof conversationsPhotosQuerySchema>
export const conversationsPhotosQueryValidator = getValidator(conversationsPhotosQuerySchema, queryValidator)
export const conversationsPhotosQueryResolver = resolve<
  ConversationsPhotosQuery,
  HookContext<ConversationsPhotosService>
>({})
