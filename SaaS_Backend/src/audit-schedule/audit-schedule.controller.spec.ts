import { Test, TestingModule } from '@nestjs/testing';
import { AuditScheduleController } from './audit-schedule.controller';

describe('AuditScheduleController', () => {
  let controller: AuditScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditScheduleController],
    }).compile();

    controller = module.get<AuditScheduleController>(AuditScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
