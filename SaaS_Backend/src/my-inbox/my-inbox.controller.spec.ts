import { Test, TestingModule } from '@nestjs/testing';
import { MyInboxController } from './my-inbox.controller';

describe('MyInboxController', () => {
  let controller: MyInboxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyInboxController],
    }).compile();

    controller = module.get<MyInboxController>(MyInboxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
