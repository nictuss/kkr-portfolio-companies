import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { CompaniesService } from '../companies/companies.service';
import { BrowserService } from '../browser/browser.service';

describe('ScraperService', () => {
  let service: ScraperService;

  const mockBrowserService = {};
  const mockCompaniesService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        { provide: BrowserService, useValue: mockBrowserService },
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
