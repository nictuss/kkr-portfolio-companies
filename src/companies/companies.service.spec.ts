import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CompanyFiltersInterface } from './interfaces/company-filters.interface';
import { getModelToken } from '@nestjs/mongoose';
import { Company } from './schemas/company.schema';

describe('CompaniesService', () => {
  let service: CompaniesService;

  const mockCompany = {
    id: 1,
    name: 'Test Company',
    assetClass: 'Equity',
    industry: 'Technology',
    regionDistribution: 'North America',
  };

  const mockCompanyModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
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

  describe('create', () => {
    it('should create a new company', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'New Company',
        assetClass: 'Equity',
        industry: 'Finance',
        regionDistribution: 'Europe',
      };

      const createMock = jest.fn().mockResolvedValue(mockCompany);
      mockCompanyModel.create = createMock;

      const result = await service.create(createCompanyDto);

      expect(createMock).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });

    it('should throw error when save fails', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'New Company',
        assetClass: 'Equity',
        industry: 'Finance',
        regionDistribution: 'Europe',
      };

      mockCompanyModel.create = jest
        .fn()
        .mockRejectedValue(new Error('Database error'));

      await expect(service.create(createCompanyDto)).rejects.toThrow(
        new Error('Database error'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all companies when no filter provided', async () => {
      const mockCompanies = [mockCompany, { ...mockCompany, id: 2 }];
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

  describe('findOneById', () => {
    it('should return a company by id', async () => {
      const execMock = jest.fn().mockResolvedValue(mockCompany);
      mockCompanyModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findOneById(1);

      expect(mockCompanyModel.findOne).toHaveBeenCalledWith({
        filter: { id: 1 },
      });
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(mockCompany);
    });

    it('should return null when company not found', async () => {
      const execMock = jest.fn().mockResolvedValue(null);
      mockCompanyModel.findOne.mockReturnValue({ exec: execMock });

      const result = await service.findOneById(999);

      expect(mockCompanyModel.findOne).toHaveBeenCalledWith({
        filter: { id: 999 },
      });
      expect(result).toBeNull();
    });

    it('should throw error when findOne fails', async () => {
      const execMock = jest.fn().mockRejectedValue(new Error('Database error'));
      mockCompanyModel.findOne.mockReturnValue({ exec: execMock });

      await expect(service.findOneById(1)).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    it('should update a company and return upserted count', async () => {
      const updateDto: CreateCompanyDto = {
        name: 'Updated Company',
        assetClass: 'Equity',
        industry: 'Finance',
        regionDistribution: 'Asia',
      };
      const updateResult = { upsertedCount: 1 };
      mockCompanyModel.updateOne.mockResolvedValue(updateResult);

      const result = await service.update(1, updateDto);

      expect(mockCompanyModel.updateOne).toHaveBeenCalledWith(
        { filter: { id: 1 } },
        updateDto,
      );
      expect(result).toBe(1);
    });

    it('should return 0 when no company updated', async () => {
      const updateDto: CreateCompanyDto = {
        name: 'Updated Company',
        assetClass: 'Equity',
        industry: 'Finance',
        regionDistribution: 'Asia',
      };
      const updateResult = { upsertedCount: 0 };
      mockCompanyModel.updateOne.mockResolvedValue(updateResult);

      const result = await service.update(999, updateDto);

      expect(mockCompanyModel.updateOne).toHaveBeenCalledWith(
        { filter: { id: 999 } },
        updateDto,
      );
      expect(result).toBe(0);
    });

    it('should throw error when update fails', async () => {
      const updateDto: CreateCompanyDto = {
        name: 'Updated Company',
        assetClass: 'Equity',
        industry: 'Finance',
        regionDistribution: 'Asia',
      };
      mockCompanyModel.updateOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update(1, updateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('delete', () => {
    it('should delete a company and return deleted count', async () => {
      const deleteResult = { deletedCount: 1 };
      mockCompanyModel.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.delete(1);

      expect(mockCompanyModel.deleteOne).toHaveBeenCalledWith({
        filter: { id: 1 },
      });
      expect(result).toBe(1);
    });

    it('should return 0 when no company deleted', async () => {
      const deleteResult = { deletedCount: 0 };
      mockCompanyModel.deleteOne.mockResolvedValue(deleteResult);

      const result = await service.delete(999);

      expect(mockCompanyModel.deleteOne).toHaveBeenCalledWith({
        filter: { id: 999 },
      });
      expect(result).toBe(0);
    });

    it('should throw error when delete fails', async () => {
      mockCompanyModel.deleteOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(1)).rejects.toThrow('Database error');
    });
  });
});
