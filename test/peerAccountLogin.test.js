//
// 'use strict'
// const assert = require('assert')
// const rmrf = require('rimraf')
// const config = require('./utils/config')
// const PeerAccountLogin = require('../src/peerAccountLogin')
//
// describe('PeerAccountLogin', function () {
//   this.timeout(config.timeout)
//
//   let pal, account
//   const username = 'username'
//   const password = username
//
//   const users = {
//     user1: {
//       _id: 'localUser-155.76.181.173.239.184.158.127.172.41.133.232',
//       name: 'user1',
//       address: '/orbitdb/zdpuAw1cDzYPsBQeMsDV5UCyXJEXp9g9hN88jKnFsMbzkQNmQ/QD5JotXMDafpwMtQa2NtPUrokwDAjZFu5BAwXNtXWJ3LyD3Gxrt97YKk4b82tVti3yoEi1d/138.79.137.142.173.239.241.64.224.216.16.237',
//       salt: [1, 156, 240, 204, 182, 229, 213, 172, 140, 157, 25, 67],
//       cipherbytes: [141, 170, 112, 160, 13, 73, 218, 226, 21, 95, 234, 195, 24, 136, 52, 73, 109, 176, 238, 60, 71, 229, 29, 18, 109, 210, 211, 124, 246, 110, 253, 123, 56, 114, 60, 22, 237, 115, 54, 214, 81, 114, 140, 51, 87, 112, 77, 26, 136, 105, 184, 202, 98, 67, 190, 136, 200, 206, 69, 181, 220, 107, 31, 36, 148, 140, 231, 128, 170, 119, 131, 183, 145],
//       iv: [68, 34, 199, 78, 243, 237, 102, 88, 178, 105, 223, 36]
//     },
//     user2: {
//       _id: 'localUser-23.59.58.0.141.123.36.209.144.116.140.193',
//       name: 'user2',
//       address: '/orbitdb/zdpuAsBi4c5i7YfxRVLkLNH9v9fNQjcUgBwpkj1jTphbtgux9/VPTG6CiypfFCm1gJCdbY6915BSTYQdTfsLMc8VyoaGxjygDizjDmQTcVzvGVvPXCYfME11p/109.172.151.207.82.38.48.12.57.12.2.84',
//       salt: [215, 219, 61, 243, 193, 13, 42, 176, 185, 55, 243, 227],
//       cipherbytes: [250, 71, 94, 92, 228, 57, 142, 27, 254, 207, 82, 61, 151, 133, 21, 26, 94, 153, 233, 162, 147, 242, 123, 49, 109, 182, 94, 218, 8, 252, 251, 166, 39, 156, 100, 109, 188, 15, 108, 206, 234, 44, 211, 129, 73, 81, 100, 39, 106, 255, 10, 59, 191, 54, 87, 214, 144, 164, 167, 54, 163, 180, 124, 102, 73, 158, 87, 55, 241, 228, 97, 112, 97, 20, 171, 110],
//       iv: [219, 72, 161, 65, 22, 248, 135, 247, 103, 218, 192, 161]
//     },
//     user3: {
//       _id: 'localUser-22.226.45.244.84.35.194.130.7.128.246.129',
//       name: 'user3',
//       address: '/orbitdb/zdpuAsU6a5MXiuNJB8kxW8svYsNWzpLcmuCMYwqByvSZorMGk/j68EPADBzG86UKVtssJbY4rzwBVzsCVsKDdZSDZZWK5ekzxMaLkvpawyYUQR8tahWseM5w8/41.211.27.79.2.71.94.49.141.144.197.174',
//       salt: [90, 49, 33, 65, 74, 198, 182, 221, 241, 41, 124, 48],
//       cipherbytes: [192, 216, 126, 232, 24, 74, 134, 161, 28, 253, 255, 38, 128, 52, 68, 194, 101, 64, 202, 116, 143, 81, 240, 160, 159, 202, 125, 83, 157, 142, 102, 218, 30, 118, 123, 254, 63, 52, 51, 71, 151, 201, 134, 156, 233, 22, 36, 67, 171, 133, 87, 3, 20, 9, 236, 29, 250, 143, 199, 57, 241, 84, 168, 100, 106, 224, 110, 210, 21, 79, 126, 125, 82],
//       iv: [255, 227, 222, 231, 91, 56, 158, 245, 22, 141, 34, 89]
//     }
//   }
//
//   before(async () => {
//     rmrf.sync('./ipfs')
//     rmrf.sync('./orbitdb')
//     pal = await PeerAccountLogin.create()
//     let i = 0
//     while (pal._loginStore.query(() => true).length < 3) {
//       if (i > 10) {
//         throw new Error('failed to setup pre existing users for tests')
//       }
//       await Promise.all(
//         Object.values(users).map(u => pal._loginStore.put(u))
//       )
//       i++
//     }
//   })
//
//   after(async () => {
//     const active = Object.keys(pal.accounts)
//     const users = pal._loginStore.query(doc => active.includes(doc._id))
//     await Promise.all(
//       users.map(u => pal.logoutUser(u.name))
//     )
//     await pal.logoutOrbitDb('local-id')
//   })
//
//   it('logs in a new user', async () => {
//     account = await pal.loginUser(username, password)
//     const localUser = await pal.localUser(username)
//     assert.strictEqual(Object.values(pal.accounts).length, 1)
//     assert.strictEqual(Object.values(pal.accounts)[0], account)
//     assert.strictEqual(Object.values(pal._orbits).length, 2)
//     assert.strictEqual(Object.values(pal._nodes).length, 2)
//     const orbitdb = account._orbitdbC._orbitdb
//     assert.strictEqual(pal._orbits[localUser._id], orbitdb)
//     const node = account._orbitdbC._orbitdb._ipfs
//     assert.strictEqual(pal._nodes[localUser._id], node)
//   })
//
//   it('logs out a user', async () => {
//     await pal.logoutUser(username)
//     assert.strictEqual(Object.values(pal.accounts).length, 0)
//     assert.strictEqual(Object.values(pal.accounts)[0], undefined)
//     assert.strictEqual(Object.values(pal._orbits).length, 1)
//     assert.strictEqual(Object.values(pal._nodes).length, 1)
//   })
//
//   it('logs in an existing user', async () => {
//     account = await pal.loginUser(username, password)
//     const localUser = await pal.localUser(username)
//     assert.strictEqual(Object.values(pal.accounts).length, 1)
//     assert.strictEqual(Object.values(pal.accounts)[0], account)
//     assert.strictEqual(Object.values(pal._orbits).length, 2)
//     assert.strictEqual(Object.values(pal._nodes).length, 2)
//     const orbitdb = account._orbitdbC._orbitdb
//     assert.strictEqual(pal._orbits[localUser._id], orbitdb)
//     const node = account._orbitdbC._orbitdb._ipfs
//     assert.strictEqual(pal._nodes[localUser._id], node)
//   })
//
//   it('logs in an already logged in user', async () => {
//     const change = 'change'
//     const localUser = await pal.localUser(username)
//     pal.accounts[localUser._id].change = change
//     pal._orbits[localUser._id].change = change
//     pal._nodes[localUser._id].change = change
//     account = await pal.loginUser(username, password)
//     assert.strictEqual(Object.values(pal.accounts).length, 1)
//     assert.strictEqual(Object.values(pal.accounts)[0], account)
//     assert.strictEqual(Object.values(pal._orbits).length, 2)
//     assert.strictEqual(Object.values(pal._nodes).length, 2)
//     const orbitdb = account._orbitdbC._orbitdb
//     assert.strictEqual(pal._orbits[localUser._id], orbitdb)
//     const node = account._orbitdbC._orbitdb._ipfs
//     assert.strictEqual(pal._nodes[localUser._id], node)
//     assert.strictEqual(account.change, change)
//   })
//
//   it('localUser returns localUser record by username', async () => {
//     const localUser = await pal.localUser(users.user1.name)
//     assert.deepStrictEqual(localUser, users.user1)
//   })
//
//   it('localUsers returns all localUser records', async () => {
//     const localUsers = await pal.localUsers()
//     localUsers.forEach(u => {
//       if (users[u.name]) assert.deepStrictEqual(u, users[u.name])
//     })
//     // console.log(await pal._loginStore.query(() => true))
//     assert.strictEqual(localUsers.length, 4)
//   })
//
//   it('fails to log in an existing user with incorrect password', async () => {
//     account = await pal.loginUser(username, password)
//     assert.strictEqual(Object.values(pal.accounts).length, 1)
//     assert.strictEqual(Object.values(pal.accounts)[0], account)
//     await assert.rejects(pal.loginUser(username, 'passwerd'))
//   })
// })
