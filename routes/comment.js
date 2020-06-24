const express = require('express');
const router = express.Router();
const commentCtrl = require('../controllers/comment.controller');

router.post('/comments', commentCtrl.createComment);   // POST /api/comments      [ Create new comment  ]
router.get('/comments/:id', commentCtrl.getComments);  // GET /api/comments/:id   [ Get latest comments ]
router.post('/comments/vote', commentCtrl.votes)       // POST /api/comments/vote [ Vote for comments   ]

module.exports = router;
