import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Portal from '../../components/common/Portal';
import {
    X,
    Upload,
    Home,
    Layers,
    Maximize2,
    Users,
    DollarSign,
    Info,
    ChevronDown,
    Plus,
    //Trash2,
    Image as ImageIcon
} from 'lucide-react';
import Swal from 'sweetalert2';

interface AddRoomProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddRoom: React.FC<AddRoomProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Main image
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

    // Secondary images (max 5)
    const [secondaryImages, setSecondaryImages] = useState<(File | null)[]>(Array(5).fill(null));
    const [secondaryPreviews, setSecondaryPreviews] = useState<(string | null)[]>(Array(5).fill(null));

    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        description: '',
        sizeSqm: '',
        capacityAdults: '2',
        capacityChildren: '0',
        basePrice: ''
    });

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setFormData({
                name: '',
                categoryId: '',
                description: '',
                sizeSqm: '',
                capacityAdults: '2',
                capacityChildren: '0',
                basePrice: ''
            });
            setMainImage(null);
            setMainImagePreview(null);
            setSecondaryImages(Array(5).fill(null));
            setSecondaryPreviews(Array(5).fill(null));
            setError(null);

            // Fetch categories
            const fetchCategories = async () => {
                try {
                    const response = await axios.get('http://localhost:3000/api/categories');
                    if (response.data.success) {
                        const options = response.data.data.map((cat: any) => ({
                            label: cat.name,
                            value: cat.id.toString()
                        }));
                        setCategories([{ label: 'Chọn loại phòng', value: '' }, ...options]);
                    }
                } catch (err) {
                    console.error('Fetch categories error:', err);
                }
            };
            fetchCategories();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMainImage(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSecondaryImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const newImages = [...secondaryImages];
            newImages[index] = file;
            setSecondaryImages(newImages);

            const newPreviews = [...secondaryPreviews];
            newPreviews[index] = URL.createObjectURL(file);
            setSecondaryPreviews(newPreviews);
        }
    };

    const removeSecondaryImage = (index: number) => {
        const newImages = [...secondaryImages];
        newImages[index] = null;
        setSecondaryImages(newImages);

        const newPreviews = [...secondaryPreviews];
        newPreviews[index] = null;
        setSecondaryPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mainImage) {
            setError('Vui lòng chọn ảnh đại diện cho phòng');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = new FormData();
            data.append('name', formData.name);
            data.append('categoryId', formData.categoryId);
            data.append('description', formData.description);
            data.append('sizeSqm', formData.sizeSqm);
            data.append('capacityAdults', formData.capacityAdults);
            data.append('capacityChildren', formData.capacityChildren);
            data.append('basePrice', formData.basePrice);
            
            if (mainImage) {
                data.append('mainImage', mainImage);
            }

            secondaryImages.forEach(img => {
                if (img) data.append('secondaryImages', img);
            });

            const response = await axios.post('http://localhost:3000/api/rooms', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Thành công!',
                    text: 'Đã thêm phòng template mới.',
                    icon: 'success',
                    confirmButtonColor: '#15803d'
                });
                onSuccess();
                onClose();
            }

        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Lỗi khi lưu phòng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300">
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                                <Plus size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Thêm phòng mới</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Thiết lập thông tin và hình ảnh cho phòng resort</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200"
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
                        <form id="add-room-form" onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                                {/* Left Column: Images */}
                                <div className="lg:col-span-5 space-y-8">
                                    {/* Main Image Upload */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <ImageIcon size={16} className="text-green-700" />
                                            Ảnh đại diện phòng <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <div className={`aspect-[4/3] rounded-[24px] border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-slate-50 ${mainImagePreview ? 'border-green-500 shadow-lg' : 'border-slate-200 hover:border-green-400 hover:bg-green-50/30'}`}>
                                                {mainImagePreview ? (
                                                    <img src={mainImagePreview} alt="Main Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                                                            <Upload size={32} />
                                                        </div>
                                                        <p className="text-xs font-bold uppercase tracking-wider">Tải ảnh chính lên</p>
                                                    </div>
                                                )}
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleMainImageChange} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Secondary Images Grid */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                                <Layers size={16} className="text-green-700" />
                                                Ảnh chi tiết phòng (Tối đa 5 ảnh)
                                            </label>
                                            <span className="text-[10px] font-black text-slate-400 uppercase">
                                                {secondaryImages.filter(img => img !== null).length}/5
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-3">
                                            {secondaryPreviews.map((preview, index) => (
                                                <div key={index} className="relative group aspect-square">
                                                    <div className={`w-full h-full rounded-xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden bg-slate-50 ${preview ? 'border-green-500 shadow-md' : 'border-slate-200 hover:border-green-400'}`}>
                                                        {preview ? (
                                                            <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Plus size={20} className="text-slate-300" />
                                                        )}
                                                        {!preview && (
                                                            <input
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                                accept="image/*"
                                                                onChange={(e) => handleSecondaryImageChange(index, e)}
                                                            />
                                                        )}
                                                    </div>
                                                    {preview && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeSecondaryImage(index)}
                                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Fields */}
                                <div className="lg:col-span-7 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormInput
                                            label="Tên phòng (Template)"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: Phòng Deluxe Ocean..."
                                            icon={<Home size={16} />}
                                            required
                                        />
                                        <FormSelect
                                            label="Loại phòng (Category)"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            icon={<Layers size={16} />}
                                            options={categories}
                                            required
                                        />
                                        <FormInput
                                            label="Giá cơ bản (/đêm)"
                                            name="basePrice"
                                            type="number"
                                            value={formData.basePrice}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: 4500000"
                                            icon={<DollarSign size={16} />}
                                            required
                                        />
                                        <FormInput
                                            label="Diện tích (m²)"
                                            name="sizeSqm"
                                            type="number"
                                            value={formData.sizeSqm}
                                            onChange={handleChange}
                                            placeholder="Ví dụ: 45"
                                            icon={<Maximize2 size={16} />}
                                        />
                                        <FormInput
                                            label="Sức chứa người lớn"
                                            name="capacityAdults"
                                            type="number"
                                            value={formData.capacityAdults}
                                            onChange={handleChange}
                                            icon={<Users size={16} />}
                                        />
                                        <FormInput
                                            label="Sức chứa trẻ em"
                                            name="capacityChildren"
                                            type="number"
                                            value={formData.capacityChildren}
                                            onChange={handleChange}
                                            icon={<Users size={16} />}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                            <Info size={14} className="text-green-700" />
                                            Mô tả chi tiết phòng
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all text-slate-900 shadow-sm min-h-[120px] placeholder:text-slate-300"
                                            placeholder="Nhập mô tả về tiện nghi, hướng nhìn, hoặc các đặc điểm nổi bật của phòng..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-[18px] text-sm font-bold hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            form="add-room-form"
                            type="submit"
                            disabled={loading}
                            className={`px-10 py-3 bg-green-700 text-white rounded-[18px] text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 active:scale-95 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Thêm phòng mới
                                </>
                            )}
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
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                {icon}
            </div>
            <input
                name={name}
                value={value}
                onChange={onChange}
                type={type}
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all text-slate-900 shadow-sm placeholder:text-slate-300"
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
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-900 block">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors">
                {icon}
            </div>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full appearance-none pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all text-slate-900 shadow-sm cursor-pointer"
                required={required}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-slate-600 transition-colors" size={18} />
        </div>
    </div>
);

export default AddRoom;
