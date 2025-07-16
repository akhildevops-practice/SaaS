import { Test, TestingModule } from '@nestjs/testing';
import { ConnectedAppsService } from './connected-apps.service';

describe('ConnectedAppsService', () => {
  let service: ConnectedAppsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectedAppsService],
    }).compile();

    service = module.get<ConnectedAppsService>(ConnectedAppsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
