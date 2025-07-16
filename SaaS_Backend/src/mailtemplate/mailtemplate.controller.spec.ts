import { Test, TestingModule } from '@nestjs/testing';
import { MailtemplateController } from './mailtemplate.controller';

describe('MailtemplateController', () => {
  let controller: MailtemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MailtemplateController],
    }).compile();

    controller = module.get<MailtemplateController>(MailtemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
