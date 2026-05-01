import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'Member' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1E293B', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚀</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#6366F1' }}>Create Account</h1>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>Join TaskManager today</p>
        </div>

        {error && (
          <div style={{ background: '#450A0A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Username</label>
            <input type="text" placeholder="Choose a username" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem' }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Email</label>
            <input type="text" inputMode="email" placeholder="Enter your email" value={form.email}
  onChange={e => setForm({ ...form, email: e.target.value })}
  autoComplete="new-password"
  style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem' }} required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem' }} required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem' }}>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
            Create Account
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
