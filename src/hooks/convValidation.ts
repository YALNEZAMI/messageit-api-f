import { HookContext } from '@feathersjs/feathers'
import errors from '@feathersjs/errors'

export const validateMembership = () => {
  return async (context: HookContext) => {
    const idConv = context.params.query.conversation
    if (!idConv) {
      return context
    }
    const idUser = context.params.user._id.toString()
    const conv = await context.app.service('conversations').get(idConv)
    const isMember = conv.members.some((member: any) => member._id == idUser)

    if (!isMember) {
      console.log('User is not a member of the conversation.')
      throw new errors.Forbidden('You are not a member of this conversation.')
    }

    return context
  }
}
