import { Test, TestingModule } from '@nestjs/testing';
import { NPDController } from './npd.controller';

describe('PcrController', () => {
  let controller: NPDController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NPDController],
    }).compile();

    controller = module.get<NPDController>(NPDController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});