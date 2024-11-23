// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { FriendRequestsService } from './friend-requests.class'

// Main data model schema
export const friendRequestsSchema = {
  $id: 'FriendRequests',
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: ObjectIdSchema(),
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },

    sender: { type: 'string' },
    recipient: { type: 'string' },
    seen: { type: 'boolean', default: false }
  }
} as const
export type FriendRequests = FromSchema<typeof friendRequestsSchema>
export const friendRequestsValidator = getValidator(friendRequestsSchema, dataValidator)
export const friendRequestsResolver = resolve<FriendRequests, HookContext<FriendRequestsService>>({})

export const friendRequestsExternalResolver = resolve<FriendRequests, HookContext<FriendRequestsService>>({})

// Schema for creating new data
export const friendRequestsDataSchema = {
  $id: 'FriendRequestsData',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...friendRequestsSchema.properties
  }
} as const
export type FriendRequestsData = FromSchema<typeof friendRequestsDataSchema>
export const friendRequestsDataValidator = getValidator(friendRequestsDataSchema, dataValidator)
export const friendRequestsDataResolver = resolve<FriendRequestsData, HookContext<FriendRequestsService>>({})

// Schema for updating existing data
export const friendRequestsPatchSchema = {
  $id: 'FriendRequestsPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...friendRequestsSchema.properties
  }
} as const
export type FriendRequestsPatch = FromSchema<typeof friendRequestsPatchSchema>
export const friendRequestsPatchValidator = getValidator(friendRequestsPatchSchema, dataValidator)
export const friendRequestsPatchResolver = resolve<FriendRequestsPatch, HookContext<FriendRequestsService>>(
  {}
)

// Schema for allowed query properties
export const friendRequestsQuerySchema = {
  $id: 'FriendRequestsQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax({ ...friendRequestsSchema.properties, otherUserId: { type: 'string' } })
  }
} as const
export type FriendRequestsQuery = FromSchema<typeof friendRequestsQuerySchema>
export const friendRequestsQueryValidator = getValidator(friendRequestsQuerySchema, queryValidator)
export const friendRequestsQueryResolver = resolve<FriendRequestsQuery, HookContext<FriendRequestsService>>(
  {}
)
