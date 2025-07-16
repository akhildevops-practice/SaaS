import { Test, TestingModule } from '@nestjs/testing';
import { AuditTrialService } from './audit-trial.service';

describe('AuditTrialService', () => {
  let service: AuditTrialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditTrialService],
    }).compile();

    service = module.get<AuditTrialService>(AuditTrialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
