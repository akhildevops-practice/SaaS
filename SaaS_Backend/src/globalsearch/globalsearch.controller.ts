import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { GlobalsearchService } from './globalsearch.service';
import { DashboardFilter } from 'src/dashboard/dto/dashboard-filter.dto';
import { query } from 'express';
import { ApiParam } from '@nestjs/swagger';
@Controller('api/globalsearch')
export class GlobalsearchController {
  constructor(private readonly globalSearchService: GlobalsearchService) {}

  @UseGuards(AuthenticationGuard)
  @Get('/getmodulecount')
  findAllModules(@Query() query: any) {
    return this.globalSearchService.findAllModules(query);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getRecycleBinList')
  recycleBinList(@Req() req) {
    return this.globalSearchService.recycleBinList(req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/restoreList')
  restoreList(@Body() data, @Req() req) {
    return this.globalSearchService.restoreAll(data, req.user.id);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/deleteList')
  deleteList(@Body() data, @Req() req) {
    return this.globalSearchService.deleteAllByIds(data, req);
  }
  @UseGuards(AuthenticationGuard)
  @Get()
  findAll(@Query() query: DashboardFilter, @Req() req: any) {
    return this.globalSearchService.findAll(query, req.user, req);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getHiraSearchResultWithFilter')
  getHiraSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.getAllHiraWithSteps(
      query?.searchQuery,
      query,
      query?.organizationId,
      '',
      ''
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCapaSearchResultWithFilter')
  getCapaSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.fetchAllCapa(
      query?.searchQuery,
      query?.organizationId,
      query,
      '',
      ''
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getCipSearchResultWithFilter')
  getCipSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.fetchAllCip(
      query,
      query?.organizationId,
      query,
      '',
      ''
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDocSearchResultWithFilter')
  getDocSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.fetchAllDocuments(
      query,
      query?.organizationId,
      query,
      req?.user,
      "",
      ''
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getRefDocSearchResultWithFilter')
  getRefDocSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.fetchAllRefDocs(
      query?.searchQuery,
      query?.organizationId,
      query,
      req?.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getNcSearchResultWithFilter')
  getNcSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.fetchNonConformances(
      query?.searchQuery,
      query?.organizationId,
      query,
      "",
      ''
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getClausesSearchResultWithFilter')
  getClauseSearchResultWithFilter(@Query() query: any, @Req() req: any) {
    return this.globalSearchService.fetchClauses(
      query?.searchQuery,
      [],
      query?.organizationId,
      query,
    );
  }
}
