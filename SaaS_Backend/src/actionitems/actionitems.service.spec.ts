import { Test, TestingModule } from '@nestjs/testing';
import { ActionitemsService } from './actionitems.service';

describe('ActionitemsService', () => {
  let service: ActionitemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActionitemsService],
    }).compile();

    service = module.get<ActionitemsService>(ActionitemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
