import React, { useState } from 'react';
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
    Trash2
} from 'lucide-react';

import RoomBookingsTable from './rooms_bookings';
import type { RoomBooking } from './rooms_bookings';

import ServiceBookingsTable from './services_bookings';
import type { ServiceBooking } from './services_bookings';


// --- Mock Data ---
const roomBookingsData: RoomBooking[] = [
    { id: 1, bookingCode: 'BK2405261', user: 'John Doe', room: 'Deluxe Ocean View', checkIn: '20/05/2024', checkOut: '26/05/2024', totalAmount: '$340.00', status: 'Confirmed' },
    { id: 2, bookingCode: 'BK2405262', user: 'Mary Smith', room: 'Family Suite', checkIn: '21/05/2024', checkOut: '27/05/2024', totalAmount: '$600.00', status: 'Pending' },
    { id: 3, bookingCode: 'BK2405263', user: 'Robert Brown', room: 'Garden Villa', checkIn: '22/05/2024', checkOut: '28/05/2024', totalAmount: '$750.00', status: 'Confirmed' },
    { id: 4, bookingCode: 'BK2405264', user: 'Linda Williams', room: 'Deluxe Room', checkIn: '23/05/2024', checkOut: '29/05/2024', totalAmount: '$180.00', status: 'Cancelled' },
    { id: 5, bookingCode: 'BK2405265', user: 'David Johnson', room: 'Superior Room', checkIn: '24/05/2024', checkOut: '30/05/2024', totalAmount: '$140.00', status: 'Completed' },
];

const serviceBookingsData: ServiceBooking[] = [
    { id: 1, bookingCode: 'SB2405261', user: 'John Doe', service: 'Hội trường Grand', bookingDate: '20/05/2024', quantity: 1, totalAmount: '$1,000.00', status: 'Confirmed' },
    { id: 2, bookingCode: 'SB2405262', user: 'Mary Smith', service: 'Nhà hàng Sunset', bookingDate: '21/05/2024', quantity: 4, totalAmount: '$160.00', status: 'Pending' },
    { id: 3, bookingCode: 'SB2405263', user: 'Robert Brown', service: 'Spa & Massage', bookingDate: '22/05/2024', quantity: 2, totalAmount: '$60.00', status: 'Confirmed' },
    { id: 4, bookingCode: 'SB2405264', user: 'Linda Williams', service: 'Tiệc cưới', bookingDate: '23/05/2024', quantity: 1, totalAmount: '$3,100.00', status: 'Cancelled' },
    { id: 5, bookingCode: 'SB2405265', user: 'David Johnson', service: 'Dịch vụ đưa đón', bookingDate: '24/05/2024', quantity: 1, totalAmount: '$30.00', status: 'Completed' },
];

// --- Main Page ---
const BookingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'rooms' | 'services'>('rooms');
    const [searchTerm, setSearchTerm] = useState('');

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
                                <span>20/05/2024 - 26/05/2024</span>
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
            {activeTab === 'rooms' ? (
                <RoomBookingsTable
                    data={roomBookingsData}
                    StatusBadge={StatusBadge}
                    ActionButtons={ActionButtons}
                />
            ) : (
                <ServiceBookingsTable
                    data={serviceBookingsData}
                    StatusBadge={StatusBadge}
                    ActionButtons={ActionButtons}
                />
            )}

            {/* Pagination */}
            <Pagination />
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
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status as keyof typeof styles]}`}>
            {status}
        </span>
    );
};

const ActionButtons = () => (
    <div className="flex items-center justify-center gap-3">
        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
            <Eye size={16} />
        </button>
        <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
            <Edit2 size={16} />
        </button>
        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
            <Trash2 size={16} />
        </button>
    </div>
);

const Pagination = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing 1 to 5 of 80 bookings
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
