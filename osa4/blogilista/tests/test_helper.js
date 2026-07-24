const User = require('../models/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const getToken = (user) => {
  const userForToken = {
    username: user.username,
    id: user._id
  }

  return jwt.sign(userForToken, process.env.SECRET)
}

const initialUsers = async () => {
  const passwordHash = await bcrypt.hash('password', 10)

  const users = [
    {
      username: 'testuser',
      name: 'Test User',
      passwordHash
    }
  ]

  return await User.insertMany(users)
}
const createUser = async (username) => {
  const passwordHash = await bcrypt.hash('password', 10)

  return User.create({
    username,
    name: username,
    passwordHash
  })
}


const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialUsers,
    usersInDb,
  getToken,
  createUser
}