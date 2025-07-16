import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';

import {
  transferredUser,
  transferredUserSchema,
} from './schema/transferredUser.schema';
import { EmailService } from 'src/email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import { GlobalRoles, GlobalRolesSchema } from './schema/globlaRoles.schema';
import { LicenseService } from 'src/license/license.service';
import { LicenseModule } from 'src/license/license.module';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { OciUtils } from 'src/documents/oci_utils';

@Module({
  imports: [
    AuthenticationModule,
    LicenseModule,
    MongooseModule.forFeature([
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
      { name: License.name, schema: LicenseSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    LicenseService,
    LicenseService,
    EmailService,
    OciUtils,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
