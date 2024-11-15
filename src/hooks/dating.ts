import { HookContext } from '@feathersjs/feathers'

const setTimestamps = () => {
  return async (context: HookContext) => {
    const now = new Date().toISOString()

    // Ajoutez createdAt lors de la création
    if (context.method === 'create') {
      context.data.createdAt = now
    }

    // Ajoutez ou mettez à jour updatedAt
    if (context.method === 'patch' || context.method === 'update' || context.method === 'create') {
      context.data.updatedAt = now
    }

    return context
  }
}
export const getDatingProperties = () => {
  return { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
}
export default setTimestamps
