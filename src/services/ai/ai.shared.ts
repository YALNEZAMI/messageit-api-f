// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Ai, AiData, AiPatch, AiQuery, AiService } from './ai.class'

export type { Ai, AiData, AiPatch, AiQuery }

export type AiClientService = Pick<AiService<Params<AiQuery>>, (typeof aiMethods)[number]>

export const aiPath = 'ai'

export const aiMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const aiClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(aiPath, connection.service(aiPath), {
    methods: aiMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [aiPath]: AiClientService
  }
}
