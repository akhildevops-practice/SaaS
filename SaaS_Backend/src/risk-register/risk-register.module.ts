import { Module } from '@nestjs/common';
import { RiskRegisterController } from './risk-register.controller';
import { RiskRegisterService } from './risk-register.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Riskschema,
  riskSchema,
} from './riskRegisterSchema/riskRegister.schema';
import {
  RiskConfig,
  RiskConfigSchema,
} from 'src/risk/riskConfigSchema/riskconfig.schema';
import {
  riskMitigation,
  riskMitigationDocument,
} from './riskRegisterSchema/riskMitigation.schema';
import {
  RiskReviewComments,
  RiskReviewCommentsSchema,
} from './riskRegisterSchema/riskReviewComments.schema';

import {
  HiraRegister,
  HiraRegisterSchema,
} from './hiraRegisterSchema/hiraRegister.schema';
import {
  HiraConfig,
  HiraConfigSchema,
} from 'src/risk/schema/hiraConfigSchema/hiraconfig.schema';
import {
  HiraMitigation,
  HiraMitigationSchema,
} from './hiraRegisterSchema/hiraMitigation.schema';
import {
  HiraOwnerComments,
  HiraOwnerCommentsSchema,
} from './hiraRegisterSchema/hiraOwnerComments.schema';
import {
  HiraReviewComments,
  HiraReviewCommentsSchema,
} from './hiraRegisterSchema/hiraReviewComments.schema';
import {
  HiraTypeConfig,
  HiraTypeConfigSchema,
} from 'src/risk/schema/hiraTypesSchema/hiraTypes.schema';
import {
  HiraConsolidatedStatus,
  hiraConsolidatedStatusSchema,
} from './hiraRegisterSchema/hiraConsolidatedStatus.schema';

import {
  HiraReviewHistory,
  HiraReviewHistorySchema,
} from './hiraRegisterSchema/hiraReviewHistory.schema';

import { EmailService } from 'src/email/email.service';
import {
  HiraChangesTrack,
  HiraChangesTrackSchema,
} from './hiraRegisterSchema/hiraChangesTrack.schema';
import {
  HiraAreaMaster,
  HiraAreaMasterSchema,
} from 'src/risk/schema/hiraAreaMasterSchema/hiraAreaMaster.schema';
import { HiraSchema, Hira } from './hiraRegisterSchema/hira.schema';
import {
  HiraSteps,
  HiraStepsSchema,
} from './hiraRegisterSchema/hiraSteps.schema';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { OrganizationModule } from 'src/organization/organization.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
////////////////console.log('riskMitigation', riskMitigation.name);
import { RefsService } from 'src/refs/refs.service';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { SystemsModule } from 'src/systems/systems.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { SystemsService } from 'src/systems/systems.service';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import {
  NpdRegister,
  NpdRegisterSchema,
} from 'src/Npd/schema/registerNpd.schema';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/configuration/schema/configuration.schema';
@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: RiskConfig.name, schema: RiskConfigSchema },
      { name: Riskschema.name, schema: riskSchema },
      { name: riskMitigation.name, schema: riskMitigationDocument },
      { name: RiskReviewComments.name, schema: RiskReviewCommentsSchema },
      { name: Clauses.name, schema: ClausesSchema },
      { name: HiraRegister.name, schema: HiraRegisterSchema },
      { name: HiraConfig.name, schema: HiraConfigSchema },
      { name: HiraMitigation.name, schema: HiraMitigationSchema },
      { name: HiraOwnerComments.name, schema: HiraOwnerCommentsSchema },
      { name: HiraReviewComments.name, schema: HiraReviewCommentsSchema },

      { name: HiraTypeConfig.name, schema: HiraTypeConfigSchema },

      {
        name: HiraConsolidatedStatus.name,
        schema: hiraConsolidatedStatusSchema,
      },
      { name: System.name, schema: SystemSchema },
      { name: HiraReviewHistory.name, schema: HiraReviewHistorySchema },
      { name: HiraChangesTrack.name, schema: HiraChangesTrackSchema },
      { name: HiraAreaMaster.name, schema: HiraAreaMasterSchema },
      { name: Hira.name, schema: HiraSchema },
      { name: HiraSteps.name, schema: HiraStepsSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
    ]),
    SerialNumberModule,
    OrganizationModule,
    LocationModule,
    UserModule,
  ],
  controllers: [RiskRegisterController],
  providers: [
    RiskRegisterService,
    PrismaService,
    EmailService,
    SerialNumberService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    RefsService,
    SystemsService,
  ],
})
export class RiskRegisterModule {}
