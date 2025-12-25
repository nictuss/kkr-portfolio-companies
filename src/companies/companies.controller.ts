import { Controller, Get, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';
import { Company } from './schemas/company.schema';

@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}
  @Get()
  async findAll(
    @Query('name') name?: string,
    @Query('assetClass') assetClass?: string,
    @Query('industry') industry?: string,
    @Query('regionDistribution') regionDistribution?: string,
  ): Promise<Company[]> {
    const filters: CompanyFiltersInterface = {};

    if (name) filters.name = name;
    if (assetClass) filters.assetClass = assetClass;
    if (industry) filters.industry = industry;
    if (regionDistribution) filters.regionDistribution = regionDistribution;

    return Object.keys(filters).length > 0
      ? this.companiesService.findAll(filters)
      : this.companiesService.findAll();
  }
}
