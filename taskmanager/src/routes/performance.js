const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authMiddleware')
const { Task, User, Team } = require('../models')

// User Performance
router.get('/', verifyToken, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] })

    const performance = await Promise.all(users.map(async (user) => {
      const total = await Task.count({ where: { assignedTo: user.id } })
      const done = await Task.count({ where: { assignedTo: user.id, status: 'Done' } })
      const inProgress = await Task.count({ where: { assignedTo: user.id, status: 'In Progress' } })
      const todo = await Task.count({ where: { assignedTo: user.id, status: 'To Do' } })

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        total,
        done,
        inProgress,
        todo,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0
      }
    }))

    res.json(performance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Team Performance
router.get('/teams', verifyToken, async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [{
        model: User,
        as: 'members',
        attributes: ['id'],
        through: { attributes: [] }
      }]
    })

    const performance = await Promise.all(teams.map(async (team) => {
      const memberIds = team.members.map(m => m.id)

      if (memberIds.length === 0) {
        return {
          id: team.id,
          name: team.name,
          memberCount: 0,
          total: 0,
          done: 0,
          inProgress: 0,
          todo: 0,
          completionRate: 0
        }
      }

      const { Op } = require('sequelize')
      const total = await Task.count({ where: { assignedTo: { [Op.in]: memberIds } } })
      const done = await Task.count({ where: { assignedTo: { [Op.in]: memberIds }, status: 'Done' } })
      const inProgress = await Task.count({ where: { assignedTo: { [Op.in]: memberIds }, status: 'In Progress' } })
      const todo = await Task.count({ where: { assignedTo: { [Op.in]: memberIds }, status: 'To Do' } })

      return {
        id: team.id,
        name: team.name,
        memberCount: memberIds.length,
        total,
        done,
        inProgress,
        todo,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0
      }
    }))

    res.json(performance)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router