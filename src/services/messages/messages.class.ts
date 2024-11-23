// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'
import ollama from 'ollama'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesPatch, MessagesQuery } from './messages.schema'
import { app } from '../../app'
import { conversations } from '../conversations/conversations'
import { ObjectId } from 'mongodb'

export type { Messages, MessagesData, MessagesPatch, MessagesQuery }

export interface MessagesParams extends MongoDBAdapterParams<MessagesQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class MessagesService<ServiceParams extends Params = MessagesParams> extends MongoDBService<
  Messages,
  MessagesData,
  MessagesParams,
  MessagesPatch
> {
  async findByKey(params: any): Promise<any> {
    const key = params.query.key
    const conversationId = params.query.conversation
    let messages: any = await super.find({
      query: {
        conversation: conversationId
      },
      paginate: false
    })
    messages = messages.filter((msg: any) => {
      return msg.text.includes(key)
    })

    messages = await this.populateMessages(messages)
    return messages
  }
  async populateMessages(messages: any[]) {
    for (const message of messages) {
      message.sender = await app.service('my-users').get(message.sender)
      message.conversation = await app.service('conversations').get(message.conversation)
    }
    return messages
  }
  async find(params: any): Promise<any> {
    if (params.query.key) {
      return await this.findByKey(params)
    }
    const currentUserId = params.query.currentUserId
    if (!currentUserId) {
      return []
    }
    //filter deleted not visible messages(deleted,sent when user had left for a moment)
    const visibileMessages: any = await app.service('message-visibility').find({
      query: {
        userId: currentUserId,
        conversationId: params.query.conversation
      } as any,
      paginate: false
    })
    const visibileMessagesIds = visibileMessages.map((v: any) => {
      return new ObjectId(v.messageId)
    })
    //currentUserId not needed anymore
    delete params.query.currentUserId
    params.query = {
      _id: { $in: visibileMessagesIds },
      ...params.query
    }
    const messages = await super.find(params)
    //populate sender object
    messages.data = await this.populateMessages(messages.data)
    return messages
  }
  async create(body: any, params: any): Promise<any> {
    let userMessage: any
    const conversation = await app.service('conversations').get(body.conversation)

    //handl ai conversations
    if (conversation.type == 'ai') {
      const response = await ollama.chat({
        model: 'llama3:latest',
        messages: [{ role: 'user', content: body.text }]
      })
      //create user message
      userMessage = await super.create(body, params)
      userMessage.sender = await app.service('my-users').get(body.sender)
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
      //set visibility
      await this.setVisibility(userMessage, conversation)

      return {
        myMessage: userMessage,
        aiMessage
      }
    } else {
      userMessage = await super.create(body, params)
      //set visibility
      await this.setVisibility(userMessage, conversation)
      return userMessage
    }
  }
  async setVisibility(message: any, conversation: any) {
    //set visibility
    for (const member of conversation.members) {
      const visibility = {
        userId: member._id.toString(),
        messageId: message._id.toString(),
        conversationId: message.conversation
      }

      await app.service('message-visibility').create(visibility)
    }
  }
  async remove(id: any, params: any): Promise<any> {
    const convId = params.query.conversation
    await app.service('message-visibility').remove(null, {
      query: {
        conversationId: convId
      }
    })

    return await super.remove(id, params)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('messages')),
    multi: ['remove'] // Enable bulk removal
  }
}
