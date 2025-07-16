import { Test, TestingModule } from '@nestjs/testing';
import { KraService } from './kra.service';

describe('KraService', () => {
  let service: KraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KraService],
    }).compile();

    service = module.get<KraService>(KraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
