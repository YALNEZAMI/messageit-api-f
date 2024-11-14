// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import type { FromSchema } from '@feathersjs/schema'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MembersService } from './members.class'

// Main data model schema
export const membersSchema = {
  $id: 'Members',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'text'],
  properties: {
    _id: ObjectIdSchema(),

    text: { type: 'string' }
  }
} as const
export type Members = FromSchema<typeof membersSchema>
export const membersValidator = getValidator(membersSchema, dataValidator)
export const membersResolver = resolve<Members, HookContext<MembersService>>({})

export const membersExternalResolver = resolve<Members, HookContext<MembersService>>({})

// Schema for creating new data
export const membersDataSchema = {
  $id: 'MembersData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    ...membersSchema.properties
  }
} as const
export type MembersData = FromSchema<typeof membersDataSchema>
export const membersDataValidator = getValidator(membersDataSchema, dataValidator)
export const membersDataResolver = resolve<MembersData, HookContext<MembersService>>({})

// Schema for updating existing data
export const membersPatchSchema = {
  $id: 'MembersPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...membersSchema.properties
  }
} as const
export type MembersPatch = FromSchema<typeof membersPatchSchema>
export const membersPatchValidator = getValidator(membersPatchSchema, dataValidator)
export const membersPatchResolver = resolve<MembersPatch, HookContext<MembersService>>({})

// Schema for allowed query properties
export const membersQuerySchema = {
  $id: 'MembersQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(membersSchema.properties)
  }
} as const
export type MembersQuery = FromSchema<typeof membersQuerySchema>
export const membersQueryValidator = getValidator(membersQuerySchema, queryValidator)
export const membersQueryResolver = resolve<MembersQuery, HookContext<MembersService>>({})
