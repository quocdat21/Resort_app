import React from 'react';
import {
    X,
    Mail,
    Phone,
    ShieldCheck,
    Calendar,
    User as UserIcon,
    MapPin,
    Award,
    Clock,
    MoreHorizontal,
    Bed
} from 'lucide-react';

interface ViewUserProps {
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

const ViewUser: React.FC<ViewUserProps> = ({ isOpen, onClose, user }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">Thông tin người dùng</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    {/* Profile Header */}
                    <div className="flex items-center gap-5 mb-8">
                        <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-slate-900">{user.fullName}</h3>

                                {user.verified ? (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">
                                        <ShieldCheck size={10} className="fill-green-600/10" />
                                        Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100">
                                        <X size={10} />
                                        Verified
                                    </span>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Mail size={14} />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Phone size={14} />
                                    <span>{user.phone}</span>
                                </div>
                            </div>
                        </div>
                        <span className="self-start px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100 uppercase tracking-wider">
                            {user.role}
                        </span>
                    </div>

                    {/* Details List */}
                    <div className="space-y-4">
                        <DetailItem icon={<UserIcon size={16} />} label="ID" value={user.id.toString()} />
                        <DetailItem icon={<UserIcon size={16} />} label="Họ và tên" value={user.fullName} />
                        <DetailItem icon={<Mail size={16} />} label="Email" value={user.email} />
                        <DetailItem icon={<Phone size={16} />} label="Số điện thoại" value={user.phone} />
                        <DetailItem
                            icon={<ShieldCheck size={16} />}
                            label="Vai trò"
                            value={<span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100 uppercase">{user.role}</span>}
                        />
                        <DetailItem
                            icon={<ShieldCheck size={16} />}
                            label="Xác thực"
                            value={
                                <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${user.verified ? 'bg-green-500' : 'bg-red-500'}`}>
                                        <ShieldCheck size={10} className="text-white" />
                                    </div>
                                    {user.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                                </div>
                            }
                        />
                        <DetailItem
                            icon={<Clock size={16} />}
                            label="Trạng thái"
                            value={
                                <span className={`flex items-center w-fit gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${user.status === 'active'
                                    ? 'bg-green-50 text-green-700 border-green-100'
                                    : user.status === 'banned'
                                        ? 'bg-red-50 text-red-700 border-red-100'
                                        : 'bg-slate-50 text-slate-700 border-slate-100'
                                    }`}>
                                    <span className={`w-1 h-1 rounded-full ${user.status === 'active' ? 'bg-green-600' : user.status === 'banned' ? 'bg-red-600' : 'bg-slate-600'
                                        }`}></span>
                                    {user.status || 'ACTIVE'}
                                </span>
                            }
                        />
                        <DetailItem icon={<Calendar size={16} />} label="Ngày sinh" value={user.dob} />
                        <DetailItem icon={<UserIcon size={16} />} label="Giới tính" value={user.gender} />
                        <DetailItem icon={<MapPin size={16} />} label="Địa chỉ" value={user.address} />
                        <DetailItem icon={<Award size={16} />} label="Điểm tích lũy" value={user.loyaltyPoints.toString()} />
                        <DetailItem icon={<Bed size={16} />} label="Tổng lượt ở" value={user.totalStays.toString()} />
                        <DetailItem icon={<Clock size={16} />} label="Ngày tạo" value={user.createdAt} />
                        <DetailItem icon={<Clock size={16} />} label="Cập nhật cuối" value={user.updatedAt || user.createdAt} />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-95"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0 group">
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
            <div className="w-5 flex justify-center">{icon}</div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm font-bold text-slate-900 max-w-[240px] text-right">
            {value}
        </div>
    </div>
);

export default ViewUser;
