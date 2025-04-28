const express = require('express');
const { PORT } = require('./config.js');

const app = express();
app.use(express.static('wwwroot'));
app.use(require('./routes/auth.js'));
app.use(require('./routes/models.js'));

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error('Lỗi:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Đã xảy ra lỗi máy chủ nội bộ';
  res.status(statusCode).json({ error: message, details: process.env.NODE_ENV === 'production' ? null : err.stack });
});

// Xử lý môi trường Vercel hoặc môi trường local
if (process.env.VERCEL) {
  console.log('Khởi chạy ứng dụng trên Vercel');
  module.exports = app;
} else {
  app.listen(PORT, function () { console.log(`Server listening on port ${PORT}...`); });
}
