import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Performance() {
  const [userData, setUserData] = useState([])
  const [teamData, setTeamData] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('users')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(atob(token.split('.')[1]))
  const isAdmin = user.role === 'Admin'
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!token) { navigate('/'); return }
    if (!isAdmin) { navigate('/dashboard'); return }
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
      const [u, t] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/performance`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/performance/teams`, { headers })
      ])
      setUserData(u.data)
      setTeamData(t.data)
    } catch (err) {
      setError('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const StatCard = ({ value, label, color }) => (
    <div style={{ background: '#0F172A', padding: '0.75rem', borderRadius: '10px', textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color }}>{value}</div>
      <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '0.2rem' }}>{label}</div>
    </div>
  )

  const ProgressBar = ({ rate }) => (
    <div style={{ background: '#334155', borderRadius: '99px', height: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
      <div style={{ width: `${rate}%`, height: '100%', background: rate >= 75 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444', borderRadius: '99px', transition: 'width 0.5s ease' }} />
    </div>
  )

  const RateBadge = ({ rate }) => (
    <div style={{ background: rate >= 75 ? '#10B98122' : rate >= 40 ? '#F59E0B22' : '#EF444422', color: rate >= 75 ? '#10B981' : rate >= 40 ? '#F59E0B' : '#EF4444', padding: '0.35rem 1rem', borderRadius: '20px', fontWeight: '700', fontSize: '1rem' }}>
      {rate}% Complete
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A' }}>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }} />
      )}

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
          <div style={{ color: '#6366F1', fontSize: '0.85rem', marginTop: '0.25rem' }}>👑 Admin</div>
          <div style={{ color: '#64748B', fontSize: '0.8rem', marginTop: '0.25rem' }}>{user.email || ''}</div>
        </div>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155' }}>
          <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }}>NAVIGATION</div>
          {[
            { label: '🏠 Dashboard', path: '/dashboard' },
            { label: '📋 Tasks', path: '/tasks' },
            { label: '👥 Teams', path: '/teams' },
            { label: '📊 Performance', path: '/performance' }
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
          <button onClick={() => navigate('/performance')} style={{ padding: '0.5rem 1rem', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            📊 Performance
          </button>
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

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#E2E8F0' }}>📊 Performance Tracker</h2>
          <p style={{ color: '#94A3B8', marginTop: '0.25rem' }}>Track task completion for users and teams</p>
        </div>

        {error && (
          <div style={{ background: '#450A0A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setActiveTab('users')}
            style={{ padding: '0.6rem 1.5rem', background: activeTab === 'users' ? '#6366F1' : '#1E293B', color: activeTab === 'users' ? 'white' : '#94A3B8', border: '1px solid #334155', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            👤 User Performance
          </button>
          <button onClick={() => setActiveTab('teams')}
            style={{ padding: '0.6rem 1.5rem', background: activeTab === 'teams' ? '#8B5CF6' : '#1E293B', color: activeTab === 'teams' ? 'white' : '#94A3B8', border: '1px solid #334155', borderRadius: '20px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
            👥 Team Performance
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94A3B8' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {activeTab === 'users' && (
              userData.length === 0 ? (
                <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                  <p style={{ color: '#94A3B8' }}>No users found</p>
                </div>
              ) : (
                userData.map(u => (
                  <div key={u.id} style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1rem' }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#E2E8F0', fontWeight: '600', fontSize: '1rem' }}>{u.username}</div>
                          <div style={{ color: u.role === 'Admin' ? '#6366F1' : '#10B981', fontSize: '0.8rem' }}>{u.role}</div>
                        </div>
                      </div>
                      <RateBadge rate={u.completionRate} />
                    </div>
                    <ProgressBar rate={u.completionRate} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                      <StatCard value={u.total} label="Total" color="#E2E8F0" />
                      <StatCard value={u.done} label="Done" color="#10B981" />
                      <StatCard value={u.inProgress} label="In Progress" color="#F59E0B" />
                      <StatCard value={u.todo} label="To Do" color="#6366F1" />
                    </div>
                  </div>
                ))
              )
            )}

            {activeTab === 'teams' && (
              teamData.length === 0 ? (
                <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                  <p style={{ color: '#94A3B8' }}>No teams found</p>
                </div>
              ) : (
                teamData.map(t => (
                  <div key={t.id} style={{ background: '#1E293B', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '1rem' }}>
                          {t.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#E2E8F0', fontWeight: '600', fontSize: '1rem' }}>{t.name}</div>
                          <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>{t.memberCount} members</div>
                        </div>
                      </div>
                      <RateBadge rate={t.completionRate} />
                    </div>
                    <ProgressBar rate={t.completionRate} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                      <StatCard value={t.total} label="Total" color="#E2E8F0" />
                      <StatCard value={t.done} label="Done" color="#10B981" />
                      <StatCard value={t.inProgress} label="In Progress" color="#F59E0B" />
                      <StatCard value={t.todo} label="To Do" color="#6366F1" />
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Performance