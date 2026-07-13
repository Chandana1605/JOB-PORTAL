import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { jobAPI, applicationAPI } from '../../services/api';
import JobCard from '../../components/jobs/JobCard';
import { FiBriefcase, FiSend, FiBookmark, FiTrendingUp, FiUser, FiFileText, FiChevronRight } from 'react-icons/fi';
import './CandidateDashboard.css';

const STATUS_COLORS = { applied: 'primary', viewed: 'warning', shortlisted: 'success', interview: 'warning', rejected: 'danger', accepted: 'success' };

export default function CandidateDashboard() {
  const { user } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      jobAPI.getRecommended().then(r => setRecommended(r.data.jobs.slice(0, 4))),
      applicationAPI.getCandidateApplications().then(r => setApplications(r.data.applications.slice(0, 5))),
    ]).finally(() => setLoading(false));
  }, []);

  const stats = [
    { icon: <FiSend />, label: 'Applications', value: applications.length, link: '/candidate/applications', color: '#0A66C2' },
    { icon: <FiBookmark />, label: 'Saved Jobs', value: user?.savedJobs?.length || 0, link: '/candidate/saved', color: '#057642' },
    { icon: <FiTrendingUp />, label: 'Profile Score', value: `${user?.profileCompletion || 0}%`, link: '/candidate/profile', color: '#E65100' },
    { icon: <FiFileText />, label: 'Resume', value: user?.resume?.url || user?.resume?.data ? 'Ready' : 'Pending', link: '/candidate/resume', color: '#6A1B9A' },
  ];

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="dashboard-layout">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="card profile-card">
            <div className="profile-avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="avatar-img" /> : <div className="avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>}
            </div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-sub">{user?.location || 'Location not set'}</p>
            <div className="completion-section">
              <div className="completion-label">
                <span>Profile Completion</span>
                <strong>{user?.profileCompletion || 0}%</strong>
              </div>
              <div className="completion-bar">
                <div className="completion-fill" style={{ width: `${user?.profileCompletion || 0}%` }} />
              </div>
            </div>
            <Link to="/candidate/profile" className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
              <FiUser /> Edit Profile
            </Link>
          </div>

          <div className="card sidebar-nav">
            <Link to="/candidate/dashboard" className="sidebar-link active"><FiTrendingUp /> Dashboard</Link>
            <Link to="/candidate/applications" className="sidebar-link"><FiSend /> My Applications</Link>
            <Link to="/candidate/saved" className="sidebar-link"><FiBookmark /> Saved Jobs</Link>
            <Link to="/candidate/resume" className="sidebar-link"><FiFileText /> Resume Builder</Link>
            <Link to="/jobs" className="sidebar-link"><FiBriefcase /> Browse Jobs</Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <div className="dashboard-welcome">
            <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
            <p>Here's what's happening with your job search today.</p>
          </div>

          {/* Stats */}
          <div className="stats-grid-4">
            {stats.map(s => (
              <Link to={s.link} key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
                <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                <div className="stat-card-value">{s.value}</div>
                <div className="stat-card-label">{s.label}</div>
              </Link>
            ))}
          </div>

          {/* Skills */}
          {user?.skills?.length > 0 && (
            <div className="card">
              <div className="section-header">
                <h2>Your Skills</h2>
                <Link to="/candidate/profile" className="view-all">Edit <FiChevronRight /></Link>
              </div>
              <div className="skills-wrap">
                {user.skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
              </div>
            </div>
          )}

          {/* Recent Applications */}
          <div className="card">
            <div className="section-header">
              <h2>Recent Applications</h2>
              <Link to="/candidate/applications" className="view-all">View All <FiChevronRight /></Link>
            </div>
            {loading ? <div className="loading-placeholder" /> :
              applications.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <p>No applications yet. <Link to="/jobs" style={{ color: 'var(--primary)' }}>Browse jobs</Link></p>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map(app => (
                    <div key={app._id} className="app-item">
                      <div className="app-info">
                        <div className="app-title">{app.job?.title}</div>
                        <div className="app-company">{app.job?.company?.name} • {app.job?.location}</div>
                        <div className="app-date">{new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="app-right">
                        <span className={`badge status-${app.status}`}>{app.status}</span>
                        {app.matchScore > 0 && <span className="match-chip">{app.matchScore}% match</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Recommended Jobs */}
          <div>
            <div className="section-header">
              <h2>Recommended for You</h2>
              <Link to="/jobs" className="view-all">See All <FiChevronRight /></Link>
            </div>
            {loading ? <div className="loading-placeholder" /> :
              recommended.length === 0 ? (
                <div className="card"><p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>Complete your profile to get recommendations</p></div>
              ) : (
                <div className="recommended-grid">
                  {recommended.map(job => <JobCard key={job._id} job={job} />)}
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
