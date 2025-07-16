import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditSchema } from './schema/audit.schema';
import {
  NcActionPoint,
  NcActionPointSchema,
} from './schema/ncActionPoint.schema';
import { OrganizationModule } from 'src/organization/organization.module';
import { LocationModule } from 'src/location/location.module';
import { UserModule } from 'src/user/user.module';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import {
  Nonconformance,
  NonconformanceSchema,
} from './schema/nonconformance.schema';
import { SystemsModule } from 'src/systems/systems.module';
import { EntityModule } from 'src/entity/entity.module';
import { DocumentsModule } from 'src/documents/documents.module';
import {
  AuditorRating,
  AuditorRatingSchema,
} from './schema/auditorRating.schema';
import { NcComment, NcCommentSchema } from './schema/NcComment.schema';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import {
  NcWorkflowHistory,
  NcWorkflowHistorySchema,
} from './schema/NcWorkflowHistory.schema';
import { UniqueId, UniqueIdSchema } from './schema/UniqueId.schema';
import { MySQLPrismaService, PrismaService } from 'src/prisma.service';
import {
  AuditSettings,
  AuditSettingsSchema,
} from 'src/audit-settings/schema/audit-settings.schema';
import {
  AuditFindings,
  AuditFindingsSchema,
} from 'src/audit-settings/schema/audit-findings.schema';

import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { CustomLogger } from 'src/audit-settings/logger.provider';
import { EmailService } from 'src/email/email.service';
import {
  AuditPlan,
  AuditPlanSchema,
} from 'src/audit-plan/schema/auditPlan.schema';
import {
  AuditSchedule,
  AuditScheduleSchema,
} from 'src/audit-schedule/schema/auditSchedule.schema';
import { ClausesSchema, Clauses } from 'src/systems/schema/clauses.schema';
import { KpiDefinitionService } from 'src/kpi-definition/kpi-definition.service';
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
import { RefsService } from 'src/refs/refs.service';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
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
  NpdRegister,
  NpdRegisterSchema,
} from 'src/Npd/schema/registerNpd.schema';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/configuration/schema/configuration.schema';
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
import { OciUtils } from 'src/documents/oci_utils';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      // { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: AuditFindings.name, schema: AuditFindingsSchema },
      { name: organizationGoal.name, schema: OrganizationGoalSchema },
      { name: AuditPlan.name, schema: AuditPlanSchema },
      { name: cara_settings.name, schema: carasettingsSchema },
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
      { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: System.name, schema: SystemSchema },
      { name: UniqueId.name, schema: UniqueIdSchema },
      { name: NcWorkflowHistory.name, schema: NcWorkflowHistorySchema },
      { name: NcComment.name, schema: NcCommentSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
      { name: AuditorRating.name, schema: AuditorRatingSchema },
      { name: Nonconformance.name, schema: NonconformanceSchema },
      { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: Audit.name, schema: AuditSchema },
      { name: NcActionPoint.name, schema: NcActionPointSchema },
      { name: AuditSchedule.name, schema: AuditScheduleSchema },
      { name: Clauses.name, schema: ClausesSchema },
      { name: Kpi.name, schema: KpiSchema },
      { name: cara.name, schema: caraSchema },
      { name: KpiOwner.name, schema: KpiOwnerSchema },
      { name: ObjOwner.name, schema: ObjOwnerSchema },
      { name: KpiMonthTarget.name, schema: KpiMonthTargetSchema },
      { name: KpiMonitoring.name, schema: KpiMonitoringSchema },
      { name: ArchivedKpi.name, schema: ArchivedKpiSchema },
      { name: FutureKpi.name, schema: FutureKpiSchema },
      { name: CaraComments.name, schema: CapaComments },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: WorkflowSettings.name, schema: Workflow },
      { name: Impact.name, schema: ImpactSchema },
      { name: Hira.name, schema: HiraSchema },
      { name: License.name, schema: LicenseSchema },
    ]),

    OrganizationModule,
    LocationModule,
    UserModule,
    AuthenticationModule,
    SystemsModule,
    EntityModule,
    DocumentsModule,
  ],
  controllers: [AuditController],
  providers: [
    AuditService,
    PrismaService,
    SerialNumberService,
    KpiDefinitionService,
    MySQLPrismaService,
    CaraService,
    RefsService,
    EmailService,
    OciUtils,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  exports: [AuditService],
})
export class AuditModule {}
