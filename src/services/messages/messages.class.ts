// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'
import ollama from 'ollama'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesPatch, MessagesQuery } from './messages.schema'
import { app } from '../../app'
import { conversations } from '../conversations/conversations'

export type { Messages, MessagesData, MessagesPatch, MessagesQuery }

export interface MessagesParams extends MongoDBAdapterParams<MessagesQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessagesService<ServiceParams extends Params = MessagesParams> extends MongoDBService<
  Messages,
  MessagesData,
  MessagesParams,
  MessagesPatch
> {
  async find(params: any): Promise<any> {
    const messages = await super._find(params)
    for (const message of messages.data) {
      if (message.sender._id) {
        message.sender = await app.service('my-users').get(message.sender._id)
      } else {
        message.sender = await app.service('my-users').get(message.sender)
      }
      message.conversation = await app.service('conversations').get(message.conversation)
    }

    return messages
  }
  async create(body: any, params: any): Promise<any> {
    const conversation = await app.service('conversations').get(body.conversation)
    if (conversation.type == 'ai') {
      const response = await ollama.chat({
        model: 'llama3:latest',
        messages: [{ role: 'user', content: body.text }]
      })
      //create user message
      const create = await super.create(body, params)
      create.sender = await app.service('my-users').get(body.sender)
      //create ai response message

      let aiUser = await app.service('my-users').find({
        query: {
          name: body.sender
        }
      })
      aiUser = aiUser[0]
      const aiMessage = await super.create(
        {
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          text: response.message.content,
          sender: aiUser
        },
        params
      )

      return {
        myMessage: create,
        aiMessage
      }
    } else {
      return await super.create(body, params)
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('messages'))
  }
}
