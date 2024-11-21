import { Conflict } from '@feathersjs/errors'
import { app } from '../../app'
import { HookContext } from '@feathersjs/feathers'

export const privateConversationExistHook = () => {
  return async (context: HookContext) => {
    const { members } = context.data

    // Validate `type` field
    if (context.data.type != 'private' && context.data.type != 'group' && context.data.type != 'ai') {
      throw new Conflict('The field "type" can be only "private","group" or "ai"')
    }

    // Validate `members` field
    if (!Array.isArray(members) || (members.length !== 2 && context.data.type == 'priavte')) {
      throw new Conflict(
        'The "members" field must be an array of exactly two user IDs in private conversations.'
      )
    }
  }
}
export const setDefaultValues = () => {
  return async (context: HookContext) => {
    context.data.theme = { _id: 'basic', name: 'Basique' }
  }
}
