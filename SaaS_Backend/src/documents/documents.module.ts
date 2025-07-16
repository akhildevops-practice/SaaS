import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { PrismaService } from '../prisma.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserModule } from '../user/user.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RefsModule } from 'src/refs/refs.module';
import { EntityModule } from 'src/entity/entity.module';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { Logger } from 'winston';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { RefsSchema, Refs } from 'src/refs/schema/refs.schema';
import { RefsService } from 'src/refs/refs.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { OrganizationService } from 'src/organization/organization.service';
import { aiMetaData, aiMetaDataSchema } from './schema/ai_metadata.schema';
import { docProcess, docProcessSchema } from './schema/docprocess.schema';
import {
  auditTrail,
  auditTrailDocument,
} from '../audit-trial/schema/audit-trial.schema';
import { AuditTrialModule } from '../audit-trial/audit-trial.module';
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
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import { LicenseModule } from 'src/license/license.module';
import { LicenseService } from 'src/license/license.service';
import { Documents, DocumentsSchema } from './schema/document.schema';
import { Document } from 'mongoose';
import {
  AdditionalDocumentAdmins,
  AdditionalDocumentAdminsSchema,
} from './schema/AdditionalDocAdmins.schema';
import {
  DocumentAttachmentHistory,
  DocumentAttachmentHistorySchema,
} from './schema/DocumentAttachmentHistory.schema';
import { Doctype, DoctypeSchema } from 'src/doctype/schema/doctype.schema';
import { OciUtils } from './oci_utils';
import { DocUtils } from './doc_utils';
import {
  docWorkflowHistoySchema,
  docWorkflowHistoy,
} from './schema/docWorkflowHistory.schema';
import {
  DocumentComments,
  DocumentCommentsSchema,
} from './schema/DocumentComments.schema';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    MongooseModule.forFeature([
      { name: System.name, schema: SystemSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: aiMetaData.name, schema: aiMetaDataSchema },
      { name: auditTrail.name, schema: auditTrailDocument },
      { name: docProcess.name, schema: docProcessSchema },
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
      { name: License.name, schema: LicenseSchema },

      { name: Documents.name, schema: DocumentsSchema },
      { name: Doctype.name, schema: DoctypeSchema },
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
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
    ]),
    AuditTrialModule,
    RefsModule,
    EntityModule,
    LicenseModule,
    SerialNumberModule,
    EmailModule,
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    PrismaService,
    OrganizationService,
    SerialNumberService,
    LicenseService,
    EmailService,
    OciUtils,
    DocUtils,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  exports: [DocumentsService,OciUtils],
})
export class DocumentsModule {}
