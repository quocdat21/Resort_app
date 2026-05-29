import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api_service';
import {
    CalendarCheck,
    Wallet,
    Users,
    Bed,
    ConciergeBell,
    Star,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Loader2
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';

interface DashboardData {
    stats: {
        totalRevenue: number;
        totalBookings: number;
        totalUsers: number;
        occupancy: {
            total: number;
            occupied: number;
            rate: number;
        };
        totalServices: number;
        totalPaymentsCount: number;
        trends: {
            revenue: number;
            bookings: number;
            users: number;
            services: number;
            payments: number;
        };
    };
    revenueChart: { day: string; revenue: number }[];
    bookingStatusData: { name: string; value: number; color: string }[];
    occupancyChart: { name: string; rate: number; date: string }[];
    latestBookings: {
        code: string;
        guest: string;
        type: string;
        checkIn: string;
        status: string;
        roomOrService: string;
    }[];
    latestPayments: {
        id: string;
        method: string;
        amount: number;
        status: string;
    }[];
}

const recentNotifications = [
    { id: 1, title: 'Hệ thống đã sẵn sàng', subtitle: 'Dashboard đã kết nối API', time: 'Vừa xong', icon: <CalendarCheck className="w-4 h-4 text-green-500" /> },
    { id: 2, title: 'Dữ liệu doanh thu thực tế', subtitle: 'Cập nhật từ bảng Payments', time: '1 phút trước', icon: <Wallet className="w-4 h-4 text-blue-500" /> },
    { id: 3, title: 'Tình trạng phòng thực tế', subtitle: 'Cập nhật từ Room_Numbers', time: '5 phút trước', icon: <Bed className="w-4 h-4 text-orange-500" /> },
];

const Dashboard: React.FC = () => {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await apiService.get('/dashboard/overview');
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Fetch dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <Loader2 className="w-10 h-10 text-green-700 animate-spin" />
                <p className="text-slate-500 font-bold animate-pulse">Đang tải dữ liệu Dashboard...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <>
            {/* Date Selector */}
            <div className="flex justify-end mb-6">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors">
                    <CalendarCheck size={16} className="text-slate-400" />
                    <span className="text-slate-900">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <ChevronRight size={16} className="text-slate-400 rotate-90" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard
                    icon={<Wallet className="text-blue-600" size={20} />}
                    iconBg="bg-blue-50"
                    label="Tổng doanh thu"
                    value={formatPrice(data.stats.totalRevenue)}
                    trend={`${data.stats.trends.revenue >= 0 ? '+' : ''}${data.stats.trends.revenue}%`}
                    trendUp={data.stats.trends.revenue >= 0}
                />
                <StatCard
                    icon={<CalendarCheck className="text-green-600" size={20} />}
                    iconBg="bg-green-50"
                    label="Tổng đơn đặt"
                    value={data.stats.totalBookings.toString()}
                    trend={`${data.stats.trends.bookings >= 0 ? '+' : ''}${data.stats.trends.bookings}%`}
                    trendUp={data.stats.trends.bookings >= 0}
                />
                <StatCard
                    icon={<Users className="text-orange-600" size={20} />}
                    iconBg="bg-orange-50"
                    label="Tổng người dùng"
                    value={data.stats.totalUsers.toString()}
                    trend={`${data.stats.trends.users >= 0 ? '+' : ''}${data.stats.trends.users}%`}
                    trendUp={data.stats.trends.users >= 0}
                />
                <StatCard
                    icon={<Bed className="text-purple-600" size={20} />}
                    iconBg="bg-purple-50"
                    label="Tỉ lệ lấp đầy"
                    value={`${data.stats.occupancy.rate}%`}
                    subtext={`${data.stats.occupancy.occupied} / ${data.stats.occupancy.total} phòng`}
                />
                <StatCard
                    icon={<ConciergeBell className="text-pink-600" size={20} />}
                    iconBg="bg-pink-50"
                    label="Dịch vụ đã đặt"
                    value={data.stats.totalServices.toString()}
                    trend={`${data.stats.trends.services >= 0 ? '+' : ''}${data.stats.trends.services}%`}
                    trendUp={data.stats.trends.services >= 0}
                />
                <StatCard
                    icon={<Wallet className="text-cyan-600" size={20} />}
                    iconBg="bg-cyan-50"
                    label="Lượt thanh toán"
                    value={data.stats.totalPaymentsCount.toString()}
                    trend={`${data.stats.trends.payments >= 0 ? '+' : ''}${data.stats.trends.payments}%`}
                    trendUp={data.stats.trends.payments >= 0}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 text-sm">Doanh thu (7 ngày)</h3>
                        <select className="bg-slate-50 border-none text-[10px] font-bold rounded-lg px-2 py-1 focus:ring-0 text-slate-600">
                            <option>Tuần này</option>
                        </select>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueChart}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    formatter={(value) => [formatPrice(Number(value ?? 0)), 'Doanh thu']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 text-sm">Trạng thái đơn</h3>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-[180px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.bookingStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.bookingStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-lg font-bold text-slate-900">{data.stats.totalBookings}</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Tổng đơn</p>
                            </div>
                        </div>
                        <div className="w-full space-y-2 mt-4">
                            {data.bookingStatusData.slice(0, 4).map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-medium text-slate-600">{item.name}</span>
                                    <span className="text-[10px] font-bold ml-auto text-slate-900">
                                        {item.value} ({data.stats.totalBookings > 0 ? Math.round(item.value / data.stats.totalBookings * 100) : 0}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 text-sm">Tỷ lệ lấp đầy</h3>
                        <div className="text-[10px] font-bold text-slate-400">7 ngày qua</div>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.occupancyChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    formatter={(value) => [`${Number(value ?? 0)}%`, 'Tỷ lệ']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={15} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Đơn đặt gần đây</h3>
                        <button className="text-green-600 text-xs font-bold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4">Mã đơn</th>
                                    <th className="pb-4 text-center">Khách</th>
                                    <th className="pb-4 text-center">Ngày nhận</th>
                                    <th className="pb-4 text-right">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-medium text-slate-700">
                                {data.latestBookings.map((booking, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 font-bold text-slate-900">#{booking.code}</td>
                                        <td className="py-4 text-center">{booking.guest || 'Ẩn danh'}</td>
                                        <td className="py-4 text-center text-slate-500">{formatDate(booking.checkIn)}</td>
                                        <td className="py-4 text-right">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${booking.status === 'Confirmed' ? 'bg-green-50 text-green-600' :
                                                booking.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-blue-50 text-blue-600'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Thanh toán</h3>
                        <button className="text-green-600 text-xs font-bold hover:underline">Xem tất cả</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4">Mã GD</th>
                                    <th className="pb-4 text-center">Số tiền</th>
                                    <th className="pb-4 text-right">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-medium text-slate-700">
                                {data.latestPayments.map((payment, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 font-bold text-slate-900">{payment.id}</td>
                                        <td className="py-4 text-center font-bold text-slate-900">{formatPrice(payment.amount)}</td>
                                        <td className="py-4 text-right">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${payment.status === 'success' || payment.status === 'Paid' ? 'bg-green-50 text-green-600' :
                                                payment.status === 'pending' || payment.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-red-50 text-red-600'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Thông báo</h3>
                        <button className="text-green-600 text-xs font-bold hover:underline">Tất cả</button>
                    </div>
                    <div className="space-y-6">
                        {recentNotifications.map((notif) => (
                            <div key={notif.id} className="flex gap-4">
                                <div className="mt-1 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                                    {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate text-slate-900">{notif.title}</p>
                                    {notif.subtitle && <p className="text-[10px] text-slate-400 font-medium truncate">{notif.subtitle}</p>}
                                    <p className="text-[10px] text-slate-400 mt-1">{notif.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: string;
    trend?: string;
    trendUp?: boolean;
    subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, iconBg, label, value, trend, trendUp, subtext }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center mb-4`}>
            {icon}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h4 className="text-lg font-black mb-1 text-slate-900 truncate" title={value}>{value}</h4>
        {trend && (
            <div className="flex items-center gap-1">
                {trendUp ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                <span className={`text-[10px] font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
                <span className="text-[10px] text-slate-400 font-medium ml-1">tháng này</span>
            </div>
        )}
        {subtext && (
            <p className="text-[10px] text-slate-400 font-medium truncate">{subtext}</p>
        )}
    </div>
);

export default Dashboard;
