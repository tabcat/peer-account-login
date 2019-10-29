
'use strict'
const IpfsLogin = require('./ipfsLogin')
const OrbitDB = require('orbit-db')
const Identities = require('orbit-db-identity-provider')

class OrbitDbLogin extends IpfsLogin {
  constructor () {
    super()
    this._orbits = {}
  }

  // creates a unique per id orbitdb instance, orbit identity, and ipfs instance
  async loginOrbitDb (id, options = {}) {
    if (typeof id !== 'string') {
      throw new Error('repo was not of type string')
    }
    const repo = `./orbitdb/${id}`
    if (this._orbits[id]) return this._orbits[id]
    const [ipfs, identity] = await Promise.all([
      this.loginIpfs(id, options.ipfs),
      Identities.createIdentity({
        id,
        identityKeysPath: `${repo}/idKeys`
      })
    ])
    const orbit = await OrbitDB.createInstance(
      ipfs,
      { directory: repo, identity, ...options }
    )
    this._orbits = { ...this._orbits, [id]: orbit }
    return orbit
  }

  async logoutOrbitDb (id) {
    if (typeof id !== 'string') {
      throw new Error('id was not of type string')
    }
    if (!this._orbits[id]) throw new Error('orbit does not exist')
    await this._orbits[id].disconnect()
    await this.logoutIpfs(id)
    this._orbits = this._logout(id, this._orbits)
  }

  async logoutAllOrbitDb () {
    await Promise.all(
      Object.keys(this._orbits).map(id => this.logoutOrbitDb(id))
    )
  }
}

module.exports = OrbitDbLogin
