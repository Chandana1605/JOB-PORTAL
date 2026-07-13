import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import { FiBriefcase, FiUsers, FiEye, FiPlus, FiEdit2, FiTrash2, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './RecruiterDashboard.css';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobAPI.getRecruiterJobs().then(r => setJobs(r.data.jobs)),
      applicationAPI.getRecruiterApplications().then(r => setApplications(r.data.applications.slice(0, 6))),
    ]).finally(() => setLoading(false));
  }, []);

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    try {
      await jobAPI.deleteJob(id);
      setJobs(prev => prev.filter(j => j._id !== id));
      toast.success('Job deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalApplicants = jobs.reduce((acc, j) => acc + (j.applicationCount || 0), 0);
  const activeJobs = jobs.filter(j => j.status === 'active').length;

  const stats = [
    { icon: <FiBriefcase />, label: 'Total Jobs', value: jobs.length, color: '#0A66C2' },
    { icon: <FiBriefcase />, label: 'Active Jobs', value: activeJobs, color: '#057642' },
    { icon: <FiUsers />, label: 'Total Applicants', value: totalApplicants, color: '#E65100' },
    { icon: <FiUsers />, label: 'New Today', value: applications.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length, color: '#6A1B9A' },
  ];

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="card profile-card">
            <div className="company-avatar">
              {user?.company?.logo ? <img src={user.company.logo} alt="" /> : <span>{user?.company?.name?.[0] || user?.name?.[0] || 'R'}</span>}
            </div>
            <h3 className="profile-name">{user?.company?.name || user?.name}</h3>
            <p className="profile-sub">{user?.company?.industry || 'Recruiter'}</p>
            <Link to="/recruiter/profile" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>Edit Company</Link>
          </div>
          <div className="card sidebar-nav">
            <Link to="/recruiter/dashboard" className="sidebar-link active"><FiBriefcase /> Dashboard</Link>
            <Link to="/recruiter/post-job" className="sidebar-link"><FiPlus /> Post a Job</Link>
            <Link to="/recruiter/applications" className="sidebar-link"><FiUsers /> Applications</Link>
            <Link to="/recruiter/profile" className="sidebar-link"><FiEye /> Company Profile</Link>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-welcome">
            <h1>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Manage your job listings and track applicants.</p>
          </div>

          <div className="stats-grid-4">
            {stats.map(s => (
              <div key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
                <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Jobs List */}
          <div className="card">
            <div className="section-header">
              <h2>Your Job Listings</h2>
              <Link to="/recruiter/post-job" className="btn btn-primary btn-sm"><FiPlus /> Post Job</Link>
            </div>
            {loading ? <div className="loading-placeholder" /> :
              jobs.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <p>No jobs posted yet. <Link to="/recruiter/post-job" style={{ color: 'var(--primary)' }}>Post your first job</Link></p>
                </div>
              ) : (
                <div className="recruiter-jobs-list">
                  {jobs.map(job => (
                    <div key={job._id} className="recruiter-job-item">
                      <div className="rji-info">
                        <div className="rji-title">{job.title}</div>
                        <div className="rji-meta">
                          <span>{job.location}</span> · <span>{job.type}</span> ·
                          <span className={`badge badge-${job.status === 'active' ? 'success' : 'gray'}`}>{job.status}</span>
                        </div>
                      </div>
                      <div className="rji-stats">
                        <span className="rji-count"><FiUsers size={14} /> {job.applicationCount || 0} applicants</span>
                        <span className="rji-count"><FiEye size={14} /> {job.views || 0} views</span>
                      </div>
                      <div className="rji-actions">
                        <Link to={`/recruiter/post-job/${job._id}`} className="icon-btn"><FiEdit2 /></Link>
                        <button className="icon-btn" onClick={() => handleDeleteJob(job._id)}><FiTrash2 /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Recent Applications */}
          <div className="card">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/recruiter/applications" className="view-all">View All <FiChevronRight /></Link>
            </div>
            {applications.length === 0 ? <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>No applications yet</p> :
              <div className="applications-list">
                {applications.map(app => (
                  <div key={app._id} className="app-item">
                    <div className="app-info">
                      <div className="app-title">{app.candidate?.name}</div>
                      <div className="app-company">{app.job?.title}</div>
                      <div className="app-date">{new Date(app.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="app-right">
                      <span className={`badge status-${app.status}`}>{app.status}</span>
                      <span className="match-chip">{app.matchScore}% match</span>
                    </div>
                  </div>
                ))}
              </div>}
          </div>
        </main>
      </div>
    </div>
  );
}
