import { Test, TestingModule } from '@nestjs/testing';
import { KpiDefinitionService } from './kpi-definition.service';

describe('KpiDefinitionService', () => {
  let service: KpiDefinitionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KpiDefinitionService],
    }).compile();

    service = module.get<KpiDefinitionService>(KpiDefinitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
