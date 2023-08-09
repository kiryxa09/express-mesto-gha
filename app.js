const path = require('path');
const httpConstants = require('http2').constants;
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();

mongoose.connect(DB_URL, {
});

app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64d36b243de4edeb541b6d11',
  };

  next();
});
app.use('/cards', require('./routes/cards'));
app.use('/users', require('./routes/users'));

app.use((req, res) => {
  res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Данной страницы не существет' });
});

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
});
