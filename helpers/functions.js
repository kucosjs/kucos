const config = require('../config');
const moment = require('moment');
const ar = require('./responses');
const Stats = require('../models/stats.model');
const Spam = require('../models/spam.model');
const Slimdown = require("../helpers/slimdown");
const sd = new Slimdown();
const Akismet = require('akismet-api')
const akismet = new Akismet.Client({ blog: config.kucosServerUrl, key: config.akismetApiKey });

exports.checkAllowedSite = async (url) => {
  url = new URL(url);
  if (config.allowedHostname.includes(url.origin))
    return false;
  else
    return true;  
}

exports.cleanHtml = (text) => {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

exports.validateCookie = (req, res, next) => {
  var etag = req.app.get('etagUser');

  if (etag != undefined && req.cookies.kucos != undefined) {
    next();
  } else if ( etag == undefined && req.cookies.kucos != undefined ) {
    res.app.set('etagUser', req.cookies.kucos);
    next();
  } else if ( etag != undefined && req.cookies.kucos == undefined ) {
    this.saveCookie(req, res, etag, next);
  } else {
    var uuid = this.uuid();
    res.app.set('etagUser', uuid);
    this.saveCookie(req, res, uuid, next);
  }
} 

exports.saveCookie = (req, res, uuid, next) => {
  if ( req.app.get('etagUser') != undefined ) {
    var expiryDate = new Date(Number(new Date()) + 315360000000); 
    res.cookie('kucos', uuid, { expires: expiryDate, sameSite: 'None', secure: true });
    return next();
  } else {
    return res.status(401).json("Please turn on JavaScript on your browser, or there's just the cookie verification error.");
  }
}

exports.uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

exports.commentResponse = (data, action=null) => {
  var comments = [];

  data.map(d => {
    comments = [].concat(comments, {id: d._id, author: d.author, comment: sd.render(d.comment), email: d.email, website: d.website, parent_id: d.parent_id, createdOn: d.createdOn, createdOnTime: moment(d.createdOn).format('dddd, MMMM Do YYYY, HH:mm:ss'), created: moment(d.createdOn).fromNow(), updatedOn: moment(d.updatedOn).format('dddd, MMMM Do YYYY, HH:mm:ss'), likes: d.likes, dislikes: d.dislikes, score: d.likes - d.dislikes, spam: d.spam, sticky: d.sticky });
  });
  
  if (action == 'created')
    return comments[0];
  else
    return comments;
}

exports.validateUser = (req, res) => {
  if (req.cookies.kucos == undefined)
      var userid  = req.app.get('etagUser');
  else
      userid  = req.cookies.kucos;

  if (userid == undefined) return ar.error(res, "No valid user id, try reload this page");

  return userid;
}

exports.allStats = (req, res, url, action, c) => {
  Stats.findOne({article_id: url}, function(err, article) {

      if (c == 'spam') {
        if (action == 'add') {
            article.totalSpam = article.totalSpam + 1;
        } else if (action == 'remove') {
            article.totalSpam = article.totalSpam - 1;
        }
      } else if (c == 'comment') {
        if (action == 'add') {
            article.totalComments = article.totalComments + 1;
        } else if (action == 'remove') {
            article.totalComments = article.totalComments - 1;
        }
      }

      article.save(function(err) {
          if (err) console.log(err)
      });
  });
}


exports.validateAdmin = (req, res, next) => {
  if (req.session.admin !== true) {
    return res.redirect(301, '/');
  } else {
    next();
  }
} 

exports.stats = (req, res, url, action) => {
  Stats.findOne({article_id: url}, function(err, article) {
      if (article == null) {
        Stats.create({ article_id: url, totalComments: 1 }, function(err) {
            if (err) return ar.error(res, "Error: EO17.0");
        });
      } else {
        if (action == 'comment') article.totalComments = article.totalComments + 1;
        if (action == 'report')  article.totalReports = article.totalReports + 1;
        if (action == 'spam')    article.totalSpam = article.totalSpam + 1;
  
        article.save(function(err) {
            if (err) console.log(err)
        });
      }
  });
}

exports.checkCommentSpam = async (req, res, data, type) => {

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const useragent = req.get('user-agent');
  const permalink = req.headers.href ? req.headers.href : data.article_id;
  const recheck = data.parent_id ? 'edit' : null;

  const comment = {
    ip: ip,
    useragent: useragent,
    content: data.comment,
    email: data.email,
    name: data.author,
    permalink: permalink,
    type: type,
    recheck: recheck,
    isTest: config.akismetTesting
  }

  akismet.verifyKey();

  if (type == 'comment' || type == 'edit' ) {
    akismet.checkSpam(comment)
    .then(isSpam => {
      if (isSpam) {
        console.log('Spam caught.');

        Spam.create({ comment_id: data.id});

        Stats.findOne({article_id: data.article_url}, function(err, article) {
          article.totalSpam = article.totalSpam + 1;
          article.save(function(err) {
            if (err) console.log(err)
          });
        })

      } else {
        console.log('Not spam')
      }
    })
    .catch(err => {
      console.error('Error:', err.message)
    })

  } else if (type == 'submitSpam') {

    akismet.submitSpam(comment)
    .then(() => { 
      console.log('Spam reported!')
      return ar.success(res, 'Spam reported!');
    })
    .catch(err => {
      console.error('Error:', err.message)
      return ar.error(res, 'Error:', err.message);
    })


  } else if (type == 'submitHam') {

    akismet.submitHam(comment)
    .then(() => {
      console.log('Non-spam reported!')
      return ar.success(res, 'Non-spam reported!');
    })
    .catch(err => {
      console.error('Error:', err.message)
      return ar.error(res, 'Error:', err.message);
    })

  }

}

exports.filterSpam = (data) => {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, reject) => {
    // Hide spam comments
    Spam.find().exec((err, spam) => {
      var cc = [];

      data.map(d => {
          const check = obj => obj.comment_id == d._id;
          if ( spam.some(check) ) {
              d.author = 'Hidden';
              d.comment = 'Hidden';
              d.website = 'Hidden';
              d.spam = 1;
              cc.push(d)
          } else {
              cc.push(d)
          }
      });
      
      resolve(cc)
    });
  })
}