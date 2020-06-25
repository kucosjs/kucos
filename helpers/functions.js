const config = require('../config');
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