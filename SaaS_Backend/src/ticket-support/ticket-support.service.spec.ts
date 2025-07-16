import { Test, TestingModule } from '@nestjs/testing';
import { TicketSupportService } from './ticket-support.service';

describe('TicketSupportService', () => {
  let service: TicketSupportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketSupportService],
    }).compile();

    service = module.get<TicketSupportService>(TicketSupportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
