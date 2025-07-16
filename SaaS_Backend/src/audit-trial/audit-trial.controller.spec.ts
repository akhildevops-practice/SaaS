import { Test, TestingModule } from '@nestjs/testing';
import { AuditTrialController } from './audit-trial.controller';

describe('AuditTrialController', () => {
  let controller: AuditTrialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditTrialController],
    }).compile();

    controller = module.get<AuditTrialController>(AuditTrialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
