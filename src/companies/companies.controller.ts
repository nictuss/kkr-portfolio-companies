import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
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

  @Get(':id')
  async findOneById(@Param('id') id: number) {
    return this.companiesService.findOneById(id);
  }

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<number> {
    return this.companiesService.update(id, createCompanyDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<number> {
    return this.companiesService.delete(id);
  }
}
