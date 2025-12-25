import { Model, MongooseBulkWriteResult } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
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

  async bulkCreate(companies: Company[]): Promise<MongooseBulkWriteResult> {
    this.logger.verbose(`Bulk creating companies`);
    const bulkOps = companies.map((company) => ({
      updateOne: {
        filter: { sequenceNumber: company.sequenceNumber },
        update: { $set: company },
        upsert: true,
      },
    }));

    return this.companyModel.bulkWrite(bulkOps);
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
}
