const express = require('express');
const mongoose = require('mongoose');
const { PORT = 3000 } = process.env;
const path = require('path');
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




app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
  console.log('Ссылка на сервер');
});

