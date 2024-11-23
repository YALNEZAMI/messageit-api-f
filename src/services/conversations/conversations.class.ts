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
import { getDatingProperties } from '../../hooks/dating'
import { app } from '../../app'
import { BadRequest } from '@feathersjs/errors'
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
    const currentUserId = params.query.currentUserId

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
    const convs = await this.populateConversations(result.data)

    return convs // Return the result with populated members
  }
  async get(id: any): Promise<any> {
    const conv = await super._get(id)

    const convs = await this.populateConversations([conv])
    return convs[0]
  }
  async populateConversations(conversations: any[]): Promise<any[]> {
    const convs = []
    for (let conv of conversations) {
      const members = []
      for (let mem of conv.members) {
        const user = await app.service('my-users').get(mem)
        members.push(user)
      }
      conv.members = members
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
      convs = await this.populateConversations(convs)
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
        name: body.members[0],
        theme: {
          _id: 'basic',
          name: 'Basique'
        },
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
    const conversation = await this.get(id)
    const currentUserId = params.query.currentUserId
    //delete conversation definitvely
    if (conversation.members.length == 1 && currentUserId == conversation.members[0]._id.toString()) {
      await app.service('messages').remove(null, {
        query: {
          conversation: conversation._id.toString()
        }
      })
      await super.remove(id)
    } else {
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
