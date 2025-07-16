import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Put,
} from '@nestjs/common';
import { AbilityGuard } from 'src/ability/ability.guard';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { CreateNcDto } from './dto/create-nc.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { UpdateNcDto } from './dto/update-nc.dto';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { CreateAuditorRating } from './dto/create-auditor-rating.dto';
import { Cron } from '@nestjs/schedule';
import { parseTwoDigitYear } from 'moment';
import FormData from 'form-data';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

const fs = require('fs');

@Controller('api/audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Cron('59 23 * * *')
  startcron() {
    return this.auditService.startCron();
  }

  @Get('/MsCalToken')
  async MsCalToken(@Query() data) {
    return await this.auditService.createCalendarEvent(data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/nc/getFilterList')
  getFilterList(@Req() req, @Query() data) {
    //console.log('allower');
    return this.auditService.getFilterList(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/ncAutoAccept')
  ncAutoAccept() {
    return this.auditService.ncAutoAccept();
  }

  @UseGuards(AuthenticationGuard)
  @Get('getNcDataByAuditId')
  getNcDataByAuditId(@Req() req, @Query() data) {
    return this.auditService.getNcDataByAuditId(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNcStatusByAuditId/:id')
  getAllNcStatusByAuditId(@Req() req, @Param('id') id) {
    return this.auditService.getAllNcStatusByAuditId(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/sendEscalationMail')
  sendEscalationMail() {
    return this.auditService.sendEscalationMAil();
  }
  @UseGuards(AuthenticationGuard)
  @Get('/sendReminderMail')
  sendReminderMail() {
    return this.auditService.sendReminderMail();
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNcAp')
  async getAllNcAp(@Req() req) {
    ////////////////console.log('allncap');
    return this.auditService.getAllNcActionPoints(req.user.id);
  }

  @Get('uid')
  getUid() {
    return this.auditService.getNcUniqueId();
  }

  /**
   * @method create
   * This controller creates a new audit.
   * @param createAuditDto
   * @param req
   * @returns created audit
   */
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: "AUDIT_ENTRY" })
  @Post()
  create(@Body() createAuditDto, @Req() req) {
    return this.auditService.create(createAuditDto, req.user, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('ValidateAuditIsUnique')
  ValidateAuditIsUnique(@Req() req, @Query() data) {
    return this.auditService.ValidateAuditIsUnique(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditType')
  getAllAuditType(@Req() req) {
    return this.auditService.getAllAuditType(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllLocationForSeletedFunction')
  GetAllLocationForSeletedFunction(@Req() req, @Query() data) {
    return this.auditService.getAllLocationForSeletedFunction(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllFunction')
  getAllFunction(@Req() req) {
    return this.auditService.getAllFunction(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllBusinessType')
  getAllBusinessType(@Req() req) {
    return this.auditService.getAllBusinessType(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllBusiness')
  getAllBusiness(@Req() req) {
    return this.auditService.getAllBusiness(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllEntityForLocation')
  getAllEntityForLocation(@Req() req, @Query() data) {
    return this.auditService.getAllEntityForLocation(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('addAttachMentForAudit')
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
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/audit`;
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
    return this.auditService.uploadsAttachment(file, req.query);
  }
  /**
   * @method findAll
   * This controller fetches all audit templates
   * @param req user request
   * @returns Array of audits
   */

  @UseGuards(AuthenticationGuard)
  @Get('/chartData')
  async chartData(@Query() query, @Req() req) {
    return this.auditService.chartData(query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/tableNcData')
  async tableNcData(@Query() query, @Req() req) {
    return this.auditService.tableNcData(query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/myAudit')
  myAudit(
    @Req() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditService.myAudit({ limit, skip }, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: "AUDIT_ENTRY" })
  @Get()
  findAll(@Req() req) {
    return this.auditService.findAll(req.user.id);
  }

  /**
   * @method findAllCalendarView
   * This controller fetches all audit templates for calender view
   * @param req Request object
   * @returns array of audits
   */
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'AUDIT_ENTRY' })
  @Get('/calendar')
  findAllCalendarView(@Req() req) {
    return this.auditService.findAllCalendarView(req.user.id);
  }

  /**
   * @method search
   * This controller searches for audits that mathces the passed parameters.
   * @param req user request
   * @param query filter parameters
   * @param skip skip count
   * @param limit limit count
   * @returns Array of matched audits
   */
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'AUDIT_ENTRY' })
  @Get('search/:year')
  search(
    @Req() req,
    @Param('year') year,
    @Query() query,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditService.search(
      { ...query, skip, limit },
      req.user.id,
      year,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/searchaudit')
  searchaudit(
    @Query('search') text,
    @Req() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditService.searchaudit({ text, limit, skip }, req.user.id);
  }

  /**
   * @method uploadFile
   * This controllers manage file uploads in audit
   * @param file uploaded file
   * @returns Name and path of uploaded file
   */
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.query.realm.toLowerCase();
          const locationName = req.query.locationName.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/audit`;
          ////////////////console.log('destination', destination);
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          //generating a random name for the file
          const randomName: string = uuid();
          //Calling the callback passing the random name generated with the original extension name
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @Post('attachment')
  uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    return this.auditService.uploadAttachment(file, req.user);
  }

  /**
   * @method deleteFile
   * This controller deletes the uploaded file
   * @param path Path of file to delete
   * @returns success or failure
   */
  @UseGuards(AuthenticationGuard)
  @Post('attachment/delete')
  deleteFile(@Body('path') path: any) {
    return this.auditService.deleteAttachment(path);
  }

  /**
   * @method findOne
   * This controller gets a audit by its ID
   * @param id audit ID
   * @returns fetched audit
   */
  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Read, resource: 'AUDIT_ENTRY' })
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.auditService.findOne(id,req.user);
  }

  /**
   * @method findOneForPdf
   * This controller gets a audit by its ID
   * @param id audit ID
   * @returns fetched audit
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_ENTRY' })
  @Get('/getAuditDtlsForPdf/:id')
  findOneForPdf(@Param('id') id: string, @Req() req) {
    return this.auditService.findOneForPdf(id,req?.user);
  }

  /**
   * @method update This controller updates a
   * @param id
   * @param updateAuditDto
   * @returns
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'AUDIT_ENTRY' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuditDto, @Req() req) {
    return this.auditService.update(id, updateAuditDto, req.user);
  }

  /**
   * @method remove
   * This controller deletes an audit by its ID
   * @param id audit ID
   * @returns Deleted audit
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'AUDIT_ENTRY' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditService.remove(id);
  }

  /**
   * @method isAuditNumberUnique
   * @param req user request
   * @param auditNumber audit number
   * @returns true / false
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_ENTRY' })
  @Post('/isAuditNumberUnique')
  isAuditNumberUnique(@Req() req, @Body('auditNumber') auditNumber: string) {
    return this.auditService.isAuditNumberUnique(req.user.id, auditNumber);
  }

  /**
   * @method rateAuditor
   * This controller is used to rate auditor
   * @param audit Audit ID
   * @param req User request
   * @param createAuditorRating Payload
   * @returns AuditorRating document
   */
  @UseGuards(AuthenticationGuard)
  @Post('/:auditId/rateAuditor')
  rateAuditor(
    @Param('auditId') audit: string,
    @Req() req,
    @Body() createAuditorRating: CreateAuditorRating,
  ) {
    return this.auditService.rateAuditor(
      audit,
      req.user.id,
      createAuditorRating,
    );
  }

  /**
   * @method getAuditorRating
   *  This controller is used to get rating of auditor
   * @param audit Audit ID
   * @param createAuditorRating Payload
   * @returns AuditorRating document
   */
  @UseGuards(AuthenticationGuard)
  @Get('/:auditId/getAuditorRating/:auditorId')
  getAuditorRating(
    @Param('auditId') audit: string,
    @Param('auditorId') auditorId: string,
  ) {
    return this.auditService.getAuditorRating(audit, auditorId);
  }

  /**
   * @method checkIfAuditeeCanRate
   * This controller checks if a user if auditee of a specific post
   * @param auditId Audit ID
   * @param userId User ID
   * @returns True or False
   */
  @UseGuards(AuthenticationGuard)
  @Post(':auditId/isAuditee')
  checkIfAuditee(
    @Param('auditId') auditId: string,
    @Body('userId') userId: string,
  ) {
    return this.auditService.checkIfAuditee(auditId, userId);
  }

  /**
   * @method checkIfAuditor
   * This controller checks if a user if auditor of a specific post
   * @param auditId auditId
   * @param userId userId
   * @returns Boolean
   */
  @UseGuards(AuthenticationGuard)
  @Post(':auditId/isAuditor')
  checkIfAuditor(
    @Param('auditId') auditId: string,
    @Body('userId') userId: string,
  ) {
    return this.auditService.checkIfAuditor(auditId, userId);
  }

  /** =============   NC summary routes  =========================  */

  /**
   * @method getNcByAudit
   * This controller fetches all the ncs for a particular audit
   * @param auditId Audit Id
   * @returns Array of NCs
   */
  @Get(':id/ncs')
  getNcByAudit(@Param('id') auditId: string) {
    return this.auditService.getNcByAuditId(auditId);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllAuditReports/:id')
  async getAllAuditReports(@Param('id') id: string) {
    return this.auditService.getAllAuditReports(id);
  }
  /**
   * @method getAllNcs
   * This controller fetches all the ncs for an organization
   * @param req User request
   * @returns Array of NCs / Observations
   */
  @UseGuards(AuthenticationGuard)
  @Get('/nc/summary/:year')
  getAllNcs(
    @Req() req,
    @Param('year') year,
    @Query() query,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditService.filterNcSummary(
      year,
      { ...query, skip, limit },
      req.user,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/myncsummary/:year')
  getMyNcs(
    @Req() req,
    @Param('year') year,
    @Query() query,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditService.myNcSummary(
      year,
      { ...query, skip, limit },
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/nc/search')
  searchNcData(
    @Query() query: any,
    @Req() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditService.searchNcData({ ...query, limit, skip }, req);
  }

  /**
   * @method getNcById
   * This controller fetch any NCs by its ID.
   * @param id NC ID
   * @returns NC Details
   */
  @Get('/nc/:id')
  getNcById(@Param('id') id: string) {
    return this.auditService.getNcById(id);
  }

  @UseGuards(AuthenticationGuard)
  @Post('ncActionPoint')
  createActionPoint(@Body() data, @Req() req) {
    return this.auditService.createActionPoint(data, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getncActionPoint/:id')
  async getncActionPoint(@Param('id') id: string, @Req() req) {
    return this.auditService.getSingle(id, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateNcActionPointById/:id')
  async updateNcActionPointById(
    @Param('id') id: string,
    @Body() data: any,
    @Req() req,
  ) {
    return this.auditService.updateNCActionPoint(id, req.user.id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('deleteNcActionPointByID/:id')
  async deleteNcActionPointByID(@Param('id') id: string, @Req() req) {
    return this.auditService.deleteActionPoint(id, req.user.id);
  }

  /**
   * @method ncAcceptHandler
   * This controller handles the NC Accept action performed by a user of any role, auditee, auditor or MR.
   * @param ncId NC ID
   * @param body payload
   * @param req  user request
   * @returns updated NC
   */
  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/accept')
  ncAcceptHandler(@Param('id') ncId: string, @Body() body: any, @Req() req) {
    return this.auditService.ncAcceptHandler(ncId, req.user, body);
  }

  /**
   * @method ncRejectHandler
   * This controller handles the NC Reject action performed by a user of any role, auditee, auditor or MR.
   * @param ncId NC ID
   * @param body payload
   * @param req user request
   * @returns updated NC
   */
  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/reject')
  ncRejectHandler(@Param('id') ncId: string, @Body() body: any, @Req() req) {
    return this.auditService.ncRejectHandler(ncId, req.user, body);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/finalReject')
  finalNcRejectHandler(
    @Param('id') ncId: string,
    @Req() req,
    @Body() body: any,
  ) {
    return this.auditService.finalNcRejectHandler(ncId, req.user, body);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/rejectToConvert')
  rejectToConvert(@Param('id') ncId: string, @Body() body: any, @Req() req) {
    return this.auditService.rejectToConvert(ncId, req.user, body);
  }

  /**
   * @method ncCloseHandler
   * This controller handles the NC Close action performed by a user of role MR.
   * @param ncId
   * @param body
   * @param req
   * @returns
   */
  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/close')
  ncCloseHandler(@Param('id') ncId: string, @Body() body: any, @Req() req) {
    return this.auditService.ncCloseHandler(ncId, req.user, body);
  }

  /**
   * @method getBtnStatus
   * This controller handles the NC btn status and returns the action available to a user accoring to its role and relation to the NC.
   * @param ncId NC ID
   * @param req user request
   * @param userId User ID
   * @returns Array of options
   */
  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/getBtnStatus')
  ncBtnStatusHandler(@Param('id') ncId: string, @Req() req, @Body() data) {
    return this.auditService.ncBtnStatusHandlerClone(ncId, req.user, data);
  }

  /**
   * @method obsSubmitHandler
   * This controller handles OBS corrective action submission
   * @param obsId OBS ID
   * @param req user request
   * @param body payload
   * @returns updated OBS
   */
  @UseGuards(AuthenticationGuard)
  @Post('/obs/:id/submit')
  obsSubmitHandler(@Param('id') obsId: string, @Req() req, @Body() body) {
    return this.auditService.obsSubmitHandler(obsId, req.user, body);
  }

  /**
   * @method createNewNc
   * This controller creates a new NC or OBS for an audit
   * @param auditId Audit ID
   * @param createNcDto Payload
   * @returns created NC/OBS
   */
  @Post(':id/ncs')
  createNewNc(@Param('id') auditId: string, @Body() createNcDto: CreateNcDto) {
    return this.auditService.createNewNC(createNcDto);
  }

  /**
   * @method updateNc
   * This controller updates an NC or OBS on the database
   * @param ncId NC ID
   * @param updateNcDto payload
   * @returns updated NC/OBS
   */
  @Patch(':id/ncs/:ncId')
  updateNc(@Param('ncId') ncId: string, updateNcDto: UpdateNcDto) {
    return this.auditService.updateNcById(ncId, updateNcDto);
  }

  /**
   * @method deleteNc This controller delets any NC/OBS from the database
   * @param ncId NC ID
   * @param req user request
   * @returns deletd NC / OBS
   */
  @UseGuards(AuthenticationGuard)
  @Delete('nc/:ncId')
  deleteNc(@Param('ncId') ncId: string, @Req() req) {
    return this.auditService.deleteNcById(ncId, req.user);
  }

  /**
   * @method createNewNcComment
   * This controller creates a new comment for an NC
   * @param ncId NC ID
   * @param comment comment text
   * @param req User request
   * @returns added comment
   */
  @UseGuards(AuthenticationGuard)
  @Post('/nc/:id/comments')
  createNewNcComment(
    @Param('id') ncId: string,
    @Body('comment') comment: any,
    @Req() req,
  ) {
    return this.auditService.createNewNcComment(ncId, comment, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checkIfReportAlreadyCreatedForDepartment/:auditScheduleId/:entityId')
  checkIfReportAlreadyCreatedForDepartment(
    @Param('auditScheduleId') auditScheduleId: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.checkIfReportAlreadyCreatedForDepartment(
      auditScheduleId,
      entityId,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Post('/sendMailWithPdfReport/:id')
  async sendPDFMailAttachment(@Param('id') id) {
    return this.auditService.sendPDFMailAttachment(id);
  }
}
