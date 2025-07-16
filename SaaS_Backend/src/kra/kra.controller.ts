import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { KraService } from './kra.service';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { Action } from 'src/ability/ability.factory';
import { createKra } from './dto/createKra.dto';
import { KRA } from './schema/kra.schema';
import { identity } from 'rxjs';

@Controller('api/kra')
export class KraController {
  constructor(private readonly kraService: KraService) {}

  @UseGuards(AuthenticationGuard)
  @Get('getKraById/:id')
  async getKraById(@Req() req, @Param('id') id) {
    return this.kraService.getKraById(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateKraById/:id')
  async updateKraById(@Body() data, @Param('id') id, @Req() req) {
    return this.kraService.updateKraById(id, req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteKra/:id')
  async deleteKra(@Param('id') id, @Req() req) {
    return this.kraService.deleteKra(id, req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('create')
  async createKra(@Body() data, @Req() req) {
    return this.kraService.create(req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllKra/:id')
  async getAll(@Req() req, @Param('id') id) {
    return this.kraService.getAll(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUOM')
  async getUOM(@Req() req) {
    return this.kraService.getUOM(req.user.id);
  }
}
