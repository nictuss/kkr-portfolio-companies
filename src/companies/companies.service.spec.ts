import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';

describe('CompaniesService', () => {
  let service: CompaniesService;

  const now = new Date();

  const mockCompany: Company = {
    sequenceNumber: 1,
    name: 'Test Company',
    assetClass: 'Equity',
    industry: 'Technology',
    regionDistribution: 'North America',
    description: 'Test description',
    logoSrc: 'https://kkr/logo.png',
    headQuarter: 'Rome, Italy',
    website: 'https://kkr.com',
    relatedLinks: ['https://google.com'],
    lastUpdate: now,
  };

  const mockCompany2: Company = {
    sequenceNumber: 2,
    name: 'Test Company',
    assetClass: 'Equity',
    industry: 'Technology',
    regionDistribution: 'North America',
    description: '',
    logoSrc: '',
    headQuarter: '',
    website: '',
    relatedLinks: [],
    lastUpdate: now,
  };

  const mockCompanyModel = {
    find: jest.fn(),
    updateOne: jest.fn(),
    bulkWrite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        {
          provide: getModelToken(Company.name),
          useValue: mockCompanyModel,
        },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bulkCreate', () => {
    it('should create a new company', async () => {
      const companyToCreate: Company[] = [mockCompany];

      const upsertMock = jest.fn().mockResolvedValue({ isOk: () => true });
      mockCompanyModel.bulkWrite = upsertMock;

      await service.bulkCreate(companyToCreate);

      expect(upsertMock).toHaveBeenCalledTimes(1);
      expect(upsertMock).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { sequenceNumber: 1 },
            update: { $set: mockCompany },
            upsert: true,
          },
        },
      ]);
    });

    it('should create two new companies', async () => {
      const companiesToCreate: Company[] = [mockCompany, mockCompany2];

      const upsertMock = jest.fn().mockResolvedValue({ isOk: () => true });
      mockCompanyModel.bulkWrite = upsertMock;

      await service.bulkCreate(companiesToCreate);

      expect(upsertMock).toHaveBeenCalledTimes(1);
      expect(upsertMock).toHaveBeenCalledWith([
        {
          updateOne: {
            filter: { sequenceNumber: 1 },
            update: { $set: mockCompany },
            upsert: true,
          },
        },
        {
          updateOne: {
            filter: { sequenceNumber: 2 },
            update: { $set: mockCompany2 },
            upsert: true,
          },
        },
      ]);
    });

    it('should not create a new company', async () => {
      const companiesToCreate: Company[] = [];

      const upsertMock = jest.fn().mockResolvedValue({ isOk: () => false });
      mockCompanyModel.bulkWrite = upsertMock;

      await service.bulkCreate(companiesToCreate);

      expect(upsertMock).toHaveBeenCalledTimes(1);
      expect(upsertMock).toHaveBeenCalledWith([]);
    });

    it('should throw error when save fails', async () => {
      mockCompanyModel.bulkWrite = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.bulkCreate([mockCompany])).rejects.toThrow(
        new Error('Database error'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all companies when no filter provided', async () => {
      const mockCompanies = [
        mockCompany,
        { ...mockCompany, sequenceNumber: 2 },
      ];
      const execMock = jest.fn().mockResolvedValue(mockCompanies);
      mockCompanyModel.find.mockReturnValue({ exec: execMock });

      const result = await service.findAll();

      expect(mockCompanyModel.find).toHaveBeenCalledWith();
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
    });

    it('should return filtered companies when filter provided', async () => {
      const filter: CompanyFiltersInterface = {
        name: 'Test Company',
        industry: 'Technology',
      };
      const mockCompanies = [mockCompany];
      const execMock = jest.fn().mockResolvedValue(mockCompanies);
      mockCompanyModel.find.mockReturnValue({ exec: execMock });

      const result = await service.findAll(filter);

      expect(mockCompanyModel.find).toHaveBeenCalledWith({ filter });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockCompanies);
    });

    it('should return empty array when no companies found', async () => {
      const execMock = jest.fn().mockResolvedValue([]);
      mockCompanyModel.find.mockReturnValue({ exec: execMock });

      const result = await service.findAll();

      expect(mockCompanyModel.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should throw error when find fails', async () => {
      const execMock = jest.fn().mockRejectedValue(new Error('Database error'));
      mockCompanyModel.find.mockReturnValue({ exec: execMock });

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });
});
