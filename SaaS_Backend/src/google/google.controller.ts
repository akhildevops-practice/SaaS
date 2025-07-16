import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Param,
  Delete,
  Inject,
  Put,
  Query,
  Patch,
} from '@nestjs/common';
import { GoogleService } from './google.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';

@Controller('/api/google')
export class GoogleController {
  constructor(
    private readonly GoogleService: GoogleService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/createGoogle')
  createGoogle(@Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/google/createGoogle`,
      'google.controller.ts',
    );
    return this.GoogleService.createGoogle(data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getGoogleByOrgId/:id')
  getGoogleByOrgId(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/google/getGoogleByOrgId/:id`,
      'google.controller.ts',
    );
    return this.GoogleService.getGoogleByOrgId(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getGoogleDtls')
  getGoogleDtls(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/google/getGoogleDtls`,
      'google.controller.ts',
    );
    return this.GoogleService.getGoogleDtls(req.user.id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateGoogle/:id')
  updateGoogle(@Param('id') id: string, @Body() data: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PATCH api/google/updateGoogle`,
      'google.controller.ts',
    );
    return this.GoogleService.updateGoogle(id, data, randomNumber);
  }
}
