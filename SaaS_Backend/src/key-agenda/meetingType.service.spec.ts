import { Test, TestingModule } from '@nestjs/testing';
import { KeyAgendaService } from './meetingType.service';

describe('KeyAgendaService', () => {
  let service: KeyAgendaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KeyAgendaService],
    }).compile();

    service = module.get<KeyAgendaService>(KeyAgendaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
