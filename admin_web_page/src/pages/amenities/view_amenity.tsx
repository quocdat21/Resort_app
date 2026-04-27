import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Portal from '../../components/common/Portal';
import { X, Info, Home, MapPin, Layers, Coffee } from 'lucide-react';

interface Room {
    id: number;
    name: string;
    category_name: string;
    zone_name: string;
}

interface ViewAmenityProps {
    isOpen: boolean;
    onClose: () => void;
    amenityId: number | null;
}

const ViewAmenity: React.FC<ViewAmenityProps> = ({ isOpen, onClose, amenityId }) => {
    const [amenity, setAmenity] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && amenityId) {
            const fetchDetails = async () => {
                try {
                    setLoading(true);
                    const response = await axios.get(`http://localhost:3000/api/amenities/${amenityId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                        }
                    });
                    if (response.data.success) {
                        setAmenity(response.data.data);
                    }
                } catch (error) {
                    console.error('Fetch amenity details error:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [isOpen, amenityId]);

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                                <Info size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chi tiết tiện nghi</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thông tin và danh sách phòng sử dụng</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"><X size={20} /></button>
                    </div>

                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {loading || !amenity ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 italic">
                                <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-sm">Đang tải thông tin...</p>
                            </div>
                        ) : (
                            <>
                                {/* Header Info */}
                                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                                        {amenity.icon_url ? (
                                            <img src={`http://localhost:3000${amenity.icon_url}`} alt={amenity.name} className="w-12 h-12 object-contain" />
                                        ) : (
                                            <Coffee size={32} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900">{amenity.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Mã: #{amenity.id}</span>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">{amenity.rooms?.length || 0} phòng đang sử dụng</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Rooms List */}
                                <div className="space-y-4">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Home size={14} />
                                        Danh sách phòng áp dụng
                                    </h4>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {amenity.rooms && amenity.rooms.length > 0 ? (
                                            amenity.rooms.map((room: Room) => (
                                                <div key={room.id} className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md transition-all group">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{room.name}</div>
                                                            <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                                                <span className="flex items-center gap-1"><Layers size={10} /> {room.category_name}</span>
                                                                <span className="flex items-center gap-1"><MapPin size={10} /> {room.zone_name}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] font-mono text-slate-300">#{room.id}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                                <p className="text-sm text-slate-400 italic">Tiện nghi này chưa được áp dụng cho phòng nào.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all active:scale-95">Đóng cửa sổ</button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};

export default ViewAmenity;
