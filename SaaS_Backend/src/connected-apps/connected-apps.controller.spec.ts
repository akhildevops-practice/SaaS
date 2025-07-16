import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { ConnectedAppsController } from './connected-apps.controller';
import {ConnectedAppsService} from './connected-apps.service'


describe('ConnectedAppsController', () => {
  let controller: ConnectedAppsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[AuthenticationModule],
      controllers: [ConnectedAppsController],
      providers:[ConnectedAppsService]
    }).compile();

    controller = module.get<ConnectedAppsController>(ConnectedAppsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
