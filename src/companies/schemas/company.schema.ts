import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<Company>;

@Schema()
export class Company {
  @Prop()
  id: number;

  @Prop()
  name: string;

  @Prop()
  assetClass: string;

  @Prop()
  industry: string;

  @Prop()
  regionDistribution: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
