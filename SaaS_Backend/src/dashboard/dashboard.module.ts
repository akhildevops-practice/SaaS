import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { DocumentsModule } from 'src/documents/documents.module';
import { DocumentsService } from 'src/documents/documents.service';
import { UserModule } from 'src/user/user.module';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import {
  Nonconformance,
  NonconformanceSchema,
} from 'src/audit/schema/nonconformance.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationModule } from 'src/organization/organization.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { LocationModule } from 'src/location/location.module';
import { SystemsModule } from 'src/systems/systems.module';
import { EntityModule } from 'src/entity/entity.module';
import { AuditModule } from 'src/audit/audit.module';
import { FavoritesService } from 'src/favorites/favorites.service';
import { RefsModule } from 'src/refs/refs.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';
import {
  aiMetaData,
  aiMetaDataSchema,
} from 'src/documents/schema/ai_metadata.schema';
import {
  docProcess,
  docProcessSchema,
} from 'src/documents/schema/docprocess.schema';
import { RefsSchema, Refs } from 'src/refs/schema/refs.schema';
import { AuditTrialModule } from 'src/audit-trial/audit-trial.module';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import { LicenseModule } from 'src/license/license.module';
import { LicenseService } from 'src/license/license.service';
import {
  Documents,
  DocumentsSchema,
} from 'src/documents/schema/document.schema';
import { Doctype, DoctypeSchema } from 'src/doctype/schema/doctype.schema';
import {
  DocumentAttachmentHistory,
  DocumentAttachmentHistorySchema,
} from 'src/documents/schema/DocumentAttachmentHistory.schema';
import {
  AdditionalDocumentAdmins,
  AdditionalDocumentAdminsSchema,
} from 'src/documents/schema/AdditionalDocAdmins.schema';
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
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    MongooseModule.forFeature([
      { name: Nonconformance.name, schema: NonconformanceSchema },
      { name: Refs.name, schema: RefsSchema },
      { name: aiMetaData.name, schema: aiMetaDataSchema },
      { name: docProcess.name, schema: docProcessSchema },
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
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    AuthenticationModule,
    DocumentsModule,
    UserModule,
    OrganizationModule,
    UserModule,
    LocationModule,
    SystemsModule,
    EntityModule,
    AuditModule,
    RefsModule,
    SerialNumberModule,
    EmailModule,
    AuditTrialModule,
    LicenseModule,
  ],
  exports: [DashboardService],
  providers: [
    DashboardService,
    PrismaService,
    NotificationService,
    DocumentsService,
    EmailService,
    LicenseService,
    FavoritesService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    OciUtils,
    DocUtils,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
