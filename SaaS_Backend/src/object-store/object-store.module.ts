import { Module } from '@nestjs/common';
import { ObjectStoreController } from './object-store.controller';
import { ObjectStoreService } from './object-store.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectStore, ObjectStoreDocument } from './schema/object-store.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { PrismaService } from 'src/prisma.service';
import {
  AppField,
  AppFieldSchema,
} from 'src/app-field/schema/app-field.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ObjectStore.name, schema: ObjectStoreDocument },
      { name: AppField.name, schema: AppFieldSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [ObjectStoreController],
  providers: [
    ObjectStoreService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class ObjectStoreModule {}
