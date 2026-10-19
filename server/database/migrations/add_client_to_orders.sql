-- Allow an order to be placed directly for an individual client (no shop),
-- e.g. a personal/home delivery order rather than a shop restock order.
ALTER TABLE orders
  ADD COLUMN client_id INT NULL AFTER shop_id,
  ADD CONSTRAINT fk_orders_client
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
