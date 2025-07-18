import { Test, TestingModule } from '@nestjs/testing';
import { KpiReportService } from './kpi-report.service';

describe('KpiReportService', () => {
  let service: KpiReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KpiReportService],
    }).compile();

    service = module.get<KpiReportService>(KpiReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
