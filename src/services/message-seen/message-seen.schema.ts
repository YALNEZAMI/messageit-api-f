// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MessageSeenService } from './message-seen.class'

// Main data model schema
export const messageSeenSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    message: Type.String(),
    viewer: Type.String(),
    conversation: Type.String(),
    createdAt: Type.Optional(Type.String()),
    updatedAt: Type.Optional(Type.String())
  },
  { $id: 'MessageSeen', additionalProperties: false }
)
export type MessageSeen = Static<typeof messageSeenSchema>
export const messageSeenValidator = getValidator(messageSeenSchema, dataValidator)
export const messageSeenResolver = resolve<MessageSeen, HookContext<MessageSeenService>>({})

export const messageSeenExternalResolver = resolve<MessageSeen, HookContext<MessageSeenService>>({})

// Schema for creating new entries
export const messageSeenDataSchema = Type.Pick(
  messageSeenSchema,
  ['viewer', 'conversation', 'message', 'createdAt', 'updatedAt'],

  {
    $id: 'MessageSeenData'
  }
)
export type MessageSeenData = Static<typeof messageSeenDataSchema>
export const messageSeenDataValidator = getValidator(messageSeenDataSchema, dataValidator)
export const messageSeenDataResolver = resolve<MessageSeen, HookContext<MessageSeenService>>({})

// Schema for updating existing entries
export const messageSeenPatchSchema = Type.Partial(messageSeenSchema, {
  $id: 'MessageSeenPatch'
})
export type MessageSeenPatch = Static<typeof messageSeenPatchSchema>
export const messageSeenPatchValidator = getValidator(messageSeenPatchSchema, dataValidator)
export const messageSeenPatchResolver = resolve<MessageSeen, HookContext<MessageSeenService>>({})

// Schema for allowed query properties
export const messageSeenQueryProperties = Type.Pick(messageSeenSchema, [
  '_id',
  'viewer',
  'conversation',
  'message',
  'createdAt',
  'updatedAt'
])
export const messageSeenQuerySchema = Type.Intersect(
  [
    querySyntax(messageSeenQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type MessageSeenQuery = Static<typeof messageSeenQuerySchema>
export const messageSeenQueryValidator = getValidator(messageSeenQuerySchema, queryValidator)
export const messageSeenQueryResolver = resolve<MessageSeenQuery, HookContext<MessageSeenService>>({})
