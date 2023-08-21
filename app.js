const path = require('path');
const httpConstants = require('http2').constants;
const helmet = require('helmet');
const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const {
  createUser, login,
} = require('./controllers/users');
const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/errorHandler');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

const app = express();
app.use(cookieParser());
mongoose.connect(DB_URL, {
});

app.use(helmet());
app.use(express.json());

app.post('/signin', login);
app.post('/signup', createUser);

app.use('/cards', auth, require('./routes/cards'));
app.use('/users', auth, require('./routes/users'));

app.use((req, res) => {
  res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Данной страницы не существет' });
});

app.use(errors());
app.use(errorHandler);
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, () => {
});
