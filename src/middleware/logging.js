/**
 * Winston Logger
 * - JSON format in production (structured logging for Render)
 * - Pretty-printed colorized output in development
 * - Morgan HTTP request logging integration
 */

const winston = require('winston');

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

// Custom format for development: colorized, human-readable
const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${stack || message}${metaStr}`;
  })
);

// Production format: structured JSON for Render logs
const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'yogaflow-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});

/**
 * Morgan stream adapter — pipes HTTP request logs through Winston.
 * Usage: app.use(morgan('combined', { stream: logger.morganStream }))
 */
logger.morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;
