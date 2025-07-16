import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { KraController } from './kra.controller';
import { KraService } from './kra.service';
import {
  objectiveMaster,
  objectiveMasterSchema,
} from 'src/objective/schema/objectiveMaster.schema';
import { kraSchema, KRA } from './schema/kra.schema';
import {
  ReviewComments,
  ReviewCommentsSchema,
} from 'src/objective/schema/reviewComments.schema';
import {
  OwnerComments,
  OwnerCommentsSchema,
} from 'src/objective/schema/ownerComments.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: KRA.name, schema: kraSchema }]),
    MongooseModule.forFeature([
      { name: objectiveMaster.name, schema: objectiveMasterSchema },
    ]),
    MongooseModule.forFeature([
      { name: ReviewComments.name, schema: ReviewCommentsSchema },
    ]),
    MongooseModule.forFeature([
      { name: OwnerComments.name, schema: OwnerCommentsSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [KraController],
  providers: [KraService, PrismaService],
  exports: [KraService],
})
export class KraModule {}
