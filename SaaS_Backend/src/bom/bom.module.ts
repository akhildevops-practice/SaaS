import { Module } from '@nestjs/common';
import { BomController } from './bom.controller';
import { BomService } from './bom.service';
import { CustomLogger } from 'src/audit-trial/logger.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { BoM, BoMSchema } from './schema/bom.schema';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { BoMEntity, BoMEntitySchema } from './schema/bomEntities.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BoM.name, schema: BoMSchema },
      { name: BoMEntity.name, schema: BoMEntitySchema },
    ]),
    AuthenticationModule,
  ],
  controllers: [BomController],
  providers: [
    BomService,
    PrismaService,
    {
      provide: 'Logger',
      useClass: CustomLogger,
    },
  ],
})
export class BomModule {}
