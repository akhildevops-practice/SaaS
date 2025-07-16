import { Module } from '@nestjs/common';
import { AuditSettingsService } from './audit-settings.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditSettingsSchema,
  AuditSettings,
} from './schema/audit-settings.schema';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { AuditSettingsController } from './audit-settings.controller';
import {
  AuditFocusAreaSchema,
  AuditFocusArea,
} from './schema/audit-focusarea.schema';
import {
  Proficiency,
  ProficiencySchema,
} from './schema/audit-proficiency.schema';

import {
  AuditorProfileSchema,
  AuditorProfile,
} from './schema/audit-auditorprofile.schema';

import {
  AuditFindingsSchema,
  AuditFindings,
} from './schema/audit-findings.schema';

import { ImpactSchema, Impact } from './schema/impact.schema';
import { CustomLogger } from './logger.provider';
import { RolesService } from 'src/roles/roles.service';
import { UserService } from 'src/user/user.service';
import {
  transferredUser,
  transferredUserSchema,
} from 'src/user/schema/transferredUser.schema';
import { EmailService } from 'src/email/email.service';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
import { License, LicenseSchema } from 'src/license/schema/license.schema';
import { LicenseService } from 'src/license/license.service';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { OciUtils } from 'src/documents/oci_utils';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditSettings.name, schema: AuditSettingsSchema },
      { name: AuditFocusArea.name, schema: AuditFocusAreaSchema },
      { name: Proficiency.name, schema: ProficiencySchema },
      { name: AuditorProfile.name, schema: AuditorProfileSchema },
      { name: AuditFindings.name, schema: AuditFindingsSchema },
      { name: transferredUser.name, schema: transferredUserSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
      { name: License.name, schema: LicenseSchema },
      { name: Impact.name, schema: ImpactSchema },
      { name: ObjectStore.name, schema: ObjectStoreDocument },
    ]),
    AuthenticationModule,
  ],
  controllers: [AuditSettingsController],
  providers: [
    AuditSettingsService,
    EmailService,
    RolesService,
    PrismaService,
    LicenseService,
    UserService,
    OciUtils,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class AuditSettingsModule {}
