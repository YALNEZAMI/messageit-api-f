import { HookContext } from '@feathersjs/feathers'
import { Forbidden } from '@feathersjs/errors'

export const validateMembership = () => {
  return async (context: HookContext) => {
    const idConv = context.path === 'conversations' ? context.id : context.params.query?.conversation
    if (typeof idConv !== 'string' || !idConv) {
      throw new Forbidden('Conversation id is required !')
    }
    await context.app.service('conversations').get(idConv, { user: context.params.user })
    return context
  }
}
