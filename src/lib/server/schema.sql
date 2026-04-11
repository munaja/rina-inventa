-- Auth tables
CREATE TABLE IF NOT EXISTS `user` (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `session` (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  expiresAt DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES `user`(id) ON DELETE CASCADE
);

-- Source (master) tables
CREATE TABLE IF NOT EXISTS land (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  area VARCHAR(50) NULL,
  address VARCHAR(255) NULL,
  subDistrict VARCHAR(100) NULL,
  rightStatus VARCHAR(100) NULL,
  certificateNumber VARCHAR(100) NULL,
  certificateDate VARCHAR(50) NULL,
  `usage` VARCHAR(255) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL
);

CREATE TABLE IF NOT EXISTS toolMachine (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  brandType VARCHAR(100) NULL,
  sizeCC VARCHAR(50) NULL,
  material VARCHAR(100) NULL,
  color VARCHAR(50) NULL,
  factoryNumber VARCHAR(100) NULL,
  frameNumber VARCHAR(100) NULL,
  engineNumber VARCHAR(100) NULL,
  policeNumber VARCHAR(50) NULL,
  vehicleRegNumber VARCHAR(100) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL
);

CREATE TABLE IF NOT EXISTS toolSoftware (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  vendor VARCHAR(100) NULL,
  `usage` VARCHAR(255) NULL,
  specification TEXT NULL,
  remarks TEXT NULL
);

CREATE TABLE IF NOT EXISTS building (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  `condition` VARCHAR(50) NULL,
  concrete VARCHAR(50) NULL,
  floorCount VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  subDistrict VARCHAR(100) NULL,
  floorArea VARCHAR(50) NULL,
  documentName VARCHAR(255) NULL,
  documentNumber VARCHAR(100) NULL,
  documentDate VARCHAR(50) NULL,
  land_code VARCHAR(100) NULL,
  landArea VARCHAR(50) NULL,
  remarks TEXT NULL,
  FOREIGN KEY (land_code) REFERENCES land(code) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS road (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  title VARCHAR(255) NULL,
  specification TEXT NULL,
  regionOfOrigin VARCHAR(100) NULL,
  creator VARCHAR(100) NULL,
  material VARCHAR(100) NULL,
  type VARCHAR(100) NULL,
  size VARCHAR(50) NULL,
  quantity VARCHAR(50) NULL,
  year VARCHAR(10) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL
);

CREATE TABLE IF NOT EXISTS permanentAsset (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  title VARCHAR(255) NULL,
  specification TEXT NULL,
  regionOfOrigin VARCHAR(100) NULL,
  creator VARCHAR(100) NULL,
  material VARCHAR(100) NULL,
  type VARCHAR(100) NULL,
  size VARCHAR(50) NULL,
  quantity VARCHAR(50) NULL,
  year VARCHAR(10) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL
);

CREATE TABLE IF NOT EXISTS construction (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  concrete VARCHAR(50) NULL,
  floorCount VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  subDistrict VARCHAR(100) NULL,
  area VARCHAR(50) NULL,
  documentName VARCHAR(255) NULL,
  documentNumber VARCHAR(100) NULL,
  documentDate VARCHAR(50) NULL,
  constructionYear VARCHAR(10) NULL,
  completionYear VARCHAR(10) NULL,
  land_code VARCHAR(100) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL,
  FOREIGN KEY (land_code) REFERENCES land(code) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS otherAsset (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  codeL VARCHAR(100) NULL,
  refCode VARCHAR(100) NULL,
  name VARCHAR(255) NULL,
  specification TEXT NULL,
  acquisitionDate VARCHAR(50) NULL,
  bookDate VARCHAR(50) NULL,
  reclassificationDate VARCHAR(50) NULL,
  quantity VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  depreciation VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS extraAsset (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  brandType VARCHAR(100) NULL,
  sizeCC VARCHAR(50) NULL,
  material VARCHAR(100) NULL,
  color VARCHAR(50) NULL,
  factoryNumber VARCHAR(100) NULL,
  frameNumber VARCHAR(100) NULL,
  engineNumber VARCHAR(100) NULL,
  policeNumber VARCHAR(50) NULL,
  vehicleRegNumber VARCHAR(100) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL
);

CREATE TABLE IF NOT EXISTS room (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NULL UNIQUE,
  building_code VARCHAR(100) NULL,
  name VARCHAR(100) NOT NULL,
  space VARCHAR(20) NULL,
  UNIQUE KEY uniq_building_name (building_code, name),
  FOREIGN KEY (building_code) REFERENCES building(code) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS unit (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL
);

-- Transaction tables
CREATE TABLE IF NOT EXISTS inspection (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  date DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS toolMachineInspection (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inspection_id INT UNSIGNED NULL,
  room_id INT UNSIGNED NULL,
  imgUrl VARCHAR(255) NULL,
  toolMachine_code VARCHAR(100) NULL,
  bookDate VARCHAR(50) NULL,
  acquisitionDate VARCHAR(50) NULL,
  acquisitionValue VARCHAR(50) NULL,
  description VARCHAR(255) NULL,
  brandType VARCHAR(100) NULL,
  sizeCC VARCHAR(50) NULL,
  material VARCHAR(100) NULL,
  color VARCHAR(50) NULL,
  factoryNumber VARCHAR(100) NULL,
  frameNumber VARCHAR(100) NULL,
  engineNumber VARCHAR(100) NULL,
  policeNumber VARCHAR(50) NULL,
  vehicleRegNumber VARCHAR(100) NULL,
  `condition` VARCHAR(50) NULL,
  remarks TEXT NULL,
  FOREIGN KEY (inspection_id) REFERENCES inspection(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES room(id) ON DELETE SET NULL,
  FOREIGN KEY (toolMachine_code) REFERENCES toolMachine(code) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Seed admin user (password: admin123)
INSERT IGNORE INTO `user` (username, password, role) VALUES
  ('admin', '$2b$10$.02V4J67e.3HQ/X2f7ck3uM0Kq0Lzu5LP/ad6hwP1YQoKrxyMQT5S', 'admin');
