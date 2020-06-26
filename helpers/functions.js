const config = require('../config');
const moment = require('moment');
const ar = require('./responses');
const fc = require("../helpers/functions");
const Slimdown = require("../helpers/slimdown");
let sd = new Slimdown();

//const akismet = require('akismet-api')

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
    res.cookie('kucos', uuid, { expires: expiryDate, sameSite: false });
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
    comments = [].concat(comments, {id: d._id, author: d.author, comment: sd.render(fc.cleanHtml(d.comment)), email: d.email, website: d.website, parent_id: d.parent_id, createdOn: d.createdOn, createdOnTime: moment(d.createdOn).format('dddd, MMMM Do YYYY, HH:mm:ss'), created: moment(d.createdOn).fromNow(), updatedOn: moment(d.updatedOn).format('dddd, MMMM Do YYYY, HH:mm:ss'), likes: d.likes, dislikes: d.dislikes, score: d.likes - d.dislikes });
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

/*exports.checkCommentSpam = async function checkCommentSpam(req, data) {

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const useragent = req.get('user-agent');

  const comment = {
      ip: ip,
      useragent: useragent,
      content: data.comment,
      email: data.email,
      name: data.name
  }

  try {
      const isSpam = await akismet.checkSpam(comment)
     
      if (isSpam) console.log('OMG Spam!')
      else console.log('Totally not spam')

  } catch (err) {
      console.error('Something went wrong:', err.message)
  }

},*/