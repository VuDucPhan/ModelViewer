const express = require('express');
const { PORT } = require('./config.js');

const app = express();
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));

// Xử lý môi trường Vercel hoặc môi trường local
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
}
