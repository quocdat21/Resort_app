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
import logo from '../../assets/icon_resort.png';

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-20 font-sans">
      <Link to="/" className="px-6 py-8 flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img
          src={logo}
          alt="Logo"
          className="h-12 w-auto object-contain"
        />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-tight text-[#1a8a3d] leading-none mb-1">
            THAO NGUYEN
          </h1>
          <div className="flex items-center gap-1">
            <p className="text-[9.5px] font-medium text-[#1a8a3d] tracking-[0.1em] whitespace-nowrap uppercase">
              HOTEL & RESORT
            </p>
            <div className="flex gap-0.2">
              {[...Array(4)].map((_, i) => (
                <span key={i} className="text-[#1a8a3d] text-[9px]">★</span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-4 overflow-y-auto pb-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4">Main Menu</p>
        <ul className="space-y-1">
          <SidebarItem icon={<LayoutDashboard size={18} />} label="Dashboard" to="/" active={location.pathname === '/'} />
          <SidebarItem icon={<Users size={18} />} label="Users" to="/users" active={location.pathname === '/users'} />
          <SidebarItem icon={<Bed size={18} />} label="Rooms" to="/rooms" active={location.pathname === '/rooms'} />
          <SidebarItem icon={<Grid2X2 size={18} />} label="Categories" to="/categories" active={location.pathname === '/categories'} />
          <SidebarItem icon={<Sparkles size={18} />} label="Amenities" to="/amenities" active={location.pathname === '/amenities'} />
          <SidebarItem icon={<ConciergeBell size={18} />} label="Services" to="/services" active={location.pathname === '/services'} />
          <SidebarItem icon={<CalendarCheck size={18} />} label="Bookings" to="/bookings" active={location.pathname === '/bookings'} />
          <SidebarItem icon={<Wallet size={18} />} label="Payments" to="/payments" active={location.pathname === '/payments'} />
          <SidebarItem icon={<Ticket size={18} />} label="Vouchers" to="/vouchers" active={location.pathname === '/vouchers'} />
          <SidebarItem icon={<Star size={18} />} label="Reviews" to="/reviews" active={location.pathname === '/reviews'} />
          <SidebarItem icon={<Bell size={18} />} label="Notifications" to="/notifications" active={location.pathname === '/notifications'} />
          <SidebarItem icon={<Settings size={18} />} label="Settings" to="/settings" active={location.pathname === '/settings'} />
        </ul>
      </nav>
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
