import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { Company } from './schemas/company.schema';

const mockCompaniesService = {
  findAll: jest.fn(),
  findOneBySequenceNumber: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: mockCompaniesService },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all companies when no filters provided', async () => {
      const mockCompanies: Company[] = [
        { sequenceNumber: 1, name: 'Company 1' } as unknown as Company,
        { sequenceNumber: 2, name: 'Company 2' } as unknown as Company,
      ];
      const findAllSpy = jest.spyOn(service, 'findAll');
      findAllSpy.mockResolvedValue(mockCompanies);

      const result = await controller.findAll();

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(findAllSpy).toHaveBeenCalledWith();
      expect(result).toEqual(mockCompanies);
    });

    it('should return filtered companies with all query params', async () => {
      const mockCompanies: Company[] = [
        { sequenceNumber: 1, name: 'Filtered' } as unknown as Company,
      ];
      const findAllSpy = jest.spyOn(service, 'findAll');
      findAllSpy.mockResolvedValue(mockCompanies);

      const result = await controller.findAll(
        'name',
        'assetClass',
        'industry',
        'regionDistribution',
      );

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(findAllSpy).toHaveBeenCalledWith({
        name: 'name',
        assetClass: 'assetClass',
        industry: 'industry',
        regionDistribution: 'regionDistribution',
      });
      expect(result).toEqual(mockCompanies);
    });

    it('should return companies with only name filter', async () => {
      const mockCompanies: Company[] = [
        { sequenceNumber: 1, name: 'Test' } as unknown as Company,
      ];
      const findAllSpy = jest.spyOn(service, 'findAll');
      findAllSpy.mockResolvedValue(mockCompanies);

      const result = await controller.findAll(
        'name',
        undefined,
        undefined,
        undefined,
      );

      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(findAllSpy).toHaveBeenCalledWith({
        name: 'name',
      });
      expect(result).toEqual(mockCompanies);
    });

    it('should throw error when service fails', async () => {
      jest
        .spyOn(service, 'findAll')
        .mockRejectedValue(new Error('Database error'));
      await expect(controller.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOneBySequenceNumber', () => {
    it('should return a company by sequenceNumber', async () => {
      const mockCompany: Company = {
        sequenceNumber: 1,
        name: 'Test Company',
      } as unknown as Company;
      const findOneBySequenceNumberSpy = jest.spyOn(
        service,
        'findOneBySequenceNumber',
      );
      findOneBySequenceNumberSpy.mockResolvedValue(mockCompany);

      const result = await controller.findOneBySequenceNumber(1);

      expect(findOneBySequenceNumberSpy).toHaveBeenCalledTimes(1);
      expect(findOneBySequenceNumberSpy).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCompany);
    });

    it('should throw error when company not found', async () => {
      jest
        .spyOn(service, 'findOneBySequenceNumber')
        .mockRejectedValue(new Error('Company not found'));
      await expect(controller.findOneBySequenceNumber(999)).rejects.toThrow(
        'Company not found',
      );
    });
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'New Company',
        assetClass: 'Equity',
        industry: 'Technology',
        regionDistribution: 'North America',
      };
      const mockCreatedCompany: Company = {
        sequenceNumber: 1,
        ...createCompanyDto,
      } as unknown as Company;
      const createSpy = jest.spyOn(service, 'create');
      createSpy.mockResolvedValue(mockCreatedCompany);

      const result = await controller.create(createCompanyDto);

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(createSpy).toHaveBeenCalledWith(createCompanyDto);
      expect(result).toEqual(mockCreatedCompany);
    });

    it('should throw error when creation fails', async () => {
      const createCompanyDto: CreateCompanyDto = {
        name: 'name',
        assetClass: 'assetClass',
        industry: 'industry',
        regionDistribution: 'regionDistribution',
      };
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new Error('Creation failed'));
      await expect(controller.create(createCompanyDto)).rejects.toThrow(
        'Creation failed',
      );
    });
  });

  describe('update', () => {
    it('should update a company and return affected rows', async () => {
      const updateDto: CreateCompanyDto = {
        name: 'Updated Company',
        assetClass: 'Equity',
        industry: 'Finance',
        regionDistribution: 'Europe',
      };
      const updateSpy = jest.spyOn(service, 'update');
      updateSpy.mockResolvedValue(1);

      const result = await controller.update(1, updateDto);

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(1, updateDto);
      expect(result).toBe(1);
    });

    it('should throw error when update fails', async () => {
      const updateDto: CreateCompanyDto = {
        name: 'name',
        assetClass: 'assetClass',
        industry: 'industry',
        regionDistribution: 'regionDistribution',
      };
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new Error('Update failed'));
      await expect(controller.update(1, updateDto)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('delete', () => {
    it('should delete a company and return affected rows', async () => {
      const deleteSpy = jest.spyOn(service, 'delete');
      deleteSpy.mockResolvedValue(1);

      const result = await controller.delete(1);

      expect(deleteSpy).toHaveBeenCalledTimes(1);
      expect(deleteSpy).toHaveBeenCalledWith(1);
      expect(result).toBe(1);
    });

    it('should throw error when delete fails', async () => {
      jest
        .spyOn(service, 'delete')
        .mockRejectedValue(new Error('Delete failed'));
      await expect(controller.delete(1)).rejects.toThrow('Delete failed');
    });
  });
});
