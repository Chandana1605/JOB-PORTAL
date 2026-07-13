import React, { useState, useEffect } from 'react';
import Navbar from '../../components/common/Navbar';
import JobCard from '../../components/jobs/JobCard';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function SavedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getSavedJobs().then(r => setJobs(r.data.jobs)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) setJobs(prev => prev.filter(j => j._id !== jobId));
  };

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="page-container">
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 24 }}>
          Saved Jobs <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>({jobs.length})</span>
        </h1>
        {loading ? <div className="loading-placeholder" style={{ height: 200 }} /> :
          jobs.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🔖</div>
              <h3>No saved jobs</h3>
              <p>Bookmark jobs you're interested in and find them here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {jobs.map(job => <JobCard key={job._id} job={job} saved={true} onSaveToggle={handleSaveToggle} />)}
            </div>
          )}
      </div>
    </div>
  );
}
