import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Ticket,
  Percent,
  CircleDollarSign,
  Calendar,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/common/Pagination';
import { apiService } from '../../services/api_service';
import AddVoucher from './add_voucher';
import EditVoucher from './edit_voucher';
import ViewVoucher from './view_voucher';

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

const VouchersPage: React.FC = () => {
  const [data, setData] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        searchTerm,
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        status: selectedStatus
      });

      const response = await apiService.get(`/vouchers?${params.toString()}`);
      if (response.success) {
        setData(response.data);
        if (response.pagination) setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, currentPage, searchTerm]);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '∞';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleDelete = (id: number) => {
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Voucher này sẽ bị xóa vĩnh viễn khỏi hệ thống!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#15803d',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiService.delete(`/vouchers/${id}`);
          if (response.success) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Voucher đã được gỡ bỏ thành công.',
              icon: 'success',
              confirmButtonColor: '#15803d'
            });
            fetchData();
          } else {
            Swal.fire('Lỗi!', response.message || 'Không thể xóa voucher', 'error');
          }
        } catch (error) {
          console.error('Delete error:', error);
          Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi xóa voucher', 'error');
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100 uppercase tracking-wider">Đang chạy</span>;
      case 'inactive':
        return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-wider">Tạm dừng</span>;
      case 'expired':
        return <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 uppercase tracking-wider">Hết hạn</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm mã voucher..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Lọc theo Trạng thái */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[140px]"
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value as any); setCurrentPage(1); }}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="active">Đang chạy</option>
              <option value="inactive">Tạm dừng</option>
              <option value="expired">Đã hết hạn</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap active:scale-95"
          >
            <Plus size={18} />
            Tạo Voucher
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-green-700 animate-spin" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center w-20 whitespace-nowrap">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Mã Voucher</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Giảm giá</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Sử dụng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Hết hạn</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Trạng thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-center font-bold text-slate-400 text-sm">{voucher.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:border-green-200 group-hover:text-green-600 transition-all">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors text-sm tracking-tight uppercase">{voucher.code}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Hệ thống Resort</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex flex-col">
                      <div className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                        {voucher.discount_type === 'percentage' ? (
                          <><Percent size={14} className="text-green-700" /> {voucher.discount_value}%</>
                        ) : (
                          <><CircleDollarSign size={14} className="text-green-700" /> {formatPrice(voucher.discount_value)}</>
                        )}
                      </div>
                      {voucher.max_discount && (
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Max: {formatPrice(voucher.max_discount)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-[11px] font-bold text-slate-900">
                        {voucher.used_count} / {formatNumber(voucher.usage_limit)}
                      </div>
                      <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${voucher.usage_limit && (voucher.used_count / voucher.usage_limit) > 0.9 ? 'bg-red-500' : 'bg-green-600'
                            }`}
                          style={{ width: `${voucher.usage_limit ? (voucher.used_count / voucher.usage_limit) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(voucher.end_date).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(voucher.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setIsViewOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVoucher(voucher);
                          setIsEditOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(voucher.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Ticket size={48} className="mb-4 opacity-10" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Không tìm thấy voucher nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => setCurrentPage(page)}
        itemName="voucher"
      />

      {/* Modals */}
      <AddVoucher isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchData} />
      <EditVoucher isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} voucher={selectedVoucher} onSuccess={fetchData} />
      <ViewVoucher isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} voucher={selectedVoucher} />
    </div>
  );
};


export default VouchersPage;
