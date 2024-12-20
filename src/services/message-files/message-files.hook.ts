import { HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

export const fileHook = () => {
  return async (context: HookContext): Promise<HookContext> => {
    console.log('hookbeging')
    const treatedFiles = []
    for (const file of context.data.files) {
      if (!context.data || !file || !file.buffer) {
        throw new BadRequest('File is required')
      }

      const buffer = Buffer.from(file.buffer, 'base64')
      const originalname = file.originalname

      // Attach the decoded file to the context data
      treatedFiles.push({ buffer, originalname })
    }
    context.data.files = treatedFiles
    return context
  }
}
