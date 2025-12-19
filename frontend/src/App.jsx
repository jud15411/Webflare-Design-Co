import { useState } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './ProtectedRoute';
import Orchestrator from './pages/Orchestrator';

// AdminLayout now uses the "children" prop to render the specific page route
const AdminLayout = ({ children, user, setUser }) => (
  <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
    <Sidebar user={user} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Topbar user={user} setUser={setUser} />
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
        {children}
      </main>
    </div>
  </div>
);

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
        {/* Public Route */}
        <Route path="/login" element={<Login setUser={handleSetUser} />} />

        {/* Protected Dashboard Route */}
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

        {/* New Protected Orchestrator Route */}
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

        {/* Catch-all redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
