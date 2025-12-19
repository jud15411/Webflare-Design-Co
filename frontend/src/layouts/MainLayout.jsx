import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; // Pulls from your new Sidebar.jsx
import Topbar from '../components/Topbar'; // Pulls from your new Topbar.jsx

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* 1. Sidebar stays fixed on the left */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Topbar stays at the top */}
        <Topbar />

        {/* 3. This area changes based on the URL (Dashboard, Users, etc.) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
