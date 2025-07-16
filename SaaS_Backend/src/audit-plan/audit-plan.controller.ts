import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
  Body,
  Post,
  Put,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
//   import { AuditsService } from './audits.service';
import { AuditsPlanService } from './audit-plan.service';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { createAudit } from './dto/createAudit';
// import { updateAudit } from 'src/audit/dto/update-audit.dto';
import { updateAudit } from './dto/updateAudit';
import { identity } from 'rxjs';

@Controller('/api/auditPlan')
export class AuditsController {
  constructor(private readonly auditPlanService: AuditsPlanService) {}

  @UseGuards(AuthenticationGuard)
  @Post('addUnitWiseAuditPlan')
  async createAuditPlanUnitwise(@Body() data: any) {
    return this.auditPlanService.createAuditPlanUnitWise(data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getUnitWiseData/:id')
  async getUnitWiseData(@Param('id') id, @Query() data, @Req() req) {
    return this.auditPlanService.getUnitWiseData(id, data, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateAuditPlanUnitwise/:id')
  async updateAuditPlanUnitwise(@Param('id') id, @Body() data: any) {
    return this.auditPlanService.updateAuditPlanUnitWise(id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanUnitwiseForLocation/:id')
  async getAuditPlanUnitwiseForLocation(@Param('id') id) {
    return this.auditPlanService.getAuditPlanUnitwiseForLocation(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanUnitwiseById/:id')
  async getAuditPlanUnitwiseById(@Param('id') id) {
    return this.auditPlanService.getAuditPlanUnitwiseById(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditPlanFinalizedDatesById/:id')
  async getAllAuditPlanFinalizedDatesById(@Param('id') id) {
    return this.auditPlanService.getAllFinalizedDatesForAuditPlan(id);
  }

  // @UseGuards(AuthenticationGuard)
  // @Post('sendMailForAcceptance')
  // async sendmailforacceptance(@Body() data: any) {
  //   return this.auditPlanService.sendMailForAcceptance(data);
  // }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailForAcceptance')
  async sendmailforacceptance(@Body() data: any) {
    // Start sending emails but do not await the result
    this.auditPlanService
      .sendMailForAcceptance(data)
      .then((result) => {
        // console.log('Email sending initiated:', result);
        // this.logger.log(
        //   `POST /api/auditPlan/addUnitWiseAuditPlan - Service started`,
        //   '',
        // );
      })
      .catch((error) => {
        // console.error('Error in background email sending:', error);
      });

    // Immediately return a response to the client
    return { message: 'Email sending process started' };
  }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailAfterUpdate')
  async sendMailAfterUpdate(@Body() data: any) {
    return this.auditPlanService.sendMailAfterUpdate(data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailForHead/:id')
  async sendmailforHead(@Req() req, @Param('id') id) {
    return this.auditPlanService.sendMailForHead(req.user, id);
  }
  @Post('sendConfirmationMail')
  async sendConfirmationMail(@Body() data: any) {
    return this.auditPlanService.sendConfirmationMail(data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getLocationByUserID')
  async getLocationUser(@Req() req) {
    // ////////////////console.log('user', req.user);
    return this.auditPlanService.getLocationUserId(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditYear')
  async getAuditYear(@Req() req) {
    // ////////////////console.log('user', req.user);
    return this.auditPlanService.getAuditYear(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllMrsOfLocation/:id')
  async getAllMrsOfLocation(@Param('id') id) {
    //////console.log('location id', id);
    return this.auditPlanService.getAllMrsOfLocation(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllUsersOfLocation/:id')
  async getAllUsersOfLocation(@Param('id') id) {
    //////console.log('location id', id);
    return this.auditPlanService.getAllUsersOfLocation(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllUsersOfDepartment/:id')
  async getAllUsersOfDepartment(@Param('id') id) {
    return this.auditPlanService.getAllUsersOfDepartment(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllSystemsByOrganisation')
  async getAllSystems(@Req() req) {
    return this.auditPlanService.getAllSystemsByOrganisation(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getSystemsBySystemType/:system')
  async getSystems(@Req() req, @Param('system') system) {
    return this.auditPlanService.getSystemsBySystemType(req.user.id, system);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityByLocation')
  async getEntityByLocation(@Req() req) {
    return this.auditPlanService.getEntityByLocation(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getRoles')
  async getRoles(@Req() req) {
    return this.auditPlanService.getRoles(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntitiesFromEntityType/:entityType')
  async getEntitiesFromEntityType(@Req() req, @Param('entityType') id: string) {
    return this.auditPlanService.getEntitiesFromEntityType(req.user.id, id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createAuditPlan')
  async createAuditPlan(@Req() req, @Body() data: createAudit) {
    return this.auditPlanService.createAudit(req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateAuditPlan/:id')
  async updateAuditPlan(
    @Param('id') id: string,
    @Body() data: updateAudit,
    @Req() req,
  ) {
    return this.auditPlanService.updateAudit(id, req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('removeAuditPlanEntityWiseById/:id')
  async removeAuditPlanEntityWiseById(@Param('id') id: string, @Req() req) {
    return this.auditPlanService.removeAuditPlanEntityWiseById(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('restoreAuditPlanEntityWiseById/:id')
  async restoreAuditPlanEntityWiseById(
    @Param('id') id: string,
    @Body() data,
    @Req() req,
  ) {
    return this.auditPlanService.restoreAuditPlanEntityWiseById(
      id,
      req.user.id,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanData/:id')
  async getAuditPlanData(@Param('id') id: string, @Body() data, @Req() req) {
    return this.auditPlanService.getAuditPlanData(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanEntityWiseData/:id')
  async getAuditPlanEntityWiseData(
    @Param('id') id: string,
    @Req() req,
    @Query() dataInfo: any,
  ) {
    return this.auditPlanService.getAuditPlanEntityWiseData(
      id,
      dataInfo,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanSingle/:id')
  async getAuditPlanSingle(@Param('id') id: string, @Body() data, @Req() req) {
    return this.auditPlanService.getAuditPlanSingle(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanSingleByIdAndAuditType/:AuditType')
  async getAuditPlanSingleByIdAndAuditType(
    @Param('AuditType') auditType: string,
    @Req() req,
  ) {
    return this.auditPlanService.getAuditPlanSingleByIdAndAuditType(
      auditType,
      req.user,
    );
  }
  // @UseGuards(AuthenticationGuard)
  // @Get('finalizedDatesAndAuditors/:id/:id1')
  // async getfinalizeddatesandauditors(@Param('id') id, @Param('id1') id1) {
  //   return this.auditPlanService.getFinalizedDatesAndAuditors(id, id1);
  // }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditors/:systems')
  async getAllAuditors(@Req() req, @Param('systems') system) {
    //////////////console.log('hellow ');
    return this.auditPlanService.getAllAuditors(req.user, JSON.parse(system));
  }

  // @UseGuards(AuthenticationGuard)
  // @Get('getAllAuditPlan/:location')
  // async getAllAuditPlan(@Req() req, @Param('location') location) {
  //   return this.auditPlanService.getAll(req.user.id,JSON.parse(location));
  // }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditPlan/:year/:location')
  async getAllAuditPlan(
    @Req() req,
    @Param('year') year,
    @Param('location') location,
    @Query() data,
  ) {
    return this.auditPlanService.getAll(req.user, year, location, data);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditPlanById/:id')
  async deleteAuditPlanId(@Param('id') id: string, @Req() req) {
    return this.auditPlanService.deleteAuditPlanId(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntity/:locId/:entityTypeId')
  async getEntityname(
    @Param('locId') locId,
    @Param('entityTypeId') entityType,
  ) {
    return this.auditPlanService.getEntityname(locId, entityType);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getFunction/:entityTypeId')
  async getFunction(@Param('entityTypeId') entityType, @Req() req) {
    return this.auditPlanService.getFunction(req.user, entityType);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getLocationForAuditPlan/:type')
  async getLocationForAuditPlan(@Param('type') type, @Req() req) {
    return this.auditPlanService.getLocationForAuditPlan(req.user, type);
  }

  @UseGuards(AuthenticationGuard)
  @Get('search')
  async searchAuditPlan(@Query('search') search, @Req() req) {
    return this.auditPlanService.searchAuditPlan(search, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('finalizedDatesAndAuditors/:id/:id1')
  async getfinalizeddatesandauditors(@Param('id') id, @Param('id1') id1) {
    return this.auditPlanService.getFinalizedDatesAndAuditors(id, id1);
  }

  @UseGuards(AuthenticationGuard)
  @Get('isLoggedinUsercreateAuditPlan')
  async isLoggedinUsercreateAuditPlan(@Req() req) {
    return this.auditPlanService.isLoggedinUsercreateAuditPlan(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('isLoggedinUsercreateAuditPlanByAuditTypeId/:id')
  async isLoggedinUsercreateAuditPlanByAuditTypeId(
    @Req() req,
    @Param('id') id,
  ) {
    return this.auditPlanService.isLoggedinUsercreateAuditPlanByAuditTypeId(
      req.user,
      id,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('isLoggedinUsercreateAuditScheduleByAuditTypeId/:id')
  async isLoggedinUsercreateAuditScheduleByAuditTypeId(
    @Req() req,
    @Param('id') id,
  ) {
    return this.auditPlanService.isLoggedinUsercreateAuditScheduleByAuditTypeId(
      req.user,
      id,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityListingForMonthType/:auditPlanId')
  async getEntityListingForMonthType(
    @Param('auditPlanId') auditPlanId,
    @Query() query,
    @Req() req,
  ) {
    return this.auditPlanService.getEntityListingForMonthType(
      auditPlanId,
      query,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityListingForDateRange/:auditPlanId')
  async getEntityListingForDateRange(
    @Param('auditPlanId') auditPlanId,
    @Query() query,
    @Req() req,
  ) {
    return this.auditPlanService.getEntityListingForDateRange(
      auditPlanId,
      query,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDateRangesByAuditPlanId/:auditPlanId')
  async getDateRangesByAuditPlanId(
    @Param('auditPlanId') auditPlanId,
    @Query() query,
    @Req() req,
  ) {
    return this.auditPlanService.getDateRangesByAuditPlanId(auditPlanId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditPeriodForMonthPlanType/:auditPlanId')
  async getAuditPeriodForMonthPlanType(
    @Param('auditPlanId') auditPlanId,
    @Query() query,
    @Req() req,
  ) {
    return this.auditPlanService.getAuditPeriodForMonthPlanType(
      auditPlanId,
      query,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditorsByAuditPlanEntityWiseId/:auditPlanEntityWiseId')
  async getAuditorsByAuditPlanEntityWiseId(
    @Param('auditPlanEntityWiseId') auditPlanEntityWiseId,
    @Query() query,
    @Req() req,
  ) {
    return this.auditPlanService.getAuditorsByAuditPlanEntityWiseId(
      auditPlanEntityWiseId,
      query,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditPlanEntitywiseId/:auditPlanId/:entityId')
  async getAuditPlanEntitywiseId(
    @Param('auditPlanId') auditPlanId,
    @Param('entityId') entityId,
    @Query() query,
    @Req() req,
  ) {
    return this.auditPlanService.getAuditPlanEntitywiseId(
      auditPlanId,
      entityId,
      query,
    );
  }
  //api to get finalized
  @UseGuards(AuthenticationGuard)
  @Get('getFinalizedInfoForInbox')
  async getFinalizedInfoForInbox(@Req() req) {
    return this.auditPlanService.getFinalizedInfoForInbox(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditorsBasedOnSearchFilters')
  async getAuditorsBasedOnSearchFilters(@Req() req, @Query() query) {
    return this.auditPlanService.getAuditorsBasedOnSearchFilters(query);
  }

  //for auditplanunitwise model
  @Post('/addcomment/:auditplanunitwiseId')
  async addComment(
    @Param('auditplanunitwiseId') id: string,
    @Body() commentPayload: { createdBy: string; commentString: string },
  ) {
    return this.auditPlanService.addComment(id, commentPayload);
  }

  //for auditplanunitwise model
  @Get('/comments/:auditplanunitwiseId')
  async getComments(@Param('auditplanunitwiseId') id: string) {
    return this.auditPlanService.getComments(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllFinalizedDatesByMonthName')
  async getAllFinalizedDatesByMonthName(@Query() query) {
    return this.auditPlanService.getAllFinalizedDatesByMonthName(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDetailsForDragAndDrop')
  async getDetailsForDragAndDrop(@Req() req, @Query() data) {
    return this.auditPlanService.getDetailsForDragAndDrop(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDetailsForDragAndDropForAll')
  async getDetailsForDragAndDropForAll(@Req() req, @Query() data) {
    return this.auditPlanService.getDetailsForDragAndDropForAll(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getReportForAudit/:locationId')
  async getReportForAudit(@Req() req, @Query() data) {
    return this.auditPlanService.getReportForAudit(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createAuditPlanFromDragAndDrop')
  async createAuditPlanFromDragAndDrop(@Req() req, @Body() data) {
    return this.auditPlanService.createAuditPlanFromDragAndDrop(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllSystemsData/:locationId')
  async getAllSystemsData(@Req() req, @Param('locationId') locationId) {
    return this.auditPlanService.getAllSystemsData(req.user, locationId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getOptionsForDragAndDrop/:auditType')
  async getOptionsForDragAndDrop(
    @Req() req,
    @Param('auditType') auditType,
    @Query('loc') loc,
  ) {
    return this.auditPlanService.getOptionsForDragAndDrop(
      req.user,
      auditType,
      loc,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditType')
  async getAllAuditType(@Req() req) {
    return this.auditPlanService.getAllAuditType(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('updateDataofDropDown/:status')
  async updateDataofDropDown(
    @Req() req,
    @Body() data,
    @Param('status') status,
  ) {
    return this.auditPlanService.updateDataofDropDown(req.user, data, status);
  }

  @UseGuards(AuthenticationGuard)
  @Post('getAuditeeByEntities')
  async getAuditeeByEntities(@Req() req, @Body() body) {
    return this.auditPlanService.getAuditeeByEntities(body);
  }
}
