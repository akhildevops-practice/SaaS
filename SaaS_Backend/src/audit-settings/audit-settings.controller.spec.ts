import { Test, TestingModule } from '@nestjs/testing';
import { AuditSettingsController } from './audit-settings.controller';

describe('AuditSettingsController', () => {
  let controller: AuditSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditSettingsController],
    }).compile();

    controller = module.get<AuditSettingsController>(AuditSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
