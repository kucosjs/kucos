const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');
const authCtrl = require('../controllers/auth.controller');
const fc = require('../helpers/functions');

router.get('/', authCtrl.auth);
router.post('/login', authCtrl.login);
router.get('/logout', fc.validateAdmin, authCtrl.logout);

router.get('/overview', fc.validateAdmin, adminCtrl.overview);
router.get('/comments', fc.validateAdmin, adminCtrl.comments);
router.get('/spam', fc.validateAdmin, adminCtrl.spam);

router.delete('/remove/:id', fc.validateAdmin, adminCtrl.removeComment);
router.patch('/notspam/:id', fc.validateAdmin, adminCtrl.notspam);
router.patch('/reportspam/:id', fc.validateAdmin, adminCtrl.reportSpam);

module.exports = router;