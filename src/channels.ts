// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import type { RealTimeConnection, Params } from '@feathersjs/feathers'
import type { AuthenticationResult } from '@feathersjs/authentication'
import '@feathersjs/transport-commons'
import type { Application, HookContext } from './declarations'
import { logger } from './logger'

export const channels = (app: Application) => {
  logger.warn(
    'Publishing all events to all authenticated users. See `channels.ts` and https://dove.feathersjs.com/api/channels.html for more information.'
  )

  app.on('connection', (connection: RealTimeConnection) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection)
  })

  //set user offline
  app.on('disconnect', async (connection: RealTimeConnection) => {
    app.channel('anonymous').leave(connection)
    // On a new real-time connection, add it to the anonymous channel
    const user = await app.service('my-users')._patch(connection.user._id.toString(), {
      onLine: false,
      lastConnection: new Date().toISOString()
    })
    app.service('my-users').emit('patched', user)
  })

  app.on('login', async (authResult: AuthenticationResult, { connection }: Params) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      const user = await app.service('my-users')._patch(connection.user._id.toString(), {
        onLine: true,
        lastConnection: new Date().toISOString()
      })

      app.service('my-users').emit('patched', user)

      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection)
      app.channel('userId=' + connection.user._id.toString()).join(connection)
      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection)
    }
  })
  // In your server code, make sure `publish` method is correctly configured

  // })
  // eslint-disable-next-line no-unused-vars
  app.service('friend-requests').publish((data: any, hook: HookContext) => {
    //  const crudMaker = hook.arguments[1].user
    return app.channel('userId=' + data.recipient)
  })
  app.service('friends').publish((data: any, hook: HookContext) => {
    //  const crudMaker = hook.arguments[1].user
    return [app.channel('userId=' + data.sender), app.channel('userId=' + data.recipient)]
  })
  //publish conversations to members
  app.service('conversations').publish((data: any, hook: HookContext) => {
    const res: any = []
    for (const member of data.members) {
      member._id != undefined
        ? res.push(app.channel('userId=' + member._id.toString()))
        : res.push(app.channel('userId=' + member))
    }
    if (hook.params.query.member) {
      res.push(app.channel('userId=' + hook.params.query.member))
    }
    return res
  })
  //publish users update to its friends
  app.service('my-users').publish(async (data: any, hook: HookContext) => {
    const friends = await app.service('friends').find({
      query: {
        id: data._id.toString()
      }
    })
    const res: any = []
    for (const fr of friends) {
      res.push(app.channel('userId=' + fr._id.toString()))
    }
    //and conversations memebers
    const convs = await app.service('conversations').find({
      ...hook.params,
      query: {}
    })
    for (const conv of convs) {
      for (const mem of conv.members) {
        res.push(app.channel('userId=' + mem._id.toString()))
      }
    }
    return res
  })
  app.service('messages').publish(async (message: any, hook: HookContext) => {
    let conv = message.conversation
    if (!conv._id) {
      conv = await app.service('conversations').get(conv, hook.params)
    }
    const res: any = []
    for (const member of conv.members) {
      res.push(app.channel('userId=' + member._id.toString()))
    }
    return res
  })
  app.service('is-typing').publish(async (typing: any, hook: HookContext) => {
    const res = []
    const conv = await app.service('conversations').get(typing.conversation, hook.params)
    for (const member of conv.members) {
      res.push(app.channel('userId=' + member._id.toString()))
    }
    return res
  })
  app.service('message-recieving').publish(async (recieving: any, hook: HookContext) => {
    const res = []
    const conv = await app.service('conversations').get(recieving.conversation, hook.params)
    for (const member of conv.members) {
      res.push(app.channel('userId=' + member._id.toString()))
    }
    return res
  })
  app.service('message-seen').publish(async (recieving: any, hook: HookContext) => {
    const res = []
    const conv = await app.service('conversations').get(recieving.conversation, hook.params)
    for (const member of conv.members) {
      res.push(app.channel('userId=' + member._id.toString()))
    }
    return res
  })
  app.service('emojis').publish(async (emoji: any, hook: HookContext) => {
    let message = await app.service('messages').get(emoji.message, hook.params)
    const conv = await app.service('conversations').get(message.conversation, hook.params)

    const res = []
    for (const member of conv.members) {
      res.push(app.channel('userId=' + member._id.toString()))
    }
    return res
  })
}
