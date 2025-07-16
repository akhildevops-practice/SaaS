import { Module } from '@nestjs/common';
import { RiskConfigController } from './riskconfig.controller';
import { RiskConfigService } from './riskconfig.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RiskConfig,
  RiskConfigSchema,
} from './riskConfigSchema/riskconfig.schema';
import {
  HiraTypeConfig,
  HiraTypeConfigSchema,
} from './schema/hiraTypesSchema/hiraTypes.schema';
import {
  HiraConfig,
  HiraConfigSchema,
} from './schema/hiraConfigSchema/hiraconfig.schema';
import {
  HiraAreaMaster,
  HiraAreaMasterSchema,
} from './schema/hiraAreaMasterSchema/hiraAreaMaster.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
// import { CustomLogger } from 'src/audit-trial/logger.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RiskConfig.name, schema: RiskConfigSchema },
      { name: HiraTypeConfig.name, schema: HiraTypeConfigSchema },
      { name: HiraConfig.name, schema: HiraConfigSchema },
      { name: HiraAreaMaster.name, schema: HiraAreaMasterSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [RiskConfigController],
  providers: [
    RiskConfigService,
    PrismaService,
    // {
    //   provide: 'Logger',
    //   useClass: CustomLogger,
    // },
  ],
})
export class RiskModule {}
