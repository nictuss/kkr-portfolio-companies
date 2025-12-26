import { Controller, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post('companies')
  public async updateCompaniesData() {
    const success = await this.scraperService.updateCompaniesData();
    return {
      success,
      message: success
        ? 'Company data scraped with success'
        : 'Something went wrong while scraping company data',
    };
  }
}
