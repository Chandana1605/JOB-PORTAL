import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (role) => {
    const demos = {
      candidate: { email: 'candidate@demo.com', password: 'demo123' },
      recruiter: { email: 'recruiter@demo.com', password: 'demo123' },
      admin: { email: 'admin@demo.com', password: 'demo123' },
    };
    setLoading(true);
    try {
      const user = await login(demos[role].email, demos[role].password);
      navigate(`/${user.role}/dashboard`);
    } catch {
      toast.error('Demo account not set up. Please register.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo"><FiBriefcase /> JobPortal</Link>
        <div className="auth-quote">
          <h2>"The right opportunity is just one application away."</h2>
          <p>Join thousands of professionals finding their dream roles.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account</p>

          <div className="demo-btns">
            <span className="demo-label">Try demo:</span>
            {['candidate', 'recruiter', 'admin'].map(role => (
              <button key={role} className="demo-btn" onClick={() => demoLogin(role)}>{role}</button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-with-icon">
                <FiMail className="input-icon" />
                <input type="email" className="form-control" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </div>
    </div>
  );
}
