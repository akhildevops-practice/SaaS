import { LoggerService } from '@nestjs/common';
import { createLogger, transports, format } from 'winston';

export class CustomLogger implements LoggerService {
  private readonly logger;

  constructor() {
    const path = require('path');

    this.logger = createLogger({
      transports: [
        new transports.Console(),
        new transports.File({
          filename: path.join(process.env.LOGS, 'application.log'),
        }),
        // new transports.File({ filename: 'serial-number.log' }),
      ],
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) =>
            `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`,
        ),
      ),
    });
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}
