import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { ActionitemsService } from './actionitems.service';
import { Logger, query } from 'winston';
import { v4 as uuid } from 'uuid';
import { ApiParam } from '@nestjs/swagger';

@Controller('/api/actionitems')
export class ActionitemsController {
  constructor(
    private readonly actionitem: ActionitemsService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('createActionItem')
  async createActionItem(@Body() data: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/actionitems/createActionItem`,
      'Cara-controller',
    );
    return this.actionitem.createActionItem(data, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateActionItem/:id')
  async updateActionItem(@Body() data: any, @Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/actionitems/updateActionItem`,
      'ActionItem-controller',
    );
    return this.actionitem.updateActionItem(data, id, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getActionItemForSource')
  async getActionItemForSource(@Query() query: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/actionitems/getallactionitemsforsource`,
      'actionitem-controller',
    );
    return this.actionitem.getAllActionItemsForSource(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getActionItemForSourceMRM')
  async getActionItemForSourceMRM(@Query() query: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/actionitems/getallactionitemsforsourceMRM`,
      'actionitem-controller',
    );
    return this.actionitem.getAllActionItemsForSourceMRM(query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getActionItemForOwner')
  async getActionItemForOwner(@Param('id') id: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} Get api/actionitems/getallactionitemsforowner`,
      'actionitem-controller',
    );
    return this.actionitem.getAllActionItemsForOwner(
      id,
      randomNumber,
      req.user,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deleteActionItem/:id')
  async deleteActionItem(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/actionitems/deleteActionITem/${id}`,
      'actionitem-controller',
    );
    return this.actionitem.deleteActionItem(id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getActionItemForReference/:id')
  async getActionItemForReference(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/actionitems/getActionItemForReference/${id}`,
      'actionitem-controller',
    );
    return this.actionitem.getActionItemForReference(id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getActionItemById/:id')
  async getActionItemById(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/actionitems/getActionItemById/${id}`,
      'actionitem-controller',
    );
    return this.actionitem.getActionItemById(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getFilterListForMRM')
  async getFilterListForMRM(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/actionitems/ getFilterListForMRM`,
      'actionitem-controller',
    );
    return this.actionitem.getFilterListForMRM(
      req.user.id,
      randomNumber,
      query,
    );
  }
}
