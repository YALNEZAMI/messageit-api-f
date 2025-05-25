import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  conversationsDataValidator,
  conversationsPatchValidator,
  conversationsQueryValidator,
  conversationsResolver,
  conversationsExternalResolver,
  conversationsDataResolver,
  conversationsPatchResolver,
  conversationsQueryResolver
} from './conversations.schema'

import type { Application } from '../../declarations'
import { ConversationsService, getOptions } from './conversations.class'
import { conversationsPath, conversationsMethods } from './conversations.shared'
import setTimestamps from '../../hooks/dating'
import { privateConversationExistHook, setDefaultValues } from './conversations.hooks'
import { validateMembership } from '../../hooks/convValidation'

export * from './conversations.class'
export * from './conversations.schema'

export const conversations = (app: Application) => {
  app.use(conversationsPath, new ConversationsService(getOptions(app)), {
    methods: conversationsMethods,
    events: []
  })

  app.service(conversationsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(conversationsExternalResolver),
        schemaHooks.resolveResult(conversationsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(conversationsQueryValidator),
        schemaHooks.resolveQuery(conversationsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        setDefaultValues(),
        privateConversationExistHook(),
        setTimestamps(),
        schemaHooks.validateData(conversationsDataValidator),
        schemaHooks.resolveData(conversationsDataResolver)
      ],
      patch: [
        validateMembership(),

        setTimestamps(),
        schemaHooks.validateData(conversationsPatchValidator),
        schemaHooks.resolveData(conversationsPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

declare module '../../declarations' {
  interface ServiceTypes {
    [conversationsPath]: ConversationsService
  }
}
