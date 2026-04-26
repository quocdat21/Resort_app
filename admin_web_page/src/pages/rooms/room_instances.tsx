import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Portal from '../../components/common/Portal';
import {
    X,
    Plus,
    Edit2,
    Trash2,
    Hash,
    Activity,
    Save,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Room {
    id: string;
    name: string;
    main_image_url: string;
}

interface RoomInstance {
    id: string;
    room_id: string;
    room_number: string;
    status: 'Available' | 'Occupied' | 'Maintenance' | 'Hidden';
}

interface RoomInstancesProps {
    isOpen: boolean;
    onClose: () => void;
    room: Room | null;
}

const RoomInstances: React.FC<RoomInstancesProps> = ({ isOpen, onClose, room }) => {
    const [instances, setInstances] = useState<RoomInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: '',
        status: 'Available' as RoomInstance['status']
    });

    const fetchInstances = async () => {
        if (!room) return;
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:3000/api/rooms/${room.id}`);
            if (response.data.success) {
                // The room details API includes instances
                setInstances(response.data.data.instances || []);
            }
        } catch (error) {
            console.error('Fetch instances error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && room) {
            fetchInstances();
            setIsAdding(false);
            setIsEditing(null);
        }
    }, [isOpen, room]);

    if (!isOpen || !room) return null;

    const handleAdd = async () => {
        if (!formData.roomNumber) return;
        try {
            const response = await axios.post('http://localhost:3000/api/rooms/instances', {
                roomId: room.id,
                roomNumber: formData.roomNumber,
                status: formData.status
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });

            if (response.data.success) {
                fetchInstances();
                setIsAdding(false);
                setFormData({ roomNumber: '', status: 'Available' });
            }
        } catch (error: any) {
            Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể thêm số phòng', 'error');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const response = await axios.put(`http://localhost:3000/api/rooms/instances/${id}`, {
                roomNumber: formData.roomNumber,
                status: formData.status
            }, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            });

            if (response.data.success) {
                fetchInstances();
                setIsEditing(null);
            }
        } catch (error: any) {
            Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể cập nhật', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const result = await Swal.fire({
            title: 'Xóa số phòng?',
            text: 'Bạn có chắc chắn muốn xóa số phòng này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/rooms/instances/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
                });
                if (response.data.success) {
                    fetchInstances();
                }
            } catch (error: any) {
                Swal.fire('Lỗi!', error.response?.data?.message || 'Không thể xóa', 'error');
            }
        }
    };

    const startEdit = (inst: RoomInstance) => {
        setIsEditing(inst.id);
        setFormData({ roomNumber: inst.room_number, status: inst.status });
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="relative w-16 h-12 rounded-xl overflow-hidden shadow-sm border border-slate-100">
                                <img src={`http://localhost:3000${room.main_image_url}`} alt={room.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết danh sách phòng</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Loại: <span className="text-green-600">{room.name}</span>
                                </p>
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
                    <div className="flex flex-col lg:flex-row h-[70vh]">
                        {/* Summary & Image Info */}
                        <div className="w-full lg:w-72 bg-slate-50 border-r border-slate-100 p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng số phòng</p>
                                    <p className="text-2xl font-black text-slate-900">{instances.length}</p>
                                </div>
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 shadow-sm">
                                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Đang trống</p>
                                    <p className="text-2xl font-black text-green-700">{instances.filter(i => i.status === 'Available').length}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ghi chú</p>
                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-[11px] text-blue-700 font-medium leading-relaxed">
                                    Tất cả các phòng thuộc loại này sẽ sử dụng chung thông tin mô tả, diện tích, giá và hình ảnh từ phòng cha.
                                </div>
                            </div>
                        </div>

                        {/* Instances List */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Hash size={16} className="text-green-600" />
                                    Danh sách số phòng (Room Numbers)
                                </h3>
                                <button
                                    onClick={() => setIsAdding(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-green-100"
                                >
                                    <Plus size={14} />
                                    <span>Thêm số phòng</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Add New Form */}
                                {isAdding && (
                                    <div className="p-4 bg-green-50 rounded-2xl border-2 border-dashed border-green-200 animate-in slide-in-from-top-4">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-green-700 uppercase mb-1 block">Số phòng</label>
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    className="w-full px-3 py-2 bg-white border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                    placeholder="Ví dụ: 101"
                                                    value={formData.roomNumber}
                                                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleAdd}
                                                    className="flex-1 bg-green-700 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-800 transition-all"
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    onClick={() => setIsAdding(false)}
                                                    className="px-3 py-2 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center gap-3">
                                        <Loader2 className="w-8 h-8 text-green-700 animate-spin" />
                                        <p className="text-slate-400 text-sm font-medium">Đang tải danh sách...</p>
                                    </div>
                                ) : instances.length === 0 && !isAdding ? (
                                    <div className="col-span-full py-20 text-center">
                                        <p className="text-slate-400 text-sm font-medium">Chưa có số phòng nào được tạo</p>
                                    </div>
                                ) : (
                                    instances.map((inst) => (
                                        <div key={inst.id} className={`p-4 rounded-2xl border transition-all ${isEditing === inst.id ? 'bg-white border-blue-200 shadow-md ring-2 ring-blue-500/10' : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm shadow-sm'}`}>
                                            {isEditing === inst.id ? (
                                                <div className="space-y-3">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                                                        value={formData.roomNumber}
                                                        onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                                                    />
                                                    <select
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                                        value={formData.status}
                                                        onChange={e => setFormData({ ...formData, status: e.target.value as RoomInstance['status'] })}
                                                    >
                                                        <option value="Available">Đang trống</option>
                                                        <option value="Occupied">Đang có khách</option>
                                                        <option value="Maintenance">Bảo trì</option>
                                                        <option value="Hidden">Đang ẩn</option>
                                                    </select>
                                                    <div className="flex gap-2 pt-1">
                                                        <button onClick={() => handleUpdate(inst.id)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700">
                                                            <Save size={14} /> Cập nhật
                                                        </button>
                                                        <button onClick={() => setIsEditing(null)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                                            <span className="text-sm font-black">#{inst.room_number}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900">Phòng {inst.room_number}</p>
                                                            <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                                                inst.status === 'Available' ? 'text-green-600' :
                                                                inst.status === 'Occupied' ? 'text-blue-600' :
                                                                inst.status === 'Maintenance' ? 'text-orange-600' : 'text-red-600'
                                                            }`}>
                                                                {inst.status === 'Available' ? 'Đang trống' :
                                                                 inst.status === 'Occupied' ? 'Có khách' :
                                                                 inst.status === 'Maintenance' ? 'Bảo trì' : 'Ẩn'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => startEdit(inst)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Chỉnh sửa">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(inst.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default RoomInstances;
