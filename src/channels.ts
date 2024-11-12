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

  app.on('login', (authResult: AuthenticationResult, { connection }: Params) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
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
  // Définir les canaux pour le service 'friend-requests'
  // Define the publish function specifically for 'friendRequestCreated'
  // Listen for the custom 'friendRequestCreated' event
}
