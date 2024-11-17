// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ConversationsService } from './conversations.class'

// Main data model schema
export const conversationsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    name: Type.Optional(Type.String()),
    type: Type.String(),
    members: Type.Array(Type.Any(), {
      uniqueItems: true,
      minItems: 2
    }),
    theme: Type.Object({
      _id: Type.String({
        default: 'basic'
      }),
      name: Type.String({
        default: 'Basique'
      })
    })
  },
  { $id: 'Conversations', additionalProperties: false }
)
export type Conversations = Static<typeof conversationsSchema>
export const conversationsValidator = getValidator(conversationsSchema, dataValidator)
export const conversationsResolver = resolve<Conversations, HookContext<ConversationsService>>({})

export const conversationsExternalResolver = resolve<Conversations, HookContext<ConversationsService>>({})

// Schema for creating new entries
export const conversationsDataSchema = Type.Pick(
  conversationsSchema,
  ['members', 'theme', 'name', 'createdAt', 'updatedAt', 'type'],
  {
    $id: 'ConversationsData'
  }
)

export type ConversationsData = Static<typeof conversationsDataSchema>
export const conversationsDataValidator = getValidator(conversationsDataSchema, dataValidator)
export const conversationsDataResolver = resolve<Conversations, HookContext<ConversationsService>>({})

// Schema for updating existing entries
export const conversationsPatchSchema = Type.Partial(conversationsSchema, {
  $id: 'ConversationsPatch'
})
export type ConversationsPatch = Static<typeof conversationsPatchSchema>
export const conversationsPatchValidator = getValidator(conversationsPatchSchema, dataValidator)
export const conversationsPatchResolver = resolve<Conversations, HookContext<ConversationsService>>({})

// Schema for allowed query properties
export const conversationsQueryProperties = Type.Pick(conversationsSchema, ['_id', 'members'])
export const conversationsQuerySchema = Type.Intersect(
  [
    querySyntax(conversationsQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        $match: Type.Optional(Type.Object({ members: Type.Array(Type.String()) })),
        currentUserId: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type ConversationsQuery = Static<typeof conversationsQuerySchema>
export const conversationsQueryValidator = getValidator(conversationsQuerySchema, queryValidator)
export const conversationsQueryResolver = resolve<ConversationsQuery, HookContext<ConversationsService>>({})
