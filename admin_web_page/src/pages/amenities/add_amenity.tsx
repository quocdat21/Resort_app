import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Portal from '../../components/common/Portal';
import { X, Upload, Plus, Smile } from 'lucide-react';
import Swal from 'sweetalert2';

interface AddAmenityProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddAmenity: React.FC<AddAmenityProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [icon, setIcon] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setIcon(null);
            setPreview(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIcon(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', name);
            if (icon) formData.append('icon', icon);

            const response = await axios.post('http://localhost:3000/api/amenities', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Đã thêm tiện nghi mới.',
                    icon: 'success',
                    confirmButtonColor: '#15803d'
                });
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Lỗi', 'Không thể thêm tiện nghi', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
                                <Plus size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Thêm tiện nghi</h2>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all"><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tên tiện nghi</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all"
                                placeholder="VD: Wi-Fi miễn phí, Điều hòa..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">Icon đại diện</label>
                            <div className="relative group">
                                <div className={`aspect-square w-32 mx-auto rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50 ${preview ? 'border-green-500' : 'border-slate-200 hover:border-green-400'}`}>
                                    {preview ? (
                                        <img src={preview} alt="Icon Preview" className="w-full h-full object-cover p-4" />
                                    ) : (
                                        <Smile size={32} className="text-slate-300" />
                                    )}
                                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleIconChange} />
                                </div>
                                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">Nhấn để tải lên icon (PNG, SVG, JPG)</p>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all">Hủy</button>
                            <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-green-700 text-white rounded-2xl text-sm font-bold hover:bg-green-800 shadow-lg shadow-green-100 transition-all disabled:opacity-50">
                                {loading ? 'Đang lưu...' : 'Lưu lại'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Portal>
    );
};

export default AddAmenity;
