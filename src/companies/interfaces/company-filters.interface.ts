interface RegexFilter {
  $regex: string;
  $options: string;
}

export interface CompanyFiltersInterface {
  website?: string | RegexFilter;
  logoSrc?: string | RegexFilter;
  sequenceNumber?: number;
  headQuarter?: string | RegexFilter;
  description?: string | RegexFilter;
  _id?: string | RegexFilter;
  name?: string | RegexFilter;
  assetClass?: string | RegexFilter;
  industry?: string | RegexFilter;
  regionDistribution?: string | RegexFilter;
}
