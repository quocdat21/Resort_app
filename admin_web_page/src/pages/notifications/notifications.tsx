import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  Wallet, 
  Star, 
  Bed,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast
} from 'lucide-react';

interface Notification {
  id: number;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  timeAgo: string;
  isUnread: boolean;
}

const notificationsData: Notification[] = [
  { 
    id: 1, 
    icon: <Calendar size={20} className="text-blue-600" />, 
    iconBg: 'bg-blue-50',
    title: 'New booking received', 
    description: 'BK24052601 by John Doe', 
    timeAgo: '5 min ago', 
    isUnread: true 
  },
  { 
    id: 2, 
    icon: <Wallet size={20} className="text-purple-600" />, 
    iconBg: 'bg-purple-50',
    title: 'Payment of $640.00 received', 
    description: 'TXN100031', 
    timeAgo: '15 min ago', 
    isUnread: true 
  },
  { 
    id: 3, 
    icon: <Bed size={20} className="text-indigo-600" />, 
    iconBg: 'bg-indigo-50',
    title: 'Room #101 is maintenance completed', 
    description: 'Ready for check-in', 
    timeAgo: '30 min ago', 
    isUnread: true 
  },
  { 
    id: 4, 
    icon: <Star size={20} className="text-amber-600" />, 
    iconBg: 'bg-amber-50',
    title: 'New review for Deluxe Ocean View', 
    description: 'Rating: 5 stars', 
    timeAgo: '1 hour ago', 
    isUnread: true 
  },
  { 
    id: 5, 
    icon: <Bell size={20} className="text-cyan-600" />, 
    iconBg: 'bg-cyan-50',
    title: 'New service booking', 
    description: 'SB24052601 by John Doe', 
    timeAgo: '2 hours ago', 
    isUnread: true 
  },
];

const NotificationsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {notificationsData.map((notif) => (
            <div key={notif.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors flex items-center gap-4 group cursor-pointer">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full ${notif.iconBg} flex items-center justify-center shrink-0 shadow-sm border border-white`}>
                {notif.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {notif.title}
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    {notif.description}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{notif.timeAgo}</p>
              </div>

              {/* Unread Dot */}
              {notif.isUnread && (
                <div className="w-2.5 h-2.5 bg-green-600 rounded-full shadow-sm shadow-green-100 shrink-0"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 5 of 60 notifications
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronFirst size={16} />} disabled />
          <PaginationButton icon={<ChevronLeft size={16} />} disabled />
          
          <div className="flex items-center">
            <PageNumber active>1</PageNumber>
            <PageNumber>2</PageNumber>
            <PageNumber>3</PageNumber>
            <PageNumber>4</PageNumber>
            <PageNumber>5</PageNumber>
            <span className="px-2 text-slate-400">...</span>
            <PageNumber>12</PageNumber>
          </div>

          <PaginationButton icon={<ChevronRight size={16} />} />
          <PaginationButton icon={<ChevronLast size={16} />} />
        </div>
      </div>
    </div>
  );
};

const PaginationButton: React.FC<{ icon: React.ReactNode; disabled?: boolean }> = ({ icon, disabled }) => (
  <button 
    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all ${
      disabled 
        ? 'bg-slate-50 text-slate-300 cursor-not-allowed' 
        : 'bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm'
    }`}
    disabled={disabled}
  >
    {icon}
  </button>
);

const PageNumber: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <button 
    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
      active 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

export default NotificationsPage;
