import React from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    Users,
    Tag,
    ClipboardList,
    DollarSign,
    Info,
    Calendar,
    Clock,
    ShieldCheck,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

interface ServicePrice {
    id: number;
    price_type: 'full_day' | 'half_day' | 'unit';
    price: number;
    unit: string;
    description: string;
}

interface ServiceImage {
    id: number;
    image_url: string;
}

interface Service {
    id: number;
    type: 'Hall' | 'Food' | 'Event' | 'Other';
    name: string;
    capacity?: number;
    description?: string;
    image_url?: string;
    status: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
    prices?: ServicePrice[];
    secondary_images?: ServiceImage[];
}

interface ViewServiceProps {
    isOpen: boolean;
    onClose: () => void;
    service: Service | null;
}

const ViewService: React.FC<ViewServiceProps> = ({ isOpen, onClose, service }) => {
    if (!isOpen || !service) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatNumber = (num?: number) => {
        if (num === undefined || num === null) return '-';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const getPriceTypeName = (type: string) => {
        switch (type) {
            case 'full_day': return 'Giá thuê 1 ngày';
            case 'half_day': return 'Giá thuê 1/2 ngày';
            case 'unit': return 'Giá theo đơn vị';
            default: return type;
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                                <ClipboardList className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết dịch vụ</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mã hệ thống: <span className="text-green-700 font-bold">#SERV-{service.id}</span></p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content Section */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left Column: Images */}
                            <div className="lg:col-span-5 space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Ảnh đại diện chính
                                    </h3>
                                    <div className="relative aspect-video bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                                        {service.image_url ? (
                                            <img
                                                src={service.image_url}
                                                alt={service.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ClipboardList size={48} className="text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 backdrop-blur-md border rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${service.status === 'active'
                                                ? 'bg-blue-500/30 border-blue-400/30 text-blue-300'
                                                : 'bg-red-500/30 border-red-400/30 text-red-300'
                                                }`}>
                                                {service.status === 'active' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                                {service.status === 'active' ? 'Đang hoạt động' : 'Ngưng cung cấp'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        Ảnh chi tiết
                                    </h3>
                                    <div className="grid grid-cols-5 gap-3">
                                        {Array.from({ length: 5 }).map((_, idx) => {
                                            const img = service.secondary_images?.[idx];
                                            return (
                                                <div key={idx} className="aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden hover:border-green-500/50 transition-all group relative">
                                                    {img ? (
                                                        <img
                                                            src={img.image_url}
                                                            alt={`Sub ${idx}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-slate-200">
                                                                <Tag size={12} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Info */}
                            <div className="lg:col-span-7 space-y-10">
                                {/* Basic Info */}
                                <section className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên dịch vụ</label>
                                            <p className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900">
                                                {service.name}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại dịch vụ</label>
                                            <p className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 uppercase tracking-widest text-[11px]">
                                                {service.type === 'Hall' ? 'Hội trường' :
                                                    service.type === 'Food' ? 'Ẩm thực' :
                                                        service.type === 'Event' ? 'Sự kiện' : 'Khác'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Users size={14} /> Sức chứa (Khách)
                                            </label>
                                            <p className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900">
                                                {service.capacity ? `${formatNumber(service.capacity)} khách` : 'N/A'}
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar size={14} /> Ngày tạo hệ thống
                                            </label>
                                            <p className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900">
                                                {service.created_at ? new Date(service.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <Info size={14} /> Mô tả chi tiết
                                        </label>
                                        <div className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line min-h-[100px]">
                                            {service.description || 'Chưa có mô tả chi tiết cho dịch vụ này.'}
                                        </div>
                                    </div>
                                </section>

                                {/* Prices */}
                                <section className="space-y-6">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign size={14} /> Cấu hình giá dịch vụ
                                    </label>
                                    <div className="space-y-3">
                                        {service.prices && service.prices.length > 0 ? (
                                            service.prices.map((price, idx) => (
                                                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-green-200 transition-all">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{getPriceTypeName(price.price_type)}</span>
                                                        <span className="text-sm font-bold text-slate-900">{price.description || 'Giá niêm yết'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-lg font-black text-green-700">{formatPrice(price.price)}</span>
                                                        {price.unit && <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ {price.unit}</span>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                                <p className="text-xs font-medium text-slate-400 italic">Dịch vụ chưa được cấu hình bảng giá.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <ShieldCheck size={18} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Dữ liệu được xác thực bởi hệ thống quản lý Resort 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-200 active:scale-95"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ViewService;
