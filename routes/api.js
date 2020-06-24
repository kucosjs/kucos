const express  = require('express');
const app      = express();

const comment  = require('./comment');
const kudo  = require('./kudo');

app.use('/', kudo);
app.use('/', comment);

module.exports = app;