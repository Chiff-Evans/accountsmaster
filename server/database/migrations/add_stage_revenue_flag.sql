-- Controls whether orders in this stage count towards revenue statistics
ALTER TABLE workflow_stages ADD COLUMN include_in_revenue TINYINT(1) DEFAULT 1;
