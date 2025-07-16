import { Test, TestingModule } from '@nestjs/testing';
import { RiskRegisterController } from './risk-register.controller';

describe('RiskRegisterController', () => {
  let controller: RiskRegisterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiskRegisterController],
    }).compile();

    controller = module.get<RiskRegisterController>(RiskRegisterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
