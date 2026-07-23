# Resort App 2026

Monorepo cho hệ thống đặt phòng và dịch vụ resort, gồm:

- `backend_resort_app`: REST API Node.js/Express kết nối MySQL.
- `resort_app`: ứng dụng Flutter cho khách hàng.
- `admin_web_page`: trang quản trị cho nhân sự/admin.
- `Query_create_DB.sql`: script khởi tạo MySQL.

## Tính năng chính

### Ứng dụng khách hàng

- Onboarding, đăng nhập/đăng ký, OTP, quên và đặt lại mật khẩu.
- Trang chủ tổng hợp danh mục phòng, phòng nổi bật và banner voucher.
- Tìm kiếm phòng theo ngày, số khách, khu vực, loại phòng, khoảng giá và từ khóa.
- Xem chi tiết phòng: hình ảnh, tiện nghi, đánh giá, số phòng còn trống.
- Đặt phòng, chọn dịch vụ đi kèm, áp dụng voucher và thanh toán.
- Đặt dịch vụ riêng như sảnh, ẩm thực, sự kiện hoặc dịch vụ khác.
- Thanh toán QR/chuyển khoản, kiểm tra trạng thái thanh toán.
- Lịch sử đặt phòng, lịch sử thanh toán, chi tiết booking.
- Hồ sơ cá nhân, cập nhật thông tin và ảnh đại diện.
- Hỗ trợ giao diện tiếng Việt/tiếng Anh qua `LanguageCubit`.

### Trang quản trị

- Đăng nhập admin và bảo vệ route bằng JWT lưu trong `localStorage`.
- Dashboard doanh thu, booking, người dùng, tỉ lệ lấp đầy, biểu đồ theo tuần/tháng/năm.
- Quản lý người dùng.
- Quản lý khu vực, loại phòng, phòng mẫu và số phòng thực tế.
- Quản lý tiện nghi.
- Quản lý dịch vụ, gói giá và hình ảnh dịch vụ.
- Quản lý booking phòng, booking dịch vụ và trạng thái booking.
- Quản lý thanh toán và cập nhật trạng thái thanh toán thủ công.
- Quản lý voucher.
- Trang review và notification đã có khung màn hình.

### Backend API

- REST API dưới prefix `/api`.
- JWT middleware và phân quyền theo role `admin`, `customer`, `staff`.
- Upload ảnh bằng `multer`, xử lý ảnh bằng `sharp`, phục vụ file qua `/uploads`.
- MySQL connection pool qua `mysql2/promise`.
- Tích hợp email bằng Nodemailer/Resend.
- Webhook SePay để xác nhận chuyển khoản, cập nhật booking, điểm loyalty và lượt dùng voucher.
- Tự động cập nhật trạng thái phòng theo booking đã xác nhận.

## Công nghệ

- Backend: Node.js, Express 5, MySQL, JWT, bcrypt, multer, sharp, nodemailer, Resend.
- Mobile: Flutter, Dart, BLoC, HTTP, SharedPreferences, flutter_dotenv, cached_network_image, qr_flutter, table_calendar.
- Admin web: React 19, TypeScript, Vite, React Router, Tailwind CSS, Recharts, SweetAlert2, lucide-react.
- Database: MySQL.

## Cấu trúc thư mục

```text
.
├── backend_resort_app/
│   ├── index.js
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middlewares/
│       ├── routes/
│       ├── services/
│       └── utils/
├── resort_app/
│   ├── lib/
│   │   ├── core/
│   │   └── features/
│   └── assets/
├── admin_web_page/
│   └── src/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       └── utils/
├── Query_create_DB.sql
├── Query_DB_advance.sql
└── data.sql
```

## Yêu cầu môi trường

- Node.js và npm.
- Flutter SDK `>= 3.5.1`.
- MySQL server.
- Một SMTP account nếu muốn gửi OTP/email thật (đăng ký qua google).
- SePay webhook/API key nếu muốn xác nhận thanh toán tự động.

## Chạy backend

```bash
cd backend_resort_app
cp .env.example .env
npm install
npm run dev
```

File `.env` backend:

```env
PORT=3000
BASE_URL=http://localhost:3000
CLOUDINARY_BASE_URL=

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resort_db

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

OTP_EXPIRE_MINUTES=5
SEPAY_API_KEY=your_super_secret_sepay_key
```

Kiểm tra server:

```bash
curl http://localhost:3000/api/health
```

## Chạy admin web

```bash
cd admin_web_page
cp .env.example .env
npm install
npm run dev
```

File `.env` admin:

```env
VITE_API_URL=http://localhost:3000/api
VITE_CLOUDINARY_BASE_URL=
```

Mặc định Vite sẽ mở ở `http://localhost:5173`.

## Chạy Flutter app

```bash
cd resort_app
cp .env.example .env
flutter pub get
flutter run
```

File `.env` Flutter:

```env
API_URL=http://localhost:3000/api
SERVER_URL=http://localhost:3000
CLOUDINARY_BASE_URL=
```

