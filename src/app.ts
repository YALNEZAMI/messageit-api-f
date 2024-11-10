// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import { configurationValidator } from './configuration'
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { mongodb } from './mongodb'
import { authentication } from './authentication'
import { services } from './services/index'
import { channels } from './channels'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get('origins')
    }
  })
)
app.configure(mongodb)
app.configure(authentication)
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})
// app.js or app.ts
app.on('connection', (connection) => {
  // This will add every new connected client to the `anonymous` channel
  app.channel('anonymous').join(connection)
})

app.on('login', (authResult, { connection }) => {
  if (connection) {
    // If a user has logged in, remove them from the anonymous channel
    app.channel('anonymous').leave(connection)

    // Add the logged-in user to the `authenticated` channel
    app.channel('authenticated').join(connection)

    // You can also use specific channels based on user roles, preferences, etc.
    const { user } = authResult

    if (user.role === 'admin') {
      app.channel('admins').join(connection)
    }
  }
})

app.on('logout', (payload, { connection }) => {
  if (connection) {
    // When a user logs out, remove them from the authenticated channels
    app.channel('authenticated').leave(connection)
    app.channel('admins').leave(connection)

    // Optionally add them back to the anonymous channel
    app.channel('anonymous').join(connection)
  }
})

export { app }
