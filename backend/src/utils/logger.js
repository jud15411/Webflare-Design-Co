const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');
const MongoDB = require('winston-mongodb').MongoDB;

const logtail = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN);

const timezoned = () => {
  return new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: timezoned }),
    winston.format.json()
  ),
  // REMOVED: options from here (incorrect placement)
  defaultMeta: { service: 'webflare-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // new LogtailTransport(logtail),

    new MongoDB({
      level: 'info',
      db: process.env.LOG_MONGODB_URI,
      collection: 'audit_logs',
      capped: true,
      size: 52428800,
      expireAfterSeconds: 2592000,
      // FIXED: Moved options here and added connection stability
      options: { useUnifiedTopology: true },
      tryReconnect: true,
      decouple: true, // Helps prevent the log from blocking the app process
    }),
  ],
});

logger.on('error', (err) => {
  console.error('LOGGER ERROR:', err);
});

module.exports = logger;
