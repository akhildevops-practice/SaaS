import { Test, TestingModule } from '@nestjs/testing';
import { GlobalsearchService } from './globalsearch.service';

describe('GlobalsearchService', () => {
  let service: GlobalsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalsearchService],
    }).compile();

    service = module.get<GlobalsearchService>(GlobalsearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
