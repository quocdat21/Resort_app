import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Wallet,
    Bed,
    ConciergeBell,
    Star,
    ChevronRight,
    Loader2
} from 'lucide-react';
import Portal from '../../components/common/Portal';

interface EditBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    isLoading: boolean;
    onUpdateStatus: (id: number, status: string) => void;
    formatDate: (date: string) => string;
    formatCurrency: (amount: number | string) => string;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
    isOpen,
    onClose,
    booking,
    isLoading,
    onUpdateStatus,
    formatDate,
    formatCurrency
}) => {
    const [localStatus, setLocalStatus] = useState<string>('');

    useEffect(() => {
        if (booking) {
            setLocalStatus(booking.status);
        }
    }, [booking, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (localStatus === booking.status) {
            onClose();
            return;
        }
        onUpdateStatus(booking.id, localStatus);
    };

    const DetailItem = ({ label, value, isBold, className = "" }: { label: string, value: any, isBold?: boolean, className?: string }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className={`text-sm ${isBold ? 'font-bold text-slate-900' : 'text-slate-600'} ${className}`}>{value || 'N/A'}</span>
        </div>
    );

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            Confirmed: 'bg-green-50 text-green-600 border-green-100',
            Pending: 'bg-orange-50 text-orange-600 border-orange-100',
            Cancelled: 'bg-red-50 text-red-600 border-red-100',
            Completed: 'bg-blue-50 text-blue-600 border-blue-100',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status as keyof typeof styles] || 'bg-slate-50 text-slate-600'}`}>
                {status}
            </span>
        );
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl h-auto max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
                    {/* Modal Header */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                                <Calendar size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết đơn đặt</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                    Quản lý đơn hàng <span className="text-green-700">#{booking?.booking_code || '...'}</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-600 active:scale-95"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 p-8">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-green-600 animate-spin" />
                                    <Loader2 className="absolute inset-0 m-auto text-green-600 animate-pulse" size={20} />
                                </div>
                                <p className="text-slate-500 font-bold mt-4 text-[10px] tracking-widest uppercase">Đang tải dữ liệu hệ thống...</p>
                            </div>
                        ) : booking ? (
                            <div className="space-y-8">
                                {/* Status Section */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm shadow-slate-100/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
                                                {booking.avatar_url ? (
                                                    <img
                                                        src={booking.avatar_url.startsWith('http') ? booking.avatar_url : `http://localhost:3000${booking.avatar_url}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl">
                                                        {booking.user_name?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Trạng thái hiện tại</label>
                                                <StatusBadge status={booking.status} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 min-w-[220px]">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Cập nhật trạng thái</label>
                                            <div className="relative group">
                                                <select
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                                                    value={localStatus}
                                                    onChange={(e) => setLocalStatus(e.target.value)}
                                                >
                                                    <option value="Pending">Chờ xử lý</option>
                                                    <option value="Confirmed">Xác nhận</option>
                                                    <option value="Cancelled">Hủy bỏ</option>
                                                    <option value="Completed">Hoàn thành</option>
                                                </select>
                                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none group-hover:text-green-600 transition-colors" size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    {/* Left Column */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
                                                <div className="w-8 h-8 rounded-xl bg-green-700 text-white flex items-center justify-center shadow-lg shadow-green-100">
                                                    <Calendar size={14} />
                                                </div>
                                                Thông tin thời gian
                                            </h3>
                                            <div className="space-y-6 pl-11">
                                                {booking.type === 'room' ? (
                                                    <>
                                                        <DetailItem label="Ngày nhận phòng" value={formatDate(booking.check_in)} isBold />
                                                        <DetailItem label="Ngày trả phòng" value={formatDate(booking.check_out)} isBold />
                                                    </>
                                                ) : (
                                                    <DetailItem label="Ngày sử dụng" value={formatDate(booking.service_booking_date || booking.created_at)} isBold />
                                                )}
                                                <DetailItem label="Đã đặt vào lúc" value={new Date(booking.created_at).toLocaleString('vi-VN')} />
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
                                                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                                    <Wallet size={14} />
                                                </div>
                                                Chi phí thanh toán
                                            </h3>
                                            <div className="space-y-6 pl-11">
                                                <DetailItem label="Tổng cộng" value={formatCurrency(booking.total_amount)} isBold className="text-green-700 text-lg" />
                                                <DetailItem label="Khấu trừ Voucher" value={formatCurrency(booking.discount_amount || 0)} className="text-red-500 font-bold" />
                                                <DetailItem label="Phương thức" value={
                                                    booking.payment_method === 'BANK_TRANSFER' ? 'Chuyển khoản' :
                                                        booking.payment_method === 'VNPAY' ? 'VNPAY' :
                                                            booking.payment_method === 'CREDIT_CARD' ? 'Thẻ tín dụng' :
                                                                booking.payment_method === 'CASH' ? 'Tiền mặt' :
                                                                    booking.payment_method || 'N/A'
                                                } />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
                                                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-100">
                                                    {booking.type === 'room' ? <Bed size={14} /> : <ConciergeBell size={14} />}
                                                </div>
                                                {booking.type === 'room' ? 'Chi tiết phòng' : 'Chi tiết dịch vụ'}
                                            </h3>
                                            <div className="space-y-6 pl-11">
                                                <DetailItem label="Tên phòng" value={booking.item_details?.name || 'N/A'} isBold />
                                                {booking.type === 'room' ? (
                                                    <>
                                                        <DetailItem label="Hạng phòng" value={booking.item_details?.category_name || 'N/A'} />
                                                        <DetailItem label="Số phòng" value={booking.room_numbers?.join(', ') || 'Đang chờ gán...'} isBold className="text-blue-600" />
                                                    </>
                                                ) : (
                                                    <>
                                                        <DetailItem label="Số lượng đặt" value={booking.item_details?.quantity || booking.quantity || 1} isBold />
                                                        <DetailItem label="Đơn giá booking" value={formatCurrency(booking.item_details?.booking_price || 0)} />
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-[11px] font-black text-slate-900 mb-6 flex items-center gap-3 uppercase tracking-widest">
                                                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-100">
                                                    <Star size={14} />
                                                </div>
                                                Dịch vụ đính kèm
                                            </h3>
                                            <div className="space-y-4 pl-11">
                                                {booking.selected_services?.length > 0 ? (
                                                    booking.selected_services.map((s: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between group py-1">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-700 group-hover:text-green-700 transition-colors">{s.name} <span className="text-slate-400 font-medium">x{s.quantity}</span></span>
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-900">{formatCurrency(s.total_price)}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 font-bold italic tracking-wide">KHÔNG CÓ DỊCH VỤ ĐÍNH KÈM</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">Không tìm thấy dữ liệu yêu cầu</p>
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="px-8 py-6 border-t border-slate-100 bg-white flex items-center justify-end sticky bottom-0 z-10 rounded-b-[32px]">
                        <button
                            onClick={handleSave}
                            className="px-12 py-3.5 rounded-2xl text-[11px] font-black tracking-widest uppercase bg-green-700 text-white hover:bg-green-800 active:scale-95 transition-all shadow-xl shadow-green-100"
                        >
                            HOÀN TẤT & LƯU
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default EditBookingModal;
