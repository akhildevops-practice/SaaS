import { Test, TestingModule } from '@nestjs/testing';
import { MyInboxService } from './my-inbox.service';

describe('MyInboxService', () => {
  let service: MyInboxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyInboxService],
    }).compile();

    service = module.get<MyInboxService>(MyInboxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
