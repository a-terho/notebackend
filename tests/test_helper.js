const bcrypt = require('bcrypt')
const Note = require('../models/note')
const User = require('../models/user')

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

let _noteId = undefined
let _userId = undefined

const nonExistingNoteId = async () => {
  if (!_noteId) {
    const note = new Note({ content: 'null content' })
    await note.save()
    await note.deleteOne()

    _noteId = note._id.toString()
  }
  return _noteId
}

const existingUserId = async () => {
  if (!_userId) {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash('null', saltRounds)

    const user = await User.create({
      username: 'null',
      name: 'null',
      passwordHash,
    })

    _userId = user._id.toString()
  }
  return _userId
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map((note) => note.toJSON())
}

const noteInDb = async (id) => {
  const note = await Note.findById(id)
  return note.toJSON()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((user) => user.toJSON())
}

module.exports = {
  initialNotes,
  nonExistingNoteId,
  existingUserId,
  notesInDb,
  noteInDb,
  usersInDb,
}
