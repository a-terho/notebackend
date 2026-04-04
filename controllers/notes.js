const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1,
  })
  res.json(notes)
})

notesRouter.post('/', async (req, res) => {
  const { content, important, userId } = req.body || {}

  if (!content) {
    return res.status(400).json({ error: 'content missing' })
  }

  const user = await User.findById(userId)
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
