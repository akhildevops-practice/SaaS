import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavDTO } from './dto/createFav_dto';
import { updateFav } from './dto/updateFav_dto';

@Controller('api/favorites')
export class FavoritesController {
  constructor(private readonly favoriteService: FavoritesService) {}

  @Post('createFavorite')
  async createFavorite(@Body() data: CreateFavDTO) {
    return this.favoriteService.createFavorite(data);
  }

  @Put('updateFavorite/:userId')
  async updateFavorite(
    @Body() data: updateFav,
    @Param('userId') userId: string,
  ) {
    return this.favoriteService.updateFavorite(data, userId);
  }

  @Get('getFavorites')
  async getFavoriteForUser() {
    return this.favoriteService.favoriteAll();
  }

  @Delete('deleteFavorite/:user/:name')
  async deleteFavorite(
    @Param('name') name: string,
    @Param('user') user: string,
  ) {
    return this.favoriteService.deleteFavorite(user, name);
  }

  @Get('getFavoriteByUserId/:id')
  async getFavoriteByUserId(@Param('id') id: string) {
    return this.favoriteService.getFavoriteByUserId(id);
  }

  @Get('checkFavorite/:userId/:fav')
  async checkFavorite(
    @Param('fav') fav: string,
    @Param('userId') userId: string,
  ) {
    return this.favoriteService.checkFavorite(userId, fav);
  }
}
