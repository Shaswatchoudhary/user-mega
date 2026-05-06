import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users as UsersIcon, ClipboardList } from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Users from './pages/Users';
import SystemLogs from './pages/SystemLogs';
import Login from './pages/Login';

import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tracker from './pages/Tracker';
import Issues from './pages/Issues';
import Notifications from './pages/Notifications';
import ProtectedRoute from './components/ProtectedRoute';
import SessionManager from './components/SessionManager';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { AdminProvider } from './context/AdminContext';

import LandingPage from './pages/LandingPage';

const AdminLayout = ({ children }) => (
  <main className="flex-1 w-full max-w-[1600px] mx-auto pt-28 pb-10 px-8">
    {children}
  </main>
);

function App() {
  return (
    <Router>
      <AdminProvider>
        <SessionManager>
          <div className="flex flex-col bg-background min-h-screen text-text-primary">
          <Navbar />
          <div className="flex-1 w-full mx-auto">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              
              {/* Protected Admin Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
              <Route path="/workers" element={<ProtectedRoute><AdminLayout><Workers /></AdminLayout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><AdminLayout><Users /></AdminLayout></ProtectedRoute>} />
              <Route path="/system-logs" element={<ProtectedRoute><AdminLayout><SystemLogs /></AdminLayout></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute><AdminLayout><Tracker /></AdminLayout></ProtectedRoute>} />
              <Route path="/issues" element={<ProtectedRoute><AdminLayout><Issues /></AdminLayout></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><AdminLayout><Notifications /></AdminLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><AdminLayout><Profile /></AdminLayout></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AdminLayout><Settings /></AdminLayout></ProtectedRoute>} />
            </Routes>
          </div>
          </div>
        </SessionManager>
      </AdminProvider>
    </Router>
  );
}


export default App;
