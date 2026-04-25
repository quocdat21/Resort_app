import React, { useState } from 'react';
import {
    X,
    Upload,
    ChevronDown,
    Calendar as CalendarIcon,
    User,
    Mail,
    Phone,
    Lock,
    Shield,
    Activity,
    MapPin
} from 'lucide-react';

interface AddUserProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddUser: React.FC<AddUserProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'customer',
        dateOfBirth: '',
        gender: 'Male',
        address: '',
        status: 'active'
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('User Added:', formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Thêm người dùng mới</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tạo tài khoản nhân viên hoặc khách hàng</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 py-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    <form id="add-user-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                            {/* Left: Avatar Placeholder */}
                            <div className="md:col-span-4 flex flex-col items-center">
                                <div className="relative group mb-4">
                                    <div className="w-32 h-32 rounded-full bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm text-slate-300">
                                        <User size={48} />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Upload className="text-white" size={24} />
                                    </div>
                                </div>
                                <button type="button" className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                                    <Upload size={16} />
                                    <span>Tải ảnh lên</span>
                                </button>
                                <p className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-wider text-center">
                                    JPG, PNG, WEBP<br />(max. 2MB)
                                </p>
                            </div>

                            {/* Right: Form Fields */}
                            <div className="md:col-span-8 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormInput
                                        label="Họ và tên"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên"
                                        required
                                    />
                                    <FormSelect
                                        label="Vai trò"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        options={[
                                            { label: 'Admin', value: 'admin' },
                                            { label: 'Staff', value: 'staff' },
                                            { label: 'Customer', value: 'customer' }
                                        ]}
                                        required
                                    />
                                    <FormInput
                                        label="Địa chỉ Email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="example@resort.com"
                                        required
                                    />
                                    <FormInput
                                        label="Số điện thoại"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="+84 ..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <FormInput
                                        label="Mật khẩu"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <FormInput
                                            label="Ngày sinh"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            type="date"
                                        />
                                    </div>
                                    <FormSelect
                                        label="Giới tính"
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        options={[
                                            { label: 'Nam', value: 'Male' },
                                            { label: 'Nữ', value: 'Female' },
                                            { label: 'Khác', value: 'Other' }
                                        ]}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-900 mb-1 block">Địa chỉ</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm min-h-[80px]"
                                            placeholder="Nhập địa chỉ chi tiết"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormSelect
                                        label="Trạng thái"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        options={[
                                            { label: 'Hoạt động', value: 'active' },
                                            { label: 'Không hoạt động', value: 'inactive' },
                                            { label: 'Bị chặn', value: 'banned' }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
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
                        form="add-user-form"
                        type="submit"
                        className="px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-md shadow-green-100 active:scale-95"
                    >
                        Tạo người dùng
                    </button>
                </div>
            </div>
        </div>
    );
};

const FormInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string
}> = ({ label, name, value, onChange, required, type = 'text', placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-900 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            name={name}
            value={value}
            onChange={onChange}
            type={type}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            placeholder={placeholder}
            required={required}
        />
    </div>
);

const FormSelect: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    options: { label: string; value: string }[]
}> = ({ label, name, value, onChange, required, options }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-900 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full appearance-none px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm cursor-pointer"
                required={required}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
    </div>
);

export default AddUser;
