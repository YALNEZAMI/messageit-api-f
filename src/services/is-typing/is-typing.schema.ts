// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { IsTypingService } from './is-typing.class'

// Main data model schema
export const isTypingSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  },
  { $id: 'IsTyping', additionalProperties: false }
)
export type IsTyping = Static<typeof isTypingSchema>
export const isTypingValidator = getValidator(isTypingSchema, dataValidator)
export const isTypingResolver = resolve<IsTyping, HookContext<IsTypingService>>({})

export const isTypingExternalResolver = resolve<IsTyping, HookContext<IsTypingService>>({})

// Schema for creating new entries
export const isTypingDataSchema = Type.Pick(isTypingSchema, ['text'], {
  $id: 'IsTypingData'
})
export type IsTypingData = Static<typeof isTypingDataSchema>
export const isTypingDataValidator = getValidator(isTypingDataSchema, dataValidator)
export const isTypingDataResolver = resolve<IsTyping, HookContext<IsTypingService>>({})

// Schema for updating existing entries
export const isTypingPatchSchema = Type.Partial(isTypingSchema, {
  $id: 'IsTypingPatch'
})
export type IsTypingPatch = Static<typeof isTypingPatchSchema>
export const isTypingPatchValidator = getValidator(isTypingPatchSchema, dataValidator)
export const isTypingPatchResolver = resolve<IsTyping, HookContext<IsTypingService>>({})

// Schema for allowed query properties
export const isTypingQueryProperties = Type.Pick(isTypingSchema, ['_id', 'text'])
export const isTypingQuerySchema = Type.Intersect(
  [
    querySyntax(isTypingQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type IsTypingQuery = Static<typeof isTypingQuerySchema>
export const isTypingQueryValidator = getValidator(isTypingQuerySchema, queryValidator)
export const isTypingQueryResolver = resolve<IsTypingQuery, HookContext<IsTypingService>>({})
