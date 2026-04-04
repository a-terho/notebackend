const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    important: 1,
  })
  res.json(users)
})

usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body || {}

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = await User.create({
    username,
    name,
    passwordHash,
  })

  res.status(201).json(user)
})

module.exports = usersRouter
