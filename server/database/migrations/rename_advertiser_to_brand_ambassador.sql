-- ============================================================
-- Phase A of the Client/Advertiser terminology rename.
-- Renames today's "Advertiser" (the person paid to post WhatsApp
-- statuses) to "Brand Ambassador", freeing up every "advertiser"
-- identifier for Phase B (Client -> Advertiser).
-- Not idempotent — run once.
-- ============================================================

RENAME TABLE `advertisers` TO `brand_ambassadors`;
ALTER TABLE `brand_ambassadors` CHANGE COLUMN `advertiser_ref_no` `brand_ambassador_ref_no` VARCHAR(50) DEFAULT NULL;

RENAME TABLE `campaign_advertisers` TO `campaign_brand_ambassadors`;
ALTER TABLE `campaign_brand_ambassadors` CHANGE COLUMN `advertiser_id` `brand_ambassador_id` INT NOT NULL;

ALTER TABLE `campaign_proofs` CHANGE COLUMN `advertiser_id` `brand_ambassador_id` INT NOT NULL;
ALTER TABLE `salaries` CHANGE COLUMN `advertiser_id` `brand_ambassador_id` INT NOT NULL;

RENAME TABLE `advertiser_config` TO `brand_ambassador_config`;
ALTER TABLE `brand_ambassador_config` CHANGE COLUMN `advertiser_pay_percentage` `brand_ambassador_pay_percentage` DECIMAL(5,2) NOT NULL DEFAULT '0.00';

-- audience enums: widen, migrate data, narrow (drops the now-unused 'advertiser' value)
ALTER TABLE `notifications` MODIFY COLUMN `audience` ENUM('advertiser','client','mis','brand_ambassador') NOT NULL;
UPDATE `notifications` SET `audience`='brand_ambassador' WHERE `audience`='advertiser';
ALTER TABLE `notifications` MODIFY COLUMN `audience` ENUM('client','mis','brand_ambassador') NOT NULL;

ALTER TABLE `notification_preferences` MODIFY COLUMN `audience` ENUM('advertiser','client','mis','brand_ambassador') NOT NULL;
UPDATE `notification_preferences` SET `audience`='brand_ambassador' WHERE `audience`='advertiser';
ALTER TABLE `notification_preferences` MODIFY COLUMN `audience` ENUM('client','mis','brand_ambassador') NOT NULL;

ALTER TABLE `email_verification_codes` MODIFY COLUMN `audience` ENUM('advertiser','client','brand_ambassador') NOT NULL;
UPDATE `email_verification_codes` SET `audience`='brand_ambassador' WHERE `audience`='advertiser';
ALTER TABLE `email_verification_codes` MODIFY COLUMN `audience` ENUM('client','brand_ambassador') NOT NULL;

-- workflow_history.entity_type is a free-text column, not an enum — data only
UPDATE `workflow_history` SET `entity_type`='brand_ambassador' WHERE `entity_type`='advertiser';

-- process_types / ref_numbering — only this one row changes meaning/prefix
UPDATE `process_types` SET `process_type_name`='brand_ambassador_registration', `description`='Brand Ambassador Registration', `data_table`='brand_ambassadors' WHERE `id`=12;
UPDATE `ref_numbering` SET `prefix`='BAM' WHERE `process_type_id`=12;

-- menus: rename + un-nest so it isn't left sitting under the soon-to-be-renamed "Clients" group
UPDATE `menus` SET `menu_name`='Brand Ambassadors', `view_path`='/brand-ambassadors', `parent_menu_id`=NULL WHERE `id`=34;

-- workflow label
UPDATE `workflows` SET `workflow_name`='Brand Ambassador Registration Approval' WHERE `id`=3;
