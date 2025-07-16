import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Inject,
  // Res,
} from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express/multer';
import { RiskRegisterService } from './risk-register.service';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { Logger } from 'winston';
import { extname } from 'path';
import { CreateHiraDto } from './dto/create-hira.dto';
import { CreateHiraStepsDto } from './dto/create-hiraStep.dto';
import { UpdateHiraDto } from './dto/update-hira.dto';
const fs = require('fs');

@Controller('/api/riskregister')
export class RiskRegisterController {
  constructor(
    private readonly riskRegisterService: RiskRegisterService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @UseGuards(AuthenticationGuard)
  @Post('/hira-register/uploadattachement')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          let locationName;
          const realmName = req.query.realm.toLowerCase();
          if (req.query.locationName) {
            locationName = req.query.locationName;
          } else {
            locationName = 'NoLocation';
          }
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/riskAttachments`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName: string = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // You can implement a file filter logic here if needed
        // For example, to reject certain file types
        cb(null, true);
      },
    }),
  )
  addAttachMentForAudit(
    @UploadedFiles() file: Express.Multer.File[],
    @Req() req,
  ) {
    return this.riskRegisterService.uploadsAttachment(file, req.query);
  }


  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('/import')
  async importUser(@UploadedFile() file, @Req() req, @Body() body: any) {
    console.log('file', file);
    return await this.riskRegisterService.import(file, req.user.id, body);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/getuserlist')
  getAllUser(@Query() query: any, @Req() req) {
    return this.riskRegisterService.getAllUser(query, req.user.id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Patch('/updatereviewers/:riskId')
  UpdateReviewersAndSendMail(
    @Param('riskId') riskId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    // ////////////////console.log('in find one risk controller');
    return this.riskRegisterService.updateReviewers(riskId, data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/users/:orgId')
  getAllUsersByLocation(@Param('orgId') orgId: string) {
    // ////////console.log('in find one risk controller');
    return this.riskRegisterService.findAllUsersByLocation(orgId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllDepartmentsByLocation/:locationId')
  getAllDepartmentsByLocation(@Param('locationId') locationId: string) {
    // //////////////console.log('in delete risk controller');
    return this.riskRegisterService.getAllDepartmentsByLocation(locationId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllLocation/:orgId')
  getAllLocations(@Param('orgId') orgId: string) {
    // //////////////console.log('in delete risk controller');
    return this.riskRegisterService.getAllLocations(orgId);
  }


  @UseGuards(AuthenticationGuard)
  @Get('/getHiraForInbox')
  getHiraForInbox(@Req() req: any) {
    const randomNumber: string = uuid();
    this.logger.log(
      `trace id=${randomNumber}, GET /api/riskconfig/getHiraForInbox`,
      'riskconfig.controller',
    );
    return this.riskRegisterService.getHiraForInbox(req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checkIfUserIsMultiDeptHead')
  checkIfUserIsMultiDeptHead(@Req() req: any, @Query() query) {
    return this.riskRegisterService.checkIfUserIsMultiDeptHead(query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/hira/createHiraWithMultipleSteps')
  createHiraWithMultipleSteps(@Body() body: {
    hira: any;
    steps: any;
  }, @Req() req: any) {
    return this.riskRegisterService.createHiraWithMultipleSteps(body, req);
  }


  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Post('/risk/createRiskWithMultipleSteps')
  createRiskWithMultipleSteps(@Body() body: {
    risk: any;
    steps: any;
  }, @Req() req: any) {
    return this.riskRegisterService.createRiskWithMultipleSteps(body, req);
  }


  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/startReviewFirstVersion/:hiraId')
  startReviewFirstVersion(
    @Body() body: any,
    @Param('hiraId') hiraId: any,
    @Req() req: any,
  ) {
    return this.riskRegisterService.startReviewFirstVersion(body, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/startHiraReviewOfRejectedHira/:hiraId')
  startHiraReviewOfRejectedHira(
    @Body() body: any,
    @Param('hiraId') hiraId: any,
    @Req() req: any,
  ) {
    return this.riskRegisterService.startHiraReviewOfRejectedHira(body, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/updateWorkflowStatus/:hiraId')
  updateWorkflowStatus(
    @Body() body: any,
    @Param('hiraId') hiraId: any,
    @Req() req: any,
  ) {
    return this.riskRegisterService.updateWorkflowStatus(body, hiraId);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraWithSteps/:hiraId')
  viewHiraWithSteps(@Param('hiraId') hiraId: string, @Query() query: any) {
    return this.riskRegisterService.viewHiraWithStepsOld(hiraId, query);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/risk/getRiskWithSteps/:riskId')
  viewRiskWithSteps(@Param('riskId') riskId: string, @Query() query: any) {
    return this.riskRegisterService.viewRiskWithSteps(riskId, query);
  }

  // @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraWithStepsWithoutToken/:hiraId')
  getHiraWithStepsWithoutToken(
    @Param('hiraId') hiraId: string,
    @Query() query: any,    
  ) {
    return this.riskRegisterService.viewHiraWithStepsOld(hiraId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/risk/getArchivedRiskWithSteps/:archivedRiskId')
  getArchivedRiskWithSteps(
    @Param('archivedRiskId') archivedRiskId: string,
    @Query() query: any,
  ) {
    return this.riskRegisterService.getArchivedRiskWithSteps(
      archivedRiskId,
      query,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira/getHiraList/:orgId')
  getHiraList(@Param('orgId') orgId: string, @Query() query: any) {
    return this.riskRegisterService.getHiraList(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/updateHira/:hiraId')
  updateHira(
    @Body() body: UpdateHiraDto,
    @Req() req: any,
    @Param('hiraId') hiraId: string,
  ) {
    return this.riskRegisterService.updateHira(body, req, hiraId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/risk/addRiskStepToRisk/:riskId')
  addRiskStepToRisk(
    @Body() body: any,
    @Req() req: any,
    @Param('riskId') riskId: string,
  ) {
    return this.riskRegisterService.addRiskStepToRisk(body, req, riskId);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/risk/updateRiskStep/:stepId')
  updateRiskStep(
    @Body() body : any,
    @Req() req: any,
    @Param('stepId') stepId: string,
  ) {
    return this.riskRegisterService.updateHiraStep(body, req, stepId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete('/risk/riskStep/:riskId/:stepId')
  deleteRiskStep(
    @Param('riskId') riskId: string,
    @Param('stepId') stepId: string,
  ) {
    return this.riskRegisterService.deleteRiskStep(riskId, stepId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/risk/updateRiskHeader/:riskId')
  updateRiskHeader(
    @Body() body: UpdateHiraDto,
    @Req() req: any,
    @Param('riskId') riskId: string,
  ) {
    return this.riskRegisterService.updateRiskHeader(body, req, riskId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'RISK_REGISTER' })
  @Delete('/hira/deleteHira/:hiraId')
  deleteHira(@Param('hiraId') hiraId: string, @Query() query: any) {
    console.log('in delete risk controller');
    return this.riskRegisterService.deleteHira(hiraId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getStepsCountByHazardType/:orgId')
  getStepsCountByHazardType(
    @Param('orgId') orgId: string,
    @Query() query: any,
  ) {
    return this.riskRegisterService.getStepsCountByHazardType(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraCountByCondition/:orgId')
  getHiraCountByCondition(@Param('orgId') orgId: string, @Query() query: any) {
    return this.riskRegisterService.getHiraCountByCondition(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira/getStepsCountByScore/:orgId')
  getStepsCountByScore(@Param('orgId') orgId: string, @Query() query) {
    return this.riskRegisterService.getStepsCountByScore(orgId, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/hira/getTopTenHiraByScore/:orgId')
  getTopTenHiraByScore(@Param('orgId') orgId: string, @Query() query) {
    return this.riskRegisterService.getTopTenHiraByScore(orgId, query);
  }


  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira/fetchHiraDashboardBoardCounts/:orgId')
  fetchHiraDashboardBoardCounts(
    @Param('orgId') orgId: any,
    @Query() query: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchHiraDashboardBoardCounts(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira/getHiraWithStepsWithFilters/:orgId')
  getHiraWithStepsWithFilters(@Param('orgId') orgId: any, @Query() query: any) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.getHiraWithStepsWithFilters(orgId, query);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'RISK_REGISTER' })
  @Get('/hira/fetchHiraCountsByEntityAndSection/:orgId')
  fetchHiraCountsByEntityAndSection(
    @Param('orgId') orgId: any,
    @Query() query: any,
  ) {
    //////console.log('in find all risk controller');
    return this.riskRegisterService.fetchHiraCountsByEntityAndSection(
      orgId,
      query,
    );
  }


  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/changeReviewerApprover/:hiraId')
  changeReviewersApprovers(@Body() body: any, @Param('hiraId') hiraId: string) {
    return this.riskRegisterService.changeReviewersApprovers(body, hiraId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'RISK_REGISTER' })
  @Put('/hira/changeApprover/:hiraId')
  changeApprovers(@Body() body: any, @Param('hiraId') hiraId: string) {
    return this.riskRegisterService.changeApprovers(body, hiraId);
  }
}
