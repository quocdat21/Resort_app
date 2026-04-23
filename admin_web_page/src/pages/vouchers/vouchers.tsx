import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ArrowUpDown
} from 'lucide-react';

interface Voucher {
  id: number;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  maxDiscount: string;
  usageLimit: string;
  used: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

const vouchersData: Voucher[] = [
  { id: 1, code: 'SUMMER2024', discountType: 'percentage', discountValue: '10%', maxDiscount: '$100.00', usageLimit: '100', used: '25', startDate: '01/06/2024', endDate: '31/08/2024', status: 'Active' },
  { id: 2, code: 'WELCOME10', discountType: 'fixed', discountValue: '$60.00', maxDiscount: '-', usageLimit: '-', used: '-', startDate: '01/01/2024', endDate: '31/12/2024', status: 'Active' },
  { id: 3, code: 'SALE20', discountType: 'percentage', discountValue: '20%', maxDiscount: '$200.00', usageLimit: '80', used: '15', startDate: '15/05/2024', endDate: '15/07/2024', status: 'Inactive' },
  { id: 4, code: 'FLASH30', discountType: 'percentage', discountValue: '30%', maxDiscount: '$150.00', usageLimit: '30', used: '5', startDate: '20/05/2024', endDate: '27/06/2024', status: 'Active' },
  { id: 5, code: 'VIP100', discountType: 'fixed', discountValue: '$100.00', maxDiscount: '-', usageLimit: '-', used: '-', startDate: '01/01/2024', endDate: '31/12/2024', status: 'Active' },
];

const VouchersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search vouchers..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap">
          <Plus size={18} />
          <span>Add Voucher</span>
        </button>
      </div>

      {/* Vouchers Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Code</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Discount Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Discount Value</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Max Discount</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Usage Limit</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Used</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Start Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">End Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {vouchersData.map((voucher) => (
                <tr key={voucher.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{voucher.code}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium capitalize">{voucher.discountType}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{voucher.discountValue}</td>
                  <td className="px-6 py-4 text-slate-500">{voucher.maxDiscount}</td>
                  <td className="px-6 py-4 text-slate-500 text-center">{voucher.usageLimit}</td>
                  <td className="px-6 py-4 text-slate-500 text-center">{voucher.used}</td>
                  <td className="px-6 py-4 text-slate-500">{voucher.startDate}</td>
                  <td className="px-6 py-4 text-slate-500">{voucher.endDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        voucher.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 
                        'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        {voucher.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 5 of 30 vouchers
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
            <PageNumber>16</PageNumber>
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

export default VouchersPage;
