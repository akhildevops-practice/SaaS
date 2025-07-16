import { Module } from '@nestjs/common';
import { KpiDefinitionController } from './kpi-definition.controller';
import { KpiDefinitionService } from './kpi-definition.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MySQLPrismaService, PrismaService } from 'src/prisma.service';
import { Kpi, KpiSchema } from './schema/kpi.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import {
  organizationGoal,
  OrganizationGoalSchema,
} from 'src/objective/schema/organizationGoal.schema';
import {
  objectiveMaster,
  objectiveMasterSchema,
} from 'src/objective/schema/objectiveMaster.schema';
import { ArchivedKpi, ArchivedKpiSchema } from './schema/archived.schema';
import { FutureKpi, FutureKpiSchema } from './schema/futureKpi.schema';
import { KpiOwner, KpiOwnerSchema } from './schema/kpiOwners.schema';
import {
  KpiMonthTarget,
  KpiMonthTargetSchema,
} from './schema/kpiMonthTargets.schema';
import {
  KpiMonitoring,
  KpiMonitoringSchema,
} from './schema/kpiMonitoring.schema';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import {
  carasettingsSchema,
  cara_settings,
} from 'src/cara/schema/cara-setting.schema';
import { CaraService } from 'src/cara/cara.service';
import {
  ActionItems,
  actionitemsSchema,
} from 'src/actionitems/schema/actionitems.schema';
import {
  CapaComments,
  CaraComments,
} from 'src/cara/schema/cara-comments.schema';
import {
  CapaCapaOwner,
  CaraCapaOwner,
} from 'src/cara/schema/cara-capaowner.schema';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { EmailService } from 'src/email/email.service';
import { OrganizationService } from 'src/organization/organization.service';
import { RefsService } from 'src/refs/refs.service';
import { RefsModule } from 'src/refs/refs.module';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
import { ObjOwner, ObjOwnerSchema } from './schema/objOwners.schema';
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
import { License, LicenseSchema } from 'src/license/schema/license.schema';

@Module({
  imports: [
    KpiDefinitionModule,
    AuthenticationModule,
    RefsModule,
    MongooseModule.forFeature([{ name: Kpi.name, schema: KpiSchema }]),
    MongooseModule.forFeature([
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
    ]),
    MongooseModule.forFeature([{ name: cara.name, schema: caraSchema }]),

    MongooseModule.forFeature([
      { name: cara_settings.name, schema: carasettingsSchema },
    ]),
    MongooseModule.forFeature([
      { name: organizationGoal.name, schema: OrganizationGoalSchema },
      { name: ArchivedKpi.name, schema: ArchivedKpiSchema },
      { name: WorkflowSettings.name, schema: Workflow },
      { name: FutureKpi.name, schema: FutureKpiSchema },
      { name: KpiOwner.name, schema: KpiOwnerSchema },
      { name: ObjOwner.name, schema: ObjOwnerSchema },
      { name: KpiMonthTarget.name, schema: KpiMonthTargetSchema },
      { name: KpiMonitoring.name, schema: KpiMonitoringSchema },
      { name: CaraComments.name, schema: CapaComments },
      { name: Refs.name, schema: RefsSchema },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: System.name, schema: SystemSchema },
      { name: Clauses.name, schema: ClausesSchema },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: Impact.name, schema: ImpactSchema },
      { name: License.name, schema: LicenseSchema },
    ]),
  ],
  controllers: [KpiDefinitionController],
  providers: [
    KpiDefinitionService,
    CaraService,
    PrismaService,
    SerialNumberService,
    OrganizationService,
    RefsService,
    EmailService,
    MySQLPrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class KpiDefinitionModule {}
