import { Test, TestingModule } from '@nestjs/testing';
import { SerialNumberController } from './serial-number.controller';

describe('SerialNumberController', () => {
  let controller: SerialNumberController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SerialNumberController],
    }).compile();

    controller = module.get<SerialNumberController>(SerialNumberController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
