import type { HookContext } from '../declarations'
import { BadRequest, Forbidden } from '@feathersjs/errors'

export const authorizeMessage = () => async (context: HookContext) => {
  const userId = context.params.user?._id?.toString()
  if (!userId) throw new Forbidden('Authentication is required.')

  const query = context.params.query || (context.params.query = {})
  let conversationId: string
  if (context.method === 'find') {
    if (typeof query.conversation !== 'string' || !query.conversation) {
      throw new Forbidden('Conversation id is required.')
    }
    conversationId = query.conversation
  } else if (context.method === 'create') {
    if (Array.isArray(context.data) || typeof context.data?.conversation !== 'string') {
      throw new BadRequest('A single message and its conversation are required.')
    }
    conversationId = context.data.conversation
    if (query.conversation !== undefined && query.conversation !== conversationId) {
      throw new Forbidden('Conversation does not match the message.')
    }
    if (context.data.type !== 'message') throw new Forbidden('Invalid message type.')
    context.data.sender = userId
  } else {
    if (context.id == null) throw new Forbidden('A message id is required.')
    const message = await context.app.service('messages')._get(context.id)
    conversationId = message.conversation
    if (typeof conversationId !== 'string' || (query.conversation !== undefined && query.conversation !== conversationId)) {
      throw new Forbidden('Conversation does not match the message.')
    }
    if ((context.method === 'patch' || context.method === 'remove') && String(message.sender) !== userId) {
      throw new Forbidden('Only the author can modify or delete this message.')
    }
    if (context.method === 'patch' && Object.keys(context.data).some((key) => key !== 'text')) {
      throw new Forbidden('Only message text can be modified.')
    }
  }
  await context.app.service('conversations').get(conversationId, { user: context.params.user })
  if (context.method === 'create' && context.data.referedMessage) {
    if (typeof context.data.referedMessage !== 'string') throw new BadRequest('Invalid referenced message.')
    const referenced = await context.app.service('messages')._get(context.data.referedMessage)
    if (referenced.conversation !== conversationId) {
      throw new Forbidden('Referenced message belongs to another conversation.')
    }
  }
  query.conversation = conversationId
  return context
}
