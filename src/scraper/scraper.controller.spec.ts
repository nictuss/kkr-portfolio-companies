import { Test, TestingModule } from '@nestjs/testing';
import { ScraperController } from './scraper.controller';
import { ScraperService } from './scraper.service';

describe('ScraperController', () => {
  let controller: ScraperController;

  const mockScraperService = {
    updateCompaniesData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScraperController],
      providers: [{ provide: ScraperService, useValue: mockScraperService }],
    }).compile();

    controller = module.get<ScraperController>(ScraperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should not update company data', async () => {
    mockScraperService.updateCompaniesData = jest.fn().mockResolvedValue(false);
    const result = await controller.updateCompaniesData();
    expect(result).toEqual({
      success: false,
      message: 'Something went wrong while scraping company data',
    });
  });

  it('should not update company data and throw error', async () => {
    mockScraperService.updateCompaniesData = jest
      .fn()
      .mockRejectedValue(new Error('Wrong state'));
    await expect(controller.updateCompaniesData()).rejects.toThrow(
      new Error('Wrong state'),
    );
  });

  it('should update company data', async () => {
    mockScraperService.updateCompaniesData = jest.fn().mockResolvedValue(true);
    const result = await controller.updateCompaniesData();
    expect(result).toEqual({
      success: true,
      message: 'Company data scraped with success',
    });
  });
});
