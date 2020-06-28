const config = require('../config');
const ar = require('../helpers/responses');
const title = 'Kucos - Open source Comments and Kudos server';

module.exports = {

    auth: function(req, res) {

        if (req.session.admin !== undefined) return res.redirect(301, '/overview');

        return res.status(200).render('auth', {
            title: title, panel: 'Auth'
        });
    },

    login: function(req, res) {
        if ( config.adminPassword == req.body.password ) {
            req.session.admin = true;
            return ar.success(res, 'success');
        } else {
            return ar.validationError(res, 'Invalid password');
        }
    },

    logout: function(req, res) {
        req.session.destroy();
        res.redirect('/');
    }

}