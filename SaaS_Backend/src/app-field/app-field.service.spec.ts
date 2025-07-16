import { Test, TestingModule } from '@nestjs/testing';
import { AppFieldService } from './app-field.service';

describe('AppFieldService', () => {
  let service: AppFieldService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppFieldService],
    }).compile();

    service = module.get<AppFieldService>(AppFieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
