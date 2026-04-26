import React, { useState, useEffect } from 'react';
import Portal from '../../components/common/Portal';
import {
    X,
    Upload,
    ChevronDown,
    Layers,
    MapPin,
    Image as ImageIcon
} from 'lucide-react';
import { apiService } from '../../services/api_service';

interface AddCategoryProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Zone {
    id: number;
    name: string;
}

const AddCategory: React.FC<AddCategoryProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string | null>(null);
    const [zones, setZones] = useState<Zone[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        zoneId: ''
    });

    useEffect(() => {
        if (isOpen) {
            fetchZones();
            setFormData({ name: '', zoneId: '' });
            setIconFile(null);
            setIconPreview(null);
            setError(null);
        }
    }, [isOpen]);

    const fetchZones = async () => {
        try {
            const response = await apiService.get('/zones');
            if (response.success) {
                setZones(response.data);
            }
        } catch (error) {
            console.error('Error fetching zones:', error);
        }
    };

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('zoneId', formData.zoneId === 'none' ? '' : formData.zoneId);
            if (iconFile) {
                data.append('icon', iconFile);
            }

            const response = await apiService.post('/categories', data);
            if (response.success) {
                onSuccess();
                onClose();
                setFormData({ name: '', zoneId: '' });
                setIconFile(null);
                setIconPreview(null);
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
                            <Layers size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Thêm loại phòng mới</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thiết lập danh mục phòng và biểu tượng</p>
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
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                    <form id="add-category-form" onSubmit={handleSubmit} className="space-y-6">
                        {/* Icon Upload */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative group mb-4">
                                <div className="w-24 h-24 rounded-2xl bg-slate-50 flex items-center justify-center border-4 border-white shadow-sm text-slate-300 overflow-hidden">
                                    {iconPreview ? (
                                        <img src={iconPreview} alt="Icon Preview" className="w-16 h-16 object-contain" />
                                    ) : (
                                        <ImageIcon size={32} />
                                    )}
                                </div>
                                <label className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Upload className="text-white" size={20} />
                                    <input type="file" className="hidden" name="icon" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>
                            <label className="text-[11px] font-bold text-green-700 uppercase tracking-wider cursor-pointer hover:underline">
                                Tải biểu tượng lên
                                <input type="file" className="hidden" name="icon" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <FormInput
                                label="Tên loại phòng"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ví dụ: Deluxe, Family..."
                                icon={<Layers size={16} />}
                                required
                            />

                            <FormSelect
                                label="Khu vực (Zone)"
                                name="zoneId"
                                value={formData.zoneId}
                                onChange={handleChange}
                                icon={<MapPin size={16} />}
                                options={[
                                    { label: 'Chọn khu vực', value: '' },
                                    { label: 'Không có khu vực', value: 'none' },
                                    ...zones.map(z => ({ label: z.name, value: z.id.toString() }))
                                ]}
                                required
                            />
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
                        form="add-category-form"
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-md shadow-green-100 active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Đang lưu...' : 'Thêm loại phòng'}
                    </button>
                </div>
            </div>
        </div>
        </Portal>
    );
};

const FormInput: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    icon?: React.ReactNode;
}> = ({ label, name, value, onChange, required, type = 'text', placeholder, icon }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-900 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {icon}
            </div>
            <input
                name={name}
                value={value}
                onChange={onChange}
                type={type}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm"
                placeholder={placeholder}
                required={required}
            />
        </div>
    </div>
);

const FormSelect: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    required?: boolean;
    options: { label: string; value: string }[];
    icon?: React.ReactNode;
}> = ({ label, name, value, onChange, required, options, icon }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-900 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {icon}
            </div>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full appearance-none pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all text-slate-900 shadow-sm cursor-pointer"
                required={required}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
        </div>
    </div>
);

export default AddCategory;
