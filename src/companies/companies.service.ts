import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { Company } from './interfaces/company.interface';
import { COMPANY_MODEL } from '../constants';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(COMPANY_MODEL)
    private companyModel: Model<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const createdCompany = new this.companyModel(createCompanyDto);
    return await createdCompany.save();
  }

  async findAll(filter?: CompanyFiltersInterface): Promise<Company[]> {
    return this.companyModel.find({ filter }).exec();
  }

  async findOneById(id: number): Promise<Company | null> {
    return this.companyModel.findOne({ filter: { id } }).exec();
  }

  async update(id: number, companyDto: CreateCompanyDto): Promise<number> {
    const updated = await this.companyModel.updateOne(
      { filter: { id } },
      companyDto,
    );
    return updated.upsertedCount;
  }

  async delete(id: number): Promise<number> {
    const deleted = await this.companyModel.deleteOne({ filter: { id } });
    return deleted.deletedCount;
  }
}
