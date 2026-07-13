import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export default function NotFound() {
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: 96, marginBottom: 16 }}>🔍</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, marginBottom: 12 }}>404</h1>
        <h2 style={{ fontSize: 24, marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 16 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary btn-lg">Go Back Home</Link>
      </div>
    </div>
  );
}
