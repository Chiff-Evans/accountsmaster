-- ============================================================
-- Finance-management transform, step 1: Advertisers -> Members.
-- Renames the "Advertiser" stake-holder (and every table/column/enum
-- that points at it) to "Member", adds the member-registration fields
-- (position, ID number, reg date, reg fee, other details), and removes
-- both Ambassador menus.
-- Backup taken first: backups/accountsmaster_pre_members_2026-10-19.sql
-- Not idempotent — run once.
-- ============================================================

RENAME TABLE `advertisers` TO `members`;
ALTER TABLE `members`
  RENAME COLUMN `advertiser_ref_no`  TO `member_ref_no`,
  RENAME COLUMN `advertiser_type_id` TO `member_type_id`,
  RENAME COLUMN `advertiser_name`    TO `member_name`;

-- member-registration fields; position_id is a value of the
-- "Positions" parameter (text_id 'parties-positions')
ALTER TABLE `members`
  ADD COLUMN `position_id`   INT           DEFAULT NULL AFTER `member_name`,
  ADD COLUMN `id_number`     VARCHAR(50)   DEFAULT NULL AFTER `position_id`,
  ADD COLUMN `reg_date`      DATE          DEFAULT NULL AFTER `email`,
  ADD COLUMN `reg_fee`       DECIMAL(12,2) DEFAULT NULL AFTER `reg_date`,
  ADD COLUMN `other_details` TEXT          DEFAULT NULL AFTER `reg_fee`,
  ADD KEY `FK_members_position` (`position_id`),
  ADD CONSTRAINT `FK_members_position` FOREIGN KEY (`position_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL;

ALTER TABLE `campaigns`      RENAME COLUMN `advertiser_id` TO `member_id`;
ALTER TABLE `payments`       RENAME COLUMN `advertiser_id` TO `member_id`;
ALTER TABLE `loyalty_points` RENAME COLUMN `advertiser_id` TO `member_id`;
ALTER TABLE `orders`         RENAME COLUMN `advertiser_id` TO `member_id`;

-- audience enums: widen, migrate data, narrow (drops the now-unused 'advertiser' value)
ALTER TABLE `notifications` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','advertiser','member') NOT NULL;
UPDATE `notifications` SET `audience`='member' WHERE `audience`='advertiser';
ALTER TABLE `notifications` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','member') NOT NULL;

ALTER TABLE `notification_preferences` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','advertiser','member') NOT NULL;
UPDATE `notification_preferences` SET `audience`='member' WHERE `audience`='advertiser';
ALTER TABLE `notification_preferences` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','member') NOT NULL;

ALTER TABLE `email_verification_codes` MODIFY COLUMN `audience` ENUM('brand_ambassador','advertiser','member') NOT NULL;
UPDATE `email_verification_codes` SET `audience`='member' WHERE `audience`='advertiser';
ALTER TABLE `email_verification_codes` MODIFY COLUMN `audience` ENUM('brand_ambassador','member') NOT NULL;

ALTER TABLE `push_subscriptions` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','advertiser','member') NOT NULL DEFAULT 'member';
UPDATE `push_subscriptions` SET `audience`='member' WHERE `audience`='advertiser';
ALTER TABLE `push_subscriptions` MODIFY COLUMN `audience` ENUM('mis','brand_ambassador','member') NOT NULL DEFAULT 'member';

-- free-text columns — data only
UPDATE `workflow_history` SET `entity_type`='member' WHERE `entity_type`='advertiser';
UPDATE `notifications` SET `type`='member_registered' WHERE `type`='advertiser_registered';
UPDATE `notification_preferences` SET `type`='member_registered' WHERE `type`='advertiser_registered';
UPDATE `dashboard_visibility` SET `section_key`='stat_members' WHERE `section_key`='stat_advertisers';

-- process_types / ref_numbering
UPDATE `process_types` SET `process_type_name`='member_registration', `description`='Member Registration', `data_table`='members' WHERE `id`=2;
UPDATE `ref_numbering` SET `prefix`='MEM' WHERE `process_type_id`=2;

-- workflow label + per-stage portal-edit flag
UPDATE `workflows` SET `workflow_name`='Member Registration Approval', `description`='Approval flow for new member registrations' WHERE `id`=2;
ALTER TABLE `workflow_stages` RENAME COLUMN `advertiser_can_edit` TO `member_can_edit`;

-- menus: Stake-Holders > Advertisers becomes Members
UPDATE `menus` SET `description`='Member management' WHERE `id`=16;
UPDATE `menus` SET `menu_name`='Members', `view_path`='/members', `description`='Manage members' WHERE `id`=17;

-- menus: remove both Ambassador menus (Stake-Holders > Ambassadors, Configurations > Ambassadors)
DELETE FROM `role_menu_access` WHERE `menu_id` IN (34, 36);
DELETE FROM `menus` WHERE `id` IN (34, 36);
