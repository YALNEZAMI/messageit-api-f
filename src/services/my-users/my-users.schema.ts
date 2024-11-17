// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MyUsersService } from './my-users.class'

// Main data model schema
export const myUsersSchema = Type.Object(
  {
    _id: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    theme: Type.Object(
      {
        _id: Type.String(),
        name: Type.String()
      },
      { default: { _id: 'basic', name: 'Basique' } }
    ),
    onLine: Type.Boolean(),
    lastConnection: Type.String(),
    email: Type.String(),
    name: Type.String()
  },
  { additionalProperties: false }
)
export type MyUsers = Static<typeof myUsersSchema>
export const myUsersValidator = getValidator(myUsersSchema, dataValidator)
export const myUsersResolver = resolve<MyUsers, HookContext<MyUsersService>>({})

export const myUsersExternalResolver = resolve<MyUsers, HookContext<MyUsersService>>({})

// Schema for creating new entries
export const myUsersDataSchema = Type.Pick(
  myUsersSchema,
  ['_id', 'createdAt', 'updatedAt', 'theme', 'onLine', 'lastConnection', 'email', 'name'],
  {
    $id: 'MyUsersData'
  }
)
export type MyUsersData = Static<typeof myUsersDataSchema>
export const myUsersDataValidator = getValidator(myUsersDataSchema, dataValidator)
export const myUsersDataResolver = resolve<MyUsers, HookContext<MyUsersService>>({})

// Schema for updating existing entries
export const myUsersPatchSchema = Type.Partial(myUsersSchema, {
  $id: 'MyUsersPatch'
})
export type MyUsersPatch = Static<typeof myUsersPatchSchema>
export const myUsersPatchValidator = getValidator(myUsersPatchSchema, dataValidator)
export const myUsersPatchResolver = resolve<MyUsers, HookContext<MyUsersService>>({})

// Schema for allowed query properties
export const myUsersQueryProperties = Type.Pick(myUsersSchema, ['_id'])
export const myUsersQuerySchema = Type.Intersect(
  [
    querySyntax(myUsersQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        name: Type.Optional(Type.String()),
        email: Type.Optional(Type.String()),
        statusChecking: Type.Optional(Type.Boolean()),

        currentUserId: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type MyUsersQuery = Static<typeof myUsersQuerySchema>
export const myUsersQueryValidator = getValidator(myUsersQuerySchema, queryValidator)
export const myUsersQueryResolver = resolve<MyUsersQuery, HookContext<MyUsersService>>({})
