const Comment = require('../models/comment.model');
const Stats = require('../models/stats.model');
const Spam = require('../models/spam.model');
const config = require('../config');
const fc = require('./../helpers/functions');
const title = 'Kucos - Open source Comments and Kudos server';

module.exports = {

    overview: function(req, res) {
        Stats.find().exec(function(err, data) {
            return res.status(200).render('overview', {
                title: title, panel: 'Overview', data: data, isLoggedIn: req.session.admin?true:false
            });
        });
    },

    comments: function(req, res) {
        Comment.find({article_id: req.query.url}).exec(function(err, data) {
            Spam.find().exec(function(err, spam) {
                return res.status(200).render('comments', {
                    title: title, panel: 'Article comments', commets: data, spamComment: spam, isLoggedIn: req.session.admin?true:false, kucosUrl: config.kucosServerUrl
                });
            });
        });
    },

    spam: function(req, res) {
        Spam.find().exec(function(err, spam) {
            var spams = []
            spam.map(d => {
                spams.push(d.comment_id)
            });
            Comment.find().where('_id').in(spams).exec((err, data) => {
                return res.status(200).render('spam', {
                    title: title, panel: 'Possible spam comments', spamComment: data, isLoggedIn: req.session.admin?true:false, kucosUrl: config.kucosServerUrl
                });
            });
        });
    },

    removeComment: function(req, res) {
        fc.allStats(req, res, req.query.url, 'remove', 'spam');
        fc.allStats(req, res, req.query.url, 'remove', 'comment');

        if (req.query.spam == 1) {
            Spam.remove({ comment_id: req.params.id }, function(err) {
                if (err) console.log(err)
            });
        }
        Comment.remove({ _id: req.params.id }, function(err) {
            if (err) console.log(err)
            else res.json({message: 'Comment deleted'});
        });
        return;
    },

    notspam: function(req, res) {
        Spam.remove({ comment_id: req.params.id }, function(err) {
            if (err) console.log(err)
        });
        if (config.enableAkismet) {
            Comment.findById(req.params.id).exec(async function(err, data) {
                await fc.checkCommentSpam(req, res, data, 'submitHam', req.params.id);
                fc.allStats(req, res, data.article_id, 'remove', 'spam');
            });
        }
        return;
    },

    reportSpam: function(req, res) {
        Comment.findById(req.params.id).exec(async function(err, data) {
            Spam.create({ comment_id: data._id });
            if (config.enableAkismet) {
                await fc.checkCommentSpam(req, res, data, 'submitSpam', req.params.id);
            }
            fc.allStats(req, res, data.article_id, 'add', 'spam');
        });
        return;
    },

    stickyComment: function(req, res) {
        Comment.findById(req.params.id, function(err, article) {
            if (article.sticky == null || article.sticky == 0) {
                article.sticky = 1;
                res.json({message: 'sticked'});
            } else {
                article.sticky = 0;
                res.json({message: 'unsticked'});
            }
            article.save(function(err) {
                if (err) console.log(err)
            });
        });
    }

}

