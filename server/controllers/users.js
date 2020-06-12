const router = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

router.get('/', async (req, res, next) => {
  const users = await User.find().populate('notes', { content: 1, date: 1 })
  res.json(users)
})

router.post('/', async (req, res, next) => {
  const body = req.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)
  
  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

  const savedUser = await user.save()

  res.json(savedUser)
})

module.exports = router