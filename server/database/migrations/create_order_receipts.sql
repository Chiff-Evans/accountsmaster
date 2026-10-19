-- Add receipt process type for ref numbering
INSERT IGNORE INTO process_types (process_type_name, description)
VALUES ('order_receipt', 'Order Receipt');
-- Add receipt ref numbering config
INSERT IGNORE INTO ref_numbering (
    process_type_id,
    prefix,
    next_serial,
    padding,
    use_year,
    use_month
  )
SELECT pt.id,
  'RCP',
  1,
  6,
  1,
  1
FROM process_types pt
WHERE pt.process_type_name = 'order_receipt';
-- Order receipts table
CREATE TABLE IF NOT EXISTS order_receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  order_id INT NOT NULL,
  payment_details VARCHAR(255) NULL,
  customer_care_no VARCHAR(50) NULL,
  tax_no VARCHAR(100) NULL,
  payment_mode VARCHAR(20) DEFAULT 'Cash',
  paid_amount DECIMAL(15, 2) NULL,
  payment_reference VARCHAR(250) NULL,
  balance DECIMAL(15, 2) NULL,
  other_conditions TEXT NULL,
  printed_at DATETIME NULL,
  printed_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by INT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (printed_by) REFERENCES users(id) ON DELETE
  SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE
  SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE
  SET NULL
);