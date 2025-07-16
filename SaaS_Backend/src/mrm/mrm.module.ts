import { Module } from '@nestjs/common';
import { MRMController } from './mrm.controller';
import { MRMService } from './mrm.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MRM, MRMDocument } from './schema/mrm.schema';
import { ScheduleMRM, ScheduleMRMDocument } from './schema/scheduleMrm.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { OrganizationModule } from 'src/organization/organization.module';
import { UserModule } from 'src/user/user.module';
import { ActionPoint, ActionPointDocument } from './schema/actionPoint.schema';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { LocationModule } from 'src/location/location.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { Agenda, AgendaDocument } from './schema/agenda.schema';
import {
  MeetingType,
  MeetingTypeDocument,
} from 'src/key-agenda/schema/meetingType.schema';
import { Meeting, MeetingDocument } from './schema/meeting.schema';
import { EmailService } from 'src/email/email.service';
import {
  ActionItems,
  actionitemsSchema,
} from 'src/actionitems/schema/actionitems.schema';
import {
  carasettingsSchema,
  cara_settings,
} from 'src/cara/schema/cara-setting.schema';

import { CaraService } from 'src/cara/cara.service';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import { RefsService } from 'src/refs/refs.service';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import {
  CapaComments,
  CaraComments,
} from 'src/cara/schema/cara-comments.schema';
import {
  CapaCapaOwner,
  CaraCapaOwner,
} from 'src/cara/schema/cara-capaowner.schema';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
import {
  MailTemplate,
  mailTemplateSchema,
} from 'src/mailtemplate/schema/mailTemplate.schema';
import { DocumentsService } from 'src/documents/documents.service';
import { EntityService } from 'src/entity/entity.service';
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
  aiMetaData,
  aiMetaDataSchema,
} from 'src/documents/schema/ai_metadata.schema';
import {
  docProcess,
  docProcessSchema,
} from 'src/documents/schema/docprocess.schema';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import { LicenseService } from 'src/license/license.service';
import {
  Workflow,
  WorkflowSettings,
} from 'src/cara/schema/workflowSettitngs.schema';
import { Impact, ImpactSchema } from 'src/audit-settings/schema/impact.schema';
import {
  Documents,
  DocumentsSchema,
} from 'src/documents/schema/document.schema';
import {
  DocumentAttachmentHistory,
  DocumentAttachmentHistorySchema,
} from 'src/documents/schema/DocumentAttachmentHistory.schema';
import {
  AdditionalDocumentAdmins,
  AdditionalDocumentAdminsSchema,
} from 'src/documents/schema/AdditionalDocAdmins.schema';
import { Doctype, DoctypeSchema } from 'src/doctype/schema/doctype.schema';
import { OciUtils } from 'src/documents/oci_utils';
import { DocUtils } from 'src/documents/doc_utils';
import {
  docWorkflowHistoySchema,
  docWorkflowHistoy,
} from 'src/documents/schema/docWorkflowHistory.schema';
import {
  DocumentCommentsSchema,
  DocumentComments,
} from 'src/documents/schema/DocumentComments.schema';
import {
  EntityChain,
  EntityChainSchema,
} from 'src/entity/schema/entityChain.schema';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MRM.name, schema: MRMDocument },
      { name: ScheduleMRM.name, schema: ScheduleMRMDocument },
      { name: MeetingType.name, schema: MeetingTypeDocument },
      { name: ActionPoint.name, schema: ActionPointDocument },
      { name: Agenda.name, schema: AgendaDocument },
      { name: Meeting.name, schema: MeetingDocument },
      { name: ActionItems.name, schema: actionitemsSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: cara_settings.name, schema: carasettingsSchema },
      { name: CaraComments.name, schema: CapaComments },
      { name: CaraCapaOwner.name, schema: CapaCapaOwner },
      { name: Clauses.name, schema: ClausesSchema },
      { name: MailTemplate.name, schema: mailTemplateSchema },
      { name: Analyse.name, schema: AnalyseSchema },
      { name: CaraDefects.name, schema: CapaDefects },
      { name: CaraRcaSettings.name, schema: cararcasettingsSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: aiMetaData.name, schema: aiMetaDataSchema },
      { name: docProcess.name, schema: docProcessSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
      { name: License.name, schema: LicenseSchema },
      { name: WorkflowSettings.name, schema: Workflow },
      { name: Impact.name, schema: ImpactSchema },
      { name: Doctype.name, schema: DoctypeSchema },
      { name: Documents.name, schema: DocumentsSchema },
      {
        name: DocumentAttachmentHistory.name,
        schema: DocumentAttachmentHistorySchema,
      },
      {
        name: AdditionalDocumentAdmins.name,
        schema: AdditionalDocumentAdminsSchema,
      },
      {
        name: docWorkflowHistoy.name,
        schema: docWorkflowHistoySchema,
      },
      {
        name: DocumentComments.name,
        schema: DocumentCommentsSchema,
      },
      {
        name: EntityChain.name,
        schema: EntityChainSchema,
      },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    MongooseModule.forFeature([{ name: cara.name, schema: caraSchema }]),
    SerialNumberModule,
    OrganizationModule,
    UserModule,
    AuthenticationModule,
    LocationModule,
  ],
  controllers: [MRMController],
  providers: [
    MRMService,
    SerialNumberService,
    EmailService,
    CaraService,
    RefsService,
    DocumentsService,
    LicenseService,
    EntityService,
    PrismaService,
    OciUtils,
    DocUtils,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class MRMModule {}
