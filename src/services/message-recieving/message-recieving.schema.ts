// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MessageRecievingService } from './message-recieving.class'

// Main data model schema
export const messageRecievingSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'MessageRecieving', additionalProperties: false }
)
export type MessageRecieving = Static<typeof messageRecievingSchema>
export const messageRecievingValidator = getValidator(messageRecievingSchema, dataValidator)
export const messageRecievingResolver = resolve<MessageRecieving, HookContext<MessageRecievingService>>({})

export const messageRecievingExternalResolver = resolve<
  MessageRecieving,
  HookContext<MessageRecievingService>
>({})

// Schema for creating new entries
export const messageRecievingDataSchema = Type.Pick(messageRecievingSchema, ['text'], {
  $id: 'MessageRecievingData'
})
export type MessageRecievingData = Static<typeof messageRecievingDataSchema>
export const messageRecievingDataValidator = getValidator(messageRecievingDataSchema, dataValidator)
export const messageRecievingDataResolver = resolve<MessageRecieving, HookContext<MessageRecievingService>>(
  {}
)

// Schema for updating existing entries
export const messageRecievingPatchSchema = Type.Partial(messageRecievingSchema, {
  $id: 'MessageRecievingPatch'
})
export type MessageRecievingPatch = Static<typeof messageRecievingPatchSchema>
export const messageRecievingPatchValidator = getValidator(messageRecievingPatchSchema, dataValidator)
export const messageRecievingPatchResolver = resolve<MessageRecieving, HookContext<MessageRecievingService>>(
  {}
)

// Schema for allowed query properties
export const messageRecievingQueryProperties = Type.Pick(messageRecievingSchema, ['_id', 'text'])
export const messageRecievingQuerySchema = Type.Intersect(
  [
    querySyntax(messageRecievingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MessageRecievingQuery = Static<typeof messageRecievingQuerySchema>
export const messageRecievingQueryValidator = getValidator(messageRecievingQuerySchema, queryValidator)
export const messageRecievingQueryResolver = resolve<
  MessageRecievingQuery,
  HookContext<MessageRecievingService>
>({})
