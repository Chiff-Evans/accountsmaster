-- Add discount column to order_receipts
ALTER TABLE order_receipts
  ADD COLUMN discount DECIMAL(12,2) NOT NULL DEFAULT 0;
