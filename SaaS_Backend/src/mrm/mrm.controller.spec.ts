import { Test, TestingModule } from '@nestjs/testing';
import { MRMController } from './mrm.controller';

describe('MRMController', () => {
  let controller: MRMController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MRMController],
    }).compile();

    controller = module.get<MRMController>(MRMController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
