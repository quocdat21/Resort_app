import React, { useState } from 'react';
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
  Tag
} from 'lucide-react';
import ViewService from './view_service';

interface Service {
  id: number;
  type: 'Hall' | 'Food' | 'Event' | 'Other';
  name: string;
  capacity?: number;
  price_full_day?: number;
  price_half_day?: number;
  base_price?: number;
  price_unit?: string;
  description?: string;
}

const servicesData: Service[] = [
  // Hội trường
  {
    id: 1,
    type: 'Hall',
    name: 'Hội trường Diamond',
    capacity: 1000,
    price_full_day: 20000000,
    price_half_day: 10000000,
    description: 'Bao gồm màn hình led full HD 900 inches và nước lọc miễn phí, Âm thanh, ánh sáng, giấy, bút, Flip chart'
  },
  {
    id: 2,
    type: 'Hall',
    name: 'Hội trường Sapphire',
    capacity: 600,
    price_full_day: 12000000,
    price_half_day: 6000000,
    description: 'Bao gồm màn hình led full HD 350 inches và nước lọc miễn phí, Âm thanh, ánh sáng, giấy, bút, Flip chart'
  },
  {
    id: 3,
    type: 'Hall',
    name: 'Hội trường Ruby',
    capacity: 600,
    price_full_day: 8000000,
    price_half_day: 6000000,
    description: 'Bao gồm màn hình led full HD 400 inches và nước lọc miễn phí, Âm thanh, ánh sáng, giấy, bút, Flip chart'
  },
  {
    id: 4,
    type: 'Hall',
    name: 'Hội trường Topaz',
    capacity: 150,
    price_full_day: 6000000,
    price_half_day: 3000000,
    description: 'Bao gồm màn hình led full HD và nước lọc miễn phí, Âm thanh, ánh sáng, giấy, bút, Flip chart'
  },
  {
    id: 5,
    type: 'Hall',
    name: 'Hội trường VIP 6',
    capacity: 30,
    price_full_day: 3000000,
    price_half_day: 1500000,
    description: 'Bao gồm máy chiếu và nước lọc miễn phí, Âm thanh, ánh sáng, giấy, bút, Flip chart'
  },
  // Dịch vụ khác
  {
    id: 6,
    type: 'Food',
    name: 'Ăn uống, ẩm thực',
    base_price: 150000,
    price_unit: 'suất',
    description: 'Thực đơn món dân tộc, đặc sản Mộc Châu...'
  },
  {
    id: 7,
    type: 'Event',
    name: 'Lửa trại',
    base_price: 1900000,
    description: 'Âm thanh, rượu cần, khoai nướng'
  },
  {
    id: 8,
    type: 'Event',
    name: 'Văn nghệ dân tộc',
    base_price: 3000000,
    description: 'Gồm MC, đội văn nghệ'
  },
  {
    id: 9,
    type: 'Other',
    name: 'Âm thanh',
    base_price: 1000000
  },
  {
    id: 10,
    type: 'Food',
    name: 'Teabreak',
    base_price: 40000,
    price_unit: 'suất'
  },
  {
    id: 11,
    type: 'Other',
    name: 'Hoa tươi',
    base_price: 80000,
    price_unit: 'giờ'
  }
];

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '-';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Hall': return <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-bold border border-purple-100 uppercase tracking-wider">Hội trường</span>;
      case 'Food': return <span className="px-2.5 py-1 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold border border-orange-100 uppercase tracking-wider">Ẩm thực</span>;
      case 'Event': return <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100 uppercase tracking-wider">Sự kiện</span>;
      default: return <span className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-wider">Khác</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap active:scale-95">
          <Plus size={18} />
          <span>Thêm dịch vụ</span>
        </button>
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-16">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên dịch vụ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Sức chứa</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn giá (1 ngày/Đơn vị)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giá 1/2 ngày</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-50">
              {servicesData.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-5 text-center font-bold text-slate-400">#{service.id}</td>
                  <td className="px-6 py-5">
                    <div className="font-bold text-slate-900 group-hover:text-green-700 transition-colors">{service.name}</div>
                  </td>
                  <td className="px-6 py-5">
                    {getTypeBadge(service.type)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    {service.capacity ? (
                      <div className="flex items-center justify-center gap-1.5 text-slate-500 font-bold">
                        <Users size={14} className="text-slate-300" />
                        {service.capacity}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="font-black text-slate-900">
                      {service.type === 'Hall' ? formatPrice(service.price_full_day) : formatPrice(service.base_price)}
                      {service.price_unit && <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase tracking-tighter">/{service.price_unit}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-500">
                    {service.type === 'Hall' ? formatPrice(service.price_half_day) : <span className="text-slate-300">-</span>}
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
                      <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Chỉnh sửa">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4 pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Tag size={12} />
          Hiển thị 1 đến {servicesData.length} trong tổng số {servicesData.length} dịch vụ
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronFirst size={16} />} disabled />
          <PaginationButton icon={<ChevronLeft size={16} />} disabled />

          <div className="flex items-center">
            <PageNumber active>1</PageNumber>
          </div>

          <PaginationButton icon={<ChevronRight size={16} />} disabled />
          <PaginationButton icon={<ChevronLast size={16} />} disabled />
        </div>
      </div>

      <ViewService
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />
    </div>
  );
};

const PaginationButton: React.FC<{ icon: React.ReactNode; disabled?: boolean }> = ({ icon, disabled }) => (
  <button
    className={`w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 transition-all ${disabled
      ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
      : 'bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm'
      }`}
    disabled={disabled}
  >
    {icon}
  </button>
);

const PageNumber: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <button
    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${active
      ? 'bg-green-700 text-white shadow-lg shadow-green-100'
      : 'text-slate-500 hover:bg-slate-50'
      }`}
  >
    {children}
  </button>
);

export default ServicesPage;
