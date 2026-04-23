import React from 'react';
import {
  LayoutDashboard,
  Users,
  Bed,
  Grid2X2,
  Sparkles,
  ConciergeBell,
  CalendarCheck,
  ClipboardList,
  Wallet,
  Ticket,
  Star,
  Bell,
  Settings,
  MoreHorizontal
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
          <Sparkles size={20} />
        </div>
        <h1 className="font-bold text-xl tracking-tight text-slate-900">RESORT ADMIN</h1>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto pb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Main Menu</p>
        <ul className="space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={<Users size={18} />} label="Users" to="/users" active={location.pathname === '/users'} />
          <SidebarItem icon={<Bed size={18} />} label="Rooms" to="/rooms" active={location.pathname === '/rooms'} />
          <SidebarItem icon={<Grid2X2 size={18} />} label="Categories" to="/categories" />
          <SidebarItem icon={<Sparkles size={18} />} label="Amenities" to="/amenities" />
          <SidebarItem icon={<ConciergeBell size={18} />} label="Services" to="/services" />
          <SidebarItem icon={<CalendarCheck size={18} />} label="Bookings" to="/bookings" />
          <SidebarItem icon={<Wallet size={18} />} label="Payments" to="/payments" />
          <SidebarItem icon={<Ticket size={18} />} label="Vouchers" to="/vouchers" />
          <SidebarItem icon={<Star size={18} />} label="Reviews" to="/reviews" />
          <SidebarItem icon={<Bell size={18} />} label="Notifications" to="/notifications" />
          <SidebarItem icon={<Settings size={18} />} label="Settings" to="/settings" />
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
            alt="Admin"
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-900">Admin User</p>
            <p className="text-[10px] text-slate-500 truncate">admin@resort.com</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, active }) => (
  <li>
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active
          ? 'bg-green-600 text-white shadow-lg shadow-green-200'
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  </li>
);

export default Sidebar;
