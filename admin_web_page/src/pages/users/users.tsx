import React, { useState, useEffect } from 'react';
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
  ArrowUpDown,
  ChevronDown
} from 'lucide-react';

import Pagination from '../../components/common/Pagination';
import ViewUser from './view_user';
import EditUser from './edit_user';
import AddUser from './add_user';
import { apiService } from '../../services/api_service';

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
  status?: string;
  updatedAt?: string;
}

// Removed dummy data

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 0
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, sortField, sortOrder, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchTerm,
        role: selectedRole,
        sort_by: sortField,
        order: sortOrder,
        page: currentPage.toString(),
        limit: '8'
      });

      const response = await apiService.get(`/users?${params.toString()}`);
      if (response.success) {
        setUsers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page on sort
  };

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
            placeholder="Tìm kiếm người dùng..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select
              className="appearance-none bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
            <ChevronDownIcon />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Thêm người dùng</span>
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative min-h-[400px]">
        {/* Loading Overlay for subsequent loads */}
        {loading && users.length > 0 && (
          <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-green-100 border-t-green-700 rounded-full animate-spin"></div>
              <span className="text-[11px] font-bold text-green-800 uppercase tracking-widest">Đang cập nhật...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => handleSort('id')}
                  >
                    ID <ArrowUpDown size={12} className={sortField === 'id' ? 'text-green-600' : ''} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => handleSort('full_name')}
                  >
                    Họ và tên <ArrowUpDown size={12} className={sortField === 'full_name' ? 'text-green-600' : ''} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Email</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Số điện thoại</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Xác thực</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => handleSort('loyalty_points')}
                  >
                    Điểm tích lũy <ArrowUpDown size={12} className={sortField === 'loyalty_points' ? 'text-green-600' : ''} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => handleSort('total_stays')}
                  >
                    Tổng lượt ở <ArrowUpDown size={12} className={sortField === 'total_stays' ? 'text-green-600' : ''} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">
                  <div
                    className="flex items-center gap-1 justify-center cursor-pointer hover:text-slate-600 transition-colors"
                    onClick={() => handleSort('created_at')}
                  >
                    Ngày tạo <ArrowUpDown size={12} className={sortField === 'created_at' ? 'text-green-600' : ''} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading && users.length === 0 ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="border-b border-slate-100 animate-pulse">
                    <td className="px-6 py-5"><div className="h-4 w-8 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                        <div className="h-4 w-40 bg-slate-100 rounded"></div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-16 bg-slate-100 rounded-md"></div></td>
                    <td className="px-6 py-5"><div className="mx-auto h-5 w-5 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5"><div className="mx-auto h-6 w-16 bg-slate-100 rounded-full"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-10 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5"><div className="h-4 w-10 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5"><div className="mx-auto h-4 w-20 bg-slate-100 rounded"></div></td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                        <div className="w-8 h-8 bg-slate-100 rounded-lg"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-8 text-center text-slate-500">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{user.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-100" />
                        <span className="min-w-[200px] font-bold text-slate-900">{user.fullName}</span>
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
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${user.status === 'active'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : user.status === 'banned'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-slate-50 text-slate-700 border-slate-100'
                          }`}>
                          <span className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-green-600' : user.status === 'banned' ? 'bg-red-600' : 'bg-slate-600'
                            }`}></span>
                          {user.status || 'ACTIVE'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">{user.loyaltyPoints}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{user.totalStays}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-slate-900 flex items-center justify-center gap-2">
                        <span className="font-bold">
                          {user.createdAt ? user.createdAt.split(' ')[0].split('-').reverse().join('/') : '-'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {user.createdAt ? user.createdAt.split(' ')[1].substring(0, 5) : ''}
                        </span>
                      </div>
                    </td>
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
                )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => setCurrentPage(page)}
        itemName="người dùng"
      />

      {/* Modals */}
      <AddUser
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => fetchUsers()}
      />
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
            onSuccess={() => fetchUsers()}
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

export default UsersPage;
