import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { jobAPI } from '../../services/api';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './PostJob.css';

const INITIAL = {
  title: '', description: '', location: '', type: 'full-time', category: '',
  skills: [], requirements: [], responsibilities: [],
  experience: { min: 0, max: 5 },
  salary: { min: '', max: '', currency: 'USD', disclosed: true },
  deadline: '',
};

export default function PostJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [skillInput, setSkillInput] = useState('');
  const [reqInput, setReqInput] = useState('');
  const [respInput, setRespInput] = useState('');
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (id) {
      jobAPI.getJob(id).then(r => {
        const j = r.data.job;
        setForm({ ...j, salary: j.salary || INITIAL.salary, experience: j.experience || INITIAL.experience });
      });
    }
  }, [id]);

  const addItem = (field, val, setter) => {
    if (val.trim()) {
      setForm(prev => ({ ...prev, [field]: [...prev[field], val.trim()] }));
      setter('');
    }
  };

  const removeItem = (field, idx) => setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skills.length === 0) return toast.error('Add at least one skill');
    setSaving(true);
    try {
      if (isEdit) {
        await jobAPI.updateJob(id, form);
        toast.success('Job updated!');
      } else {
        await jobAPI.createJob(form);
        toast.success('Job posted!');
      }
      navigate('/recruiter/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save job');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="post-job-page">
        <h1 className="pj-title">{isEdit ? 'Edit Job' : 'Post a New Job'}</h1>
        <form onSubmit={handleSubmit} className="post-job-form">
          <div className="card">
            <h3 className="section-h">Basic Information</h3>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Job Title *</label>
                <input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior React Developer" />
              </div>
              <div className="form-group">
                <label className="form-label">Location *</label>
                <input className="form-control" required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Bangalore, India or Remote" />
              </div>
              <div className="form-group">
                <label className="form-label">Job Type *</label>
                <select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Engineering, Marketing" />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input type="date" className="form-control" value={form.deadline?.split('T')[0] || ''} onChange={e => setForm({ ...form, deadline: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Job Description *</label>
                <textarea className="form-control" rows={6} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the role, team, and what makes it exciting..." />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-h">Compensation & Experience</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Min Experience (years)</label>
                <input type="number" className="form-control" min={0} value={form.experience.min} onChange={e => setForm({ ...form, experience: { ...form.experience, min: Number(e.target.value) } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Experience (years)</label>
                <input type="number" className="form-control" min={0} value={form.experience.max} onChange={e => setForm({ ...form, experience: { ...form.experience, max: Number(e.target.value) } })} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Salary</label>
                <input type="number" className="form-control" value={form.salary.min} onChange={e => setForm({ ...form, salary: { ...form.salary, min: e.target.value } })} placeholder="e.g. 50000" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Salary</label>
                <input type="number" className="form-control" value={form.salary.max} onChange={e => setForm({ ...form, salary: { ...form.salary, max: e.target.value } })} placeholder="e.g. 100000" />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-control" value={form.salary.currency} onChange={e => setForm({ ...form, salary: { ...form.salary, currency: e.target.value } })}>
                  {['USD', 'INR', 'EUR', 'GBP', 'AUD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
                <input type="checkbox" id="salary-disclosed" checked={form.salary.disclosed} onChange={e => setForm({ ...form, salary: { ...form.salary, disclosed: e.target.checked } })} />
                <label htmlFor="salary-disclosed" style={{ fontSize: 14 }}>Show salary to candidates</label>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-h">Skills Required *</h3>
            <div className="add-item-row">
              <input className="form-control" placeholder="Add a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('skills', skillInput, setSkillInput))} />
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('skills', skillInput, setSkillInput)}><FiPlus /> Add</button>
            </div>
            <div className="skills-wrap" style={{ marginTop: 12 }}>
              {form.skills.map((s, i) => (
                <span key={s} className="skill-tag skill-removable">
                  {s} <button type="button" className="remove-skill" onClick={() => removeItem('skills', i)}><FiTrash2 size={12} /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-h">Requirements & Responsibilities</h3>
            <div className="two-col-lists">
              <div>
                <label className="form-label">Requirements</label>
                <div className="add-item-row">
                  <input className="form-control" placeholder="Add requirement..." value={reqInput} onChange={e => setReqInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('requirements', reqInput, setReqInput))} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('requirements', reqInput, setReqInput)}><FiPlus /></button>
                </div>
                <ul className="item-list">{form.requirements.map((r, i) => <li key={i}>{r} <button type="button" onClick={() => removeItem('requirements', i)}><FiTrash2 size={12} /></button></li>)}</ul>
              </div>
              <div>
                <label className="form-label">Responsibilities</label>
                <div className="add-item-row">
                  <input className="form-control" placeholder="Add responsibility..." value={respInput} onChange={e => setRespInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('responsibilities', respInput, setRespInput))} />
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => addItem('responsibilities', respInput, setRespInput)}><FiPlus /></button>
                </div>
                <ul className="item-list">{form.responsibilities.map((r, i) => <li key={i}>{r} <button type="button" onClick={() => removeItem('responsibilities', i)}><FiTrash2 size={12} /></button></li>)}</ul>
              </div>
            </div>
          </div>

          <div className="pj-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/recruiter/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Update Job' : 'Post Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
