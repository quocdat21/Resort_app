import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import RoomInstances from './room_instances';
import ViewRoom from './view_room';
import AddRoom from './add_room';
import EditRoom from './edit_room';
import Swal from 'sweetalert2';

interface Room {
  id: string;
  main_image_url: string;
  name: string;
  category_name: string;
  category_id?: string;
  zone_name: string;
  base_price: number;
  size_sqm: number;
  capacity_adults: number;
  capacity_children: number;
  description?: string;
  instance_count: number;
}

interface RoomInstance {
  id: string;
  room_id: string;
  room_number: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Hidden';
  created_at?: string;
  updated_at?: string;
}

// Mock data removed

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);

  const [zones, setZones] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isInstancesOpen, setIsInstancesOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '6',
        searchTerm: searchTerm,
      });

      if (selectedZone !== 'all') params.append('zoneId', selectedZone);
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);

      const response = await axios.get(`http://localhost:3000/api/rooms?${params.toString()}`);
      if (response.data.success) {
        setRooms(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setTotalRooms(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Fetch rooms error:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedZone, selectedCategory]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [zRes, cRes] = await Promise.all([
          axios.get('http://localhost:3000/api/zones'),
          axios.get('http://localhost:3000/api/categories')
        ]);
        if (zRes.data.success) setZones(zRes.data.data);
        if (cRes.data.success) setCategories(cRes.data.data);
      } catch (error) {
        console.error('Fetch filters error:', error);
      }
    };
    fetchFilters();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: 'Thao tác này sẽ xóa vĩnh viễn phòng template và tất cả số phòng liên quan!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#15803d',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Đồng ý xóa',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        const response = await axios.delete(`http://localhost:3000/api/rooms/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
          }
        });
        if (response.data.success) {
          Swal.fire({
            title: 'Đã xóa!',
            text: 'Phòng đã được xóa thành công.',
            icon: 'success',
            confirmButtonColor: '#15803d'
          });
          fetchRooms();
        }
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể xóa phòng này', 'error');
    }
  };

  const handleView = async (room: Room) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/rooms/${room.id}`);
      if (response.data.success) {
        setSelectedRoom(response.data.data);
        setIsViewOpen(true);
      }
    } catch (error) {
      console.error('Fetch room detail error:', error);
      Swal.fire('Lỗi', 'Không thể tải chi tiết phòng', 'error');
    }
  };

  const handleEdit = async (room: Room) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/rooms/${room.id}`);
      if (response.data.success) {
        setSelectedRoom(response.data.data);
        setIsEditOpen(true);
      }
    } catch (error) {
      console.error('Fetch room detail error:', error);
      Swal.fire('Lỗi', 'Không thể tải chi tiết phòng', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, Add */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-4">
        <div className="relative w-full xl:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm phòng..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Lọc theo Khu vực (Zone) */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[140px]"
              value={selectedZone}
              onChange={(e) => { setSelectedZone(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả Khu vực</option>
              {zones.map(zone => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          {/* Lọc theo Loại phòng (Category) */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[140px]"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">Tất cả Loại phòng</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap"
          >
            <Plus size={18} />
            <span>Thêm phòng</span>
          </button>
        </div>
      </div>

      {/* Rooms Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-20 whitespace-nowrap text-center">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap min-w-[400px]">Tên Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Khu Vực</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Loại Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Diện Tích</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Giá Cơ Bản</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sức Chứa</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Số Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                      <p className="text-slate-400 font-medium">Đang tải danh sách phòng...</p>
                    </div>
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="font-bold text-slate-400">#{room.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap min-w-[400px]">
                      <div className="flex items-center gap-4">
                        <img
                          src={room.main_image_url ? `http://localhost:3000${room.main_image_url}` : 'https://via.placeholder.com/150'}
                          alt={room.name}
                          className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-100"
                        />
                        <span className="font-bold text-slate-900">{room.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {room.zone_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{room.category_name}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-700 whitespace-nowrap">{room.size_sqm} m²</td>
                    <td className="px-6 py-4 font-bold text-green-700 whitespace-nowrap">{formatPrice(room.base_price)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {room.capacity_adults} Người lớn, {room.capacity_children} Trẻ em
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg text-xs border border-slate-200">
                        {room.instance_count} phòng
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setSelectedRoom(room); setIsInstancesOpen(true); }}
                          className="p-2 text-slate-400 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                          title="Quản lý chi tiết phòng"
                        >
                          <LayoutGrid size={16} />
                        </button>
                        <button
                          onClick={() => handleView(room)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(room)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(room.id)}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Hiển thị {(currentPage - 1) * 6 + 1} đến {Math.min(currentPage * 6, totalRooms)} trong tổng số {totalRooms} phòng
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton
            icon={<ChevronLeft size={16} />}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          />

          <div className="flex items-center">
            {[...Array(totalPages)].map((_, i) => (
              <PageNumber
                key={i + 1}
                active={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </PageNumber>
            ))}
          </div>

          <PaginationButton
            icon={<ChevronRight size={16} />}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          />
        </div>
      </div>
      {/* Modals */}
      <AddRoom
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchRooms}
      />

      {selectedRoom && (
        <>
          <ViewRoom
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            room={selectedRoom}
          />
          <EditRoom
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSuccess={fetchRooms}
            room={selectedRoom}
          />
          <RoomInstances
            isOpen={isInstancesOpen}
            onClose={() => setIsInstancesOpen(false)}
            room={selectedRoom}
          />
        </>
      )}
    </div>
  );
};

const PaginationButton: React.FC<{ icon: React.ReactNode; disabled?: boolean; onClick?: () => void }> = ({ icon, disabled, onClick }) => (
  <button
    onClick={onClick}
    className={`w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 transition-all ${disabled
      ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
      : 'bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 active:scale-95 shadow-sm'
      }`}
    disabled={disabled}
  >
    {icon}
  </button>
);

const PageNumber: React.FC<{ children: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${active
      ? 'bg-green-50 text-green-700 border border-green-200'
      : 'text-slate-500 hover:bg-slate-50'
      }`}
  >
    {children}
  </button>
);

export default RoomsPage;
