// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { MessageFilesService } from './message-files.class'

// Main data model schema
export const messageFilesSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    message: Type.String(),
    conversation: Type.Optional(Type.String()),
    urls: Type.Optional(Type.Array(Type.String())),
    files: Type.Optional(Type.Array(Type.Any()))
  },
  { $id: 'MessageFiles ', additionalProperties: false }
)
export type MessageFiles = Static<typeof messageFilesSchema>
export const messageFilesValidator = getValidator(messageFilesSchema, dataValidator)
export const messageFilesResolver = resolve<MessageFiles, HookContext<MessageFilesService>>({})

export const messageFilesExternalResolver = resolve<MessageFiles, HookContext<MessageFilesService>>({})

// Schema for creating new entries
export const messageFilesDataSchema = Type.Pick(
  messageFilesSchema,
  ['message', 'conversation', 'urls', 'files'],
  {
    $id: 'MessageFilesData'
  }
)
export type MessageFilesData = Static<typeof messageFilesDataSchema>
export const messageFilesDataValidator = getValidator(messageFilesDataSchema, dataValidator)
export const messageFilesDataResolver = resolve<MessageFiles, HookContext<MessageFilesService>>({})

// Schema for updating existing entries
export const messageFilesPatchSchema = Type.Partial(messageFilesSchema, {
  $id: 'MessageFilesPatch'
})
export type MessageFilesPatch = Static<typeof messageFilesPatchSchema>
export const messageFilesPatchValidator = getValidator(messageFilesPatchSchema, dataValidator)
export const messageFilesPatchResolver = resolve<MessageFiles, HookContext<MessageFilesService>>({})

// Schema for allowed query properties
export const messageFilesQueryProperties = Type.Pick(messageFilesSchema, ['_id', 'message', 'conversation'])
export const messageFilesQuerySchema = Type.Intersect(
  [
    querySyntax(messageFilesQueryProperties),
    // Add additional query properties here
    Type.Object(
      {
        conversation: Type.Optional(Type.String()),
        message: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export type MessageFilesQuery = Static<typeof messageFilesQuerySchema>
export const messageFilesQueryValidator = getValidator(messageFilesQuerySchema, queryValidator)
export const messageFilesQueryResolver = resolve<MessageFilesQuery, HookContext<MessageFilesService>>({})
