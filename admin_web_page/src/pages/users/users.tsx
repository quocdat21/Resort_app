import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'admin' | 'staff' | 'customer';
  verified: boolean;
  loyaltyPoints: number;
  totalStays: number;
  createdAt: string;
}

const usersData: User[] = [
  { id: 1, fullName: 'John Doe', email: 'john@example.com', phone: '0912345678', role: 'admin', verified: true, loyaltyPoints: 1200, totalStays: 15, createdAt: '20/05/2024' },
  { id: 2, fullName: 'Mary Smith', email: 'mary@example.com', phone: '0923456789', role: 'staff', verified: true, loyaltyPoints: 850, totalStays: 10, createdAt: '19/05/2024' },
  { id: 3, fullName: 'Robert Brown', email: 'robert@example.com', phone: '0934567890', role: 'customer', verified: true, loyaltyPoints: 650, totalStays: 8, createdAt: '18/05/2024' },
  { id: 4, fullName: 'Linda Williams', email: 'linda@example.com', phone: '0945678901', role: 'customer', verified: false, loyaltyPoints: 0, totalStays: 0, createdAt: '16/05/2024' },
  { id: 5, fullName: 'David Johnson', email: 'david@example.com', phone: '0956789012', role: 'staff', verified: true, loyaltyPoints: 420, totalStays: 6, createdAt: '17/05/2024' },
  { id: 6, fullName: 'Emily Davis', email: 'emily@example.com', phone: '0967890123', role: 'customer', verified: true, loyaltyPoints: 300, totalStays: 3, createdAt: '16/05/2024' },
  { id: 7, fullName: 'Michael Wilson', email: 'michael@example.com', phone: '0978901234', role: 'customer', verified: true, loyaltyPoints: 200, totalStays: 2, createdAt: '15/05/2024' },
  { id: 8, fullName: 'Sarah Taylor', email: 'sarah@example.com', phone: '0999012345', role: 'customer', verified: false, loyaltyPoints: 0, totalStays: 0, createdAt: '14/05/2024' },
];

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filter, Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700">
            <option>All Roles</option>
            <option>Admin</option>
            <option>Staff</option>
            <option>Customer</option>
          </select>
          
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap">
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    ID <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    Full Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Verified</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                   <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    Loyalty Points <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    Total Stays <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  <div className="flex items-center gap-1 justify-center cursor-pointer hover:text-slate-600 transition-colors">
                    Created At <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {usersData.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{user.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{user.fullName}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-slate-500">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {user.verified ? (
                        <Check size={18} className="text-green-500 font-bold" />
                      ) : (
                        <X size={18} className="text-red-500 font-bold" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{user.loyaltyPoints}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{user.totalStays}</td>
                  <td className="px-6 py-4 text-slate-500 text-center">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 8 of 120 users
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronLeft size={16} />} disabled />
          <PaginationButton icon={<ChevronLeft size={16} className="-ml-1" />} />
          
          <div className="flex items-center">
            <PageNumber active>1</PageNumber>
            <PageNumber>2</PageNumber>
            <PageNumber>3</PageNumber>
            <PageNumber>4</PageNumber>
            <PageNumber>5</PageNumber>
            <span className="px-2 text-slate-400">...</span>
            <PageNumber>15</PageNumber>
          </div>

          <PaginationButton icon={<ChevronRight size={16} />} />
          <PaginationButton icon={<ChevronRight size={16} className="-mr-1" />} />
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

export default UsersPage;
