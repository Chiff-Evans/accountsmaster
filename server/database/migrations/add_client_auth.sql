ALTER TABLE clients
  ADD COLUMN username VARCHAR(100) NULL UNIQUE AFTER email,
  ADD COLUMN password_hash VARCHAR(255) NULL AFTER username,
  MODIFY COLUMN status ENUM('active','inactive','locked','suspended','revoked') DEFAULT 'active';
