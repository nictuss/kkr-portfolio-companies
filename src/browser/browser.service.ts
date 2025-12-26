import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';

@Injectable()
export class BrowserService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger();
  private browser: Browser;
  private isInitialized = false;

  async onModuleInit() {
    await this.initialize();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      this.logger.debug('Initializing browser...');

      this.browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium',
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
        ],
      });

      this.isInitialized = true;
      this.logger.debug('Browser initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize browser:', error);
      throw error;
    }
  }

  async createPage(): Promise<Page> {
    if (!this.isInitialized || !this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    return page;
  }

  async closePage(page: Page) {
    try {
      await page.close();
    } catch (error) {
      this.logger.warn('Error closing page:', error);
    }
  }

  private async close() {
    if (this.browser) {
      this.logger.debug('Closing browser...');
      await this.browser.close();
      this.isInitialized = false;
    }
  }
}
