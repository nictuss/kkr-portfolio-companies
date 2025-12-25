import { Controller, Post } from '@nestjs/common';
import { ScraperService } from './scraper.service';

@Controller('scraper')
export class ScraperController {
  constructor(private scraperService: ScraperService) {}

  @Post()
  public async updateData() {
    return this.scraperService.updateData();
  }
}
