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
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
import { NPDService } from './npd.service';

const fs = require('fs');

@Controller('/api/npd')
export class NPDController {
  constructor(private readonly NPDService: NPDService) {}

  @UseGuards(AuthenticationGuard)
  @Post('createGanttChart')
  createGanttChart(@Body() data, @Req() req) {
    return this.NPDService.createGanttChart(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdGanttChart/:id')
  getByIdGanttChart(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdGanttChart(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByNpdAndCategoryAndDeptGanttChart/:npdId/:categoryId/:deptId')
  getByNpdAndCategoryAndDeptGanttChart(
    @Req() req,
    @Param('npdId') npdId,
    @Param('categoryId') categoryId,
    @Param('deptId') deptId,
  ) {
    return this.NPDService.getByNpdAndCategoryAndDeptGanttChart(
      req.user,
      npdId,
      categoryId,
      deptId,
    );
  }

  /******* Risk Items  ********/

  @UseGuards(AuthenticationGuard)
  @Post('createRiskPrediction')
  createRiskPrediction(@Body() data, @Req() req) {
    return this.NPDService.createRiskPrediction(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createManyGanttChart')
  createManyGanttChart(@Body() data, @Req() req) {
    return this.NPDService.createManyGanttChart(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Post()
  createNPD(@Body() data, @Req() req) {
    return this.NPDService.createNPD(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailOnRegister/:id')
  mailNPD(@Param('id') id, @Req() req) {
    return this.NPDService.sendMailOnRegister(id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailOnFreeze/:id/:id1')
  mailonFreeze(@Param('id') id, @Param() id1) {
    return this.NPDService.sendMailOnFreeze(id, id1);
  }

  @UseGuards(AuthenticationGuard)
  @Post('sendMailOnInformToPic/:id')
  mailOnInformToPic(@Param('id') id, @Req() req) {
    return this.NPDService.sendMailOnInformToPic(id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('sendMailForDelayedItems')
  sendMailForDelayedItems() {
    return this.NPDService.sendMailForDelayedItems();
  }

  @UseGuards(AuthenticationGuard)
  @Post('duplicateProjectName')
  duplicateProjectName(@Body() data, @Req() req) {
    return this.NPDService.duplicateProjectName(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNPDList')
  getAllNPDList(@Req() req) {
    return this.NPDService.getAllNPDList(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNPDDptList')
  getAllNPDDptList(@Req() req) {
    return this.NPDService.getAllNPDDptList(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getNPDDptList/:id')
  getNPDDptList(@Req() req, @Param('id') id) {
    return this.NPDService.getNPDDptList(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getMileStoneNpdGantt/:id')
  getMileStoneNpdGantt(@Req() req, @Param('id') id) {
    return this.NPDService.getMileStoneNpdGantt(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateGanttChart/:id')
  updateGanttChart(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateGanttChart(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('updateManyGanttChart/:dptId/:picId')
  updateDataGanttCharts(@Param() data, @Req() req) {
    return this.NPDService.updateManyGanttCharts(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('checkEvidenceValidation/:npdId/:id/:objId/:taskId')
  checkEvidenceValidation(
    @Param() data,
    @Req() req,
    @Param('npdId') npdId,
    @Param('id') id,
    @Param('objId') objId,
    @Param('taskId') taskId,
  ) {
    return this.NPDService.checkEvidenceValidation(
      req.user,
      npdId,
      id,
      objId,
      taskId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('updateManyGanttChartsFreeze/:npdId')
  updateManyGanttChartsFreeze(@Param() data, @Req() req) {
    return this.NPDService.updateManyGanttChartsFreeze(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('freezeButtonStatus/:npdId')
  freezeButtonStatus(@Param() data, @Req() req) {
    return this.NPDService.freezeButtonStatus(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('infoToPicButtonStatus/:npdId')
  informToPicButtonStatus(@Param() data, @Req() req) {
    return this.NPDService.informToPicButtonStatus(req.user, data);
  }
  @UseGuards(AuthenticationGuard)
  @Get('updateManyGanttChartsInformToPic/:npdId')
  updateManyGanttChartsInformToPic(@Param() data, @Req() req) {
    return this.NPDService.updateManyGanttChartsInformToPic(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('updateManyGanttChartsDrop')
  updateManyGanttChartsDrop(@Req() req, @Body() data) {
    return this.NPDService.updateManyGanttChartsDrop(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/:id')
  updateNPD(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateNPD(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('npdStatus/:id')
  updateNPDStatus(@Body() data, @Param('id') id) {
    return this.NPDService.updateNPDStatus(data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateGanttChartTask/:id')
  updateGanttChartTask(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateGanttChartTask(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateSingleGanttTask/:id')
  updateSingleGanttTask(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateSingleGanttTask(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllGanttChart')
  getAllGanttChart(@Req() req) {
    return this.NPDService.getAllGanttChart(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNPD')
  getAllNPD(@Req() req, @Query() filter) {
    return this.NPDService.getAllNPD(req.user, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteGanttChart/:id')
  deleteGanttChart(@Req() req, @Param('id') id) {
    return this.NPDService.deleteGanttChart(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteNPD/:id')
  deleteNPD(@Req() req, @Param('id') id) {
    return this.NPDService.deleteNPD(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdNPDID/:id')
  getByIdNPDID(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.getByIdNPDID(req.user, id, filter);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getNPDByIdForSvar/:id')
  getNPDByIdForSvar(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.getNPDbyIdForSvar(req.user, id, filter);
  }
  @UseGuards(AuthenticationGuard)
  @Post('addTaskForSvar/:id')
  addTaskForSvar(@Req() req, @Param('id') id, @Body() data) {
    return this.NPDService.addTaskForSvar(req.user?.id, id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Put('updateTaskForSvar/:id')
  updateTaskForSvar(@Req() req, @Param('id') id, @Body() data) {
    return this.NPDService.updateTaskForSvar(req.user?.id, id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getTaskForSvar/:id')
  getTaskForSvar(@Req() req, @Param('id') id) {
    return this.NPDService.getTaskForSvar(req.user?.id, id);
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deleteTaskForSvar/:id')
  deleteTaskForSvar(@Req() req, @Param('id') id) {
    return this.NPDService.deleteTaskForSvar(req.user?.id, id);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('moveTaskForSvar/:id')
  moveTaskForSvar(@Req() req, @Param('id') id, @Query() query) {
    return this.NPDService.moveTaskForSvar(req.user?.id, id, query);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateDatesForTask/:id')
  updateDatesForTask(@Req() req, @Param('id') id, @Query() query) {
    return this.NPDService.updateDatesForSvarTask(req.user?.id, id, query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getDataByIdNpdGantt/:id')
  getDataByIdNpdGantt(@Req() req, @Param('id') id) {
    return this.NPDService.getDataByIdNpdGantt(req.user, id);
  }

  // @UseGuards(AuthenticationGuard)
  // @Get('findByUsersId/:id')
  // findByUsersId(@Req() req, @Param('id') id) {
  //   return this.NPDService.findByUsersId(req.user, id);
  // }

  /******* MinutesOfMeeting ********/

  @UseGuards(AuthenticationGuard)
  @Post('createMinutesOfMeeting')
  createMinutesOfMeeting(@Body() data, @Req() req) {
    return this.NPDService.createMinutesOfMeeting(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateMinutesOfMeeting/:id')
  updateMinutesOfMeeting(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateMinutesOfMeeting(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteMinutesOfMeeting/:id')
  deleteMinutesOfMeeting(@Req() req, @Param('id') id) {
    return this.NPDService.deleteMinutesOfMeeting(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdMinutesOfMeeting/:id')
  getByIdMinutesOfMeeting(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdMinutesOfMeeting(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllMinutesOfMeeting')
  getAllMinutesOfMeeting(@Req() req, @Query() filter) {
    return this.NPDService.getAllMinutesOfMeeting(req.user, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDiscussedAndDelayedItemsByNpdId/:id')
  getAllDiscussedAndDelayedItemsByNpdId(
    @Req() req,
    @Param('id') id,
    @Query() filter,
  ) {
    return this.NPDService.getAllDiscussedAndDelayedItemsByNpdId(
      req.user,
      id,
      filter,
    );
  }

  /******* Discussion Item ********/

  @UseGuards(AuthenticationGuard)
  @Post('createDiscussionItems')
  createDiscussionItems(@Body() data, @Req() req) {
    return this.NPDService.createDiscussionItems(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateDiscussionItems/:id')
  updateDiscussionItems(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateDiscussionItems(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteDiscussionItems/:id')
  deleteDiscussionItems(@Req() req, @Param('id') id) {
    return this.NPDService.deleteDiscussionItems(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdDiscussionItems/:id')
  getByIdDiscussionItems(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdDiscussionItems(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDiscussionItems')
  getAllDiscussionItems(@Req() req, @Query() filter) {
    return this.NPDService.getAllDiscussionItems(req.user, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllMomIdItems/:id/:npdId')
  getAllMomIdItems(
    @Req() req,
    @Param('id') id,
    @Param('npdId') npdId,
    @Query() filter,
  ) {
    return this.NPDService.getAllMomIdItems(req.user, id, npdId, filter);
  }

  /******* Action Plans ********/

  @UseGuards(AuthenticationGuard)
  @Post('createActionPlans')
  createActionPlans(@Body() data, @Req() req) {
    return this.NPDService.createActionPlans(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateActionPlans/:id')
  updateActionPlans(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateActionPlans(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteActionPlans/:id')
  deleteActionPlans(@Req() req, @Param('id') id) {
    return this.NPDService.deleteActionPlans(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdActionPlans/:id')
  getByIdActionPlans(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdActionPlans(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllActionPlans')
  getAllActionPlans(@Req() req, @Query() filter) {
    return this.NPDService.getAllActionPlans(req.user, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDiscussionIdItems/:id')
  getAllDiscussionIdItems(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.getAllDiscussionIdItems(req.user, id, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDelayedIdItems/:id')
  getAllDelayedIdItems(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.getAllDelayedIdItems(req.user, id, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllActionPointsByNpd/:id')
  getAllActionPointsByNpd(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.getAllActionPointsByNpd(req.user, id, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('filterListActionPointsByNpd/:id')
  filterListActionPointsByNpd(@Req() req, @Param('id') id) {
    return this.NPDService.filterListActionPointsByNpd(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('filterListActionPointsAll')
  filterListActionPointsAll(@Req() req) {
    return this.NPDService.filterListActionPointsAll(req.user);
  }

  /******* Delayed Items ********/

  @UseGuards(AuthenticationGuard)
  @Get('getAllDelayedItems/:id/:momId')
  getAllDelayedItems(
    @Req() req,
    @Param('id') id,
    @Param('momId') momId,
    @Query() filter,
  ) {
    return this.NPDService.getAllDelayedItems(req.user, id, momId, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateDelayedItem/:id')
  updateDelayedItem(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateDelayedItem(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteDelayedItem/:id')
  deleteDelayedItem(@Req() req, @Param('id') id) {
    return this.NPDService.deleteDelayedItem(req.user, id);
  }

  /******* Delayed Items Action Plans  ********/

  @UseGuards(AuthenticationGuard)
  @Post('createDelayedActionPlans')
  createDelayedActionPlans(@Body() data, @Req() req) {
    return this.NPDService.createDelayedActionPlans(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateDelayedActionPlans/:id')
  updateDelayedActionPlans(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateDelayedActionPlans(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteDelayedActionPlans/:id')
  deleteDelayedActionPlans(@Req() req, @Param('id') id) {
    return this.NPDService.deleteDelayedActionPlans(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdDelayedActionPlans/:id')
  getByIdDelayedActionPlans(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdDelayedActionPlans(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDelayedActionPlans')
  getAllDelayedActionPlans(@Req() req, @Query() filter) {
    return this.NPDService.getAllDelayedActionPlans(req.user, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllActionPlansByDelayedIdItems/:id')
  getAllActionPlansByDelayedIdItems(@Req() req, @Param('id') id) {
    return this.NPDService.getAllActionPlansByDelayedIdItems(req.user, id);
  }

  /******* Risk Items  ********/

  @UseGuards(AuthenticationGuard)
  @Put('updateRiskPrediction/:id')
  updateRiskPrediction(@Body() data, @Req() req, @Param('id') id) {
    return this.NPDService.updateRiskPrediction(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('findByParentIdAndUpdate/:id')
  findByParentIdAndUpdate(@Req() req, @Param('id') id) {
    return this.NPDService.findByParentIdAndUpdate(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteRiskPrediction/:id')
  deleteRiskPrediction(@Req() req, @Param('id') id) {
    return this.NPDService.deleteRiskPrediction(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdRiskPrediction/:id')
  getByIdRiskPrediction(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdRiskPrediction(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getByIdRiskPredictionHistory/:id')
  getByIdRiskPredictionHistory(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.getByIdRiskPredictionHistory(req.user, id, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllRiskPrediction')
  getAllRiskPrediction(@Req() req, @Query() filter) {
    return this.NPDService.getAllRiskPrediction(req.user, filter);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllOpenItemByNpdId/:id/:momId')
  getAllOpenItemByNpdId(@Req() req, @Param('id') id, @Param('momId') momId) {
    return this.NPDService.getAllOpenItemByNpdId(req.user, id, momId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllOpenDelayedItemByNpdId/:id/:momId')
  getAllOpenDelayedItemByNpdId(
    @Req() req,
    @Param('id') id,
    @Param('momId') momId,
  ) {
    return this.NPDService.getAllOpenDelayedItemByNpdId(req.user, id, momId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getNpdIdDataRadiusChartData/:id')
  getNpdIdDataRadarChartData(@Req() req, @Param('id') id) {
    return this.NPDService.getNpdIdDataRadarChartData(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('dashBoardData/:id')
  dashBoardData(@Req() req, @Param('id') id, @Query() filter) {
    return this.NPDService.dashBoardData(req.user, id, filter);
  }

  /******* Risk Items Action Plans  ********/

  // @UseGuards(AuthenticationGuard)
  // @Post('createRiskPredictionActionPlans')
  // createRiskPredictionActionPlans(@Body() data, @Req() req) {
  //   return this.NPDService.createRiskPredictionActionPlans(req.user, data);
  // }

  // @UseGuards(AuthenticationGuard)
  // @Put('updateRiskPredictionActionPlans/:id')
  // updateRiskPredictionActionPlans(@Body() data, @Req() req, @Param('id') id) {
  //   return this.NPDService.updateRiskPredictionActionPlans(req.user, data, id);
  // }

  // @UseGuards(AuthenticationGuard)
  // @Delete('deleteRiskPredictionActionPlans/:id')
  // deleteRiskPredictionActionPlans(@Req() req, @Param('id') id) {
  //   return this.NPDService.deleteRiskPredictionActionPlans(req.user, id);
  // }

  // @UseGuards(AuthenticationGuard)
  // @Get('getByIdRiskPredictionActionPlans/:id')
  // getByIdRiskPredictionActionPlans(@Req() req, @Param('id') id) {
  //   return this.NPDService.getByIdRiskPredictionActionPlans(req.user, id);
  // }

  // @UseGuards(AuthenticationGuard)
  // @Get('getAllRiskPredictionActionPlans')
  // getAllRiskPredictionActionPlans(@Req() req, @Query() filter) {
  //   return this.NPDService.getAllRiskPredictionActionPlans(req.user, filter);
  // }

  // @UseGuards(AuthenticationGuard)
  // @Get('getAllActionPlansByRiskPredictionIdItems/:id')
  // getAllActionPlansByRiskPredictionIdItems(@Req() req, @Param('id') id) {
  //   return this.NPDService.getAllActionPlansByRiskPredictionIdItems(
  //     req.user,
  //     id,
  //   );
  // }

  @UseGuards(AuthenticationGuard)
  @Get('/:id')
  getByIdNPD(@Req() req, @Param('id') id) {
    return this.NPDService.getByIdNPD(req.user, id);
  }
}
