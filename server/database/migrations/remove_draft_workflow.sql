-- Migrate existing draft orders to pending
UPDATE orders SET workflow_status = 'pending' WHERE workflow_status = 'draft';

-- Change the column default to pending
ALTER TABLE orders
  MODIFY COLUMN workflow_status ENUM(
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
  ) DEFAULT 'pending' NOT NULL;
