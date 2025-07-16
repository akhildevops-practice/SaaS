import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AppFieldService } from './app-field.service';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

@Controller('/api/settings')
export class AppFieldController {
  constructor(private readonly appFieldService: AppFieldService) {}

  @UseGuards(AuthenticationGuard)
  @Post('appField')
  createAppField(@Body() data, @Req() req) {
    return this.appFieldService.createAppField(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAppFields/:orgid')
  async getAllAppFields(@Param('orgid') orgid, @Req() req) {
    return this.appFieldService.getAllAppField(orgid, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAppFieldById/:id')
  async getAppFieldById(@Param('id') id: string, @Req() req) {
    return this.appFieldService.getSingleAppField(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAppFiedlById/:id')
  async updateAppFiedlById(@Param('id') id: string, @Body() data, @Req() req) {
    return this.appFieldService.updateAppField(id, req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAppFieldById/:id')
  async deleteAppFieldById(@Param('id') id: string, @Req() req) {
    return this.appFieldService.deleteAppField(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAppfieldOptions')
  async getAppfieldOptions(@Query() query: any, @Req() req) {
    return this.appFieldService.getAppfieldOptions(query, req.user.id);
  }
}
