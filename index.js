const express  = require('express');
const logger   = require('morgan');
const mongoose = require('mongoose');
const path     = require('path');
const cookieParser = require('cookie-parser');

const config   = require('./config');
const api      = require('./routes/api');
const app      = express();

if (process.env.NODE_ENV == 'production') {
  var database = config.dbProduction;
} else {
  database = config.dbDev;
  app.use(logger('dev'));
}

// Connecting to the database
mongoose.connect(database, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

app.use(cookieParser());
app.use(express.static( path.join(__dirname, 'public'), { maxAge: 3600000 } )); // 3600000msec == 1hour
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: false })); // Parse application/x-www-form-urlencoded

/* CORS */
app.use((req, res, next) => {
  var origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

//Route Prefixes for API
app.use('/api',validateCookie, api);

function validateCookie(req, res, next) {

  if ( req.app.get('etagUser') != undefined) {
    if (req.app.get('etagUser') != req.cookies.spartan) {
      saveCookie(req, res);
    }
  }

  if ( req.app.get('etagUser') == undefined && req.cookies.spartan != undefined) {
    app.set('etagUser', req.cookies.spartan)
  }

  if ( req.cookies.spartan != undefined ) {
    next();
  } else {
    saveCookie(req, res);
  }

} 

function saveCookie(req, res) {
  if ( req.app.get('etagUser') != undefined ) {
    var expiryDate = new Date(Number(new Date()) + 315360000000); 
    res.cookie('spartan', req.app.get('etagUser'), { expires: expiryDate, sameSite: false });
  } else {
    return res.status(401).json("Please turn on JavaScript on your browser, or there's just the cookie verification error.");
  }
}

// handle errors
if (process.env.NODE_ENV == 'production') {
  // eslint-disable-next-line no-unused-vars
  app.use(function(err, req, res, next) {
    if (err.status === 500)
        res.status(500).json({ message: "Something looks wrong" });
    else
        res.status(500).json({ message: "Something looks wrong" });
  });
}

// throw 404 if URL not found
app.all("*", function(req, res) {
  return res.status(404).json({ message: "Page not found" });
});

app.listen(3000, function() {
  console.log('Node server listening on port 3000');
});
