import { Model } from 'mongoose';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Company } from './interfaces/company.interface';
import { COMPANY_MODEL } from '../constants';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';

@Injectable()
export class CompaniesService {
  private logger: Logger;
  constructor(
    @Inject(COMPANY_MODEL)
    private companyModel: Model<Company>,
  ) {
    this.logger = new Logger();
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    this.logger.verbose(
      `Creating company with params ${JSON.stringify(createCompanyDto)}`,
    );
    const createdCompany = new this.companyModel(createCompanyDto);
    return await createdCompany.save();
  }

  async findAll(filter?: CompanyFiltersInterface): Promise<Company[]> {
    if (filter) {
      this.logger.verbose(
        `Finding companies with filters ${JSON.stringify(filter)}`,
      );
      return this.companyModel.find({ filter }).exec();
    } else {
      return this.companyModel.find().exec();
    }
  }

  async findOneById(id: number): Promise<Company | null> {
    this.logger.verbose(`Finding company with id ${id}`);
    return this.companyModel.findOne({ filter: { id } }).exec();
  }

  async update(id: number, companyDto: CreateCompanyDto): Promise<number> {
    this.logger.verbose(`Updating company with id ${id}`);
    const updated = await this.companyModel.updateOne(
      { filter: { id } },
      companyDto,
    );
    return updated.upsertedCount;
  }

  async delete(id: number): Promise<number> {
    this.logger.verbose(`Deleting company with id ${id}`);
    const deleted = await this.companyModel.deleteOne({ filter: { id } });
    return deleted.deletedCount;
  }
}
