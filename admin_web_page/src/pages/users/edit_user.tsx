import React, { useState } from 'react';
import {
  X,
  Upload,
  ChevronDown,
  Calendar as CalendarIcon
} from 'lucide-react';

interface EditUserProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
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
  };
}

const EditUser: React.FC<EditUserProps> = ({ isOpen, onClose, user }) => {
  const [isVerified, setIsVerified] = useState(user.verified);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Sửa thông tin người dùng</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Avatar Upload */}
            <div className="md:col-span-4 flex flex-col items-center">
              <div className="relative group mb-4">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload className="text-white" size={24} />
                </div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                <Upload size={16} />
                <span>Thay đổi ảnh đại diện</span>
              </button>
              <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider">
                JPG, PNG, WEBP (max. 2MB)
              </p>
            </div>

            {/* Right: Form */}
            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput label="Họ và tên" defaultValue={user.fullName} required />
                <FormSelect label="Vai trò" defaultValue={user.role} required options={['admin', 'staff', 'customer']} />
                <FormInput label="Email" defaultValue={user.email} required type="email" />
                <FormInput label="Số điện thoại" defaultValue={user.phone} />
              </div>

              <div className="space-y-2">
                <FormInput
                  label="Mật khẩu"
                  type="password"
                  placeholder="••••••••••••••"
                />
                <p className="text-[10px] text-slate-400 font-medium text-xs">Để trống nếu không muốn thay đổi mật khẩu</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <FormInput label="Ngày sinh" defaultValue={user.dob} />
                  <CalendarIcon className="absolute right-3 bottom-3 text-slate-400" size={16} />
                </div>
                <FormSelect label="Giới tính" defaultValue={user.gender} options={['Male', 'Female', 'Other']} />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 mb-1 block">Địa chỉ</label>
                <textarea
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm min-h-[100px]"
                  defaultValue={user.address}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-900 block">Xác thực</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsVerified(!isVerified)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isVerified ? 'bg-green-600' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${isVerified ? 'translate-x-6' : ''}`} />
                    </button>
                    <span className="text-sm font-bold text-slate-700">{isVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span>
                  </div>
                </div>
                <FormSelect label="Trạng thái" defaultValue={user.status} options={['active', 'inactive', 'banned']} />
                <FormInput label="Điểm tích lũy" defaultValue={user.loyaltyPoints.toString()} />
                <FormInput label="Tổng lượt ở" defaultValue={user.totalStays.toString()} />
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 block">Ngày tạo</label>
                  <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 font-medium cursor-not-allowed shadow-inner"
                    value={user.createdAt}
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 block">Cập nhật cuối</label>
                  <input
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-400 font-medium cursor-not-allowed shadow-inner"
                    value={user.updatedAt || user.createdAt}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
          >
            Hủy
          </button>
          <button
            className="px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-md shadow-green-100 active:scale-95"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

const FormInput: React.FC<{ label: string; defaultValue?: string; required?: boolean; type?: string; placeholder?: string }> = ({ label, defaultValue, required, type = 'text', placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-900 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
      defaultValue={defaultValue}
      placeholder={placeholder}
    />
  </div>
);

const FormSelect: React.FC<{ label: string; defaultValue?: string; required?: boolean; options: string[] }> = ({ label, defaultValue, required, options }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-900 block">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm cursor-pointer"
        defaultValue={defaultValue}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
    </div>
  </div>
);

export default EditUser;
