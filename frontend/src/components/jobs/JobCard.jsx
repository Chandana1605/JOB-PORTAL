import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobAPI } from '../../services/api';
import { FiMapPin, FiClock, FiDollarSign, FiBookmark, FiTrendingUp, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './JobCard.css';

const TYPE_LABELS = { 'full-time': 'Full Time', 'part-time': 'Part Time', 'contract': 'Contract', 'internship': 'Internship', 'remote': 'Remote' };

export default function JobCard({ job, saved = false, onSaveToggle }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = React.useState(saved);

  const handleSave = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) return toast.error('Please login to save jobs');
    try {
      const { data } = await jobAPI.saveJob(job._id);
      setIsSaved(data.saved);
      toast.success(data.saved ? 'Job saved!' : 'Job removed');
      if (onSaveToggle) onSaveToggle(job._id, data.saved);
    } catch { toast.error('Failed to save job'); }
  };

  const matchScore = job.matchScore;
  const getMatchColor = (score) => score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

  const formatSalary = (salary) => {
    if (!salary?.disclosed) return 'Not disclosed';
    if (!salary?.min && !salary?.max) return 'Not specified';
    const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(0)}k` : n;
    const currency = salary.currency === 'USD' ? '$' : salary.currency === 'INR' ? '₹' : salary.currency;
    if (salary.min && salary.max) return `${currency}${fmt(salary.min)} - ${currency}${fmt(salary.max)}`;
    return `${currency}${fmt(salary.min || salary.max)}`;
  };

  return (
    <Link to={`/jobs/${job._id}`} className={`job-card ${job.featured ? 'featured' : ''}`}>
      {job.featured && <div className="featured-badge"><FiStar /> Featured</div>}
      <div className="job-card-header">
        <div className="company-logo">
          {job.company?.logo ? <img src={job.company.logo} alt={job.company?.name} /> : (job.company?.name?.[0] || 'C')}
        </div>
        <div className="job-meta-header">
          <h3 className="job-title">{job.title}</h3>
          <div className="company-name">{job.company?.name || 'Company'}</div>
        </div>
        {user?.role === 'candidate' && (
          <button className={`save-btn ${isSaved ? 'saved' : ''}`} onClick={handleSave} title={isSaved ? 'Unsave' : 'Save'}>
            <FiBookmark size={18} />
          </button>
        )}
      </div>

      <div className="job-tags">
        <span className="job-tag"><FiMapPin size={12} /> {job.location}</span>
        <span className="job-tag"><FiClock size={12} /> {TYPE_LABELS[job.type] || job.type}</span>
        {(job.salary?.min || job.salary?.max) && (
          <span className="job-tag"><FiDollarSign size={12} /> {formatSalary(job.salary)}</span>
        )}
        {job.experience && (
          <span className="job-tag">{job.experience.min}-{job.experience.max} yrs</span>
        )}
      </div>

      <div className="job-skills">
        {job.skills?.slice(0, 4).map(s => <span key={s} className="skill-tag">{s}</span>)}
        {job.skills?.length > 4 && <span className="skill-tag">+{job.skills.length - 4}</span>}
      </div>

      {matchScore !== undefined && (
        <div className="match-section">
          <div className="match-header">
            <FiTrendingUp size={14} />
            <span>Match Score</span>
            <strong className={`match-score ${getMatchColor(matchScore)}`}>{matchScore}%</strong>
          </div>
          <div className="match-bar">
            <div className={`match-bar-fill ${getMatchColor(matchScore)}`} style={{ width: `${matchScore}%` }} />
          </div>
        </div>
      )}

      <div className="job-card-footer">
        <span className="posted-time">{new Date(job.createdAt).toLocaleDateString()}</span>
        <span className={`badge badge-gray`}>{job.status}</span>
      </div>
    </Link>
  );
}
