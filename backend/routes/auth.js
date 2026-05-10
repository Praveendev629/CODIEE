const router   = require('express').Router();
const ctrl     = require('../controllers/authController');
const protect  = require('../middleware/auth');
router.post('/register',        ctrl.register);
router.post('/login',           ctrl.login);
router.get('/github',           ctrl.githubRedirect);
router.get('/github/callback',  ctrl.githubCallback);
router.get('/me', protect,      ctrl.getMe);
module.exports = router;
