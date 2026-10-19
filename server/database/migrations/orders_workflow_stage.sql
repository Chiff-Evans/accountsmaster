-- Link orders to workflow stages

ALTER TABLE orders ADD COLUMN workflow_id INT NULL;
ALTER TABLE orders ADD COLUMN workflow_stage_id INT NULL;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_workflow
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_orders_stage
    FOREIGN KEY (workflow_stage_id) REFERENCES workflow_stages(id) ON DELETE SET NULL;

-- Extend workflow_history with stage FKs and process_type
ALTER TABLE workflow_history ADD COLUMN from_stage_id INT NULL;
ALTER TABLE workflow_history ADD COLUMN to_stage_id INT NULL;
ALTER TABLE workflow_history ADD COLUMN process_type_id INT NULL;

ALTER TABLE workflow_history
  ADD CONSTRAINT fk_history_from_stage
    FOREIGN KEY (from_stage_id) REFERENCES workflow_stages(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_history_to_stage
    FOREIGN KEY (to_stage_id) REFERENCES workflow_stages(id) ON DELETE SET NULL;

-- Backfill existing orders: point to the initial stage of the first active workflow
UPDATE orders o
JOIN (
  SELECT w.id AS wf_id, ws.id AS stage_id
  FROM workflows w
  JOIN workflow_stages ws ON ws.workflow_id = w.id AND ws.is_initial = 1
  WHERE w.is_active = 1
  ORDER BY w.id ASC
  LIMIT 1
) init ON 1=1
SET o.workflow_id = init.wf_id,
    o.workflow_stage_id = init.stage_id
WHERE o.workflow_stage_id IS NULL;
