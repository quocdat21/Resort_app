import React from 'react';
import {
    MapPin,
    Eye,
    Edit2,
    Trash2,
    ArrowUpDown
} from 'lucide-react';

interface Zone {
    id: number;
    name: string;
    categoryCount?: number;
    roomCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface ZonesTableProps {
    data: Zone[];
    onView: (zone: Zone) => void;
    onEdit: (zone: Zone) => void;
    onDelete: (id: number) => void;
}

const ZonesTable: React.FC<ZonesTableProps> = ({ data, onView, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-200">
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap w-24">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                    ID
                                </div>
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">
                                    Tên khu vực
                                </div>
                            </th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Số loại phòng</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Tổng số phòng</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {data.map((zone) => (
                            <tr key={zone.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-900">{zone.id}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                            <MapPin size={14} />
                                        </div>
                                        <span className="font-bold text-slate-900">{zone.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                                        {zone.categoryCount || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">
                                        {zone.roomCount || 0}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs text-slate-900 flex items-center gap-2">
                                        <span className="font-bold">{zone.createdAt ? new Date(zone.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{zone.createdAt ? new Date(zone.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onView(zone)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Xem chi tiết"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            onClick={() => onEdit(zone)}
                                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                            title="Chỉnh sửa"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(zone.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                            title="Xóa"
                                        >
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
    );
};

export default ZonesTable;
