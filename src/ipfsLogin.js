
'use strict'

class IpfsLogin {
  constructor (IpfsBundle) {
    this._IpfsBundle = IpfsBundle
    this._nodes = {}
  }

  // creates a unique per id ipfs instance
  async loginIpfs (id, options = {}) {
    if (typeof id !== 'string') {
      throw new Error('repo was not of type string')
    }
    const repo = `./ipfs/${id}`
    if (this._nodes[id]) return this._nodes[id]
    const node = this._IpfsBundle({ repo, ...options })
    this._nodes = { ...this._nodes, [id]: node }
    return new Promise((resolve, reject) => {
      node.once('ready', () => resolve(node))
      node.once('error', reject)
    })
  }

  async logoutIpfs (id) {
    if (typeof id !== 'string') {
      throw new Error('repo was not of type string')
    }
    if (!this._nodes[id]) throw new Error(`node ${id} does not exist`)
    await this._nodes[id].stop()
    this._nodes = this._logout(id, this._nodes)
  }

  async logoutAllIpfs () {
    await Promise.all(
      Object.keys(this._nodes).map(id => this.logoutIpfs(id))
    )
  }

  _logout (id, open) {
    // immutably updates the object by removing the key matching the id
    return Object.keys(open).reduce((a, c) =>
      c === id
        ? a
        : { ...a, [c]: open[c] }
    , {})
  }
}

module.exports = IpfsLogin
