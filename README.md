# peer-account-login
user login and instance manager for peer-account

Structure:
  * PeerAccountLogin Class
    - create: class factory method
  * PeerAccountLogin Instance
    - localUser: returns the user record for a username
    - localUsers: returns all user records
    - loginUser: returns an instance of peerAccount from a username and password
    - logoutUser: logs out a user
    - logoutAllUsers: logs out all users
