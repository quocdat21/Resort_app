import React from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    Layers,
    MapPin,
    Calendar,
    Bed,
    Info,
    Clock,
    Image as ImageIcon
} from 'lucide-react';

interface ViewCategoryProps {
    isOpen: boolean;
    onClose: () => void;
    category: {
        id: number;
        name: string;
        zoneName: string;
        iconUrl: string;
        roomCount?: number;
        createdAt?: string;
        updatedAt?: string;
    };
}

const ViewCategory: React.FC<ViewCategoryProps> = ({ isOpen, onClose, category }) => {
    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết loại phòng</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thông tin danh mục hệ thống</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-8 py-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                        {/* Icon & Name Large */}
                        <div className="flex flex-col items-center mb-8 text-center">
                            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center border-4 border-white shadow-md mb-4 overflow-hidden">
                                {category.iconUrl ? (
                                    <img src={category.iconUrl} alt={category.name} className="w-16 h-16 object-contain" />
                                ) : (
                                    <ImageIcon size={40} className="text-slate-200" />
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-1">{category.name}</h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">
                                <MapPin size={12} />
                                {category.zoneName}
                            </div>
                        </div>

                        {/* Details List */}
                        <div className="space-y-4">
                            <DetailItem
                                icon={<Info size={16} />}
                                label="Mã danh mục"
                                value={<span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">CAT-{category.id}</span>}
                            />
                            <DetailItem
                                icon={<Layers size={16} />}
                                label="Tên loại phòng"
                                value={category.name}
                            />
                            <DetailItem
                                icon={<MapPin size={16} />}
                                label="Khu vực trực thuộc"
                                value={category.zoneName}
                            />
                            <DetailItem
                                icon={<Bed size={16} />}
                                label="Số lượng phòng"
                                value={
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-green-700">{category.roomCount || 0}</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold">Phòng đang hoạt động</span>
                                    </div>
                                }
                            />
                            <DetailItem
                                icon={<Clock size={16} />}
                                label="Ngày tạo"
                                value={
                                    <div className="text-right text-xs text-slate-900">
                                        <span className="font-bold">{category.createdAt ? new Date(category.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
                                        <span className="text-[10px] text-slate-400 font-medium ml-2">{category.createdAt ? new Date(category.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    </div>
                                }
                            />
                            <DetailItem
                                icon={<Clock size={16} />}
                                label="Cập nhật lần cuối"
                                value={
                                    <div className="text-right text-xs text-slate-900">
                                        <span className="font-bold">{category.updatedAt ? new Date(category.updatedAt).toLocaleDateString('vi-VN') : '-'}</span>
                                        <span className="text-[10px] text-slate-400 font-medium ml-2">{category.updatedAt ? new Date(category.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                    </div>
                                }
                            />
                        </div>

                        {/* Description Mock */}
                        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ghi chú hệ thống</h4>
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                Đây là loại phòng tiêu chuẩn thuộc {category.zoneName}. Mọi thay đổi về tên hoặc biểu tượng sẽ ảnh hưởng trực tiếp đến hiển thị trên ứng dụng khách hàng.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0 group">
        <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-600 transition-colors">
            {icon}
            <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-sm font-bold text-slate-900">
            {value}
        </div>
    </div>
);

export default ViewCategory;
