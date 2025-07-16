import { Module } from '@nestjs/common';
import { RefsController } from './refs.controller';
import { RefsService } from './refs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RefsSchema, Refs } from './schema/refs.schema';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
import { System, SystemSchema } from 'src/systems/schema/system.schema';
import { Clauses, ClausesSchema } from 'src/systems/schema/clauses.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Refs.name,
        schema: RefsSchema,
      },
      { name: System.name, schema: SystemSchema },
      { name: Clauses.name, schema: ClausesSchema },
    ]),
    AuthenticationModule,
  ],
  exports: [RefsService],
  controllers: [RefsController],
  providers: [RefsService, PrismaService],
})
export class RefsModule {}
