-- ============================================================
-- Campaigns Finance Rewire + Bookings/Trips/Groups Cleanup
-- A backup was taken before running this (database/backups/).
-- This migration:
--   1. Repoints Payments (Revenue) and Expenditure from Trip -> Campaign
--      (+ client), dropping the Group/Company concept entirely.
--   2. Repoints the Loyalty Points award ledger from Booking -> Campaign.
--   3. Drops the `bookings` table + its dedicated workflow entirely.
--   4. Removes the Trips/Participants/Groups/Bookings MENU entries.
--
-- NOTE: `trips`, `shops` and `participants` tables are intentionally
-- KEPT (not dropped) — the dormant legacy `orders`/`order_items`/
-- `order_receipts` subsystem (unrelated to the Bookings feature, has
-- 0 rows, no menu, no frontend caller) still holds real FKs into
-- `trips` (order_items.item_id) and `shops` (orders.shop_id). Dropping
-- those tables would break that subsystem for no requested benefit.
-- Only the MIS/portal-facing UI + API surface for Trips/Participants/
-- Groups is removed in this pass (see accompanying code changes).
-- ============================================================

-- ------------------------------------------------------------
-- 1. Payments — Trip+Group -> Campaign+Client
-- ------------------------------------------------------------
ALTER TABLE `payments`
  DROP FOREIGN KEY `FK_paymentss_trips`,
  DROP FOREIGN KEY `FK_payments_shops`;

ALTER TABLE `payments`
  MODIFY COLUMN `trip_id` INT NULL DEFAULT NULL COMMENT 'legacy — no longer used, kept for historical rows',
  DROP COLUMN `company_id`,
  ADD COLUMN `campaign_id` INT NULL DEFAULT NULL AFTER `client_id`,
  ADD INDEX `FK_payments_campaigns` (`campaign_id`),
  ADD CONSTRAINT `FK_payments_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 2. Expenditure — Trip -> Campaign
-- ------------------------------------------------------------
ALTER TABLE `expenditure`
  DROP FOREIGN KEY `FK_expenditure_trips`;

ALTER TABLE `expenditure`
  MODIFY COLUMN `trip_id` INT NULL DEFAULT NULL COMMENT 'legacy — no longer used, kept for historical rows',
  ADD COLUMN `campaign_id` INT NULL DEFAULT NULL AFTER `trip_id`,
  ADD INDEX `FK_expenditure_campaigns` (`campaign_id`),
  ADD CONSTRAINT `FK_expenditure_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 3. Loyalty Points — Booking -> Campaign
-- ------------------------------------------------------------
ALTER TABLE `loyalty_points`
  DROP FOREIGN KEY `fk_lp_order`,
  DROP INDEX `uq_lp_order`;

ALTER TABLE `loyalty_points`
  MODIFY COLUMN `order_id` INT NULL DEFAULT NULL COMMENT 'legacy — was a bookings.id, table removed',
  ADD COLUMN `campaign_id` INT NULL DEFAULT NULL AFTER `order_id`,
  ADD UNIQUE KEY `uq_lp_campaign` (`campaign_id`),
  ADD CONSTRAINT `fk_lp_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE;

-- ------------------------------------------------------------
-- 4. Drop the Bookings feature entirely (table + its workflow)
-- ------------------------------------------------------------
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `bookings`;
SET FOREIGN_KEY_CHECKS = 1;

DELETE FROM `workflow_history` WHERE `entity_type` = 'booking';
DELETE FROM `workflow_transitions` WHERE `workflow_id` = 1;
DELETE FROM `workflow_stages` WHERE `workflow_id` = 1;
DELETE FROM `workflows` WHERE `id` = 1 AND `workflow_name` = 'Bookings Workflow';

-- ------------------------------------------------------------
-- 5. Menus — remove Trips / Participants / Groups / Bookings;
--    relabel the Trips Report into a Campaigns Report.
--    (role_menu_access rows cascade-delete automatically.)
-- ------------------------------------------------------------
DELETE FROM `menus` WHERE `id` IN (10, 13, 32, 18, 21);

UPDATE `menus` SET `menu_name` = 'Campaigns Report', `view_path` = '/reports/campaigns'
WHERE `id` = 28 AND `view_path` = '/reports/sales';
