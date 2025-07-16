import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let prisma: PrismaService;
  const documentsMockedData = [
    {
      a: 1,
      b: {
        c: 1,
        d: {
          e: 2,
        },
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
    controller = module.get<DashboardController>(DashboardController);
  });

  // it('should be defined', () => {
  //   expect(controller).toBeDefined();
  // });

  // test('findAll should work for input -1', async () => {
  //   const result = await controller.findAll({
  //     creator: 'john',
  //     department: 'sales',
  //     documentEndDate: '2020-01-01',
  //     documentStartDate: '2020-01-01',
  //     documentId: '1',
  //     documentName: 'test',
  //     documentType: 'test',
  //     documentStatus: 'test',
  //     documentTag: 'test',
  //     documentVersion: 'A',
  //     limit: 10,
  //     location: 'test',
  //     page: 1,
  //     readAccess: 'test',
  //     searchQuery: '',
  //   });
  //   expect(result).toBeTruthy();
  // });

  // test('findAll should work for input -2', async () => {
  //   prisma.documents.findMany = jest.fn().mockReturnValueOnce([
  //     {
  //       data: 'somedata',
  //     },
  //   ]);

  //   const result = await controller.findAll({
  //     creator: 'john',
  //     department: 'sales',
  //     documentEndDate: '2020-01-01',
  //     documentStartDate: '2020-01-01',
  //     documentId: '1',
  //     documentName: 'test',
  //     documentType: 'test',
  //     documentStatus: 'test',
  //     documentTag: 'test',
  //     documentVersion: 'A',
  //     limit: 10,
  //     location: 'test',
  //     page: 1,
  //     readAccess: 'test',
  //     searchQuery: 'abc',
  //   });
  //   expect(result).toBeTruthy();
  // });

  // test('getChartData should work', async () => {
  //   const result = await controller.getChartData({
  //     filterField: 'documentType',
  //     filterValue: '',
  //   });
  //   expect(result).toBeTruthy();
  // });
});
