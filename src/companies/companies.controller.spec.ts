import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
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
});
