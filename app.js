const express = require('express');
const mongoose = require('mongoose');
const { PORT = 3000 } = process.env;
const path = require('path');
const httpConstants = require('http2').constants;
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
});

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64d36b243de4edeb541b6d11'
  };

  next();
});
app.use('/cards', require('./routes/cards'));
app.use('/users', require('./routes/users'));
app.use(function(req, res) {
  res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({message:'Данной страницы не существет'});
});

app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
  console.log('Ссылка на сервер: http://127.0.0.1:3000');
});

