import { Module } from '@nestjs/common';
import { AuditsController } from './audit-plan.controller';
import { PrismaService } from 'src/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditsPlanService } from './audit-plan.service';
import { AuditPlan, AuditPlanSchema } from './schema/auditPlan.schema';
import {
  AuditPlanEntityWiseSchema,
  AuditPlanEntityWise,
} from './schema/auditplanentitywise.schema';

import { AuthenticationModule } from 'src/authentication/authentication.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import {
  AuditSettingsSchema,
  AuditSettings,
} from 'src/audit-settings/schema/audit-settings.schema';
import {
  AuditorProfileSchema,
  AuditorProfile,
} from 'src/audit-settings/schema/audit-auditorprofile.schema';
import {
  AuditPlanUnitWise,
  AuditPlanUnitWiseSchema,
} from './schema/auditPlanUnitwiseSchema';
import { EmailService } from 'src/email/email.service';
import {
  AuditSchedule,
  AuditScheduleSchema,
} from 'src/audit-schedule/schema/auditSchedule.schema';
import {
  AuditScheduleEntityWise,
  AuditScheduleEntityWiseSchema,
} from 'src/audit-schedule/schema/auditScheduleEntityWise.schema';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditPlan.name, schema: AuditPlanSchema },
      { name: AuditSchedule.name, schema: AuditScheduleSchema },
      {
        name: AuditScheduleEntityWise.name,
        schema: AuditScheduleEntityWiseSchema,
      },
      { name: Audit.name, schema: AuditSchema },
    ]),
    MongooseModule.forFeature([
      { name: AuditPlanEntityWise.name, schema: AuditPlanEntityWiseSchema },
      { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: AuditorProfile.name, schema: AuditorProfileSchema },
      { name: AuditPlanUnitWise.name, schema: AuditPlanUnitWiseSchema },
    ]),
    AuthenticationModule,
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
  ],
  controllers: [AuditsController],
  providers: [
    AuditsPlanService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class AuditPlanModule {}
