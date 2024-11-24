// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'
import ollama from 'ollama'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesPatch, MessagesQuery } from './messages.schema'
import { app } from '../../app'
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

    messages = await MessagesService.populateMessages(messages, params)
    return messages
  }
  static async populateMessages(messages: any[], params: any) {
    const res = []
    for (const message of messages) {
      //set refered message if exist
      if (message.referedMessage && message.referedMessage != '') {
        message.referedMessage = await app.service('messages').get(message.referedMessage)
        const sender = await app.service('my-users').get(message.referedMessage.sender, {
          ...params,
          query: {}
        })

        message.referedMessage.sender = sender

        // const populating = await populateMessages([message.referedMessage], params)
        // message.referedMessage = populating[0]
      }
      //set sender
      const sender = await app.service('my-users').get(message.sender, {
        ...params,
        query: {}
      })
      message.sender = sender
      //set conversation
      message.conversation = await app.service('conversations').get(message.conversation, {
        ...params,
        query: {}
      })
      res.push(message)
    }
    return res
  }
  async find(params: any): Promise<any> {
    if (params.query.key) {
      return await this.findByKey(params)
    }
    const currentUserId = params.user._id.toString()

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

    params.query = {
      _id: { $in: visibileMessagesIds },
      ...params.query
    }
    const messages = await super.find(params)
    //populate sender object
    messages.data = await MessagesService.populateMessages(messages.data, params)
    return messages
  }
  async create(body: any, params: any): Promise<any> {
    let userMessage: any
    const conversation = await app.service('conversations').get(body.conversation, {
      ...params,
      query: {}
    })

    //handl ai conversations
    if (conversation.type == 'ai') {
      const response = await ollama.chat({
        model: 'llama3:latest',
        messages: [{ role: 'user', content: body.text }]
      })
      //create user message
      userMessage = await super._create(body, params)
      userMessage.sender = await app.service('my-users').get(body.sender, {
        ...params,
        query: {}
      })
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
      userMessage = await super._create(body, params)
      //set visibility
      await this.setVisibility(userMessage, conversation)
      const populating = await MessagesService.populateMessages([userMessage], params)
      userMessage = populating[0]
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

    if (id) {
      //delete message case
      await app.service('message-visibility').remove(null, {
        query: {
          messageId: id.toString()
        }
      })
    } else if (convId) {
      //delete conversation case
      await app.service('message-visibility').remove(null, {
        query: {
          conversationId: convId
        }
      })
    }

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
