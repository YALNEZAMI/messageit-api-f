// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'
import ollama from 'ollama'
import axios from 'axios'

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
      if (message.type == 'notification') {
        res.push(message)
        continue
      }
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
    await this.geminiRequest('capital of france')

    let userMessage: any
    const conversation = await app.service('conversations').get(body.conversation, {
      ...params,
      query: {}
    })

    //handl ai conversations
    if (conversation.type == 'ai') {
      // const response = await ollama.chat({
      //   model: 'llama3:latest',
      //   messages: [{ role: 'user', content: body.text }]
      // })
      const req = await this.getContext(body, params)
      const aiResponse = await this.geminiRequest(req)
      //create user message
      userMessage = await super._create(body, params)
      userMessage.sender = await app.service('my-users').get(body.sender, {
        ...params,
        query: {}
      })
      //create ai response message
      let aiUser: any = await app.service('my-users')._find({
        ...params,
        query: {
          name: body.sender
        }
      })
      aiUser = aiUser.data[0]._id
      const aiMessage = await super.create(
        {
          ...body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          text: aiResponse,
          sender: aiUser
        },
        params
      )
      //set visibility
      await this.setVisibility(userMessage, conversation)
      await this.setVisibility(aiMessage, conversation)

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
  async getContext(body: any, params: any): Promise<string> {
    const messages = await super._find({
      ...params,
      query: {
        sender: body.sender,
        conversation: body.conversation,
        $limit: 20
      }
    })
    let res = 'Here is the context of the user conversation. <<\n'
    for (const msg of messages.data) {
      res += msg.text + '\n'
      res += 'at ' + msg.createdAt + '\n'
    }
    res += ' And the question is:' + body.text + '|n'
    res +=
      'if a link between the context and the question is revelent, answer based on context, answer directly otherwise'

    console.log('context', res)
    return res
  }
  async geminiRequest(promt: string) {
    // Your API key

    const GEMINI_KEY = process.env.GEMINI_KEY
    // API endpoint
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

    try {
      // Request payload
      const data = {
        contents: [
          {
            parts: [
              {
                text: promt
              }
            ]
          }
        ]
      }

      // Send POST request
      const response = await axios.post(`${endpoint}?key=${GEMINI_KEY}`, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Log the response data
      let content = response.data.candidates[0].content.parts[0].text
      return content
    } catch (error: any) {
      console.error('Error:', error.response ? error.response.data : error.message)
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
      //delete message visibility
      await app.service('message-visibility').remove(null, {
        query: {
          messageId: id.toString()
        }
      })
      //delete message recievings
      await app.service('message-recieving').remove(null, {
        query: {
          message: id.toString()
        }
      })
      //delete message seeings
      await app.service('message-seen').remove(null, {
        query: {
          message: id.toString()
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
