import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import CandidateApplications from './pages/candidate/Applications';
import ResumeBuilder from './pages/candidate/ResumeBuilder';
import SavedJobs from './pages/candidate/SavedJobs';
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterProfile from './pages/recruiter/Profile';
import PostJob from './pages/recruiter/PostJob';
import RecruiterApplications from './pages/recruiter/Applications';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminJobs from './pages/admin/Jobs';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/jobs" element={<Jobs />} />
    <Route path="/jobs/:id" element={<JobDetail />} />

    {/* Candidate */}
    <Route path="/candidate/dashboard" element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
    <Route path="/candidate/profile" element={<ProtectedRoute roles={['candidate']}><CandidateProfile /></ProtectedRoute>} />
    <Route path="/candidate/applications" element={<ProtectedRoute roles={['candidate']}><CandidateApplications /></ProtectedRoute>} />
    <Route path="/candidate/resume" element={<ProtectedRoute roles={['candidate']}><ResumeBuilder /></ProtectedRoute>} />
    <Route path="/candidate/saved" element={<ProtectedRoute roles={['candidate']}><SavedJobs /></ProtectedRoute>} />

    {/* Recruiter */}
    <Route path="/recruiter/dashboard" element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
    <Route path="/recruiter/profile" element={<ProtectedRoute roles={['recruiter']}><RecruiterProfile /></ProtectedRoute>} />
    <Route path="/recruiter/post-job" element={<ProtectedRoute roles={['recruiter']}><PostJob /></ProtectedRoute>} />
    <Route path="/recruiter/post-job/:id" element={<ProtectedRoute roles={['recruiter']}><PostJob /></ProtectedRoute>} />
    <Route path="/recruiter/applications" element={<ProtectedRoute roles={['recruiter']}><RecruiterApplications /></ProtectedRoute>} />

    {/* Admin */}
    <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
    <Route path="/admin/jobs" element={<ProtectedRoute roles={['admin']}><AdminJobs /></ProtectedRoute>} />

    {/* Shared */}
    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
