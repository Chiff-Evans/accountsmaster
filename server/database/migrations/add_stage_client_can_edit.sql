-- Controls whether a client can edit their own booking (from the portal)
-- while it sits at this stage. Defaults to 1 so existing stages keep
-- today's behaviour (editable everywhere except terminal stages) until an
-- admin deliberately locks a specific stage down.
ALTER TABLE workflow_stages ADD COLUMN client_can_edit TINYINT DEFAULT 0;
