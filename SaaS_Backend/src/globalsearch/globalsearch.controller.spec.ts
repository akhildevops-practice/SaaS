import { Test, TestingModule } from '@nestjs/testing';
import { GlobalsearchController } from './globalsearch.controller';

describe('GlobalsearchController', () => {
  let controller: GlobalsearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalsearchController],
    }).compile();

    controller = module.get<GlobalsearchController>(GlobalsearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
