// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AiService } from './ai.class'

// Main data model schema
export const aiSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String(),
    user: Type.String(),
    aiUser: Type.String(),
    conversation: Type.String(),
    isLast: Type.Boolean()
  },
  { $id: 'Ai', additionalProperties: true }
)
export type Ai = Static<typeof aiSchema>
export const aiValidator = getValidator(aiSchema, dataValidator)
export const aiResolver = resolve<Ai, HookContext<AiService>>({})

export const aiExternalResolver = resolve<Ai, HookContext<AiService>>({})

// Schema for creating new entries
export const aiDataSchema = Type.Pick(aiSchema, ['text'], {
  $id: 'AiData'
})
export type AiData = Static<typeof aiDataSchema>
export const aiDataValidator = getValidator(aiDataSchema, dataValidator)
export const aiDataResolver = resolve<Ai, HookContext<AiService>>({})

// Schema for updating existing entries
export const aiPatchSchema = Type.Partial(aiSchema, {
  $id: 'AiPatch'
})
export type AiPatch = Static<typeof aiPatchSchema>
export const aiPatchValidator = getValidator(aiPatchSchema, dataValidator)
export const aiPatchResolver = resolve<Ai, HookContext<AiService>>({})

// Schema for allowed query properties
export const aiQueryProperties = Type.Pick(aiSchema, ['_id', 'text'])
export const aiQuerySchema = Type.Intersect(
  [
    querySyntax(aiQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: true }
)
export type AiQuery = Static<typeof aiQuerySchema>
export const aiQueryValidator = getValidator(aiQuerySchema, queryValidator)
export const aiQueryResolver = resolve<AiQuery, HookContext<AiService>>({})
