import assert from 'assert'
import { spawnSync } from 'child_process'
import { mkdtempSync, rmSync, rmdirSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

describe('MongoDB configuration', function () {
  this.timeout(30000)
  const script = `
    const { MongoClient } = require('mongodb')
    MongoClient.connect = () => new Promise(() => {})
    try {
      const { app } = require('./src/app')
      if (app.get('mongodb') !== process.env.MONGODB_URI) process.exit(2)
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    }
  `

  it('uses MONGODB_URI from the environment', () => {
    const result = spawnSync(process.execPath, ['-r', 'ts-node/register', '-e', script], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        MONGODB_URI: 'mongodb://localhost:27017/test-database',
        DOTENV_CONFIG_PATH: '/nonexistent/messageit-test.env'
      }
    })
    assert.strictEqual(result.status, 0, result.stderr)
  })

  it('fails clearly when MONGODB_URI is absent', () => {
    const env = { ...process.env, NODE_ENV: 'test', DOTENV_CONFIG_PATH: '/nonexistent/messageit-test.env' }
    delete env.MONGODB_URI
    const result = spawnSync(process.execPath, ['-r', 'ts-node/register', '-e', script], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env
    })
    assert.strictEqual(result.status, 1)
    assert.match(result.stderr, /MONGODB_URI is required/)
  })

  it('loads MONGODB_URI from the dotenv file before application configuration', () => {
    const directory = mkdtempSync(join(tmpdir(), 'messageit-config-test-'))
    const envFile = join(directory, '.env')
    try {
      writeFileSync(envFile, 'MONGODB_URI=mongodb://localhost:27017/dotenv-test\n')
      const env = { ...process.env, NODE_ENV: 'test', DOTENV_CONFIG_PATH: envFile }
      delete env.MONGODB_URI
      const result = spawnSync(process.execPath, ['-r', 'ts-node/register', '-e', script], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env
      })
      assert.strictEqual(result.status, 0, result.stderr)
    } finally {
      rmSync(envFile)
      rmdirSync(directory)
    }
  })
})
