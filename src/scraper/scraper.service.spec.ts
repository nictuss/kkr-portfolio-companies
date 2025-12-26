import { Test, TestingModule } from '@nestjs/testing';
import { ScraperService } from './scraper.service';
import { BrowserService } from '../browser/browser.service';
import { CompaniesService } from '../companies/companies.service';
import { Page } from 'puppeteer';
import Mocked = jest.Mocked;

describe('ScraperService', () => {
  let service: ScraperService;
  let mockPage: jest.Mocked<Page>;
  const mockGoto = jest.fn();
  const mockWaitForSelector = jest.fn();
  const mockClick = jest.fn();
  const mockEvaluate = jest.fn();
  const mockCreatePage = jest.fn();
  const mockClosePage = jest.fn();
  const mockBulkCreate = jest.fn();
  const now = new Date();

  beforeEach(async () => {
    mockPage = {
      goto: mockGoto,
      waitForSelector: mockWaitForSelector,
      waitForNetworkIdle: jest.fn(),
      click: mockClick,
      evaluate: mockEvaluate,
    } as unknown as Mocked<Page>;

    const mockBrowserService = {
      createPage: mockCreatePage.mockResolvedValue(mockPage),
      closePage: mockClosePage.mockResolvedValue(undefined),
    };

    const mockCompaniesService = {
      bulkCreate: mockBulkCreate.mockResolvedValue({ isOk: () => true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScraperService,
        {
          provide: BrowserService,
          useValue: mockBrowserService,
        },
        {
          provide: CompaniesService,
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    service = module.get<ScraperService>(ScraperService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateCompaniesData', () => {
    it('should successfully scrape and update companies data', async () => {
      const mockCompanies = [
        {
          sequenceNumber: 1,
          name: 'Test Company',
          description: 'Test Description',
          logoSrc: 'https://kkr.com/logo.png',
          headQuarter: 'New York',
          website: 'https://example.com',
          assetClass: 'Private Equity',
          industry: 'Technology',
          regionDistribution: 'North America',
          year: '2020',
          relatedLinks: [],
          lastUpdate: now,
        },
      ];

      const mockAcceptButton = {
        click: jest.fn().mockResolvedValue(undefined),
      };

      mockWaitForSelector.mockResolvedValue(mockAcceptButton as any);
      mockEvaluate.mockResolvedValue(mockCompanies);
      mockClick.mockRejectedValueOnce(
        new Error('Node is either not clickable or not an Element'),
      );

      const result = await service.updateCompaniesData();

      expect(result).toBe(true);
      expect(mockCreatePage).toHaveBeenCalledTimes(1);
      expect(mockGoto).toHaveBeenCalledWith(
        'https://www.kkr.com/invest/portfolio',
      );
      expect(mockBulkCreate).toHaveBeenCalledWith(mockCompanies);
      expect(mockClosePage).toHaveBeenCalledWith(mockPage);
    });

    it('should handle cookies acceptance on first run', async () => {
      const mockAcceptButton = {
        click: jest.fn().mockResolvedValue(undefined),
      };

      mockWaitForSelector.mockResolvedValue(mockAcceptButton as any);
      mockEvaluate.mockResolvedValue([]);
      mockClick.mockRejectedValue(
        new Error('Node is either not clickable or not an Element'),
      );

      await service.updateCompaniesData();

      expect(mockWaitForSelector).toHaveBeenCalledWith(
        '#onetrust-accept-btn-handler',
        { timeout: 3000 },
      );
      expect(mockAcceptButton.click).toHaveBeenCalled();
    });

    it('should not accept cookies on subsequent runs', async () => {
      const mockAcceptButton = {
        click: jest.fn().mockResolvedValue(undefined),
      };

      mockWaitForSelector.mockResolvedValue(mockAcceptButton as any);
      mockEvaluate.mockResolvedValue([]);
      mockClick.mockRejectedValue(
        new Error('Node is either not clickable or not an Element'),
      );
      await service.updateCompaniesData();
      jest.clearAllMocks();
      await service.updateCompaniesData();
      expect(mockWaitForSelector).not.toHaveBeenCalled();
    });

    it('should handle cookies acceptance timeout gracefully', async () => {
      mockWaitForSelector.mockRejectedValue(new Error('Timeout'));
      mockEvaluate.mockResolvedValue([]);
      mockClick.mockRejectedValue(
        new Error('Node is either not clickable or not an Element'),
      );

      const result = await service.updateCompaniesData();

      expect(result).toBe(true);
      expect(mockBulkCreate).toHaveBeenCalled();
    });

    it('should paginate through multiple pages', async () => {
      const page1Data = [
        {
          sequenceNumber: 1,
          name: 'Company 1',
          description: 'Description 1',
          logoSrc: 'https://kkr.com/logo1.png',
          headQuarter: 'New York',
          website: 'https://example1.com',
          assetClass: 'Private Equity',
          industry: 'Technology',
          regionDistribution: 'North America',
          year: '2020',
          relatedLinks: [],
          lastUpdate: now,
        },
      ];

      const page2Data = [
        {
          sequenceNumber: 2,
          name: 'Company 2',
          description: 'Description 2',
          logoSrc: 'https://kkr.com/logo2.png',
          headQuarter: 'London',
          website: 'https://example2.com',
          assetClass: 'Real Estate',
          industry: 'Finance',
          regionDistribution: 'Europe',
          year: '2021',
          relatedLinks: [],
          lastUpdate: now,
        },
      ];

      mockWaitForSelector.mockResolvedValue({ click: jest.fn() } as any);
      mockEvaluate
        .mockResolvedValueOnce(page1Data)
        .mockResolvedValueOnce(page2Data);

      mockClick
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(
          new Error('Node is either not clickable or not an Element'),
        );
      await service.updateCompaniesData();
      expect(mockEvaluate).toHaveBeenCalledTimes(2);
      expect(mockBulkCreate).toHaveBeenCalledWith([...page1Data, ...page2Data]);
    });

    it('should return false when bulkCreate fails', async () => {
      mockWaitForSelector.mockResolvedValue({ click: jest.fn() } as any);
      mockEvaluate.mockResolvedValue([]);
      mockClick.mockRejectedValue(
        new Error('Node is either not clickable or not an Element'),
      );
      mockBulkCreate.mockResolvedValue({ isOk: () => false });
      const result = await service.updateCompaniesData();
      expect(result).toBe(false);
    });
  });
});
