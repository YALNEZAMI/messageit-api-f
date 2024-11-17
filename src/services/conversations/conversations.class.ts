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

    // Construct the aggregation pipeline
    const pipeline = [
      {
        $match: { members: currentUserId } // Match conversations where the currentUserId is in the members array
      },
      {
        $lookup: {
          from: 'my-users', // Name of the collection to join (my-users)
          localField: 'members', // Field in the conversations collection
          foreignField: '_id', // Field in the my-users collection
          as: 'membersDetails' // Alias for the populated members data
        }
      },
      {
        $unwind: {
          path: '$membersDetails', // Flatten the membersDetails array
          preserveNullAndEmptyArrays: true // Keep the conversation even if there are no matching users
        }
      }
    ]

    // Run the aggregation pipeline
    const result = await super._find({
      query: {}, // No need to specify a query here, as the pipeline handles the filtering
      paginate: params.paginate, // Pass the pagination parameters
      pipeline: pipeline // Pass the aggregation pipeline
    })
    const myConversation = []
    for (const conversation of result.data) {
      const members = []
      for (const member of conversation.members) {
        const user = await app.service('my-users').get(member)
        members.push(user)
      }
      conversation.members = members
      myConversation.push(conversation)
    }

    return myConversation // Return the result with populated members
  }
  async get(id: any, params: any): Promise<any> {
    const conv = await super._get(id)
    const members = []
    for (const mem of conv.members) {
      const user = await app.service('my-users').get(mem)
      members.push(user)
    }
    conv.members = members
    return conv
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations'))
  }
}
