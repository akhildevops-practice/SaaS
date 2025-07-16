import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuditScheduleService } from './audit-schedule.service';
import { PrismaService } from 'src/prisma.service';
import { createAuditSchedule } from './dto/createSchedule.dto';
import { updateAuditSchedule } from './dto/updateAuditSchedule.dto';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';

import { identity } from 'rxjs';
import { use } from 'passport';

@Controller('api/auditSchedule')
export class AuditScheduleController {
  constructor(
    private readonly auditSchedule: AuditScheduleService,
    private prisma: PrismaService,
  ) {}

  @Get('/MsCalToken')
  async MsCalToken(@Query() data, @Req() req) {
    return await this.auditSchedule.createCalendarEvent(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditorAndAuditeeAvaibility')
  async getAuditorAndAuditeeAvaibility(@Query() data: any, @Req() req) {
    return this.auditSchedule.getAuditorAndAuditeeAvaibility(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createAuditSchedule')
  async createAuditSchedule(@Body() data: createAuditSchedule, @Req() req) {
    return this.auditSchedule.createAuditSchedule(data, req.user.id);
  }

  @Post('createAuditScheduleForPython')
  async createAuditScheduleForPython(@Body() data: createAuditSchedule, @Req() req) {
    return this.auditSchedule.createAuditSchedule(data, req?.user?.id);
  }

  @UseGuards(AuthenticationGuard) @Get('getAllAuditors') async getAllAuditors(
    @Req() req,
  ) {
    return this.auditSchedule.getAllAuditors(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAuditSchedule/:id')
  async updateAuditSchedule(
    @Param('id') id: string,
    @Body() data: updateAuditSchedule,
    @Req() req,
  ) {
    return this.auditSchedule.updateAuditSchedule(data, id, req.user.id);
  }

  //below one just updates schedule details not the auditschedule entity wise data
  @UseGuards(AuthenticationGuard)
  @Put('updateAuditScheduleDetails/:id')
  async updateAuditScheduleDetails(
    @Param('id') id: string,
    @Body() data: updateAuditSchedule,
    @Req() req,
  ) {
    return this.auditSchedule.updateAuditScheduleDetails(data, id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAuditScheduleEntityData/:id')
  async updateAuditScheduleEntityData(
    @Param('id') id: string,
    @Body() data,
    @Req() req,
  ) {
    return this.auditSchedule.updateAuditScheduleEntityData(data, id, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateAuditScheduleEntityWise/:id')
  async updateAuditScheduleEntityWise(@Param('id') id, @Body() data: any) {
    return this.auditSchedule.updateAuditScheduleEntityWise(id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createEntryInAuditScheduleEntityWise')
  async createEntryInAuditScheduleEntityWise(@Body() data: any) {
    return this.auditSchedule.createEntryInAuditScheduleEntityWise(data);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditScheduleEntityWise/:id')
  async deleteAuditScheduleEntityWise(@Param('id') id) {
    return this.auditSchedule.deleteAuditScheduleEntityWise(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditorForLocation/:location/:role')
  async getAuditor(
    @Param('location') location: string,
    @Param('role') role: string,
    @Query() auditType: any,
    @Req() req,
  ) {
    return this.auditSchedule.getAuditorForLocation(
      location,
      role,
      req.user.id,
      auditType,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityHeadForDepartment/:entity')
  async getEntityHeadForDepartment(
    @Param('entity') entity: string,
    @Req() req,
  ) {
    return this.auditSchedule.getEntityHeadForDepartment(entity, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditschedule/:location/:year/:auditType')
  async forAll(
    @Req() req,
    @Param('location') location,
    @Param('year') year,
    @Param('auditType') auditType,
    @Query() data,
  ) {
    return this.auditSchedule.getAll(
      req.user.id,
      location,
      year,
      auditType,
      data,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditScheduleByIdOld/:id/:orgName')
  async getAuditScheduleByIdOld(
    @Param('id') id: string,
    @Param('orgName') orgName: string,
    // @Req() req,
  ) {
    return this.auditSchedule.getAuditScheduleByIdOld(id, orgName);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditScheduleById/:id/:orgName')
  async getAuditScheduleById(
    @Param('id') id: string,
    @Param('orgName') orgName: string,
    // @Req() req,
  ) {
    return this.auditSchedule.getAuditScheduleById(id, orgName);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getFunctionForUser')
  async getFunctionForUser(@Req() req) {
    return this.auditSchedule.getFunctionForUser(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditeeByEntity/:entityType/:location')
  async getAuditeeByEntity(
    @Param('entityType') entityType: string,
    @Param('location') location: string,
    @Req() req,
  ) {
    return this.auditSchedule.getAuditeeByEntity(
      entityType,
      location,
      req.user.id,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditeeByDepartment/:orgId/:entityId')
  async getAuditeeByDepartment(
    @Param('entityId') entityId: string,
    @Param('orgId') orgId: string,
  ) {
    return this.auditSchedule.getAuditeeByDepartment(entityId, orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('auditScheduleDelete/:id')
  async auditScheduleDelete(@Param('id') id: string, @Req() req) {
    return this.auditSchedule.auditScheduleDelete(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('auditScheduleTemplate')
  async auditScheduleTemplate(@Req() req) {
    return this.auditSchedule.auditScheduleTemplate(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditScheduleEntityWiseCalendardata')
  async getAuditScheduleEntityWiseCalendardata(
    @Req() req,

    @Query() query,
  ) {
    return this.auditSchedule.getAuditScheduleEntityWiseCalendardata(
      req.user,
      query,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditFilterData')
  async getAuditFilterData(@Req() req, @Query() query) {
    return this.auditSchedule.getAuditFilterData(query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('search')
  async search(@Req() req, @Query('search') query) {
    return this.auditSchedule.search(query, req.user);
  }
  //same as getMyAuditCalendardata but with pagination
  @UseGuards(AuthenticationGuard)
  @Get('myaudit')
  async myaudit(@Req() req, @Query() query) {
    return this.auditSchedule.myaudit(req.user, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditors')
  async getAuditors(@Req() req, @Query() data) {
    return this.auditSchedule.getAuditors(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getMyAuditCalendardata')
  async getMyAuditCalendatdata(@Req() req, @Query() query) {
    return this.auditSchedule.getMyAuditCalendardata(query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('updateAuditEntityByCalendarData')
  async updateAuditEntityByCalendarData(@Req() req, @Query() query) {
    return this.auditSchedule.updateAuditEntityByCalendarData(query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailForHead/:id')
  async sendmailforHead(@Req() req, @Param('id') id) {
    return this.auditSchedule.sendMailForHead(req.user, id, "");
  }

  @UseGuards(AuthenticationGuard)
  @Get('isLoggedinUsercreateAuditSchedule')
  async isLoggedinUsercreateAuditSchedule(@Req() req) {
    return this.auditSchedule.isLoggedinUsercreateAuditSchedule(req.user);
  }

  //send mail to team lead in case schedule is saved as draft and team lead was found in
  //the scheduled finalised date
  @UseGuards(AuthenticationGuard)
  @Post('sendMailToTeamLead')
  async sendConfirmationMail(@Body() data: any) {
    return this.auditSchedule.sendMailToTeamLead(data);
  }
  //api to create an entry for teamlead in teamlead schema when mail is sent to teamlead
  @UseGuards(AuthenticationGuard)
  @Post('createTeamLeadEntry')
  async createTeamLeadEntry(@Body() data: any) {
    return this.auditSchedule.createTeamLeadEntry(data);
  }

  //update api to indicate that team lead has updated the schedule from inbox
  @UseGuards(AuthenticationGuard)
  @Patch('updateTeamLeadEntry/:id')
  async updateTeamLeadEntry(@Param('id') id) {
    return this.auditSchedule.updateTeamLeadEntry(id);
  }
  //api for getting audit scheudle inbox entries for team lead
  @UseGuards(AuthenticationGuard)
  @Get('getAuditScheduleForTLinInbox')
  async getAuditScheduleForTLinInbox(@Req() req) {
    return this.auditSchedule.getAuditScheduleInfoForInbox(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditScheduleEntityDataForDropAndDown')
  async getAuditScheduleEntityDataForDropAndDown(@Req() req, @Query() data) {
    return this.auditSchedule.getAuditScheduleEntityDataForDropAndDown(
      req.user,
      data,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('dropAndAuditPlan')
  async dropAndAuditPlan(@Req() req, @Body() data) {
    return this.auditSchedule.dropAndAuditPlan(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getBoardData')
  async getBoardData(@Req() req, @Query() data) {
    return this.auditSchedule.getBoardData(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getMonthdata')
  async getMonthdata(@Req() req, @Query() data) {
    return this.auditSchedule.getMonthdata(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getMonthByPlannedData')
  async getMonthByPlannedData(@Query() data,@Req() req){
    return this.auditSchedule.getMonthByPlannedData(data,req.user)
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditScheduleById/:id')
  async deleteAuditScheduleById(@Param('id') id: string, @Req() req) {
    return this.auditSchedule.deleteAuditScheduleById(id, req.user.id);
  }
}
