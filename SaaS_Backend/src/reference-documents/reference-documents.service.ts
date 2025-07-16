import {
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { referenceDocuments } from './schema/reference-documents.schema';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
import { EmailService } from 'src/email/email.service';
import { CreateReferenceDocumentDto } from './dto/create-reference-documents.dto';
import { UpdateReferenceDocumentDto } from './dto/update-reference-documents.dto';
import st = require('stream');
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';
import { v4 as uuid } from 'uuid';

@Injectable()
export class referenceDocumentsService {
    constructor(
        @InjectModel(referenceDocuments.name) private referenceDocumentsModel: Model<referenceDocuments>,
        @Inject('Logger') private readonly logger: Logger,
        private readonly emailService: EmailService,
        private prisma: PrismaService,
    ) { }

    async createReferenceDocument(createReferenceDocumentDto: CreateReferenceDocumentDto, file, user, randomNumber) {
        try {
            const activeUser = await this.prisma.user.findFirst({
                where: {
                    kcId: user.id,
                },
                include:{organization:true}
            });

            let payload = JSON.parse(JSON.stringify(createReferenceDocumentDto));

            let {
                realmName,
                topic,
                creatorId,
                creatorName,
                location,
                documentLink
            } = payload

            if (process.env.IS_OBJECT_STORE === 'true' && file) {
                documentLink = await this.addDocumentToOS(file, location);
            }

            const organization = await this.prisma.organization.findFirst({
                where: {
                    realmName: realmName,
                },
            });

            let locationName
            if (location.length > 1) {
                locationName = "Multi/Reference-Documents/" + location.map((item: any) => item.locationId).join('-') + "-"
            } else {
                locationName = location[0].locationName + "/Reference-Documents/"
            }

            let body: any = {
                organizationId: activeUser.organizationId,
                topic: topic,
                creator: {
                    id: creatorId,
                    creatorName: creatorName
                },
                location: location,
                documentLink: file
                    ? process.env.IS_OBJECT_STORE === 'true'
                        ? documentLink
                        : `${process.env.SERVER_IP
                        }/${activeUser.organization.realmName.toLowerCase()}/${locationName.toLowerCase()}${file.filename
                        }`
                    : '',
            }

            await this.referenceDocumentsModel.create(body)

            this.logger.log(
                `trace id=${randomNumber}, POST /api/referenceDocuments payload = payload Successful`,
                'reference-documents.service'
            );
        } catch (error) {
            this.logger.error(
                `trace id=${randomNumber}, POST /api/referenceDocuments payload = payload Failed`,
                'reference-documents.service'
            );
            throw new InternalServerErrorException(error);
        }
    }

    async getAllReferenceDocuments(user, data, randomNumber) {
        try {
            const { page, limit, search } = data;
            const activeUser = await this.prisma.user.findFirst({
                where: {
                    kcId: user.id,
                },
            });
            const orgAdminRole = await this.prisma.role.findFirst({
                where: {
                    roleName: 'ORG-ADMIN'
                },
                select: {
                    id: true
                }
            })

            const referenceQuery = () => {
                let standardQuery: any = {
                    organizationId: activeUser.organizationId,
                };

                if (search !== undefined && search !== 'undefined') {
                    const searchArray = search.split(',').map(value => value.trim());
                    const searchRegex = new RegExp(searchArray.join('|'), 'i');

                    if (searchArray.length > 1) {
                        standardQuery = {
                            ...standardQuery,
                            $or: [
                                { 'topic': { $regex: searchRegex } },
                                { 'creator.creatorName': { $in: searchArray } },
                                { 'location.locationName': { $regex: searchRegex } },
                            ],
                        };
                    } else {
                        standardQuery = {
                            ...standardQuery,
                            $or: [
                                { 'topic': { $regex: search, $options: 'i' } },
                                { 'creator.creatorName': { $regex: search, $options: 'i' } },
                                { 'location.locationName': { $regex: search, $options: 'i' } },
                            ]
                        };
                    }
                }
                return standardQuery;
            }

            let query = referenceQuery()
            let totalDocuments = await this.referenceDocumentsModel.count(query);
            const allDocuments = await this.referenceDocumentsModel.find(query)
                .skip((page - 1) * limit)
                .limit(limit).lean();

            const allLocations = await (await this.referenceDocumentsModel.find({
                organizationId: activeUser.organizationId,
            })).flatMap(obj => obj.location);
            const uniqueLocationsSet = new Set();
            allLocations.forEach(locationObj => {
                uniqueLocationsSet.add(locationObj.locationName);
            });

            const referenceArray = []
            for (let refDoc of allDocuments) {
                const creatorInfo = await this.prisma.user.findFirst({
                    where: {
                        id: refDoc.creator.id
                    },
                    select: {
                        roleId: true
                    }
                })
                const isCreatorOrgAdmin = creatorInfo.roleId.includes(orgAdminRole.id)
                    referenceArray.push({
                        ...refDoc,
                        ...(user.kcRoles.roles.includes('ORG-ADMIN') || ((user.kcRoles.roles.includes('MR') && !isCreatorOrgAdmin && (activeUser.locationId === refDoc.location[0].id))) ? { editAccess: true } : {}),
                    })
            };

            const result = {
                data: referenceArray,
                count: totalDocuments,
                allLocations: Array.from(uniqueLocationsSet),
            };

            this.logger.log(
                `trace id=${randomNumber}, GET /api/referenceDocuments/getAllReferenceDocuments Successful`,
                'reference-documents.service'
            );

            return result
        } catch (error) {
            this.logger.error(
                `trace id=${randomNumber}, GET /api/referenceDocuments/getAllReferenceDocuments Failed`,
                'reference-documents.service'
            );
            throw new NotFoundException(error);
        }
    }

    async getReferenceDocumentById(id, user, randomNumber) {
        try {
            const getDocumentById = await this.referenceDocumentsModel.findById(id)

            this.logger.log(
                `trace id=${randomNumber}, GET /api/referenceDocuments/getReferenceDocumentById/${id} Successful`,
                'reference-documents.service'
            );

            return getDocumentById
        } catch (error) {
            this.logger.error(
                `trace id=${randomNumber}, GET /api/referenceDocuments/getReferenceDocumentById/${id} Failed`,
                'reference-documents.service'
            );
            throw new NotFoundException(error);
        }
    }

    async updateReferenceDocument(id, updateReferenceDocumentDto: UpdateReferenceDocumentDto, file, user, randomNumber) {
        try {
            const activeUser = await this.prisma.user.findFirst({
                where: {
                    kcId: user.id,
                },
                include:{organization:true}
            });

            let payload = JSON.parse(JSON.stringify(updateReferenceDocumentDto));

            let {
                realmName,
                topic,
                creatorId,
                creatorName,
                location,
                documentLink
            } = payload

            if (process.env.IS_OBJECT_STORE === 'true' && file) {
                documentLink = await this.addDocumentToOS(file, location);
            }

         
            let locationName
            if (location.length > 1) {
                locationName = "Multi/Reference-Documents/" + location.map((item: any) => item.locationId).join('-') + "-"
            } else {
                locationName = location[0].locationName + "/Reference-Documents/"
            }

            let body: any = {
                organizationId: activeUser.organizationId,
                topic: topic,
                creator: {
                    id: creatorId,
                    creatorName: creatorName
                },
                location: location,
                documentLink: file
                    ? process.env.IS_OBJECT_STORE === 'true'
                        ? documentLink
                        : `${process.env.SERVER_IP
                        }/${activeUser.organization.realmName.toLowerCase()}/${locationName.toLowerCase()}${file.filename
                        }`
                    : '',
            }

            const update = await this.referenceDocumentsModel.findByIdAndUpdate(id, body)

            this.logger.log(
                `trace id=${randomNumber}, PUT /api/referenceDocuments/${id} Successful`,
                'reference-documents.service'
            );
        } catch (error) {
            this.logger.error(
                `trace id=${randomNumber}, PUT /api/referenceDocuments/${id} Failed`,
                'reference-documents.service'
            );
            throw new InternalServerErrorException(error);
        }
    }

    async deleteReferenceDocument(id, user, randomNumber) {
        try {
            console.log("ID",id);
            const deleteDocument = await this.referenceDocumentsModel.findByIdAndRemove(id)

            this.logger.log(
                `trace id=${randomNumber}, DELETE /api/referenceDocuments/${id} Successful`,
                'reference-documents.service'
            );
        } catch (error) {
            this.logger.error(
                `trace id=${randomNumber}, DELETE /api/referenceDocuments/${id} Failed`,
                'reference-documents.service'
            );
            throw new InternalServerErrorException(error);
        }
    }

    async streamToBuffer(stream: st.Readable): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];

            stream.on('data', (chunk) => {
                chunks.push(Buffer.from(chunk));
            });

            stream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });

            stream.on('error', (error) => {
                reject(error);
            });
        });
    }

    async addDocumentToOS(file, location) {
        const fs = require('fs');
        const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
            where: {
                sourceName: process.env.CONNECTED_APPS_OB,
            },
        });

        const tenancy = getObjectStoreContents.clientId;
        const userId = Buffer.from(getObjectStoreContents.user, 'base64').toString(
            'ascii',
        );
        const fingerprint = Buffer.from(
            getObjectStoreContents.password,
            'base64',
        ).toString('ascii');
        let privateKey =
            '-----BEGIN PRIVATE KEY-----\n' +
            Buffer.from(getObjectStoreContents.clientSecret, 'base64')
                .toString('ascii')
                .replace(/ /g, '\n') +
            '\n-----END PRIVATE KEY-----';
        const passphrase = null;
        const region = common.Region.fromRegionId(process.env.REGION);
        const provider = new common.SimpleAuthenticationDetailsProvider(
            tenancy,
            userId,
            fingerprint,
            privateKey,
            passphrase,
            region,
        );

        const client = new objectstorage.ObjectStorageClient({
            authenticationDetailsProvider: provider,
        });

        let locationName
        if (location.length > 1) {
            locationName = "Multi/Reference-Documents/" + location.map((item: any) => item.locationId).join('-') + "-"
        } else {
            locationName = location[0].locationName + "/Reference-Documents/"
        }
        const bucketName = process.env.BUCKET_NAME;
        const objectName =
            process.env.OB_ORG_NAME +
            locationName +
            uuid() +
            '-' +
            file.originalname;
        let contentType;
        if (file.originalname.split('.').pop() === 'pdf') {
            contentType = 'application/pdf';
        }
        if (file.originalname.split('.').pop() === 'docx') {
            contentType =
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }

        const fileContent = fs.readFileSync(file.path);
        client.putObject({
            namespaceName: process.env.NAMESPACE,
            bucketName: bucketName,
            objectName: objectName,
            putObjectBody: fileContent,
            contentType: contentType,
        });

        return objectName;
    }

    async getDocumentOBJ(documentLink, uuid) {
        this.logger.log(
            `trace id = ${uuid} Getting Document for Download from Object Storage`,
            'document.service.ts',
        );
        try {
            const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
                where: {
                    sourceName: process.env.CONNECTED_APPS_OB,
                },
            });
            const tenancy = getObjectStoreContents.clientId;
            const userId = Buffer.from(
                getObjectStoreContents.user,
                'base64',
            ).toString('ascii');
            const fingerprint = Buffer.from(
                getObjectStoreContents.password,
                'base64',
            ).toString('ascii');
            let privateKey =
                '-----BEGIN PRIVATE KEY-----\n' +
                Buffer.from(getObjectStoreContents.clientSecret, 'base64')
                    .toString('ascii')
                    .replace(/ /g, '\n') +
                '\n-----END PRIVATE KEY-----';
            const passphrase = null;
            const region = common.Region.fromRegionId(process.env.REGION);

            const provider = new common.SimpleAuthenticationDetailsProvider(
                tenancy,
                userId,
                fingerprint,
                privateKey,
                passphrase,
                region,
            );
            const client = new objectstorage.ObjectStorageClient({
                authenticationDetailsProvider: provider,
            });

            const bucketName = process.env.BUCKET_NAME;
            const objectName = documentLink;

            const getObjectContent = await client.getObject({
                namespaceName: process.env.NAMESPACE,
                bucketName: bucketName,
                objectName: objectName,
            });

            const buffer = await this.streamToBuffer(
                getObjectContent.value as st.Readable,
            );

            this.logger.log(
                `trace id = ${uuid} Getting Document for Download from Object Storage Sucessful`,
                'document.service.ts',
            );
            return buffer;
        } catch {
            this.logger.log(
                `trace id = ${uuid} Getting Document for Download from Object Storage Failed`,
                'document.service.ts',
            );
        }
    }

    async getViewerOBJ(documentLink, uuid) {
        console.log('documentLink in getViewerObj', documentLink);
        this.logger.log(
            `trace id = ${uuid} Getting Document for Viewing from Object Storage`,
            'document.service.ts',
        );
        try {
            const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
                where: {
                    sourceName: process.env.CONNECTED_APPS_OB,
                },
            });
            const tenancy = getObjectStoreContents.clientId;
            const userId = Buffer.from(
                getObjectStoreContents.user,
                'base64',
            ).toString('ascii');
            const fingerprint = Buffer.from(
                getObjectStoreContents.password,
                'base64',
            ).toString('ascii');
            let privateKey =
                '-----BEGIN PRIVATE KEY-----\n' +
                Buffer.from(getObjectStoreContents.clientSecret, 'base64')
                    .toString('ascii')
                    .replace(/ /g, '\n') +
                '\n-----END PRIVATE KEY-----';
            const passphrase = null;
            const region = common.Region.fromRegionId(process.env.REGION);
            const provider = new common.SimpleAuthenticationDetailsProvider(
                tenancy,
                userId,
                fingerprint,
                privateKey,
                passphrase,
                region,
            );
            const client = new objectstorage.ObjectStorageClient({
                authenticationDetailsProvider: provider,
            });

            const bucketName = process.env.BUCKET_NAME;
            const objectName = documentLink;

            const date = new Date();

            const createPreauthenticatedRequestDetails = {
                name: 'par-object-' + date,
                objectName: objectName,
                accessType:
                    objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType
                        .AnyObjectRead,
                timeExpires: new Date(Date.now() + 30000),
            };

            const createPreauthenticatedRequestRequest: objectstorage.requests.CreatePreauthenticatedRequestRequest =
            {
                namespaceName: process.env.NAMESPACE,
                bucketName: bucketName,
                createPreauthenticatedRequestDetails:
                    createPreauthenticatedRequestDetails,
            };

            const createPreauthenticatedRequestResponse =
                await client.createPreauthenticatedRequest(
                    createPreauthenticatedRequestRequest,
                );
            this.logger.log(
                `trace id = ${uuid} Getting Document for Viewing from Object Storage Sucessful`,
                'document.service.ts',
            );
            return (
                createPreauthenticatedRequestResponse.preauthenticatedRequest.fullPath +
                objectName
            );
        } catch {
            this.logger.log(
                `trace id = ${uuid} Getting Document for Viewing from Object Storage Failed`,
                'document.service.ts',
            );
        }
    }
}