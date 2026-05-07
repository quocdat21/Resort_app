-- USERS
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

-- OTP
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
-- ZONES
CREATE TABLE Zones ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );

-- CATEGORIES
CREATE TABLE Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  zone_id INT,
  name VARCHAR(50),
  icon_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (zone_id) REFERENCES Zones(id) ON DELETE SET NULL
);

-- ROOMS
CREATE TABLE Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name VARCHAR(255),
  description TEXT,
  size_sqm INT,
  capacity_adults INT DEFAULT 2,
  capacity_children INT DEFAULT 0,
  base_price DECIMAL(15,0) NOT NULL,
  auto_checkin TINYINT(1) DEFAULT 0,
  auto_checkout TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
);

CREATE TABLE Room_Numbers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  room_number VARCHAR(20) NOT NULL,
  status ENUM('Available','Maintenance','Hidden','Occupied','Booked') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (room_id, room_number),
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);


-- ROOM IMAGES
CREATE TABLE Room_Images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT,
  image_url VARCHAR(255),
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);

-- AMENITIES
CREATE TABLE Amenities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  icon_url VARCHAR(255)
);

-- ROOM AMENITIES
CREATE TABLE Room_Amenities (
  room_id INT,
  amenity_id INT,
  PRIMARY KEY (room_id, amenity_id),
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (amenity_id) REFERENCES Amenities(id) ON DELETE CASCADE
);

-- SERVICES
CREATE TABLE Services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('Hall','Food','Event','Other'),
  name VARCHAR(255),
  capacity INT,
  description TEXT,
  image_url VARCHAR(255),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- SERVICE PRICES
CREATE TABLE ServicePrices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT,
  price_type ENUM('full_day','half_day','unit'),
  price DECIMAL(15,0),
  unit VARCHAR(50),
  description TEXT,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);
-- SERVICE IMAGES
CREATE TABLE Service_Images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT,
  image_url VARCHAR(255),
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- VOUCHERS
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

-- USER VOUCHERS
CREATE TABLE User_Vouchers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  voucher_id INT,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, voucher_id),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES Vouchers(id) ON DELETE CASCADE
);

-- BOOKINGS
CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  user_id INT,
  type ENUM('room','service') DEFAULT 'room',
  check_in DATE NULL,
  check_out DATE NULL,
  service_booking_date DATE NULL,
  adults INT DEFAULT 0,
  children INT DEFAULT 0,
  total_amount DECIMAL(15,0),
  tax_amount DECIMAL(15,0) DEFAULT 0,
  extra_fee DECIMAL(15,0) DEFAULT 0,
  voucher_id INT NULL,
  discount_amount DECIMAL(15,0) DEFAULT 0,
  status ENUM('Pending','Confirmed','Cancelled','Completed','Refund_Requested','Refunded') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (voucher_id) REFERENCES Vouchers(id) ON DELETE SET NULL
);


CREATE TABLE Booking_Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  room_number_id INT,
  price DECIMAL(15,0),
  nights INT,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (room_number_id) REFERENCES Room_Numbers(id) ON DELETE CASCADE
);


-- BOOKING SERVICES
CREATE TABLE Booking_Services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  service_id INT,
  price_type VARCHAR(50),
  unit VARCHAR(50),
  quantity INT DEFAULT 1,
  price DECIMAL(15,0),
  total_price DECIMAL(15,0),
  service_date DATE NULL,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- PAYMENTS
CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  order_code VARCHAR(50) UNIQUE NOT NULL,
  payment_method ENUM('BANK_TRANSFER','VNPAY','CREDIT_CARD','CASH') DEFAULT 'BANK_TRANSFER',
  transaction_id VARCHAR(100),
  amount DECIMAL(15,0) NOT NULL,
  currency VARCHAR(10) DEFAULT 'VND',
  description TEXT,
  status ENUM('pending','success','failed','cancelled','expired','refunded') DEFAULT 'pending',
  payment_url TEXT,
  signature VARCHAR(255),
  raw_data JSON,
  expired_at DATETIME,
  payment_date TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE
);
-- REFUNDS
CREATE TABLE Refunds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  payment_id INT NOT NULL,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  refund_amount DECIMAL(15,0) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  bank_account_number VARCHAR(50) NOT NULL,
  bank_account_name VARCHAR(100),
  status ENUM('requested','approved','processing','completed','rejected') DEFAULT 'requested',
  admin_id INT NULL,
  admin_note TEXT,
  sepay_transaction_id VARCHAR(100),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (payment_id) REFERENCES Payments(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES Users(id) ON DELETE SET NULL
);

-- REVIEWS
CREATE TABLE Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  user_id INT,
  room_number_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (booking_id, room_number_id),
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_number_id) REFERENCES Room_Numbers(id) ON DELETE CASCADE
);


-- SERVICE REVIEWS
CREATE TABLE Service_Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  booking_service_id INT,
  service_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (booking_service_id),
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_service_id) REFERENCES Booking_Services(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- NOTIFICATIONS
CREATE TABLE Notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  title VARCHAR(255),
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
