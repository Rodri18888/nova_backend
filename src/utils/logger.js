import winston from 'winston'
import 'winston-daily-rotate-file'

const isProduction = process.env.NODE_ENV === 'production'

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const base = `${timestamp} [${level.toUpperCase()}] ${message}`
    return stack ? `${base}\n${stack}` : base
  }),
)

const errorFile = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '10m',
  maxFiles: '14d',
})

const logger = winston.createLogger({
  level: 'debug',
  format: logFormat,
  transports: [
    errorFile,
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),
  ],
})

if (isProduction) {
  logger.add(
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d',
    }),
  )
}

export default logger