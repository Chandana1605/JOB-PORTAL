import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { jobAPI, applicationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiMapPin, FiClock, FiDollarSign, FiUsers, FiCalendar, FiBookmark, FiArrowLeft, FiTrendingUp, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './JobDetail.css';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState({});
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => { fetchJob(); }, [id]);

  const fetchJob = async () => {
    try {
      const { data } = await jobAPI.getJob(id);
      setJob(data.job);
      setMatchData({ score: data.score, matched: data.matched, missing: data.missing });
      setApplied(data.applied);
    } catch { toast.error('Job not found'); navigate('/jobs'); }
    finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationAPI.apply(id, { coverLetter });
      setApplied(true);
      setShowApplyForm(false);
      toast.success('Application submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally { setApplying(false); }
  };

  const getMatchColor = (score) => score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!job) return null;

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="job-detail-layout">
        <div className="job-detail-main">
          <button className="back-btn" onClick={() => navigate(-1)}><FiArrowLeft /> Back to Jobs</button>

          <div className="card job-detail-card">
            <div className="jd-header">
              <div className="company-logo-lg">
                {job.company?.logo ? <img src={job.company.logo} alt={job.company?.name} /> : job.company?.name?.[0] || 'C'}
              </div>
              <div className="jd-title-section">
                <h1 className="jd-title">{job.title}</h1>
                <div className="jd-company">{job.company?.name}</div>
                <div className="jd-meta">
                  <span><FiMapPin /> {job.location}</span>
                  <span><FiClock /> {job.type}</span>
                  {job.salary?.min && <span><FiDollarSign /> {job.salary.min?.toLocaleString()} - {job.salary.max?.toLocaleString()}</span>}
                  <span><FiCalendar /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                  <span><FiUsers /> {job.views} views</span>
                </div>
              </div>
            </div>

            {user?.role === 'candidate' && matchData.score !== undefined && (
              <div className="match-card">
                <div className="match-card-header">
                  <FiTrendingUp /> Skill Match
                  <strong className={`match-pct ${getMatchColor(matchData.score)}`}>{matchData.score}%</strong>
                </div>
                <div className="match-bar"><div className={`match-bar-fill ${getMatchColor(matchData.score)}`} style={{ width: `${matchData.score}%` }} /></div>
                <div className="match-skills">
                  {matchData.matched?.length > 0 && (
                    <div className="skill-group">
                      <div className="skill-group-label"><FiCheck color="var(--secondary)" /> Matched Skills</div>
                      <div className="skills-wrap">
                        {matchData.matched.map(s => <span key={s} className="skill-tag matched">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {matchData.missing?.length > 0 && (
                    <div className="skill-group">
                      <div className="skill-group-label"><FiX color="var(--danger)" /> Missing Skills</div>
                      <div className="skills-wrap">
                        {matchData.missing.map(s => <span key={s} className="skill-tag missing">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="jd-section">
              <h2>About the Role</h2>
              <p className="jd-description">{job.description}</p>
            </div>

            {job.requirements?.length > 0 && (
              <div className="jd-section">
                <h2>Requirements</h2>
                <ul className="jd-list">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}

            {job.responsibilities?.length > 0 && (
              <div className="jd-section">
                <h2>Responsibilities</h2>
                <ul className="jd-list">{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            )}

            <div className="jd-section">
              <h2>Required Skills</h2>
              <div className="skills-wrap">{job.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}</div>
            </div>
          </div>

          {showApplyForm && (
            <div className="card apply-form">
              <h3>Apply for {job.title}</h3>
              <form onSubmit={handleApply}>
                <div className="form-group">
                  <label className="form-label">Cover Letter (Optional)</label>
                  <textarea className="form-control" rows={5} placeholder="Tell them why you're a great fit..."
                    value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={applying}>
                    {applying ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowApplyForm(false)}>Cancel</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <aside className="job-detail-sidebar">
          <div className="card apply-card">
            {user?.role === 'candidate' ? (
              applied ? (
                <div className="applied-banner">
                  <FiCheck size={24} /> Application Submitted
                </div>
              ) : (
                <button className="btn btn-primary btn-full" onClick={() => setShowApplyForm(true)}>Apply Now</button>
              )
            ) : !user ? (
              <button className="btn btn-primary btn-full" onClick={() => navigate('/login')}>Login to Apply</button>
            ) : null}
            <div className="job-summary">
              <div className="summary-item"><span>Experience</span><strong>{job.experience?.min}-{job.experience?.max} years</strong></div>
              <div className="summary-item"><span>Job Type</span><strong>{job.type}</strong></div>
              {job.deadline && <div className="summary-item"><span>Deadline</span><strong>{new Date(job.deadline).toLocaleDateString()}</strong></div>}
              {job.company?.size && <div className="summary-item"><span>Company Size</span><strong>{job.company.size}</strong></div>}
              {job.company?.industry && <div className="summary-item"><span>Industry</span><strong>{job.company.industry}</strong></div>}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
