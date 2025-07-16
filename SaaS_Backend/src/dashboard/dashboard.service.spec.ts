import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

describe('DashboardService - Resolved', () => {
  let service: DashboardService;
  let prisma: PrismaService;
  const documentsMockedData = [
    {
      a: 1,
      b: {
        c: 1,
        d: {
          e: 2,
        },
        Entity: null,
        entityName: 'abc',
      },
    },
  ];
  const prismaDb = {
    documents: {
      findMany: jest.fn().mockResolvedValue(documentsMockedData),
      count: jest.fn().mockResolvedValue(documentsMockedData.length),
    },
    $queryRawUnsafe: jest.fn().mockResolvedValue(documentsMockedData),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthenticationModule],
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: prismaDb,
        },
      ],
      controllers: [DashboardController],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('findAll should work', async () => {
    const expected = await service.findAll({
      creator: 'john',
      department: 'sales',
      documentEndDate: '2020-01-01',
      documentStartDate: '2020-01-01',
      documentId: '1',
      documentName: 'test',
      documentType: 'test',
      documentStatus: 'test',
      documentTag: 'test',
      documentVersion: 'A',
      limit: 10,
      location: 'test',
      page: 1,
      readAccess: 'test',
      searchQuery: '',
    });
    expect(expected).toBeTruthy;
  });
});

describe('DashboardService - Resolved', () => {
  let service: DashboardService;
  let prisma: PrismaService;
  const documentsMockedData = [
    {
      a: 1,
      b: {
        c: 1,
        d: {
          e: 2,
        },
        Entity: null,
        entityName: 'abc',
      },
    },
  ];
  const prismaDb = {
    documents: {
      findMany: jest.fn().mockRejectedValue(documentsMockedData),
      count: jest.fn().mockRejectedValue(documentsMockedData.length),
    },
    $queryRawUnsafe: jest.fn().mockRejectedValue(documentsMockedData),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthenticationModule],
      providers: [
        DashboardService,
        {
          provide: PrismaService,
          useValue: prismaDb,
        },
      ],
      controllers: [DashboardController],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('findAll should work with resolver reject', async () => {
    try {
      await service.findAll({
        creator: 'john',
        department: 'sales',
        documentEndDate: '2020-01-01',
        documentStartDate: '2020-01-01',
        documentId: '1',
        documentName: 'test',
        documentType: 'test',
        documentStatus: 'test',
        documentTag: 'test',
        documentVersion: 'A',
        limit: 10,
        location: 'test',
        page: 1,
        readAccess: 'test',
        searchQuery: '',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('getChartData should work with resolver reject - 1', async () => {
    try {
      await service.getChartData({
        filterField: 'readAccess',
        filterValue: 'test',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('getChartData should work with resolver reject - 1', async () => {
    try {
      await service.getChartData({
        filterField: 'documentType',
        filterValue: 'test',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('getChartData should work with resolver reject - 2', async () => {
    try {
      await service.getChartData({
        filterField: 'documentState',
        filterValue: 'test',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test('getChartData should work with resolver reject - 3', async () => {
    try {
      await service.getChartData({
        filterField: 'tags',
        filterValue: 'test',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
  test('getChartData should work with resolver reject - 4', async () => {
    try {
      await service.getChartData({
        filterField: 'ada',
        filterValue: 'test',
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
