import { Test, TestingModule } from '@nestjs/testing';
import { MailtemplateService } from './mailtemplate.service';

describe('MailtemplateService', () => {
  let service: MailtemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailtemplateService],
    }).compile();

    service = module.get<MailtemplateService>(MailtemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
