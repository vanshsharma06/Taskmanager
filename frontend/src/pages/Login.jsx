import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, form)
      localStorage.setItem('token', res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid username or password')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1E293B', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#6366F1' }}>TaskManager</h1>
          <p style={{ color: '#94A3B8', marginTop: '0.5rem' }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{ background: '#450A0A', border: '1px solid #EF4444', color: '#FCA5A5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Username</label>
            <input type="text" placeholder="Enter your username" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem' }} required />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>Password</label>
            <input type="password" placeholder="Enter your password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '1rem' }} required />
          </div>
          <button type="submit" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#94A3B8', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: '600' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

