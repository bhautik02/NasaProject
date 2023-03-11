const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const api = require('./routes/api');
const app = express();

// app.use(morgan('combined'));
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

// Here React is handling rout if above routes does not mathc any
app.use('/v1', api);
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
