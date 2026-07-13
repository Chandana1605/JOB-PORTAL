import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Register() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'candidate', company: { name: '' } });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-logo"><FiBriefcase /> JobPortal</Link>
        <div className="auth-quote">
          <h2>"Your career journey starts with a single step."</h2>
          <p>Create your free account and get matched with the right opportunities.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join JobPortal today</p>

          <div className="role-select">
            {[{ value: 'candidate', label: 'Job Seeker', icon: '👤' }, { value: 'recruiter', label: 'Recruiter', icon: '🏢' }].map(r => (
              <label key={r.value} className="role-option">
                <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={e => setForm({ ...form, role: e.target.value })} />
                <span className="role-label"><span className="icon">{r.icon}</span>{r.label}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            {form.role === 'recruiter' && (
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input className="form-control" placeholder="Acme Corp" value={form.company.name} onChange={e => setForm({ ...form, company: { ...form.company, name: e.target.value } })} required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
