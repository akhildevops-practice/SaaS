import { Module } from '@nestjs/common';
import { InspectionService } from './inspection.service';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { InspectionController } from './inspection.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { InspectionSchema, Inspection } from './schema/inspection.schema';

@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: Inspection.name, schema: InspectionSchema },
    ]),
  ],
  controllers: [InspectionController],
  providers: [InspectionService, PrismaService],
})
export class InspectionModule {}
