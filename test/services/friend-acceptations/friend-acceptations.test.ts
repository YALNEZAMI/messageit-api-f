// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('friend-acceptations service', () => {
  it('registered the service', () => {
    const service = app.service('friend-acceptations')

    assert.ok(service, 'Registered the service')
  })
})
