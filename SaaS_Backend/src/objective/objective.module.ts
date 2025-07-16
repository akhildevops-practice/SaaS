import { Module } from '@nestjs/common';
import { ObjectiveService } from './objective.service';
import { PrismaService } from 'src/prisma.service';
import { ObjectiveController } from './objective.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import {
  objectiveMaster,
  objectiveMasterSchema,
} from './schema/objectiveMaster.schema';
import {
  OrganizationGoalSchema,
  organizationGoal,
} from './schema/organizationGoal.schema';
import { AuditSchema, Audit } from 'src/audit/schema/audit.schema';
import {
  NonconformanceSchema,
  Nonconformance,
} from 'src/audit/schema/nonconformance.schema';
import {
  ReviewComments,
  ReviewCommentsSchema,
} from './schema/reviewComments.schema';
import {
  OwnerCommentsSchema,
  OwnerComments,
} from './schema/ownerComments.schema';
import { KRA, kraSchema } from 'src/kra/schema/kra.schema';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { Kpi, KpiSchema } from 'src/kpi-definition/schema/kpi.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: organizationGoal.name, schema: OrganizationGoalSchema },
    ]),
    MongooseModule.forFeature([
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
    ]),
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    MongooseModule.forFeature([
      { name: Nonconformance.name, schema: NonconformanceSchema },
    ]),
    MongooseModule.forFeature([
      { name: ReviewComments.name, schema: ReviewCommentsSchema },
    ]),
    MongooseModule.forFeature([
      { name: OwnerComments.name, schema: OwnerCommentsSchema },
    ]),
    MongooseModule.forFeature([{ name: KRA.name, schema: kraSchema }]),
    MongooseModule.forFeature([{ name: Kpi.name, schema: KpiSchema }]),
    AuthenticationModule,
  ],
  controllers: [ObjectiveController],
  providers: [
    ObjectiveService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class ObjectiveModule {}
