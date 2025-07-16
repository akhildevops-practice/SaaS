import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { moduleAdoptionReportService } from './module-adoption-report.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Cron } from '@nestjs/schedule';

@Controller('/api/moduleAdoptionReport')
export class moduleAdoptionReportController {
  constructor(
    private readonly moduleAdoptionReportService: moduleAdoptionReportService,
  ) {}

  @Cron('59 23 * * *')
  //@Cron('*/10 * * * * *')
  startcron() {
    return this.moduleAdoptionReportService.startCron();
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createModuleAdoptionReport')
  createModuleAdoptionReport(@Body() data: any, @Req() req: any) {
    return this.moduleAdoptionReportService.createModuleAdoptionReport(data);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createAllModuleAdoptionReport')
  createAllModuleAdoptionReport(@Req() req: any) {
    return this.moduleAdoptionReportService.createAllModuleAdoptionReport(req, "");
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getModuleAdoptionReport')
  getModuleAdoptionReport(@Req() req: any, @Query() date) {
    return this.moduleAdoptionReportService.getModuleAdoptionReport(date, req, "");
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllBusinessTypes')
  getAllBusinessTypes(@Req() req: any) {
    return this.moduleAdoptionReportService.getAllBusinessTypes(req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllLocations')
  getAllLocations(@Req() req: any) {
    return this.moduleAdoptionReportService.getAllLocations(req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getLocationsByBusinessType')
  getLocationsByBusinessType(@Req() req: any, @Query() query) {
    return this.moduleAdoptionReportService.getLocationsByBusinessType(req, query);
  }
}
