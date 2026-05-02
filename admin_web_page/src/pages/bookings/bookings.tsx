import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronFirst,
    ChevronLast,
    Eye,
    Edit2,
    Trash2,
    Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

import RoomBookingsTable from './rooms_bookings';
import type { RoomBooking } from './rooms_bookings';

import ServiceBookingsTable from './services_bookings';
import type { ServiceBooking } from './services_bookings';
import { apiService } from '../../services/api_service';

// --- Main Page ---
const BookingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'rooms' | 'services'>('rooms');
    const [searchTerm, setSearchTerm] = useState('');
    const [roomBookings, setRoomBookings] = useState<RoomBooking[]>([]);
    const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.get('/bookings/admin/all');
            
            if (response.success) {
                const allData = response.data;
                
                // Map Room Bookings
                const rooms = allData
                    .filter((b: any) => b.type === 'room')
                    .map((b: any) => ({
                        id: b.id,
                        bookingCode: b.booking_code,
                        user: b.user_name,
                        room: b.item_name,
                        checkIn: formatDate(b.check_in),
                        checkOut: formatDate(b.check_out),
                        totalAmount: formatCurrency(b.total_amount),
                        status: b.status
                    }));

                // Map Service Bookings
                const services = allData
                    .filter((b: any) => b.type === 'service')
                    .map((b: any) => ({
                        id: b.id,
                        bookingCode: b.booking_code,
                        user: b.user_name,
                        service: b.item_name,
                        bookingDate: formatDate(b.service_booking_date || b.created_at),
                        quantity: b.quantity || 1,
                        totalAmount: formatCurrency(b.total_amount),
                        status: b.status
                    }));

                setRoomBookings(rooms);
                setServiceBookings(services);
            } else {
                setError(response.message || 'Failed to fetch bookings');
            }
        } catch (err) {
            console.error(err);
            setError('Error connecting to server');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, currentStatus: string) => {
        const { value: newStatus } = await Swal.fire({
            title: 'Cập nhật trạng thái',
            input: 'select',
            inputOptions: {
                'Pending': 'Chờ xử lý',
                'Confirmed': 'Xác nhận',
                'Cancelled': 'Hủy bỏ',
                'Completed': 'Hoàn thành'
            },
            inputValue: currentStatus,
            showCancelButton: true,
            confirmButtonText: 'Cập nhật',
            cancelButtonText: 'Hủy',
            inputValidator: (value) => {
                return new Promise((resolve) => {
                    if (value) {
                        resolve(null);
                    } else {
                        resolve('Vui lòng chọn trạng thái');
                    }
                });
            }
        });

        if (newStatus) {
            try {
                const response = await apiService.put(`/bookings/admin/update-status/${id}`, { status: newStatus });
                if (response.success) {
                    Swal.fire('Thành công', 'Đã cập nhật trạng thái đơn đặt', 'success');
                    fetchBookings();
                } else {
                    Swal.fire('Lỗi', response.message || 'Không thể cập nhật', 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
            }
        }
    };

    const handleDeleteBooking = async (id: number) => {
        const result = await Swal.fire({
            title: 'Xóa đơn đặt?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const response = await apiService.delete(`/bookings/${id}`);
                if (response.success) {
                    Swal.fire('Đã xóa!', 'Đơn đặt đã được xóa.', 'success');
                    fetchBookings();
                } else {
                    Swal.fire('Lỗi', response.message || 'Không thể xóa', 'error');
                }
            } catch (error) {
                Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
            }
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
    };

    const ActionButtons = ({ id, status }: { id: number, status: string }) => (
        <div className="flex items-center justify-center gap-3">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                <Eye size={16} />
            </button>
            <button 
                onClick={() => handleUpdateStatus(id, status)}
                className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                title="Edit Status"
            >
                <Edit2 size={16} />
            </button>
            <button 
                onClick={() => handleDeleteBooking(id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                title="Delete"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Tab Switcher & Filters */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setActiveTab('rooms')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rooms'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            Room Bookings
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'services'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            Service Bookings
                        </button>
                    </div>

                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100">
                        <Plus size={18} />
                        <span>Add Booking</span>
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <div className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[240px] flex items-center justify-between">
                                <span>All dates</span>
                                <ChevronRight size={14} className="rotate-90 text-slate-400" />
                            </div>
                        </div>

                        <div className="relative">
                            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[130px]">
                                <option>All Status</option>
                                <option>Pending</option>
                                <option>Confirmed</option>
                                <option>Cancelled</option>
                                <option>Completed</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ChevronRight size={14} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab === 'rooms' ? 'bookings' : 'services'}...`}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-green-600 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">Loading bookings...</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <p className="text-red-500 font-bold">{error}</p>
                    <button onClick={fetchBookings} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-all">
                        Try Again
                    </button>
                </div>
            ) : activeTab === 'rooms' ? (
                <RoomBookingsTable
                    data={roomBookings.filter(b => b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) || b.user.toLowerCase().includes(searchTerm.toLowerCase()))}
                    StatusBadge={StatusBadge}
                    ActionButtons={ActionButtons}
                />
            ) : (
                <ServiceBookingsTable
                    data={serviceBookings.filter(b => b.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) || b.user.toLowerCase().includes(searchTerm.toLowerCase()))}
                    StatusBadge={StatusBadge}
                    ActionButtons={ActionButtons}
                />
            )}

            {/* Pagination */}
            <Pagination total={activeTab === 'rooms' ? roomBookings.length : serviceBookings.length} />
        </div>
    );
};

// --- Helper Components ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
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


const Pagination: React.FC<{ total: number }> = ({ total }) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing {Math.min(total, 1)} to {total} of {total} bookings
        </p>

        <div className="flex items-center gap-1">
            <PaginationButton icon={<ChevronFirst size={16} />} disabled />
            <PaginationButton icon={<ChevronLeft size={16} />} disabled />

            <div className="flex items-center">
                <PageNumber active>1</PageNumber>
                <PageNumber>2</PageNumber>
                <PageNumber>3</PageNumber>
                <PageNumber>4</PageNumber>
                <PageNumber>5</PageNumber>
                <span className="px-2 text-slate-400">...</span>
                <PageNumber>10</PageNumber>
            </div>

            <PaginationButton icon={<ChevronRight size={16} />} />
            <PaginationButton icon={<ChevronLast size={16} />} />
        </div>
    </div>
);

const PaginationButton: React.FC<{ icon: React.ReactNode; disabled?: boolean }> = ({ icon, disabled }) => (
    <button
        className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all ${disabled
                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                : 'bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm'
            }`}
        disabled={disabled}
    >
        {icon}
    </button>
);

const PageNumber: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
    <button
        className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${active
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
    >
        {children}
    </button>
);

export default BookingsPage;
