const router = require('express').Router()
const jwt = require('jsonwebtoken')
const config = require('../utils/config')
const Note = require('../models/note')
const User = require('../models/user')

const getTokenFrom = (req) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    return authorization.substring(7)
  }
  return null
}


router.get('/', async (req, res, next) => {
  const notes = await Note.find().populate('user', { username: 1, name: 1 })
  res.json(notes)
})

router.get('/:id', (req, res, next) => {
  Note.findById(req.params.id).then(note => {
    if (note) {
      res.json(note)
    } else {
      res.status(404).end()
    }
    
  })
  .catch(error => next(error))
})

router.post('/', async (req, res, next) => {
  const body = req.body
  const token = getTokenFrom(req)
  if (!token) {
    return res.status(401).json({ error: 'token无效' })
  }
  const decodedToken = jwt.verify(token, config.SECRET)
  if (!decodedToken) {
    return res.status(401).json({ error: 'token无效' })
  }
  
  const user = await User.findById(decodedToken.id)
  
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()

  res.json(savedNote)
})

router.put('/:id', (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(req.params.id, note, { new: true })
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

router.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

module.exports = router