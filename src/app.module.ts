import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { MongooseModule } from '@nestjs/mongoose';
import { BrowserModule } from './browser/browser.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/kkr'),
    CompaniesModule,
    BrowserModule,
    ScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
