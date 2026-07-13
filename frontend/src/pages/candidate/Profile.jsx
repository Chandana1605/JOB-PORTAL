import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { FiPlus, FiTrash2, FiSave, FiUser, FiBriefcase, FiBook, FiTag } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Profile.css';

export default function CandidateProfile() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    name: '', phone: '', location: '', bio: '', website: '', linkedin: '', github: '',
    skills: [], experience: [], education: [], expectedSalary: '', jobType: '',
  });

  useEffect(() => {
    if (user) setForm({
      name: user.name || '', phone: user.phone || '', location: user.location || '',
      bio: user.bio || '', website: user.website || '', linkedin: user.linkedin || '',
      github: user.github || '', skills: user.skills || [],
      experience: user.experience || [], education: user.education || [],
      expectedSalary: user.expectedSalary || '', jobType: user.jobType || '',
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setForm(prev => ({ ...prev, skills: prev.skills.filter(x => x !== s) }));

  const addExperience = () => setForm(prev => ({
    ...prev, experience: [...prev.experience, { title: '', company: '', location: '', from: '', to: '', current: false, description: '' }]
  }));

  const updateExperience = (i, field, val) => {
    const updated = [...form.experience];
    updated[i] = { ...updated[i], [field]: val };
    setForm(prev => ({ ...prev, experience: updated }));
  };

  const removeExperience = (i) => setForm(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }));

  const addEducation = () => setForm(prev => ({
    ...prev, education: [...prev.education, { institution: '', degree: '', field: '', from: '', to: '', current: false }]
  }));

  const updateEducation = (i, field, val) => {
    const updated = [...form.education];
    updated[i] = { ...updated[i], [field]: val };
    setForm(prev => ({ ...prev, education: updated }));
  };

  const removeEducation = (i) => setForm(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }));

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FiUser /> },
    { id: 'experience', label: 'Experience', icon: <FiBriefcase /> },
    { id: 'education', label: 'Education', icon: <FiBook /> },
    { id: 'skills', label: 'Skills', icon: <FiTag /> },
  ];

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="profile-page">
        <div className="profile-header-bar">
          <h1>My Profile</h1>
          <div className="completion-chip">
            <span>Profile: {user?.profileCompletion || 0}%</span>
            <div className="mini-bar"><div className="mini-fill" style={{ width: `${user?.profileCompletion || 0}%` }} /></div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="card profile-form">
          {activeTab === 'basic' && (
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="City, Country" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Salary (Annual)</label>
                <input type="number" className="form-control" value={form.expectedSalary} onChange={e => setForm({ ...form, expectedSalary: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Job Type</label>
                <select className="form-control" value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}>
                  <option value="">Select...</option>
                  {['full-time', 'part-time', 'contract', 'internship', 'remote'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-control" rows={4} placeholder="Tell recruiters about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input className="form-control" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={e => setForm({ ...form, linkedin: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input className="form-control" placeholder="https://github.com/..." value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Portfolio/Website</label>
                <input className="form-control" placeholder="https://yoursite.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>
          )}

          {activeTab === 'experience' && (
            <div>
              <button className="btn btn-secondary btn-sm" onClick={addExperience} style={{ marginBottom: 20 }}>
                <FiPlus /> Add Experience
              </button>
              {form.experience.length === 0 && <p className="empty-notice">No experience added yet.</p>}
              {form.experience.map((exp, i) => (
                <div key={i} className="exp-card">
                  <div className="exp-card-header">
                    <span>Experience {i + 1}</span>
                    <button className="icon-danger-btn" onClick={() => removeExperience(i)}><FiTrash2 /></button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Job Title</label><input className="form-control" value={exp.title} onChange={e => updateExperience(i, 'title', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={exp.company} onChange={e => updateExperience(i, 'company', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Location</label><input className="form-control" value={exp.location} onChange={e => updateExperience(i, 'location', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">From</label><input type="date" className="form-control" value={exp.from?.split('T')[0] || ''} onChange={e => updateExperience(i, 'from', e.target.value)} /></div>
                    <div className="form-group">
                      <label className="form-label">To</label>
                      <input type="date" className="form-control" value={exp.to?.split('T')[0] || ''} onChange={e => updateExperience(i, 'to', e.target.value)} disabled={exp.current} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
                      <input type="checkbox" id={`current-${i}`} checked={exp.current} onChange={e => updateExperience(i, 'current', e.target.checked)} />
                      <label htmlFor={`current-${i}`} style={{ fontSize: 14 }}>Currently working here</label>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={3} value={exp.description} onChange={e => updateExperience(i, 'description', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'education' && (
            <div>
              <button className="btn btn-secondary btn-sm" onClick={addEducation} style={{ marginBottom: 20 }}>
                <FiPlus /> Add Education
              </button>
              {form.education.length === 0 && <p className="empty-notice">No education added yet.</p>}
              {form.education.map((edu, i) => (
                <div key={i} className="exp-card">
                  <div className="exp-card-header">
                    <span>Education {i + 1}</span>
                    <button className="icon-danger-btn" onClick={() => removeEducation(i)}><FiTrash2 /></button>
                  </div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Institution</label><input className="form-control" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Degree</label><input className="form-control" placeholder="B.Tech, MBA..." value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">Field of Study</label><input className="form-control" value={edu.field} onChange={e => updateEducation(i, 'field', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">From</label><input type="date" className="form-control" value={edu.from?.split('T')[0] || ''} onChange={e => updateEducation(i, 'from', e.target.value)} /></div>
                    <div className="form-group"><label className="form-label">To</label><input type="date" className="form-control" value={edu.to?.split('T')[0] || ''} onChange={e => updateEducation(i, 'to', e.target.value)} disabled={edu.current} /></div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 28 }}>
                      <input type="checkbox" id={`edu-current-${i}`} checked={edu.current} onChange={e => updateEducation(i, 'current', e.target.checked)} />
                      <label htmlFor={`edu-current-${i}`} style={{ fontSize: 14 }}>Currently studying</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <div className="skill-input-row">
                <input className="form-control" placeholder="Type a skill and press Enter or Add..." value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
                <button className="btn btn-primary btn-sm" onClick={addSkill}><FiPlus /> Add</button>
              </div>
              <div className="skills-wrap" style={{ marginTop: 16, gap: 10 }}>
                {form.skills.map(s => (
                  <span key={s} className="skill-tag skill-removable">
                    {s}
                    <button onClick={() => removeSkill(s)} className="remove-skill"><FiTrash2 size={12} /></button>
                  </span>
                ))}
                {form.skills.length === 0 && <p className="empty-notice">No skills added yet.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
