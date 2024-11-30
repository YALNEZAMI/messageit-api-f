// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Emojis, EmojisData, EmojisPatch, EmojisQuery, EmojisService } from './emojis.class'

export type { Emojis, EmojisData, EmojisPatch, EmojisQuery }

export type EmojisClientService = Pick<EmojisService<Params<EmojisQuery>>, (typeof emojisMethods)[number]>

export const emojisPath = 'emojis'

export const emojisMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const emojisClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(emojisPath, connection.service(emojisPath), {
    methods: emojisMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [emojisPath]: EmojisClientService
  }
}
