import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { PrismaService } from 'src/prisma.service';
import { AuthenticationModule } from 'src/authentication/authentication.module';
import { FavoritesController } from './favorites.controller';

@Module({
  imports:[AuthenticationModule],
  providers: [FavoritesService,PrismaService],
  controllers:[FavoritesController],
  exports:[FavoritesService]
})
export class FavoritesModule {}
