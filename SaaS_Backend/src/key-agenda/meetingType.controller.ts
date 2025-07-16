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
} from '@nestjs/common';
import { MeetingTypeService } from './meetingType.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from 'src/ability/ability.guard';
import { checkAbilities } from 'src/ability/abilities.decorator';
import { Action } from 'src/ability/ability.factory';
import { Console } from 'node:console';
import { query } from 'winston';

@Controller('/api/keyagenda')
export class MeetingTypeController {
  constructor(private readonly keyAgendaService: MeetingTypeService) {}

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({ action: Action.Create, resource: 'RISK_CONFIG' })
  @Post()
  create(@Body() data: any, @Req() req: any) {
    return this.keyAgendaService.create(data, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getkeyAgendaByOrgId')
  getKeyAgendaByOrgId(@Query() query, @Req() req: any) {
    // console.log('inside controller');
    return this.keyAgendaService.getKeyAgendaByOrgId(query);
  }

  @UseGuards(AuthenticationGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.keyAgendaService.delete(id, req);
  }

  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @Req() req: any) {
    return this.keyAgendaService.update(id, data, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getMeetingTypeById/:id')
  getMeetingTypeById(@Param('id') id: string) {
    return this.keyAgendaService.getMeetingTypeById(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getkeyAgendaByUnit')
  getKeyAgendaByUnits(
    @Query('orgId', new DefaultValuePipe(0)) orgId: string,
    @Query('locationId', new DefaultValuePipe(0)) locationId: any,
    @Query('currentYear', new DefaultValuePipe(0)) currentYear: any,
    @Req() req: any,
  ) {
    // //console.log('inside controller');
    return this.keyAgendaService.getKeyAgendaByUnits(
      orgId,
      locationId,
      currentYear,
      req.user,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getkeyAgendaByUnitWithoutFilter')
  getKeyAgendaByUnitsWithoutFilter(@Query() query, @Req() req: any) {
    // console.log('inside controller');
    return this.keyAgendaService.getKeyAgendaByUnitsWithoutFilter(
      query,
      req.user,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getkeyAgendaMRMByUnit')
  getKeyAgendaMRMByUnitName(@Query() query, @Req() req: any) {
    return this.keyAgendaService.getKeyAgendaMRMByUnitName(query, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getSchedulePeriodUnit')
  async getSchedulePeriodByUnit(
    @Query('orgId', new DefaultValuePipe(0)) orgId: string,
    @Query('unitId', new DefaultValuePipe(0)) unitId: string,
    @Query('applicationSystemID', new DefaultValuePipe(0)) systemID: any,
    @Req() req: any,
  ) {
    const periodArray = [
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
      'January',
      'February',
      'March',
    ];

    const res = await this.keyAgendaService.getSchedulePeriodByUnit(
      orgId,
      unitId,
      systemID,
    );
    // //////console.log('result in controller', res);
    let newRes: any[] = [];
    let periods: string[] = [];

    for (const item of res) {
      if (item?.mrmData?.mrmPlanData) {
        const itemPeriods: string[] = item.mrmData.mrmPlanData
          .map((value, index) => (value ? periodArray[index] : null))
          .filter(Boolean);

        item.mrmData.period = itemPeriods;
        newRes.push(item);

        // Add the item's periods to the overall periods array
        periods.push(...itemPeriods);
      }
    }

    // Remove duplicates and sort the periods array
    periods = [...new Set(periods)].sort(
      (a, b) => periodArray.indexOf(a) - periodArray.indexOf(b),
    );

    return { data: newRes, period: periods };
  }

  @UseGuards(AuthenticationGuard)
  @Get('/search')
  serachSchedule(
    @Query() query,

    @Req() req: any,
  ) {
    return this.keyAgendaService.searchSchedule(query, req.user);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getColumnFilterList')
  async getColumnFilterList(@Req() req) {
    // const randomNumber = uuid();
    // this.logger.log(
    //   `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForSchedule`,
    //   'MRM-Controller',
    // );
    return this.keyAgendaService.getColumnFilterList(req.user);
  }
}
