const express = require('express')
const router = express.Router()
const { verifyToken } = require('../middlewares/authMiddleware')
const { Task, Project, User } = require('../models')

router.get('/', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'username'] }
      ]
    })

    const result = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      due_date: t.deadline,
      project_name: t.Project?.name || null,
      assigned_username: t.assignee?.username || null
    }))

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, project_id, status, priority, assigned_to, due_date } = req.body

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' })
    }
    if (!project_id) {
      return res.status(400).json({ error: 'Please select a project' })
    }

    const task = await Task.create({
      title,
      description,
      projectId: parseInt(project_id),
      status: status || 'To Do',
      priority: priority || 'Medium',
      assignedTo: assigned_to ? parseInt(assigned_to) : null,
      deadline: due_date || null
    })
    res.status(201).json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { status, title, description, priority, assigned_to, due_date } = req.body
    const task = await Task.findByPk(req.params.id)
    if (!task) return res.status(404).json({ error: 'Task not found' })

    await task.update({
      ...(status && { status }),
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(priority && { priority }),
      ...(assigned_to !== undefined && { assignedTo: assigned_to ? parseInt(assigned_to) : null }),
      ...(due_date !== undefined && { deadline: due_date })
    })

    res.json(task)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Task.destroy({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router