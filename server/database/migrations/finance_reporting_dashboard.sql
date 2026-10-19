-- ============================================================
-- Reporting + Dashboard now report on member finances (transactions,
-- registration fees, the active target) instead of campaigns.
-- Not idempotent — run once.
-- ============================================================

-- Reporting > Campaigns becomes Reporting > Financial Report
UPDATE `menus` SET `menu_name`='Financial Report', `view_path`='/reports/finance', `icon`='LineChartOutlined',
  `description`='Deposits, withdrawals and registration fees' WHERE `id`=28;

-- Dashboard sections: drop campaign/legacy keys (new keys default to visible)
DELETE FROM `dashboard_visibility` WHERE `section_key` NOT IN (
  'stat_members', 'stat_deposits', 'stat_withdrawals', 'stat_net', 'stat_target',
  'chart_trend', 'chart_by_type', 'chart_top_members', 'chart_recent_transactions'
);
