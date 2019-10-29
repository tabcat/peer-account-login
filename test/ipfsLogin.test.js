
'use strict'
const assert = require('assert')
const rmrf = require('rimraf')
const config = require('./utils/config')
const IpfsLogin = require('../src/ipfsLogin')

describe('IpfsLogin', function () {
  this.timeout(config.timeout)

  const repo = 'ipfs-login'
  let ipfsLogin, node

  before(() => {
    rmrf.sync('./ipfs')
  })

  beforeEach(async () => {
    ipfsLogin = new IpfsLogin()
  })

  afterEach(async () => {
    await ipfsLogin.logoutIpfs(repo)
    assert.deepStrictEqual(ipfsLogin._nodes, {})
    node = null
  })

  it('logs in an ipfs instance', async () => {
    await ipfsLogin.loginIpfs(repo)
    assert.deepStrictEqual(Object.keys(ipfsLogin._nodes), [repo])
  })

  it('returns the stored instance', async () => {
    const change = 'change'
    node = await ipfsLogin.loginIpfs(repo)
    if (node[change]) throw new Error(`${change} property already exists`)
    node[change] = change
    node = await ipfsLogin.loginIpfs(repo)
    assert.strictEqual(node[change], change)
  })

  it('logs out an ipfs instance', async () => {
    node = await ipfsLogin.loginIpfs(repo)
    await ipfsLogin.logoutIpfs(repo)
    ipfsLogin = new IpfsLogin()
    await ipfsLogin.loginIpfs(repo)
  })
})
