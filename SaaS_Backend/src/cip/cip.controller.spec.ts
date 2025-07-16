import { Test, TestingModule } from '@nestjs/testing';
import { CipController } from './cip.controller';

describe('CipController', () => {
  let controller: CipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CipController],
    }).compile();

    controller = module.get<CipController>(CipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
