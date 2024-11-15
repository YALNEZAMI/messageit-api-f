// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { FriendAcceptationsService } from './friend-acceptations.class'

// Main data model schema
export const friendAcceptationsSchema = {
  $id: 'FriendAcceptations',
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    _id: ObjectIdSchema(),
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    recipient: { type: 'string' },
    sender: { type: 'string' }
  }
} as const
export type FriendAcceptations = FromSchema<typeof friendAcceptationsSchema>
export const friendAcceptationsValidator = getValidator(friendAcceptationsSchema, dataValidator)
export const friendAcceptationsResolver = resolve<FriendAcceptations, HookContext<FriendAcceptationsService>>(
  {}
)

export const friendAcceptationsExternalResolver = resolve<
  FriendAcceptations,
  HookContext<FriendAcceptationsService>
>({})

// Schema for creating new data
export const friendAcceptationsDataSchema = {
  $id: 'FriendAcceptationsData',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...friendAcceptationsSchema.properties
  }
} as const
export type FriendAcceptationsData = FromSchema<typeof friendAcceptationsDataSchema>
export const friendAcceptationsDataValidator = getValidator(friendAcceptationsDataSchema, dataValidator)
export const friendAcceptationsDataResolver = resolve<
  FriendAcceptationsData,
  HookContext<FriendAcceptationsService>
>({})

// Schema for updating existing data
export const friendAcceptationsPatchSchema = {
  $id: 'FriendAcceptationsPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...friendAcceptationsSchema.properties
  }
} as const
export type FriendAcceptationsPatch = FromSchema<typeof friendAcceptationsPatchSchema>
export const friendAcceptationsPatchValidator = getValidator(friendAcceptationsPatchSchema, dataValidator)
export const friendAcceptationsPatchResolver = resolve<
  FriendAcceptationsPatch,
  HookContext<FriendAcceptationsService>
>({})

// Schema for allowed query properties
export const friendAcceptationsQuerySchema = {
  $id: 'FriendAcceptationsQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax({ id: { type: 'string' } }),
    ...querySyntax(friendAcceptationsSchema.properties)
  }
} as const
export type FriendAcceptationsQuery = FromSchema<typeof friendAcceptationsQuerySchema>
export const friendAcceptationsQueryValidator = getValidator(friendAcceptationsQuerySchema, queryValidator)
export const friendAcceptationsQueryResolver = resolve<
  FriendAcceptationsQuery,
  HookContext<FriendAcceptationsService>
>({})
