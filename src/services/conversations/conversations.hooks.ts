import { Conflict, Forbidden } from '@feathersjs/errors'
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
    if (!Array.isArray(members) || (members.length !== 2 && context.data.type === 'private')) {
      throw new Conflict(
        'The "members" field must be an array of exactly two user IDs in private conversations.'
      )
    }
    const userId = context.params.user?._id?.toString()
    if (!userId || !members.includes(userId)) {
      throw new Forbidden('You must be a member of the conversation.')
    }
    if (context.data.type === 'ai') {
      if (members.length !== 1) throw new Conflict('An assistant conversation must have one user.')
      context.data.name = userId
    }
  }
}
export const setDefaultValues = () => {
  const baseImageUrl = process.env.UI_URL + '/images-ui/'
  return async (context: HookContext) => {
    let image = baseImageUrl + 'user.png'
    if (context.data.type == 'ai') {
      image = baseImageUrl + 'robot.png'
    } else if (context.data.type == 'group') {
      image = baseImageUrl + 'group.png'
    }
    context.data.image = image
    context.data.theme = {
      _id: 'basic',
      name: 'Basique',
      photo: baseImageUrl + 'themes/basic.png',
      emoji: '👍'
    }
  }
}
