import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LicenseService } from './license.service';
import { Logger } from 'winston';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { v4 as uuid } from 'uuid';
@Controller('/api/license')
export class LicenseController {
  constructor(
    private readonly licenseService: LicenseService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('createRealmLicense')
  async createRealmLicense(@Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/license/createLicense started`,
      '',
    );
    return this.licenseService.createRealmLicense(
      data,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateRealmLicense/:id')
  async updateRealmLicense(@Param('id') id, @Body() data, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/license/updateLicense/${id} started`,
      '',
    );
    return this.licenseService.updateRealmLicense(
      id,
      data,
      req.user.id,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getRealmLicenseDetails/:id')
  async getRealmLicenseDetails(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/license/getRealmLicenseDetails/${id} started`,
      '',
    );
    return this.licenseService.getRealmLicenseDetails(id, randomNumber);
  }
}
