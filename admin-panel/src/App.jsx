import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, Users as UsersIcon, ClipboardList } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Workers from './pages/Workers';
import Users from './pages/Users';
import SystemLogs from './pages/SystemLogs';

function App() {
  return (
    <Router>
      <div className="flex bg-slate-950 min-h-screen text-slate-200">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/users" element={<Users />} />
            <Route path="/system-logs" element={<SystemLogs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
