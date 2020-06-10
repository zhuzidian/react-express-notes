const mongoose = require('mongoose')

const url = 'mongodb://localhost:27017/note-app'

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'bbb',
  date: new Date(),
  important: true,
})

Note.find({ important: false }).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})
