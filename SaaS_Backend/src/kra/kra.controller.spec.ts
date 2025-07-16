import { Test, TestingModule } from '@nestjs/testing';
import { KraController } from './kra.controller';

describe('KraController', () => {
  let controller: KraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KraController],
    }).compile();

    controller = module.get<KraController>(KraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
