import React from 'react';
import {
    CalendarCheck,
    Wallet,
    Users,
    Bed,
    ConciergeBell,
    Star,
    TrendingUp,
    TrendingDown,
    ChevronRight
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

const revenueData = [
    { day: 'May 20', revenue: 40000 },
    { day: 'May 21', revenue: 60000 },
    { day: 'May 22', revenue: 55000 },
    { day: 'May 23', revenue: 70000 },
    { day: 'May 24', revenue: 65000 },
    { day: 'May 25', revenue: 90000 },
    { day: 'May 26', revenue: 80000 },
];

const bookingStatusData = [
    { name: 'Confirmed', value: 642, color: '#10b981' },
    { name: 'Pending', value: 312, color: '#3b82f6' },
    { name: 'Cancelled', value: 160, color: '#f59e0b' },
    { name: 'Completed', value: 134, color: '#ef4444' },
];

const occupancyRateData = [
    { name: 'Mon', rate: 70 },
    { name: 'Tue', rate: 85 },
    { name: 'Wed', rate: 65 },
    { name: 'Thu', rate: 72 },
    { name: 'Fri', rate: 62 },
    { name: 'Sat', rate: 75 },
];

const latestBookings = [
    { code: 'BK2405261', guest: 'John Doe', room: 'Deluxe Ocean View', checkIn: '26/05/2024', status: 'Confirmed' },
    { code: 'BK2405262', guest: 'Mary Smith', room: 'Family Suite', checkIn: '27/05/2024', status: 'Pending' },
    { code: 'BK2405263', guest: 'Robert Brown', room: 'Garden Villa', checkIn: '28/05/2024', status: 'Confirmed' },
    { code: 'BK2405264', guest: 'Linda Williams', room: 'Deluxe Room', checkIn: '29/05/2024', status: 'Pending' },
    { code: 'BK2405265', guest: 'David Johnson', room: 'Superior Room', checkIn: '30/05/2024', status: 'Paid' },
];

const latestPayments = [
    { id: 'TXN100521', method: 'Credit Card', amount: '$1,250.00', status: 'Paid' },
    { id: 'TXN100522', method: 'E-Wallet', amount: '$380.00', status: 'Paid' },
    { id: 'TXN100523', method: 'Bank Transfer', amount: '$2,500.00', status: 'Pending' },
    { id: 'TXN100524', method: 'Credit Card', amount: '$600.00', status: 'Failed' },
    { id: 'TXN100525', method: 'E-Wallet', amount: '$1,100.00', status: 'Paid' },
];

const recentNotifications = [
    { id: 1, title: 'New booking received', subtitle: 'BK2405261 by John Doe', time: '5 min ago', icon: <CalendarCheck className="w-4 h-4 text-green-500" /> },
    { id: 2, title: 'Payment of $1,250.00 received', subtitle: 'TXN100521', time: '15 min ago', icon: <Wallet className="w-4 h-4 text-blue-500" /> },
    { id: 3, title: 'Room #101 is maintenance completed', subtitle: '', time: '30 min ago', icon: <Bed className="w-4 h-4 text-orange-500" /> },
    { id: 4, title: 'New review for Deluxe Ocean View', subtitle: '', time: '1 hour ago', icon: <Star className="w-4 h-4 text-purple-500" /> },
    { id: 5, title: 'New service booking', subtitle: 'SB24052601 by John Doe', time: '2 hours ago', icon: <ConciergeBell className="w-4 h-4 text-green-500" /> },
];

const Dashboard: React.FC = () => {
    return (
        <>
            {/* Date Selector */}
            <div className="flex justify-end mb-6">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors">
                    <CalendarCheck size={16} className="text-slate-400" />
                    <span className="text-slate-900">May 20, 2024 - May 26, 2024</span>
                    <ChevronRight size={16} className="text-slate-400 rotate-90" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard
                    icon={<Wallet className="text-blue-600" size={20} />}
                    iconBg="bg-blue-50"
                    label="Total Revenue"
                    value="$128,540"
                    trend="+12.5%"
                    trendUp={true}
                />
                <StatCard
                    icon={<CalendarCheck className="text-green-600" size={20} />}
                    iconBg="bg-green-50"
                    label="Total Bookings"
                    value="1,248"
                    trend="+8.2%"
                    trendUp={true}
                />
                <StatCard
                    icon={<Users className="text-orange-600" size={20} />}
                    iconBg="bg-orange-50"
                    label="Total Users"
                    value="3,860"
                    trend="+15.7%"
                    trendUp={true}
                />
                <StatCard
                    icon={<Bed className="text-purple-600" size={20} />}
                    iconBg="bg-purple-50"
                    label="Rooms Occupancy"
                    value="72%"
                    subtext="141 / 195 rooms"
                />
                <StatCard
                    icon={<ConciergeBell className="text-pink-600" size={20} />}
                    iconBg="bg-pink-50"
                    label="Services Booked"
                    value="856"
                    trend="+9.1%"
                    trendUp={true}
                />
                <StatCard
                    icon={<Wallet className="text-cyan-600" size={20} />}
                    iconBg="bg-cyan-50"
                    label="Total Payments"
                    value="$98,430"
                    trend="+10.3%"
                    trendUp={true}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Revenue Over Time</h3>
                        <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-2 py-1 focus:ring-0 text-slate-600">
                            <option>This Week</option>
                        </select>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
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
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Booking Status</h3>
                        <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-2 py-1 focus:ring-0 text-slate-600">
                            <option>This Week</option>
                        </select>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-[180px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={bookingStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={75}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {bookingStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <p className="text-xl font-bold text-slate-900">1,248</p>
                                <p className="text-[10px] text-slate-400 uppercase font-bold">Total</p>
                            </div>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-y-3 mt-4">
                            {bookingStatusData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-medium text-slate-600">{item.name}</span>
                                    <span className="text-xs font-bold ml-auto text-slate-900">{item.value} ({Math.round(item.value / 1248 * 100)}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Room Occupancy Rate</h3>
                        <select className="bg-slate-50 border-none text-xs font-bold rounded-lg px-2 py-1 focus:ring-0 text-slate-600">
                            <option>This Week</option>
                        </select>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={occupancyRateData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                />
                                <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900">Latest Bookings</h3>
                        <button className="text-green-600 text-xs font-bold hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4">Booking Code</th>
                                    <th className="pb-4">Guest</th>
                                    <th className="pb-4">Room</th>
                                    <th className="pb-4">Check in</th>
                                    <th className="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-medium text-slate-700">
                                {latestBookings.map((booking, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0">
                                        <td className="py-4 font-bold text-slate-900">{booking.code}</td>
                                        <td className="py-4">{booking.guest}</td>
                                        <td className="py-4 text-slate-500">{booking.room}</td>
                                        <td className="py-4 text-slate-500">{booking.checkIn}</td>
                                        <td className="py-4">
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
                        <h3 className="font-bold text-slate-900">Latest Payments</h3>
                        <button className="text-green-600 text-xs font-bold hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                    <th className="pb-4">Transaction ID</th>
                                    <th className="pb-4">Method</th>
                                    <th className="pb-4">Amount</th>
                                    <th className="pb-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-medium text-slate-700">
                                {latestPayments.map((payment, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 last:border-0">
                                        <td className="py-4 font-bold text-slate-900">{payment.id}</td>
                                        <td className="py-4">{payment.method}</td>
                                        <td className="py-4 font-bold text-slate-900">{payment.amount}</td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${payment.status === 'Paid' ? 'bg-green-50 text-green-600' :
                                                    payment.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
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
                        <h3 className="font-bold text-slate-900">Recent Notifications</h3>
                        <button className="text-green-600 text-xs font-bold hover:underline">View all</button>
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
        <h4 className="text-xl font-black mb-1 text-slate-900">{value}</h4>
        {trend && (
            <div className="flex items-center gap-1">
                {trendUp ? <TrendingUp size={12} className="text-green-500" /> : <TrendingDown size={12} className="text-red-500" />}
                <span className={`text-[10px] font-bold ${trendUp ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
                <span className="text-[10px] text-slate-400 font-medium ml-1">vs last month</span>
            </div>
        )}
        {subtext && (
            <p className="text-[10px] text-slate-400 font-medium">{subtext}</p>
        )}
    </div>
);

export default Dashboard;
