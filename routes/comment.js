const express = require('express');
const router = express.Router();
const fn = require('./../helpers/functions');
const commentCtrl = require('../controllers/comment.controller');

router.post('/comments', fn.validateCookie, commentCtrl.createComment);   // POST /api/comments        [ Create new comment  ]
router.patch('/comments', fn.validateCookie, commentCtrl.createComment);  // PATCH /api/comments       [ Edit comment        ]
router.get('/comments/row/:id', commentCtrl.getRowComment);               // GET /api/comments/row/:id [ Get row comment ]
router.get('/comments/:id', commentCtrl.getComments);                     // GET /api/comments/:id     [ Get latest comments ]
router.post('/comments/vote', fn.validateCookie, commentCtrl.votes)       // POST /api/comments/vote   [ Vote for comments   ]

module.exports = router;
