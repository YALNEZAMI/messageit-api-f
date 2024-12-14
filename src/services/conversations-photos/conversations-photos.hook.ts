import { HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

export const fileHook = () => {
  return async (context: HookContext): Promise<HookContext> => {
    const { data } = context

    if (!data || !data.file || !data.file.buffer) {
      throw new BadRequest('File is required')
    }

    const buffer = Buffer.from(data.file.buffer, 'base64')
    const originalname = data.file.originalname

    // Attach the decoded file to the context data
    context.data.file = { buffer, originalname }

    return context
  }
}
