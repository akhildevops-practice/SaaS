import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    UseGuards,
    Param,
    Put,
    Delete,
    Query,
  } from '@nestjs/common';
  import { AuthenticationGuard } from '../authentication/authentication.guard';
  import { problemDto } from './dto/problem.dto';
  import { ProblemService } from './problem.service';
  import { AbilityGuard } from '../ability/ability.guard';
  import { roleChecker } from '../utils//roleChecker';
  import { roles } from '../utils/roles.global';
  import { checkAbilities } from '../ability/abilities.decorator';
  import { Action } from '../ability/ability.factory';
  
  @Controller('api/problem')
  export class ProblemController {
    constructor(private readonly problemService: ProblemService) {}
  
    /**
     *
     *  this controller for creating location
     * @param locationDto contains fields for creating a location
     * @returns the created location
     */
    @UseGuards(AuthenticationGuard, AbilityGuard)
    @checkAbilities({ action: Action.Create, resource: 'MODEL_MASTER' })
    @Post()
    createProblem(@Body() problemDto: problemDto, @Req() req) {
      return this.problemService.createProblem(problemDto, req.user);
    }
  
    // /**
    //  *
    //  *  this function to filter all locations of a organization based on below filter options
    //  * @param ModelName String containing Model name
    //  * @param ModelNo  String containing Model number
    //  * @param page Pagination page number
    //  * @param limit Results to show in each page
    //  * @returns the list filtered locations of a organization based on various condtions
    //  */
  
    @UseGuards(AuthenticationGuard, AbilityGuard)
    @checkAbilities({ action: Action.Read, resource: 'MODEL_MASTER' })
    @Get()
    async getProblems(
      @Query('page') page,
      @Query('limit') limit,
      @Query('search') search,
      @Req() req,
    ) {
      return this.problemService.getProblems(
        page,
        limit,
        req.user,
        search
      );
    }
  
    /**
     *
     *  this function to get location admin of a particular location
     * @param id String containing location id of the location, whose location admin needs to be fetched
     * @returns the location admin for the particular organization
     */
  
    //  *
    //  *  this controller for updating a location
    //  * @param locationDto contains fields for updating a location
    //  * @returns the created location
    //  */
  
    @UseGuards(AuthenticationGuard, AbilityGuard)
    @checkAbilities({ action: Action.Update, resource: 'MODEL_MASTER' })
    @Put(':id')
    updateProblem(@Body() problemDto: problemDto, @Param('id') id) {
      
      return this.problemService.updateProblem(problemDto, id);
    }
  
    // /**
    //  *
    //  *  this controller for deleting a location
    //  * @param id of the location to be deleted
    //  * @returns the created location
    //  */
  
    @UseGuards(AuthenticationGuard, AbilityGuard)
    @checkAbilities({ action: Action.Delete, resource: 'MODEL_MASTER' })
    @Delete(':id')
    async deleteProblem(@Param('id') id) {
      return this.problemService.deleteProblem(id);
    }
  
    //  *
    //  *  this controller for fetching a single location
    //  * @param realmName of the organizations whose sections need to be fetched
    //  * @returns an array of sections that belong to a pericular organization
    //  */
  
    @Get('/getProblem/byId/:id')
    async getModelById(@Param('id') id) {
      return this.problemService.getProblemById(id);
    }
  }
  