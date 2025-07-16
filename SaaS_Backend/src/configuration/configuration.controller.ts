import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigurationService } from './configuration.service';

import { AuthenticationGuard } from 'src/authentication/authentication.guard';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';
const fs = require('fs');

@Controller('/api/configuration')
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  @UseGuards(AuthenticationGuard)
  @Post()
  async createConfig(@Body() data, @Req() req) {
    return this.configService.create(data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/:id')
  async updateConfig(@Body() data, @Param('id') id, @Req() req) {
    return this.configService.updateConfig(id, data, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/:id')
  async deleteConfig(@Param('id') id, @Req() req) {
    return this.configService.deleteData(id, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get()
  async getAll(@Req() req) {
    return this.configService.getAll(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllUserForConfig')
  async getAllUserForConfig(@Req() req) {
    return this.configService.getAllUserForConfig(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllUserByDept/:id')
  async getAllUserByDept(@Req() req, @Param('id') id) {
    return this.configService.getAllUserByDept(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDeptFromConfig')
  async getAllDeptFromConfig(@Req() req) {
    return this.configService.getAllDeptFromConfig(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllDept')
  async getAllDept(@Req() req) {
    return this.configService.getAllDept(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllCustomer')
  async getAllCustomer(@Req() req) {
    return this.configService.getAllCustomer(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('createNpdConfig')
  async createNpdConfig(@Req() req, @Body() data) {
    return this.configService.createNpdConfig(req.user, data);
  }

  @UseGuards(AuthenticationGuard)
  @Put('updateNpdConfig/:id')
  async updateNpdConfig(@Req() req, @Body() data, @Param('id') id) {
    return this.configService.updateNpdConfig(req.user, data, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getNpdConfigById/:id')
  async getNpdConfigById(@Req() req, @Param('id') id) {
    return this.configService.getNpdConfigById(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getNpdConfigByDpt/:id')
  async getNpdConfigByDpt(@Req() req, @Param('id') id) {
    return this.configService.getNpdConfigByDpt(req.user, id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNpdConfig')
  async getAllNpdConfig(@Req() req) {
    return this.configService.getAllNpdConfig(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDptAndPicUsersConfig')
  async getDptAndPicUsersConfig(@Req() req) {
    return this.configService.getDptAndPicUsersConfig(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNpdGnatt')
  async getAllNpdGnatt(@Req() req) {
    return this.configService.getAllNpdGnatt(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getAllNpdDeptGnatt')
  async getAllNpdDeptGnatt(@Req() req) {
    return this.configService.getAllNpdDeptGnatt(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('addMultipleAttachments')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          let locationName;
          const realmName = req.query.realm.toLowerCase();
          // if (req.query.locationName) {
          //   locationName = req.query.locationName;
          // } else {
          //   locationName = 'NoLocation';
          // }
          const destination = `${process.env.FOLDER_PATH}/${realmName}/npd`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName: string = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // You can implement a file filter logic here if needed
        // For example, to reject certain file types
        cb(null, true);
      },
    }),
  )
  addAttachMentForAudit(
    @UploadedFiles() file: Express.Multer.File[],
    @Req() req,
  ) {
    return this.configService.uploadsAttachment(file, req.query);
  }

  @Post('addsingleFile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.query.realm.toLowerCase();
          const destination = `${process.env.FOLDER_PATH}/${realmName}/npd`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const randomName: string = uuid();
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Implement file filtering logic if needed
        cb(null, true);
      },
    }),
  )
  addsingleFile(
    @UploadedFile() file: Express.Multer.File, // Change to @UploadedFile() for single file
    @Req() req,
  ) {
    return this.configService.addsingleFile(file, req.query); // Pass the file as an array to maintain compatibility
  }
}
