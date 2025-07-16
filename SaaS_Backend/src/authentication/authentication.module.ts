import { HttpModule, Module } from '@nestjs/common';
import { UserService } from '../user/user.service';

import { AuthenticationGuard } from './authentication.guard';
import { AuthenticationService } from './authentication.service';
import { AUTHENTICATION_STRATEGY_TOKEN } from './authentication.strategy';
import { KeycloakAuthenticationStrategy } from './strategy/keycloak.strategy';
import { PrismaService } from '../prisma.service';

import {
  transferredUser,
  transferredUserSchema,
} from 'src/user/schema/transferredUser.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { EmailService } from 'src/email/email.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
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
    MongooseModule.forFeature([
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
      { name: License.name, schema: LicenseSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
    ]),
  ],
  providers: [
    PrismaService,
    EmailService,
    AuthenticationGuard,
    AuthenticationService,
    KeycloakAuthenticationStrategy,
    LicenseService,
    OciUtils,
    UserService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    // {
    //     provide: AUTHENTICATION_STRATEGY_TOKEN,
    //     useClass: KeycloakAuthenticationStrategy,
    // },
  ],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
