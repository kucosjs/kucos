const ar = require("../helpers/responses");
const fc = require("../helpers/functions");
const Comment = require('../models/comment.model');
const Vote = require("../models/vote.model");
const moment = require('moment');

module.exports = {

    createComment: async function(req, res) {

        let data       = req.body;

        if (data == undefined) return ar.validationError(res, 'No data has been sent');

        if (data.author)    var author    = fc.cleanHtml(data.author);
        if (data.comment)   var comment   = data.comment;
        if (data.email)     var email     = fc.cleanHtml(data.email);
        if (data.website)   var website   = fc.cleanHtml(data.website);
        if (data.parent_id) var parent_id = fc.cleanHtml(data.parent_id);
        if (data.username) return ar.created(res, "Comment added."); // honey pot
        var article_url = data.article_url.replace(/#comment-(.*)/,'');
        var userid  = fc.validateUser(req, res);
        //await fc.checkCommentSpam(req, {comment: comment, email: email, name: author})

        const isAllowed = await fc.checkAllowedSite(article_url);
        if (isAllowed) return ar.validationError(res, "This post is not allowed to comment."); 
        
        if (!comment)  return ar.validationError(res, "Please enter a comment.");
        if (comment.length <= 3 || comment.length >= 5000 )  return ar.validationError(res, "The minimum comment lenght is 3 and maximum is 5000 characters.");

        if (req.method == "PATCH") {

            Comment.findById(parent_id, function(err, data) {
                
                if (!data) return ar.error(res, "This comment is not found.");
                if (data.userid != userid) return ar.validationError(res, 'You can only edit your comments.')

                let now = moment(new Date).format("X");
                let addHour = moment(data.createdOn).add(1, 'hour').format("X");

                if (now > addHour) return ar.validationError(res, 'This comment can no longer be edited.');
                    if (author)  data.author = author;
                    if (comment) data.comment = comment;
                    if (email)   data.email = email;
                    if (website) data.website = website;
                    data.updatedOn = new Date;

                    data.save(function(err, data) {
                        if (err) return ar.error(res, "Failed to edit this comment.");
                        else {
                            let edit = fc.commentResponse([data], 'created');
                            return ar.success(res, edit)
                        }
                    });
    
            });

        } else {
            Comment.create({ article_id: article_url, author: author, comment: comment, email: email, website: website, parent_id: parent_id, userid: userid}, function(err, data) {
                if (err) return ar.error(res, "Error: EO17");

                let comment = fc.commentResponse([data], 'created');

                if (comment) return ar.created(res, comment);
                else return ar.error(res, "Problem with saving the comment, try again.");
            });
        }

    },

    getRowComment: function(req, res) {
        Comment.findById(req.params.id, function(err, data) {
            if (!data) return ar.error(res, "This comment is not found.");
            //var userid  = fc.validateUser(req, res);
            //if (data.userid != userid) return ar.validationError(res, 'You can only view your row comments.');
            return ar.success(res, data.comment);
        });
    },

    getComments: function(req, res) {
        var url = decodeURIComponent(req.params.id).replace(/#comment-(.*)/,'');

        Comment.find({article_id: url}).sort({createdOn: 1}).lean().exec()
        .then(data => {

            let comments = fc.commentResponse(data);

            let rec = (comment, threads) => {
                for (var thread in threads) {
                    let value = threads[thread];
    
                    if (thread.toString() === comment.parent_id.toString()) {
                        value.children[comment.id] = comment;
                        return;
                    }
    
                    if (value.children) {
                        rec(comment, value.children);
                    }
                }
            }
            let threads = {}, comment;
            for (let i=0; i<comments.length; i++) {
                comment = comments[i];
                comment.children = {};
                let parent_id = comment.parent_id;

                if (!parent_id) {
                    threads[comment.id] = comment;
                    continue;
                }

                rec(comment, threads);
            }
            res.json({
                'count': comments.length,
                'comments': threads
            });

            /*if(data.length >= 1) return ar.successData(res, threads, data.length);
            else return ar.notFoundData(res, "No comments", 0)*/

        })
        .catch(err => res.status(500).json({error: err}));


    }, 
    
    votes: function(req, res) {

        let data       = req.body;

        if (data.msgid)   var msgid   = fc.cleanHtml(data.msgid);
            else return ar.error(res, "No valid msg id");

        var userid  = fc.validateUser(req, res);

        if (data.action == "upvote")
            var action = "upvote";
        else if (data.action == "downvote")
            action = "downvote";
        else
            return ar.error(res, "No valid action.");

        Vote.countDocuments({msgid: msgid, userid: userid}, function (err, count){ 
            if(count>0){
                return ar.validationError(res, "You are already voted for it");
            } else {
                Comment.findById(msgid, function(err, comment) {
                    if (err) return ar.error(res, "Error #41-0");
                    else if (comment) {
                        if (action == "upvote")
                            comment.likes = comment.likes + 1;
                        else
                            comment.dislikes = comment.dislikes + 1;

                        comment.save(function(err) {
                            if (err) return ar.error(res, "Error #41-1");
                            else {
                                const vote = new Vote({ msgid: msgid, userid: userid });
                                vote.save();
                                return ar.success(res, {likes: comment.likes, dislikes: comment.dislikes, score: comment.likes - comment.dislikes})
                            }
                        });
                    } else {
                        return ar.notFound(res, "No comment found");
                    }
                });
            }
        }); 

    }

}