-- Web Push subscriptions for portal clients
CREATE TABLE IF NOT EXISTS portal_push_subscriptions (
  id         INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  client_id  INT          NOT NULL,
  endpoint   TEXT         NOT NULL,
  p256dh     TEXT         NOT NULL,
  auth       VARCHAR(255) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pps_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE KEY uq_pps_endpoint (client_id, endpoint(500))
);
