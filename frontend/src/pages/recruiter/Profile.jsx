import '../candidate/Profile.css';
import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RecruiterProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', location: '', bio: '', company: { name: '', description: '', website: '', size: '', industry: '', location: '' } });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', location: user.location || '', bio: user.bio || '', company: { name: user.company?.name || '', description: user.company?.description || '', website: user.company?.website || '', size: user.company?.size || '', industry: user.company?.industry || '', location: user.company?.location || '' } });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); } finally { setSaving(false); }
  };

  const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container" style={{ maxWidth: 860 }}>
        <div className="profile-header-bar">
          <h1>Company Profile</h1>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}><FiSave /> {saving ? 'Saving...' : 'Save Changes'}</button>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3 className="section-h">Personal Info</h3>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Your Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>
          </div>
        </div>

        <div className="card">
          <h3 className="section-h">Company Information</h3>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Company Name</label><input className="form-control" value={form.company.name} onChange={e => setForm({ ...form, company: { ...form.company, name: e.target.value } })} /></div>
            <div className="form-group"><label className="form-label">Industry</label><input className="form-control" placeholder="e.g. Technology, Finance" value={form.company.industry} onChange={e => setForm({ ...form, company: { ...form.company, industry: e.target.value } })} /></div>
            <div className="form-group"><label className="form-label">Company Size</label><select className="form-control" value={form.company.size} onChange={e => setForm({ ...form, company: { ...form.company, size: e.target.value } })}><option value="">Select...</option>{SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}</select></div>
            <div className="form-group"><label className="form-label">Website</label><input className="form-control" placeholder="https://..." value={form.company.website} onChange={e => setForm({ ...form, company: { ...form.company, website: e.target.value } })} /></div>
            <div className="form-group"><label className="form-label">Company Location</label><input className="form-control" value={form.company.location} onChange={e => setForm({ ...form, company: { ...form.company, location: e.target.value } })} /></div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Company Description</label><textarea className="form-control" rows={4} value={form.company.description} onChange={e => setForm({ ...form, company: { ...form.company, description: e.target.value } })} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
