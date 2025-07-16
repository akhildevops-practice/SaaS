import { Controller, UseGuards, Req, Body, Post, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { AuthenticationGuard } from '../authentication/authentication.guard';
@Controller('/api/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}


  @UseGuards(AuthenticationGuard)
  @Get('/getAllEntries')
  getAllEntriesInStats(@Query() query: any) {
    return this.statsService.getAllEntriesInStats(query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllTransactions')
  getAllTransactions(@Query() query: any) {
    return this.statsService.getAllTransactions(query);
  }

  
  @UseGuards(AuthenticationGuard)
  @Post('/createEntryInStats')
  createEntryInStats(@Body() body: any, @Req() req: any) {
    //////console.log('in post risk data', data);
    return this.statsService.createEntryInStats(body);
  }

 
}
