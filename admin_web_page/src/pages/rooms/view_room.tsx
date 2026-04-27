import React from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    Home,
    MapPin,
    Layers,
    Maximize2,
    Users,
    Info,
    Image as ImageIcon,
    LayoutGrid,
    Clock
} from 'lucide-react';

interface ViewRoomProps {
    isOpen: boolean;
    onClose: () => void;
    room: {
        id: string;
        main_image_url: string;
        secondary_images?: { id: number, image_url: string }[];
        name: string;
        category_name: string;
        category_id?: string;
        zone_name: string;
        base_price: number;
        size_sqm: number;
        capacity_adults: number;
        capacity_children: number;
        description?: string;
        instance_count: number;
        amenities?: { id: number, name: string, icon_url: string }[];
        created_at?: string;
        updated_at?: string;
    };
}

const ViewRoom: React.FC<ViewRoomProps> = ({ isOpen, onClose, room }) => {
    if (!isOpen) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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
                                <h2 className="text-2xl font-bold text-slate-900">Chi tiết Template Phòng</h2>
                                <p className="text-sm text-slate-500 font-medium">Mã hệ thống: <span className="text-green-700 font-bold">#{room.id}</span></p>
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
                                        src={`http://localhost:3000${room.main_image_url}`}
                                        alt={room.name}
                                        className="w-full aspect-[4/3] object-cover rounded-[24px] shadow-md border border-slate-100"
                                    />
                                    <div className="absolute top-4 left-4">
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-md border border-green-100 bg-green-50 text-green-700 uppercase tracking-wider">
                                            <LayoutGrid size={14} />
                                            <span>{room.instance_count} Phòng đang quản lý</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Images Grid */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hình ảnh chi tiết</h4>
                                    <div className="grid grid-cols-5 gap-3">
                                        {room.secondary_images && room.secondary_images.map((img, idx) => (
                                            <div key={img.id} className="aspect-square relative group cursor-pointer">
                                                <img
                                                    src={`http://localhost:3000${img.image_url}`}
                                                    alt={`View ${idx + 1}`}
                                                    className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-sm transition-all group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                        {/* Placeholders */}
                                        {[...Array(5 - (room.secondary_images?.length || 0))].map((_, i) => (
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
                                            {formatPrice(room.base_price)}
                                            <span className="text-xs text-slate-400 font-bold uppercase ml-1">/ Đêm</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                                        <MapPin size={14} />
                                        <span>Khu vực: <span className="text-slate-900 font-bold">{room.zone_name}</span></span>
                                    </div>
                                </div>

                                {/* Info Cards Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard icon={<Layers size={18} />} label="Loại phòng" value={room.category_name} color="purple" />
                                    <InfoCard icon={<Maximize2 size={18} />} label="Diện tích" value={`${room.size_sqm} m²`} color="blue" />
                                    <InfoCard icon={<Users size={18} />} label="Sức chứa" value={`${room.capacity_adults} Lớn, ${room.capacity_children} Trẻ`} color="teal" />
                                    <InfoCard icon={<LayoutGrid size={18} />} label="Số lượng phòng" value={`${room.instance_count} phòng`} color="orange" />
                                </div>

                                {/* Amenities */}
                                {room.amenities && room.amenities.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Layers size={14} />
                                            Tiện nghi có sẵn
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {room.amenities.map((amenity) => (
                                                <div key={amenity.id} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                                    <div className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-xl shrink-0">
                                                        {amenity.icon_url ? (
                                                            <img src={`http://localhost:3000${amenity.icon_url}`} alt={amenity.name} className="w-6 h-6 object-contain" />
                                                        ) : (
                                                            <Layers size={16} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{amenity.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info size={14} />
                                        Mô tả chi tiết (Dùng chung cho tất cả phòng con)
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed italic">
                                        {room.description || "Chưa có mô tả chi tiết cho phòng này. Vui lòng cập nhật thông tin để khách hàng có thêm thông tin chi tiết về tiện nghi và hướng nhìn của phòng."}
                                    </p>
                                </div>

                                {/* System Info Table */}
                                <div className="pt-6 border-t border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                            <Clock size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Ngày tạo</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900">{room.created_at ? new Date(room.created_at).toLocaleDateString('vi-VN') : '-'}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{room.created_at ? new Date(room.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                                            <Clock size={16} />
                                            <span className="text-xs font-bold uppercase tracking-wider">Cập nhật lần cuối</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900">{room.updated_at ? new Date(room.updated_at).toLocaleDateString('vi-VN') : '-'}</div>
                                            <div className="text-[10px] text-slate-400 font-medium">{room.updated_at ? new Date(room.updated_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mã định danh (ID)</span>
                                        <span className="text-[10px] font-mono font-black text-slate-300">#ROOM-TEMPLATE-{room.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-[18px] text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            Đóng cửa sổ
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
