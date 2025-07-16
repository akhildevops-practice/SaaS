import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionitemsService } from 'src/actionitems/actionitems.service';
import {
  ActionItems,
  actionitemsSchema,
} from 'src/actionitems/schema/actionitems.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { EmailService } from 'src/email/email.service';
import { EntityModule } from 'src/entity/entity.module';
import { KpiDefinitionModule } from 'src/kpi-definition/kpi-definition.module';
import { KpiReportModule } from 'src/kpi-report/kpi-report.module';
import { LocationModule } from 'src/location/location.module';
import {
  MailTemplate,
  mailTemplateSchema,
} from 'src/mailtemplate/schema/mailTemplate.schema';
import { OrganizationModule } from 'src/organization/organization.module';
import { PrismaService } from 'src/prisma.service';
import { RefsModule } from 'src/refs/refs.module';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { UserModule } from 'src/user/user.module';
import { CaraController } from './cara.controller';
import { CaraService } from './cara.service';
import { CapaCapaOwner, CaraCapaOwner } from './schema/cara-capaowner.schema';
import { CapaComments, CaraComments } from './schema/cara-comments.schema';
import {
  carasettingsSchema,
  cara_settings,
} from './schema/cara-setting.schema';
import { cara, caraSchema } from './schema/cara.schema';
import { Analyse, AnalyseSchema } from './schema/analyse.schema';
import { CapaDefects, CaraDefects } from './schema/cara-defects.schema';
import {
  CaraRcaSettings,
  cararcasettingsSchema,
} from './schema/cara-rca-settings.schema';
import {
  NpdRegister,
  NpdRegisterSchema,
} from 'src/Npd/schema/registerNpd.schema';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/configuration/schema/configuration.schema';
import { Workflow, WorkflowSettings } from './schema/workflowSettitngs.schema';
import { Impact, ImpactSchema } from 'src/audit-settings/schema/impact.schema';
import { License, LicenseSchema } from 'src/license/schema/license.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: cara.name, schema: caraSchema }]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    MongooseModule.forFeature([
      { name: cara_settings.name, schema: carasettingsSchema },
    ]),
    MongooseModule.forFeature([
      { name: CaraComments.name, schema: CapaComments },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: WorkflowSettings.name, schema: Workflow },
      { name: Impact.name, schema: ImpactSchema },
      { name: License.name, schema: LicenseSchema },
    ]),
    OrganizationModule,
    UserModule,
    SerialNumberModule,
    LocationModule,
    RefsModule,
    EntityModule,
    KpiDefinitionModule,
    KpiReportModule,
    AuthenticationModule,
  ],
  controllers: [CaraController],
  providers: [
    CaraService,
    PrismaService,
    SerialNumberService,

    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class CaraModule {}
