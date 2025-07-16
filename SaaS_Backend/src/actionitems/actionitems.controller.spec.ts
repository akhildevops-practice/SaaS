import { Test, TestingModule } from '@nestjs/testing';
import { ActionitemsController } from './actionitems.controller';

describe('ActionitemsController', () => {
  let controller: ActionitemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActionitemsController],
    }).compile();

    controller = module.get<ActionitemsController>(ActionitemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
