-- Per-stage toggle: a reference/file number is only generated and assigned
-- to an advertiser/brand ambassador when they reach a stage with this flag
-- set (e.g. "Approved"), instead of immediately at registration. Mirrors the
-- advertiser_can_edit / send_approval_email per-stage flag pattern.
ALTER TABLE workflow_stages ADD COLUMN assign_ref_no TINYINT(1) DEFAULT 0 AFTER send_approval_email;
