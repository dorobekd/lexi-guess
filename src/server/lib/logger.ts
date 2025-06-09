import { NextRequest, NextResponse } from 'next/server';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lexi-guess' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf((info) => {
          const { timestamp, level, message, ...meta } = info;
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} ${level}: ${message} ${metaStr}`;
        })
      )
    })
  ]
});

// Add request context middleware for Next.js API routes
export async function withRequestLogger(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();
  logger.defaultMeta = { ...logger.defaultMeta, requestId };
  return handler(req);
}

export default logger; 