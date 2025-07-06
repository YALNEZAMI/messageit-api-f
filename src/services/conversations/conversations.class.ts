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
  async find(params: any): Promise<any> {
    if (!params.user) {
      return []
    }
    const currentUserId = params.user._id.toString()

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
            return conv.name.toLowerCase().trim().includes(key)
          case 'private':
            const otherUser = conv.members.find((member: any) => {
              return member._id.toString() != currentUserId
            })
            if (otherUser) {
              return otherUser.name.trim().includes(key)
            } else {
              return false
            }
          default:
            return false
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
          // text: { $ne: '' }
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
      if (convs.length != 0) {
        return convs[0]
      }
    }
    const env = process.env
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
        image: env.UI_URL + '/images-ui/robot.png'
      } as any)
      //push it to covnersation members
      body.members.push(aiUser._id.toString())
    }

    //and finally create and return the new conversation
    const convResult = await super._create(body)

    //create Group rights
    if (body.type == 'group') {
      const rights = {
        conversation: convResult._id.toString(),
        admins: [],
        chef: params.user._id.toString()
      }
      await app.service('group-rights').create(rights)
    }
    app.service('conversations').emit('create', convResult)
    return convResult
  }
  async remove(id: any, params: any): Promise<any> {
    const conversation = await this.get(id, params)
    const currentUserId = params.user._id.toString()
    //delete conversation definitvely
    //check rights and operation nature
    if (
      (conversation.members.length == 1 && currentUserId == conversation.members[0]._id.toString()) || //last member
      (conversation.type == 'ai' &&
        (currentUserId == conversation.members[0]._id.toString() ||
          currentUserId == conversation.members[1]._id.toString())) //ai conv
    ) {
      await app.service('messages').removeConversation(id, params)
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
      //delete rights
      await app.service('group-rights').remove(null, {
        query: { conversation: id.toString() }
      })
      await super.remove(id)
    } else {
      //member leaving
      //create notification
      await app.service('messages').createNotification(id, 'a quitté la conversation.', params)

      //hide messages for leaver
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
    return conversation
  }
  async patch(id: any, body: any, params: any): Promise<any> {
    const member = params.query.member
    const currentUserId = params.user._id.toString()
    const conv = await super._get(id)
    //check memberShip
    const isMember = conv.members.includes(currentUserId)
    if (!isMember) {
      return {
        status: 400,
        message: "You don't have rights to update conversation."
      }
    }
    //theme notification
    if (body.theme && body.theme.name != conv.theme.name) {
      //create notification
      await app
        .service('messages')
        .createNotification(id, ` a changé le theme de ${conv.theme.name + ' à ' + body.theme.name}.`, params)
    }
    //group
    if (conv.type == 'group') {
      const rightsReq = await app.service('group-rights').find({
        query: {
          conversation: id
        }
      })
      const rights = rightsReq.data[0]
      //toogle membership
      //if no rights return
      if (rights.chef != currentUserId && rights.admins.includes(currentUserId)) {
        return {
          status: 400,
          message: "You don't have rights to update conversation."
        }
      }
      //changing name notification
      if (body.name && body.name != conv.name) {
        //create notification
        await app
          .service('messages')
          .createNotification(id, ` a changé le nom de ${conv.name + ' à ' + body.name}.`, params)
      }
      //if membership operation
      if (member) {
        const memberObject = await app.service('my-users')._get(member)

        if (conv.members.includes(member)) {
          //removing member
          conv.members = conv.members.filter((mem) => {
            return mem != member
          })
          //create notification
          await app.service('messages').createNotification(id, `a supprimé ${memberObject.name}.`, params)
        } else {
          //adding member
          conv.members.push(member)
          //create notification
          await app.service('messages').createNotification(id, `a ajouté ${memberObject.name}.`, params)
        }
      }
      //update members
      body.members = conv.members
      await super._patch(id, body, {
        ...params,
        query: {}
      })
      return this.get(id, {
        ...params,
        query: {}
      })
    } else {
      //else than group
      await super._patch(id, body, {
        ...params,
        query: {}
      })
      return this.get(id, {
        ...params,
        query: {}
      })
    }
  }
}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('conversations'))
  }
}
