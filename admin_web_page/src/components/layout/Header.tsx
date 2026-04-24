import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Sun, 
  Bell, 
  MoreVertical,
  LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<{full_name?: string, role?: string, avatar_url?: string} | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      try {
        setAdminUser(JSON.parse(userStr));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/users': return 'Users';
      case '/rooms': return 'Rooms';
      case '/categories': return 'Categories';
      case '/amenities': return 'Amenities';
      case '/services': return 'Services';
      case '/bookings': return 'Bookings';
      case '/payments': return 'Payments';
      case '/vouchers': return 'Vouchers';
      case '/reviews': return 'Reviews';
      case '/notifications': return 'Notifications';
      case '/settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
          <MoreVertical size={20} className="text-slate-400 rotate-90" />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">{getPageTitle(location.pathname)}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-80 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900"
          />
        </div>
        <div className="flex items-center gap-3">
          <HeaderAction icon={<Sun size={20} />} />
          <HeaderAction icon={<Bell size={20} />} badge={5} />
          <div className="h-8 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-3 cursor-pointer group">
            <img 
              src={adminUser?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
              alt="Admin" 
              className="w-9 h-9 rounded-full border border-slate-200 group-hover:border-green-500 transition-colors object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{adminUser?.full_name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-500 font-medium capitalize">{adminUser?.role || 'Administrator'}</p>
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

interface HeaderActionProps {
  icon: React.ReactNode;
  badge?: number;
}

const HeaderAction: React.FC<HeaderActionProps> = ({ icon, badge }) => (
  <button className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 relative text-slate-600">
    {icon}
    {badge && (
      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
        {badge}
      </span>
    )}
  </button>
);

export default Header;
