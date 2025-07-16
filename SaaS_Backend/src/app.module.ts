import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';
import { LocationModule } from './location/location.module';
import { EntityModule } from './entity/entity.module';
//import { SocketGateway } from './websocket/socket.gateway';
import { NotificationModule } from './notification/notification.module';
import { DoctypeModule } from './doctype/doctype.module';
import { AuditModule } from './audit/audit.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentsModule } from './documents/documents.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaService } from './prisma.service';
import { DoctypeService } from './doctype/doctype.service';
import { ConnectedAppsModule } from './connected-apps/connected-apps.module';
import { KpiDefinitionModule } from './kpi-definition/kpi-definition.module';
import { KpiReportModule } from './kpi-report/kpi-report.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditTemplateModule } from './audit-template/audit-template.module';
import { SystemsModule } from './systems/systems.module';
import { FavoritesController } from './favorites/favorites.controller';
import { FavoritesModule } from './favorites/favorites.module';
import { AuditPlanModule } from './audit-plan/audit-plan.module';
import { AuditScheduleService } from './audit-schedule/audit-schedule.service';
import { AuditScheduleController } from './audit-schedule/audit-schedule.controller';
import { AuditScheduleModule } from './audit-schedule/audit-schedule.module';
import { MyInboxModule } from './my-inbox/my-inbox.module';
import { KraModule } from './kra/kra.module';
import { ObjectiveModule } from './objective/objective.module';
import { RiskModule } from './risk/riskconfig.module';
import { RiskRegisterModule } from './risk-register/risk-register.module';
import { RolesModule } from './roles/roles.module';
import { AuditTrialModule } from './audit-trial/audit-trial.module';
import { CustomLogger } from './audit-trial/logger.provider';
import { SerialNumberModule } from './serial-number/serial-number.module';

import { MeetingTypeService } from './key-agenda/meetingType.service';
import { MeetingTypeController } from './key-agenda/meetingType.controller';
import { MeetingTypeModule } from './key-agenda/meetingType.module';

import { MRMController } from './mrm/mrm.controller';
import { MRMService } from './mrm/mrm.service';
import { MRMModule } from './mrm/mrm.module';
import { BusinessModule } from './business/business.module';
import { AuditSettingsModule } from './audit-settings/audit-settings.module';
import { GlobalsearchModule } from './globalsearch/globalsearch.module';
import { RefsModule } from './refs/refs.module';
import { CaraModule } from './cara/cara.module';
import { AppFieldController } from './app-field/app-field.controller';
import { AppFieldModule } from './app-field/app-field.module';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { CipModule } from './cip/cip.module';
import { ActionitemsModule } from './actionitems/actionitems.module';
import { ModelModule } from './Models/model.module';
import { PartModule } from './Parts/parts.module';
import { ProblemModule } from './Problems/problem.module';
import { InspectionModule } from './inspection/inspection.module';
import { moduleHelpModule } from './moduleHelp/moduleHelp.module';
import { StatsModule } from './stats/stats.module';
import { referenceDocumentsModule } from './reference-documents/reference-documents.module';
import { TicketSupportModule } from './ticket-support/ticket-support.module';
import { MailtemplateModule } from './mailtemplate/mailtemplate.module';
import { moduleAdoptionReportModule } from './module-adoption-report/module-adoption-report.module';
import { AuditChecksheetModule } from './audit-checksheet/audit-checksheet.module';
import { BomModule } from './bom/bom.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { NPDModule } from './Npd/npd.module';
import { ObjectStoreModule } from './object-store/object-store.module';
import { GoogleModule } from './google/google.module';
import { LicenseModule } from './license/license.module';
import { GlobalWorkflowModule } from './global-workflow/global-workflow.module';
import { DocumentformsModule } from './documentforms/documentforms.module';
import { DigitalSignatureController } from './digital-signature/digital-signature.controller';
import { DigitalSignatureService } from './digital-signature/digital-signature.service';
import { DigitalSignatureModule } from './digital-signature/digital-signature.module';

// InspectionsModel
@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
    }),
    OrganizationModule,
    UserModule,
    LocationModule,
    EntityModule,
    DoctypeModule,
    NotificationModule,
    DocumentsModule,
    DashboardModule,
    ProblemModule,
    MongooseModule.forRoot(process.env.MONGO_DB_URI),
    AuditModule,
    AuditTemplateModule,
    ModelModule,
    PartModule,
    SystemsModule,
    FavoritesModule,
    AuditPlanModule,
    AuditScheduleModule,
    MyInboxModule,
    ConnectedAppsModule,
    KpiDefinitionModule,
    KpiReportModule,
    KraModule,
    ObjectiveModule,
    RiskModule,
    RiskRegisterModule,
    RolesModule,
    AuditTrialModule,
    SerialNumberModule,
    MeetingTypeModule,
    MRMModule,
    BusinessModule,
    AuditSettingsModule,
    GlobalsearchModule,
    RefsModule,
    CaraModule,
    AppFieldModule,
    EmailModule,
    CipModule,
    ActionitemsModule,
    InspectionModule,
    moduleHelpModule,
    StatsModule,
    referenceDocumentsModule,
    TicketSupportModule,
    MailtemplateModule,
    moduleAdoptionReportModule,
    AuditChecksheetModule,
    BomModule,
    ConfigurationModule,
    NPDModule,

    ObjectStoreModule,
    GoogleModule,
    LicenseModule,
    GlobalWorkflowModule,
    DocumentformsModule,
    DigitalSignatureModule,
  ],
  controllers: [AppController, FavoritesController, DigitalSignatureController],
  providers: [
    AppService,

    //SocketGateway,

    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    EmailService,
    DigitalSignatureService,
  ],
  exports: [PrismaService],
})
export class AppModule {}
