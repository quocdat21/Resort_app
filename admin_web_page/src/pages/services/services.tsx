import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ArrowUpDown,
  ClipboardList,
  Users,
  Tag,
  Layers,
  Loader2
} from 'lucide-react';
import Pagination from '../../components/common/Pagination';
import { apiService } from '../../services/api_service';
import { resolveImageUrl } from '../../utils/image_util';
import ViewService from './view_service';
import AddService from './add_service';
import EditService from './edit_service';
import Swal from 'sweetalert2';

interface ServicePrice {
  id: number;
  price_type: 'full_day' | 'half_day' | 'unit';
  price: number;
  unit: string;
  description: string;
}

interface ServiceImage {
  id: number;
  image_url: string;
}

interface Service {
  id: number;
  type: 'Hall' | 'Food' | 'Event' | 'Other';
  name: string;
  capacity?: number;
  description?: string;
  image_url?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  prices?: ServicePrice[];
  secondary_images?: ServiceImage[];
}

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Hall' | 'Other'>('Hall');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0
  });

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        searchTerm,
        page: currentPage.toString(),
        limit: '5'
      });

      if (activeTab === 'Hall') {
        params.append('type', 'Hall');
      } else {
        params.append('excludeType', 'Hall');
      }

      const response = await apiService.get(`/services?${params.toString()}`);
      if (response.success) {
        setServices(response.data);
        if (response.pagination) setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Dịch vụ sẽ bị xóa vĩnh viễn và không thể khôi phục!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const response = await apiService.delete(`/services/${id}`);
        if (response.success) {
          Swal.fire('Đã xóa!', 'Dịch vụ đã được xóa thành công.', 'success');
          fetchData();
        }
      } catch (error) {
        console.error('Delete error:', error);
        Swal.fire('Lỗi!', 'Không thể xóa dịch vụ này.', 'error');
      }
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '-';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Hall': return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold border border-purple-100 uppercase tracking-wider">Hội trường</span>;
      case 'Food': return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold border border-orange-100 uppercase tracking-wider">Ẩm thực</span>;
      case 'Event': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100 uppercase tracking-wider">Sự kiện</span>;
      default: return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-wider">Khác</span>;
    }
  };

  const filteredData = services; // Data is already filtered by fetchData

  return (
    <div className="space-y-6">
      {/* Header: Tab Switcher & Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('Hall')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'Hall'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <ClipboardList size={16} />
            Hội trường
          </button>
          <button
            onClick={() => setActiveTab('Other')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'Other'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            <Layers size={16} />
            Dịch vụ khác
          </button>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap active:scale-95"
        >
          <Plus size={18} />
          <span>Thêm {activeTab === 'Hall' ? 'hội trường' : 'dịch vụ'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={`Tìm kiếm ${activeTab === 'Hall' ? 'hội trường' : 'dịch vụ'}...`}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="text-green-700 animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-16">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {activeTab === 'Hall' ? 'Tên hội trường' : 'Tên dịch vụ'}
                </th>
                {activeTab === 'Other' && (
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại</th>
                )}
                {activeTab === 'Hall' && (
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Sức chứa</th>
                )}
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {activeTab === 'Hall' ? 'Giá thuê 1 ngày' : 'Đơn giá'}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {activeTab === 'Hall' ? 'Giá 1/2 ngày' : 'Đơn vị'}
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {filteredData.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5 text-center font-bold text-slate-400">{service.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100 group-hover:border-green-200 transition-all">
                        {service.image_url ? (
                          <img
                            src={resolveImageUrl(service.image_url)}
                            alt={service.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Layers size={20} />
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors line-clamp-1">{service.name}</div>
                    </div>
                  </td>
                  {activeTab === 'Other' && (
                    <td className="px-6 py-5">
                      {getTypeBadge(service.type)}
                    </td>
                  )}
                  {activeTab === 'Hall' && (
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                        <Users size={14} className="text-slate-300" />
                        {formatNumber(service.capacity)} khách
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900">
                      {activeTab === 'Hall'
                        ? formatPrice(service.prices?.find(p => p.price_type === 'full_day')?.price)
                        : formatPrice(service.prices?.[0]?.price)}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-900">
                    {activeTab === 'Hall' ? (
                      formatPrice(service.prices?.find(p => p.price_type === 'half_day')?.price)
                    ) : (
                      <span className="text-slate-600 uppercase tracking-tighter text-[10px]">{service.prices?.[0]?.unit || 'lần'}</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {service.status === 'active' ? (
                      <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold border border-green-100 uppercase tracking-wider">Hoạt động</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-100 uppercase tracking-wider">Ngừng</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedService(service);
                          setIsViewOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Chỉnh sửa"
                        onClick={() => {
                          setSelectedService(service);
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Xóa"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                    Không tìm thấy {activeTab === 'Hall' ? 'hội trường' : 'dịch vụ'} nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        limit={pagination.limit}
        onPageChange={(page) => setCurrentPage(page)}
        itemName={activeTab === 'Hall' ? 'hội trường' : 'dịch vụ'}
      />

      <ViewService
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />

      <AddService
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchData}
      />

      <EditService
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={fetchData}
        serviceId={selectedService?.id || null}
      />
    </div>
  );
};

export default ServicesPage;
