import pino from 'pino';

/**
 * Singleton logger instance
 *
 * This provides structured, leveled logging throughout the application.
 * By default, it logs in a human-readable format. In a production environment,
 * you would typically remove the transport and log in JSON format.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
    },
  },
});
