import React from 'react';
import { Eye, Edit2, Trash2, ArrowUpDown } from 'lucide-react';

export interface ServiceBooking {
  id: number;
  bookingCode: string;
  user: string;
  service: string;
  bookingDate: string;
  quantity: number;
  totalAmount: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
}

interface ServiceBookingsTableProps {
  data: ServiceBooking[];
  StatusBadge: React.FC<{ status: string }>;
  ActionButtons: React.FC;
}

const ServiceBookingsTable: React.FC<ServiceBookingsTableProps> = ({ data, StatusBadge, ActionButtons }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Booking Code</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                  Service <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                <div className="flex items-center gap-1 justify-center cursor-pointer hover:text-slate-600 transition-colors">
                  Date <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {data.map((booking) => (
              <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 font-bold text-slate-900">{booking.bookingCode}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{booking.user}</td>
                <td className="px-6 py-4 text-slate-500">{booking.service}</td>
                <td className="px-6 py-4 text-slate-500 text-center">{booking.bookingDate}</td>
                <td className="px-6 py-4 text-slate-500 text-center">{booking.quantity}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{booking.totalAmount}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <StatusBadge status={booking.status} />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <ActionButtons />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ServiceBookingsTable;
