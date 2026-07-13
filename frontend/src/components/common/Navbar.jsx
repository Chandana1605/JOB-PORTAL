import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationAPI } from '../../services/api';
import { FiBell, FiMessageSquare, FiChevronDown, FiBriefcase, FiUser, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { notifications } = useSocket();
  const [unread, setUnread] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifList, setNotifList] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef();

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, notifications]);

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) { setShowMenu(false); setShowNotifs(false); }};
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 });
      setNotifList(data.notifications);
      setUnread(data.unreadCount);
    } catch {}
  };

  const markAllRead = async () => {
    await notificationAPI.markRead('all');
    setUnread(0);
    setNotifList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}/dashboard`;
  };

  const NavLinks = () => (
    <>
      <Link to="/jobs" className={`nav-link ${location.pathname === '/jobs' ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>Find Jobs</Link>
      {user?.role === 'recruiter' && (
        <>
          <Link to="/recruiter/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
          <Link to="/recruiter/post-job" className="nav-link" onClick={() => setMobileOpen(false)}>Post Job</Link>
        </>
      )}
      {user?.role === 'candidate' && (
        <Link to="/candidate/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
      )}
      {user?.role === 'admin' && (
        <Link to="/admin/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Admin</Link>
      )}
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <FiBriefcase className="brand-icon" />
          <span>JobPortal</span>
        </Link>

        <div className="navbar-links desktop-only">
          <NavLinks />
        </div>

        <div className="navbar-actions">
          {user ? (
            <div ref={menuRef} className="user-section">
              <Link to="/messages" className="icon-btn">
                <FiMessageSquare size={20} />
              </Link>
              <button className="icon-btn notif-btn" onClick={() => { setShowNotifs(!showNotifs); setShowMenu(false); }}>
                <FiBell size={20} />
                {unread > 0 && <span className="badge-dot">{unread > 9 ? '9+' : unread}</span>}
              </button>

              {showNotifs && (
                <div className="dropdown notif-dropdown">
                  <div className="dropdown-header">
                    <span>Notifications</span>
                    {unread > 0 && <button className="mark-read-btn" onClick={markAllRead}>Mark all read</button>}
                  </div>
                  <div className="notif-list">
                    {notifList.length === 0 ? (
                      <p className="notif-empty">No notifications</p>
                    ) : notifList.map(n => (
                      <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => { if (n.link) navigate(n.link); setShowNotifs(false); }}>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-message">{n.message}</div>
                        <div className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="user-menu-btn" onClick={() => { setShowMenu(!showMenu); setShowNotifs(false); }}>
                <div className="avatar avatar-sm">
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}
                </div>
                <span className="user-name desktop-only">{user.name?.split(' ')[0]}</span>
                <FiChevronDown size={14} />
              </button>

              {showMenu && (
                <div className="dropdown user-dropdown">
                  <div className="dropdown-profile">
                    <div className="avatar avatar-md">{user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="dp-name">{user.name}</div>
                      <div className="dp-role">{user.role}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={`/${user.role}/profile`} className="dropdown-item" onClick={() => setShowMenu(false)}><FiUser /> Profile</Link>
                  <Link to={getDashboardLink()} className="dropdown-item" onClick={() => setShowMenu(false)}><FiBriefcase /> Dashboard</Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={logout}><FiLogOut /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="mobile-menu-btn mobile-only" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <NavLinks />
        </div>
      )}
    </nav>
  );
}
