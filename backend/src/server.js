const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// ------------------------------------------------------------
// Security headers
// ------------------------------------------------------------
app.use(helmet());

// ------------------------------------------------------------
// CORS — explicit allow-list from env config, never "*".
// An auth API with origin:"*" would let any website read
// authenticated responses via the victim's browser session.
// ------------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (curl/Postman) which send no origin
      if (!origin || env.cors.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// ------------------------------------------------------------
// Routes
// ------------------------------------------------------------
app.get('/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api', routes);

// ------------------------------------------------------------
// 404 + centralized error handling (must be last)
// ------------------------------------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on port ${env.port} [${env.nodeEnv}]`);
});

module.exports = app;
