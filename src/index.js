
/*
    This module is used to generate unique ipfs and orbitdb instances based on
  a randomly generated user id.
    This module is not built to secure secret keys on the client!
  Both Ipfs and OrbitDb private keys are viewable via the browsers indexeddb
	or the node repo.
  PeerAccountLogin however is built to secure account data by encrypting an aes
	key with another aes key derived from the users password.
    Using the password to encrypt the aes key used to mount the user data as
  opposed to deriving the aes key directly from the password has some beneficial
  characteristics, namely:
    -the aes key can be derived from random data
    -password changes are trivial
*/

'use strict'

module.exports = require('./peerAccountLogin')
