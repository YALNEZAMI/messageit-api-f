import assert from 'assert'
import { feathers } from '@feathersjs/feathers'
import { validateMembership } from '../src/hooks/convValidation'

describe('conversation membership', () => {
  it('rejects non-members and missing conversation ids with a Forbidden error', async () => {
    const app = feathers()
    app.use('conversations', { async get() { return { members: [{ _id: 'member' }] } } })
    app.use('guard', { async find() { return [] } })
    app.service('guard').hooks({ before: { find: [validateMembership()] } })
    const user = { _id: 'outsider', email: 'outsider@example.invalid' }
    await assert.rejects(() => app.service('guard').find({ query: { conversation: 'conv' }, user }),
      (error: Error & { code?: number }) => error.code === 403)
    await assert.rejects(() => app.service('guard').find({ query: {}, user }),
      (error: Error & { code?: number }) => error.code === 403)
  })
})
