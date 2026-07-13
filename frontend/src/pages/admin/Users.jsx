import './AdminTable.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { adminAPI } from '../../services/api';
import { FiSearch, FiTrash2, FiToggleLeft, FiToggleRight, FiUsers, FiBriefcase, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, [search, role, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search, role, page, limit: 15 });
      setUsers(data.users); setTotal(data.total); setPages(data.pages);
    } catch {} finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? data.user : u));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ paddingTop: 64, background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="admin-layout">
        <aside className="admin-sidebar card">
          <h3 className="admin-sidebar-title">Admin Panel</h3>
          <nav>
            <Link to="/admin/dashboard" className="sidebar-link"><FiTrendingUp /> Dashboard</Link>
            <Link to="/admin/users" className="sidebar-link active"><FiUsers /> Manage Users</Link>
            <Link to="/admin/jobs" className="sidebar-link"><FiBriefcase /> Manage Jobs</Link>
          </nav>
        </aside>
        <main className="admin-main">
          <div className="page-title-bar">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Users <span className="count-badge">{total}</span></h1>
          </div>
          <div className="card" style={{ padding: '14px 20px', marginBottom: 16, display: 'flex', gap: 12 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input className="form-control" style={{ paddingLeft: 36 }} placeholder="Search users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-control" style={{ width: 150 }} value={role} onChange={e => { setRole(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="candidate">Candidates</option>
              <option value="recruiter">Recruiters</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Loading...</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="ali-avatar">{u.name?.[0]?.toUpperCase()}</div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role === 'candidate' ? 'primary' : u.role === 'recruiter' ? 'success' : 'warning'}`}>{u.role}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className={`badge badge-${u.isActive ? 'success' : 'danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="icon-btn" title={u.isActive ? 'Deactivate' : 'Activate'} onClick={() => handleToggle(u._id)}>
                          {u.isActive ? <FiToggleRight size={20} color="var(--secondary)" /> : <FiToggleLeft size={20} color="var(--text-light)" />}
                        </button>
                        <button className="icon-btn" onClick={() => handleDelete(u._id)}><FiTrash2 color="var(--danger)" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => (
                <button key={i+1} className={`page-btn ${page === i+1 ? 'active' : ''}`} onClick={() => setPage(i+1)}>{i+1}</button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
