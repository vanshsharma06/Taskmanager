const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authMiddleware')
const { Team, User } = require('../models')

router.get('/', verifyToken, async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'username', 'role'],
        through: { attributes: [] }
      }]
    })
    const result = teams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      member_count: team.members.length,
      members: team.members
    }))
    res.json(result)
  } catch (err) {
    console.log('TEAMS ERROR:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body
    const team = await Team.create({ name, description })
    res.status(201).json(team)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Team.destroy({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/members', verifyToken, async (req, res) => {
  try {
    const { user_id } = req.body
    const team = await Team.findByPk(req.params.id)
    if (!team) return res.status(404).json({ error: 'Team not found' })
    const user = await User.findByPk(user_id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    await team.addMember(user)
    res.status(201).json({ message: 'Member added successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id)
    if (!team) return res.status(404).json({ error: 'Team not found' })
    const user = await User.findByPk(req.params.userId)
    if (!user) return res.status(404).json({ error: 'User not found' })
    await team.removeMember(user)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router