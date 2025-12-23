import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { companiesProviders } from './companies.providers';
import { DatabaseModule } from '../database/database.module';
import { CompaniesController } from './companies.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, ...companiesProviders],
})
export class CompaniesModule {}
