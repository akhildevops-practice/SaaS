import { Test, TestingModule } from '@nestjs/testing';
import { AuditSettingsService } from './audit-settings.service';

describe('AuditSettingsService', () => {
  let service: AuditSettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditSettingsService],
    }).compile();

    service = module.get<AuditSettingsService>(AuditSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
