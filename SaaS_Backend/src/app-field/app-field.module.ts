import { Module } from '@nestjs/common';
import { AppFieldService } from './app-field.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AppField, AppFieldSchema } from './schema/app-field.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { AppFieldController } from './app-field.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AppField.name, schema: AppFieldSchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [AppFieldController],
  providers: [AppFieldService, PrismaService],
})
export class AppFieldModule {}
