// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MyUsersService } from './my-users.class'

// Main data model schema
export const myUsersSchema = {
  $id: 'MyUsers',
  type: 'object',
  additionalProperties: false,
  required: ['_id'],
  properties: {
    name: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
    theme: {
      type: 'object',
      default: { _id: 'basic', name: 'Basique' },
      additionalProperties: false,
      properties: {
        _id: { type: 'string' },
        name: { type: 'string' }
      }
    },
    onLine: {
      type: 'boolean'
    },
    lastConnection: {
      type: 'string'
    },
    _id: { type: 'string' },
    email: { type: 'string' }
  }
} as const
export type MyUsers = FromSchema<typeof myUsersSchema>
export const myUsersValidator = getValidator(myUsersSchema, dataValidator)
export const myUsersResolver = resolve<MyUsers, HookContext<MyUsersService>>({})

export const myUsersExternalResolver = resolve<MyUsers, HookContext<MyUsersService>>({})

// Schema for creating new data
export const myUsersDataSchema = {
  $id: 'MyUsersData',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...myUsersSchema.properties
  }
} as const
export type MyUsersData = FromSchema<typeof myUsersDataSchema>
export const myUsersDataValidator = getValidator(myUsersDataSchema, dataValidator)
export const myUsersDataResolver = resolve<MyUsersData, HookContext<MyUsersService>>({})

// Schema for updating existing data
export const myUsersPatchSchema = {
  $id: 'MyUsersPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...myUsersSchema.properties
  }
} as const
export type MyUsersPatch = FromSchema<typeof myUsersPatchSchema>
export const myUsersPatchValidator = getValidator(myUsersPatchSchema, dataValidator)
export const myUsersPatchResolver = resolve<MyUsersPatch, HookContext<MyUsersService>>({})

// Schema for allowed query properties
export const myUsersQuerySchema = {
  $id: 'MyUsersQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(myUsersSchema.properties)
  }
} as const
export type MyUsersQuery = FromSchema<typeof myUsersQuerySchema>
export const myUsersQueryValidator = getValidator(myUsersQuerySchema, queryValidator)
export const myUsersQueryResolver = resolve<MyUsersQuery, HookContext<MyUsersService>>({})
