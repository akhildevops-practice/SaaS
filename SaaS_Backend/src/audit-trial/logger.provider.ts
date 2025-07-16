if (typeof global.ReadableStream === 'undefined') {
  const { ReadableStream } = require('web-streams-polyfill');
  global.ReadableStream = ReadableStream;
}

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { LoggerService } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { ElasticsearchTransport } from 'winston-elasticsearch';
import { Client } from '@elastic/elasticsearch';

dotenv.config();

export class CustomLogger implements LoggerService {
  private readonly logger;

  constructor() {
    const logDirectory = process.env.LOGS || './logs';
    const logLevel = process.env.LOG_LEVEL || 'info';
    const logType = process.env.LOG_TYPE || 'console';

    const es_url = process.env.ES_URL;
    const es_un = process.env.ES_USERNAME;
    const es_pwd = process.env.ES_PASSWORD;
    const es_index = process.env.ES_INDEX;

    if (!fs.existsSync(logDirectory)) {
      fs.mkdirSync(logDirectory, { recursive: true });
    }

    const transportList = [];

    //console settings
    if (['console', 'both', 'all'].includes(logType)) {
      transportList.push(new transports.Console());
    }

    // file settings
    if (['file', 'both', 'all'].includes(logType)) {
      transportList.push(
        new transports.File({
          filename: path.join(logDirectory, 'application.log'),
        }),
      );
    }

    //only if es details are available and includes all
    if (es_url && es_un && es_pwd && es_index) {
      const esClient = new Client({
        node: es_url,
        auth: {
          username: es_un,
          password: es_pwd,
        },
        tls: {
          rejectUnauthorized: false,
        },
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
        maxRetries: 5,
        requestTimeout: 10000,
        sniffOnStart: false,
      });

      const esTransport = new ElasticsearchTransport({
        level: logLevel,
        client: esClient,
        index: es_index,
        transformer: (logData: any) => ({
          '@timestamp': new Date().toISOString(),
          message: logData.message,
          level: logData.level,
          context: logData.context || undefined,
          trace: logData.trace || undefined,
        }),
      });

      esTransport.on('error', (err) => {
        console.error('❌ Elasticsearch Transport Error:', err);
      });

      transportList.push(esTransport);
    }

    // 🔧 Create Logger
    this.logger = createLogger({
      level: logLevel,
      transports: transportList,
      format: format.combine(
        format.timestamp(),
        format.printf(
          (info) =>
            `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`,
        ),
      ),
    });

    // ✅ Bootstrap log
    this.logger.info('🚀 Logger initialized and ready', {
      context: 'Bootstrap',
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
