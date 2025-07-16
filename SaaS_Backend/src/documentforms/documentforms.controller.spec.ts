import { Test, TestingModule } from '@nestjs/testing';
import { DocumentformsController } from './documentforms.controller';
import { DocumentformsService } from './documentforms.service';

describe('DocumentformsController', () => {
  let controller: DocumentformsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentformsController],
      providers: [DocumentformsService],
    }).compile();

    controller = module.get<DocumentformsController>(DocumentformsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
