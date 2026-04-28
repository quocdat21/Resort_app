import React, { useState, useEffect } from 'react';
import Portal from '../../components/common/Portal';
import { apiService } from '../../services/api_service';
import {
    X,
    Upload,
    ClipboardList,
    Users,
    DollarSign,
    Info,
    ChevronDown,
    Save,
    Plus,
    Trash2,
    Check,
    ShieldCheck,
    Image as ImageIcon,
    Tag
} from 'lucide-react';
import Swal from 'sweetalert2';

interface EditServiceProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    serviceId: number | null;
}

interface ServicePrice {
    id?: number;
    price_type: 'full_day' | 'half_day' | 'unit';
    price: string | number;
    unit: string;
    description: string;
}

const EditService: React.FC<EditServiceProps> = ({ isOpen, onClose, onSuccess, serviceId }) => {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Main image
    const [mainImage, setMainImage] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [existingMainImage, setExistingMainImage] = useState<string | null>(null);

    // Secondary images
    const [secondaryImages, setSecondaryImages] = useState<(File | string | null)[]>(Array(5).fill(null));
    const [secondaryPreviews, setSecondaryPreviews] = useState<(string | null)[]>(Array(5).fill(null));

    const [formData, setFormData] = useState({
        name: '',
        type: 'Hall' as 'Hall' | 'Food' | 'Event' | 'Other',
        capacity: '',
        description: '',
        status: 'active' as 'active' | 'inactive'
    });

    const [prices, setPrices] = useState<ServicePrice[]>([]);

    useEffect(() => {
        if (isOpen && serviceId) {
            fetchServiceDetails();
        }
    }, [isOpen, serviceId]);

    const fetchServiceDetails = async () => {
        try {
            setFetching(true);
            // Reset image states before fetching new ones
            setMainImage(null);
            setMainImagePreview(null);
            setSecondaryImages(Array(5).fill(null));
            setSecondaryPreviews(Array(5).fill(null));

            const response = await apiService.get(`/services/${serviceId}`);
            if (response.success) {
                const s = response.data;
                setFormData({
                    name: s.name,
                    type: s.type,
                    capacity: s.capacity || '',
                    description: s.description || '',
                    status: s.status
                });
                setPrices(s.prices || []);
                setExistingMainImage(s.image_url);
                // Previews for existing secondary images
                const previews = Array(5).fill(null);
                const images = Array(5).fill(null);
                s.secondary_images?.slice(0, 5).forEach((img: any, idx: number) => {
                    const url = `http://localhost:3000${img.image_url}`;
                    previews[idx] = url;
                    images[idx] = img.image_url; // Store the relative path for easy comparison
                });
                setSecondaryPreviews(previews);
                setSecondaryImages(images);
            }
        } catch (err) {
            console.error('Fetch service details error:', err);
        } finally {
            setFetching(false);
        }
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
            const newPreviews = [...secondaryPreviews];
            newImages[index] = file;
            newPreviews[index] = URL.createObjectURL(file);
            setSecondaryImages(newImages);
            setSecondaryPreviews(newPreviews);

            // If there was an existing image at this index, we might need to track it for deletion
            // For simplicity, we can just let the backend handle 'if new file then replace'
        }
    };

    const removeSecondaryImage = (index: number) => {
        const newImages = [...secondaryImages];
        const newPreviews = [...secondaryPreviews];
        newImages[index] = null;
        newPreviews[index] = null;
        setSecondaryImages(newImages);
        setSecondaryPreviews(newPreviews);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'capacity') {
            setFormData(prev => ({ ...prev, [name]: parseRawPrice(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const formatDisplayPrice = (value: string | number) => {
        if (!value) return '';
        const stringValue = value.toString().replace(/\D/g, '');
        return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseRawPrice = (value: string) => {
        return value.replace(/\D/g, '');
    };

    const handlePriceChange = (index: number, field: keyof ServicePrice, value: string) => {
        const newPrices = [...prices];
        const updatedValue = field === 'price' ? parseRawPrice(value) : value;
        newPrices[index] = { ...newPrices[index], [field]: updatedValue };
        setPrices(newPrices);
    };

    const addPriceRow = () => {
        setPrices([...prices, { price_type: 'unit', price: '', unit: '', description: '' }]);
    };

    const removePriceRow = (index: number) => {
        if (prices.length > 1) {
            setPrices(prices.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('type', formData.type);
            data.append('capacity', formData.capacity);
            data.append('description', formData.description);
            data.append('status', formData.status);
            data.append('prices', JSON.stringify(prices));

            if (mainImage) {
                data.append('main_image', mainImage);
            }

            const existing_images: string[] = [];
            secondaryImages.forEach((img) => {
                if (img instanceof File) {
                    data.append('secondary_images', img);
                } else if (typeof img === 'string') {
                    existing_images.push(img);
                }
            });
            data.append('existing_images', JSON.stringify(existing_images));

            const response = await apiService.put(`/services/${serviceId}`, data);

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: 'Dịch vụ đã được cập nhật!',
                    confirmButtonColor: '#15803d'
                });
                onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi cập nhật dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Portal>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10 rounded-t-[32px]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center shadow-lg shadow-green-100">
                                <ImageIcon size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">Chỉnh sửa dịch vụ</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Cập nhật thông tin dịch vụ <span className="text-green-700">#SERV-{serviceId}</span></p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">

                        {fetching ? (
                            <div className="p-20 flex flex-col items-center justify-center gap-4 text-slate-400 italic">
                                <div className="w-10 h-10 border-4 border-green-700/20 border-t-green-700 rounded-full animate-spin" />
                                <p>Đang tải thông tin dịch vụ...</p>
                            </div>
                        ) : (
                            <form id="edit-service-form" onSubmit={handleSubmit} className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Left Column: Images */}
                                    <div className="lg:col-span-5 space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon size={14} /> Ảnh đại diện chính
                                            </label>
                                            <div className="relative group aspect-video bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden hover:border-green-500/50 transition-all">
                                                {(mainImagePreview || existingMainImage) ? (
                                                    <>
                                                        <img src={mainImagePreview || `http://localhost:3000${existingMainImage}`} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                            <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl hover:scale-105 transition-all">
                                                                Thay đổi ảnh
                                                                <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                                                            </label>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center gap-3">
                                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-slate-400">
                                                            <Upload size={20} />
                                                        </div>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleMainImageChange} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon size={14} /> Ảnh chi tiết (Tối đa 5)
                                            </label>
                                            <div className="grid grid-cols-5 gap-3">
                                                {secondaryPreviews.map((preview, idx) => (
                                                    <div key={idx} className="relative group aspect-square">
                                                        <div className={`w-full h-full rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden bg-slate-50 ${preview ? 'border-green-500 shadow-md' : 'border-slate-200 hover:border-green-500/50'}`}>
                                                            {preview ? (
                                                                <>
                                                                    <img src={preview} alt={`Sub ${idx}`} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                                        <label className="cursor-pointer p-1.5 bg-white rounded-lg shadow-md text-slate-700 hover:text-green-600 transition-colors">
                                                                            <Upload size={14} />
                                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSecondaryImageChange(idx, e)} />
                                                                        </label>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <label className="absolute inset-0 cursor-pointer flex items-center justify-center text-slate-300 hover:text-green-500 transition-colors">
                                                                    <Plus size={16} />
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleSecondaryImageChange(idx, e)} />
                                                                </label>
                                                            )}
                                                        </div>
                                                        {preview && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeSecondaryImage(idx)}
                                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Content */}
                                    <div className="lg:col-span-7 space-y-8">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Tag size={14} className="text-green-700" /> Tên dịch vụ
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-medium transition-all"
                                                    required />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <ClipboardList size={14} className="text-green-700" /> Loại dịch vụ
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="type"
                                                        value={formData.type}
                                                        onChange={handleChange}
                                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-medium transition-all appearance-none"
                                                    >
                                                        <option value="Hall">Hội trường</option>
                                                        <option value="Food">Ẩm thực</option>
                                                        <option value="Event">Sự kiện</option>
                                                        <option value="Other">Khác</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Users size={14} className="text-green-700" /> Sức chứa (Khách)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="capacity"
                                                    value={formatDisplayPrice(formData.capacity)}
                                                    onChange={handleChange}
                                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-medium transition-all" />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <Check size={14} className="text-green-700" /> Trạng thái
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="status"
                                                        value={formData.status}
                                                        onChange={handleChange}
                                                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-medium transition-all appearance-none"
                                                    >
                                                        <option value="active">Đang hoạt động</option>
                                                        <option value="inactive">Ngừng cung cấp</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                <Info size={14} className="text-green-700" /> Mô tả chi tiết
                                            </label>
                                            <textarea
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                rows={4}
                                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/20 text-sm font-medium transition-all resize-none" />
                                        </div>

                                        {/* Dynamic Prices */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                    <DollarSign size={14} className="text-green-700" /> Cấu hình giá dịch vụ
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={addPriceRow}
                                                    className="text-[10px] font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all flex items-center gap-1.5"
                                                >
                                                    <Plus size={12} /> Thêm mức giá
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {prices.map((price, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <select
                                                                value={price.price_type}
                                                                onChange={(e) => handlePriceChange(idx, 'price_type', e.target.value as any)}
                                                                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:outline-none shadow-sm"
                                                            >
                                                                <option value="full_day">Giá 1 Ngày</option>
                                                                <option value="half_day">Giá 1/2 Ngày</option>
                                                                <option value="unit">Giá theo Đơn vị</option>
                                                            </select>
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    value={formatDisplayPrice(price.price)}
                                                                    onChange={(e) => handlePriceChange(idx, 'price', e.target.value)}
                                                                    placeholder="Số tiền"
                                                                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:outline-none shadow-sm" />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold uppercase">đ</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={price.unit}
                                                                    onChange={(e) => handlePriceChange(idx, 'unit', e.target.value)}
                                                                    placeholder="Đơn vị"
                                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:outline-none shadow-sm" />
                                                                {prices.length > 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removePriceRow(idx)}
                                                                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            value={price.description}
                                                            onChange={(e) => handlePriceChange(idx, 'description', e.target.value)}
                                                            placeholder="Ghi chú thêm cho mức giá này"
                                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-medium focus:outline-none shadow-sm" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium flex items-center gap-3">
                                        <X size={18} className="bg-red-100 p-1 rounded-full" />
                                        {error}
                                    </div>
                                )}
                                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Dữ liệu được xác thực hệ thống</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                                        >
                                            Hủy bỏ
                                        </button>
                                        <button
                                            type="submit"
                                            form="edit-service-form"
                                            disabled={loading}
                                            className="px-10 py-2.5 bg-green-700 text-white rounded-xl text-sm font-bold hover:bg-green-800 transition-all shadow-lg shadow-green-100 flex items-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                                    Đang lưu...
                                                </>
                                            ) : (
                                                <>
                                                    <Save size={18} />
                                                    Cập nhật dịch vụ
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Portal >
    );
};

export default EditService;
