
'use strict'
const assert = require('assert')
const rmrf = require('rimraf')
const config = require('./utils/config')
const OrbitdbLogin = require('../src/orbitdbLogin')
const IpfsBundle = require('@tabcat/ipfs-bundle-t')
const OrbitDB = require('orbit-db')

describe('OrbitDbLogin', function () {
  this.timeout(config.timeout)

  const repo = 'orbitdb-login'
  let orbitdbLogin, orbit

  before(() => {
    rmrf.sync('./ipfs')
    rmrf.sync('./orbitdb')
  })

  beforeEach(async () => {
    orbitdbLogin = new OrbitdbLogin(IpfsBundle, OrbitDB)
  })

  afterEach(async () => {
    await orbitdbLogin.logoutOrbitDb(repo)
    assert.deepStrictEqual(orbitdbLogin._orbits, {})
    orbit = null
  })

  it('logs in an orbitdb instance', async () => {
    await orbitdbLogin.loginOrbitDb(repo)
    assert.deepStrictEqual(Object.keys(orbitdbLogin._orbits), [repo])
  })

  it('returns the stored instance', async () => {
    const change = 'change'
    orbit = await orbitdbLogin.loginOrbitDb(repo)
    if (orbit[change]) throw new Error(`${change} property already exists`)
    orbit[change] = change
    orbit = await orbitdbLogin.loginOrbitDb(repo)
    assert.strictEqual(orbit[change], change)
  })

  it('logs out an orbitdb instance', async () => {
    orbit = await orbitdbLogin.loginOrbitDb(repo)
    await orbitdbLogin.logoutOrbitDb(repo)
    orbitdbLogin = new OrbitdbLogin(IpfsBundle, OrbitDB)
    await orbitdbLogin.loginOrbitDb(repo)
  })
})
