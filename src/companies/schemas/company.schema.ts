import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Company {
  @Prop({ unique: true, index: true })
  sequenceNumber: number;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  logoSrc: string;

  @Prop()
  headQuarter: string;

  @Prop()
  website: string;

  @Prop()
  assetClass: string;

  @Prop()
  industry: string;

  @Prop()
  regionDistribution: string;

  @Prop({ type: Date })
  lastUpdate: Date;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
