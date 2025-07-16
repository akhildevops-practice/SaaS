import { Test, TestingModule } from '@nestjs/testing';
import { KeyAgendaController } from './meetingType.controller';

describe('KeyAgendaController', () => {
  let controller: KeyAgendaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KeyAgendaController],
    }).compile();

    controller = module.get<KeyAgendaController>(KeyAgendaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
