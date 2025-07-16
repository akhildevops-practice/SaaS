import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { StatsSchema, Stats } from './schema/stats.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { PrismaService } from 'src/prisma.service';
@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([{ name: Stats.name, schema: StatsSchema }]),
  ],
  providers: [StatsService, PrismaService],
  controllers: [StatsController],
})
export class StatsModule {}
