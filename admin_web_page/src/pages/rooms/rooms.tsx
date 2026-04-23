import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter
} from 'lucide-react';

interface Room {
  id: string;
  image: string;
  name: string;
  category: string;
  price: string;
  capacity: string;
  status: 'Available' | 'Maintenance' | 'Hidden';
}

const roomsData: Room[] = [
  { id: '101', image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=200', name: 'Phòng Deluxe Ocean View', category: 'Deluxe', price: '$180.00', capacity: '2 Adults, 1 Child', status: 'Available' },
  { id: '102', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=200', name: 'Phòng Family Suite', category: 'Family', price: '$250.00', capacity: '4 Adults, 2 Children', status: 'Available' },
  { id: '103', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=200', name: 'Phòng Garden Villa', category: 'Villa', price: '$150.00', capacity: '2 Adults, 1 Child', status: 'Maintenance' },
  { id: '104', image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=200', name: 'Phòng Superior', category: 'Superior', price: '$90.00', capacity: '2 Adults', status: 'Available' },
  { id: '105', image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=200', name: 'Phòng Standard', category: 'Standard', price: '$70.00', capacity: '2 Adults', status: 'Hidden' },
];

const RoomsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search rooms..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[140px]">
              <option>All Categories</option>
              <option>Deluxe</option>
              <option>Family</option>
              <option>Villa</option>
              <option>Superior</option>
              <option>Standard</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[130px]">
              <option>All Status</option>
              <option>Available</option>
              <option>Maintenance</option>
              <option>Hidden</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap">
            <Plus size={18} />
            <span>Add Room</span>
          </button>
        </div>
      </div>

      {/* Rooms Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Room Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Capacity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {roomsData.map((room) => (
                <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{room.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-16 h-12 object-cover rounded-lg shadow-sm border border-slate-100"
                      />
                      <span className="font-bold text-slate-900">{room.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{room.category}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{room.price}</td>
                  <td className="px-6 py-4 text-slate-500">{room.capacity}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        room.status === 'Available' ? 'bg-green-50 text-green-600 border-green-100' : 
                        room.status === 'Maintenance' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                        {room.status}
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 5 of 50 rooms
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

export default RoomsPage;
