import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { MongooseModule } from '@nestjs/mongoose';
import { BrowserModule } from './browser/browser.module';
import { ScraperModule } from './scraper/scraper.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    CompaniesModule,
    BrowserModule,
    ScraperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
