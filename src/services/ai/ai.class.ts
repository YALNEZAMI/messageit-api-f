// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Ai, AiData, AiPatch, AiQuery } from './ai.schema'

import axios from 'axios'
import { app } from '../../app'
import { GoogleGenerativeAI } from '@google/generative-ai'
type ContentDto = { role: string; parts: { text: string } }
import { Content, GoogleGenAI } from '@google/genai'
import { ObjectId } from 'mongodb'

export type { Ai, AiData, AiPatch, AiQuery }

export interface AiParams extends MongoDBAdapterParams<AiQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AiService<ServiceParams extends Params = AiParams> extends MongoDBService<
  Ai,
  AiData,
  AiParams,
  AiPatch
> {
  apiKey = process.env.GEMINI_API_KEY
  ai = new GoogleGenAI({ apiKey: this.apiKey })

  async create(messageBody: any, params: any): Promise<any> {
    let userMessage: any = await app.service('messages').create(messageBody, params)
    const conversation = await app.service('conversations').get(messageBody.conversation, {
      ...params,
      query: {}
    })
    let aiUser: any = await app.service('my-users')._find({
      ...params,
      query: {
        name: messageBody.sender
      }
    })
    aiUser = aiUser.data[0]._id
    const aiMessage = await app.service('messages')._create(
      {
        ...messageBody,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        text: 'Analysing...',
        sender: aiUser
      },
      params
    )
    let aiResponse: any = 'Error'
    if (messageBody.files.length > 0) {
      aiResponse = await this.analyseMedias(messageBody.files, messageBody.text)
    } else {
      aiResponse = this.geminiRequest(messageBody, params, aiMessage)
    }

    userMessage.sender = await app.service('my-users').get(messageBody.sender, {
      ...params,
      query: {}
    })
    //set visibility
    await app.service('messages').setVisibility(aiMessage, conversation)
    await app.service('messages').setVisibility(userMessage, conversation)
    return { myMessage: userMessage, aiMessage }
  }
  async fileUrlToGenerativePart(url: string, mimeType: string) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return {
      inlineData: {
        data: Buffer.from(response.data).toString('base64'),
        mimeType
      }
    }
  }
  async getGeminiContents(messageBody: any, params: any): Promise<Content[]> {
    const messages = await app.service('messages')._find({
      ...params,
      query: {
        // sender: { $ne: messageBody.sender },
        conversation: messageBody.conversation,
        $sort: { createdAt: 1 },
        $limit: 20
      }
    })
    let res = [] as Content[]

    for (const msg of messages.data.reverse()) {
      const content: Content = {
        role: msg.sender == messageBody.sender ? 'user' : 'model',
        parts: [{ text: msg.text as string }]
      }
      res.push(content)
    }
    res.push({
      role: 'user',
      parts: [
        {
          text: messageBody.text as string
        }
      ]
    })
    return res
  }
  async analyseMedias(mediasPaths: any[], prompt: string): Promise<string> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    const imageParts = await Promise.all(
      mediasPaths.map(async (url: string) => {
        const ext = url.split('.').pop()
        const mimeType = 'image/' + (ext != 'jpg' ? ext : 'jpeg')
        return await this.fileUrlToGenerativePart(url, mimeType)
      })
    )

    const generatedContent = await model.generateContent([prompt, ...imageParts])
    const text = generatedContent.response.text()
    return text
  }
  async geminiRequest(messageBody: any, params: any, aiMessage: any): Promise<any> {
    const chat = this.ai.chats.create({
      model: 'gemini-2.5-flash',
      history: await this.getGeminiContents(messageBody, params)
    })
    const stream1 = await chat.sendMessageStream({
      message: messageBody.text as string
    })
    let aiResponse = ''
    for await (const chunk of stream1) {
      aiResponse += chunk.text

      app.service('messages')._patch(aiMessage._id.toString(), {
        text: aiResponse
      })

      app.service('ai').emit('created', {
        _id: new ObjectId().toString(),
        text: chunk.text,
        conversation: messageBody.conversation,
        user: messageBody.sender,
        aiUser: aiMessage.sender
      })
    }

    // return await chat.sendMessageStream({
    //   message: messageBody.text as string
    // })
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('ai'))
  }
}
