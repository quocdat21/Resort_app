import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    Layers,
    MapPin,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react';
import { apiService } from '../../services/api_service';
import Pagination from '../../components/common/Pagination';

import AddCategory from './add_category';
import EditCategory from './edit_category';
import ViewCategory from './view_category';

// Zone imports
import ZonesTable from './zones_table';
import AddZone from './add_zone';
import EditZone from './edit_zone';
import ViewZone from './view_zone';

interface Category {
    id: number;
    name: string;
    zoneId: number;
    zoneName: string;
    iconUrl: string;
    roomCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface Zone {
    id: number;
    name: string;
    categoryCount?: number;
    roomCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

const CategoriesPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'categories' | 'zones'>('categories');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 6,
        totalPages: 0
    });

    // Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);

    // Category Modal States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Zone Modal States
    const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
    const [isEditZoneOpen, setIsEditZoneOpen] = useState(false);
    const [isViewZoneOpen, setIsViewZoneOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab, currentPage, searchTerm]);

    // Reset page when tab or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                search: searchTerm,
                page: currentPage.toString(),
                limit: '6'
            });

            if (activeTab === 'categories') {
                const response = await apiService.get(`/categories?${params.toString()}`);
                if (response.success) {
                    setCategories(response.data);
                    if (response.pagination) setPagination(response.pagination);
                }
            } else {
                const response = await apiService.get(`/zones?${params.toString()}`);
                if (response.success) {
                    setZones(response.data);
                    if (response.pagination) setPagination(response.pagination);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa loại phòng này?')) return;
        try {
            const response = await apiService.delete(`/categories/${id}`);
            if (response.success) {
                fetchData();
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleDeleteZone = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khu vực này?')) return;
        try {
            const response = await apiService.delete(`/zones/${id}`);
            if (response.success) {
                fetchData();
            } else {
                alert(response.message);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleViewCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsViewOpen(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setIsEditOpen(true);
    };

    const handleViewZone = (zone: Zone) => {
        setSelectedZone(zone);
        setIsViewZoneOpen(true);
    };

    const handleEditZone = (zone: Zone) => {
        setSelectedZone(zone);
        setIsEditZoneOpen(true);
    };

    // Data is already filtered by API based on searchTerm

    return (
        <div className="space-y-6">
            {/* Header: Tab Switcher & Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => { setActiveTab('categories'); setSearchTerm(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'categories'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        <Layers size={16} />
                        Loại phòng
                    </button>
                    <button
                        onClick={() => { setActiveTab('zones'); setSearchTerm(''); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'zones'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        <MapPin size={16} />
                        Khu vực
                    </button>
                </div>

                <button
                    onClick={() => activeTab === 'categories' ? setIsAddOpen(true) : setIsAddZoneOpen(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-green-100 whitespace-nowrap"
                >
                    <Plus size={18} />
                    <span>Thêm {activeTab === 'categories' ? 'loại phòng' : 'khu vực'}</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder={`Tìm kiếm ${activeTab === 'categories' ? 'loại phòng' : 'khu vực'}...`}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Content Section */}
            {loading ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
                </div>
            ) : activeTab === 'categories' ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                            ID
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Icon</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                            Tên loại phòng
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                            Khu vực
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Số lượng phòng</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Không tìm thấy dữ liệu</td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-slate-900">{category.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                                    {category.iconUrl ? (
                                                        <img src={category.iconUrl} alt={category.name} className="w-6 h-6 object-contain" />
                                                    ) : (
                                                        <ImageIcon size={18} className="text-slate-300" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900">{category.name}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MapPin size={14} className="text-slate-400" />
                                                    <span className="font-medium">{category.zoneName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-slate-900 text-center">
                                                <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg border border-green-100">
                                                    {category.roomCount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-slate-900 flex items-center gap-2">
                                                    <span className="font-bold">{category.createdAt ? new Date(category.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{category.createdAt ? new Date(category.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleViewCategory(category)}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditCategory(category)}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCategory(category.id)}
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
            ) : (
                <ZonesTable
                    data={zones}
                    onView={handleViewZone}
                    onEdit={handleEditZone}
                    onDelete={handleDeleteZone}
                />
            )}

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                limit={pagination.limit}
                onPageChange={(page) => setCurrentPage(page)}
                itemName={activeTab === 'categories' ? 'loại phòng' : 'khu vực'}
            />

            {/* Modals for Categories */}
            <AddCategory
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onSuccess={fetchData}
            />

            {selectedCategory && (
                <>
                    <ViewCategory
                        isOpen={isViewOpen}
                        onClose={() => setIsViewOpen(false)}
                        category={selectedCategory}
                    />
                    <EditCategory
                        isOpen={isEditOpen}
                        onClose={() => setIsEditOpen(false)}
                        onSuccess={fetchData}
                        category={selectedCategory}
                    />
                </>
            )}

            {/* Modals for Zones */}
            <AddZone
                isOpen={isAddZoneOpen}
                onClose={() => setIsAddZoneOpen(false)}
                onSuccess={fetchData}
            />

            {selectedZone && (
                <>
                    <ViewZone
                        isOpen={isViewZoneOpen}
                        onClose={() => setIsViewZoneOpen(false)}
                        zone={selectedZone}
                    />
                    <EditZone
                        isOpen={isEditZoneOpen}
                        onClose={() => setIsEditZoneOpen(false)}
                        onSuccess={fetchData}
                        zone={selectedZone}
                    />
                </>
            )}
        </div>
    );
};


export default CategoriesPage;
