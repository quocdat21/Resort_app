import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Wifi, 
  Wind, 
  Tv, 
  Coffee, 
  Refrigerator,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';

interface Amenity {
  id: number;
  name: string;
  icon: React.ReactNode;
}

const amenitiesData: Amenity[] = [
  { id: 1, name: 'Free Wi-Fi', icon: <Wifi size={20} className="text-blue-500" /> },
  { id: 2, name: 'Air Conditioning', icon: <Wind size={20} className="text-cyan-500" /> },
  { id: 3, name: 'Flat Screen TV', icon: <Tv size={20} className="text-slate-600" /> },
  { id: 4, name: 'Mini Bar', icon: <Refrigerator size={20} className="text-orange-500" /> },
  { id: 5, name: 'Free Breakfast', icon: <Coffee size={20} className="text-amber-600" /> },
];

const AmenitiesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search amenities..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap">
          <Plus size={18} />
          <span>Add Amenity</span>
        </button>
      </div>

      {/* Amenities Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                    Name <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Icon</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {amenitiesData.map((amenity) => (
                <tr key={amenity.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{amenity.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{amenity.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                        {amenity.icon}
                      </div>
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
          Showing 1 to 5 of 20 amenities
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronLeft size={16} />} disabled />
          <div className="flex items-center">
            <PageNumber active>1</PageNumber>
            <PageNumber>2</PageNumber>
            <PageNumber>3</PageNumber>
            <PageNumber>4</PageNumber>
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

export default AmenitiesPage;
