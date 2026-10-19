const router = require('express').Router();
const pool = require('../config/db');
const { authenticate, requirePermission } = require('../middleware/auth');
const { notify } = require('../helpers/notify');
const { encodeId } = require('../utils/hashids');

const PROOF_STATUS_LABEL = { accepted: 'Accepted', rejected: 'Rejected', pending: 'reverted to Pending' };

router.use(authenticate);

const canReview = requirePermission('/campaigns/proof-review', 'can_edit');

const LIST_SELECT = `
  SELECT cp.*, c.file_no, c.campaign_title, a.brand_ambassador_ref_no, a.full_name AS brand_ambassador_name,
         TRIM(CONCAT(u.firstname, ' ', u.lastname)) AS reviewer_name
  FROM campaign_proofs cp
  JOIN campaigns c        ON cp.campaign_id = c.id
  JOIN brand_ambassadors a ON cp.brand_ambassador_id = a.id
  LEFT JOIN users u       ON cp.reviewed_by = u.id
`;

router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (req.query.status) { where.push('cp.status = ?'); params.push(req.query.status); }
    if (req.query.campaign_id) { where.push('cp.campaign_id = ?'); params.push(req.query.campaign_id); }
    if (req.query.search) {
      const s = `%${req.query.search}%`;
      where.push('(c.campaign_title LIKE ? OR c.file_no LIKE ? OR a.full_name LIKE ? OR a.brand_ambassador_ref_no LIKE ?)');
      params.push(s, s, s, s);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `${LIST_SELECT} ${whereSql} ORDER BY cp.submitted_on DESC, cp.id DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM campaign_proofs cp
       JOIN campaigns c   ON cp.campaign_id = c.id
       JOIN brand_ambassadors a ON cp.brand_ambassador_id = a.id
       ${whereSql}`,
      params
    );
    res.json({ data: rows, total, page, limit });
  } catch (err) { next(err); }
});

router.post('/:id/review', canReview, async (req, res, next) => {
  try {
    const { action, notes } = req.body;
    if (!['accept', 'reject', 'revert'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
    if (action === 'reject' && !notes) return res.status(400).json({ message: 'A reason is required to reject a proof' });

    if (action === 'revert') {
      const [[proof]] = await pool.query('SELECT status FROM campaign_proofs WHERE id=?', [req.params.id]);
      if (!proof) return res.status(404).json({ message: 'Not found' });
      if (!['accepted', 'rejected'].includes(proof.status)) return res.status(400).json({ message: 'Only an accepted or rejected proof can be reverted' });
      // Reverting a rejection was staff correcting their own call, not a
      // genuine strike against the brand ambassador — undo it so it doesn't
      // count toward their resubmission limit.
      const rejectionAdjust = proof.status === 'rejected' ? 'GREATEST(rejection_count - 1, 0)' : 'rejection_count';
      await pool.query(
        `UPDATE campaign_proofs SET status='pending', rejection_count=${rejectionAdjust},
           review_notes=NULL, reviewed_by=NULL, reviewed_on=NULL WHERE id=?`,
        [req.params.id]
      );
    } else if (action === 'reject') {
      await pool.query(
        `UPDATE campaign_proofs SET status='rejected', rejection_count=rejection_count+1,
           review_notes=?, reviewed_by=?, reviewed_on=NOW() WHERE id=?`,
        [notes || null, req.user.id, req.params.id]
      );
    } else {
      await pool.query(
        "UPDATE campaign_proofs SET status='accepted', review_notes=?, reviewed_by=?, reviewed_on=NOW() WHERE id=?",
        [notes || null, req.user.id, req.params.id]
      );
    }
    const [rows] = await pool.query(`${LIST_SELECT} WHERE cp.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    const proof = rows[0];

    const dateStr = new Date(proof.proof_date).toISOString().slice(0, 10);
    await notify('brand_ambassador', proof.brand_ambassador_id, 'proof_reviewed', {
      title: `Posting proof ${PROOF_STATUS_LABEL[proof.status] || proof.status}`,
      body: action === 'reject'
        ? `Your proof for "${proof.campaign_title}" (${dateStr}) was rejected: ${notes}`
        : `Your proof for "${proof.campaign_title}" (${dateStr}) was ${PROOF_STATUS_LABEL[proof.status] || proof.status}.`,
      url: `/brand-ambassador/campaigns/${encodeId(proof.campaign_id)}`,
    });

    res.json(proof);
  } catch (err) { next(err); }
});

module.exports = router;
