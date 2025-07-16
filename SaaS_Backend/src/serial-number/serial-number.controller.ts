import {
  Controller,
  UseGuards,
  Get,
  Body,
  Post,
  Delete,
  Param,
  Put,
  Query,
  Inject,
} from '@nestjs/common';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { SerialNumberService } from './serial-number.service';
import { Logger, query } from 'winston';

@Controller('/api/serial-number')
export class SerialNumberController {
  constructor(
    private readonly SerialNumberService: SerialNumberService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  @UseGuards(AuthenticationGuard)
  @Post('createPrefixSuffix')
  async createPrefixSuffix(@Body() data: any) {
    return this.SerialNumberService.createPrefixSuffix(data);
  }
  @UseGuards(AuthenticationGuard)
  @Get('getPrefixSuffix/:id/:id1')
  async getPrefixSuffix(@Param('id') id: String, @Param('id1') id1: String) {
    return this.SerialNumberService.getPrefixSuffix(id, id1);
  }
  @UseGuards(AuthenticationGuard)
  @Put('updatePrefixSuffix/:id')
  async updatePrefixSuffix(@Param('id') id, @Body() data: any) {
    return this.SerialNumberService.updatePrefixSuffix(id, data);
  }
  @UseGuards(AuthenticationGuard)
  @Delete('deletePrefixSuffix/:id')
  async deletePrefixSuffix(@Param('id') id) {
    return this.SerialNumberService.deletePrefixSuffix(id);
  }
  @UseGuards(AuthenticationGuard)
  @Get('generateSerialNumber')
  async generateSerialNumber(@Query() query) {
    this.logger.log('calling generateSerialNumber', 'SerialNumberController');
    return this.SerialNumberService.generateSerialNumber(query);
  }
  // @UseGuards(AuthenticationGuard)
  // @Get('getSerialNumber')
  // async getSerialNumber(@Query() query) {
  //   this.logger.log('calling getserialnumber', 'SerialNumberController');
  //   return this.SerialNumberService.getSerialNumber(query);
  // }
  @UseGuards(AuthenticationGuard)
  @Get('getPrefixSuffixonModuleType/:moduleType/:orgId')
  async getPrefixSuffixonModuleType(
    @Param('moduleType') moduleType,
    @Param('orgId') orgId,
  ) {
    return this.SerialNumberService.getPrefixSuffixonModuleType(
      moduleType,
      orgId,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('getAllPrefixSuffix/:id')
  async getAllPrefixSuffix(@Param('id') id) {
    this.logger.log('getAllPrefixSuffix called', this.getAllPrefixSuffix);
    return this.SerialNumberService.getAllPrefixSuffix(id);
  }
}
