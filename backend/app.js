const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Instead of app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Provide extended option explicitly

const apiRouter = require('./routes/apiRouter'); // Assuming your router file is here
app.use('/api', apiRouter);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
