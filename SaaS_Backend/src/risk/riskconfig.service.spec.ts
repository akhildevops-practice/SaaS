import { Test, TestingModule } from '@nestjs/testing';
import { RiskConfigService } from './riskconfig.service';

describe('RiskService', () => {
  let service: RiskConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskConfigService],
    }).compile();

    service = module.get<RiskConfigService>(RiskConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
