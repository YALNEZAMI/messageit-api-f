// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { FriendsService } from './friends.class'

// Main data model schema
export const friendsSchema = {
  $id: 'Friends',
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: ObjectIdSchema(),
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },

    sender: { type: 'string' },
    recipient: { type: 'string' }
  }
} as const
export type Friends = FromSchema<typeof friendsSchema>
export const friendsValidator = getValidator(friendsSchema, dataValidator)
export const friendsResolver = resolve<Friends, HookContext<FriendsService>>({})

export const friendsExternalResolver = resolve<Friends, HookContext<FriendsService>>({})

// Schema for creating new data
export const friendsDataSchema = {
  $id: 'FriendsData',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...friendsSchema.properties
  }
} as const
export type FriendsData = FromSchema<typeof friendsDataSchema>
export const friendsDataValidator = getValidator(friendsDataSchema, dataValidator)
export const friendsDataResolver = resolve<FriendsData, HookContext<FriendsService>>({})

// Schema for updating existing data
export const friendsPatchSchema = {
  $id: 'FriendsPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...friendsSchema.properties
  }
} as const
export type FriendsPatch = FromSchema<typeof friendsPatchSchema>
export const friendsPatchValidator = getValidator(friendsPatchSchema, dataValidator)
export const friendsPatchResolver = resolve<FriendsPatch, HookContext<FriendsService>>({})

// Schema for allowed query properties
export const friendsQuerySchema = {
  $id: 'FriendsQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(friendsSchema.properties),
    ...querySyntax({
      original: { type: 'boolean' },
      id: { type: 'string' },
      recipient: { type: 'string' },
      sender: { type: 'string' }
    })
  }
} as const
export type FriendsQuery = FromSchema<typeof friendsQuerySchema>
export const friendsQueryValidator = getValidator(friendsQuerySchema, queryValidator)
export const friendsQueryResolver = resolve<FriendsQuery, HookContext<FriendsService>>({})
