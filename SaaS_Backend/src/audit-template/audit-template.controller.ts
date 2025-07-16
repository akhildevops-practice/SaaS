import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { checkAbilities } from '../ability/abilities.decorator';
import { Action } from '../ability/ability.factory';
import { AbilityGuard } from '../ability/ability.guard';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { AuditTemplateService } from './audit-template.service';
import { CreateAuditTemplateDto } from './dto/create-audit-template.dto';
import { UpdateAuditTemplateDto } from './dto/update-audit-template.dto';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { diskStorage } from 'multer';

@Controller('/api/audit-template')
export class AuditTemplateController {
  constructor(private readonly auditTemplateService: AuditTemplateService) {}

  /**
   * @Desc This controller is for creating a new audit template
   * @param createAuditTemplateDto Audit Template Data From Request body
   * @returns Created template
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Create, resource: 'AUDIT_TEMPLATE' })
  @Post()
  create(@Body() createAuditTemplateDto: CreateAuditTemplateDto, @Req() req) {
    return this.auditTemplateService.create(
      createAuditTemplateDto,
      req.user.id,
    );
  }

  @Get('/getmultipleTemplates')
  getmultipleTemplates(@Query('id') data) {
    return this.auditTemplateService.getmultipleTemplates(data);
  }

  /**
   * @Desc This controller fetches all the available templates from the Database. Skip and limit are used to paginate the results.
   * @param skip {number}
   * @param limit {number}
   * @returns List of templates
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_TEMPLATE' })
  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query() query,
    @Req() req,
  ) {
    return this.auditTemplateService.findAll(req.user, skip, limit, query);
  }

  /**
   *  This controller returns true/false if any template title matches the text
   * @param text Search string
   * @returns True/False
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_TEMPLATE' })
  @Get('/isUnique')
  ifNameUnique(@Query('text') text: string, @Req() req) {
    return this.auditTemplateService.isTemplateUnique(req.user.id, text);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAllAuditTemplatesByLocation/:id')
  getAllAuditTemplatesByLocation(@Param('id') id: string, @Req() req) {
    return this.auditTemplateService.getAllAuditTemplatesByLocation(
      req.user,
      id,
    );
  }

  /**
   * @Desc This controller fetchs all the templates matching the provided name
   * @param query query object from express
   * @returns Array of matched templates
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_TEMPLATE' })
  @Get('search')
  async searchTemplate(
    @Req() req,
    @Query('title') title: string,
    @Query('createdBy') createdBy: string,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditTemplateService.searchTemplate(
      req.user.id,
      title,
      createdBy,
      skip,
      limit,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllLocationsForTemplate')
  async getAllLocationsForTemplate(@Req() req) {
    return await this.auditTemplateService.getAllLocationsForTemplate(req.user)
  }
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_TEMPLATE' })
  @Get('searchForTemplate')
  async search(
    @Req() req,
    @Query('search') search,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.auditTemplateService.search(req.user.id, search, skip, limit);
  }
  /**
   *  This controller is for fetching all audit templates for a given user
   * @returns Array of templates
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_TEMPLATE' })
  @Get('/getSuggestions')
  async getSuggestions(@Req() req) {
    return this.auditTemplateService.getTemplateSuggestions(req.user.id);
  }

  /**
   * @Desc This controller fetches a specific templates by its ID, passed as a parameter
   * @param id Template ID
   * @returns Template data
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Read, resource: 'AUDIT_TEMPLATE' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditTemplateService.findOne(id);
  }

  /**
   * @Desc This contorller updates a template by its ID
   * @param id Template ID
   * @param updateAuditTemplateDto Updated template data
   * @returns
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Update, resource: 'AUDIT_TEMPLATE' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuditTemplateDto: UpdateAuditTemplateDto,
  ) {
    return this.auditTemplateService.update(id, updateAuditTemplateDto);
  }

  /**
   * @Desc This controller deletes a template from DB by its ID
   * @param id Template ID
   * @returns Deleted Template
   */
  @UseGuards(AuthenticationGuard, AbilityGuard)
  @checkAbilities({ action: Action.Delete, resource: 'AUDIT_TEMPLATE' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditTemplateService.remove(id);
  }

  @UseGuards(AuthenticationGuard)
  // @checkAbilities({action: Action.Read, resource: "AUDIT_TEMPLATE"})
  @Get(':id/audit')
  getTemplateForAudit(@Param('id') id: string) {
    return this.auditTemplateService.getTemplateForAudit(id);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(FileInterceptor('file', { storage: diskStorage({}) }))
  @Post('/getExcelDetails')
  async getExcelDetails(@UploadedFile() file, @Res() res) {
    return await this.auditTemplateService.getExcelDetails(file, res);
  }

}
