import {
  Controller,
  Inject,
  Post,
  Req,
  Body,
  UseGuards,
  Put,
  Param,
  Get,
  Query,
  Delete,
} from '@nestjs/common';

import { post } from 'request';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';
import { MailtemplateService } from './mailtemplate.service';
import { v4 as uuid } from 'uuid';
import { ApiParam } from '@nestjs/swagger';
@Controller('/api/mailTemplate')
export class MailtemplateController {
  constructor(
    private readonly mailTemplate: MailtemplateService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('createMailTemplate')
  async createMailTemplate(@Req() req, @Body() data) {
    const randomNumber = uuid;
    this.logger.log(
      `trace id=${randomNumber} POST api/mailtemplate/createMailTemplate service called`,
      '',
    );
    return this.mailTemplate.createMailTemplate(
      req.user.id,
      data,
      randomNumber,
    );
  }
  //api to update mail template
  @UseGuards(AuthenticationGuard)
  @Put('updateMailTemplate/:id')
  async updateMailTemplate(@Req() req, @Body() data, @Param('id') id) {
    const randomNumber = uuid;
    this.logger.log(
      `trace id=${randomNumber} PUT api/mailtemplate/updateMailTemplate service called`,
      '',
    );
    return this.mailTemplate.updateMailTemplate(
      req.user.id,
      data,
      randomNumber,
      id,
    );
  }
  // api to get single mail template based on id
  @UseGuards(AuthenticationGuard)
  @Get('getMailTemplate/:id')
  async getMailTemplate(@Req() req, @Param('id') id) {
    const randomNumber = uuid;
    this.logger.log(
      `trace id=${randomNumber} GET api/mailtemplate/getMailTemplate/${id} service called`,
      '',
    );
    return this.mailTemplate.getMailTemplate(
      req.user.id,

      randomNumber,
      id,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deleteMailTemplate/:id')
  async deleteMailTemplate(@Req() req, @Param('id') id) {
    const randomNumber = uuid;
    this.logger.log(
      `trace id=${randomNumber} DELETE api/mailtemplate/deleteMailTemplate/${id} service called`,
      '',
    );
    return this.mailTemplate.deleteMailTemplate(
      req.user.id,

      randomNumber,
      id,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllMailTemplate')
  async getAllMailTemplate(@Req() req, @Query('') query) {
    const randomNumber = uuid;
    this.logger.log(
      `trace id=${randomNumber} GET api/mailtemplate/getAllMailTemplate/${query} service called`,
      '',
    );
    return this.mailTemplate.getAllMailTemplate(
      req.user.id,

      randomNumber,
      query,
    );
  }
}
