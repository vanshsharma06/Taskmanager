const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authMiddleware')
const { Project } = require('../models')

router.get('/', verifyToken, async (req, res) => {
  try {
    const projects = await Project.findAll()
    res.json(projects)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Project naam zaroori hai' })
    }

    const project = await Project.create({ name, description })
    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Project.destroy({ where: { id: req.params.id } })
    if (!deleted) {
      return res.status(404).json({ error: 'Project nahi mila' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router