import { Test, TestingModule } from '@nestjs/testing';
import { RiskRegisterService } from './risk-register.service';

describe('RiskRegisterService', () => {
  let service: RiskRegisterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskRegisterService],
    }).compile();

    service = module.get<RiskRegisterService>(RiskRegisterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
