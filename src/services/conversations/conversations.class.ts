// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  Conversations,
  ConversationsData,
  ConversationsPatch,
  ConversationsQuery
} from './conversations.schema'
import { app } from '../../app'
import { ObjectId } from 'mongodb'

export type { Conversations, ConversationsData, ConversationsPatch, ConversationsQuery }

export interface ConversationsParams extends MongoDBAdapterParams<ConversationsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ConversationsService<ServiceParams extends Params = ConversationsParams> extends MongoDBService<
  Conversations,
  ConversationsData,
  ConversationsParams,
  ConversationsPatch
> {
  // TODO: Handle additional functionalities like unfriend logic
  async find(params: any): Promise<any> {
    const currentUserId = params.user._id.toString()
    if (!currentUserId) {
      return []
    }
    const pipeline = [
      {
        $match: { members: currentUserId } // Match conversations where the currentUserId is in the members array
      }
    ]

    // Run the aggregation pipeline
    const result = await super._find({
      query: {}, // No need to specify a query here, as the pipeline handles the filtering
      paginate: params.paginate, // Pass the pagination parameters
      pipeline: pipeline // Pass the aggregation pipeline
    })
    let convs = await this.populateConversations(result.data, params)
    const keyQuery = params.query.key
    if (keyQuery) {
      const key: string = keyQuery.toLowerCase().trim()
      convs = convs.filter((conv) => {
        switch (conv.type) {
          case 'ai':
            return 'assistant boby ai'.toLowerCase().includes(key)
          case 'group':
            return conv.name.toLowerCase().includes(key)
          case 'private':
            const otherUser = conv.members.find((member: any) => {
              return member._id.toString() != currentUserId
            })
            if (otherUser) {
              return otherUser.name.includes(key)
            } else {
              return false
            }
          default:
            return false

            break
        }
      })
    }
    //sort with last message creation date
    convs = convs.sort((conv1, conv2) => {
      // Get the timestamp of the last message or the conversation creation date as fallback
      const date1 = conv1.lastMessage?.createdAt
        ? new Date(conv1.lastMessage.createdAt).getTime()
        : new Date(conv1.createdAt).getTime()
      const date2 = conv2.lastMessage?.createdAt
        ? new Date(conv2.lastMessage.createdAt).getTime()
        : new Date(conv2.createdAt).getTime()

      // Sort in descending order (newest to oldest)
      return date2 - date1
    })

    return convs // Return the result with populated members
  }
  async get(id: any, params: any): Promise<any> {
    const conv = await super._get(id)

    const convs = await this.populateConversations([conv], params)
    return convs[0]
  }
  async populateConversations(conversations: any[], params: any): Promise<any[]> {
    const convs = []
    for (let conv of conversations) {
      //set members
      const members = []
      for (let mem of conv.members) {
        const user = await app.service('my-users').get(mem, {
          ...params,
          query: {}
        })
        members.push(user)
      }
      conv.members = members
      //set last Message

      const message = await app.service('messages')._find({
        ...params,
        query: {
          $sort: { createdAt: -1 },
          conversation: conv._id.toString(),
          $limit: 1
        }
      })
      if (message.total > 0) {
        conv.lastMessage = message.data[0]
        conv.lastMessage.sender = await app.service('my-users').get(conv.lastMessage.sender, {
          ...params,
          query: {}
        })
      }
      convs.push(conv)
    }
    return convs
  }
  async create(body: any, params: any): Promise<any> {
    // Check for existing conversation
    if (body.type == 'private') {
      let convs = await app.service('conversations')._find({
        query: { type: 'private' },
        paginate: false
      })
      const { members } = body
      convs = convs.filter((conv: any) => {
        return (
          (conv.members[0] == members[0] && conv.members[1] == members[1]) ||
          (conv.members[0] == members[1] && conv.members[1] == members[0])
        )
      })
      convs = await this.populateConversations(convs, params)
      if (convs.length != 0 && body.type == 'private') {
        return convs[0]
      }
    }

    //set default image
    body.image = 'https://cdn.pixabay.com/photo/2012/04/13/21/07/user-33638_640.png'
    //handle ai conversation case
    if (body.type == 'ai') {
      //check if already exist
      const existingConv: any = await super.find({
        paginate: false,
        query: {
          type: 'ai',
          name: body.members[0]
        } as any
      })
      //if exists return it
      if (existingConv.length != 0) {
        return existingConv[0]
      }
      //if doesnt exist create a user representing the ai
      const aiUser = await app.service('my-users').create({
        _id: new ObjectId(),
        name: body.members[0],
        theme: {
          _id: 'basic',
          name: 'Basique'
        },
        aiUser: true,
        onLine: true,
        lastConnection: new Date().toISOString(),
        email: 'ai@ai.ai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        image: 'https://cdn.pixabay.com/photo/2014/04/03/11/55/robot-312566_1280.png'
      } as any)
      //push it to covnersation members
      body.members.push(aiUser._id.toString())
    }
    //and finally create and return the new conversation
    return await super._create(body)
  }
  async remove(id: any, params: any): Promise<any> {
    const conversation = await this.get(id, params)
    const currentUserId = params.user._id.toString()
    //delete conversation definitvely
    //check rights and operation nature
    if (
      (conversation.members.length == 1 && currentUserId == conversation.members[0]._id.toString()) ||
      (conversation.type == 'ai' &&
        (currentUserId == conversation.members[0]._id.toString() ||
          currentUserId == conversation.members[1]._id.toString()))
    ) {
      await app.service('messages').remove(null, {
        query: {
          conversation: conversation._id.toString()
        }
      })
      //delete conversation case
      await app.service('message-visibility').remove(null, {
        query: {
          conversationId: id.toString()
        }
      })
      //delete message recievings
      await app.service('message-recieving').remove(null, {
        query: {
          conversation: id.toString()
        }
      })
      //delete message seeings
      await app.service('message-seen').remove(null, {
        query: {
          conversation: id.toString()
        }
      })
      await super.remove(id)
    } else {
      //leaving conversation
      await app.service('message-visibility').remove(null, {
        query: {
          conversationId: conversation._id.toString(),
          userId: currentUserId
        }
      })
      await super.patch(id, {
        $pull: {
          members: currentUserId // Remove the member with `_id: "2"`
        }
      } as any)
    }
    return await conversation
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations'))
  }
}
