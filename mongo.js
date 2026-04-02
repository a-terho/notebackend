const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.oswtvtx.mongodb.net/testNoteApp?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url, { family: 4 })

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
const Note = mongoose.model('Note', noteSchema)

if (process.argv.length > 3) {
  const note = new Note({
    content: process.argv[3],
    important: true,
  })

  note.save().then(() => {
    console.log('note saved!')
    mongoose.connection.close()
  })
} else {
  Note.find({}).then((result) => {
    result.forEach((note) => {
      console.log(note)
    })
    mongoose.connection.close()
  })
}
