// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  messagesDataValidator,
  messagesPatchValidator,
  messagesQueryValidator,
  messagesResolver,
  messagesExternalResolver,
  messagesDataResolver,
  messagesPatchResolver,
  messagesQueryResolver
} from './messages.schema'

import type { Application, HookContext } from '../../declarations'
import { MessagesService, getOptions } from './messages.class'
import { messagesPath, messagesMethods } from './messages.shared'
import setTimestamps from '../../hooks/dating'
import { validateMembership } from '../../hooks/convValidation'

export * from './messages.class'
export * from './messages.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const messages = (app: Application) => {
  // Register our service on the Feathers application
  app.use(messagesPath, new MessagesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: messagesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(messagesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(messagesExternalResolver),
        schemaHooks.resolveResult(messagesResolver)
      ]
    },
    before: {
      all: [
        validateMembership(),
        schemaHooks.validateQuery(messagesQueryValidator),
        schemaHooks.resolveQuery(messagesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(messagesDataValidator),
        schemaHooks.resolveData(messagesDataResolver)
      ],
      patch: [
        setTimestamps(),
        schemaHooks.validateData(messagesPatchValidator),
        schemaHooks.resolveData(messagesPatchResolver)
      ],
      remove: []
    },
    after: {
      all: [],
      create: [
        //set new lastMessage to the conversation
        async (context: HookContext) => {
          const messageId = context.result.myMessage
            ? context.result.myMessage._id.toString()
            : context.result._id.toString()
          //set the created message as seen by its sender
          await app.service('message-seen').create(
            {
              message: messageId,
              conversation: context.data.conversation,
              viewer: context.params.user._id.toString()
            },
            context.params
          )
        }
      ]
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [messagesPath]: MessagesService
  }
}
