import { Module } from '@nestjs/common';
import { GlobalsearchController } from './globalsearch.controller';
import { GlobalsearchService } from './globalsearch.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrganizationModule } from 'src/organization/organization.module';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { LocationModule } from 'src/location/location.module';
import { SystemsModule } from 'src/systems/systems.module';
import { EntityModule } from 'src/entity/entity.module';
import { AuditModule } from 'src/audit/audit.module';
import { FavoritesService } from 'src/favorites/favorites.service';
import { NotificationService } from 'src/notification/notification.service';
import { DocumentsModule } from 'src/documents/documents.module';
import { DocumentsService } from 'src/documents/documents.service';
import { UserModule } from 'src/user/user.module';
import { Audit, AuditSchema } from 'src/audit/schema/audit.schema';
import {
  Nonconformance,
  NonconformanceSchema,
} from 'src/audit/schema/nonconformance.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { DashboardModule } from 'src/dashboard/dashboard.module';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
import {
  HiraRegister,
  HiraRegisterSchema,
} from 'src/risk-register/hiraRegisterSchema/hiraRegister.schema';
import {
  Hira,
  HiraSchema,
} from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { cara, caraSchema } from 'src/cara/schema/cara.schema';
import { CIP, CIPDocument } from 'src/cip/schema/cip.schema';
import {
  referenceDocuments,
  referenceDocumentsDocument,
} from 'src/reference-documents/schema/reference-documents.schema';
import {
  Documents,
  DocumentsSchema,
} from 'src/documents/schema/document.schema';
import { Doctype, DoctypeSchema } from 'src/doctype/schema/doctype.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    MongooseModule.forFeature([
      { name: Nonconformance.name, schema: NonconformanceSchema },
      { name: referenceDocuments.name, schema: referenceDocumentsDocument },
      { name: Documents.name, schema: DocumentsSchema },
    ]),
    MongooseModule.forFeature([{ name: System.name, schema: SystemSchema }]),
    MongooseModule.forFeature([{ name: Clauses.name, schema: ClausesSchema }]),
    MongooseModule.forFeature([
      { name: HiraRegister.name, schema: HiraRegisterSchema },
      { name: Hira.name, schema: HiraSchema },
      { name: CIP.name, schema: CIPDocument },
      { name: Doctype.name, schema: DoctypeSchema },
    ]),
    MongooseModule.forFeature([{ name: cara.name, schema: caraSchema }]),

    AuthenticationModule,
    DocumentsModule,
    UserModule,
    OrganizationModule,
    UserModule,
    LocationModule,
    SystemsModule,
    EntityModule,
    AuditModule,
    DashboardModule,
    AuditModule,
  ],
  controllers: [GlobalsearchController],
  providers: [GlobalsearchService, PrismaService],
  exports: [GlobalsearchService],
})
export class GlobalsearchModule {}
