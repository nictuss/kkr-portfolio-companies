import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger } from '@nestjs/common';
import { LoggerInterceptor } from './interceptors/logger.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'kkr',
      timestamp: true,
    }),
  });
  app.useGlobalInterceptors(new LoggerInterceptor());
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap().catch(console.error);
