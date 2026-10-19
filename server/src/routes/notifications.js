const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { mountNotificationRoutes } = require('../helpers/notify');
const { mountPushRoutes } = require('../utils/pushNotify');

router.use(authenticate);

mountNotificationRoutes(router, 'mis', req => req.user.id);
// Router already requires auth for everything above, so push routes need no
// extra per-route auth middleware of their own.
mountPushRoutes(router, 'mis', req => req.user.id, (req, res, next) => next());

module.exports = router;
