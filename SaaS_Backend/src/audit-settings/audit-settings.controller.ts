import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
  Put,
  Delete,
  Inject,
  Query,
  Res,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { AuditSettingsService } from './audit-settings.service';
import { UpdateAuditSettings } from './dto/update-audit-settings';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { AbilityGuard } from 'src/ability/ability.guard';
import { entity } from 'src/organization/dto/business-config.dto';

@Controller('/api/audit-settings')
export class AuditSettingsController {
  constructor(
    private readonly auditSettingsService: AuditSettingsService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Get('getDepartmentForAudit')
  async getDepartmentForAudit(@Req() req, @Query() parameter) {
    return this.auditSettingsService.getDepartmentForAudit(req.user, parameter);
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'AUDIT_TYPE' })
  @Post('newauditType')
  create(@Body() data, @Req() req) {
    return this.auditSettingsService.create(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('newauditFocus')
  createFocusArea(@Body() data, @Req() req) {
    return this.auditSettingsService.createFocusArea(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('newProficiency')
  createProficiency(@Body() data, @Req() req) {
    return this.auditSettingsService.createProficiency(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('newauditorProfile')
  createAuditorProfile(@Body() data, @Req() req, @Res() res) {
    return this.auditSettingsService.createAuditorProfile(data, req.user, res);
  }

  @UseGuards(AuthenticationGuard)
  @Post('newAuditFindings')
  createAuditFindings(@Body() data) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST api/audit-settings/newAuditFindings`,
      'Audit-Settings-Controller',
    );
    return this.auditSettingsService.createAuditFindings(data, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('fetchLocationForAuditProfile')
  fetchLocationForAuditProfile(@Req() req) {
    return this.auditSettingsService.fetchLocationForAuditProfile(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditTypes')
  async getAllAuditTypes(@Req() req, @Query() data) {
    return this.auditSettingsService.getAll(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditTypesTable')
  async getAllAuditTypesTable(@Req() req, @Query() data) {
    return this.auditSettingsService.getAllClone(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllScopesData')
  async getAllScopesData(@Req() req) {
    return this.auditSettingsService.getAllScopesData(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAuditorsBasedOnFilters/:text')
  async getAuditorsBasedOnFilters(@Req() req, @Param('text') text) {
    return this.auditSettingsService.getAuditorsBasedOnFilters(req.user, text);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditFocusAreas')
  async getAllAuditFocusAreas(@Req() req) {
    return this.auditSettingsService.getAllFocusArea(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllProficiency')
  async getAllProficiency(@Req() req, @Query() query) {
    return this.auditSettingsService.getAllProficiencies(req.user.id, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditorProfiles')
  async getAllAuditorProfiles(@Req() req, @Query() data) {
    return this.auditSettingsService.getAllAuditorProfiles(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditFindings')
  async getAllAuditFindings(@Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/audit-settings/getAllAuditFindings`,
      'Audit-Settings-Controller',
    );
    return this.auditSettingsService.getAllAuditFindings(
      req.user.id,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditTypeById/:id')
  async getAuditTypeById(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.getSingle(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditFocusAreaById/:id')
  async getAuditFocusAreaById(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.getSingleFocusArea(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getProficiencyById/:id')
  async getProficiencyById(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.getProficiency(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('isValidAuditSettingName/:text')
  async isValidAuditSettingName(@Param('text') text, @Req() req) {
    return this.auditSettingsService.isValidAuditSettingName(text, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditorProfileById/:id')
  async getAuditorProfileById(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.getSingleAuditorProfile(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'AUDIT_TYPE' })
  @Put('updateAuditTypeById/:id')
  async updateAuditTypeById(
    @Param('id') id: string,
    @Body() data: UpdateAuditSettings,
    @Req() req,
  ) {
    return this.auditSettingsService.updateAuditType(id, req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAuditFocusAreaById/:id')
  async updateAuditFocusAreaById(
    @Param('id') id: string,
    @Body() data: UpdateAuditSettings,
    @Req() req,
  ) {
    return this.auditSettingsService.updateAuditFocusArea(
      id,
      req.user.id,
      data,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateProficiencyById/:id')
  async updateProficiencyById(
    @Param('id') id: string,
    @Body() data: UpdateAuditSettings,
    @Req() req,
  ) {
    return this.auditSettingsService.updateProficiency(id, req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAuditorProfileById/:id')
  async updateAuditorProfileById(
    @Param('id') id: string,
    @Body() data: UpdateAuditSettings,
    @Req() req,
    @Res() res,
  ) {
    return this.auditSettingsService.updateAuditorProfile(
      id,
      req.user,
      data,
      res,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAuditFindingsById/:id')
  async updateAuditFindingsById(
    @Param('id') id: string,
    @Body() data: UpdateAuditSettings,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PUT api/audit-settings/updateAuditFindingsById/:id`,
      'Audit-Settings-Controller',
    );
    return this.auditSettingsService.updateAuditFindings(
      id,
      data,
      randomNumber,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditTypeById/:id')
  async deleteAuditTypeById(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.deleteAuditType(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditFocusAreaById/:id')
  async deleteAuditFocusAreaById(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.deleteAuditFocusArea(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteProficiency/:id')
  async deleteProficiency(@Param('id') id: string, @Req() req) {
    return this.auditSettingsService.deleteProficiency(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditorProfileById/:id')
  async deleteAuditorProfileById(
    @Param('id') id: string,
    @Req() req,
    @Res() res,
  ) {
    return this.auditSettingsService.deleteAuditorProfile(id, req.user, res);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditFindingsById/:id')
  async deleteAuditFindingsById(@Param('id') id: string) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE api/audit-settings/deleteAuditFindingsById/:id`,
      'Audit-Settings-Controller',
    );
    return this.auditSettingsService.deleteAuditFindings(id, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditReportOptionData/:id')
  async getAuditReportOptionData(@Req() req, @Param('id') id) {
    return this.auditSettingsService.getAuditReportOptionData(id, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUserPermissionBasedAuditTypes')
  async getUserPermissionBasedAuditTypes(@Req() req) {
    return this.auditSettingsService.getUserPermissionBasedAuditTypes(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUserPermissionBasedAuditTypesSchedule')
  async getUserPermissionBasedAuditTypesSchedule(@Req() req) {
    return this.auditSettingsService.getUserPermissionBasedAuditTypesSchedule(
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getuserFromDept/:id')
  async getuserFromDept(@Req() req, @Param('id') entityId) {
    return this.auditSettingsService.getuserFromDept(req.user, entityId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getFindingsForAuditTypeAndFilterType/:auditType/:type')
  async getFindingsForAuditTypeAndFilterType(
    @Req() req,
    @Param('auditType') auditType,
    @Param('type') type,
  ) {
    return this.auditSettingsService.getFindingsForAuditTypeAndFilterType(
      req.user,
      auditType,
      type,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getSystemOptions')
  async getSystemOptions(@Req() req) {
    return this.auditSettingsService.getSystemOptions(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('fetchDepartmentForAuditProfile')
  fetchDepartmentForAuditProfile(@Req() req, @Query() query) {
    return this.auditSettingsService.fetchDepartmentForAuditProfile(
      req.user,
      query,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllImpact')
  getAllImpact(@Req() req) {
    return this.auditSettingsService.getAllImpact(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createImpact')
  createImpact(@Req() req, @Body() data) {
    return this.auditSettingsService.createImpact(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateImpact/:id')
  updateImpact(@Req() req, @Body() data, @Param('id') id) {
    return this.auditSettingsService.updateImpact(data,id, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteImpact/:id')
  deleteImpact(@Req() req,  @Param('id') id) {
    return this.auditSettingsService.deleteImpact( id,req.user);
  }
}
