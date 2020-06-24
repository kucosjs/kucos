const express = require('express');
const router = express.Router();
const kudoCtrl = require('../controllers/kudo.controller');

router.post('/kudos', kudoCtrl.giveKudos);     // POST /api/kudos      [ Give kudos to article ]
router.get('/kudos/:id', kudoCtrl.getKudos);   // GET /api/kudos/:id   [ Get kudos count ]

module.exports = router;
