import { Test, TestingModule } from '@nestjs/testing';
import { DocumentformsService } from './documentforms.service';

describe('DocumentformsService', () => {
  let service: DocumentformsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentformsService],
    }).compile();

    service = module.get<DocumentformsService>(DocumentformsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
