const ar = require("../helpers/responses");
const fc = require("../helpers/functions")
const Kudo = require('../models/kudo.model');

module.exports = {

    giveKudos: async function(req, res) {

        let data        = req.body;
        let article_url = data.id.replace(/#comment-(.*)/, '');
        let vote        = data.kudo;

        if (data == undefined) return ar.validationError(res, 'No data has been sent');

        const isAllowed = await fc.checkAllowedSite(article_url);
        if (isAllowed) return ar.validationError(res, {kudos: "This post is not allowed to kudos"}); 
        
        if (vote == 'add')    { var vot =  1; }
        if (vote == 'remove') { vot = -1; }

        Kudo.findOne({article_id: article_url}, function(err, data) {

            if (data) {
                // update kudo
                data.kudos  = data.kudos + vot;
                data.updatedOn = new Date().toISOString();

                data.save(function(err, data) {
                    if (err) return ar.error(res, "Error: EO20");
                    if (data) return ar.created(res, {kudos: data.kudos});
                    else return ar.error(res, "Problem with saving the kudo, try again.");
                });

            } else {
                // add new kudo
                Kudo.create({article_id: article_url, kudos: vot}, function(err, data) {
                    if (err) return ar.error(res, "Error: EO17");
                    if (data) return ar.created(res, {kudos: data.kudos});
                    else return ar.error(res, "Problem with saving the kudo, try again.");
                });
            }

        });

    },

    getKudos: function(req, res) {
        let article_url = decodeURIComponent(req.params.id).replace(/#comment-(.*)/,'');
        Kudo.findOne({article_id: article_url}, function(err, data) {
            if (err) return ar.error(res, "Error: EO18");
            if(data) return ar.success(res, {kudos: data.kudos});
            else return ar.success(res, {kudos: 0});
        });
    }

}