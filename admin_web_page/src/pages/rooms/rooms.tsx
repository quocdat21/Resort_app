import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  ArrowUpDown,
  Eye
} from 'lucide-react';
import ViewRoom from './view_room';
import AddRoom from './add_room';
import EditRoom from './edit_room';

interface Room {
  id: string;
  roomNumber: string;
  image: string;
  secondaryImages?: string[];
  name: string;
  category: string;
  categoryId?: string;
  zone: string;
  price: number;
  size: number;
  capacity: string;
  description?: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Hidden';
}

const roomsData: Room[] = [
  { 
    id: '1', 
    roomNumber: '101', 
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=600', 
    secondaryImages: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=200',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=200'
    ],
    name: 'Phòng Deluxe Ocean View', 
    category: 'Deluxe', 
    categoryId: '1',
    zone: 'Khu A', 
    price: 4500000, 
    size: 45, 
    capacity: '2 Người lớn, 1 Trẻ em', 
    description: 'Tận hưởng tầm nhìn tuyệt đẹp ra đại dương từ ban công riêng của bạn. Phòng Deluxe được thiết kế hiện đại với nội thất gỗ cao cấp và tiện nghi đầy đủ.',
    status: 'Available' 
  },
  { id: '2', roomNumber: '102', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=600', name: 'Phòng Family Suite', category: 'Family', zone: 'Khu A', price: 6200000, size: 65, capacity: '4 Người lớn, 2 Trẻ em', status: 'Available' },
  { id: '3', roomNumber: '201', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=200', name: 'Phòng Garden Villa', category: 'Villa', zone: 'Khu B', price: 3800000, size: 55, capacity: '2 Người lớn, 1 Trẻ em', status: 'Maintenance' },
  { id: '4', roomNumber: '301', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=600', name: 'Phòng Superior Mountain', category: 'Superior', zone: 'Khu C', price: 2500000, size: 35, capacity: '2 Người lớn', status: 'Available' },
  { id: '5', roomNumber: '302', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=600', name: 'Phòng Standard Valley', category: 'Standard', zone: 'Khu C', price: 1800000, size: 30, capacity: '2 Người lớn', status: 'Hidden' },
];

const RoomsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleView = (room: Room) => {
    setSelectedRoom(room);
    setIsViewOpen(true);
  };

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditOpen(true);
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
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="all">Tất cả Khu vực</option>
              <option value="A">Khu A (Ocean)</option>
              <option value="B">Khu B (Garden)</option>
              <option value="C">Khu C (Mountain)</option>
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
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Tất cả Loại phòng</option>
              <option value="deluxe">Deluxe</option>
              <option value="family">Family</option>
              <option value="villa">Villa</option>
              <option value="superior">Superior</option>
              <option value="standard">Standard</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          {/* Lọc theo Trạng thái */}
          <div className="relative flex-1 sm:flex-none">
            <select
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[130px]"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="Available">Đang trống</option>
              <option value="Occupied">Đang có khách</option>
              <option value="Maintenance">Bảo trì</option>
              <option value="Hidden">Đang ẩn</option>
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-20 whitespace-nowrap">Mã Số</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap min-w-[400px]">Tên Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Khu Vực</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Loại Phòng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Diện Tích</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Giá Cơ Bản</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Sức Chứa</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Trạng Thái</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {roomsData.map((room) => (
                <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md text-xs">#{room.roomNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap min-w-[400px]">
                    <div className="flex items-center gap-4">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-100"
                      />
                      <span className="font-bold text-slate-900">{room.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                      {room.zone}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium whitespace-nowrap">{room.category}</td>
                  <td className="px-6 py-4 text-center font-medium text-slate-700 whitespace-nowrap">{room.size} m²</td>
                  <td className="px-6 py-4 font-bold text-green-700 whitespace-nowrap">{formatPrice(room.price)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs whitespace-nowrap">{room.capacity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider whitespace-nowrap ${
                        room.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 
                        room.status === 'Occupied' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        room.status === 'Maintenance' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {room.status === 'Available' ? 'Đang trống' : 
                         room.status === 'Occupied' ? 'Đang có khách' :
                         room.status === 'Maintenance' ? 'Bảo trì' : 'Đang ẩn'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Hiển thị 1 đến 5 trong tổng số 50 phòng
        </p>

        <div className="flex items-center gap-1">
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
        </div>
      </div>
      {/* Modals */}
      <AddRoom 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)} 
        onSuccess={() => console.log('Refresh rooms')} 
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
            onSuccess={() => console.log('Refresh rooms')} 
            room={selectedRoom} 
          />
        </>
      )}
    </div>
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

export default RoomsPage;
