const express = require('express');

const expressApp = express();
let cachedApp = null;

async function bootstrap() {
  if (cachedApp) return cachedApp;

  // Dynamic require — dist/ only exists after buildCommand runs
  const { NestFactory } = require('@nestjs/core');
  const { ExpressAdapter } = require('@nestjs/platform-express');
  const { ValidationPipe } = require('@nestjs/common');
  const { AppModule } = require('../dist/app.module');

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  });

  await app.init();
  cachedApp = expressApp;
  return cachedApp;
}

module.exports = async function handler(req, res) {
  const server = await bootstrap();
  server(req, res);
};
