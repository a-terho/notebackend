const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (req, res) => {
  const notes = await Note.find({})
  res.json(notes)
})

notesRouter.post('/', async (req, res) => {
  const body = req.body

  if (!body.content) {
    return res.status(400).json({
      error: 'content missing',
    })
  }

  const note = await Note.create({
    content: body.content,
    important: body.important || false,
  })

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
