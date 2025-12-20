import { useState } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './ProtectedRoute';
import Orchestrator from './pages/Orchestrator';

const AdminLayout = ({ children, user, setUser }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* SIDEBAR: Drawer on mobile, persistent on desktop */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          user={user}
          setUser={setUser}
          closeSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          user={user}
          setUser={setUser}
          openSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user_profile');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user_profile', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={handleSetUser} />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout user={user} setUser={setUser}>
                <Dashboard user={user} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <AdminLayout user={user} setUser={setUser}>
                <Orchestrator user={user} />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
