-- Wipes all customer/transactional data, leaving reference/config data
-- (roles, menus, workflows, process types, parameters, settings, ...)
-- untouched. Use this to reset a dev/demo database to a clean slate.
-- TRUNCATE also resets each table's AUTO_INCREMENT back to 1.
--
-- Usage: mysql -u <user> -p <database> < truncate_transactional_data.sql

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `advertisers`;
TRUNCATE TABLE `brand_ambassadors`;
TRUNCATE TABLE `business_shareholders`;
TRUNCATE TABLE `campaign_brand_ambassadors`;
TRUNCATE TABLE `campaign_proofs`;
TRUNCATE TABLE `campaigns`;
TRUNCATE TABLE `categories`;
TRUNCATE TABLE `email_verification_codes`;
TRUNCATE TABLE `expenditure`;
TRUNCATE TABLE `loyalty_points`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `payments`;
TRUNCATE TABLE `push_subscriptions`;
TRUNCATE TABLE `salaries`;
TRUNCATE TABLE `user_sessions`;
TRUNCATE TABLE `workflow_history`;

SET FOREIGN_KEY_CHECKS = 1;
