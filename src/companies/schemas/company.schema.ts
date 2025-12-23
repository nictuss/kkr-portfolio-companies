import * as mongoose from 'mongoose';

export const CompanySchema = new mongoose.Schema({
  id: Number,
  name: String,
  assetClass: String,
  industry: String,
  regionDistribution: String,
});
