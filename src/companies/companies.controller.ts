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

  @Get(':sequenceNumber')
  async findOneBySequenceNumber(
    @Param('sequenceNumber') sequenceNumber: number,
  ) {
    return this.companiesService.findOneBySequenceNumber(sequenceNumber);
  }

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companiesService.create(createCompanyDto);
  }

  @Put(':sequenceNumber')
  async update(
    @Param('sequenceNumber') sequenceNumber: number,
    @Body() createCompanyDto: CreateCompanyDto,
  ): Promise<number> {
    return this.companiesService.update(sequenceNumber, createCompanyDto);
  }

  @Delete(':sequenceNumber')
  async delete(
    @Param('sequenceNumber') sequenceNumber: number,
  ): Promise<number> {
    return this.companiesService.delete(sequenceNumber);
  }
}
