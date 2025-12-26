import { Test, TestingModule } from '@nestjs/testing';
import { BrowserService } from './browser.service';
import { Browser, Page } from 'puppeteer';
import Mocked = jest.Mocked;

const puppeteerLaunchMock = jest.fn();
jest.mock('puppeteer', () => ({
  launch: (...args: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-return
    return puppeteerLaunchMock(...args);
  },
}));

describe('BrowserService', () => {
  let service: BrowserService;
  let mockBrowser: jest.Mocked<Browser>;
  let mockPage: jest.Mocked<Page>;
  const mockNewPage: jest.MockedFunction<() => Promise<Page>> = jest.fn();
  const mockBrowserClose: jest.MockedFunction<() => Promise<void>> = jest.fn();
  const mockPageClose: jest.MockedFunction<() => Promise<void>> = jest.fn();
  const mockSetViewport: jest.MockedFunction<() => Promise<void>> = jest.fn();

  beforeEach(async () => {
    mockBrowser = {
      newPage: mockNewPage,
      close: mockBrowserClose,
    } as unknown as Mocked<Browser>;

    mockPage = {
      setViewport: mockSetViewport,
      close: mockPageClose,
    } as unknown as Mocked<Page>;

    puppeteerLaunchMock.mockResolvedValue(mockBrowser);
    mockBrowser.newPage.mockResolvedValue(mockPage);

    const module: TestingModule = await Test.createTestingModule({
      providers: [BrowserService],
    }).compile();

    service = module.get<BrowserService>(BrowserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should initialize the browser on module init', async () => {
      await service.onModuleInit();

      expect(puppeteerLaunchMock).toHaveBeenCalledWith({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });
    });

    it('should not initialize browser twice if already initialized', async () => {
      await service.onModuleInit();
      await service.onModuleInit();

      expect(puppeteerLaunchMock).toHaveBeenCalledTimes(1);
    });

    it('should log and throw error if browser initialization fails', async () => {
      const error = new Error('Launch failed');
      puppeteerLaunchMock.mockRejectedValueOnce(error);

      await expect(service.onModuleInit()).rejects.toThrow('Launch failed');
    });
  });

  describe('createPage', () => {
    beforeEach(async () => {
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it('should create a new page with viewport settings', async () => {
      const page = await service.createPage();

      expect(mockNewPage).toHaveBeenCalled();
      expect(mockSetViewport).toHaveBeenCalledWith({
        width: 1920,
        height: 1080,
      });
      expect(page).toBe(mockPage);
    });

    it('should initialize browser if not initialized before creating page', async () => {
      const uninitializedService = new BrowserService();

      await uninitializedService.createPage();

      expect(puppeteerLaunchMock).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
      expect(mockSetViewport).toHaveBeenCalledWith({
        width: 1920,
        height: 1080,
      });
    });

    it('should handle multiple page creations', async () => {
      const page1 = await service.createPage();
      const page2 = await service.createPage();

      expect(mockNewPage).toHaveBeenCalledTimes(2);
      expect(page1).toBe(mockPage);
      expect(page2).toBe(mockPage);
    });
  });

  describe('closePage', () => {
    beforeEach(async () => {
      await service.onModuleInit();
      jest.clearAllMocks();
    });

    it('should close the page successfully', async () => {
      const page = await service.createPage();
      await service.closePage(page);

      expect(mockPageClose).toHaveBeenCalled();
    });

    it('should log warning if page close fails', async () => {
      const page = await service.createPage();
      const error = new Error('Close failed');
      mockPageClose.mockRejectedValueOnce(error);

      await service.closePage(page);

      expect(mockPageClose).toHaveBeenCalled();
    });

    it('should not throw error if page close fails', async () => {
      const page = await service.createPage();
      mockPageClose.mockRejectedValueOnce(new Error('Close failed'));

      await expect(service.closePage(page)).resolves.not.toThrow();
    });
  });

  describe('onModuleDestroy', () => {
    it('should close the browser on module destroy', async () => {
      await service.onModuleInit();
      jest.clearAllMocks();

      await service.onModuleDestroy();

      expect(mockBrowserClose).toHaveBeenCalled();
    });

    it('should handle destroy when browser is not initialized', async () => {
      await service.onModuleDestroy();

      expect(mockBrowserClose).not.toHaveBeenCalled();
    });

    it('should reset isInitialized flag after closing', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();
      jest.clearAllMocks();
      await service.createPage();
      expect(puppeteerLaunchMock).toHaveBeenCalled();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full lifecycle: init -> create page -> close page -> destroy', async () => {
      await service.onModuleInit();
      const page = await service.createPage();
      await service.closePage(page);
      await service.onModuleDestroy();

      expect(puppeteerLaunchMock).toHaveBeenCalledTimes(1);
      expect(mockNewPage).toHaveBeenCalledTimes(1);
      expect(mockPageClose).toHaveBeenCalledTimes(1);
      expect(mockBrowserClose).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple pages lifecycle', async () => {
      await service.onModuleInit();

      const page1 = await service.createPage();
      const page2 = await service.createPage();

      await service.closePage(page1);
      await service.closePage(page2);

      await service.onModuleDestroy();

      expect(mockNewPage).toHaveBeenCalledTimes(2);
      expect(mockPageClose).toHaveBeenCalledTimes(2);
      expect(mockBrowserClose).toHaveBeenCalledTimes(1);
    });

    it('should reinitialize after destroy and subsequent page creation', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();

      jest.clearAllMocks();

      await service.createPage();

      expect(puppeteerLaunchMock).toHaveBeenCalled();
      expect(mockNewPage).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle error during page creation', async () => {
      await service.onModuleInit();
      const error = new Error('Page creation failed');
      mockNewPage.mockRejectedValueOnce(error);

      await expect(service.createPage()).rejects.toThrow(
        'Page creation failed',
      );
    });

    it('should handle error during viewport setting', async () => {
      await service.onModuleInit();
      const error = new Error('Viewport setting failed');
      mockSetViewport.mockRejectedValueOnce(error);

      await expect(service.createPage()).rejects.toThrow(
        'Viewport setting failed',
      );
    });

    it('should handle error during browser close gracefully', async () => {
      await service.onModuleInit();
      mockBrowserClose.mockRejectedValueOnce(new Error('Close failed'));
      await expect(service.onModuleDestroy()).rejects.toThrow('Close failed');
    });
  });
});
