import { Test, TestingModule } from '@nestjs/testing';
import { RiskConfigController } from './riskconfig.controller';

describe('RiskController', () => {
  let controller: RiskConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiskConfigController],
    }).compile();

    controller = module.get<RiskConfigController>(RiskConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
