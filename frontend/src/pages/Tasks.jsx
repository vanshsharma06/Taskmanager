import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', project_id: '', assigned_to: '', priority: 'Medium', due_date: '' })
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('All')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(atob(token.split('.')[1]))
  const isAdmin = user.role === 'Admin'
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/'); return }
    fetchAll()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchAll = async () => {
    try {
      const [t, p, u] = await Promise.all([
        axios.get('$\{import.meta.env.VITE_API_URL\}/api/tasks', { headers }),
        axios.get('$\{import.meta.env.VITE_API_URL\}/api/projects', { headers }),
        axios.get('$\{import.meta.env.VITE_API_URL\}/api/users', { headers })
      ])
      setTasks(t.data)
      setProjects(p.data)
      setUsers(u.data)
    } catch (err) {
      setError('Failed to load data')
    }
  }

  const createTask = async (e) => {
    e.preventDefault()
    try {
      await axios.post('$\{import.meta.env.VITE_API_URL\}/api/tasks', newTask, { headers })
      setNewTask({ title: '', description: '', project_id: '', assigned_to: '', priority: 'Medium', due_date: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task')
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`$\{import.meta.env.VITE_API_URL\}/api/tasks/${id}`, { status }, { headers })
      fetchAll()
    } catch (err) {
      setError('Failed to update status')
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`$\{import.meta.env.VITE_API_URL\}/api/tasks/${id}`, { headers })
      fetchAll()
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const priorityColor = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' }
  const statusColor = { 'To Do': '#6366F1', 'In Progress': '#F59E0B', 'Done': '#10B981' }
  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter)

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div ref={sidebarRef} style={{
        position: 'fixed', top: 0, right: sidebarOpen ? 0 : '-320px', width: '300px', height: '100vh',
        background: '#1E293B', zIndex: 50, transition: 'right 0.3s ease',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#E2E8F0', fontWeight: '700', fontSize: '1.1rem' }}>My Profile</span>
          <button onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
        </div>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '1.8rem', margin: '0 auto 1rem'
          }}>
            {(user.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ color: '#E2E8F0', fontWeight: '700', fontSize: '1.1rem' }}>{user.username}</div>
          <div style={{ color: isAdmin ? '#6366F1' : '#10B981', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isAdmin ? '👑 Admin' : '👤 Member'}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.25rem' }}>{user.email || ''}</div>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>NAVIGATION</div>
          {[
            { label: '🏠 Dashboard', path: '/dashboard' },
            { label: '📋 Tasks', path: '/tasks' },
            { label: '👥 Teams', path: '/teams' },
            ...(isAdmin ? [{ label: '📊 Performance', path: '/performance' }] : [])
          ].map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false) }}
              style={{ width: '100%', padding: '0.65rem 1rem', background: 'none', color: '#E2E8F0', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'left' }}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '1.5rem', marginTop: 'auto' }}>
          <button onClick={logout}
            style={{ width: '100%', padding: '0.75rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Navbar */}
      <nav style={{ background: '#1E293B', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.3)', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span onClick={() => navigate('/dashboard')} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>✅</span>
<span onClick={() => navigate('/dashboard')} style={{ fontSize: '1.2rem', fontWeight: '700', color: '#6366F1', cursor: 'pointer' }}>TaskManager</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/tasks')} style={{ padding: '0.5rem 1rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            📋 Tasks
          </button>
          <button onClick={() => navigate('/teams')} style={{ padding: '0.5rem 1rem', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            👥 Teams
          </button>
          {isAdmin && (
            <button onClick={() => navigate('/performance')} style={{ padding: '0.5rem 1rem', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
              📊 Performance
            </button>
          )}
          {/* ✅ Profile Button */}
          <button onClick={() => setSidebarOpen(true)}
            style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: 'white', border: 'none', cursor: 'pointer',
              fontWeight: '700', fontSize: '1rem', display: 'flex',
              alignItems: 'center', justifyContent: 'center'
            }}>
            {(user.username || 'U')[0].toUpperCase()}
          </button>
        </div>
      </nav>

      {/* Main Content - Same rakha */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#E2E8F0' }}>📋 Tasks</h2>
          <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>Manage and track all your tasks</p>
        </div>

        {error && (
          <div style={{ background: '#450A0A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {isAdmin && (
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #334155' }}>
            <h3 style={{ color: '#E2E8F0', marginBottom: '1rem', fontSize: '1.1rem' }}>➕ Create New Task</h3>
            <form onSubmit={createTask}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Task title" value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }} required />
                <input type="text" placeholder="Description" value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }} />
                <select value={newTask.project_id} onChange={e => setNewTask({ ...newTask, project_id: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={newTask.assigned_to} onChange={e => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}>
                  <option value="">Assign to User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }}>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <input type="date" value={newTask.due_date}
                  onChange={e => setNewTask({ ...newTask, due_date: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }} />
              </div>
              <button type="submit" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                Create Task
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['All', 'To Do', 'In Progress', 'Done'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '0.5rem 1.25rem', background: filter === f ? '#6366F1' : '#1E293B', color: filter === f ? 'white' : '#94A3B8', border: '1px solid #334155', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              {f}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#94A3B8', fontSize: '0.9rem', alignSelf: 'center' }}>{filteredTasks.length} tasks</span>
        </div>

        {filteredTasks.length === 0 ? (
          <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <p style={{ color: '#94A3B8' }}>No tasks found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {filteredTasks.map(task => (
              <div key={task.id} style={{ background: '#1E293B', padding: '1.25rem 1.5rem', borderRadius: '12px', border: '1px solid #334155', borderLeft: `4px solid ${priorityColor[task.priority] || '#6366F1'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                      <h4 style={{ color: '#E2E8F0', margin: 0, fontSize: '1rem' }}>{task.title}</h4>
                      <span style={{ background: priorityColor[task.priority] + '22', color: priorityColor[task.priority], padding: '0.15rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                        {task.priority}
                      </span>
                    </div>
                    <p style={{ color: '#94A3B8', margin: '0 0 0.5rem', fontSize: '0.9rem' }}>{task.description || 'No description'}</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748B' }}>
                      {task.project_name && <span>📁 {task.project_name}</span>}
                      {task.assigned_username && <span>👤 {task.assigned_username}</span>}
                      {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select value={task.status} onChange={e => updateStatus(task.id, e.target.value)}
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', background: statusColor[task.status] + '22', color: statusColor[task.status], border: `1px solid ${statusColor[task.status]}`, borderRadius: '8px', cursor: 'pointer' }}>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {isAdmin && (
                      <button onClick={() => deleteTask(task.id)}
                        style={{ padding: '0.4rem 0.75rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks
