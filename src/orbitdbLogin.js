
'use strict'
const IpfsLogin = require('./ipfsLogin')

class OrbitDbLogin extends IpfsLogin {
  constructor (IpfsBundle, OrbitDB) {
    super(IpfsBundle)
    this._OrbitDB = OrbitDB
    this._orbits = {}
  }

  // creates a unique per id orbitdb instance, orbit identity, and ipfs instance
  async loginOrbitDb (id, options = {}) {
    if (typeof id !== 'string') {
      throw new Error('repo was not of type string')
    }
    const repo = `./orbitdb/${id}`
    if (this._orbits[id]) return this._orbits[id]
    const ipfs = await this.loginIpfs(id, options)
    const orbit = await this._OrbitDB.createInstance(
      ipfs,
      { directory: repo, ...options }
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
