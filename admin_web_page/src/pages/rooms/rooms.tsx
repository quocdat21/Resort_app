import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  LayoutGrid,
  Loader2,
  ChevronRight
} from 'lucide-react';
import RoomInstances from './room_instances';
import ViewRoom from './view_room';
import AddRoom from './add_room';
import EditRoom from './edit_room';
import Swal from 'sweetalert2';
import Pagination from '../../components/common/Pagination';

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
  available_count: number;
  amenity_count: number;
  auto_checkin: number;
  auto_checkout: number;
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
  const [allCategories, setAllCategories] = useState<any[]>([]);
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
          axios.get('http://localhost:3000/api/categories?limit=100')
        ]);
        if (zRes.data.success) setZones(zRes.data.data);
        if (cRes.data.success) {
          setAllCategories(cRes.data.data);
          // Don't set categories yet, wait for zone selection
        }
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

  const toggleAutoCheckin = async (room: Room) => {
    try {
      const newStatus = room.auto_checkin === 1 ? 0 : 1;
      const response = await axios.put(`http://localhost:3000/api/rooms/${room.id}`, {
        autoCheckin: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.data.success) {
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, auto_checkin: newStatus } : r));
        Swal.fire({
          title: 'Cập nhật thành công',
          text: `Đã ${newStatus === 1 ? 'bật' : 'tắt'} tự động check-in cho ${room.name}`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error: any) {
      console.error('Toggle auto checkin error:', error);
      Swal.fire('Lỗi!', 'Không thể cập nhật trạng thái tự động check-in', 'error');
    }
  };

  const toggleAutoCheckout = async (room: Room) => {
    try {
      const newStatus = room.auto_checkout === 1 ? 0 : 1;
      const response = await axios.put(`http://localhost:3000/api/rooms/${room.id}`, {
        autoCheckout: newStatus
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });

      if (response.data.success) {
        setRooms(prev => prev.map(r => r.id === room.id ? { ...r, auto_checkout: newStatus } : r));
        Swal.fire({
          title: 'Cập nhật thành công',
          text: `Đã ${newStatus === 1 ? 'bật' : 'tắt'} tự động check-out cho ${room.name}`,
          icon: 'success',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error: any) {
      console.error('Toggle auto checkout error:', error);
      Swal.fire('Lỗi!', 'Không thể cập nhật trạng thái tự động check-out', 'error');
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
              onChange={(e) => {
                const zoneId = e.target.value;
                setSelectedZone(zoneId);
                setSelectedCategory('all');
                setCurrentPage(1);

                if (zoneId === 'all') {
                  setCategories([]);
                } else {
                  const filtered = allCategories.filter(cat => cat.zoneId?.toString() === zoneId);
                  setCategories(filtered);
                }
              }}
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
              className={`w-full appearance-none border rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm min-w-[140px] ${selectedZone === 'all'
                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-white border-slate-200 text-slate-700 cursor-pointer'
                }`}
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              disabled={selectedZone === 'all'}
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap min-w-[500px]">Tên Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Khu Vực</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Loại Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Diện Tích</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Giá Cơ Bản</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sức Chứa</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Số Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Số Trống</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Auto C.I</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Auto C.O</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Tiện nghi</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                      <p className="text-slate-400 font-medium">Đang tải danh sách phòng...</p>
                    </div>
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Không tìm thấy phòng nào phù hợp
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="font-bold text-slate-400">{room.id}</span>
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
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className={`font-bold px-2.5 py-1 rounded-lg text-xs border ${room.available_count > 0
                          ? 'text-green-700 bg-green-50 border-green-100'
                          : 'text-red-700 bg-red-50 border-red-100'
                        }`}>
                        {room.available_count} trống
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleAutoCheckin(room)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${room.auto_checkin === 1 ? 'bg-green-600' : 'bg-slate-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${room.auto_checkin === 1 ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleAutoCheckout(room)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${room.auto_checkout === 1 ? 'bg-orange-600' : 'bg-slate-200'
                          }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${room.auto_checkout === 1 ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <span className="flex items-center justify-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                        {room.amenity_count} tiện nghi
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
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalRooms}
        limit={6}
        onPageChange={(page) => setCurrentPage(page)}
        itemName="phòng"
      />
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
            onSuccess={fetchRooms}
            room={selectedRoom}
          />
        </>
      )}
    </div>
  );
};

export default RoomsPage;
