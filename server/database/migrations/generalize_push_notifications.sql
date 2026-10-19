-- Every in-app notification can now also trigger a web push, independently
-- toggled per notification type (mirrors the existing `enabled` opt-out model).
ALTER TABLE notification_preferences ADD COLUMN push_enabled TINYINT(1) NOT NULL DEFAULT 1 AFTER enabled;

-- Push subscriptions were advertiser-portal-only (advertiser_id FK). Generalize
-- to the same (audience, recipient_id) pattern the rest of the notification
-- system already uses, so brand ambassadors and MIS staff can subscribe too.
ALTER TABLE portal_push_subscriptions DROP FOREIGN KEY fk_pps_client;
ALTER TABLE portal_push_subscriptions CHANGE COLUMN advertiser_id recipient_id INT NOT NULL;
ALTER TABLE portal_push_subscriptions ADD COLUMN audience ENUM('mis','brand_ambassador','advertiser') NOT NULL DEFAULT 'advertiser' AFTER recipient_id;
ALTER TABLE portal_push_subscriptions DROP INDEX idx_pps_client;
ALTER TABLE portal_push_subscriptions ADD INDEX idx_push_sub_recipient (audience, recipient_id);
RENAME TABLE portal_push_subscriptions TO push_subscriptions;
