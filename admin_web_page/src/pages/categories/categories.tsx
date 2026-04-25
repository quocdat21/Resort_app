import React, { useState } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description: string;
    roomCount: number;
    status: 'Active' | 'Inactive';
    createdAt: string;
}

const categoriesData: Category[] = [
    { id: 1, name: 'Deluxe', description: 'Phòng sang trọng với đầy đủ tiện nghi và tầm nhìn đẹp.', roomCount: 24, status: 'Active', createdAt: '10/05/2024' },
    { id: 2, name: 'Family', description: 'Không gian rộng rãi phù hợp cho gia đình có trẻ nhỏ.', roomCount: 15, status: 'Active', createdAt: '11/05/2024' },
    { id: 3, name: 'Villa', description: 'Biệt thự riêng biệt với hồ bơi và sân vườn.', roomCount: 8, status: 'Active', createdAt: '12/05/2024' },
    { id: 4, name: 'Superior', description: 'Phòng tiêu chuẩn với thiết kế hiện đại.', roomCount: 30, status: 'Active', createdAt: '13/05/2024' },
    { id: 5, name: 'Standard', description: 'Phòng cơ bản với mức giá hợp lý.', roomCount: 42, status: 'Inactive', createdAt: '14/05/2024' },
];

const CategoriesPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="space-y-6">
            {/* Top Bar: Search, Add */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap">
                    <Plus size={18} />
                    <span>Add Category</span>
                </button>
            </div>

            {/* Categories Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        ID <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                        Name <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                    <div className="flex items-center gap-1 justify-center cursor-pointer hover:text-slate-600 transition-colors">
                                        Room Count <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Created At</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {categoriesData.map((category) => (
                                <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">{category.id}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{category.description}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 text-center">{category.roomCount}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${category.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' :
                                                'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                {category.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-center">{category.createdAt}</td>
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
                    Showing 1 to 5 of 12 categories
                </p>

                <div className="flex items-center gap-1">
                    <PaginationButton icon={<ChevronLeft size={16} />} disabled />
                    <div className="flex items-center">
                        <PageNumber active>1</PageNumber>
                        <PageNumber>2</PageNumber>
                        <PageNumber>3</PageNumber>
                    </div>
                    <PaginationButton icon={<ChevronRight size={16} />} />
                </div>
            </div>
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

export default CategoriesPage;
