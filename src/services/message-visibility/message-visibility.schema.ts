// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MessageVisibilityService } from './message-visibility.class'

// Main data model schema
export const messageVisibilitySchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: Type.String(),
    messageId: Type.String(),
    conversationId: Type.String()
  },
  { $id: 'MessageVisibility', additionalProperties: false }
)
export type MessageVisibility = Static<typeof messageVisibilitySchema>
export const messageVisibilityValidator = getValidator(messageVisibilitySchema, dataValidator)
export const messageVisibilityResolver = resolve<MessageVisibility, HookContext<MessageVisibilityService>>({})

export const messageVisibilityExternalResolver = resolve<
  MessageVisibility,
  HookContext<MessageVisibilityService>
>({})

// Schema for creating new entries
export const messageVisibilityDataSchema = Type.Pick(
  messageVisibilitySchema,
  ['userId', 'messageId', 'conversationId'],
  {
    $id: 'MessageVisibilityData'
  }
)
export type MessageVisibilityData = Static<typeof messageVisibilityDataSchema>
export const messageVisibilityDataValidator = getValidator(messageVisibilityDataSchema, dataValidator)
export const messageVisibilityDataResolver = resolve<
  MessageVisibility,
  HookContext<MessageVisibilityService>
>({})

// Schema for updating existing entries
export const messageVisibilityPatchSchema = Type.Partial(messageVisibilitySchema, {
  $id: 'MessageVisibilityPatch'
})
export type MessageVisibilityPatch = Static<typeof messageVisibilityPatchSchema>
export const messageVisibilityPatchValidator = getValidator(messageVisibilityPatchSchema, dataValidator)
export const messageVisibilityPatchResolver = resolve<
  MessageVisibility,
  HookContext<MessageVisibilityService>
>({})

// Schema for allowed query properties
export const messageVisibilityQueryProperties = Type.Pick(messageVisibilitySchema, [
  '_id',
  'userId',
  'messageId',
  'conversationId'
])
export const messageVisibilityQuerySchema = Type.Intersect(
  [
    querySyntax(messageVisibilityQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MessageVisibilityQuery = Static<typeof messageVisibilityQuerySchema>
export const messageVisibilityQueryValidator = getValidator(messageVisibilityQuerySchema, queryValidator)
export const messageVisibilityQueryResolver = resolve<
  MessageVisibilityQuery,
  HookContext<MessageVisibilityService>
>({})
