import assert from 'assert'
import { app } from '../src/app'
import { handleDisconnect } from '../src/channels'

describe('real-time disconnect', () => {
  it('removes anonymous connections without updating a user', async () => {
    const service = app.service('my-users')
    const originalPatch = service._patch
    let called = false
    service._patch = async () => {
      called = true
      throw new Error('Unexpected user update')
    }

    try {
      const connection = {}
      app.channel('anonymous').join(connection)
      await handleDisconnect(app, connection)
      assert.strictEqual(called, false)
      assert.strictEqual(app.channel('anonymous').connections.includes(connection), false)
    } finally {
      service._patch = originalPatch
    }
  })

  it('attempts to update an authenticated user and propagates update failures', async () => {
    const service = app.service('my-users')
    const originalPatch = service._patch
    let patchedId: string | null = null
    service._patch = async (id) => {
      patchedId = String(id)
      throw new Error('database unavailable')
    }

    try {
      await assert.rejects(handleDisconnect(app, { user: { _id: 'test-user' } }), /database unavailable/)
      assert.strictEqual(patchedId, 'test-user')
    } finally {
      service._patch = originalPatch
    }
  })
})
