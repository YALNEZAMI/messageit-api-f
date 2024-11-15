// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { ConversationsService } from './conversations.class'

// Main data model schema
export const conversationsSchema = {
  $id: 'Conversations',
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: ObjectIdSchema(),
    name: { type: 'string' },
    user1: { type: 'string' },
    user2: { type: 'string' },
    theme: {
      type: 'object',
      default: { _id: 'basic', name: 'Basique' },
      additionalProperties: false,
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' }
      }
    }
  }
} as const
export type Conversations = FromSchema<typeof conversationsSchema>
export const conversationsValidator = getValidator(conversationsSchema, dataValidator)
export const conversationsResolver = resolve<Conversations, HookContext<ConversationsService>>({})

export const conversationsExternalResolver = resolve<Conversations, HookContext<ConversationsService>>({})

// Schema for creating new data
export const conversationsDataSchema = {
  $id: 'ConversationsData',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...conversationsSchema.properties
  }
} as const
export type ConversationsData = FromSchema<typeof conversationsDataSchema>
export const conversationsDataValidator = getValidator(conversationsDataSchema, dataValidator)
export const conversationsDataResolver = resolve<ConversationsData, HookContext<ConversationsService>>({})

// Schema for updating existing data
export const conversationsPatchSchema = {
  $id: 'ConversationsPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...conversationsSchema.properties
  }
} as const
export type ConversationsPatch = FromSchema<typeof conversationsPatchSchema>
export const conversationsPatchValidator = getValidator(conversationsPatchSchema, dataValidator)
export const conversationsPatchResolver = resolve<ConversationsPatch, HookContext<ConversationsService>>({})

// Schema for allowed query properties
export const conversationsQuerySchema = {
  $id: 'ConversationsQuery',
  type: 'object',
  additionalProperties: false, // Allow additional properties if necessary
  properties: {
    ...querySyntax(conversationsSchema.properties),
    ...querySyntax({
      currentUserId: {
        type: 'string'
      },
      user1: {
        type: 'string'
      },
      user2: { type: 'string' }
    })
  }
} as const

export type ConversationsQuery = FromSchema<typeof conversationsQuerySchema>
export const conversationsQueryValidator = getValidator(conversationsQuerySchema, queryValidator)
export const conversationsQueryResolver = resolve<ConversationsQuery, HookContext<ConversationsService>>({})
