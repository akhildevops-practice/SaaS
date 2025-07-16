import { Test, TestingModule } from '@nestjs/testing';
import { KpiDefinitionController } from 'src/kpi-definition/kpi-definition.controller';
import { KpiReportController } from './kpi-report.controller';

describe('KpiReportController', () => {
  let controller: KpiReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiReportController,KpiDefinitionController],
    }).compile();

    controller = module.get<KpiReportController>(KpiReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
