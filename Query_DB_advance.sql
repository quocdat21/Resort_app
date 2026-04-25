-- =========================================
-- 1. USERS
-- =========================================
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','customer','staff') DEFAULT 'customer',
  is_verified TINYINT(1) DEFAULT 0,
  date_of_birth DATE,
  gender ENUM('Male','Female','Other'),
  address TEXT,
  avatar_url VARCHAR(255),
  loyalty_points INT DEFAULT 0,
  total_stays INT DEFAULT 0,
  status ENUM('active','inactive','banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- 2. OTP
-- =========================================
CREATE TABLE OTP_Verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  email VARCHAR(100) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  type ENUM('register','login','reset_password') DEFAULT 'register',
  expired_at DATETIME NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (email),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- =========================================
-- 3. ZONES (Resort / Hotel / Tower)
-- =========================================
CREATE TABLE Zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name ENUM('Resort','Hotel','Tower') NOT NULL
);

-- =========================================
-- 4. CATEGORIES (Khu: Đồi Cọ, Trung tâm,...)
-- =========================================
CREATE TABLE Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_id INT,
  name VARCHAR(100),
  FOREIGN KEY (zone_id) REFERENCES Zones(id) ON DELETE SET NULL
);

-- =========================================
-- 5. ROOM TYPES (LOẠI PHÒNG)
-- =========================================
CREATE TABLE Room_Types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  size_sqm INT,
  capacity_adults INT DEFAULT 2,
  capacity_children INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

-- =========================================
-- 6. ROOMS (PHÒNG THỰC TẾ)
-- =========================================
CREATE TABLE Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT,
  room_number VARCHAR(20) UNIQUE,
  status ENUM('Available','Occupied','Maintenance') DEFAULT 'Available',
  FOREIGN KEY (room_type_id) REFERENCES Room_Types(id) ON DELETE CASCADE
);

-- =========================================
-- 7. ROOM IMAGES
-- =========================================
CREATE TABLE Room_Images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT,
  image_url VARCHAR(255),
  FOREIGN KEY (room_type_id) REFERENCES Room_Types(id) ON DELETE CASCADE
);

-- =========================================
-- 8. AMENITIES
-- =========================================
CREATE TABLE Amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  icon_url VARCHAR(255)
);

CREATE TABLE Room_Amenities (
  room_type_id INT,
  amenity_id INT,
  PRIMARY KEY (room_type_id, amenity_id),
  FOREIGN KEY (room_type_id) REFERENCES Room_Types(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES Amenities(id) ON DELETE CASCADE
);

-- =========================================
-- 9. ROOM RATES (GIÁ THEO THỜI GIAN)
-- =========================================
CREATE TABLE Room_Rates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_type_id INT,
  start_date DATE,
  end_date DATE,
  day_type ENUM('Weekday','Weekend','Holiday'),
  package_type ENUM('Breakfast','Halfboard'),
  price DECIMAL(15,0) NOT NULL,
  FOREIGN KEY (room_type_id) REFERENCES Room_Types(id) ON DELETE CASCADE
);

CREATE TABLE Holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  holiday_name VARCHAR(100),
  start_date DATE,
  end_date DATE
);

-- =========================================
-- 10. SERVICES
-- =========================================
CREATE TABLE Services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('Hall','Food','Event','Other'),
  name VARCHAR(255),
  capacity INT,
  price_full_day DECIMAL(15,0),
  price_half_day DECIMAL(15,0),
  base_price DECIMAL(15,0),
  price_unit VARCHAR(50),
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 11. BOOKINGS
-- =========================================
CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  user_id INT,
  room_id INT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  package_type ENUM('Breakfast','Halfboard') DEFAULT 'Breakfast',
  adults_count INT DEFAULT 1,
  children_under_6 INT DEFAULT 0,
  children_6_12 INT DEFAULT 0,
  extra_bed_count INT DEFAULT 0,
  room_price_total DECIMAL(15,0),
  surcharge_total DECIMAL(15,0) DEFAULT 0,
  service_price_total DECIMAL(15,0) DEFAULT 0,
  vat_amount DECIMAL(15,0) DEFAULT 0,
  discount_amount DECIMAL(15,0) DEFAULT 0,
  total_amount DECIMAL(15,0),
  status ENUM('Pending','Confirmed','Cancelled','Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);

-- =========================================
-- 12. BOOKING DETAILS (GIÁ TỪNG NGÀY)
-- =========================================
CREATE TABLE Booking_Details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  date DATE,
  price DECIMAL(15,0),
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE
);

-- =========================================
-- 13. BOOKING SERVICES
-- =========================================
CREATE TABLE Booking_Services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  service_id INT,
  quantity INT DEFAULT 1,
  price DECIMAL(15,0),
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- =========================================
-- 14. PAYMENTS
-- =========================================
CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NULL,
  payment_method ENUM('Credit Card','E-Wallet','Bank Transfer'),
  transaction_id VARCHAR(100),
  amount DECIMAL(15,0),
  status ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE
);

-- =========================================
-- 15. REVIEWS
-- =========================================
CREATE TABLE Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  user_id INT,
  room_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);

-- =========================================
-- 16. VOUCHERS
-- =========================================
CREATE TABLE Vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage','fixed') NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount DECIMAL(15,0) DEFAULT NULL,
  min_order_value DECIMAL(15,0) DEFAULT 0,
  usage_limit INT DEFAULT NULL,
  used_count INT DEFAULT 0,
  start_date DATETIME,
  end_date DATETIME,
  status ENUM('active','inactive','expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE Bookings
ADD voucher_id INT NULL,
ADD FOREIGN KEY (voucher_id) REFERENCES Vouchers(id) ON DELETE SET NULL;

-- =========================================
-- 17. USER VOUCHERS
-- =========================================
CREATE TABLE User_Vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  voucher_id INT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, voucher_id),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES Vouchers(id) ON DELETE CASCADE
);

-- =========================================
-- 18. NOTIFICATIONS
-- =========================================
CREATE TABLE Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
