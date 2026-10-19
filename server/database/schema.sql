-- ============================================================
-- Venture Brite - Database Schema
-- Database: venturebrite
-- ============================================================
CREATE DATABASE IF NOT EXISTS venturebrite CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE venturebrite;
-- ------------------------------------------------------------
-- Business Configuration
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business (
  id INT PRIMARY KEY AUTO_INCREMENT,
  business_name VARCHAR(200) NOT NULL,
  owner_name VARCHAR(200),
  email VARCHAR(200),
  phone VARCHAR(50),
  location TEXT,
  logo VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- Menus (self-referencing hierarchy)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS menus (
  id INT PRIMARY KEY AUTO_INCREMENT,
  menu_name VARCHAR(100) NOT NULL,
  parent_menu_id INT NULL,
  level INT DEFAULT 1,
  view_path VARCHAR(200),
  menu_order INT DEFAULT 0,
  icon VARCHAR(100),
  description TEXT,
  is_visible TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_menu_id) REFERENCES menus(id) ON DELETE
  SET NULL
);
-- ------------------------------------------------------------
-- Roles / Groups
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- Role → Menu Access Rights
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_menu_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  menu_id INT NOT NULL,
  can_view TINYINT(1) DEFAULT 0,
  can_create TINYINT(1) DEFAULT 0,
  can_edit TINYINT(1) DEFAULT 0,
  can_delete TINYINT(1) DEFAULT 0,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE CASCADE,
  UNIQUE KEY uq_role_menu (role_id, menu_id)
);
-- ------------------------------------------------------------
-- Process Types
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS process_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  process_type_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  data_table VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- Reference Numbering Configuration
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ref_numbering (
  id INT PRIMARY KEY AUTO_INCREMENT,
  process_type_id INT NOT NULL,
  prefix VARCHAR(20) NOT NULL,
  initial_serial INT DEFAULT 1,
  next_serial INT DEFAULT 1,
  use_year TINYINT(1) DEFAULT 0,
  padding INT DEFAULT 4,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (process_type_id) REFERENCES process_types(id) ON DELETE CASCADE,
  UNIQUE KEY uq_process_ref (process_type_id)
);
-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_ref_no VARCHAR(50) UNIQUE,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female', 'Other'),
  phone VARCHAR(50),
  email VARCHAR(200) UNIQUE,
  profile_image VARCHAR(500),
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'locked', 'suspended', 'revoked') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- User Roles (M:M)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_role (user_id, role_id)
);
-- ------------------------------------------------------------
-- User Sessions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255),
  ip_address VARCHAR(50),
  user_agent TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- ------------------------------------------------------------
-- Categories (self-referencing for sub-categories)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) NOT NULL,
  parent_category_id INT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE
  SET NULL
);
-- ------------------------------------------------------------
-- Units of Measure
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS units (
  id INT PRIMARY KEY AUTO_INCREMENT,
  unit_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- Items Catalogue
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  item_code VARCHAR(50) UNIQUE,
  item_name VARCHAR(200) NOT NULL,
  category_id INT,
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE
  SET NULL
);
-- ------------------------------------------------------------
-- Parameters / Parameter Values (generic config lookups)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parameters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parameter_name VARCHAR(250) NOT NULL,
  text_id VARCHAR(250),
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS parameter_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  parameter_id INT,
  paramater_value VARCHAR(250),
  description TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parameter_id) REFERENCES parameters(id)
);
-- ------------------------------------------------------------
-- Clients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_ref_no VARCHAR(50) UNIQUE,
  firstname VARCHAR(100) NOT NULL,
  lastname VARCHAR(100) NOT NULL,
  gender ENUM('Male', 'Female', 'Other'),
  phone VARCHAR(50),
  email VARCHAR(200),
  profile_image VARCHAR(500),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- ------------------------------------------------------------
