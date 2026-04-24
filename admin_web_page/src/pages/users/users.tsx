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
  ChevronFirst,
  ChevronLast,
  ArrowUpDown
} from 'lucide-react';

import ViewUser from './view_user';
import EditUser from './edit_user';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  verified: boolean;
  dob: string;
  gender: string;
  address: string;
  loyaltyPoints: number;
  totalStays: number;
  createdAt: string;
  avatar: string;
}

const usersData: User[] = [
  { id: 1, fullName: 'John Doe', email: 'john@example.com', phone: '0912345678', role: 'admin', verified: true, dob: '01/01/1990', gender: 'Male', address: '123 Main St, New York, NY', loyaltyPoints: 1200, totalStays: 15, createdAt: '20/05/2024 08:30 AM', avatar: 'https://i.pravatar.cc/150?u=john' },
  { id: 2, fullName: 'Mary Smith', email: 'mary@example.com', phone: '0923456789', role: 'staff', verified: true, dob: '15/02/1990', gender: 'Female', address: '123 Beach Road, Boracay Island, Malay, Aklan, Philippines', loyaltyPoints: 850, totalStays: 10, createdAt: '19/05/2024 08:30 AM', avatar: 'https://i.pravatar.cc/150?u=mary' },
  { id: 3, fullName: 'Robert Brown', email: 'robert@example.com', phone: '0934567890', role: 'customer', verified: true, dob: '10/10/1985', gender: 'Male', address: '456 Garden St, London, UK', loyaltyPoints: 650, totalStays: 8, createdAt: '18/05/2024 09:15 AM', avatar: 'https://i.pravatar.cc/150?u=robert' },
  { id: 4, fullName: 'Linda Williams', email: 'linda@example.com', phone: '0945678901', role: 'customer', verified: false, dob: '05/05/1992', gender: 'Female', address: '789 Pine St, Sydney, AU', loyaltyPoints: 0, totalStays: 0, createdAt: '16/05/2024 10:00 AM', avatar: 'https://i.pravatar.cc/150?u=linda' },
  { id: 5, fullName: 'David Johnson', email: 'david@example.com', phone: '0956789012', role: 'staff', verified: true, dob: '12/12/1988', gender: 'Male', address: '101 Mountain View, Denver, CO', loyaltyPoints: 420, totalStays: 6, createdAt: '17/05/2024 11:30 AM', avatar: 'https://i.pravatar.cc/150?u=david' },
];

const UsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

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
          <div className="relative">
             <select className="appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Staff</option>
              <option>Customer</option>
            </select>
            <ChevronDownIcon />
          </div>
          
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-bold text-slate-900">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-slate-500">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100 uppercase tracking-wider">
                      {user.role}
                    </span>
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
                  <td className="px-6 py-4 text-slate-500 text-center whitespace-nowrap">{user.createdAt.split(' ')[0]}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleView(user)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                        title="Edit"
                      >
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 5 of 120 users
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronFirst size={16} />} disabled />
          <PaginationButton icon={<ChevronLeft size={16} />} />
          
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
          <PaginationButton icon={<ChevronLast size={16} />} />
        </div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <ViewUser 
            isOpen={isViewOpen} 
            onClose={() => setIsViewOpen(false)} 
            user={selectedUser} 
          />
          <EditUser 
            isOpen={isEditOpen} 
            onClose={() => setIsEditOpen(false)} 
            user={selectedUser} 
          />
        </>
      )}
    </div>
  );
};

const ChevronDownIcon = () => (
  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
    <ChevronRight size={14} className="rotate-90" />
  </div>
);

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
