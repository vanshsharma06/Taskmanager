import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Teams() {
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [newTeam, setNewTeam] = useState({ name: '', description: '' })
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [addUserId, setAddUserId] = useState('')
  const [error, setError] = useState('')
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
      const [t, u] = await Promise.all([
        axios.get('$\{import.meta.env.VITE_API_URL\}/api/teams', { headers }),
        axios.get('$\{import.meta.env.VITE_API_URL\}/api/users', { headers })
      ])
      setTeams(t.data)
      setUsers(u.data)
    } catch (err) {
      setError('Failed to load data')
    }
  }

  const createTeam = async (e) => {
    e.preventDefault()
    try {
      await axios.post('$\{import.meta.env.VITE_API_URL\}/api/teams', newTeam, { headers })
      setNewTeam({ name: '', description: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create team')
    }
  }

  const deleteTeam = async (id) => {
    try {
      await axios.delete(`$\{import.meta.env.VITE_API_URL\}/api/teams/${id}`, { headers })
      if (selectedTeam?.id === id) setSelectedTeam(null)
      fetchAll()
    } catch (err) {
      setError('Failed to delete team')
    }
  }

  const addMember = async (e) => {
    e.preventDefault()
    if (!addUserId || !selectedTeam) return
    try {
      await axios.post(`$\{import.meta.env.VITE_API_URL\}/api/teams/${selectedTeam.id}/members`, { user_id: addUserId }, { headers })
      setAddUserId('')
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member')
    }
  }

  const removeMember = async (teamId, userId) => {
    try {
      await axios.delete(`$\{import.meta.env.VITE_API_URL\}/api/teams/${teamId}/members/${userId}`, { headers })
      fetchAll()
    } catch (err) {
      setError('Failed to remove member')
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

      {/* Main Content */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#E2E8F0' }}>👥 Teams</h2>
          <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>Manage your teams and members</p>
        </div>

        {error && (
          <div style={{ background: '#450A0A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {isAdmin && (
          <div style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #334155' }}>
            <h3 style={{ color: '#E2E8F0', marginBottom: '1rem', fontSize: '1.1rem' }}>➕ Create New Team</h3>
            <form onSubmit={createTeam}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <input type="text" placeholder="Team name" value={newTeam.name}
                  onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }} required />
                <input type="text" placeholder="Description" value={newTeam.description}
                  onChange={e => setNewTeam({ ...newTeam, description: e.target.value })}
                  style={{ padding: '0.75rem 1rem', fontSize: '1rem' }} />
              </div>
              <button type="submit" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
                Create Team
              </button>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selectedTeam ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <div>
            <h3 style={{ color: '#E2E8F0', marginBottom: '1rem', fontSize: '1.1rem' }}>🏢 All Teams</h3>
            {teams.length === 0 ? (
              <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                <p style={{ color: '#94A3B8' }}>No teams yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {teams.map(team => (
                  <div key={team.id}
                    style={{ background: selectedTeam?.id === team.id ? '#1E3A5F' : '#1E293B', padding: '1.25rem 1.5rem', borderRadius: '12px', border: selectedTeam?.id === team.id ? '1px solid #6366F1' : '1px solid #334155', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setSelectedTeam(selectedTeam?.id === team.id ? null : team)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#E2E8F0', margin: 0, fontSize: '1rem' }}>🏷️ {team.name}</h4>
                        <p style={{ color: '#94A3B8', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>{team.description || 'No description'}</p>
                        <p style={{ color: '#6366F1', margin: '0.25rem 0 0', fontSize: '0.8rem' }}>{team.member_count || 0} members</p>
                      </div>
                      {isAdmin && (
                        <button onClick={e => { e.stopPropagation(); deleteTeam(team.id) }}
                          style={{ padding: '0.4rem 0.75rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedTeam && (
            <div>
              <h3 style={{ color: '#E2E8F0', marginBottom: '1rem', fontSize: '1.1rem' }}>👤 {selectedTeam.name} — Members</h3>
              {isAdmin && (
                <form onSubmit={addMember} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <select value={addUserId} onChange={e => setAddUserId(e.target.value)}
                    style={{ flex: 1, padding: '0.75rem 1rem', fontSize: '0.9rem' }}>
                    <option value="">Select user to add</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username} ({u.role})</option>)}
                  </select>
                  <button type="submit" style={{ padding: '0.75rem 1rem', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                    Add
                  </button>
                </form>
              )}
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {(selectedTeam.members || []).length === 0 ? (
                  <div style={{ background: '#1E293B', padding: '2rem', borderRadius: '12px', textAlign: 'center', border: '1px solid #334155' }}>
                    <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No members yet</p>
                  </div>
                ) : (
                  selectedTeam.members.map(m => (
                    <div key={m.id} style={{ background: '#1E293B', padding: '0.9rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #334155' }}>
                      <div>
                        <span style={{ color: '#E2E8F0', fontWeight: '600', fontSize: '0.95rem' }}>👤 {m.username}</span>
                        <span style={{ background: m.role === 'Admin' ? '#6366F122' : '#10B98122', color: m.role === 'Admin' ? '#6366F1' : '#10B981', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                          {m.role}
                        </span>
                      </div>
                      {isAdmin && (
                        <button onClick={() => removeMember(selectedTeam.id, m.id)}
                          style={{ padding: '0.35rem 0.75rem', background: '#EF444422', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Teams
