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
    context.data.theme = {
      _id: 'basic',
      name: 'Basique',
      photo:
        'https://media.istockphoto.com/id/1153938533/fr/photo/abstrait-flou-fond-bleu-avec-double-exposition-de-bokeh-cercle-glitter-pour-l%C3%A9l%C3%A9ment-de.jpg?s=612x612&w=0&k=20&c=CjVwzz6s6wQFNRmNzWw5sIQpLzxvdAeG43ydsQnjWXM=',
      emoji: '👍'
    }
  }
}
