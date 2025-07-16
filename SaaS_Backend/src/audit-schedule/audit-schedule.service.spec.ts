import { Test, TestingModule } from '@nestjs/testing';
import { AuditScheduleService } from './audit-schedule.service';

describe('AuditScheduleService', () => {
  let service: AuditScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditScheduleService],
    }).compile();

    service = module.get<AuditScheduleService>(AuditScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
