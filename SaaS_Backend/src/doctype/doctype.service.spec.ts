import { Test, TestingModule } from '@nestjs/testing';
import { DoctypeService } from './doctype.service';

describe('DoctypeService', () => {
  let service: DoctypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctypeService],
    }).compile();

    service = module.get<DoctypeService>(DoctypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