Khi chạy trên Android emulator, nếu backend chạy ở máy host, thường cần đổi thành:

```env
API_URL=http://10.0.2.2:3000/api
SERVER_URL=http://10.0.2.2:3000
```

Khi chạy trên thiết bị thật, dùng IP LAN hoặc public URL/ngrok của máy chạy backend.

## API chính

| Nhóm | Endpoint |
| --- | --- |
| Health | `GET /api/health` |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/admin-login`, `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `GET /api/auth/me`, `PUT /api/auth/me` |
| Home | `GET /api/home` |
| Rooms | `GET /api/rooms`, `GET /api/rooms/search`, `GET /api/rooms/filter-meta`, `GET /api/rooms/:id`, `GET /api/rooms/:id/detail` |
| Room admin | `POST /api/rooms`, `PUT /api/rooms/:id`, `DELETE /api/rooms/:id`, `GET /api/rooms/:roomId/instances`, `POST /api/rooms/instances`, `PUT /api/rooms/instances/:id`, `DELETE /api/rooms/instances/:id` |
| Zones | `GET /api/zones`, `GET /api/zones/:id`, `POST /api/zones`, `PUT /api/zones/:id`, `DELETE /api/zones/:id` |
| Categories | `GET /api/categories`, `POST /api/categories`, `PUT /api/categories/:id`, `DELETE /api/categories/:id` |
| Amenities | `GET /api/amenities`, `GET /api/amenities/:id`, `POST /api/amenities`, `PUT /api/amenities/:id`, `DELETE /api/amenities/:id` |
| Services | `GET /api/services`, `GET /api/services/:id`, `POST /api/services`, `PUT /api/services/:id`, `DELETE /api/services/:id` |
| Vouchers | `GET /api/vouchers`, `GET /api/vouchers/:id`, `POST /api/vouchers`, `PUT /api/vouchers/:id`, `DELETE /api/vouchers/:id`, `POST /api/vouchers/validate` |
| Payments | `POST /api/payments/create`, `POST /api/payments/expire`, `GET /api/payments/status/:paymentId`, `GET /api/payments/history/:userId`, `POST /api/payments/webhook/sepay` |
| Payment admin | `GET /api/payments/admin/all`, `PUT /api/payments/admin/update-status/:id` |
| Bookings | `GET /api/bookings/user/:userId`, `GET /api/bookings/detail/:bookingCode` |
| Booking admin | `GET /api/bookings/admin/all`, `PUT /api/bookings/admin/update-status/:id` |
| Dashboard | `GET /api/dashboard/overview` |
| Users admin | `GET /api/users`, `POST /api/users`, `PUT /api/users/:id` |

Các route admin cần header:

```http
Authorization: Bearer <jwt_token>
```

## Luồng nghiệp vụ đặt phòng/thanh toán

1. Khách tìm phòng bằng `/api/rooms/search`.
2. Khách xem chi tiết phòng bằng `/api/rooms/:id/detail`.
3. App gửi booking và payment qua `POST /api/payments/create`.
4. Backend tạo `Bookings`, `Booking_Rooms` hoặc `Booking_Services`, sau đó tạo `Payments` trạng thái `pending`.
5. Khách thanh toán chuyển khoản/QR theo `bookingCode`.
6. SePay gọi `POST /api/payments/webhook/sepay`.
7. Backend kiểm tra mã đơn, số tiền, hạn thanh toán; nếu hợp lệ sẽ cập nhật payment `success`, booking `Confirmed`, cộng loyalty points, tăng lượt dùng voucher và cập nhật trạng thái phòng.

## Upload và ảnh

- Backend lưu ảnh dưới thư mục `uploads` và public qua `http://<server>/uploads/...`.
- `CLOUDINARY_BASE_URL` hoặc `VITE_CLOUDINARY_BASE_URL` có thể dùng để rewrite các đường dẫn `/uploads/...` sang Cloudinary delivery URL.
- Flutter có helper `ApiService.fixImageUrl()` để chuyển `localhost` sang `SERVER_URL` phù hợp thiết bị.

## Lệnh hữu ích

Backend:

```bash
cd backend_resort_app
npm run dev
npm start
```

Admin web:

```bash
cd admin_web_page
npm run dev
npm run build
npm run lint
npm run preview
```

Flutter:

```bash
cd resort_app
flutter pub get
flutter analyze
flutter test
flutter run
```

## Checklist triển khai

- Tạo database và import schema/data.
- Tạo `.env` cho backend, admin web và Flutter app.
- Sửa/đồng bộ `auth.controller.js` với auth routes hiện tại.
- Tạo tài khoản admin trong bảng `Users` với `role = 'admin'`.
- Cấu hình SMTP/Resend nếu dùng OTP/email.
- Cấu hình webhook SePay trỏ về `/api/payments/webhook/sepay`.
- Đảm bảo thư mục `backend_resort_app/uploads` tồn tại và được phép ghi.
- Với mobile app, dùng `SERVER_URL` truy cập được từ emulator/thiết bị thật.

