import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { FiSearch, FiMapPin, FiBriefcase, FiUsers, FiTrendingUp, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import './Landing.css';

const POPULAR_SKILLS = ['React', 'Node.js', 'Python', 'Java', 'AWS', 'Machine Learning', 'UI/UX', 'DevOps'];
const STATS = [{ icon: <FiBriefcase />, value: '50K+', label: 'Active Jobs' }, { icon: <FiUsers />, value: '200K+', label: 'Candidates' }, { icon: <FiTrendingUp />, value: '10K+', label: 'Companies' }];

export default function Landing() {
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="landing">
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge"><FiTrendingUp /> AI-Powered Job Matching</div>
          <h1 className="hero-title">Find Your <span className="highlight">Dream Job</span> With Skills That Match</h1>
          <p className="hero-subtitle">Discover opportunities that align with your skills. Our smart matching engine connects you with the perfect role.</p>

          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-field">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Job title, keywords, or company" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="search-divider" />
            <div className="search-field">
              <FiMapPin className="search-icon" />
              <input type="text" placeholder="Location or remote" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary search-submit">Search Jobs <FiArrowRight /></button>
          </form>

          <div className="popular-searches">
            <span>Popular:</span>
            {POPULAR_SKILLS.map(s => (
              <button key={s} className="pop-tag" onClick={() => navigate(`/jobs?skills=${s}`)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card card-1"><FiCheckCircle /> Profile 92% complete</div>
          <div className="hero-card card-2"><FiBriefcase /> 3 new matches today!</div>
          <div className="hero-card card-3">🎉 Offer accepted!</div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-item">
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="roles-section">
        <div className="container">
          <h2 className="section-title">Built for everyone</h2>
          <p className="section-sub">Whether you're hunting or hiring, we've got you covered.</p>
          <div className="roles-grid">
            <div className="role-card candidate-card">
              <div className="role-icon">👤</div>
              <h3>For Candidates</h3>
              <ul>
                <li><FiCheckCircle /> Smart skill matching</li>
                <li><FiCheckCircle /> Resume builder & PDF export</li>
                <li><FiCheckCircle /> Track all applications</li>
                <li><FiCheckCircle /> Direct recruiter chat</li>
              </ul>
              <Link to="/register?role=candidate" className="btn btn-primary">Get Started Free <FiArrowRight /></Link>
            </div>
            <div className="role-card recruiter-card">
              <div className="role-icon">🏢</div>
              <h3>For Recruiters</h3>
              <ul>
                <li><FiCheckCircle /> Post unlimited jobs</li>
                <li><FiCheckCircle /> AI candidate ranking</li>
                <li><FiCheckCircle /> Application pipeline</li>
                <li><FiCheckCircle /> Interview scheduling</li>
              </ul>
              <Link to="/register?role=recruiter" className="btn btn-outline">Start Hiring <FiArrowRight /></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-brand"><FiBriefcase /> JobPortal</div>
          <p>© 2024 JobPortal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
