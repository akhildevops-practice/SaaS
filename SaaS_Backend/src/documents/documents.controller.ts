import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpException,
  Req,
  UseGuards,
  Query,
  Inject,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, basename } from 'path';
import { v4 as uuid } from 'uuid';
import { AuthenticationGuard } from 'src/authentication/authentication.guard';
import { CreateCommentDto } from './dto/create-document-comment.dto';

import { OciUtils } from './oci_utils';
import { Logger, log } from 'winston';
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs');

@Controller('api/documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    @Inject('Logger') private readonly logger: Logger,
    private readonly ociUtils: OciUtils,
  ) {}

  @Patch('/:id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocumentWithVersions(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('UpdateDocumentBasedOnAdditionalDocument')
  UpdateDocumentBasedOnAdditionalDocument() {
    return this.documentsService.UpdateDocumentBasedOnAdditionalDocument();
  }

  @UseGuards(AuthenticationGuard)
  @Patch('updateDateForNextRevision')
  updateDateForNextRevision(@Req() req) {
    return this.documentsService.updateDateForNextRevision(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  create(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    console.log('api called');
    return this.documentsService.create(createDocumentDto, file);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createDocWithPublishedState')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  createDocWithPublishedState(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    console.log('api called');
    return this.documentsService.createDocWithPublishedState(body, file);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createDocWithInReviewState')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  createDocWithInReviewState(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    return this.documentsService.createDocWithInReviewState(body, file);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocInDraftMode/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // e.g., '7f3a1c2d'
          const originalName = file.originalname.split(' ').join('_'); // Replace spaces
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g., fileName__7f3a1c2d.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  updateDocInDraftMode(
    @Body() body: UpdateDocumentDto,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocInDraftMode(id, body, file);
  }

  // @UseGuards(AuthenticationGuard)
  // @Patch('/updateDocumentForReviewComplete/:id')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: (req: any, file: any, cb: any) => {
  //         const realmName = req.body?.realmName?.toLowerCase();
  //         const locationName = req.body?.locationName?.toLowerCase();

  //         if (!realmName || !locationName) {
  //           return cb(
  //             new Error('Missing realmName or locationName in body'),
  //             '',
  //           );
  //         }

  //         const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
  //         if (!fs.existsSync(destination)) {
  //           fs.mkdirSync(destination, { recursive: true });
  //         }

  //         cb(null, destination);
  //       },
  //       filename: (req, file, cb) => {
  //         const shortUUID = uuidv4().split('-')[0]; // e.g., '7f3a1c2d'
  //         const originalName = file.originalname.split(' ').join('_'); // Replace spaces
  //         const baseName = basename(originalName, extname(originalName));
  //         const extension = extname(originalName);
  //         const newName = `${baseName}__${shortUUID}${extension}`; // e.g., fileName__7f3a1c2d.pdf

  //         cb(null, newName);
  //       },
  //     }),
  //   }),
  // )
  // updateDocumentForReviewComplete(
  //   @Body() data: any,
  //   @UploadedFile() file,
  //   @Req() req,
  //   @Param('id') id,
  // ) {
  //   return this.documentsService.updateDocumentForReviewComplete(id, data, file);
  // }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForReview/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase();
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // e.g., '7f3a1c2d'
          const originalName = file.originalname.split(' ').join('_'); // Replace spaces
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g., fileName__7f3a1c2d.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForReview(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForReview(
      id,
      data,
      file,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForApproval/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase();
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0];
          const originalName = file.originalname.split(' ').join('_');
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`;
          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForApproval(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForApproval(
      id,
      data,
      file,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForSendForEdit/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase();
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0];
          const originalName = file.originalname.split(' ').join('_');
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`;
          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForSendForEdit(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForSendForEdit(id, data, file);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForPublishedState/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase();
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0];
          const originalName = file.originalname.split(' ').join('_');
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`;
          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForPublishedState(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForPublishedState(
      id,
      data,
      file,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForCustomWorkflow/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase();
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // e.g., '7f3a1c2d'
          const originalName = file.originalname.split(' ').join('_'); // Replace spaces
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g., fileName__7f3a1c2d.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForCustomWorkflow(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForCustomWorkflow(
      id,
      data,
      file,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/markDocumentAsFavorite/:docId/:userId')
  markDocumentAsFavorite(@Param('docId') docId, @Param('userId') userId) {
    return this.documentsService.markDocumentAsFavorite(docId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Patch('/removeDocumentFromFavorites/:docId/:userId')
  removeDocumentFromFavorite(@Param('docId') docId, @Param('userId') userId) {
    return this.documentsService.removeDocumentFromFavorites(docId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createDocumentComment')
  createDocumentComment(@Body() body: any) {
    return this.documentsService.createDocumentComment(body);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getDocumentComments/:documentId')
  findAllDocCommentsByDocumentId(@Param('documentId') documentId) {
    return this.documentsService.findAllDocCommentsByDocumentId(documentId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAttachmentHistory/:documentId')
  getAttachmentHistory(@Param('documentId') documentId: string) {
    return this.documentsService.getAttachmentHistoryForDocument(documentId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/revisionReminder/:id')
  revisionReminder(@Param('id') id) {
    //////////////console.log('inside controller');
    return this.documentsService.revisionReminder(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getSingleDocument/:id')
  findOne(
    @Param('id') id: string,
    @Query('version') version: boolean,
    @Query('versionId') versionId: string,
    @Req() req,
  ) {
    return this.documentsService.findOne(id, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getdocworkflowhistory/:documentId')
  getDocWorkflowHistory(@Param('documentId') documentId) {
    return this.documentsService.getDocWorkflowHistory(documentId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/filerValue')
  filterValue(@Req() req, @Query() query) {
    return this.documentsService.filterValue(req.user.id, query);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/filerValueNew')
  filterValueNew(@Req() req, @Query() query) {
    return this.documentsService.filterValueNew(req.user, query);
  }

  @UseGuards(AuthenticationGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  update(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updatetest(
      id,
      createDocumentDto,
      file,
      req.user,
    );
  }
  // @UseGuards(AuthenticationGuard)
  // @Patch('/restoredocument/:id')
  // restore(@Param('id') id: string) {
  //   return this.documentsService.restoreDocument(id);
  // }
  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForAmend/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForAmend(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForAmend(
      id,
      data,
      file,
      req.user,
    );
  }
  @UseGuards(AuthenticationGuard)
  @Patch('/updateDocumentForRetire/:id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  updateDocumentForRetire(
    @Body() data: any,
    @UploadedFile() file,
    @Req() req,
    @Param('id') id,
  ) {
    return this.documentsService.updateDocumentForRetire(
      id,
      data,
      file,
      req.user,
    );
  }

  // @UseGuards(AuthenticationGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string, @Req() req) {
  //   return this.documentsService.remove(id, req.user);
  // }

  @UseGuards(AuthenticationGuard)
  @Get('/getDocumentAttachmentHistory/:id')
  getDocumentAttachmentHistory(@Param('id') id) {
    return this.documentsService.getDocumentAttachmentHistory(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getEntityForDocument')
  getEntityForDocument(@Req() req) {
    return this.documentsService.getEntityForDocument(req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/createComment')
  createComment(@Body() createCommentsDto: CreateCommentDto, @Req() req) {
    return this.documentsService.createCommentOnDocument(
      req.user,
      createCommentsDto,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Delete('/deleteComment/:commentId')
  deleteComment(@Param('commentId') commentId: string) {
    return this.documentsService.deleteCommentForDocument(commentId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getCommentsForDocument/:documentId')
  getCommentsForDocument(
    @Param('documentId') documentId,
    @Query('version') version: boolean,
  ) {
    return this.documentsService.getCommentsForDocument(documentId, version);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getWorkflowHistory/:documentId')
  getWorkFlowHistory(@Param('documentId') documenId) {
    return this.documentsService.getWorkFlowHistoryforDocument(documenId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('getVersionsForDocument/:documentId')
  getVersionsForDocument(@Param('documentId') documentId) {
    return this.documentsService.getVersionsforDocument(documentId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/setStatus/:documentId')
  setStatusForDocument(
    @Query('status') status,
    @Param('documentId') documentId,

    @Req() req,
  ) {
    return this.documentsService.setStatusForDocument(
      status,
      documentId,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('/checkUserPermissions/:documentId')
  checkUserPermissions(@Req() req, @Param('documentId') documentId) {
    return this.documentsService.getApproverReviewerDocumentDetails(
      req.user,
      documentId,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Get('getDocumentsByName/:realmName')
  getDocumentsByNameSearch(
    @Query('documentName') documentName,
    @Param('realmName') realmName,
    @Req() req,
  ) {
    return this.documentsService.getReferenceDocumentSearch(
      documentName,
      realmName,
      req.user,
    );
  }

  @Get('getReferenceDocuments/forCurrentDoc/:documentId')
  getAllReferenceDocumentsForCurrentDoc(@Param('documentId') documentId) {
    return this.documentsService.getReferenceDocumentsForDocument(documentId);
  }

  @Delete('/deleteRefDoc/:id')
  deleteReferenceDocument(@Param('id') id) {
    return this.documentsService.deleteReferenceDocument(id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/:realmName/all')
  findAllDocs(@Param('realmName') realmName, @Req() req) {
    return this.documentsService.findAllDocs?.(realmName, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/fetchDocumentByEntity/:entity')
  fetchDocumentByEntity(@Param('entity') entity, @Req() req) {
    return this.documentsService.fetchDocumentByEntity(entity, req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/byEntity')
  findAllDocsByUserEntity(@Req() req) {
    return this.documentsService.findAllDocsByUserEntity(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/systems')
  systems(@Req() req) {
    return this.documentsService.systems(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/entity')
  entity(@Req() req) {
    return this.documentsService.entity(req.user.id);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/displayAllDocs')
  displayAllDocs(@Req() req) {
    return this.documentsService.displayAuditDocs(req.user.id);
  }
  // //api to get esignature
  // @UseGuards(AuthenticationGuard)
  // @Get('eSignature')
  // async docuSign() {
  //   return this.documentsService.docuSign();
  // }
  //api to get the count and data for modulewise dashboard
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocCountForDashboard')
  getMyDeptMyLocCount(@Req() req, @Query() data) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocCount`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocCount(req.user, data);
  }

  //api to get the count and data for modulewise dashboard for the current year
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocCountForDashboardForCurrentYear')
  getMyDeptMyLocCountFortheCurrentYear(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocCountforCurrentYear`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocCountForTheCurrentYear(req.user);
  }

  //api to get the count and data for revised doc
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocRevisedCountForDashboard')
  getMyDeptMyLocRevisedCount(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocRevisedCountfordashboard`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocRevisedCount(req.user);
  }

  //api to get the count and data for revison due for the current and next month
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocRevisionDueCountForDashboard')
  getMyDeptMyLocRevisionDueCount(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocRevisionCountfordashboard`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocRevisionDueCount(req.user);
  }
  //api to get the count and data of all the docs in workflow
  @UseGuards(AuthenticationGuard)
  @Get('myDeptmyLocInWorkFlowCountForDashboard')
  getMyDeptMyLocInWorkflowCount(@Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/myDeptmyLocInWorkFlowCountForDashboard`,
      'documents.controller.ts',
    );
    return this.documentsService.getMyDeptMyLocStatuswiseCount(req.user);
  }

  //api to get the chart data when filters are applied
  @UseGuards(AuthenticationGuard)
  @Get('filterChartData')
  filterChartData(@Query() queryParams: any, @Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/filterChartData`,
      'documents.controller.ts',
    );
    return this.documentsService.filterChartData(queryParams, req.user);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/:realmNames')
  findAll(
    @Param('realmNames') realName,
    @Query('filter') filter,
    @Query('page') page,
    @Query('limit') limit,
    @Req() req,
  ) {
    return this.documentsService.findAll(
      filter,
      page,
      limit,
      realName,
      req.user,
    );
  }

  @UseGuards(AuthenticationGuard)
  @Post('/publisheddocs/:orgId/:userId')
  findAllPublishedDocuments(
    @Param('orgId') orgId,
    @Param('userId') userId,
    @Body() body,
  ) {
    return this.documentsService.findAllPublishedDocuments(body, orgId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/mydocs/:orgId/:userId')
  findMyDocuments(
    @Param('orgId') orgId,
    @Param('userId') userId,
    @Body() body,
  ) {
    return this.documentsService.findMyDocuments(body, orgId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/myfavdocs/:orgId/:userId')
  findMyFavorites(
    @Param('orgId') orgId,
    @Param('userId') userId,
    @Body() body,
  ) {
    return this.documentsService.findMyFavorites(body, orgId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/distributeddocs/:orgId/:userId')
  findDistributedDocuments(
    @Param('orgId') orgId,
    @Param('userId') userId,
    @Body() body,
  ) {
    return this.documentsService.findDistributedDocuments(body, orgId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('/inworkflowdocs/:orgId/:userId')
  findInWorkflowDocuments(
    @Param('orgId') orgId,
    @Param('userId') userId,
    @Body() body,
  ) {
    return this.documentsService.findInWorkflowDocuments(body, orgId, userId);
  }

  @UseGuards(AuthenticationGuard)
  @Post('documentOBJ')
  getDocumentOBJ(@Body() requestBody, @Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents/documentOBJ`,
      'documents.controller.ts',
    );
    const documentLink = requestBody.documentLink;
    return this.ociUtils.getDocumentOBJ(documentLink, req.user, randomName);
  }

  @UseGuards(AuthenticationGuard)
  @Post('viewerOBJ')
  getViewerOBJ(@Body() requestBody, @Req() req) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents/viewerOBJ`,
      'documents.controller.ts',
    );
    const documentLink = requestBody.documentLink;
    return this.ociUtils.getViewerOBJ(documentLink, req.user, randomName);
  }

  //api to get the filter options
  @UseGuards(AuthenticationGuard)
  @Get('/getFilterOptions/:orgId')
  getFilterOptions(@Param('orgId') orgId: string, @Query() queryParams: any) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, GET /api/documents/getFilterOptions`,
      'documents.controller.ts',
    );
    return this.documentsService.getFilterOptions(orgId, queryParams);
  }
  @UseGuards(AuthenticationGuard)
  @Post('/filterByMetaData')
  filterByMetaData(@Body() body) {
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents/filterByMetaData`,
      'documents.controller.ts',
    );
    return this.documentsService.filterDocumentBasedOnMetadata(body);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAiMetaData/:documentId')
  getAiMetaDataByDocId(@Param('documentId') documentId) {
    return this.documentsService.getAiMetaDataByDocId(documentId);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getAIFlaggedCapaRefs/:orgId')
  getAIFlaggedCapaReferences(@Param('orgId') orgId, @Req() req) {
    return this.documentsService.getAIFlaggedCapaReferences(orgId, req.user);
  }

  // @UseGuards()
  // @Post('/createdoc')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: (req: any, file: any, cb) => {
  //         const realmName = req.query.realm.toLowerCase();
  //         const locationName = req.query.locationName.toLowerCase();
  //         const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
  //         if (!fs.existsSync(destination)) {
  //           fs.mkdirSync(destination, { recursive: true });
  //         }
  //         cb(null, destination);
  //       },
  //       filename: (req, file, cb) => {
  //         const randomName = uuid();
  //         cb(null, `${randomName}${extname(file.originalname)}`);
  //       },
  //     }),
  //   }),
  // )
  // async createWithoutToken(
  //   @Body() createDocumentDto: CreateDocumentDto,
  //   @UploadedFile() file,
  //   @Req() req,
  // ) {
  //   try {
  //     console.log('Received file', file);
  //     const document = await this.documentsService.create(
  //       createDocumentDto,
  //       file,
  //     );
  //     return { message: 'Document created successfully', document };
  //   } catch (error) {
  //     console.error('Error creating document:', error);
  //     throw new BadRequestException('Error creating document');
  //   }
  // }

  @UseGuards()
  @Post('/createdoc')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: any, file: any, cb: any) => {
          const realmName = req.body?.realmName?.toLowerCase(); // now from body
          let locationName = req.body?.locationName?.toLowerCase(); // now from body

          if (!realmName || !locationName) {
            return cb(
              new Error('Missing realmName or locationName in body'),
              '',
            );
          }
          locationName = locationName.replace(/\s+/g, '_');
          const destination = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }

          cb(null, destination);
        },
        filename: (req, file, cb) => {
          const shortUUID = uuidv4().split('-')[0]; // shortened UUID
          const originalName = file.originalname.split(' ').join('_'); // sanitize
          const baseName = basename(originalName, extname(originalName));
          const extension = extname(originalName);
          const newName = `${baseName}__${shortUUID}${extension}`; // e.g. file__a1b2c3.pdf

          cb(null, newName);
        },
      }),
    }),
  )
  createWithoutToken(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    // console.log('api called');
    return this.documentsService.createForBulkUploadPython(
      createDocumentDto,
      file,
    );
  }

  @UseGuards()
  @Put('/updateProcessStatusByDocUrl')
  updateProcessStatusByDocUrl(@Body() body) {
    console.log('body', body);
    return this.documentsService.updateProcessStatusByDocUrl(body);
  }
  @UseGuards(AuthenticationGuard)
  @Get('/getDocumentsForDownload/:orgId/:batchId')
  getDocumentsForDownload(@Param('orgId') orgId, @Param('batchId') batchId) {
    return this.documentsService.getDocumentsForDownload(orgId, batchId);
  }

  @UseGuards()
  @Get('/getDocProcessingStatus/:batchId')
  getCountAndStatusByBatchId(@Param('batchId') batchId) {
    return this.documentsService.getCountAndStatusByBatchId(batchId);
  }

  @UseGuards()
  @Post('/bulkCreateDocProcesses')
  bulkCreateDocProcesses(@Body() body) {
    return this.documentsService.bulkCreateDocProcesses(body);
  }

  @UseGuards(AuthenticationGuard)
  @Get('/getJobSummary/:orgId')
  getJobSummary(@Param('orgId') orgId) {
    return this.documentsService.getJobSummary(orgId);
  }
}
