ALTER TABLE portal_push_subscriptions
  ADD COLUMN is_active TINYINT NOT NULL DEFAULT 1 AFTER auth;
