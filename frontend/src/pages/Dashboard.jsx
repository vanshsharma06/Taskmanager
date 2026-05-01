import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [updateMsg, setUpdateMsg] = useState('')
  const sidebarRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(atob(token.split('.')[1]))
  const isAdmin = user.role === 'Admin'
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/'); return }
    setEditName(user.username || '')
    fetchProjects()
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false)
        setEditMode(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects`, { headers })
      setProjects(res.data)
    } catch (err) {
      setError('Failed to load projects')
    }
  }

  const createProject = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/projects`, newProject, { headers })
      setNewProject({ name: '', description: '' })
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project')
    }
  }

  const deleteProject = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/${id}`, { headers })
      fetchProjects()
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  const updateProfile = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, { username: editName }, { headers })
      setUpdateMsg('Profile updated!')
      setEditMode(false)
      setTimeout(() => setUpdateMsg(''), 2000)
    } catch (err) {
      setUpdateMsg('Failed to update')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

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
        {/* Sidebar Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#E2E8F0', fontWeight: '700', fontSize: '1.1rem' }}>My Profile</span>
          <button onClick={() => { setSidebarOpen(false); setEditMode(false) }}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
        </div>

        {/* Avatar + Info */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: '700', fontSize: '1.8rem',
            margin: '0 auto 1rem'
          }}>
            {(user.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ color: '#E2E8F0', fontWeight: '700', fontSize: '1.1rem' }}>{user.username}</div>
          <div style={{ color: isAdmin ? '#6366F1' : '#10B981', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {isAdmin ? '👑 Admin' : '👤 Member'}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.25rem' }}>{user.email || ''}</div>
        </div>

        {/* Navigation Links */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>NAVIGATION</div>
          {[
            { label: '🏠 Dashboard', path: '/dashboard', color: '#6366F1' },
            { label: '📋 Tasks', path: '/tasks', color: '#10B981' },
            { label: '👥 Teams', path: '/teams', color: '#8B5CF6' },
            ...(isAdmin ? [{ label: '📊 Performance', path: '/performance', color: '#F59E0B' }] : [])
          ].map(item => (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false) }}
              style={{ width: '100%', padding: '0.65rem 1rem', background: 'none', color: '#E2E8F0', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', textAlign: 'left' }}>
              {item.label}
            </button>
          ))}
        </div>

        {/* Logout */}
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

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#E2E8F0' }}>Dashboard</h2>
          <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>Welcome back, <span style={{ color: '#6366F1', fontWeight: '600' }}>{user.username || 'User'}</span></p>
        </div>

        {error && (
          <div style={{ background: '#450A0A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#6366F1' }}>{projects.length}</div>
            <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Total Projects</div>
          </div>
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#10B981' }}>{isAdmin ? 'Admin' : 'Member'}</div>
            <div style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.25rem' }}>Your Role</div>
          </div>
        </div>

        {isAdmin && (
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #334155' }}>
            <h3 style={{ color: '#E2E8F0', marginBottom: '1rem', fontSize: '1.1rem' }}>➕ Create New Project</h3>
            <form onSubmit={createProject}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Project name" value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem', width: '100%' }} required />
                <input type="text" placeholder="Description" value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem', width: '100%' }} />
              </div>
              <button type="submit" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                Create Project
              </button>
            </form>
          </div>
        )}

        <h3 style={{ color: '#E2E8F0', marginBottom: '1rem', fontSize: '1.1rem' }}>📁 Projects</h3>
        {projects.length === 0 && (
          <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
            <p style={{ color: '#94A3B8' }}>No projects yet</p>
          </div>
        )}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map(p => (
            <div key={p.id} style={{ background: '#1E293B', padding: '1.25rem 1.5rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
              <div>
                <h4 style={{ color: '#E2E8F0', margin: 0, fontSize: '1rem' }}>📌 {p.name}</h4>
                <p style={{ color: '#94A3B8', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>{p.description || 'No description'}</p>
              </div>
              {isAdmin && (
                <button onClick={() => deleteProject(p.id)} style={{ padding: '0.5rem 1rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard