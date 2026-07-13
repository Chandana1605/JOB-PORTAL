import './AdminDashboard.css';
import './AdminTable.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { adminAPI } from '../../services/api';
import { FiUsers, FiBriefcase, FiSend, FiTrendingUp, FiChevronRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  const stats = data ? [
    { icon: <FiUsers />, label: 'Total Users', value: data.stats.totalUsers, color: '#0A66C2', link: '/admin/users' },
    { icon: <FiBriefcase />, label: 'Total Jobs', value: data.stats.totalJobs, color: '#057642', link: '/admin/jobs' },
    { icon: <FiSend />, label: 'Applications', value: data.stats.totalApplications, color: '#E65100', link: '/admin/jobs' },
    { icon: <FiTrendingUp />, label: 'Candidates', value: data.stats.candidates, color: '#6A1B9A', link: '/admin/users' },
  ] : [];

  const chartData = data?.monthlyApps?.map(m => ({
    name: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
    applications: m.count,
  })) || [];

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="admin-layout">
        <aside className="admin-sidebar card">
          <h3 className="admin-sidebar-title">Admin Panel</h3>
          <nav>
            <Link to="/admin/dashboard" className="sidebar-link active"><FiTrendingUp /> Dashboard</Link>
            <Link to="/admin/users" className="sidebar-link"><FiUsers /> Manage Users</Link>
            <Link to="/admin/jobs" className="sidebar-link"><FiBriefcase /> Manage Jobs</Link>
          </nav>
        </aside>

        <main className="admin-main">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Admin Dashboard</h1>

          {loading ? <div className="loading-placeholder" style={{ height: 200 }} /> : (
            <>
              <div className="stats-grid-4">
                {stats.map(s => (
                  <Link to={s.link} key={s.label} className="stat-card" style={{ '--accent-color': s.color }}>
                    <div className="stat-card-icon" style={{ background: `${s.color}20`, color: s.color }}>{s.icon}</div>
                    <div className="stat-card-value">{s.value?.toLocaleString()}</div>
                    <div className="stat-card-label">{s.label}</div>
                  </Link>
                ))}
              </div>

              <div className="admin-grid">
                <div className="card">
                  <h2 className="card-title">Application Trends</h2>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="applications" fill="#0A66C2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>No data yet</p>}
                </div>

                <div className="card">
                  <h2 className="card-title">User Distribution</h2>
                  <div className="user-dist">
                    <div className="dist-item">
                      <span>Candidates</span>
                      <div className="dist-bar-wrap">
                        <div className="dist-bar" style={{ width: `${data?.stats.totalUsers ? (data.stats.candidates / data.stats.totalUsers * 100) : 0}%`, background: '#0A66C2' }} />
                      </div>
                      <strong>{data?.stats.candidates}</strong>
                    </div>
                    <div className="dist-item">
                      <span>Recruiters</span>
                      <div className="dist-bar-wrap">
                        <div className="dist-bar" style={{ width: `${data?.stats.totalUsers ? (data.stats.recruiters / data.stats.totalUsers * 100) : 0}%`, background: '#057642' }} />
                      </div>
                      <strong>{data?.stats.recruiters}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-grid">
                <div className="card">
                  <div className="section-header">
                    <h2 className="card-title">Recent Users</h2>
                    <Link to="/admin/users" className="view-all">View All <FiChevronRight /></Link>
                  </div>
                  {data?.recentUsers?.map(u => (
                    <div key={u._id} className="admin-list-item">
                      <div className="ali-avatar">{u.name?.[0]?.toUpperCase()}</div>
                      <div className="ali-info">
                        <div className="ali-name">{u.name}</div>
                        <div className="ali-sub">{u.email}</div>
                      </div>
                      <span className={`badge badge-${u.role === 'candidate' ? 'primary' : u.role === 'recruiter' ? 'success' : 'warning'}`}>{u.role}</span>
                    </div>
                  ))}
                </div>

                <div className="card">
                  <div className="section-header">
                    <h2 className="card-title">Recent Jobs</h2>
                    <Link to="/admin/jobs" className="view-all">View All <FiChevronRight /></Link>
                  </div>
                  {data?.recentJobs?.map(j => (
                    <div key={j._id} className="admin-list-item">
                      <div className="ali-info">
                        <div className="ali-name">{j.title}</div>
                        <div className="ali-sub">{j.recruiter?.company?.name || j.recruiter?.name} · {j.location}</div>
                      </div>
                      <span className={`badge badge-${j.status === 'active' ? 'success' : 'gray'}`}>{j.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
