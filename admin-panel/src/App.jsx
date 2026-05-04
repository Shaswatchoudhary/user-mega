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
import ProtectedRoute from './components/ProtectedRoute';
import SessionManager from './components/SessionManager';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { AdminProvider } from './context/AdminContext';

function App() {
  return (
    <Router>
      <AdminProvider>
        <SessionManager>
          <div className="flex flex-col bg-background min-h-screen text-text-primary">
          <Navbar />
          <main className="flex-1 w-full max-w-[1600px] mx-auto pt-28 pb-10 px-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/workers" element={<ProtectedRoute><Workers /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/system-logs" element={<ProtectedRoute><SystemLogs /></ProtectedRoute>} />
              <Route path="/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
              <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>
          </main>
          </div>
        </SessionManager>
      </AdminProvider>
    </Router>
  );
}


export default App;
