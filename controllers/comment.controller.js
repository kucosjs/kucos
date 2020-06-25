const ar = require("../helpers/responses");
const fc = require("../helpers/functions")
const Comment = require('../models/comment.model');
const Vote = require("../models/vote.model");
const Slimdown = require("../helpers/slimdown");
let sd = new Slimdown();

module.exports = {

    createComment: async function(req, res) {

        let data       = req.body;

        if (data.author)    var author    = fc.cleanHtml(data.author);
        if (data.comment)   var comment   = sd.render(fc.cleanHtml(data.comment));
        if (data.email)     var email     = fc.cleanHtml(data.email);
        if (data.website)   var website   = fc.cleanHtml(data.website);
        if (data.parent_id) var parent_id = fc.cleanHtml(data.parent_id);
        if (data.username) return ar.created(res, "Comment added."); // honey pot
        var article_url = data.article_url.replace(/#comment-(.*)/,'');
        //await fc.checkCommentSpam(req, {comment: comment, email: email, name: author})

        const isAllowed = await fc.checkAllowedSite(article_url);
        if (isAllowed) return ar.validationError(res, "This post is not allowed to comment."); 
        
        if (!comment)  return ar.validationError(res, "Please enter a comment.");
        if (comment.length <= 3 || comment.length >= 5000 )  return ar.validationError(res, "The minimum comment lenght is 3 and maximum is 5000 characters.");

        Comment.create({ article_id: article_url, author: author, comment: comment, email: email, website: website, parent_id: parent_id}, function(err, data) {
            if (err) return ar.error(res, "Error: EO17");

            let comment = fc.commentResponse([data], 'created');

            if (comment) return ar.created(res, comment);
            else return ar.error(res, "Problem with saving the comment, try again.");
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

        if (req.cookies.kucos == undefined)
            var userid  = req.app.get('etagUser');
        else
            userid  = req.cookies.kucos;

        if (userid == undefined) return ar.error(res, "No valid user id, try reload this page");

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