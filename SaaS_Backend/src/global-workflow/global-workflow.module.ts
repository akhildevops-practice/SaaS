import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import {
  GlobalWorkflow,
  GlobalWorkflowSchema,
} from './schema/global-workflow.schema';
import { GlobalWorkflowController } from './global-workflow.controller';
import { GlobalWorkflowService } from './global-workflow.service';
import {
  GlobalRoles,
  GlobalRolesSchema,
} from 'src/user/schema/globlaRoles.schema';
import { EntityService } from 'src/entity/entity.service';
import {
  EntityChain,
  EntityChainSchema,
} from 'src/entity/schema/entityChain.schema';
import { Doctype, DoctypeSchema } from 'src/doctype/schema/doctype.schema';
@Module({
  imports: [
    AuthenticationModule,
    UserModule,
    MongooseModule.forFeature([
      { name: GlobalWorkflow.name, schema: GlobalWorkflowSchema },
      { name: GlobalRoles.name, schema: GlobalRolesSchema },
      { name: EntityChain.name, schema: EntityChainSchema },
      { name: Doctype.name, schema: DoctypeSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [GlobalWorkflowController],
  providers: [
    GlobalWorkflowService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
    EntityService,
  ],
})
export class GlobalWorkflowModule {}
