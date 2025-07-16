import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { ConnectedAppsModule } from 'src/connected-apps/connected-apps.module';
import { KpiDefinitionModule } from 'src/kpi-definition/kpi-definition.module';
import { LocationModule } from 'src/location/location.module';
import { OrganizationModule } from 'src/organization/organization.module';
import { PrismaService, MySQLPrismaService } from 'src/prisma.service';
import { KpiReportController } from './kpi-report.controller';
import { KpiReportService } from './kpi-report.service';
import {
  kpiReportTemplate,
  kpiReportTemplateSchema,
} from './schema/kpi-report-template.schema';
import {
  kpiReportCategory,
  kpiReportCategorySchema,
} from './schema/kpi-report-category.schema';
import {
  kpiReportInstance,
  kpiReportInstanceSchema,
} from './schema/kpi-report-instance.schema';
import { KpiDefinitionService } from 'src/kpi-definition/kpi-definition.service';
import { ConnectedAppsService } from 'src/connected-apps/connected-apps.service';
import { KRA, kraSchema } from 'src/kra/schema/kra.schema';
import { KraModule } from 'src/kra/kra.module';
import { KraService } from 'src/kra/kra.service';
import { ObjectiveModule } from 'src/objective/objective.module';
import {
  objectiveMaster,
  objectiveMasterSchema,
} from 'src/objective/schema/objectiveMaster.schema';
import {
  ReviewComments,
  ReviewCommentsSchema,
} from 'src/objective/schema/reviewComments.schema';
import {
  OwnerComments,
  OwnerCommentsSchema,
} from 'src/objective/schema/ownerComments.schema';
import { KraController } from 'src/kra/kra.controller';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { Kpi, KpiSchema } from 'src/kpi-definition/schema/kpi.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import {
  organizationGoal,
  OrganizationGoalSchema,
} from 'src/objective/schema/organizationGoal.schema';
import {
  ArchivedKpi,
  ArchivedKpiSchema,
} from 'src/kpi-definition/schema/archived.schema';
import {
  FutureKpi,
  FutureKpiSchema,
} from 'src/kpi-definition/schema/futureKpi.schema';
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
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import {
  carasettingsSchema,
  cara_settings,
} from 'src/cara/schema/cara-setting.schema';
import { CaraModule } from 'src/cara/cara.module';
import { CaraService } from 'src/cara/cara.service';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
import {
  CapaComments,
  CaraComments,
} from 'src/cara/schema/cara-comments.schema';
import {
  CapaCapaOwner,
  CaraCapaOwner,
} from 'src/cara/schema/cara-capaowner.schema';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import {
  ActionItems,
  actionitemsSchema,
} from 'src/actionitems/schema/actionitems.schema';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { RefsService } from 'src/refs/refs.service';
import { EmailService } from 'src/email/email.service';
import {
  ObjOwner,
  ObjOwnerSchema,
} from 'src/kpi-definition/schema/objOwners.schema';
import {
  MailTemplate,
  mailTemplateSchema,
} from 'src/mailtemplate/schema/mailTemplate.schema';
import {
  transferredUser,
  transferredUserSchema,
} from 'src/user/schema/transferredUser.schema';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
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
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { Google, GoogleDocument } from 'src/google/schema/google.schema';
import { LicenseModule } from 'src/license/license.module';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import { LicenseService } from 'src/license/license.service';
import {
  Workflow,
  WorkflowSettings,
} from 'src/cara/schema/workflowSettitngs.schema';
import { Impact, ImpactSchema } from 'src/audit-settings/schema/impact.schema';
import { OciUtils } from 'src/documents/oci_utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Kpi.name, schema: KpiSchema },
      { name: kpiReportTemplate.name, schema: kpiReportTemplateSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
      { name: kpiReportCategory.name, schema: kpiReportCategorySchema },
      { name: kpiReportInstance.name, schema: kpiReportInstanceSchema },
      { name: KRA.name, schema: kraSchema },
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
      { name: ReviewComments.name, schema: ReviewCommentsSchema },
      { name: OwnerComments.name, schema: OwnerCommentsSchema },
      { name: organizationGoal.name, schema: OrganizationGoalSchema },
      { name: ArchivedKpi.name, schema: ArchivedKpiSchema },
      { name: FutureKpi.name, schema: FutureKpiSchema },
      { name: KpiOwner.name, schema: KpiOwnerSchema },
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: KpiMonthTarget.name, schema: KpiMonthTargetSchema },
      { name: KpiMonitoring.name, schema: KpiMonitoringSchema },
      { name: ObjOwner.name, schema: ObjOwnerSchema },
      { name: cara.name, schema: caraSchema },
      { name: cara_settings.name, schema: carasettingsSchema },
      { name: System.name, schema: SystemSchema },
      { name: Clauses.name, schema: ClausesSchema },
      { name: CaraComments.name, schema: CapaComments },
      { name: Refs.name, schema: RefsSchema },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
      { name: Google.name, schema: GoogleDocument },
      { name: License.name, schema: LicenseSchema },
      { name: WorkflowSettings.name, schema: Workflow },
      { name: Impact.name, schema: ImpactSchema },
    ]),

    ConnectedAppsModule,
    KpiDefinitionModule,
    LicenseModule,
    OrganizationModule,
    LocationModule,
    KpiReportModule,
    LicenseModule,
    AuthenticationModule,
    KraModule,
    ObjectiveModule,
    UserModule,
    ConnectedAppsModule,
  ],
  controllers: [KpiReportController, KraController],
  providers: [
    KpiReportService,
    MySQLPrismaService,
    EmailService,
    RefsService,
    LicenseService,
    SerialNumberService,
    PrismaService,
    KpiDefinitionService,
    KraService,
    UserService,
    ConnectedAppsService,
    OciUtils,
    CaraService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class KpiReportModule {}
