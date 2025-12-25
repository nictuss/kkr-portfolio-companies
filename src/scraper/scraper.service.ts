import { Injectable, Logger } from '@nestjs/common';
import { BrowserService } from '../browser/browser.service';
import { Page } from 'puppeteer';
import { Company } from '../companies/schemas/company.schema';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class ScraperService {
  private logger: Logger;
  constructor(
    private browserService: BrowserService,
    private companiesService: CompaniesService,
  ) {
    this.logger = new Logger();
  }

  public async updateData(): Promise<boolean> {
    this.logger.debug('Scraping website...');
    const page = await this.browserService.createPage();
    await page.goto('https://www.kkr.com/invest/portfolio');
    await this.acceptCookies(page);
    const companies = await this.getTableData(page);
    await this.browserService.closePage(page);
    this.logger.debug(`Retrieved info about ${companies.length} companies`);
    console.log(companies.map((company) => company.lastUpdate));
    const createdData = await this.companiesService.bulkCreate(companies);
    return !!createdData?.length;
  }

  private async acceptCookies(page: Page) {
    const ACCEPT_COOKIES_SELECTOR = '#onetrust-accept-btn-handler';
    this.logger.verbose('Waiting for cookies modal to show...');
    try {
      const acceptCookiesButton = await page.waitForSelector(
        ACCEPT_COOKIES_SELECTOR,
        { timeout: 3000 },
      );
      await acceptCookiesButton?.click();
    } catch (e) {
      this.logger.warn(e);
    }
    this.logger.debug('Cookies accepted');
  }

  private async getTableData(page: Page) {
    const NEW_PAGE_SELECTOR =
      '#bioportfoliosearch-1da9a4c204 > div.cmp-portfolio-filter__table > div.cmp-portfolio-filter__result--pagination > span.cmp-portfolio-filter__result--pagination-right-arrow';
    const tableData: Company[] = [];
    let newPage: boolean = true;
    let pageIndex: number = 1;
    this.logger.debug('Getting companies data...');
    while (newPage) {
      await page.waitForNetworkIdle({ timeout: 10000 });
      const pageData = await this.getPageData(page, pageIndex, new Date());
      tableData.push(...pageData);
      try {
        await page.click(NEW_PAGE_SELECTOR);
      } catch (e: any) {
        if (
          (e as Error).message ===
          'Node is either not clickable or not an Element'
        ) {
          newPage = false;
        }
      }
      pageIndex += pageData.length;
    }
    return tableData;
  }

  private async getPageData(
    page: Page,
    pageIndex: number,
    updateDate: Date,
  ): Promise<Company[]> {
    return page.evaluate(
      ({ pageIndex, updateDate }) => {
        const rows = Array.from(
          document.getElementsByClassName('toggle-table-row-click'),
        );
        return rows.map((row: Element, index: number) => {
          (row as HTMLElement).click();

          const modal = document.querySelector('#portfolio-flyout');

          const name =
            modal
              ?.querySelector('.cmp-portfolio-filter__portfolio-title')
              ?.textContent?.trim() || '';
          const description =
            modal
              ?.querySelector('.cmp-portfolio-filter__portfolio-description p')
              ?.textContent?.trim() || '';
          const logoSrc = `https://kkr.com${
            modal
              ?.querySelector('.cmp-portfolio-filter__portfolio-header img')
              ?.getAttribute('src') || ''
          }`;

          // General details
          const headQuarter =
            modal
              ?.querySelector('.hq-details .sub-desc')
              ?.textContent?.trim() || '';
          const websiteLink = modal?.querySelector(
            '.website-details .site-link',
          );
          const website = websiteLink?.getAttribute('href') || '';

          const assetClass =
            modal
              ?.querySelector('.asset-details .sub-desc')
              ?.textContent?.trim() || '';
          const industry =
            modal
              ?.querySelector('.industry-details .sub-desc')
              ?.textContent?.trim() || '';
          const regionDistribution =
            modal
              ?.querySelector('.region-details .sub-desc')
              ?.textContent?.trim() || '';
          const year =
            modal
              ?.querySelector('.year-details .sub-desc')
              ?.textContent?.trim() || '';

          const relatedLinks = Array.from(
            modal?.querySelectorAll(
              '.cmp-portfolio-filter__additional-details--values a.site-link',
            ) || [],
          )
            .map((linkDiv) => {
              const link = linkDiv.querySelector('a');
              if (!link) return null;
              const href = link.getAttribute('href');
              const text = link.textContent?.trim() || '';
              return { text, url: href };
            })
            .filter((link) => !!link);

          const closeBtn = document.querySelector(
            '.cmp-portfolio-filter__close-btn',
          );
          (closeBtn as HTMLElement).click();

          return {
            sequenceNumber: pageIndex + index,
            name,
            description,
            logoSrc,
            headQuarter,
            website,
            assetClass,
            industry,
            regionDistribution,
            year,
            relatedLinks,
            lastUpdate: updateDate,
          };
        });
      },
      { pageIndex, updateDate },
    );
  }
}