-- Shops (owned by clients)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shops (
  id INT PRIMARY KEY AUTO_INCREMENT,
  shop_name VARCHAR(200) NOT NULL,
  owner_id INT,
  geolocation VARCHAR(300),
  phone VARCHAR(50),
  email VARCHAR(200),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES clients(id) ON DELETE
  SET NULL
);
-- ------------------------------------------------------------
-- Orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_ref_no VARCHAR(50) UNIQUE,
  shop_id INT,
  ordered_by INT,
  workflow_status ENUM(
    'draft',
    'pending',
    'confirmed',
    'processing',
    'on_hold',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    'awaiting_payment',
    'payment_done',
    'refunded',
    'returned'
  ) DEFAULT 'draft',
  order_status ENUM('in_progress', 'done', 'cancelled', 'rejected') DEFAULT 'in_progress',
  notes TEXT,
  total_amount DECIMAL(14, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE
  SET NULL,
    FOREIGN KEY (ordered_by) REFERENCES users(id) ON DELETE
  SET NULL
);
-- ------------------------------------------------------------
-- Order Items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity DECIMAL(12, 3) NOT NULL,
  unit_id INT,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  subtotal DECIMAL(14, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id),
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE
  SET NULL
);
-- ============================================================
-- SEED DATA
-- ============================================================
-- Default role
INSERT IGNORE INTO roles (id, role_name, description)
VALUES (1, 'Super Admin', 'Full system access'),
  (2, 'Admin', 'Administrative access'),
  (3, 'Sales', 'Sales operations access'),
  (4, 'Warehouse', 'Stock and inventory access');
-- Default admin user (password: Admin@123)
INSERT IGNORE INTO users (
    id,
    user_ref_no,
    firstname,
    lastname,
    username,
    password_hash,
    status,
    email
  )
VALUES (
    1,
    'USR-0001',
    'System',
    'Admin',
    'admin',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'active',
    'admin@salesmaster.com'
  );
INSERT IGNORE INTO user_roles (user_id, role_id)
VALUES (1, 1);
-- Default menus
INSERT IGNORE INTO menus (
    id,
    menu_name,
    parent_menu_id,
    level,
    view_path,
    menu_order,
    icon,
    description,
    is_visible
  )
VALUES (
    1,
    'Dashboard',
    NULL,
    1,
    '/dashboard',
    0,
    'DashboardOutlined',
    'Main dashboard',
    1
  ),
  (
    2,
    'Configurations',
    NULL,
    1,
    NULL,
    1,
    'SettingOutlined',
    'System configurations',
    1
  ),
  (
    3,
    'Business Setup',
    2,
    2,
    '/config/business',
    0,
    'ShopOutlined',
    'Business information',
    1
  ),
  (
    4,
    'Menu Management',
    2,
    2,
    '/config/menus',
    1,
    'MenuOutlined',
    'Manage menus',
    1
  ),
  (
    5,
    'Roles & Groups',
    2,
    2,
    '/config/roles',
    2,
    'TeamOutlined',
    'Manage roles',
    1
  ),
  (
    6,
    'Process Types',
    2,
    2,
    '/config/process-types',
    3,
    'ApartmentOutlined',
    'Manage process types',
    1
  ),
  (
    7,
    'Ref Numbering',
    2,
    2,
    '/config/ref-numbering',
    4,
    'NumberOutlined',
    'Reference numbering',
    1
  ),
  (
    8,
    'User Management',
    NULL,
    1,
    NULL,
    2,
    'UserOutlined',
    'User administration',
    1
  ),
  (
    9,
    'Users',
    8,
    2,
    '/users',
    0,
    'UserAddOutlined',
    'Manage users',
    1
  ),
  (
    10,
    'Trips',
    NULL,
    1,
    NULL,
    3,
    'DatabaseOutlined',
    'Trip catalogue management',
    1
  ),
  (
    11,
    'Categories',
    10,
    2,
    '/stock/categories',
    0,
    'AppstoreOutlined',
    'Item categories',
    1
  ),
  (
    12,
    'Units of Measure',
    10,
    2,
    '/stock/units',
    1,
    'ColumnWidthOutlined',
    'Units of measure',
    1
  ),
  (
    13,
    'Trips Catalogue',
    10,
    2,
    '/stock/items',
    2,
    'TagOutlined',
    'Trips catalogue',
    1
  ),
  (
    16,
    'Client Management',
    NULL,
    1,
    NULL,
    4,
    'ContactsOutlined',
    'Client management',
    1
  ),
  (
    17,
    'Clients',
    16,
    2,
    '/clients',
    0,
    'UserOutlined',
    'Manage clients',
    1
  ),
  (
    18,
    'Shops',
    16,
    2,
    '/clients/shops',
    1,
    'ShopOutlined',
    'Manage shops',
    1
  ),
  (
    21,
    'Bookings',
    NULL,
    1,
    '/orders',
    6,
    'ShoppingCartOutlined',
    'Booking management',
    1
  ),
  (
    22,
    'Parameters',
    2,
    2,
    '/config/parameters',
    5,
    'ControlOutlined',
    'Generic configuration lookups (parameters and their values)',
    1
  );
