import { Test, TestingModule } from '@nestjs/testing';
import { NPDService } from './npd.service';

describe('PcrService', () => {
  let service: NPDService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NPDService],
    }).compile();

    service = module.get<NPDService>(NPDService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});