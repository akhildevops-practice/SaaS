import { Module } from '@nestjs/common';
import { ConnectedAppsController } from './connected-apps.controller';
import { ConnectedAppsService } from './connected-apps.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import {
  ObjectStore,
  ObjectStoreDocument,
} from 'src/object-store/schema/object-store.schema';
import { Google, GoogleDocument } from 'src/google/schema/google.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ObjectStore.name, schema: ObjectStoreDocument },
      { name: Google.name, schema: GoogleDocument },
    ]),
    AuthenticationModule,
  ],
  controllers: [ConnectedAppsController],
  providers: [ConnectedAppsService, PrismaService],
})
export class ConnectedAppsModule {}
