// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Messages, MessagesData, MessagesPatch, MessagesQuery } from './messages.schema'
import { app } from '../../app'
import { ObjectId } from 'mongodb'
import fs from 'fs'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({})

export type { Messages, MessagesData, MessagesPatch, MessagesQuery }

export interface MessagesParams extends MongoDBAdapterParams<MessagesQuery> {}
// Converts local file information to base64

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
      if (!msg.text) return false
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
        message.referedMessage = await app
          .service('messages')
          .get(message.referedMessage, { ...params, query: { conversation: message.conversation } })
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

    let userMessage: any = await super._create(messageBody, params)
    const conversation = await app.service('conversations').get(messageBody.conversation, {
      ...params,
      query: {}
    })
    //set visibility
    await this.setVisibility(userMessage, conversation)
    const populating = await MessagesService.populateMessages([userMessage], params)
    userMessage = populating[0]

    //handle files
    if (messageBody.files != undefined && messageBody.files.length > 0) {
      const res = await app.service('message-files').create(
        {
          conversation: messageBody.conversation,
          message: userMessage._id.toString(),
          urls: messageBody.files
        },
        params
      )
    }

    return userMessage
  }

  //@param message : the message to be visible
  //@param conversation: message will be visible for current conversation members
  async setVisibility(message: any, conversation: any) {
    //set visibility
    for (const member of conversation.members) {
      const visibility = {
        userId: member._id.toString(),
        messageId: message._id.toString(),
        conversationId: conversation._id.toString()
      }
      // console.log('visibl', visibility)
      await app.service('message-visibility').create(visibility)
    }
  }
  async removeConversation(idConv: string, params: any) {
    const messages = await super.find({
      query: {
        conversation: idConv
      }
    })
    for (const msg of messages.data) {
      await this.deleteFiles(msg._id as string)

      // //delete message visibility
      // await app.service('message-visibility').remove(null, {
      //   query: {
      //     messageId: msg._id.toString()
      //   }
      // })
      // //delete message recievings
      // await app.service('message-recieving').remove(null, {
      //   query: {
      //     message: msg._id.toString()
      //   }
      // })
      // //delete message seeings
      // await app.service('message-seen').remove(null, {
      //   query: {
      //     message: msg._id.toString()
      //   }
      // })
      await super.remove(msg._id.toString(), params)
    }
    return {
      status: 200,
      message: 'All messages have been deleted successfully.'
    }
  }
  async remove(id: any, params: any): Promise<any> {
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
  async deleteFiles(msgId: string): Promise<void> {
    const messageId = msgId.toString()
    const messageFiles = await app.service('message-files').find({
      query: {
        message: messageId
      }
    })
    if (messageFiles.data.length == 0) {
      return
    }
    //delete files relative to message from db
    await app.service('message-files').remove(null, {
      query: {
        message: msgId
      }
    })

    //delete files from server
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
        updatedAt: new Date().toISOString(),

        type: 'notification'
      },
      {
        ...params,
        query: {}
      }
    )
    const message = await this.get(notif._id.toString(), {
      ...params,
      query: { conversation: conversationId }
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
  async patch(id: any, body: any, params: any): Promise<any> {
    const currentUserId = params.user._id.toString()

    const msg = await this.get(id, params)
    //check if notTransfered and not already modified
    if (msg.transfered || msg.originalText != undefined) {
      return {
        status: 500,
        message: 'Impossible de modifier un message transféré.'
      }
    }
    //check if notSeen
    const seen = await app.service('message-seen').find({
      query: {
        message: id,
        viewer: { $ne: currentUserId }
      }
    })
    if (seen.total > 0) {
      return {
        status: 500,
        message: 'Impossible de modifier un message déjà vu par un autre membre.'
      }
    }

    body.originalText = msg.text
    await super.patch(id, body, params)
    return await this.get(id, params)
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('messages')),
    multi: ['remove'] // Enable bulk removal
  }
}
