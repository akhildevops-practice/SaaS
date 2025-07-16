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
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
  Inject,
  UploadedFiles,
} from '@nestjs/common';
import { MRMService } from './mrm.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import {
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express/multer';
import { Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Logger, query } from 'winston';

const fs = require('fs');

@Controller('/api/mrm')
export class MRMController {
  constructor(
    private readonly MRMService: MRMService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  @Get('/MsCalToken')
  async MsCalToken(@Query() data, @Req() req) {
    return await this.MRMService.createCalendarEvent(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/attachments/mrms',
        filename: (req, file, cb) => {
          // generating a random name for the file
          const randomName: string = uuid();
          // Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('/attachment')
  uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
    @Param('id') id,
  ) {
    //console.log('hello word');
    return this.MRMService.uploadAttachment(files, req.user, id);
  }
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post()
  create(@Body() data: any, @Req() req: any) {
    const newData: any = [];
    data.map((item: any) => {
      item.keyAgendaId = new Types.ObjectId(item.keyAgendaId);
      newData.push(item);
    });
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} Post api/mrm/create for ${data}service called`,
      '',
    );
    return this.MRMService.create(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getMRMByOrgId')
  getMrmByOrgId(
    @Query('orgId', new DefaultValuePipe(0)) orgId: string,
    @Query('unitId', new DefaultValuePipe(0)) unitId: string,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} GET api/mrm/getMRMByOrgId for ${query} service called`,
      '',
    );
    return this.MRMService.getMrmByOrgId(orgId, unitId, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Patch()
  update(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id=${randomNumber} PATCH api/mrm for ${data} service called`,
      '',
    );
    return this.MRMService.update(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getActionPointsforMeetingType/:id')
  async getActionPoints(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getActionPointsforMeetingType`,
      'MRM-Controller',
    );
    return this.MRMService.getActionPointsForMeetingType(id, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteSchedule/:id')
  deleteSchedule(@Param('id') id, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETE /api/mrm/deleteSchedule/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.deleteSchedule(id, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/schedule')
  createSchedule(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/mrm/schedule started`,
      'MRM-Controller',
    );
    return this.MRMService.createSchedule(data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  updateSchedule(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PaTch /api/mrm/:${id} started`,
      'MRM-Controller',
    );
    return this.MRMService.updateSchedule(id, data, req, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getScheduleDetails')
  getKeyAgendaByUnits(
    @Query() query,

    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getScheduleDetails/${query} started`,
      'MRM-Controller',
    );
    return this.MRMService.getMRMValues(query, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getScheduleById/:id')
  getScheduleById(
    @Param() id,

    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getScheduleById/${id} started`,
      'MRM-Controller',
    );
    return this.MRMService.getScheduleById(id, req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/addActionPoint')
  createActionPoint(@Body() data: any, @Req() req: any) {
    let newData: any = { ...data };

    newData.mrmId = new Types.ObjectId(newData.mrmId);

    return this.MRMService.createActionPoint(newData);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/actionpoint/:id')
  updateActionPoint(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.MRMService.updateActionPoint(id, data);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/sendInvite/:id')
  sendInviteForMRM(@Param('id') id, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/mrm/sendInvite/${id} started`,
      'MRM-Controller',
    );
    return this.MRMService.sendInviteForMRM(id, req.user);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post('/sendAgendOwnerMail/:id')
  sendAgendOwnerMai(@Param('id') id, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/mrm/sendAgendOwnerMail/${id} started`,
      'MRM-Controller',
    );
    return this.MRMService.sendAgendOwnerMail(id, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/sendParticipantMail/:id')
  sendParticipantMail(@Param('id') id, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/mrm/sendParticipantMail/${id} started`,
      'MRM-Controller',
    );
    return this.MRMService.sendParticipantMail(id, req.user, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Post('objectStore/:id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req?.query?.realm?.toLowerCase();
          const locationName = req?.query?.locationName?.toLowerCase();

          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          // generating a random name for the file
          const randomName: string = uuid();
          // calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  objectStore(@UploadedFiles() files, @Req() req: any, @Param('id') id) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/mrm/attachment/action-point`,
      'mrm.controller.ts',
    );
    return this.MRMService.addDocumentToOS(files, req.user, randomName, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllActionPoint')
  async getAllActionPoint(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}GET api/mrm/getAllActionPoint/${query.id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAllActionPoints(query, uuid);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getMrmMeetingDetails/:id')
  getMrmMeetingDetails(@Param('id') id: string, @Req() req: any) {
    let objectId = new Types.ObjectId(id);
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getMrmMeetingDetails/${id} started`,
      'MRM-Controller',
    );
    return this.MRMService.getMrmMeetingDetails(objectId, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Post('attachment/delete')
  deleteFile(@Body('path') path: any) {
    return this.MRMService.deleteAttachment(path);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getOwnScheduleDetails')
  getOwnScheduleDetails(
    @Query('orgId', new DefaultValuePipe(0)) orgId: string,
    @Query('userId', new DefaultValuePipe(0)) userId: any,
    @Req() req: any,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getOwnScheduleDetails/${query} started`,
      'MRM-Controller',
    );
    return this.MRMService.getOwnMRMValues(orgId, userId, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/search')
  searchSchedule(@Query() query, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/search/${query} started`,
      'MRM-Controller',
    );
    return this.MRMService.searchSchedule(query, req.user, randomNumber);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/searchActionPoint')
  searchActionPoint(@Query() query, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/searchActionPoint`,
      'MRM-Controller',
    );
    return this.MRMService.searchActionPoint(query, req.user, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createAgenda')
  async createAgenda(@Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} POST /api/mrm/createAgend`,
      'MRM-Controller',
    );
    return this.MRMService.createAgenda(data, req, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAgendaById/:id')
  async getAgendaById(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAgendaById/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAgendaById(id, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deleteAgendaById/:id')
  async deleteAgendaById(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELETe /api/mrm/deleteAgendaById/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.deleteAgenda(id, req, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateAgenda/:id')
  async updateAgenda(@Param('id') id, @Body() data: any, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} PATCH /api/mrm/updateAgenda`,
      'MRM-Controller',
    );
    return this.MRMService.updateAgenda(id, data, req, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAgendaByMeetingType/:id')
  async getAgendaByMeetingType(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAgendaByMeetingType/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAllAgendaForMeetingType(
      id,
      randomNumber,
      req.user.id,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllAgendOwnersByMeetingType/:id')
  async getAllAgendasOwners(@Param('id') id, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAllAgendaOwnersByMeetingType/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAllAgendaOwnersForMeetingType(id, uuid, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllAgendOwnersIdByMeetingType/:id')
  async getAllAgendasOwnersIds(@Param('id') id, @Req() req: any) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAllAgendaOwnersIdsByMeetingType/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAllAgendaOwnersIdForMeetingType(
      id,
      uuid,
      req.user,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAgendaForOwner/:id')
  async getAgendaForOwner(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAgendaforowner/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAgendaForOwner(id, req.user.id, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAgendaDecisionForOwner/:id1/:id2')
  async getAgendaDecisionForOwner(
    @Param('id1') id1,
    @Param('id2') id2,
    @Req() req,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAgendaDecisionforowner/${id1}/${id2}`,
      'MRM-Controller',
    );
    return this.MRMService.getAgendaDecisionForOwner(
      id1,
      id2,
      req.user.id,
      uuid,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getUniqueActionPoints')
  async getUniqueActionPoints(@Query() query) {
    this.logger.log(
      `GET trace id=${uuid}GET /api/mrm/getUniqueActionPoints/${query} started`,
      '',
    );
    return this.MRMService.uniqueActionPoint(query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('handleMailForActionItems/:id')
  async handleMailForActionItems(@Param('id') id, @Req() req) {
    this.logger.log(
      `GET trace id=${uuid}GET /api/mrm/handleMailForActionItems/${id} started`,
      '',
    );
    return this.MRMService.handleMailForActionItems(id, req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('createMeeting')
  async createMeeting(@Body() data: any, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}POST api/mrm/createMeeting`,
      'MRM-Controller',
    );
    return this.MRMService.createMeeting(data, req, uuid);
  }
  @UseGuards(AuthenticationGuard)
  @Patch('updateMeeting/:id')
  async updateMeeting(@Body() data: any, @Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}POST api/mrm/createMeeting`,
      'MRM-Controller',
    );
    return this.MRMService.updateMeeting(data, id, req, uuid);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getMeetingById/:id')
  async getMeeting(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}GET api/mrm/getMeetingbyid/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getMeetingById(id, uuid, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getMeetingByIdForActionItem/:id')
  async getMeetingByIdForActionItem(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}GET api/mrm/getMeetingbyidForActionItem/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.getMeetingByIdForActionItem(id, uuid, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllMeetingByScheduleId')
  async getAllMeeting(@Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}GET api/mrm/getAllMeetingbyscheduleid/${query.id}`,
      'MRM-Controller',
    );
    return this.MRMService.getAllMeetingByScheduleId(query, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllMeeting')
  async getAllMeetings(@Query() query, @Req() req) {
    const randomNumber = uuid();
    // console.log('inside controler');
    this.logger.log(
      `trace id = ${randomNumber}GET api/mrm/getAllMeetings`,
      'MRM-Controller',
    );
    return this.MRMService.getAllMeetings(query, uuid, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteMeeting/:id')
  async deleteMeeting(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}DELETE api/mrm/deleteMeeting/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.deleteMeeting(id, req, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteActionPoint/:id')
  async deleteActionPoint(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber}DELETE api/mrm/deleteActionPoint/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.deleteActionPointById(id, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteActionPointId/:id')
  async deleteActionPointById(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} DELET /api/mrm/deleteActionPointById/${id}`,
      'MRM-Controller',
    );
    return this.MRMService.deleteAgenda(id, req, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getPeriodForMeetingType/:id')
  getPeriodForMeetingType(@Param('id') id) {
    return this.MRMService.getPeriodForMeetingType(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/myMeetings')
  async getMyMeetings(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getMyMeetings`,
      'MRM-Controller',
    );
    return this.MRMService.getMyMeetings(query, req.user, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/participantMeetings')
  async getParticipantMeetings(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getParticipantMeetings`,
      'MRM-Controller',
    );
    return this.MRMService.getParticipantMeetings(query, req.user, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/agendaOwnerMeetings')
  async getAgendaOwnerMeetings(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getAgendaOwnerMeetings`,
      'MRM-Controller',
    );
    return this.MRMService.getAgendaOwnerMeetings(query, req.user, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/myActionPoints')
  async getMyActionPoints(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getMyActionPoints`,
      'MRM-Controller',
    );
    return this.MRMService.getMyActionPoints(query, req.user.id, uuid);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/searchMeetings')
  async searchMeetings(@Query() query, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/searchMeetings`,
      'MRM-Controller',
    );
    return this.MRMService.searchMeetings(query, req.user, uuid);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getPendingActionPointsforMeetingType/:id')
  async getPendingActionPoints(@Param('id') id, @Req() req) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getPendingActionPointsforMeetingType`,
      'MRM-Controller',
    );
    return this.MRMService.getPendingActionPointsForMeetingType(id, uuid);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getOwnerForSchedule/:id/:unitId')
  async getOwnerForSchedule(
    @Param('id') id,
    @Req() req,
    @Param('unitId') unitId,
  ) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getOwnerForSchedule`,
      'MRM-Controller',
    );
    return this.MRMService.getOwnerForSchedule(id, uuid, req.user, unitId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getColumnFilterListForSchedule')
  async getColumnFilterList(@Req() req, @Query() query) {
    // console.log('inside controller');
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForSchedule`,
      'MRM-Controller',
    );
    return this.MRMService.getColumnFilterList(req.user, randomNumber, query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getColumnFilterListForMeeting')
  async getMomColumnFilterList(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForMeeting`,
      'MRM-Controller',
    );
    return this.MRMService.getMomColumnFilterList(
      req.user,
      query,
      randomNumber,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getUsersForLocations')
  async getUsersForLocations(@Req() req, @Query() query) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET /api/mrm/getUsersForLocations`,
      'MRM-Controller',
    );
    return this.MRMService.getUsersForLocations(req.user, query, randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'LOCATION_MASTER' })
  @Get('/getLocationsForOrg/:realmName')
  async getLocationsForOrg(@Param('realmName') realmName, @Req() req) {
    return this.MRMService.getLocationforOrg(realmName, req.user);
  }
}
