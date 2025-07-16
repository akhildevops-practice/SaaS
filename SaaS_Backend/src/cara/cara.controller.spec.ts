import { Test, TestingModule } from '@nestjs/testing';
import { CaraController } from './cara.controller';

describe('CaraController', () => {
  let controller: CaraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaraController],
    }).compile();

    controller = module.get<CaraController>(CaraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
