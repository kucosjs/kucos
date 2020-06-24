const config = require('../config');
//const akismet = require('akismet-api')

exports.checkAllowedSite = async function(url) {
  url = new URL(url);

  if (config.allowedHostname.includes(url.origin))
    return false;
  else
    return true;  
}

exports.cleanHtml = function (text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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