
'use strict'
const OrbitDbLogin = require('./orbitdbLogin')
const PeerAccount = require('../../peer-account')
// const PeerAccount = require('@tabcat/peer-account')
const EventEmitter = require('events').EventEmitter
const crypto = require('@tabcat/peer-account-crypto')

const config = {
  saltLen: 12,
  keyLen: 128
}

const status = {
  PRE_INIT: 'PRE_INIT',
  INIT: 'INIT',
  READY: 'READY',
  FAILED: 'FAILED'
}

const userPrefix = 'localUser-'

const setStatus = (self, sc, codes = status) => {
  if (!self.events) throw new Error('no events property')
  if (!codes[sc]) throw new Error('invalid status code')
  if (self.status === sc) { return }
  self.status = codes[sc]
  self.events.emit(codes[sc])
}

class PeerAccountLogin extends OrbitDbLogin {
  constructor (IpfsBundle, options) {
    super(IpfsBundle)
    this._local = null
    this._loginStore = null
    this._options = options
    this.accounts = {}
    this.events = new EventEmitter()
    setStatus(this, status.PRE_INIT)
    this.initialized = this.initialize()
  }

  async initialize () {
    try {
      setStatus(this, status.INIT)
      this._local = await this.loginOrbitDb('local-id', this._options)
      const loginStoreAddr = await this._local.determineAddress(
        'login-store',
        'docstore'
      )
      const loginStore = await this._local.docs(
        loginStoreAddr,
        { replicate: false }
      )
      await loginStore.load()
      this._loginStore = loginStore
      setStatus(this, status.READY)
    } catch (e) {
      setStatus(this, status.FAILED)
      console.error(e)
    }
  }

  // create the login instance
  static async create (IpfsBundle, options) {
    const instance = new PeerAccountLogin(IpfsBundle, options)
    return new Promise((resolve, reject) => {
      instance.events.on('READY', () => resolve(instance))
      instance.events.on('FAILED', reject)
    })
  }

  async localUser (username) {
    const loginStore = this._loginStore
    return loginStore.query((doc) => doc.name === username)[0]
  }

  async localUsers () {
    const loginStore = this._loginStore
    return loginStore.get(userPrefix)
  }

  // create account index and local user record
  // aes key for account index is encrypted and put into the local user record
  async newUser (username, pw = '') {
    if (typeof username !== 'string' && typeof pw !== 'string') {
      throw new Error('username and pw must be of type string')
    }
    const exists = await this.localUser(username)
    if (exists) throw new Error(`username '${username}' is taken`)
    const _id = `${userPrefix}${crypto.randomBytes(config.saltLen).join('.')}`
    const salt = crypto.randomBytes(config.saltLen)
    const userOrbit = await this.loginOrbitDb(_id)
    const { dbAddr, rawKey } =
      await PeerAccount.genAccountIndex(userOrbit)
    const aesKey = await crypto.aes.deriveKey(
      Buffer.from(pw),
      salt,
      config.keyLen
    )
    // encrypt raw indexKey with derived aesKey
    const { cipherbytes, iv } = await aesKey.encrypt(Buffer.from(
      JSON.stringify([...rawKey])
    ))
    // create user record
    const userRecord = {
      _id,
      name: username,
      address: dbAddr.toString(),
      salt: [...salt],
      cipherbytes: [...cipherbytes],
      iv: [...iv]
    }
    await this._loginStore.put(userRecord)
    const user = await this.localUser(username)
    if (!user) throw new Error(`failed to create user ${_id}`)
    this.events.emit('newUser', _id)
    return user
  }

  // return PeerAccount instance from username and pw
  // decrypts encrypted aes key for decrypting account index
  async loginUser (username, pw = '') {
    if (typeof username !== 'string' && typeof pw !== 'string') {
      throw new Error('username and pw must be of type string')
    }
    const user = await this.localUser(username)
      ? await this.localUser(username)
      : await this.newUser(username, pw)
    const { _id, address } = user
    const [salt, cipherbytes, iv] = [user.salt, user.cipherbytes, user.iv]
      .map(a => Buffer.from(a))
    try {
      const aesKey = await crypto.aes.deriveKey(
        Buffer.from(pw),
        salt,
        config.keyLen
      )
      // decrypt encrypted raw indexKey
      const rawKey = Buffer.from(JSON.parse(
        crypto.util.ab2str(await aesKey.decrypt(cipherbytes, iv))
      ))
      if (this.accounts[_id]) return this.accounts[_id]
      const userOrbit = await this.loginOrbitDb(_id)
      const peerAccount = await PeerAccount.login(userOrbit, address, rawKey)
      this.accounts = { ...this.accounts, [_id]: peerAccount }
      this.events.emit('loginUser', peerAccount)
      return peerAccount
    } catch (e) {
      console.error(e)
      throw new Error(`failed to login user: ${username}, id: ${_id}`)
    }
  }

  async logoutUser (username) {
    if (typeof username !== 'string') {
      throw new Error('username was not of type string')
    }
    const user = await this.localUser(username)
    if (!user) throw new Error(`user ${username} does not exist`)
    if (!this.accounts[user._id]) {
      throw new Error(`user ${username} (_id: ${user._id}) is not logged in`)
    }
    await this.logoutOrbitDb(user._id)
    this.accounts = this._logout(user._id, this.accounts)
  }

  async logoutAllUser () {
    const active = Object.keys(this.accounts)
    const users = this._loginStore.query(doc => active.includes(doc._id))
    await Promise.all(
      users.map(u => this.logoutUser(u.name))
    )
  }
}

module.exports = PeerAccountLogin
