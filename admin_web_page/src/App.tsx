import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/dashboard/dashboard';
import UsersPage from './pages/users/users';
import RoomsPage from './pages/rooms/rooms';
import CategoriesPage from './pages/categories/categories';
import AmenitiesPage from './pages/amenities/amenities';
import ServicesPage from './pages/services/services';
import BookingsPage from './pages/bookings/bookings';
import PaymentsPage from './pages/payments/payments';
import VouchersPage from './pages/vouchers/vouchers';
import ReviewsPage from './pages/user_reviews/reviews';
import NotificationsPage from './pages/notifications/notifications';
import AdminLogin from './pages/admin_login/admin_login';
import type { JSX } from 'react';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<AdminLogin />} />

        {/* Admin Routes Wrapper */}
        <Route element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/amenities" element={<AmenitiesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings</h1><p className="mt-4 text-slate-500">Coming soon...</p></div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
