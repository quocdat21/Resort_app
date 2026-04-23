import React, { useState } from 'react';
import { 
  Search, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ArrowUpDown
} from 'lucide-react';

interface Payment {
  id: number;
  transactionId: string;
  bookingCode: string;
  amount: string;
  method: 'Credit Card' | 'E-Wallet' | 'Bank Transfer';
  status: 'Paid' | 'Pending' | 'Failed';
  paymentDate: string;
}

const paymentsData: Payment[] = [
  { id: 1, transactionId: 'TXN100031', bookingCode: 'BK24052601', amount: '$640.00', method: 'Credit Card', status: 'Paid', paymentDate: '26/05/2024 10:30' },
  { id: 2, transactionId: 'TXN100032', bookingCode: 'SB24052601', amount: '$180.00', method: 'E-Wallet', status: 'Paid', paymentDate: '26/05/2024 11:15' },
  { id: 3, transactionId: 'TXN100033', bookingCode: 'BK24052602', amount: '$600.00', method: 'Bank Transfer', status: 'Pending', paymentDate: '27/05/2024 09:20' },
  { id: 4, transactionId: 'TXN100034', bookingCode: 'BK24052603', amount: '$750.00', method: 'Credit Card', status: 'Paid', paymentDate: '27/05/2024 14:45' },
  { id: 5, transactionId: 'TXN100035', bookingCode: 'BK24052604', amount: '$180.00', method: 'E-Wallet', status: 'Failed', paymentDate: '28/05/2024 16:10' },
];

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search payments..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <div className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[240px] flex items-center justify-between">
              <span>20/05/2024 - 28/05/2024</span>
              <ChevronRight size={14} className="rotate-90 text-slate-400" />
            </div>
          </div>

          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[120px]">
              <option>All Status</option>
              <option>Paid</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[130px]">
              <option>All Methods</option>
              <option>Credit Card</option>
              <option>E-Wallet</option>
              <option>Bank Transfer</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Booking/Service</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                   <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    Amount <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    Payment Date <ArrowUpDown size={12} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {paymentsData.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{payment.transactionId}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{payment.bookingCode}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{payment.amount}</td>
                  <td className="px-6 py-4 text-slate-500">{payment.method}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        payment.status === 'Paid' ? 'bg-green-50 text-green-600 border-green-100' : 
                        payment.status === 'Pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{payment.paymentDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 5 of 120 payments
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
    </div>
  );
};

const PaginationButton: React.FC<{ icon: React.ReactNode; disabled?: boolean }> = ({ icon, disabled }) => (
  <button 
    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all ${
      disabled 
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
    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${
      active 
        ? 'bg-green-50 text-green-700 border border-green-200' 
        : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

export default PaymentsPage;
