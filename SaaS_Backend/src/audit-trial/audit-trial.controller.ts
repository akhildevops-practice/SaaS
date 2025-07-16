import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { identity } from 'rxjs';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { AuditTrialService } from './audit-trial.service';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';

@Controller('/api/audit-trial')
export class AuditTrialController {
  constructor(
    private readonly auditTrialService: AuditTrialService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('createAuditTrail')
  async createAuditTrail(@Body() data: any) {
    return this.auditTrialService.createAuditTrail(data);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAuditTrialById/:id')
  async getaudittrialbyid(@Param('id') id) {
    const randomNumber = uuid();
    this.logger.log(
      `trace id = ${randomNumber} GET api/audit-trial/getAuditTrialById/${id}`,
      'Audit-trial-Controller',
    );
    //if post this.logger.info()
    return this.auditTrialService.getAuditTrialById(id,randomNumber);
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deleteAuditTrialById/:id')
  async deleteAuditTrialById(@Param('id') id) {
    return this.auditTrialService.deleteAuditTrialById(id);
  }
  @UseGuards(AuthenticationGuard)
  @Put('updateAuditTrialById/:id')
  async updateAuditTrialById(@Param('id') id, @Body() data: any) {
    ////////////////console.log();
    return this.auditTrialService.updateAuditTrialById(id, data);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAuditTrail')
  getAuditTrail(@Query() id: any) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/audit-trial/getAuditTrail`,
      'documents.controller.ts',
    );
    return this.auditTrialService.getAuditTrail(id);
  }
}
