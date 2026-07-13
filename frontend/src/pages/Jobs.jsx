import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import JobCard from '../components/jobs/JobCard';
import { jobAPI } from '../services/api';
import { FiFilter, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import './Jobs.css';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    skills: searchParams.get('skills') || '',
    minSalary: '', maxSalary: '', minExp: '', maxExp: '',
    page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await jobAPI.getJobs(params);
      setJobs(data.jobs);
      setTotal(data.total);
      setPages(data.pages);
    } catch { } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({ search: '', location: '', type: '', skills: '', minSalary: '', maxSalary: '', minExp: '', maxExp: '', page: 1 });

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v !== '' && k !== 'page').length;

  return (
    <div className="jobs-page">
      <Navbar />
      <div className="jobs-layout">
        {/* Sidebar Filters */}
        <aside className={`filters-sidebar ${showFilters ? 'open' : ''}`}>
          <div className="filters-header">
            <h3>Filters {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}</h3>
            <button className="clear-btn" onClick={clearFilters}>Clear all</button>
          </div>

          <div className="filter-group">
            <label className="form-label">Search</label>
            <div className="search-input-wrap">
              <FiSearch className="si-icon" />
              <input className="form-control" placeholder="Keywords..." value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)} />
            </div>
          </div>

          <div className="filter-group">
            <label className="form-label">Location</label>
            <input className="form-control" placeholder="City or remote" value={filters.location}
              onChange={e => handleFilterChange('location', e.target.value)} />
          </div>

          <div className="filter-group">
            <label className="form-label">Job Type</label>
            {JOB_TYPES.map(type => (
              <label key={type} className="checkbox-option">
                <input type="radio" name="type" value={type} checked={filters.type === type}
                  onChange={() => handleFilterChange('type', filters.type === type ? '' : type)} />
                <span>{type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</span>
              </label>
            ))}
          </div>

          <div className="filter-group">
            <label className="form-label">Skills (comma-separated)</label>
            <input className="form-control" placeholder="React, Node.js..." value={filters.skills}
              onChange={e => handleFilterChange('skills', e.target.value)} />
          </div>

          <div className="filter-group">
            <label className="form-label">Salary Range</label>
            <div className="range-inputs">
              <input className="form-control" type="number" placeholder="Min" value={filters.minSalary}
                onChange={e => handleFilterChange('minSalary', e.target.value)} />
              <span>-</span>
              <input className="form-control" type="number" placeholder="Max" value={filters.maxSalary}
                onChange={e => handleFilterChange('maxSalary', e.target.value)} />
            </div>
          </div>

          <div className="filter-group">
            <label className="form-label">Experience (years)</label>
            <div className="range-inputs">
              <input className="form-control" type="number" placeholder="Min" value={filters.minExp}
                onChange={e => handleFilterChange('minExp', e.target.value)} />
              <span>-</span>
              <input className="form-control" type="number" placeholder="Max" value={filters.maxExp}
                onChange={e => handleFilterChange('maxExp', e.target.value)} />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="jobs-main">
          <div className="jobs-header">
            <div>
              <h1 className="jobs-count">{total.toLocaleString()} Jobs Found</h1>
              {activeFilterCount > 0 && <p className="filter-info">Showing filtered results</p>}
            </div>
            <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <FiFilter /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {loading ? (
            <div className="jobs-loading">
              {[1,2,3,4,5].map(i => <div key={i} className="job-skeleton" />)}
            </div>
          ) : jobs.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 64 }}>🔍</div>
              <h3>No jobs found</h3>
              <p>Try adjusting your search filters</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="jobs-grid">
                {jobs.map(job => <JobCard key={job._id} job={job} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => (
                    <button key={i+1} className={`page-btn ${filters.page === i+1 ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, page: i+1 }))}>
                      {i+1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