-- Grant Super Admin access to all menus
INSERT IGNORE INTO role_menu_access (
    role_id,
    menu_id,
    can_view,
    can_create,
    can_edit,
    can_delete
  )
SELECT 1,
  id,
  1,
  1,
  1,
  1
FROM menus;
-- Default process types
INSERT IGNORE INTO process_types (id, process_type_name, description, data_table)
VALUES (
    1,
    'user_registration',
    'User registration process',
    'users'
  ),
  (
    2,
    'client_registration',
    'Client registration process',
    'clients'
  ),
  (
    4,
    'order_placement',
    'Order placement process',
    'orders'
  );
-- Default reference numbering
INSERT IGNORE INTO ref_numbering (
    process_type_id,
    prefix,
    initial_serial,
    next_serial,
    use_year,
    padding
  )
VALUES (1, 'USR', 1, 1, 0, 4),
  (2, 'CLT', 1, 1, 0, 4),
  (4, 'ORD', 1, 1, 1, 5);
-- Default parameters (generic config lookups)
INSERT IGNORE INTO parameters (id, parameter_name, text_id, description, is_active) VALUES
  (1, 'Client Statuses', 'client_statuses', '', 1),
  (2, 'Languages', 'languages', '', 1),
  (3, 'Genders/ Sex', 'genders', NULL, 1),
  (4, 'Identity Types', 'id_types', NULL, 1),
  (5, 'Occupations', 'occupations', NULL, 1),
  (6, 'Participation Statuses', 'participation_stutuses', NULL, 1),
  (7, 'Trip Statuses', 'trip_statuses', NULL, 1),
  (8, 'Currencies', 'currencies', NULL, 1),
  (9, 'Types of Expenditures', 'expenditure_types', NULL, 1),
  (10, 'Trip activities', 'trip_activities', 'Trip inclusions and exclusions', 1),
  (11, 'Client Categories', 'client_categories', NULL, 1),
  (12, 'Client Types', 'client_types', NULL, 1),
  (13, 'Onboarding Statuses', 'onboarding_statuses', NULL, 1);
-- Default units
INSERT IGNORE INTO units (unit_name, description)
VALUES ('Piece', 'Single unit'),
  ('Box', 'Box/carton'),
  ('Kg', 'Kilogram'),
  ('Litre', 'Litre'),
  ('Dozen', '12 pieces'),
  ('Pack', 'Pack/bundle');
-- Default business info
INSERT IGNORE INTO business (
    id,
    business_name,
    owner_name,
    email,
    phone,
    location
  )
VALUES (
    1,
    'My Wholesale Business',
    'Owner',
    'info@business.com',
    '+254700000000',
    'Nairobi, Kenya'
  );