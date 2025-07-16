import { Module } from '@nestjs/common';
import { moduleAdoptionReportController } from './module-adoption-report.controller';
import { moduleAdoptionReportService } from './module-adoption-report.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  moduleAdoptionReport,
  moduleAdoptionReportDocument,
} from './schema/module-adoption-report.schema';
import {
  Hira,
  HiraSchema,
} from 'src/risk-register/hiraRegisterSchema/hira.schema';

import {
  objectiveMaster,
  objectiveMasterSchema,
} from 'src/objective/schema/objectiveMaster.schema';
import {
  kpiReportInstance,
  kpiReportInstanceSchema,
} from 'src/kpi-report/schema/kpi-report-instance.schema';
import {
  AuditPlan,
  AuditPlanSchema,
} from 'src/audit-plan/schema/auditPlan.schema';
import {
  AuditPlanEntityWise,
  AuditPlanEntityWiseSchema,
} from 'src/audit-plan/schema/auditplanentitywise.schema';
import {
  AuditSchedule,
  AuditScheduleSchema,
} from 'src/audit-schedule/schema/auditSchedule.schema';
import {
  AuditScheduleEntityWise,
  AuditScheduleEntityWiseSchema,
} from 'src/audit-schedule/schema/auditScheduleEntityWise.schema';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import {
  Nonconformance,
  NonconformanceSchema,
} from 'src/audit/schema/nonconformance.schema';
import { CIP, CIPDocument } from 'src/cip/schema/cip.schema';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import { MRM, MRMDocument } from 'src/mrm/schema/mrm.schema';
import {
  ScheduleMRM,
  ScheduleMRMDocument,
} from 'src/mrm/schema/scheduleMrm.schema';
import { Meeting, MeetingDocument } from 'src/mrm/schema/meeting.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: moduleAdoptionReport.name, schema: moduleAdoptionReportDocument },
      { name: Hira.name, schema: HiraSchema },
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
      { name: kpiReportInstance.name, schema: kpiReportInstanceSchema },
      { name: AuditPlan.name, schema: AuditPlanSchema },
      { name: AuditPlanEntityWise.name, schema: AuditPlanEntityWiseSchema },
      { name: AuditSchedule.name, schema: AuditScheduleSchema },
      {
        name: AuditScheduleEntityWise.name,
        schema: AuditScheduleEntityWiseSchema,
      },
      { name: Audit.name, schema: AuditSchema },
      { name: Nonconformance.name, schema: NonconformanceSchema },
      { name: CIP.name, schema: CIPDocument },
      { name: cara.name, schema: caraSchema },
      { name: MRM.name, schema: MRMDocument },
      { name: ScheduleMRM.name, schema: ScheduleMRMDocument },
      { name: Meeting.name, schema: MeetingDocument },
    ]),
    AuthenticationModule,
  ],
  controllers: [moduleAdoptionReportController],
  providers: [moduleAdoptionReportService, PrismaService],
})
export class moduleAdoptionReportModule {}
