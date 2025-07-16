import { Test, TestingModule } from '@nestjs/testing';
import { CipService } from './cip.service';

describe('CipService', () => {
  let service: CipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CipService],
    }).compile();

    service = module.get<CipService>(CipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
