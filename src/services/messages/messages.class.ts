// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'
import axios from 'axios'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesPatch, MessagesQuery } from './messages.schema'
import { app } from '../../app'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { BadRequest } from '@feathersjs/errors'
import path from 'path'

export type { Messages, MessagesData, MessagesPatch, MessagesQuery }

export interface MessagesParams extends MongoDBAdapterParams<MessagesQuery> {}
type ContentDto = { role: string; parts: { text: string } }
// Converts local file information to base64
function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'),
      mimeType
    }
  }
}
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
      return msg.text.toLowerCase().trim().includes(key.toLowerCase().trim())
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
  async create(messageBody: any, params: any): Promise<any> {
    //handle empty msg
    if (!messageBody.text && messageBody.files.length == 0) {
      return messageBody
    }
    //handle files
    if (messageBody.files != undefined && messageBody.files.length > 0) {
      console.log('ther are files')
      const filesHandling = await this.handleFiles(messageBody, params)
      console.log('filesHandling', filesHandling)
    }

    let userMessage: any
    const conversation = await app.service('conversations').get(messageBody.conversation, {
      ...params,
      query: {}
    })

    //handl ai conversations
    if (conversation.type == 'ai') {
      console.log('3')
      const aiResponse = await this.geminiRequest(messageBody, params)
      //create user message
      userMessage = await super._create(messageBody, params)
      userMessage.sender = await app.service('my-users').get(messageBody.sender, {
        ...params,
        query: {}
      })
      //create ai response message
      let aiUser: any = await app.service('my-users')._find({
        ...params,
        query: {
          name: messageBody.sender
        }
      })
      aiUser = aiUser.data[0]._id
      const aiMessage = await super.create(
        {
          ...messageBody,
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
      console.log('not ai message create')
      userMessage = await super._create(messageBody, params)

      //set visibility
      await this.setVisibility(userMessage, conversation)
      const populating = await MessagesService.populateMessages([userMessage], params)
      userMessage = populating[0]
      console.log('10')
      return userMessage
    }
  }
  async handleFiles(
    messageBody: any,
    params: any
  ): Promise<{
    urls: string[]
    temporaryMessageId: string
  }> {
    console.log('create messagefiles')
    if (!messageBody.files) {
      throw new BadRequest('No file provided')
    }
    const urls = []
    let message = new ObjectId().toString()
    for (const file of messageBody.files) {
      if (!file) {
        continue
      }
      const { buffer, originalname } = file
      const uploadsDir = path.join(__dirname, '..', '..', '..', 'public', 'messageFiles')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      let extSplit = originalname.split('.')
      const ext = extSplit[extSplit.length - 1]
      const finalFileName = `${message}-${originalname}.${ext}`
      const filePath = path.join(uploadsDir, finalFileName)

      // Write the file buffer to disk
      fs.writeFileSync(filePath, buffer)
      //set my-users image
      const port = app.get('port')
      const host = app.get('host')
      const devMode = process.env.DEV_MODE
      const url =
        devMode === 'true'
          ? `http://${host}:${port}/messageFiles/${finalFileName}`
          : `https://${host}:${port}/messageFiles/${finalFileName}`
      urls.push(url)
    }
    const messageObject = await app.service('messages')._get(message)
    const messageFiles = await app.service('message-files')._create({
      conversation: messageObject.conversation,
      message,
      urls
    })
    return { urls, temporaryMessageId: message }
  }
  async getGeminiContents(messageBody: any, params: any): Promise<ContentDto[]> {
    const messages = await super._find({
      ...params,
      query: {
        // sender: { $ne: messageBody.sender },
        conversation: messageBody.conversation,
        $sort: { createdAt: 1 },
        $limit: 20
      }
    })
    let res = []

    for (const msg of messages.data.reverse()) {
      res.push({
        role: msg.sender == messageBody.sender ? 'user' : 'model',
        parts: {
          text: msg.text as string
        }
      })
    }
    res.push({
      role: 'user',
      parts: {
        text: messageBody.text as string
      }
    })
    return res
  }
  async analyseMedias(mediasPaths: any[], prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const imageParts: any[] = []
    mediasPaths.map((path: string) => {
      const split = path.split('.')
      const ext = split[split.length - 1]
      const mimeType = 'image/' + (ext != 'jpg' ? ext : 'jpeg')
      imageParts.push(fileToGenerativePart(path, mimeType))
    })

    const generatedContent = await model.generateContent([prompt, ...imageParts])
    const text = generatedContent.response.text()
    console.log(text)
    return text
  }
  async geminiRequest(messageBody: any, params: any) {
    // Your API key

    const GEMINI_KEY = process.env.GEMINI_KEY
    // API endpoint
    const endpoint =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent'

    try {
      // Request payload
      const data = {
        contents: await this.getGeminiContents(messageBody, params)
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
  //@param message : the message to be visible
  //@param conversation: message will be visible for current conversation members
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
    if (convId) {
      const messages = await super.find({
        query: {
          conversation: convId
        }
      })
      for (const msg of messages.data) {
        //delete message visibility
        await app.service('message-visibility').remove(null, {
          query: {
            messageId: msg._id.toString()
          }
        })
        //delete message recievings
        await app.service('message-recieving').remove(null, {
          query: {
            message: msg._id.toString()
          }
        })
        //delete message seeings
        await app.service('message-seen').remove(null, {
          query: {
            message: msg._id.toString()
          }
        })
        await super.remove(msg._id.toString(), params)
      }
      return {
        status: 200,
        message: 'All messages have been deleted successfully.'
      }
    } else {
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
      //delete files related to message
      await this.deleteFiles(id)
      return await super.remove(id, params)
    }
  }
  async deleteFiles(msgId: string): Promise<void> {
    const messageFiles = await app.service('message-files').find({
      query: {
        message: msgId.toString()
      }
    })
    //delete files relative to message from db
    await app.service('message-files').remove(null, {
      query: {
        message: msgId
      }
    })

    if (messageFiles.data.length == 0) {
      return
    }
    for (const record of messageFiles.data[0].urls!) {
      const urlSplit = record.split('/')
      const photoName = urlSplit[urlSplit.length - 1]
      fs.access('public/messageFiles/' + photoName, fs.constants.F_OK, (err) => {
        if (err) {
          // Handle the case where the file does not exist
        } else {
          fs.unlink('public/messageFiles/' + photoName, (err) => {
            if (err) {
              console.error(err)
            }
          })
        }
      })
    }
  }
  async createNotification(conversationId: string, content: string, params: any) {
    //create a notification for members

    const currentUserId = params?.user._id.toString() as string
    const updater = await app.service('my-users').get(currentUserId, { ...params, query: {} })

    const notif = await app.service('messages')._create(
      {
        conversation: conversationId,
        text: `${updater.name + content}`,
        createdAt: new Date().toISOString(),
        type: 'notification'
      },
      {
        ...params,
        query: {}
      }
    )
    const message = await this.get(notif._id.toString(), {
      ...params,
      query: {}
    })
    app.service('messages').emit('created', message)
    const conv = await app.service('conversations').get(conversationId, params)
    //set notification visibility for current members
    for (const member of conv.members) {
      await app.service('message-visibility').create({
        userId: member._id.toString(),
        messageId: notif._id.toString(),
        conversationId: notif.conversation
      })
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('messages')),
    multi: ['remove'] // Enable bulk removal
  }
}
