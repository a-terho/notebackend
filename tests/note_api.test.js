const assert = require('node:assert')
const { test, after, beforeEach } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')

const helper = require('./test_helper')
const Note = require('../models/note')

const app = require('../app')
const api = supertest(app)

beforeEach(async () => {
  await Note.deleteMany({})

  // mongoose provided approach
  await Note.insertMany(helper.initialNotes)

  // alternative approach
  // const notes = helper.initialNotes.map((note) => new Note(note))
  // const promises = notes.map((note) => note.save())
  // await Promise.all(promises)

  // another alternative approach
  // for (let note of helper.initialNotes) {
  //   let noteObject = new Note(note)
  //   await noteObject.save()
  // }
})

test.only('notes are returned as json', async () => {
  console.log('entered test')
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test.only('all notes are returned', async () => {
  const res = await api.get('/api/notes')

  assert.strictEqual(res.body.length, helper.initialNotes.length)
})

test('a specific note is within the returned notes', async () => {
  const res = await api.get('/api/notes')

  const contents = res.body.map((e) => e.content)
  assert(contents.includes('HTML is easy'))
})

test('a valid note can be added ', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1)

  const contents = notesAtEnd.map((n) => n.content)
  assert(contents.includes('async/await simplifies making async calls'))
})

test('note without content is not added', async () => {
  const newNote = {
    important: true,
  }

  await api.post('/api/notes').send(newNote).expect(400)

  const notesAtEnd = await helper.notesInDb()
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
})

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToView = notesAtStart[0]

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.deepStrictEqual(resultNote.body, noteToView)
})

test('a specific note changes correctly when updated', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToEdit = notesAtStart[0]

  let editedNote = {
    content: 'CSS is difficult',
    important: false,
  }

  const resultNote = await api
    .put(`/api/notes/${noteToEdit.id}`)
    .send(editedNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  // add correct id after HTTP request
  editedNote.id = noteToEdit.id

  // check correct response
  assert.deepStrictEqual(resultNote.body, editedNote)

  // check correct value in database
  const noteInDb = await helper.noteInDb(noteToEdit.id)
  assert.deepStrictEqual(noteInDb, editedNote)
})

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb()
  const noteToDelete = notesAtStart[0]

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

  const notesAtEnd = await helper.notesInDb()

  const ids = notesAtEnd.map((n) => n.id)
  assert(!ids.includes(noteToDelete.id))

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
})

after(async () => {
  await mongoose.connection.close()
})
