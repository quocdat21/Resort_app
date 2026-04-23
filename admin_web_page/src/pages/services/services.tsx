import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  ArrowUpDown
} from 'lucide-react';

interface Service {
  id: number;
  image: string;
  name: string;
  type: string;
  capacity: string;
  basePrice: string;
  priceFullDay: string;
  priceHalfDay: string;
}

const servicesData: Service[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=200', name: 'Hội trường Grand', type: 'Hall', capacity: '300', basePrice: '$1,000.00', priceFullDay: '$1,600.00', priceHalfDay: '$900.00' },
  { id: 2, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200', name: 'Nhà hàng Sunset', type: 'Food', capacity: '150', basePrice: '$40.00', priceFullDay: '-', priceHalfDay: '-' },
  { id: 3, image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=200', name: 'Tiệc cưới', type: 'Event', capacity: '200', basePrice: '$3,100.00', priceFullDay: '$3,100.00', priceHalfDay: '$1,200.00' },
  { id: 4, image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=200', name: 'Spa & Massage', type: 'Other', capacity: '20', basePrice: '$30.00', priceFullDay: '-', priceHalfDay: '-' },
  { id: 5, image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=200', name: 'Dịch vụ đưa đón', type: 'Other', capacity: '-', basePrice: '$30.00', priceFullDay: '-', priceHalfDay: '-' },
];

const ServicesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Top Bar: Search, Filters, Add */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search services..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <select className="appearance-none bg-white border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 shadow-sm cursor-pointer text-slate-700 min-w-[120px]">
              <option>All Types</option>
              <option>Hall</option>
              <option>Food</option>
              <option>Event</option>
              <option>Other</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap">
            <Plus size={18} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Services Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16">ID</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Service Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Capacity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Base Price</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price Full Day</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Price Half Day</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {servicesData.map((service) => (
                <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{service.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={service.image} 
                        alt={service.name} 
                        className="w-12 h-12 object-cover rounded-lg shadow-sm border border-slate-100"
                      />
                      <span className="font-bold text-slate-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{service.type}</td>
                  <td className="px-6 py-4 text-slate-500 text-center">{service.capacity}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{service.basePrice}</td>
                  <td className="px-6 py-4 text-slate-500">{service.priceFullDay}</td>
                  <td className="px-6 py-4 text-slate-500">{service.priceHalfDay}</td>
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 5 of 50 services
        </p>

        <div className="flex items-center gap-1">
          <PaginationButton icon={<ChevronFirst size={16} />} disabled />
          <PaginationButton icon={<ChevronLeft size={16} />} disabled />
          
          <div className="flex items-center">
            <PageNumber active>1</PageNumber>
            <PageNumber>2</PageNumber>
            <PageNumber>3</PageNumber>
            <PageNumber>4</PageNumber>
            <PageNumber>5</PageNumber>
            <span className="px-2 text-slate-400">...</span>
            <PageNumber>16</PageNumber>
          </div>

          <PaginationButton icon={<ChevronRight size={16} />} />
          <PaginationButton icon={<ChevronLast size={16} />} />
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

export default ServicesPage;
