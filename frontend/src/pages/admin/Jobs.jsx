import './AdminTable.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { adminAPI } from '../../services/api';
import { FiSearch, FiStar, FiToggleLeft, FiToggleRight, FiUsers, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchJobs(); }, [search, status, page]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getJobs({ search, status, page, limit: 15 });
      setJobs(data.jobs); setTotal(data.total); setPages(data.pages);
    } catch {} finally { setLoading(false); }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const next = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await adminAPI.toggleJobStatus(id, next);
      setJobs(prev => prev.map(j => j._id === id ? { ...j, status: next } : j));
      toast.success(`Job ${next}`);
    } catch { toast.error('Failed'); }
  };

  const handleFeaturedToggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleFeatured(id);
      setJobs(prev => prev.map(j => j._id === id ? { ...j, featured: data.job.featured } : j));
      toast.success(data.job.featured ? 'Job featured!' : 'Removed from featured');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="admin-layout">
        <aside className="admin-sidebar card">
          <h3 className="admin-sidebar-title">Admin Panel</h3>
          <nav>
            <Link to="/admin/dashboard" className="sidebar-link"><FiTrendingUp /> Dashboard</Link>
            <Link to="/admin/users" className="sidebar-link"><FiUsers /> Manage Users</Link>
            <Link to="/admin/jobs" className="sidebar-link active"><FiBriefcase /> Manage Jobs</Link>
          </nav>
        </aside>
        <main className="admin-main">
          <div className="page-title-bar">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Jobs <span className="count-badge">{total}</span></h1>
          </div>
          <div className="card" style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search jobs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-control" style={{ width: 150 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Job</th><th>Company</th><th>Location</th><th>Type</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</td></tr>
                ) : jobs.map(j => (
                  <tr key={j._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{j.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(j.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{j.company?.name || j.recruiter?.company?.name}</td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{j.location}</td>
                    <td><span className="badge badge-gray">{j.type}</span></td>
                    <td><span className={`badge badge-${j.status === 'active' ? 'success' : 'gray'}`}>{j.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="icon-btn" title="Toggle featured" onClick={() => handleFeaturedToggle(j._id)}>
                          <FiStar size={18} color={j.featured ? 'var(--accent)' : 'var(--text-light)'} fill={j.featured ? 'var(--accent)' : 'none'} />
                        </button>
                        <button className="icon-btn" title={j.status === 'active' ? 'Pause' : 'Activate'} onClick={() => handleStatusToggle(j._id, j.status)}>
                          {j.status === 'active' ? <FiToggleRight size={20} color="var(--secondary)" /> : <FiToggleLeft size={20} color="var(--text-light)" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
