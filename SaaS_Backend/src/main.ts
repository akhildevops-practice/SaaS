import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { join } from 'path';
import { AppModule } from './app.module';
import { SocketAdapter } from './websocket/socket.adapter';

import { ValidationPipe } from '@nestjs/common';
import axios from 'axios';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as winston from 'winston';
import { createLogger, transports, format } from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as prometheusClient from 'prom-client';

import { MongoClient } from 'mongodb';
const client = new MongoClient(process.env.MONGO_DB_URI1);

dotenv.config();
const logDirectory = process.env.LOGS;
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}
const logger = winston.createLogger({
  level: 'debug',
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDirectory, 'applicationMemoryLog.log'),
    }),
  ],
  format: format.combine(
    format.timestamp(),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}] - ${info.message}`,
    ),
  ),
});

// Track API call times and counts
const apiStats: Record<
  string,
  { count: number; lastCallTime: number; timeout?: NodeJS.Timeout }
> = {};
async function bootstrap() {
  const cron = require('node-cron');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(process.env.FOLDER_PATH);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();

  // Middleware for logging API memory usage
  app.use((req, res, next) => {
    const apiPath = req.originalUrl;
    const currentTime = Date.now();

    if (!apiStats[apiPath]) {
      apiStats[apiPath] = { count: 0, lastCallTime: 0 };
    }

    apiStats[apiPath].count++;
    apiStats[apiPath].lastCallTime = currentTime;

    // If first request in 1 second, set a timeout to log warning
    if (!apiStats[apiPath].timeout) {
      apiStats[apiPath].timeout = setTimeout(() => {
        if (apiStats[apiPath].count > 1) {
          logger.warn(
            `⚠️ Multiple calls detected to ${apiPath} within 1 second! Total Calls: ${apiStats[apiPath].count}`,
          );
        }

        // Reset count & clear timeout after logging
        apiStats[apiPath].count = 0;
        apiStats[apiPath].timeout = undefined;
      }, 1000);
    }

    // Force Garbage Collection if `--expose-gc` is enabled (optional)
    if (global.gc) global.gc();
    if (typeof global.gc === 'undefined') {
      logger.warn(`❌ GC is NOT enabled.`);
    }

    const memoryBefore = process.memoryUsage().heapUsed;
    let peakMemoryUsed = memoryBefore;

    const originalWrite = res.write;
    const originalEnd = res.end;

    const updateMemoryUsage = () => {
      const currentMemory = process.memoryUsage().heapUsed;
      if (currentMemory > peakMemoryUsed) {
        peakMemoryUsed = currentMemory;
      }
    };

    // Hook into the response write & end methods
    res.write = function (...args) {
      updateMemoryUsage();
      return originalWrite.apply(this, args);
    };

    res.end = function (...args) {
      updateMemoryUsage();
      const memoryUsed = (peakMemoryUsed - memoryBefore) / (1024 * 1024);

      logger.info(
        `📊 API: ${apiPath} | Peak Memory Used: ${memoryUsed.toFixed(
          2,
        )} MB (Before: ${(memoryBefore / (1024 * 1024)).toFixed(
          2,
        )} MB, Peak: ${(peakMemoryUsed / (1024 * 1024)).toFixed(2)} MB)`,
      );

      return originalEnd.apply(this, args);
    };

    next();
  });
  //const response = await startChangeStream();
  //const auditTrail = await auditTrial();

  // const config = new DocumentBuilder()
  //   .setTitle('PRS api list')
  //   .setDescription('The PRS API description')
  //   .setVersion('1.0')
  //   .addTag('PRS')
  //   .build();
  // app.get('http://localhost:5000/api/audits/startCron');
  // const document = SwaggerModule.createDocument(app, config);

  // SwaggerModule.setup('api', app, document);

  // app.use('/proxy/pdfs', async (req, res) => {
  //   const pdfUrl = req.query.url as string; // Get the PDF URL from the query parameter
  //   try {
  //     const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
  //     const pdfData = response.data;
  //     res.setHeader('Content-Type', 'application/pdf');
  //     res.send(pdfData);
  //   } catch (error) {
  //     res.status(500).send('Error fetching PDF');
  //   }
  // });

  app.use('/proxy/pdf', async (req, res) => {
    const fileUrl = req.query.url as string; // Get the file URL from the query parameter
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'arraybuffer',
      });
      const fileData = response.data;

      // Determine file type
      const type = fileUrl?.split('.').pop();
      // Set appropriate content type
      let contentType = '';
      if (type) {
        switch (type) {
          case 'pdf':
            contentType = 'application/pdf';
            break;
          case 'jpg':
            contentType = 'image/jpeg';
            break;
          case 'jpeg':
            contentType = 'image/jpeg';
            break;
          case 'png':
            contentType = 'image/png';
            break;
          case 'docx':
            contentType =
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            break;
          case 'gif':
            contentType = 'image/gif';
            break;
          default:
            res.status(500).send('Unsupported file type');
            return;
        }
      } else {
        res.status(500).send('Unknown file type');
        return;
      }

      // Set the appropriate content type header and send the file data
      res.setHeader('Content-Type', contentType);
      res.send(fileData);
    } catch (error) {
      res.status(500).send('Error fetching file');
    }
  });

  app.use('/proxy/docx', async (req, res) => {
    const docxUrl = req.query.url as string; // Get the DOCX URL from the query parameter
    try {
      const response = await axios.get(docxUrl, {
        responseType: 'arraybuffer',
      });
      const docxData = response.data;
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ); // Set the content type for DOCX files
      res.send(docxData);
    } catch (error) {
      res.status(500).send('Error fetching DOCX');
    }
  });

  app.useWebSocketAdapter(new SocketAdapter(app));

  // Use global validation pipe if needed
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true,
  //     whitelist: false,
  //     forbidNonWhitelisted: false,
  //     forbidUnknownValues: false,
  //     skipNullProperties: true,
  //     skipMissingProperties: true,
  //   }),
  // );

  const httpRequestCounter = new prometheusClient.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  const responseTimeHistogram = new prometheusClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
  });

  const memoryUsageGauge = new prometheusClient.Gauge({
    name: 'memory_usage_bytes',
    help: 'Memory usage in bytes',
  });

  setInterval(() => {
    memoryUsageGauge.set(process.memoryUsage().rss);
  }, 5000);

  // 4. Job Success / Failure Counters
  const jobSuccess = new prometheusClient.Counter({
    name: 'job_success_total',
    help: 'Count of successful jobs',
  });

  const jobFailure = new prometheusClient.Counter({
    name: 'job_failure_total',
    help: 'Count of failed jobs',
  });

  app.use((req, res, next) => {
    const end = responseTimeHistogram.startTimer(); // start timer

    res.on('finish', () => {
      httpRequestCounter.inc({
        method: req.method,
        route: req.path,
        status_code: res.statusCode,
      });

      end({ method: req.method, route: req.path, status_code: res.statusCode }); // stop timer
      // Job success/failure tracking based on status code
      if (res.statusCode >= 200 && res.statusCode < 300) {
        jobSuccess.inc();
      } else {
        jobFailure.inc();
      }
    });

    next();
  });

  // Enable metrics collection
  prometheusClient.collectDefaultMetrics();

  // Add metrics endpoint
  app.use('/metrics', async (req, res) => {
    res.set('Content-Type', prometheusClient.register.contentType);
    res.send(await prometheusClient.register.metrics());
  });

  await app.listen(5000);
}

bootstrap();
