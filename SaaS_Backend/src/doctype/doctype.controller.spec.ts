import { Test, TestingModule } from '@nestjs/testing';
import { DoctypeController } from './doctype.controller';
import { DoctypeService } from './doctype.service';

describe('DoctypeController', () => {
  let controller: DoctypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DoctypeController],
      providers: [DoctypeService],
    }).compile();

    controller = module.get<DoctypeController>(DoctypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
