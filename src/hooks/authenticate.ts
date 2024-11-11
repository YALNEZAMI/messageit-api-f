import { Context } from 'mocha'

// hooks/authenticate.js
// const { authenticate } = require('@feathersjs/authentication').hooks

export const authenticationHooks = {
  before: {
    // Other hook settings...
  },
  after: {
    all: [
      async (context: Context) => {
        const { result, params } = context
        if (params.connection) {
          params.connection.user = result.user
        }
        return context
      }
    ]
    // Other hook settings...
  }
}
