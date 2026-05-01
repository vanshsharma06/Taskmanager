const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authMiddleware')
const { User } = require('../models')

router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { username } = req.body
    await User.update({ username }, { where: { id: req.user.id } })
    res.json({ message: 'Profile updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router