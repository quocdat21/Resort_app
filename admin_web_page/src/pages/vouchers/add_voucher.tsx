import React, { useState } from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    Ticket,
    Percent,
    CircleDollarSign,
    Calendar,
    Users,
    Info,
    ChevronDown,
    Save,
    Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { apiService } from '../../services/api_service';

interface AddVoucherProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddVoucher: React.FC<AddVoucherProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: '',
        max_discount: '',
        min_order_value: '0',
        usage_limit: '',
        start_date: '',
        end_date: '',
        status: 'active' as 'active' | 'inactive'
    });

    if (!isOpen) return null;

    const formatNumber = (value: string, isDecimal = false) => {
        if (!value) return '';
        if (isDecimal) return value;
        const stringValue = value.toString().replace(/\D/g, '');
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseNumber = (value: string, isDecimal = false) => {
        if (isDecimal) {
            let val = value.replace(/[^0-9.]/g, '');
            const parts = val.split('.');
            if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
            if (parseFloat(val) > 100) return '100';
            return val;
        }
        return value.replace(/\D/g, '');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'discount_value' && formData.discount_type === 'percentage') {
            setFormData(prev => ({ ...prev, [name]: parseNumber(value, true) }));
        } else if (['discount_value', 'max_discount', 'min_order_value', 'usage_limit'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: parseNumber(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiService.post('/vouchers', formData);

            if (response.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Mã giảm giá đã được tạo thành công.',
                    icon: 'success',
                    confirmButtonColor: '#15803d'
                });
                onSuccess();
                onClose();
            } else {
                Swal.fire('Lỗi!', response.message || 'Không thể tạo voucher', 'error');
            }
        } catch (error: any) {
            console.error('Create voucher error:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.response?.data?.message || 'Không thể tạo voucher. Vui lòng thử lại.',
                icon: 'error',
                confirmButtonColor: '#15803d'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-100 text-white">
                                <Ticket size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Thêm Voucher mới</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Khởi tạo mã giảm giá cho resort</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                        {/* Basic Info */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} /> Thông tin cơ bản
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">Mã Voucher <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="code"
                                        required
                                        placeholder="VD: WELCOME2026"
                                        value={formData.code}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold text-slate-900 placeholder:text-slate-300 transition-all uppercase tracking-widest"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">Trạng thái</label>
                                    <div className="relative">
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold text-slate-900 appearance-none transition-all cursor-pointer"
                                        >
                                            <option value="active">Đang hoạt động</option>
                                            <option value="inactive">Tạm dừng</option>
                                            <option value="expired">Đã hết hạn</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Discount Configuration */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CircleDollarSign size={14} /> Cấu hình giảm giá
                            </h3>

                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Loại giảm giá</label>
                                        <div className="flex gap-2 p-1 bg-white border border-slate-100 rounded-xl shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, discount_type: 'percentage' }))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.discount_type === 'percentage'
                                                        ? 'bg-green-700 text-white shadow-md'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <Percent size={14} /> Phần trăm
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, discount_type: 'fixed' }))}
                                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${formData.discount_type === 'fixed'
                                                        ? 'bg-green-700 text-white shadow-md'
                                                        : 'text-slate-500 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <CircleDollarSign size={14} /> Số tiền
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Giá trị giảm <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="discount_value"
                                                required
                                                placeholder={formData.discount_type === 'percentage' ? 'VD: 10.5' : 'VD: 500.000'}
                                                value={formData.discount_type === 'percentage' ? formData.discount_value : formatNumber(formData.discount_value)}
                                                onChange={handleChange}
                                                className="w-full pl-5 pr-12 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold text-green-700 shadow-sm"
                                            />
                                            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                                                {formData.discount_type === 'percentage' ? '%' : 'Đ'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Giảm tối đa (Đ)</label>
                                        <input
                                            type="text"
                                            name="max_discount"
                                            disabled={formData.discount_type === 'fixed'}
                                            placeholder="Không giới hạn"
                                            value={formatNumber(formData.max_discount)}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold text-slate-900 shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đơn hàng tối thiểu (Đ)</label>
                                        <input
                                            type="text"
                                            name="min_order_value"
                                            value={formatNumber(formData.min_order_value)}
                                            onChange={handleChange}
                                            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold text-slate-900 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Limits and Timing */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={14} /> Giới hạn & Thời gian
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lượt dùng tối đa</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="usage_limit"
                                            placeholder="Không giới hạn"
                                            value={formatNumber(formData.usage_limit)}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-bold text-slate-900"
                                        />
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Thời hạn hiệu lực <span className="text-red-500">*</span></label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="datetime-local"
                                            name="start_date"
                                            required
                                            value={formData.start_date}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-[11px] font-bold text-slate-900"
                                        />
                                        <span className="text-slate-300">→</span>
                                        <input
                                            type="datetime-local"
                                            name="end_date"
                                            required
                                            value={formData.end_date}
                                            onChange={handleChange}
                                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-[11px] font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-white text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all border border-slate-200"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-md shadow-green-100 flex items-center gap-2 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? 'Đang xử lý...' : 'Lưu Voucher'}
                        </button>
                    </div>
                </form>
            </div>
        </Portal>
    );
};

export default AddVoucher;
