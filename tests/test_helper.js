const Note = require('../models/note')

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true,
  },
]

const nonExistingId = async () => {
  const note = new Note({ content: 'will_be_deleted' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map((note) => note.toJSON())
}

const noteInDb = async (id) => {
  const note = await Note.findById(id)
  return note.toJSON()
}

module.exports = {
  initialNotes,
  nonExistingId,
  notesInDb,
  noteInDb,
}
