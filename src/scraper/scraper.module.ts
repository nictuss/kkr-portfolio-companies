import { Module } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { ScraperController } from './scraper.controller';
import { BrowserModule } from '../browser/browser.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [BrowserModule, CompaniesModule],
  providers: [ScraperService],
  controllers: [ScraperController],
})
export class ScraperModule {}
