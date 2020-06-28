const express  = require('express');
const logger   = require('morgan');
const mongoose = require('mongoose');
const path     = require('path');
const swig     = require('swig');
const session  = require('express-session');
const cookieParser = require('cookie-parser');
const config   = require('./config');
const admin  = require('./routes/admin');
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

swig.setDefaults({ loader: swig.loaders.fs(__dirname + '/templates' )});
app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(cookieParser());
app.use(session({secret: "KUCOS_CHANGE_THIS", resave:false, saveUninitialized:true}));
app.use(express.static( path.join(__dirname, 'public'), { maxAge: 3600000 } )); // 3600000msec == 1hour
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: false })); // Parse application/x-www-form-urlencoded

/* CORS */
app.use((req, res, next) => {
  var origin = req.headers.origin;
  if (origin == undefined) origin = config.allowedHostname[0];
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});


swig.setFilter('contains', function(arr, value) {
  if (arr.some(a => a.comment_id === value)) {
    return true;
  }
});

//Route Prefixes for Admin panel
app.use('/', admin);

//Route Prefixes for API
app.use('/api', api);

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
