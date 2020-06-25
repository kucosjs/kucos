const express = require('express');
const router = express.Router();
const fn = require('./../helpers/functions');
const kudoCtrl = require('../controllers/kudo.controller');

router.post('/kudos', fn.validateCookie, kudoCtrl.giveKudos);     // POST /api/kudos      [ Give kudos to article ]
router.get('/kudos/:id', kudoCtrl.getKudos);                      // GET /api/kudos/:id   [ Get kudos count ]

module.exports = router;
