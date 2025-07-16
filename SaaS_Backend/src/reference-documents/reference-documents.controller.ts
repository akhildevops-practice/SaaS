import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    UseGuards,
    Param,
    Delete,
    Inject,
    Put,
    UploadedFile,
    UseInterceptors,
    Query,
} from '@nestjs/common';
import { referenceDocumentsService } from './reference-documents.service';
import { CreateReferenceDocumentDto } from './dto/create-reference-documents.dto';
import { UpdateReferenceDocumentDto } from './dto/update-reference-documents.dto';
import { AuthenticationGuard } from '../authentication/authentication.guard';
import { Logger } from 'winston';
import { v4 as uuid } from 'uuid';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

const fs = require('fs');
@Controller('/api/referenceDocuments')
export class referenceDocumentsController {
    constructor(
        private readonly referenceDocumentsService: referenceDocumentsService,
        @Inject('Logger') private readonly logger: Logger,
    ) { }

    @UseGuards(AuthenticationGuard)
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req: any, file: any, cb: any) => {
                const realmName = req.query.realmName.toLowerCase();
                const destination = `${process.env.FOLDER_PATH}/${realmName}/reference-documents`;
                if (!fs.existsSync(destination)) {
                    fs.mkdirSync(destination, { recursive: true });
                }
                cb(null, destination);
            },
            filename: (req, file, cb) => {
                const randomName: string = uuid();
                cb(null, `${randomName}-${file.originalname}`);
            },
        })
    }))
    createReferenceDocument(
        @Body() createReferenceDocumentDto: CreateReferenceDocumentDto,
        @UploadedFile() file,
        @Req() req,
    ) {
        const randomNumber: string = uuid();
        this.logger.log(
            `trace id=${randomNumber}, POST /api/referenceDocuments payload = payload`,
            'reference-documents.controller'
        );
        return this.referenceDocumentsService.createReferenceDocument(createReferenceDocumentDto, file, req.user, randomNumber);
    }

    @UseGuards(AuthenticationGuard)
    @Get('/getAllReferenceDocuments')
    getAllReferenceDocuments(
        @Req() req,
        @Query() data,
    ) {
        const randomNumber: string = uuid();
        this.logger.log(
            `trace id=${randomNumber}, GET /api/referenceDocuments/getAllReferenceDocuments`,
            'reference-documents.controller'
        );
        return this.referenceDocumentsService.getAllReferenceDocuments(req.user, data, randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Get('/getReferenceDocumentById/:id')
    getReferenceDocumentById(@Param('id') id, @Req() req) {
        const randomNumber: string = uuid();
        this.logger.log(
            `trace id=${randomNumber}, GET /api/referenceDocuments/getReferenceDocumentById/${id}`,
            'reference-documents.controller'
        );
        return this.referenceDocumentsService.getReferenceDocumentById(id, req.user, randomNumber)
    }

    @UseGuards(AuthenticationGuard)
    @Put(':id')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req: any, file: any, cb: any) => {
                const realmName = req.query.realmName.toLowerCase();
                const destination = `${process.env.FOLDER_PATH}/${realmName}/reference-documents`;
                if (!fs.existsSync(destination)) {
                    fs.mkdirSync(destination, { recursive: true });
                }
                cb(null, destination);
            },
            filename: (req, file, cb) => {
                const randomName: string = uuid();
                cb(null, `${randomName}-${file.originalname}`);
            },
        })
    }))
    updateReferenceDocument(
        @Param('id') id,
        @Body() updateReferenceDocumentDto: UpdateReferenceDocumentDto,
        @UploadedFile() file,
        @Req() req,
    ) {
        const randomNumber: string = uuid();
        this.logger.log(
            `trace id=${randomNumber}, PUT /api/referenceDocuments/${id} payload = payload`,
            'reference-documents.controller'
        );
        return this.referenceDocumentsService.updateReferenceDocument(id, updateReferenceDocumentDto, file, req.user, randomNumber);
    }

    @UseGuards(AuthenticationGuard)
    @Delete(':id')
    deleteReferenceDocument(@Param('id') id, @Req() req) {
        const randomNumber: string = uuid();
        this.logger.log(
            `trace id=${randomNumber}, DELETE /api/referenceDocuments/${id}`,
            'reference-documents.controller'
        );
        return this.referenceDocumentsService.deleteReferenceDocument(id, req.user, randomNumber)
    }

}