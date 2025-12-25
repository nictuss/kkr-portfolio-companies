import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';
import { Company } from './schemas/company.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CompaniesService {
  private logger: Logger;
  constructor(
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,
  ) {
    this.logger = new Logger();
  }

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    this.logger.verbose(
      `Creating company with params ${JSON.stringify(createCompanyDto)}`,
    );
    return this.companyModel.create(createCompanyDto);
  }

  async bulkCreate(createCompanyDtos: CreateCompanyDto[]): Promise<Company[]> {
    this.logger.verbose(`Bulk creating companies`);
    return this.companyModel.create(createCompanyDtos);
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

  async findOneBySequenceNumber(
    sequenceNumber: number,
  ): Promise<Company | null> {
    this.logger.verbose(
      `Finding company with sequenceNumber ${sequenceNumber}`,
    );
    return this.companyModel.findOne({ filter: { sequenceNumber } }).exec();
  }

  async update(
    sequenceNumber: number,
    companyDto: CreateCompanyDto,
  ): Promise<number> {
    this.logger.verbose(
      `Updating company with sequenceNumber ${sequenceNumber}`,
    );
    const updated = await this.companyModel.updateOne(
      { filter: { sequenceNumber } },
      companyDto,
    );
    return updated.upsertedCount;
  }

  async delete(sequenceNumber: number): Promise<number> {
    this.logger.verbose(
      `Deleting company with sequenceNumber ${sequenceNumber}`,
    );
    const deleted = await this.companyModel.deleteOne({
      filter: { sequenceNumber },
    });
    return deleted.deletedCount;
  }
}
