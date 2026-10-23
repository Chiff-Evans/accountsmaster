const pool = require('../config/db');

/* Find the initial stage of the active workflow driving a given data table
   (e.g. 'members'). Used by members.js and memberPortal.js when a record
   enters its approval workflow. */
async function getInitialStage(dataTable) {
  const [rows] = await pool.query(
    `SELECT w.id AS workflow_id, ws.id AS stage_id, ws.stage_name, w.process_type_id, ws.assign_ref_no
     FROM workflows w
     JOIN process_types pt   ON pt.id = w.process_type_id AND pt.data_table = ?
     JOIN workflow_stages ws ON ws.workflow_id = w.id AND ws.is_initial = 1
     WHERE w.is_active = 1
     ORDER BY w.id ASC LIMIT 1`,
    [dataTable]
  );
  return rows[0] || null;
}

/* Every stage of the active workflow driving a given data table, in display
   order — used to populate a grid's stage-filter dropdown. */
async function getWorkflowStages(dataTable) {
  const [rows] = await pool.query(
    `SELECT ws.id, ws.stage_name, ws.stage_color, ws.stage_order, ws.show_in_grid_default
     FROM workflows w
     JOIN process_types pt   ON pt.id = w.process_type_id AND pt.data_table = ?
     JOIN workflow_stages ws ON ws.workflow_id = w.id
     WHERE w.is_active = 1
     ORDER BY ws.stage_order, ws.id`,
    [dataTable]
  );
  return rows;
}

/* Insert a workflow_history audit row. */
async function recordHistory({
  workflowId, processTypeId, entityType, entityId, entityRef,
  fromStageId, toStageId, fromStatus, toStatus, movedBy, notes,
}) {
  await pool.query(
    `INSERT INTO workflow_history
       (workflow_id, process_type_id, entity_type, entity_id, entity_ref,
        from_stage_id, to_stage_id, from_status, to_status, moved_by, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [workflowId || null, processTypeId || null, entityType, entityId, entityRef || null,
     fromStageId || null, toStageId || null, fromStatus || null, toStatus || null,
     movedBy || null, notes || null]
  );
}

/* Valid transitions out of a given (workflowId, fromStageId). */
async function getTransitions(workflowId, fromStageId) {
  const [rows] = await pool.query(
    `SELECT t.id AS transition_id, t.action_label,
            cs.responsible_group,
            ts.id AS to_stage_id, ts.stage_name AS to_stage_name, ts.stage_color AS to_stage_color,
            ts.is_terminal AS to_is_terminal
     FROM workflow_stages cs
     JOIN workflow_transitions t ON t.from_stage_id = cs.id AND t.workflow_id = ?
     JOIN workflow_stages ts ON t.to_stage_id = ts.id
     WHERE cs.id = ?
     ORDER BY t.id`,
    [workflowId, fromStageId]
  );
  return rows;
}

/* Validate that a transition_id actually belongs to (workflowId, fromStageId). */
async function validateTransition(transitionId, workflowId, fromStageId) {
  const [[t]] = await pool.query(
    `SELECT t.*, ts.stage_name AS to_stage_name, ts.stage_color AS to_stage_color, ts.is_terminal AS to_is_terminal,
            ts.send_approval_email AS to_send_approval_email, ts.assign_ref_no AS to_assign_ref_no
     FROM workflow_transitions t
     JOIN workflow_stages ts ON t.to_stage_id = ts.id
     WHERE t.id=? AND t.workflow_id=? AND t.from_stage_id=?`,
    [transitionId, workflowId, fromStageId]
  );
  return t || null;
}

/* Given a destination stage name, decide the account `status` enum to apply
   (used by member registration approval — 'Approved' activates the account,
   'Rejected' leaves it inactive). Returns null when the stage name doesn't
   map to a status change. */
function statusForStage(stageName) {
  if (!stageName) return null;
  const n = stageName.toLowerCase();
  if (n.includes('approved')) return 'active';
  if (n.includes('reject')) return 'inactive';
  return null;
}

module.exports = { getInitialStage, getWorkflowStages, recordHistory, getTransitions, validateTransition, statusForStage };
