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
import { AuditChecksheetService } from './audit-checksheet.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';

@Controller('/api/auditchecksheet')
export class AuditChecksheetController {
  constructor(
    private readonly AuditChecksheetService: AuditChecksheetService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/createAuditChecksheetTemplate')
  createAuditChecksheetTemplate(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/createAuditChecksheetTemplate`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.createAuditChecksheetTemplate(
      data,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createAuditChecksheet')
  createAuditChecksheet(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/createAuditChecksheet`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.createAuditChecksheet(
      data,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateAuditCheckSheet/:id')
  updateAuditCheckSheet(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PATCH api/auditchecksheet/updateAuditCheckSheet`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.updateAuditCheckSheet(
      id,
      data,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditChecksheetTemplates')
  getAuditChecksheetTemplates(@Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditChecksheetTemplates`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheetTemplates(
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditChecksheets')
  getAuditChecksheets(@Query() query: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditChecksheets`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheets(
      query,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditChecksheetTemplateById/:id')
  getAuditChecksheetTemplateById(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditChecksheetTemplateById/:id`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheetTemplateById(
      id,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditChecksheetTemplateDetails/:id')
  getAuditChecksheetTemplateDetails(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditChecksheetTemplateDetails/:id`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheetTemplateDetails(
      id,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditChecksheetById/:id')
  getAuditChecksheetById(@Param('id') id: string, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditChecksheetById/:id`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheetById(
      id,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateAuditChecksheetTemplate/:id')
  updateAuditChecksheet(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PATCH api/auditchecksheet/updateAuditChecksheetTemplate`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.updateAuditChecksheetTemplate(
      id,
      data,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checksheetAppField')
  async checksheetAppField(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/checksheetAppField`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.checksheetAppField(
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAppfieldOptions')
  async getAppfieldOptions(@Query() query: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAppfieldOptions`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAppfieldOptions(
      query,
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditChecksheetReportFilterOptions')
  async getAuditChecksheetReportFilterOptions(@Query() query: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditChecksheetReportFilterOptions`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheetReportFilterOptions(
      query,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDashboardReport')
  async getDashboardReport(@Query() query: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getDashboardReport`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getDashboardReport(
      query,
      req,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditCheckSheetAuditTrail/:id')
  getAuditCheckSheetAuditTrail(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditCheckSheetAuditTrail/:id`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditCheckSheetAuditTrail(id);
  }
  //inbox api
  @UseGuards(AuthenticationGuard)
  @Get('/getAuditCheckSheetForInbox')
  getAuditCheckSheetForInbox(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/getAuditCheckSheetForInbox`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.getAuditChecksheetsForInbox(
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteAuditChecksheetForm/:id')
  deleteAuditChecksheetForm(@Req() req, @Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/deleteAuditChecksheetForm`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.deleteAuditChecksheetForm(
      id,
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/auditChecksheetViewForBeml')
  auditChecksheetViewForBeml(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/auditChecksheetViewForBeml`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.auditChecksheetViewForBeml(
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Post('/copyAuditChecksheetForm/:id')
  copyAuditChecksheetForm(@Req() req, @Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/auditchecksheet/copyAuditChecksheetForm`,
      'audit-checksheet.controller.ts',
    );
    return this.AuditChecksheetService.copyAuditChecksheetForm(
      id,
      req.user.id,
      randomNumber,
    );
  }
}
