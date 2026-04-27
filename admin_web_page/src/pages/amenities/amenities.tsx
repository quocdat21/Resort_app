import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Coffee,
  ArrowUpDown,
  Home,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';
import AddAmenity from './add_amenity';
import EditAmenity from './edit_amenity';
import ViewAmenity from './view_amenity';

interface Amenity {
  id: number;
  name: string;
  icon_url: string;
  room_count: number;
}

const AmenitiesPage: React.FC = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 6;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/amenities`, {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: limit
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      if (response.data.success) {
        setAmenities(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Fetch amenities error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, [searchTerm, currentPage]);

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Hành động này sẽ xóa vĩnh viễn tiện nghi này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/amenities/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        Swal.fire('Đã xóa!', 'Tiện nghi đã được gỡ bỏ.', 'success');
        fetchAmenities();
      } catch (error) {
        Swal.fire('Lỗi', 'Không thể xóa tiện nghi này.', 'error');
      }
    }
  };

  const PaginationButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    children: React.ReactNode;
  }> = ({ onClick, disabled, active, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${active
          ? 'bg-green-700 text-white shadow-md'
          : disabled
            ? 'text-slate-300 cursor-not-allowed'
            : 'text-slate-600 hover:bg-slate-100 hover:text-green-700'
        }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm tiện nghi..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-green-700 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-green-800 transition-all shadow-lg shadow-green-100 text-sm font-bold"
        >
          <Plus size={18} />
          Thêm tiện nghi
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-20">ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Icon</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">Tên tiện nghi <ArrowUpDown size={12} /></div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Số phòng sử dụng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">Đang tải dữ liệu...</td>
                </tr>
              ) : amenities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">Không tìm thấy tiện nghi nào</td>
                </tr>
              ) : (
                amenities.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-400 text-center">{amenity.id}</td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:scale-110 transition-all">
                        {amenity.icon_url ? (
                          <img src={`http://localhost:3000${amenity.icon_url}`} alt={amenity.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Coffee size={20} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{amenity.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">
                          <Home size={12} />
                          {amenity.room_count} phòng
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedAmenity(amenity);
                            setIsViewOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAmenity(amenity);
                            setIsEditOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(amenity.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pt-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Hiển thị {(currentPage - 1) * limit + 1} đến {Math.min(currentPage * limit, totalItems)} trong {totalItems} tiện nghi
          </p>

          <div className="flex items-center gap-1">
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={16} />
            </PaginationButton>

            {[...Array(totalPages)].map((_, i) => (
              <PaginationButton
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                active={currentPage === i + 1}
              >
                {i + 1}
              </PaginationButton>
            ))}

            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={16} />
            </PaginationButton>
          </div>
        </div>
      )}

      <AddAmenity isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchAmenities} />
      {selectedAmenity && (
        <>
          <EditAmenity
            isOpen={isEditOpen}
            onClose={() => {
              setIsEditOpen(false);
              setSelectedAmenity(null);
            }}
            onSuccess={fetchAmenities}
            amenity={selectedAmenity}
          />
          <ViewAmenity
            isOpen={isViewOpen}
            onClose={() => {
              setIsViewOpen(false);
              setSelectedAmenity(null);
            }}
            amenityId={selectedAmenity.id}
          />
        </>
      )}
    </div>
  );
};

export default AmenitiesPage;
