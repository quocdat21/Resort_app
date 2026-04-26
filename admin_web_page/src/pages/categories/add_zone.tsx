import React, { useState } from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    MapPin,
    Save
} from 'lucide-react';
import { apiService } from '../../services/api_service';

interface AddZoneProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddZone: React.FC<AddZoneProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: ''
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.post('/zones', formData);
            if (response.success) {
                onSuccess();
                onClose();
                setFormData({ name: '' });
            } else {
                setError(response.message || 'Có lỗi xảy ra');
            }
        } catch (err: any) {
            setError(err.message || 'Lỗi kết nối server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Thêm khu vực mới</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thiết lập vị trí địa lý trong resort</p>
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
                <div className="px-8 py-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                    <form id="add-zone-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-900 block">
                                Tên khu vực <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <MapPin size={16} />
                                </div>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
                                    placeholder="Ví dụ: Khu A, Khu Villas..."
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                    >
                        Hủy
                    </button>
                    <button
                        form="add-zone-form"
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-md shadow-green-100 active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Save size={16} />
                        {loading ? 'Đang lưu...' : 'Lưu khu vực'}
                    </button>
                </div>
            </div>
        </div>
        </Portal>
    );
};

export default AddZone;
