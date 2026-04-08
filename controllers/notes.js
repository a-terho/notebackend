const jwt = require('jsonwebtoken')

const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1,
  })
  res.json(notes)
})

notesRouter.post('/', async (req, res) => {
  const { content, important } = req.body || {}

  if (!content) {
    return res.status(400).json({ error: 'content missing' })
  }

  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({ error: 'token invalid' })
  }

  const user = await User.findById(decodedToken.id)
  if (!user) {
    return res.status(400).json({ error: 'userId missing or not valid' })
  }

  const note = await Note.create({
    content,
    important: important || false,
    user: user._id,
  })

  user.notes = user.notes.concat(note._id)
  await user.save()

  res.status(201).json(note)
})

notesRouter.get('/:id', async (req, res) => {
  const id = req.params.id

  const note = await Note.findById(id)

  if (note) {
    return res.json(note)
  } else {
    return res.status(404).end()
  }
})

notesRouter.delete('/:id', async (req, res) => {
  const id = req.params.id

  await Note.findByIdAndDelete(id)
  res.status(204).end()
})

notesRouter.put('/:id', async (req, res) => {
  const { content, important } = req.body
  const id = req.params.id

  const note = await Note.findById(id)

  if (!note) {
    return res.status(404).end()
  }

  note.content = content
  note.important = important

  const updatedNote = await note.save()
  res.json(updatedNote)
})

module.exports = notesRouter
