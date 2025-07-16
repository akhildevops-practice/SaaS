import { Test, TestingModule } from '@nestjs/testing';
import { DigitalSignatureService } from './digital-signature.service';

describe('DigitalSignatureService', () => {
  let service: DigitalSignatureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DigitalSignatureService],
    }).compile();

    service = module.get<DigitalSignatureService>(DigitalSignatureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
