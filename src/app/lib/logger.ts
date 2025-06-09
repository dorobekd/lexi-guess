import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'lexi-guess-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add request context middleware
export async function withRequestLogger<T>(
  requestId: string,
  fn: () => Promise<T>
): Promise<T> {
  const originalMeta = { ...logger.defaultMeta };
  logger.defaultMeta = { ...logger.defaultMeta, requestId };
  try {
    return await fn();
  } finally {
    logger.defaultMeta = originalMeta;
  }
}

export default logger; 