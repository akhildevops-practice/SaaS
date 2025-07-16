import { Module } from '@nestjs/common';
import { AuditChecksheetController } from './audit-checksheet.controller';
import { AuditChecksheetService } from './audit-checksheet.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditChecksheetTemplate,
  AuditChecksheetTemplateDocument,
} from './schema/audit-checksheet-template.schema';
import {
  AuditChecksheets,
  AuditChecksheetsDocument,
} from './schema/audit-checksheet.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { PrismaService } from 'src/prisma.service';
import { RefsModule } from 'src/refs/refs.module';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import {
  AppField,
  AppFieldSchema,
} from 'src/app-field/schema/app-field.schema';
import {
  AuditDeptChecklist,
  AuditDeptChecklistDocument,
} from './schema/audit-dept-checklist.schema';
import {
  auditTrail,
  auditTrailDocument,
} from '../audit-trial/schema/audit-trial.schema';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AuditChecksheetTemplate.name,
        schema: AuditChecksheetTemplateDocument,
      },
      { name: AuditChecksheets.name, schema: AuditChecksheetsDocument },
      { name: AppField.name, schema: AppFieldSchema },
      { name: AuditDeptChecklist.name, schema: AuditDeptChecklistDocument },
      { name: auditTrail.name, schema: auditTrailDocument },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
    ]),
    AuthenticationModule,
    RefsModule,
    EmailModule,
  ],
  controllers: [AuditChecksheetController],
  providers: [
    AuditChecksheetService,
    PrismaService,
    EmailService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class AuditChecksheetModule {}
