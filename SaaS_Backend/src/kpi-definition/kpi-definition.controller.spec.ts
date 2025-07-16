import { Test, TestingModule } from '@nestjs/testing';
import { KpiDefinitionController } from './kpi-definition.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { KpiDefinitionService} from './kpi-definition.service';

describe('KpiDefinitionController', () => {
  let controller: KpiDefinitionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KpiDefinitionController],
      providers:[KpiDefinitionService]
    }).compile();

    controller = module.get<KpiDefinitionController>(KpiDefinitionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

