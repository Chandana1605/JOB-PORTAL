import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import { applicationAPI, jobAPI } from '../../services/api';
import { FiChevronDown, FiChevronUp, FiMail, FiPhone, FiMapPin, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './RecruiterApplications.css';

const STATUSES = ['viewed', 'shortlisted', 'interview', 'rejected', 'accepted'];

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({ job: '', status: '' });
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      applicationAPI.getRecruiterApplications().then(r => setApplications(r.data.applications)),
      jobAPI.getRecruiterJobs().then(r => setJobs(r.data.jobs)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationAPI.updateStatus(appId, { status });
      setApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = applications.filter(a => {
    if (filter.job && a.job?._id !== filter.job) return false;
    if (filter.status && a.status !== filter.status) return false;
    return true;
  });

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container">
        <div className="page-title-bar">
          <h1>Applications <span className="count-badge">{filtered.length}</span></h1>
        </div>

        {/* Filters */}
        <div className="filters-row card">
          <select className="form-control" value={filter.job} onChange={e => setFilter({ ...filter, job: e.target.value })}>
            <option value="">All Jobs</option>
            {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
          </select>
          <select className="form-control" value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}>
            <option value="">All Statuses</option>
            {['applied', ...STATUSES].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? <div className="loading-placeholder" style={{ height: 200 }} /> :
          filtered.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: 64 }}>📭</div><h3>No applications</h3></div>
          ) : (
            <div className="apps-list">
              {filtered.map(app => (
                <div key={app._id} className="app-card card">
                  <div className="app-card-main">
                    <div className="app-card-info">
                      <div className="app-company-logo">
                        {app.candidate?.avatar ? <img src={app.candidate.avatar} alt="" /> : app.candidate?.name?.[0] || 'C'}
                      </div>
                      <div className="app-details">
                        <h3 className="app-job-title">{app.candidate?.name}</h3>
                        <div className="app-meta">
                          <span>Applied for: <strong>{app.job?.title}</strong></span>
                        </div>
                        <div className="app-meta">
                          {app.candidate?.location && <span><FiMapPin size={12} /> {app.candidate.location}</span>}
                          <span>{new Date(app.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="app-card-right">
                      <span className="match-chip-lg">{app.matchScore}% match</span>
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={e => handleStatusChange(app._id, e.target.value)}
                        style={{ colorScheme: 'light' }}
                      >
                        <option value="applied">Applied</option>
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <button className="icon-btn" onClick={() => setExpanded(expanded === app._id ? null : app._id)}>
                        {expanded === app._id ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                    </div>
                  </div>

                  {expanded === app._id && (
                    <div className="app-expanded">
                      <div className="candidate-detail-grid">
                        <div>
                          <h4>Contact Info</h4>
                          <div className="contact-info">
                            {app.candidate?.email && <div><FiMail /> {app.candidate.email}</div>}
                            {app.candidate?.phone && <div><FiPhone /> {app.candidate.phone}</div>}
                          </div>
                          <h4 style={{ marginTop: 16 }}>Skills</h4>
                          <div className="skills-wrap" style={{ marginTop: 8 }}>
                            {app.candidate?.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                          </div>
                        </div>
                        <div>
                          <h4>Match Analysis</h4>
                          <div className="match-bar" style={{ marginBottom: 10, marginTop: 8 }}>
                            <div className={`match-bar-fill ${app.matchScore >= 70 ? 'high' : app.matchScore >= 40 ? 'medium' : 'low'}`} style={{ width: `${app.matchScore}%` }} />
                          </div>
                          {app.matchedSkills?.length > 0 && (
                            <div className="skill-group-row"><span className="skill-group-lbl matched-lbl">✓ Matched</span><div className="skills-wrap">{app.matchedSkills.map(s => <span key={s} className="skill-tag matched">{s}</span>)}</div></div>
                          )}
                          {app.missingSkills?.length > 0 && (
                            <div className="skill-group-row" style={{ marginTop: 8 }}><span className="skill-group-lbl missing-lbl">✗ Missing</span><div className="skills-wrap">{app.missingSkills.map(s => <span key={s} className="skill-tag missing">{s}</span>)}</div></div>
                          )}
                        </div>
                      </div>
                      {app.coverLetter && (
                        <div className="cover-letter">
                          <h4>Cover Letter</h4>
                          <p>{app.coverLetter}</p>
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
