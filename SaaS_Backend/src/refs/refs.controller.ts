import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { RefsService } from './refs.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
@Controller('/api/refs')
export class RefsController {
  constructor(private readonly refService: RefsService) {}

  @Post('/bulk-insert')
  create(@Body() data: any) {
    return this.refService.create(data);
  }

  @Put('/bulk-update')
  update(@Body() data: any) {
    return this.refService.update(data);
  }

  @Get(':id')
  findAll(@Param('id') id: string) {
    ////////////////console.log('in find all controller', id  );

    return this.refService.getAllById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.refService.deleteAllById(id);
  }

  @Put('/flag')
  flagRef(@Body() data: any) {
    return this.refService.flagReference(data);
  }
}
