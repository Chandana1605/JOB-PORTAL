import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { applicationAPI } from '../../services/api';
import { FiMapPin, FiClock, FiTrendingUp, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './Applications.css';

const STATUS_ORDER = ['applied', 'viewed', 'shortlisted', 'interview', 'rejected', 'accepted'];

export default function CandidateApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await applicationAPI.getCandidateApplications();
      setApplications(data.applications);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoading(false); }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await applicationAPI.withdraw(id);
      setApplications(prev => prev.filter(a => a._id !== id));
      toast.success('Application withdrawn');
    } catch { toast.error('Failed to withdraw'); }
  };

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container">
        <div className="page-title-bar">
          <h1>My Applications <span className="count-badge">{applications.length}</span></h1>
          <select className="form-control" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            {STATUS_ORDER.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>

        {/* Status summary */}
        <div className="status-summary">
          {STATUS_ORDER.map(s => {
            const cnt = applications.filter(a => a.status === s).length;
            return (
              <button key={s} className={`status-pill ${filter === s ? 'selected' : ''} status-${s}`} onClick={() => setFilter(filter === s ? 'all' : s)}>
                {s} <strong>{cnt}</strong>
              </button>
            );
          })}
        </div>

        {loading ? <div className="loading-placeholder" style={{ height: 200 }} /> :
          filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>📋</div>
              <h3>No applications found</h3>
              <p>Applications with "{filter}" status will appear here.</p>
            </div>
          ) : (
            <div className="apps-list">
              {filtered.map(app => (
                <div key={app._id} className="app-card card">
                  <div className="app-card-main">
                    <div className="app-card-info">
                      <div className="app-company-logo">
                        {app.job?.company?.logo ? <img src={app.job.company.logo} alt="" /> : app.job?.company?.name?.[0] || 'C'}
                      </div>
                      <div className="app-details">
                        <h3 className="app-job-title">{app.job?.title}</h3>
                        <div className="app-meta">
                          <span>{app.job?.company?.name}</span>
                          <span><FiMapPin size={12} /> {app.job?.location}</span>
                          <span><FiClock size={12} /> {app.job?.type}</span>
                        </div>
                        <div className="app-date">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="app-card-right">
                      <span className={`badge status-${app.status}`}>{app.status}</span>
                      {app.matchScore > 0 && (
                        <div className="app-match">
                          <FiTrendingUp size={13} /> {app.matchScore}% match
                        </div>
                      )}
                      <div className="app-actions">
                        <button className="icon-btn" onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                          {expanded === app._id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                        {app.status === 'applied' && (
                          <button className="icon-btn" onClick={() => handleWithdraw(app._id)} title="Withdraw"><FiX /></button>
                        )}
                      </div>
                    </div>
                  </div>

                  {expanded === app._id && (
                    <div className="app-expanded">
                      {/* Timeline */}
                      <div className="timeline-section">
                        <h4>Application Timeline</h4>
                        <div className="timeline">
                          {app.timeline?.map((t, i) => (
                            <div key={i} className="timeline-item">
                              <div className={`timeline-dot status-dot-${t.status}`} />
                              <div className="timeline-content">
                                <div className="timeline-status">{t.status}</div>
                                <div className="timeline-date">{new Date(t.date).toLocaleDateString()}</div>
                                {t.note && <div className="timeline-note">{t.note}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills match */}
                      {(app.matchedSkills?.length > 0 || app.missingSkills?.length > 0) && (
                        <div className="skills-match-section">
                          <h4>Skills Analysis</h4>
                          {app.matchedSkills?.length > 0 && (
                            <div className="skill-group-row">
                              <span className="skill-group-lbl matched-lbl">✓ Matched</span>
                              <div className="skills-wrap">{app.matchedSkills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}</div>
                            </div>
                          )}
                          {app.missingSkills?.length > 0 && (
                            <div className="skill-group-row">
                              <span className="skill-group-lbl missing-lbl">✗ Missing</span>
                              <div className="skills-wrap">{app.missingSkills.map(s => <span key={s} className="skill-tag missing">{s}</span>)}</div>
                            </div>
                          )}
                        </div>
                      )}

                      {app.interviewDate && (
                        <div className="interview-alert">
                          🎯 Interview scheduled: <strong>{new Date(app.interviewDate).toLocaleString()}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
