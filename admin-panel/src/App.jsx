import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users as UsersIcon, ClipboardList } from 'lucide-react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Users from './pages/Users';
import SystemLogs from './pages/SystemLogs';
import Login from './pages/Login';
import Signup from './pages/Signup';

import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Tracker from './pages/Tracker';
import Issues from './pages/Issues';

function App() {
  return (
    <Router>
      <div className="flex flex-col bg-background min-h-screen text-text-primary">
        <Navbar />
        <main className="flex-1 w-full max-w-[1600px] mx-auto pt-28 pb-10 px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/system-logs" element={<SystemLogs />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}


export default App;
