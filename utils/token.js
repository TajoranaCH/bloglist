const jwt = require('jsonwebtoken')

module.exports = (user) => {
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  return token
}