// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { GroupRightsService } from './group-rights.class'

// Main data model schema
export const groupRightsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    conversation: Type.String(),
    chef: Type.String(),
    admins: Type.Array(Type.String())
  },
  { $id: 'GroupRights', additionalProperties: false }
)
export type GroupRights = Static<typeof groupRightsSchema>
export const groupRightsValidator = getValidator(groupRightsSchema, dataValidator)
export const groupRightsResolver = resolve<GroupRights, HookContext<GroupRightsService>>({})

export const groupRightsExternalResolver = resolve<GroupRights, HookContext<GroupRightsService>>({})

// Schema for creating new entries
export const groupRightsDataSchema = Type.Pick(groupRightsSchema, ['conversation', 'chef', 'admins'], {
  $id: 'GroupRightsData'
})
export type GroupRightsData = Static<typeof groupRightsDataSchema>
export const groupRightsDataValidator = getValidator(groupRightsDataSchema, dataValidator)
export const groupRightsDataResolver = resolve<GroupRights, HookContext<GroupRightsService>>({})

// Schema for updating existing entries
export const groupRightsPatchSchema = Type.Partial(groupRightsSchema, {
  $id: 'GroupRightsPatch'
})
export type GroupRightsPatch = Static<typeof groupRightsPatchSchema>
export const groupRightsPatchValidator = getValidator(groupRightsPatchSchema, dataValidator)
export const groupRightsPatchResolver = resolve<GroupRights, HookContext<GroupRightsService>>({})

// Schema for allowed query properties
export const groupRightsQueryProperties = Type.Pick(groupRightsSchema, [
  '_id',
  'conversation',
  'chef',
  'admins'
])
export const groupRightsQuerySchema = Type.Intersect(
  [
    querySyntax(groupRightsQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        admin: Type.Optional(Type.String()),
        chef: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type GroupRightsQuery = Static<typeof groupRightsQuerySchema>
export const groupRightsQueryValidator = getValidator(groupRightsQuerySchema, queryValidator)
export const groupRightsQueryResolver = resolve<GroupRightsQuery, HookContext<GroupRightsService>>({})
