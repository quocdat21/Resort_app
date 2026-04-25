import React from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    Home,
    MapPin,
    Layers,
    Maximize2,
    Users,
    // DollarSign,
    Info,
    CheckCircle2,
    AlertCircle,
    EyeOff,
    Image as ImageIcon,
    // Edit2,
    UserCheck
} from 'lucide-react';

interface ViewRoomProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id: string;
        roomNumber: string;
        image: string;
        secondaryImages?: string[];
        name: string;
        category: string;
        categoryId?: string;
        zone: string;
        price: number;
        size: number;
        capacity: string;
        description?: string;
        status: 'Available' | 'Occupied' | 'Maintenance' | 'Hidden';
    };
}

const ViewRoom: React.FC<ViewRoomProps> = ({ isOpen, onClose, room }) => {
    if (!isOpen) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const statusConfig = {
        Available: { label: 'Đang trống', icon: <CheckCircle2 size={14} />, color: 'bg-green-50 text-green-700 border-green-100' },
        Occupied: { label: 'Đang có khách', icon: <UserCheck size={14} />, color: 'bg-blue-50 text-blue-700 border-blue-100' },
        Maintenance: { label: 'Bảo trì', icon: <AlertCircle size={14} />, color: 'bg-orange-50 text-orange-700 border-orange-100' },
        Hidden: { label: 'Đang ẩn', icon: <EyeOff size={14} />, color: 'bg-red-50 text-red-700 border-red-100' },
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                                <Home className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Chi tiết phòng</h2>
                                <p className="text-sm text-slate-500 font-medium">Mã phòng: <span className="text-green-700 font-bold">#{room.roomNumber}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-slate-400 hover:text-slate-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200 shadow-sm"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 px-8 py-8 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left: Images (5/12) */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="relative group">
                                    <img
                                        src={room.image}
                                        alt={room.name}
                                        className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-md border border-slate-100"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-md border uppercase tracking-wider ${statusConfig[room.status].color}`}>
                                            {statusConfig[room.status].icon}
                                            <span>{statusConfig[room.status].label}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Images Grid */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hình ảnh chi tiết</h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {room.secondaryImages && room.secondaryImages.map((img, idx) => (
                                            <div key={idx} className="aspect-square relative group cursor-pointer">
                                                <img
                                                    src={img}
                                                    alt={`View ${idx + 1}`}
                                                    className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-sm transition-all group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                        {/* Placeholders */}
                                        {[...Array(5 - (room.secondaryImages?.length || 0))].map((_, i) => (
                                            <div key={i} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center">
                                                <ImageIcon size={16} className="text-slate-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Info (7/12) */}
                            <div className="lg:col-span-7 space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight">{room.name}</h3>
                                        <span className="text-2xl font-black text-green-700">
                                            {formatPrice(room.price)}
                                            <span className="text-xs text-slate-400 font-bold uppercase ml-1">/ Đêm</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                        <MapPin size={14} />
                                        <span>Khu vực: <span className="text-slate-900 font-bold">{room.zone}</span></span>
                                    </div>
                                </div>

                                {/* Info Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard icon={<Layers size={18} />} label="Loại phòng" value={room.category} color="purple" />
                                    <InfoCard icon={<Maximize2 size={18} />} label="Diện tích" value={`${room.size} m²`} color="blue" />
                                    <InfoCard icon={<Users size={18} />} label="Sức chứa" value={room.capacity} color="teal" />
                                    <InfoCard icon={<Info size={18} />} label="Mã phòng" value={`#${room.roomNumber}`} color="orange" />
                                </div>

                                {/* Description */}
                                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info size={14} />
                                        Mô tả chi tiết
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed italic">
                                        {room.description || "Chưa có mô tả chi tiết cho phòng này. Vui lòng cập nhật thông tin để khách hàng có thêm thông tin chi tiết về tiện nghi và hướng nhìn của phòng."}
                                    </p>
                                </div>

                                {/* System Info Table */}
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã hệ thống (ID)</span>
                                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{room.id}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cập nhật lần cuối</span>
                                        <span className="text-xs font-bold text-slate-700 italic">Vừa xong</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-[18px] text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            Đóng cửa sổ
                        </button>
                        <button
                            className="px-8 py-3 bg-green-700 text-white rounded-[18px] text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 active:scale-95 flex items-center gap-2"
                        >
                            Chỉnh sửa thông tin
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string }> = ({ icon, label, value, color }) => {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        teal: 'text-teal-600 bg-teal-50 border-teal-100',
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorMap[color]} flex flex-col gap-2`}>
            <div className="flex items-center gap-2 opacity-70">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <span className="text-sm font-black truncate">{value}</span>
        </div>
    );
};

export default ViewRoom;
