import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import { apiService } from '../../services/api_service';

interface Payment {
  id: number;
  transactionId: string;
  bookingCode: string;
  amount: string;
  method: string;
  status: 'Paid' | 'Pending' | 'Failed' | 'Expired';
  paymentDate: string;
  userName: string;
  itemName: string;
}

import Swal from 'sweetalert2';
import { Eye, Edit2 } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/payments/admin/all');
      
      if (response.success) {
        const mappedData = response.data.map((p: any) => ({
          id: p.id,
          transactionId: p.transaction_id || 'N/A',
          bookingCode: p.booking_code,
          amount: formatCurrency(p.amount),
          method: mapPaymentMethod(p.payment_method),
          status: mapStatus(p.status),
          paymentDate: formatDate(p.payment_date || p.created_at),
          userName: p.user_name,
          itemName: p.item_name,
          rawStatus: p.status
        }));
        setPayments(mappedData);
      } else {
        setError(response.message || 'Failed to fetch payments');
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
      title: 'Cập nhật trạng thái thanh toán',
      input: 'select',
      inputOptions: {
        'pending': 'Chờ xử lý',
        'success': 'Thành công',
        'failed': 'Thất bại',
        'expired': 'Hết hạn'
      },
      inputValue: currentStatus,
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy'
    });

    if (newStatus) {
      try {
        const response = await apiService.put(`/payments/admin/update-status/${id}`, { status: newStatus });
        if (response.success) {
          Swal.fire('Thành công', 'Đã cập nhật trạng thái thanh toán', 'success');
          fetchPayments();
        } else {
          Swal.fire('Lỗi', response.message || 'Không thể cập nhật', 'error');
        }
      } catch (error) {
        Swal.fire('Lỗi', 'Lỗi kết nối server', 'error');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
  };

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount));
  };

  const mapPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      'BANK_TRANSFER': 'Bank Transfer',
      'VNPAY': 'E-Wallet',
      'CREDIT_CARD': 'Credit Card',
      'CASH': 'Cash'
    };
    return methods[method] || method;
  };

  const mapStatus = (status: string) => {
    const statuses: Record<string, any> = {
      'success': 'Paid',
      'pending': 'Pending',
      'failed': 'Failed',
      'expired': 'Expired',
      'cancelled': 'Failed'
    };
    return statuses[status] || 'Pending';
  };

  const filteredPayments = payments.filter(p => 
    p.bookingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <div className="appearance-none bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[240px] flex items-center justify-between">
              <span>All Transactions</span>
              <ChevronRight size={14} className="rotate-90 text-slate-400" />
            </div>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search transactions, codes..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="animate-spin text-green-600 mb-4" size={40} />
          <p className="text-slate-500 font-medium">Loading payments...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-red-500 font-bold">{error}</p>
          <button onClick={fetchPayments} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold transition-all">
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Booking Code</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Method</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{payment.transactionId}</td>
                    <td className="px-6 py-4 text-slate-500">{payment.bookingCode}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{payment.userName}</span>
                        <span className="text-[10px] text-slate-400">{payment.itemName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-green-700">{payment.amount}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <StatusBadge status={payment.status} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-center">{payment.paymentDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Detail">
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(payment.id, payment.rawStatus)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" 
                          title="Update Status"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing {Math.min(filteredPayments.length, 1)} to {filteredPayments.length} of {payments.length} transactions
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronFirst size={16} />} disabled />
          <PaginationButton icon={<ChevronLeft size={16} />} disabled />
          <div className="flex items-center">
            <PageNumber active>1</PageNumber>
          </div>
          <PaginationButton icon={<ChevronRight size={16} />} />
          <PaginationButton icon={<ChevronLast size={16} />} />
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    Paid: 'bg-green-50 text-green-600 border-green-100',
    Pending: 'bg-orange-50 text-orange-600 border-orange-100',
    Failed: 'bg-red-50 text-red-600 border-red-100',
    Expired: 'bg-slate-50 text-slate-400 border-slate-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${styles[status as keyof typeof styles] || 'bg-slate-50 text-slate-600'}`}>
      {status}
    </span>
  );
};

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

export default PaymentsPage;
