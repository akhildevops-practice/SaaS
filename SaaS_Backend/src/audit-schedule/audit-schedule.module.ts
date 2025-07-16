import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditScheduleController } from './audit-schedule.controller';
import { AuditScheduleService } from './audit-schedule.service';
import {
  AuditSchedule,
  AuditScheduleSchema,
} from './schema/auditSchedule.schema';
import {
  AuditScheduleEntityWiseSchema,
  AuditScheduleEntityWise,
} from './schema/auditScheduleEntityWise.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import {
  AuditTemplateSchema,
  AuditTemplate,
} from 'src/audit-template/schema/audit-template.schema';
import {
  AuditSettingsSchema,
  AuditSettings,
} from 'src/audit-settings/schema/audit-settings.schema';
import {
  AuditPlanSchema,
  AuditPlan,
} from 'src/audit-plan/schema/auditPlan.schema';

import {
  AuditorProfile,
  AuditorProfileSchema,
} from 'src/audit-settings/schema/audit-auditorprofile.schema';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { EmailService } from 'src/email/email.service';
import {
  AuditScheduleTeamLead,
  AuditScheduleTeamLeadSchema,
} from './schema/auditScheduleTeamLead.schema';
import {
  AuditPlanEntityWiseSchema,
  AuditPlanEntityWise,
} from 'src/audit-plan/schema/auditplanentitywise.schema';
import {
  Hira,
  HiraSchema,
} from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import { ClausesSchema, Clauses } from 'src/systems/schema/clauses.schema';
import {
  Nonconformance,
  NonconformanceSchema,
} from 'src/audit/schema/nonconformance.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditSchedule.name, schema: AuditScheduleSchema },
      { name: AuditPlanEntityWise.name, schema: AuditPlanEntityWiseSchema },
      {
        name: AuditScheduleEntityWise.name,
        schema: AuditScheduleEntityWiseSchema,
      },
      {
        name: AuditPlan.name,
        schema: AuditPlanSchema,
      },
      { name: Nonconformance.name, schema: NonconformanceSchema },

      {
        name: AuditorProfile.name,
        schema: AuditorProfileSchema,
      },
      { name: System.name, schema: SystemSchema },
      { name: AuditTemplate.name, schema: AuditTemplateSchema },
      { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: AuditScheduleTeamLead.name, schema: AuditScheduleTeamLeadSchema },
      {
        name: Audit.name,
        schema: AuditSchema,
      },
      { name: Hira.name, schema: HiraSchema },
      { name: cara.name, schema: caraSchema },
      { name: Clauses.name, schema: ClausesSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [AuditScheduleController],
  providers: [
    AuditScheduleService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class AuditScheduleModule {}
