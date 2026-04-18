--SET FOREIGN_KEY_CHECKS = 0;
--
--DROP TABLE IF EXISTS Notifications;
--DROP TABLE IF EXISTS Service_Reviews;
--DROP TABLE IF EXISTS Reviews;
--DROP TABLE IF EXISTS Payments;
--DROP TABLE IF EXISTS Service_Bookings;
--DROP TABLE IF EXISTS Booking_Services;
--DROP TABLE IF EXISTS Bookings;
--DROP TABLE IF EXISTS Services;
--DROP TABLE IF EXISTS Room_Amenities;
--DROP TABLE IF EXISTS Amenities;
--DROP TABLE IF EXISTS Room_Images;
--DROP TABLE IF EXISTS Rooms;
--DROP TABLE IF EXISTS Categories;
--DROP TABLE IF EXISTS Users;
--
--SET FOREIGN_KEY_CHECKS = 1;
--
-- USERS
CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone_number VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','customer','staff') DEFAULT 'customer',
  language_preference ENUM('vi','en') DEFAULT 'vi',
  date_of_birth DATE,
  gender ENUM('Male','Female','Other'),
  address TEXT,
  avatar_url VARCHAR(255),
  loyalty_points INT DEFAULT 0,
  total_stays INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE Categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(50),
  name_vi VARCHAR(50),
  icon_url VARCHAR(255)
);

-- ROOMS
CREATE TABLE Rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT,
  name_en VARCHAR(255),
  name_vi VARCHAR(255),
  description_en TEXT,
  description_vi TEXT,
  size_sqm INT,
  capacity_adults INT DEFAULT 2,
  capacity_children INT DEFAULT 0,
  base_price DECIMAL(15,0) NOT NULL,
  status ENUM('Available','Maintenance','Hidden') DEFAULT 'Available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE SET NULL
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
  name_en VARCHAR(100),
  name_vi VARCHAR(100),
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
  name_en VARCHAR(255),
  name_vi VARCHAR(255),
  capacity INT,
  price_full_day DECIMAL(15,0),
  price_half_day DECIMAL(15,0),
  base_price DECIMAL(15,0),
  price_unit_vi VARCHAR(50),
  price_unit_en VARCHAR(50),
  description_vi TEXT,
  description_en TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS
CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  user_id INT,
  room_id INT,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  room_price DECIMAL(15,0),
  service_price DECIMAL(15,0) DEFAULT 0,
  total_amount DECIMAL(15,0),
  status ENUM('Pending','Confirmed','Cancelled','Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);

-- BOOKING SERVICES
CREATE TABLE Booking_Services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  service_id INT,
  quantity INT DEFAULT 1,
  price DECIMAL(15,0),
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- SERVICE BOOKINGS
CREATE TABLE Service_Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE,
  user_id INT,
  service_id INT,
  booking_date DATE NOT NULL,
  quantity INT DEFAULT 1,
  total_amount DECIMAL(15,0),
  status ENUM('Pending','Confirmed','Cancelled','Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- PAYMENTS
CREATE TABLE Payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NULL,
  service_booking_id INT NULL,
  payment_method ENUM('Credit Card','E-Wallet','Bank Transfer'),
  transaction_id VARCHAR(100),
  amount DECIMAL(15,0),
  status ENUM('Pending','Paid','Failed','Refunded') DEFAULT 'Pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (service_booking_id) REFERENCES Service_Bookings(id) ON DELETE CASCADE
);

-- REVIEWS
CREATE TABLE Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT,
  user_id INT,
  room_id INT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES Rooms(id) ON DELETE CASCADE
);

-- SERVICE REVIEWS
CREATE TABLE Service_Reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_booking_id INT,
  user_id INT,
  service_id INT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_booking_id) REFERENCES Service_Bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
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
