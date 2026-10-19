-- Add Reporting parent menu (level 1, no parent, no view_path)
INSERT IGNORE INTO menus (menu_name, view_path, parent_menu_id, menu_order, level, icon, is_visible)
VALUES ('Reporting', NULL, NULL, 8, 1, 'BarChartOutlined', 1);

-- Add Sales submenu under Reporting
INSERT IGNORE INTO menus (menu_name, view_path, parent_menu_id, menu_order, level, icon, is_visible)
SELECT 'Sales', '/reports/sales', m.id, 1, 2, 'LineChartOutlined', 1
FROM menus m WHERE m.menu_name = 'Reporting' AND m.parent_menu_id IS NULL AND m.level = 1
LIMIT 1;
