import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes Wrapper */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          {/* You can add more admin routes here */}
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
