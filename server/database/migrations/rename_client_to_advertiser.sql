-- ============================================================
-- Phase B of the Client/Advertiser terminology rename.
-- Renames today's "Client"/"Business" (the company paying for a campaign)
-- to "Advertiser" — the identifiers this claims were fully vacated by
-- Phase A (rename_advertiser_to_brand_ambassador.sql), which must run first.
-- Not idempotent — run once.
-- ============================================================

RENAME TABLE `clients` TO `advertisers`;
ALTER TABLE `advertisers`
  CHANGE COLUMN `client_ref_no` `advertiser_ref_no` VARCHAR(50) DEFAULT NULL,
  CHANGE COLUMN `client_type_id` `advertiser_type_id` INT DEFAULT NULL,
  CHANGE COLUMN `client_name` `advertiser_name` VARCHAR(250) DEFAULT NULL;

ALTER TABLE `campaigns` CHANGE COLUMN `client_id` `advertiser_id` INT NOT NULL;
ALTER TABLE `payments` CHANGE COLUMN `client_id` `advertiser_id` INT NOT NULL DEFAULT 0;
ALTER TABLE `loyalty_points` CHANGE COLUMN `client_id` `advertiser_id` INT NOT NULL;
ALTER TABLE `orders` CHANGE COLUMN `client_id` `advertiser_id` INT DEFAULT NULL;
ALTER TABLE `portal_push_subscriptions` CHANGE COLUMN `client_id` `advertiser_id` INT NOT NULL;

-- audience enums: widen, migrate data, narrow (drops the now-unused 'client' value)
ALTER TABLE `notifications` MODIFY COLUMN `audience` ENUM('client','mis','brand_ambassador','advertiser') NOT NULL;
UPDATE `notifications` SET `audience`='advertiser' WHERE `audience`='client';
ALTER TABLE `notifications` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','advertiser') NOT NULL;

ALTER TABLE `notification_preferences` MODIFY COLUMN `audience` ENUM('client','mis','brand_ambassador','advertiser') NOT NULL;
UPDATE `notification_preferences` SET `audience`='advertiser' WHERE `audience`='client';
ALTER TABLE `notification_preferences` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','advertiser') NOT NULL;

ALTER TABLE `email_verification_codes` MODIFY COLUMN `audience` ENUM('client','brand_ambassador','advertiser') NOT NULL;
UPDATE `email_verification_codes` SET `audience`='advertiser' WHERE `audience`='client';
ALTER TABLE `email_verification_codes` MODIFY COLUMN `audience` ENUM('brand_ambassador','advertiser') NOT NULL;

-- workflow_history.entity_type is a free-text column, not an enum — data only
UPDATE `workflow_history` SET `entity_type`='advertiser' WHERE `entity_type`='client';

-- notification "type" key rename (free-text column, not an enum)
UPDATE `notifications` SET `type`='advertiser_registered' WHERE `type`='client_registered';
UPDATE `notification_preferences` SET `type`='advertiser_registered' WHERE `type`='client_registered';

-- process_types / ref_numbering — only this one row changes meaning/prefix
UPDATE `process_types` SET `process_type_name`='advertiser_registration', `description`='Advertiser Registration', `data_table`='advertisers' WHERE `id`=2;
UPDATE `ref_numbering` SET `prefix`='ADV' WHERE `process_type_id`=2;

-- menus: rename the group + the child item, keep the same view_path shape
UPDATE `menus` SET `menu_name`='Advertisers' WHERE `id`=16;
UPDATE `menus` SET `menu_name`='Advertisers', `view_path`='/advertisers' WHERE `id`=17;

-- workflow label
UPDATE `workflows` SET `workflow_name`='Advertiser Registration Approval' WHERE `id`=2;

-- the per-stage "can the paying party edit from the portal" flag — same
-- concept, now attached to the renamed entity
ALTER TABLE `workflow_stages` CHANGE COLUMN `client_can_edit` `advertiser_can_edit` TINYINT(1) DEFAULT 1;
