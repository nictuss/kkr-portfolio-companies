import { Document } from 'mongoose';

export interface Company extends Document {
  readonly id: string;
  readonly name: string;
  readonly assetClass: string;
  readonly industry: string;
  readonly regionDistribution: string;
}
