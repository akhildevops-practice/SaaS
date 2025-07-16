import { Test, TestingModule } from '@nestjs/testing';
import { DigitalSignatureController } from './digital-signature.controller';

describe('DigitalSignatureController', () => {
  let controller: DigitalSignatureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalSignatureController],
    }).compile();

    controller = module.get<DigitalSignatureController>(DigitalSignatureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
