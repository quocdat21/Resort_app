import React, { useState } from 'react';
import { 
  Search, 
  Star, 
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Trash2,
  ArrowUpDown
} from 'lucide-react';

// --- Types ---
interface RoomReview {
  id: number;
  user: string;
  room: string;
  rating: number;
  comment: string;
  date: string;
}

interface ServiceReview {
  id: number;
  user: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
}

// --- Mock Data ---
const roomReviewsData: RoomReview[] = [
  { id: 1, user: 'John Doe', room: 'Deluxe Ocean View', rating: 5, comment: 'Excellent stay! Will come back again', date: '20/05/2024' },
  { id: 2, user: 'Mary Smith', room: 'Family Suite', rating: 4, comment: 'Great for family.', date: '19/05/2024' },
  { id: 3, user: 'Robert Brown', room: 'Garden Villa', rating: 4, comment: 'Amazing view and service.', date: '18/05/2024' },
  { id: 4, user: 'Linda Williams', room: 'Deluxe Room', rating: 5, comment: 'Very clean and comfortable.', date: '18/05/2024' },
];

const serviceReviewsData: ServiceReview[] = [
  { id: 1, user: 'John Doe', service: 'Hội trường Grand', rating: 5, comment: 'Sân khấu âm thanh rất tuyệt vời.', date: '20/05/2024' },
  { id: 2, user: 'Mary Smith', service: 'Nhà hàng Sunset', rating: 5, comment: 'Đồ ăn ngon, phục vụ tận tình.', date: '19/05/2024' },
  { id: 3, user: 'Robert Brown', service: 'Spa & Massage', rating: 4, comment: 'Nhân viên tay nghề cao.', date: '18/05/2024' },
  { id: 4, user: 'Linda Williams', service: 'Dịch vụ đưa đón', rating: 3, comment: 'Tài xế đến hơi trễ 5 phút.', date: '17/05/2024' },
];

const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'services'>('rooms');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'rooms' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Room Reviews
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'services' 
                ? 'bg-green-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Service Reviews
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab === 'rooms' ? 'room' : 'service'} reviews...`}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Reviews Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'rooms' ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Room</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Comment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {roomReviewsData.map((review) => (
                  <tr key={review.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{review.user}</td>
                    <td className="px-6 py-4 text-slate-700">{review.room}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        <StarRating rating={review.rating} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs">{review.comment}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{review.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Review">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Service</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Rating</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Comment</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {serviceReviewsData.map((review) => (
                  <tr key={review.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{review.user}</td>
                    <td className="px-6 py-4 text-slate-700">{review.service}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-0.5">
                        <StarRating rating={review.rating} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs">{review.comment}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{review.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Review">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 pb-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Showing 1 to 4 of 45 reviews
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

// --- Helper Components ---
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={14} 
          className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"} 
        />
      ))}
    </>
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

export default ReviewsPage;
