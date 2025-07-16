import { Module } from '@nestjs/common';
import { MyInboxController } from './my-inbox.controller';
import { MyInboxService } from './my-inbox.service';
import { MySQLPrismaService, PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Nonconformance,
  NonconformanceSchema,
} from 'src/audit/schema/nonconformance.schema';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import { OrganizationModule } from 'src/organization/organization.module';
import { LocationModule } from 'src/location/location.module';
import { AuditService } from 'src/audit/audit.service';
import { AuditSettingsModule } from 'src/audit-settings/audit-settings.module';
import { Mongoose } from 'mongoose';
import {
  AuditSettingsSchema,
  AuditSettings,
} from 'src/audit-settings/schema/audit-settings.schema';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { UniqueId, UniqueIdSchema } from 'src/audit/schema/UniqueId.schema';
import {
  NcWorkflowHistory,
  NcWorkflowHistorySchema,
} from 'src/audit/schema/NcWorkflowHistory.schema';
import { NcComment, NcCommentSchema } from 'src/audit/schema/NcComment.schema';
import {
  AuditorRating,
  AuditorRatingSchema,
} from 'src/audit/schema/auditorRating.schema';
import {
  NcActionPoint,
  NcActionPointSchema,
} from 'src/audit/schema/ncActionPoint.schema';
import { UserModule } from 'src/user/user.module';
import { SystemsModule } from 'src/systems/systems.module';
import { EntityModule } from 'src/entity/entity.module';
import { DocumentsModule } from 'src/documents/documents.module';
import {
  AuditFindings,
  AuditFindingsSchema,
} from 'src/audit-settings/schema/audit-findings.schema';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { EmailService } from 'src/email/email.service';
import {
  AuditSchedule,
  AuditScheduleSchema,
} from 'src/audit-schedule/schema/auditSchedule.schema';
import {
  AuditPlan,
  AuditPlanSchema,
} from 'src/audit-plan/schema/auditPlan.schema';
import { ClausesSchema, Clauses } from 'src/systems/schema/clauses.schema';
import { KpiDefinitionService } from 'src/kpi-definition/kpi-definition.service';
import { KpiDefinitionModule } from 'src/kpi-definition/kpi-definition.module';
import { Kpi, KpiSchema } from 'src/kpi-definition/schema/kpi.schema';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import {
  organizationGoal,
  OrganizationGoalSchema,
} from 'src/objective/schema/organizationGoal.schema';
import {
  objectiveMaster,
  objectiveMasterSchema,
} from 'src/objective/schema/objectiveMaster.schema';
import {
  carasettingsSchema,
  cara_settings,
} from 'src/cara/schema/cara-setting.schema';
import {
  KpiOwner,
  KpiOwnerSchema,
} from 'src/kpi-definition/schema/kpiOwners.schema';
import {
  KpiMonthTarget,
  KpiMonthTargetSchema,
} from 'src/kpi-definition/schema/kpiMonthTargets.schema';
import {
  KpiMonitoring,
  KpiMonitoringSchema,
} from 'src/kpi-definition/schema/kpiMonitoring.schema';
import {
  ArchivedKpi,
  ArchivedKpiSchema,
} from 'src/kpi-definition/schema/archived.schema';
import {
  FutureKpi,
  FutureKpiSchema,
} from 'src/kpi-definition/schema/futureKpi.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { CaraService } from 'src/cara/cara.service';
import {
  CapaComments,
  CaraComments,
} from 'src/cara/schema/cara-comments.schema';
import {
  CapaCapaOwner,
  CaraCapaOwner,
} from 'src/cara/schema/cara-capaowner.schema';
import {
  ActionItems,
  actionitemsSchema,
} from 'src/actionitems/schema/actionitems.schema';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { RefsService } from 'src/refs/refs.service';
import {
  ObjOwner,
  ObjOwnerSchema,
} from 'src/kpi-definition/schema/objOwners.schema';
import {
  MailTemplate,
  mailTemplateSchema,
} from 'src/mailtemplate/schema/mailTemplate.schema';
import { Analyse, AnalyseSchema } from 'src/cara/schema/analyse.schema';
import { CapaDefects, CaraDefects } from 'src/cara/schema/cara-defects.schema';
import {
  CaraRcaSettings,
  cararcasettingsSchema,
} from 'src/cara/schema/cara-rca-settings.schema';
import {
  Workflow,
  WorkflowSettings,
} from 'src/cara/schema/workflowSettitngs.schema';
import { Impact, ImpactSchema } from 'src/audit-settings/schema/impact.schema';
import {
  Hira,
  HiraSchema,
} from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import {
  Documents,
  DocumentsSchema,
} from 'src/documents/schema/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    MongooseModule.forFeature([
      { name: Nonconformance.name, schema: NonconformanceSchema },
    ]),
    MongooseModule.forFeature([
      { name: AuditSettings.name, schema: AuditSettingsSchema },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    MongooseModule.forFeature([
      { name: Audit.name, schema: AuditSchema },
      { name: NcActionPoint.name, schema: NcActionPointSchema },
    ]),
    MongooseModule.forFeature([
      { name: AuditSettings.name, schema: AuditSettingsSchema },
    ]),
    MongooseModule.forFeature([
      { name: Nonconformance.name, schema: NonconformanceSchema },
    ]),
    MongooseModule.forFeature([
      { name: AuditorRating.name, schema: AuditorRatingSchema },
    ]),
    MongooseModule.forFeature([
      { name: NcComment.name, schema: NcCommentSchema },
    ]),
    MongooseModule.forFeature([
      { name: NcWorkflowHistory.name, schema: NcWorkflowHistorySchema },
    ]),
    MongooseModule.forFeature([
      { name: UniqueId.name, schema: UniqueIdSchema },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    MongooseModule.forFeature([
      { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: AuditFindings.name, schema: AuditFindingsSchema },
      { name: AuditSchedule.name, schema: AuditScheduleSchema },
      { name: AuditPlan.name, schema: AuditPlanSchema },
      { name: Clauses.name, schema: ClausesSchema },
      { name: Kpi.name, schema: KpiSchema },
      { name: cara.name, schema: caraSchema },
      { name: KpiOwner.name, schema: KpiOwnerSchema },
      { name: KpiMonthTarget.name, schema: KpiMonthTargetSchema },
      { name: KpiMonitoring.name, schema: KpiMonitoringSchema },
      { name: ArchivedKpi.name, schema: ArchivedKpiSchema },
      { name: FutureKpi.name, schema: FutureKpiSchema },
      { name: organizationGoal.name, schema: OrganizationGoalSchema },
      { name: ObjOwner.name, schema: ObjOwnerSchema },
      { name: cara_settings.name, schema: carasettingsSchema },
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
      { name: CaraComments.name, schema: CapaComments },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
      { name: WorkflowSettings.name, schema: Workflow },
      { name: Impact.name, schema: ImpactSchema },
      { name: Hira.name, schema: HiraSchema },
      { name: License.name, schema: LicenseSchema },
      { name: Documents.name, schema: DocumentsSchema },
    ]),

    AuthenticationModule,
    AuditSettingsModule,
    OrganizationModule,
    LocationModule,
    UserModule,
    AuthenticationModule,
    SystemsModule,
    EntityModule,
    DocumentsModule,
    SerialNumberModule,
    KpiDefinitionModule,
  ],
  controllers: [MyInboxController],
  providers: [
    MyInboxService,
    PrismaService,
    AuditService,
    EmailService,
    KpiDefinitionService,
    CaraService,
    RefsService,
    MySQLPrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class MyInboxModule {}
