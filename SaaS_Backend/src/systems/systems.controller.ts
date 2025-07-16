import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SystemsService } from './systems.service';
import { CreateSystemDto } from './dto/create-system.dto';
import { UpdateSystemDto } from './dto/update-system.dto';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AbilityGuard } from '../ability/ability.guard';
import { Action } from '../ability/ability.factory';
import { checkAbilities } from '../ability/abilities.decorator';

@Controller('/api/systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @UseGuards(AuthenticationGuard)
  @Get('displayAllSystemsForOrg/:selectedLocation')
  displayAllSystemsForOrg(@Req() req, @Param('selectedLocation') loc) {
    //////////////console.log('locincontroller', loc);
    return this.systemsService.displayAllSystemsForOrg(
      req.user,
      JSON.parse(loc),
    );
  }

  /**
   *  This controller creates new system and stores it to db
   * @param createSystemDto System data
   * @param req User request
   * @returns Created system
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'SYSTEM_MASTER' })
  @Post()
  create(@Body() createSystemDto: CreateSystemDto, @Req() req: any) {
    return this.systemsService.create(req.user.id, createSystemDto);
  }

  /**
   *  This controller finds all the systems from db
   * @param skip Skip count
   * @param limit Limit count
   * @param req User request
   * @returns Returns all the systems
   * */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req,
  ) {
    return this.systemsService.findAll(req.user, skip, limit);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllSystemFromOrg')
  getAllSystemFromOrg(@Req() req) {
    return this.systemsService.getAllSystemFromOrg(req.user);
  }

  /**
   *  This controller search for systems with provided filtering parameters
   * @param type System type
   * @param name System name
   * @param location System location
   * @param skip Skip count
   * @param limit Limit count
   * @param req User req
   * @param realmName RealmName of organization
   * @returns Returns all the matched systems
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Post('search')
  searchSystem(
    @Query('type') type: string,
    @Query('name') name: string,
    @Query('location') location: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Req() req,
    @Body('realmName') realmName: string,
  ) {
    return this.systemsService.searchSystem(
      { type, name, location, skip, limit },
      req.user,
      realmName,
    );
  }

  /**
   *  This controller fetchs a system by its ID
   * @param id System ID
   * @returns Returns the system
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemsService.findById(id);
  }

  /**
   *  This controller updates a system by its ID
   * @param id System ID
   * @param updateSystemDto Updated system data
   * @param req User req
   * @returns Returns updated system
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'SYSTEM_MASTER' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSystemDto: UpdateSystemDto,
    @Req() req,
  ) {
    return this.systemsService.update(id, updateSystemDto, req.user.id);
  }

  /**
   *  This controller deletes a system by its ID
   * @param id System ID
   * @returns Returns the deleted system
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'SYSTEM_MASTER' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemsService.remove(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'SYSTEM_MASTER' })
  @Patch('restoreSystem/:id')
  restore(@Param('id') id: string) {
    return this.systemsService.restoreSystem(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'SYSTEM_MASTER' })
  @Delete('deleteSystem/:id')
  deleteSystem(@Param('id') id: string) {
    return this.systemsService.deleteSystem(id);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Get('byType/:systemTypeId')
  getSystemByType(@Param('systemTypeId') systemTypeId: string) {
    return this.systemsService.getSystemBySystemType(systemTypeId);
  }

  /**
   *  This controller fetches all clauses of a system
   * @param id System ID
   * @returns Array of clauses
   */
  @Get('/getclauses/:query')
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  async getClauses(@Param('query') query: any) {
    ////////////////console.log('queryincontroller', query);
    return this.systemsService.getClauses(query);
  }

  /**
   *  This controller duplicates a system by its id
   * @param id System ID
   * @returns Retruns newly created system
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'SYSTEM_MASTER' })
  @Post('duplicate')
  duplicateSystem(@Body('id') id: string) {
    return this.systemsService.duplicateSystem(id);
  }

  /**
   *  This controller adds new clause into a system
   * @param id System ID
   * @param data Clause Data
   * @returns Returns update system
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'SYSTEM_MASTER' })
  @Post('clauses')
  addNewClause(@Param('id') id: string, @Body() data: any) {
    return this.systemsService.AddNewClause(id, data);
  }

  /**
   *  This controller updates a clause in a system
   * @param system_id System ID
   * @param clause_id Clause ID
   * @param data Updated clause data
   * @returns Updated System
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'SYSTEM_MASTER' })
  @Patch('clauses/:cid')
  updateClauses(
    // @Param('id') system_id: string,
    @Param('cid') clause_id: string,
    @Body() data: any,
  ) {
    return this.systemsService.updateClauses(clause_id, data);
  }

  /**
   *  This controller deletes clause existing in a system
   * @param system_id System ID
   * @param clauseId Clause ID
   * @returns Returns updated System
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'SYSTEM_MASTER' })
  @Delete('clauses/:id')
  deleteClauses(
    @Param('id') clauseId: string,
    // @Body('clauseId') clauseId: string,
  ) {
    return this.systemsService.removeClause(clauseId);
  }

  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'SYSTEM_MASTER' })
  @Get('clauses/:id')
  getClausesForSystemId(
    @Param('id') systemId: string,
    // @Body('clauseId') clauseId: string,
  ) {
    return this.systemsService.getClausesForSystemId(systemId);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/displaySystems/:locationName')
  displaySystem(@Param('locationName') locationName: any, @Req() req) {
    return this.systemsService.displaySystem(
      JSON.parse(locationName),
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/displaySystemsForGivenLocation/:locationName')
  displaySystemForGivenLocation(
    @Param('locationName') locationName: any,
    @Req() req,
  ) {
    // console.log('locationName', JSON.parse(locationName));
    return this.systemsService.displaySystemForGivenlocation(
      JSON.parse(locationName),
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllClausesByOrgId/:orgId')
  getAllClausesByOrgId(@Req() req, @Param('orgId') orgId) {
    //////////////console.log('locincontroller', loc);
    return this.systemsService.getAllClausesByOrgId(orgId);
  }
}
