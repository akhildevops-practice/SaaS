import { Test, TestingModule } from '@nestjs/testing';
import { AppFieldController } from './app-field.controller';

describe('AppFieldController', () => {
  let controller: AppFieldController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppFieldController],
    }).compile();

    controller = module.get<AppFieldController>(AppFieldController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
