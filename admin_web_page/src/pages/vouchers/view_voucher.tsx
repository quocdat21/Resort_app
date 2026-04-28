import React from 'react';
import Portal from '../../components/common/Portal';
import { 
    X, 
    Ticket, 
    Percent, 
    CircleDollarSign, 
    Calendar, 
    Users, 
    Clock,
    ShieldCheck,
    Info,
    CheckCircle2,
    AlertCircle,
    Activity,
    Tag,
    Briefcase
} from 'lucide-react';

interface Voucher {
    id: number;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    max_discount?: number;
    min_order_value: number;
    usage_limit?: number;
    used_count: number;
    start_date: string;
    end_date: string;
    status: 'active' | 'inactive' | 'expired';
    created_at: string;
}

interface ViewVoucherProps {
    isOpen: boolean;
    onClose: () => void;
    voucher: Voucher | null;
}

const ViewVoucher: React.FC<ViewVoucherProps> = ({ isOpen, onClose, voucher }) => {
    if (!isOpen || !voucher) return null;

    const formatPrice = (price?: number) => {
        if (price === undefined || price === null) return '-';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatNumber = (num?: number) => {
        if (num === undefined || num === null) return 'Không giới hạn';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 text-white">
                                <Ticket size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chi tiết Voucher</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Xem thông tin mã giảm giá hệ thống</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 sm:p-10">
                        {/* Status Hero Card */}
                        <div className="bg-slate-900 rounded-[32px] p-8 mb-10 text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                                <Ticket size={160} />
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <span className="px-4 py-1.5 bg-green-500/20 backdrop-blur-md border border-green-400/30 text-green-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                        Resort Voucher
                                    </span>
                                    <span className={`px-4 py-1.5 backdrop-blur-md border rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${
                                        voucher.status === 'active' 
                                            ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' 
                                            : 'bg-red-500/20 border-red-400/30 text-red-300'
                                    }`}>
                                        {voucher.status === 'active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                        {voucher.status === 'active' ? 'Đang hoạt động' : voucher.status === 'expired' ? 'Đã hết hạn' : 'Đã tạm dừng'}
                                    </span>
                                </div>
                                <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase">{voucher.code}</h2>
                                <p className="text-slate-400 font-medium italic">Giảm giá áp dụng cho toàn bộ dịch vụ của Resort</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left Side: Discount & Rules */}
                            <div className="lg:col-span-7 space-y-10">
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <CircleDollarSign size={14} /> Chi tiết ưu đãi
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center group hover:bg-white hover:border-green-200 transition-all shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-green-700 mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                                {voucher.discount_type === 'percentage' ? <Percent size={20} /> : <CircleDollarSign size={20} />}
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá trị giảm</p>
                                            <p className="text-xl font-bold text-slate-900 tracking-tight">
                                                {voucher.discount_type === 'percentage' ? `${voucher.discount_value}%` : formatPrice(voucher.discount_value)}
                                            </p>
                                        </div>

                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center group hover:bg-white hover:border-blue-200 transition-all shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                                <Briefcase size={20} />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Đơn tối thiểu</p>
                                            <p className="text-xl font-bold text-slate-900 tracking-tight">{formatPrice(voucher.min_order_value)}</p>
                                        </div>

                                        {voucher.discount_type === 'percentage' && (
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center group hover:bg-white hover:border-purple-200 transition-all shadow-sm">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-purple-600 mb-3 group-hover:scale-110 transition-transform shadow-sm">
                                                    <Tag size={20} />
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giảm tối đa</p>
                                                <p className="text-xl font-bold text-slate-900 tracking-tight">{formatPrice(voucher.max_discount)}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Info size={14} className="text-green-700" /> Điều kiện áp dụng
                                    </h3>
                                    <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-4">
                                        <div className="flex gap-4">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xs italic">1</div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">Mã giảm giá chỉ áp dụng cho khách hàng đã xác thực tài khoản và thực hiện đặt phòng/dịch vụ qua hệ thống chính thức của resort.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xs italic">2</div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">Giá trị đơn hàng phải đạt mức tối thiểu <span className="font-bold text-slate-900">{formatPrice(voucher.min_order_value)}</span> sau khi đã trừ đi các khoản phí dịch vụ khác (nếu có).</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-xs italic">3</div>
                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">Mỗi khách hàng chỉ được sử dụng mã này 01 lần duy nhất trong suốt thời gian diễn ra chương trình khuyến mãi.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Side: Metadata & Performance */}
                            <div className="lg:col-span-5 space-y-6">
                                <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 space-y-8 sticky top-0">
                                    <section className="space-y-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiệu suất Voucher</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <Users size={18} className="text-slate-400" />
                                                    <span className="text-sm font-bold">Lượt đã dùng</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">{voucher.used_count} lượt</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <Activity size={18} className="text-slate-400" />
                                                    <span className="text-sm font-bold">Giới hạn sử dụng</span>
                                                </div>
                                                <span className="text-sm font-black text-slate-900">{formatNumber(voucher.usage_limit)}</span>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase">Tiến độ sử dụng</span>
                                                    <span className="text-[10px] font-black text-green-700 uppercase">
                                                        {voucher.usage_limit ? Math.round((voucher.used_count / voucher.usage_limit) * 100) : 0}%
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className="h-full bg-green-700 rounded-full shadow-lg transition-all duration-1000"
                                                        style={{ width: `${voucher.usage_limit ? (voucher.used_count / voucher.usage_limit) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-6 pt-8 border-t border-slate-200">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian áp dụng</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <Calendar size={18} className="text-slate-400" />
                                                    <span className="text-sm font-bold">Ngày bắt đầu</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900">{new Date(voucher.start_date).toLocaleDateString('vi-VN')}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(voucher.start_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-slate-500">
                                                    <Clock size={18} className="text-slate-400" />
                                                    <span className="text-sm font-bold">Ngày kết thúc</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-slate-900">{new Date(voucher.end_date).toLocaleDateString('vi-VN')}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(voucher.end_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <div className="pt-6 border-t border-slate-200">
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <ShieldCheck size={18} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest italic">Chứng chỉ Voucher hợp lệ 2026</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-100 active:scale-95"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ViewVoucher;
