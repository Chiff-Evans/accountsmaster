-- Per-stage toggle: when a brand ambassador (or any entity) transitions into a
-- stage with this flag set, an email is sent to them with a link to log in.
-- Mirrors the existing advertiser_can_edit per-stage flag pattern.
ALTER TABLE workflow_stages ADD COLUMN send_approval_email TINYINT(1) DEFAULT 0 AFTER advertiser_can_edit;
