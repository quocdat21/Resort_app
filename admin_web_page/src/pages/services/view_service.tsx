import React from 'react';
import Portal from '../../components/common/Portal';
import { 
    X, 
    Info, 
    Home, 
    Layers, 
    DollarSign, 
    Users,
    ClipboardList,
    Clock,
    Tag
} from 'lucide-react';

interface Service {
    id: number;
    type: 'Hall' | 'Food' | 'Event' | 'Other';
    name: string;
    capacity?: number;
    price_full_day?: number;
    price_half_day?: number;
    base_price?: number;
    price_unit?: string;
    description?: string;
}

interface ViewServiceProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

const ViewService: React.FC<ViewServiceProps> = ({ isOpen, onClose, service }) => {
    if (!isOpen || !service) return null;

    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return '-';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'Hall': return { label: 'Hội trường', color: 'bg-purple-100 text-purple-700' };
            case 'Food': return { label: 'Ẩm thực', color: 'bg-orange-100 text-orange-700' };
            case 'Event': return { label: 'Sự kiện', color: 'bg-blue-100 text-blue-700' };
            default: return { label: 'Dịch vụ khác', color: 'bg-slate-100 text-slate-700' };
        }
    };

    const typeInfo = getTypeLabel(service.type);

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                                <ClipboardList className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết dịch vụ</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thông tin hệ thống: <span className="text-green-700">#SERV-{service.id}</span></p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        {/* Title & Type */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight">{service.name}</h3>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className={`px-3 py-1 ${typeInfo.color} text-[10px] font-bold rounded-full uppercase tracking-wider`}>
                                        {typeInfo.label}
                                    </span>
                                    {service.capacity && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                            <Users size={12} /> {service.capacity} Khách
                                        </span>
                                    )}
                                </div>
                            </div>
                            {service.base_price && (
                                <div className="text-right">
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Đơn giá cơ bản</div>
                                    <div className="text-2xl font-black text-green-700">
                                        {formatPrice(service.base_price)}
                                        {service.price_unit && <span className="text-xs text-slate-400 font-bold ml-1">/{service.price_unit}</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Price Details for Hall */}
                        {service.type === 'Hall' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <PriceCard 
                                    icon={<Clock size={18} />} 
                                    label="Giá thuê 1 ngày" 
                                    price={formatPrice(service.price_full_day)} 
                                    color="blue" 
                                />
                                <PriceCard 
                                    icon={<Clock size={18} />} 
                                    label="Giá thuê 1/2 ngày" 
                                    price={formatPrice(service.price_half_day)} 
                                    color="purple" 
                                />
                            </div>
                        )}

                        {/* Description / Notes */}
                        <div className="space-y-3">
                            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} />
                                Ghi chú & Chi tiết bao gồm
                            </h4>
                            <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm italic text-slate-600 text-sm leading-relaxed">
                                {service.description || "Dịch vụ hiện chưa có ghi chú chi tiết. Vui lòng cập nhật thêm các tiện ích đi kèm (ví dụ: màn hình LED, âm thanh, ánh sáng...) để khách hàng có thông tin đầy đủ nhất."}
                            </div>
                        </div>

                        {/* Usage Info */}
                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                                <Tag size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Dịch vụ đang hoạt động</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-200">#INTERNAL-SERVICE-HASH-7F2A</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button 
                            onClick={onClose} 
                            className="px-10 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

const PriceCard: React.FC<{ icon: React.ReactNode; label: string; price: string; color: string }> = ({ icon, label, price, color }) => {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        green: 'text-green-600 bg-green-50 border-green-100',
    };

    return (
        <div className={`p-5 rounded-[24px] border ${colorMap[color]} flex flex-col gap-3 shadow-sm`}>
            <div className="flex items-center gap-2 opacity-70">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-xl font-black">{price}</span>
        </div>
    );
};

export default ViewService;
