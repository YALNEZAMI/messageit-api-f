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
import { getDatingProperties } from '../../hooks/dating'

export type { Conversations, ConversationsData, ConversationsPatch, ConversationsQuery }

export interface ConversationsParams extends MongoDBAdapterParams<ConversationsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class ConversationsService<ServiceParams extends Params = ConversationsParams> extends MongoDBService<
  Conversations,
  ConversationsData,
  ConversationsParams,
  ConversationsPatch
> {
  async find(params: any): Promise<any> {
    const currentUserId = params.query.currentUserId
    return super.find({
      query: {
        $or: [
          {
            user1: currentUserId
          },
          {
            user2: currentUserId
          }
        ]
      }
    })
  }
  //TODO handle unfriend with conversation
  async create(data: any, params: ConversationsParams): Promise<any> {
    const exists = await this.find({
      query: {
        $or: [
          {
            user1: data?.user1,
            user2: data?.user2
          },
          {
            user1: data?.user2,
            user2: data?.user1
          }
        ]
      }
    })
    if (exists.total == 0) {
      const body: ConversationsData = {
        ...data,
        theme: {
          _id: 'basic',
          name: 'Basique'
        }
      }
      const creating = await super.create(body)
      await app.service('members').create({
        user: data.user1,
        conversation: creating._id.toString() as string,
        ...getDatingProperties()
      })
      await app.service('members').create({
        user: data.user2,
        conversation: creating._id.toString() as string,
        ...getDatingProperties()
      })
      return creating
    } else {
      return exists.data[0]
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations'))
  }
}
