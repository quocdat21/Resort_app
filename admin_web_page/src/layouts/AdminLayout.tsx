import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans text-slate-900">
      {/* Sidebar is fixed inside its own component (w-64 fixed h-full) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed at top of this flex container */}
        <div className="px-8 z-20 bg-white border-b border-slate-200 shrink-0">
          <Header />
        </div>
        
        {/* Page Content - ONLY this section is scrollable */}
        <main className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
