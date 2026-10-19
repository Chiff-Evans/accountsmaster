-- ============================================================
-- Salaries — payments made to advertisers for the campaigns they ran,
-- tracked separately from client Revenue/Expenditure. Idempotent — safe
-- to re-run.
-- ============================================================
CREATE TABLE IF NOT EXISTS `salaries` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `file_no` VARCHAR(250) NULL DEFAULT NULL,
  `campaign_id` INT NOT NULL,
  `advertiser_id` INT NOT NULL,
  `currency_id` INT NULL DEFAULT NULL,
  `payment_mode_id` INT NULL DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `reference` VARCHAR(250) NULL DEFAULT NULL,
  `payment_date` DATE NULL DEFAULT NULL,
  `paid_by` INT NULL DEFAULT NULL,
  `comments` TEXT NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `created_on` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT NULL DEFAULT NULL,
  `updated_on` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `FK_salaries_campaigns` (`campaign_id`) USING BTREE,
  INDEX `FK_salaries_advertisers` (`advertiser_id`) USING BTREE,
  CONSTRAINT `FK_salaries_campaigns` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `FK_salaries_advertisers` FOREIGN KEY (`advertiser_id`) REFERENCES `advertisers` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
) COMMENT='Salary payments made to advertisers for campaigns'
  ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ref numbering: SAL-0001, SAL-0002, ...
INSERT INTO process_types (process_type_name, description, data_table)
SELECT 'salary_creation', 'Advertiser Salary Payments', 'salaries'
WHERE NOT EXISTS (SELECT 1 FROM process_types WHERE process_type_name = 'salary_creation');

INSERT INTO ref_numbering (process_type_id, prefix, initial_serial, next_serial, use_year, use_month, padding)
SELECT pt.id, 'SAL', 1, 1, 0, 0, 4
FROM process_types pt
WHERE pt.process_type_name = 'salary_creation'
  AND NOT EXISTS (SELECT 1 FROM ref_numbering WHERE process_type_id = pt.id);

-- Menu: "Salaries" under the Accounts parent (id 26 is Campaigns; Accounts is 31)
INSERT INTO menus (menu_name, parent_menu_id, level, view_path, menu_order, icon, description, is_visible)
SELECT 'Salaries', m.id, 2, '/stock/salaries',
       (SELECT COALESCE(MAX(menu_order), 0) + 1 FROM menus WHERE parent_menu_id = m.id),
       'DollarCircleOutlined', 'Salary payments made to advertisers for campaigns', 1
FROM   menus m
WHERE  m.id = 31
  AND  NOT EXISTS (SELECT 1 FROM menus WHERE view_path = '/stock/salaries')
LIMIT 1;

INSERT INTO role_menu_access (role_id, menu_id, can_view, can_create, can_edit, can_delete)
SELECT r.id, m.id, 1, 1, 1, 1
FROM   roles r
JOIN   menus m ON m.view_path = '/stock/salaries'
WHERE  r.id IN (1, 2)
  AND  NOT EXISTS (
         SELECT 1 FROM role_menu_access rma WHERE rma.role_id = r.id AND rma.menu_id = m.id
       );
