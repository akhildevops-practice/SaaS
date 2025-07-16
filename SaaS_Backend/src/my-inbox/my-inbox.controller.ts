import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MyInboxService } from './my-inbox.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';

@Controller('/api/my-inbox')
export class MyInboxController {
  constructor(private readonly MyInboxService: MyInboxService) {}
  //api call to create data for document
  @UseGuards(AuthenticationGuard)
  @Get('/getDocumentsByUser')
  getdocumentbyuser(@Req() req) {
    return this.MyInboxService.getDocumentByUser(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getAuditByAuditee/:auditeeAudits')
  getauditbyuser(@Param('auditeeAudits') auditeeAudits) {
    return this.MyInboxService.getAuditByAuditee(auditeeAudits);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getAuditByAuditor/:auditoraudits')
  getallauditbyuser(@Param('auditoraudits') auditoraudits) {
    return this.MyInboxService.getAuditByAuditor(auditoraudits);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAuditByMR')
  getallauditbymr(@Req() req) {
    return this.MyInboxService.getAuditByMR(req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getAllAudits')
  getAllAudits(@Req() req) {
    return this.MyInboxService.getAllAudits(req.user);
  }
}
