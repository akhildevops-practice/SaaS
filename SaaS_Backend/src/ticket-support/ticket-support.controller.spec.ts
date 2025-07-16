import { Test, TestingModule } from '@nestjs/testing';
import { TicketSupportController } from './ticket-support.controller';

describe('TicketSupportController', () => {
  let controller: TicketSupportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketSupportController],
    }).compile();

    controller = module.get<TicketSupportController>(TicketSupportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
