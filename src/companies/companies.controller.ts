import { Controller, Get, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';
import { Company } from './schemas/company.schema';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}
  @Get()
  async findAll(
    @Query('_id') _id?: string,
    @Query('name') name?: string,
    @Query('assetClass') assetClass?: string,
    @Query('description') description?: string,
    @Query('headQuarter') headQuarter?: string,
    @Query('sequenceNumber') sequenceNumber?: number,
    @Query('industry') industry?: string,
    @Query('logoSrc') logoSrc?: string,
    @Query('regionDistribution') regionDistribution?: string,
    @Query('website') website?: string,
  ): Promise<{ payload: Company[]; total: number }> {
    const filters: CompanyFiltersInterface = {};

    // Helper function to process regex parameters
    const processParam = (value: string) => {
      if (value.startsWith('regex:')) {
        return { $regex: value.slice(6).trim(), $options: 'i' };
      }
      return value;
    };

    if (_id) filters._id = processParam(_id);
    if (name) filters.name = processParam(name);
    if (assetClass) filters.assetClass = processParam(assetClass);
    if (description) filters.description = processParam(description);
    if (headQuarter) filters.headQuarter = processParam(headQuarter);
    if (sequenceNumber) filters.sequenceNumber = sequenceNumber;
    if (industry) filters.industry = processParam(industry);
    if (logoSrc) filters.logoSrc = processParam(logoSrc);
    if (regionDistribution)
      filters.regionDistribution = processParam(regionDistribution);
    if (website) filters.website = processParam(website);

    const data =
      Object.keys(filters).length > 0
        ? await this.companiesService.findAll(filters)
        : await this.companiesService.findAll();

    return {
      payload: data,
      total: data.length,
    };
  }
}
