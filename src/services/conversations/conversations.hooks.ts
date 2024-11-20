import { Conflict } from '@feathersjs/errors'
import { app } from '../../app'
import { HookContext } from '@feathersjs/feathers'

export const privateConversationExistHook = () => {
  return async (context: HookContext) => {
    const { members } = context.data

    // Validate `members` field
    if (!Array.isArray(members) || (members.length !== 2 && context.data.type == 'priavte')) {
      throw new Conflict('The "members" field must be an array of exactly two user IDs.')
    }

    // Ensure consistent ordering
    const sortedMembers = [...members].sort()

    // Check for existing conversation
    const convs = await app.service('conversations').find({
      query: { members: sortedMembers }
    })

    if (convs.total > 0 && context.data.type == 'private') {
      throw new Conflict('A conversation between these users already exists.')
    }
  }
}
export const setDefaultValues = () => {
  return async (context: HookContext) => {
    context.data.theme = { _id: 'basic', name: 'Basique' }
  }
}
