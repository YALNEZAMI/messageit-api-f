// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { EmojisService } from './emojis.class'

// Main data model schema
export const emojisSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    emoji: Type.String(),
    reacter: Type.String(),
    message: Type.String()
  },
  { $id: 'Emojis', additionalProperties: false }
)
export type Emojis = Static<typeof emojisSchema>
export const emojisValidator = getValidator(emojisSchema, dataValidator)
export const emojisResolver = resolve<Emojis, HookContext<EmojisService>>({})

export const emojisExternalResolver = resolve<Emojis, HookContext<EmojisService>>({})

// Schema for creating new entries
export const emojisDataSchema = Type.Pick(emojisSchema, ['emoji', 'reacter', 'message'], {
  $id: 'EmojisData'
})
export type EmojisData = Static<typeof emojisDataSchema>
export const emojisDataValidator = getValidator(emojisDataSchema, dataValidator)
export const emojisDataResolver = resolve<Emojis, HookContext<EmojisService>>({})

// Schema for updating existing entries
export const emojisPatchSchema = Type.Partial(emojisSchema, {
  $id: 'EmojisPatch'
})
export type EmojisPatch = Static<typeof emojisPatchSchema>
export const emojisPatchValidator = getValidator(emojisPatchSchema, dataValidator)
export const emojisPatchResolver = resolve<Emojis, HookContext<EmojisService>>({})

// Schema for allowed query properties
export const emojisQueryProperties = Type.Pick(emojisSchema, ['_id', 'emoji', 'reacter', 'message'])
export const emojisQuerySchema = Type.Intersect(
  [
    querySyntax(emojisQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type EmojisQuery = Static<typeof emojisQuerySchema>
export const emojisQueryValidator = getValidator(emojisQuerySchema, queryValidator)
export const emojisQueryResolver = resolve<EmojisQuery, HookContext<EmojisService>>({})
