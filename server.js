const express = require('express');
const { PORT } = require('./config.js');

let app = express();
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

// Handle other errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Internal Server Error');
});

// Check if running on Vercel (serverless) or traditional environment
if (process.env.VERCEL) {
  // For Vercel, export the Express app
  module.exports = app;
} else {
  // For local development, start the server
  app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
}
