-- ============================================================
-- Finance-management transform, step 2: Campaigns -> Transactions.
-- Adds member transactions (type from the "Transaction Types"
-- parameter, text_id 'transaction-types'), points the Campaigns menu
-- at them, and removes the Proof Review menu.
-- The legacy campaigns table is left in place: Revenue, Expenditure,
-- Salaries and reports still reference campaign_id.
-- Not idempotent — run once.
-- ============================================================

CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `file_no` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `member_id` int NOT NULL,
  `transaction_type_id` int DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `other_details` text COLLATE utf8mb4_unicode_ci,
  `created_by` int DEFAULT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_file_no` (`file_no`),
  KEY `FK_transactions_member` (`member_id`),
  KEY `FK_transactions_type` (`transaction_type_id`),
  KEY `idx_transactions_date` (`transaction_date`),
  CONSTRAINT `FK_transactions_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_transactions_type` FOREIGN KEY (`transaction_type_id`) REFERENCES `parameter_values` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Member financial transactions';

-- ref numbering: TRN-0001, ...
INSERT INTO `process_types` (`process_type_name`, `description`, `data_table`)
VALUES ('transaction_creation', 'Member Transactions', 'transactions');
INSERT INTO `ref_numbering` (`process_type_id`, `prefix`, `initial_serial`, `next_serial`, `use_year`, `use_month`, `padding`)
VALUES (LAST_INSERT_ID(), 'TRN', 1, 1, 0, 0, 4);

-- menus: Campaigns group + item become Transactions
UPDATE `menus` SET `menu_name`='Transactions', `icon`='SwapOutlined', `description`='Member transactions' WHERE `id`=26;
UPDATE `menus` SET `menu_name`='Transactions', `view_path`='/transactions', `icon`='TransactionOutlined', `description`='Record member transactions' WHERE `id`=35;

-- menus: remove Proof Review
DELETE FROM `role_menu_access` WHERE `menu_id`=37;
DELETE FROM `menus` WHERE `id`=37;
