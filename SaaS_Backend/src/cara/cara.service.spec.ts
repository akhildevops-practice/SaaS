import { Test, TestingModule } from '@nestjs/testing';
import { CaraService } from './cara.service';

describe('CaraService', () => {
  let service: CaraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaraService],
    }).compile();

    service = module.get<CaraService>(CaraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
