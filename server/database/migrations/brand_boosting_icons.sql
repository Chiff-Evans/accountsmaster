-- ============================================================
-- Re-theme menu icons for the advertising / brand-boosting domain
-- (leftover choices were either travel-era defaults or generic).
-- Icon names are plain @ant-design/icons component names, resolved
-- dynamically by the sidebar — no frontend code change needed.
-- ============================================================

-- Clients (Businesses) — top-level group + the Clients list page
UPDATE menus SET icon = 'BankOutlined'   WHERE view_path IS NULL AND menu_name = 'Clients' AND parent_menu_id IS NULL;
UPDATE menus SET icon = 'IdcardOutlined' WHERE view_path = '/clients';

-- Advertisers — WhatsApp status advertisers (mobile-first broadcast)
UPDATE menus SET icon = 'MobileOutlined' WHERE view_path = '/advertisers';

-- Campaigns — top-level group + the Campaigns page (broadcast/announce)
UPDATE menus SET icon = 'SoundOutlined' WHERE view_path IS NULL AND menu_name = 'Campaigns' AND parent_menu_id IS NULL;
UPDATE menus SET icon = 'SoundOutlined' WHERE view_path = '/campaigns';

-- Revenue — growth/upward trend fits both "finance" and "boosting"
UPDATE menus SET icon = 'RiseOutlined' WHERE view_path = '/stock/payments';

-- Workflows — was sharing ApartmentOutlined with Process Types; differentiate
UPDATE menus SET icon = 'BranchesOutlined' WHERE view_path = '/config/workflows';
