import { Module } from '@nestjs/common';
import { DoctypeService } from './doctype.service';
import { DoctypeController } from './doctype.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SerialNumberModule } from 'src/serial-number/serial-number.module';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Configuration,
  ConfigurationSchema,
} from 'src/configuration/schema/configuration.schema';
import {
  NpdRegister,
  NpdRegisterSchema,
} from 'src/Npd/schema/registerNpd.schema';
import { DoctypeSchema, Doctype } from './schema/doctype.schema';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import {
  DocumentAttachmentHistory,
  DocumentAttachmentHistorySchema,
} from 'src/documents/schema/DocumentAttachmentHistory.schema';
import {
  AdditionalDocumentAdmins,
  AdditionalDocumentAdminsSchema,
} from 'src/documents/schema/AdditionalDocAdmins.schema';
import {
  GlobalWorkflow,
  GlobalWorkflowSchema,
} from 'src/global-workflow/schema/global-workflow.schema';
import { GlobalWorkflowService } from 'src/global-workflow/global-workflow.service';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
import { EntityService } from 'src/entity/entity.service';
import { UserService } from 'src/user/user.service';
import {
  EntityChain,
  EntityChainSchema,
} from 'src/entity/schema/entityChain.schema';
import {
  transferredUser,
  transferredUserSchema,
} from 'src/user/schema/transferredUser.schema';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import { LicenseService } from 'src/license/license.service';
import { EmailService } from 'src/email/email.service';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { OciUtils } from 'src/documents/oci_utils';

@Module({
  imports: [
    AuthenticationModule,
    NotificationModule,
    MongooseModule.forFeature([
      { name: NpdRegister.name, schema: NpdRegisterSchema },
      { name: Configuration.name, schema: ConfigurationSchema },
      { name: Doctype.name, schema: DoctypeSchema },
      { name: System.name, schema: SystemSchema },
      {
        name: DocumentAttachmentHistory.name,
        schema: DocumentAttachmentHistorySchema,
      },
      {
        name: AdditionalDocumentAdmins.name,
        schema: AdditionalDocumentAdminsSchema,
      },
      { name: GlobalWorkflow.name, schema: GlobalWorkflowSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
      { name: EntityChain.name, schema: EntityChainSchema },
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: License.name, schema: LicenseSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
    ]),
  ],
  controllers: [DoctypeController],
  providers: [
    DoctypeService,
    PrismaService,
    SerialNumberService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    GlobalWorkflowService,
    EntityService,
    UserService,
    OciUtils,
    EmailService,
    LicenseService,
  ],
  exports: [DoctypeService],
})
export class DoctypeModule {}
