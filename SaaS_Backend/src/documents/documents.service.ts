import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  ForbiddenException,
  InternalServerErrorException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as sgMail from '@sendgrid/mail';
import { CreateDocumentDto } from './dto/create-document.dto';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Logger } from 'winston';
import { ObjectStore } from 'src/object-store/schema/object-store.schema';
const fs = require('fs');
const path = require('path');

import {
  generateNumbering,
  documentAdminsCreator,
  adminsSeperators,
  sendRevisionReminderMail,
  sendMailForApproval,
  sendMailForReview,
  sendMailForEdit,
  sendMailPublishedForAdmins,
  sendMailPublishedForDocumentAdmins,
  prefixAndSuffix,
} from './utils';
import { queryGeneartorForDocumentsFilter } from '../utils/filterotherway';
import { CreateDoctypeDto } from '../doctype/dto/create-doctype.dto';
import { CreateCommentDto } from './dto/create-document-comment.dto';
import { CreateReferenceDocumentsDto } from './dto/createReferenceDocument.dto';
import { UserService } from 'src/user/user.service';
import { Document, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { sendMailPublished } from './utils';
import { RefsService } from 'src/refs/refs.service';
import { EntityService } from 'src/entity/entity.service';
import { NotEquals } from 'class-validator';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { v4 as uuid } from 'uuid';
import { Refs, RefsSchema } from 'src/refs/schema/refs.schema';
import { EmailService } from 'src/email/email.service';
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';
import st = require('stream');
import { OrganizationService } from 'src/organization/organization.service';
import * as https from 'https';
import { doc } from 'prettier';
import { ChartFilter } from './dto/chartfilter.dto';
import { createHash } from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';

import { aiMetaData } from './schema/ai_metadata.schema';
import { docProcess } from './schema/docprocess.schema';
import auditTrailWatcher from '../watcher/changesStream';
import e = require('express');
import { License } from 'src/license/schema/license.schema';
import { LicenseService } from 'src/license/license.service';
import { Documents } from './schema/document.schema';
import { Doctype } from 'src/doctype/schema/doctype.schema';
import { DocumentAttachmentHistory } from './schema/DocumentAttachmentHistory.schema';
import { AdditionalDocumentAdmins } from './schema/AdditionalDocAdmins.schema';
import { OciUtils } from './oci_utils';
import { DocUtils } from './doc_utils';
import { docWorkflowHistoy } from './schema/docWorkflowHistory.schema';
import { DocumentComments } from './schema/DocumentComments.schema';

// { name: Refs.name, schema: RefsSchema },

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(System.name) private System: Model<SystemDocument>,
    // @InjectModel(Refs.name) private refsModel: Model<Refs>,
    private readonly userService: UserService,
    private refsService: RefsService,
    private readonly entityService: EntityService,
    private readonly serialNumberService: SerialNumberService,
    private readonly emailService: EmailService,
    private readonly organizationService: OrganizationService,
    @InjectModel(aiMetaData.name)
    private aiMetaDataDocumentModel: Model<aiMetaData>,
    @InjectModel(docProcess.name)
    private docProcessModel: Model<docProcess>,
    @InjectModel(ObjectStore.name)
    private ObjectStoreModel: Model<ObjectStore>,
    @InjectModel(Doctype.name)
    private doctypeModel: Model<Doctype>,
    @InjectModel(DocumentAttachmentHistory.name)
    private documentAttachmentHistoryModel: Model<DocumentAttachmentHistory>,
    @InjectModel(docWorkflowHistoy.name)
    private docWorkflowHistoyModel: Model<docWorkflowHistoy>,
    @InjectModel(AdditionalDocumentAdmins.name)
    private additionalDocumentAdminsModel: Model<DocumentAttachmentHistory>,
    @InjectModel(Refs.name) private refsModel: Model<Refs>,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(License.name)
    private readonly licenseModel: Model<License>,
    private readonly licenseService: LicenseService,
    @InjectModel(Documents.name)
    private documentModel: Model<Documents>,
    @InjectModel(DocumentComments.name)
    private documentCommentsModel: Model<DocumentComments>,
    private readonly ociUtils: OciUtils,
    private readonly docUtils: DocUtils,
  ) {}

  async createOld(createDocumentDto: CreateDocumentDto, file, user) {
    const randomNumber = uuid();

    // try {
    //GET THE CURRENT ACTIVE USER
    //GET THE CURRENT ACTIVE USER
    let activeUser;
    if (!!user?.id) {
      activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
    } else {
      activeUser = await this.prisma.user.findFirst({
        where: {
          id: createDocumentDto?.createdBy,
        },
      });
    }
    // const userCount: any = await this.licenseService.getRealmLicenseCount(
    //   activeUser?.organizationId,
    // );
    // console.log('usercount', userCount);
    // if (userCount?.authorizedDocs > userCount?.addedDocs) {
    // console.log('inside if');

    // const auditTrail = await auditTrailWatcher(
    //   'Documents',
    //   'Document Control',
    //   'Documents',
    //   user,
    //   activeUser,
    //   '',
    // );
    let payload = JSON.parse(JSON.stringify(createDocumentDto));
    let {
      documentName,
      description,
      documentState,
      documentVersions,
      doctypeId,
      reasonOfCreation,
      documentLink,
      effectiveDate,
      currentVersion,
      tags,
      realmName,
      additionalReaders,
      creators,
      reviewers,
      approvers,
      locationId,
      entityId,
      referenceDocuments,
      systems,
      doctypeName,
      docsClassification,
      distributionList,
      distributionUsers,
      readAccess,
      readAccessUsers,
      refsData,
      locationName,
      section,
      // documentNumbering,
    } = payload;
    this.logger.log(
      `trace id=${randomNumber} Post api/documents service started with Data ${payload}`,
      '',
    );

    let hashValue = '';
    if (process.env.IS_OBJECT_STORE === 'true' && file) {
      documentLink = await this.ociUtils.addDocumentToOS(
        file,
        activeUser,
        locationName,
      );
    }
    if (file) {
      const fileContent = fs.readFileSync(file.path);
      const hash = createHash('sha256');
      hash.update(fileContent);
      hashValue = hash.digest('hex');
    }
    //if no file while creating then send error

    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });
    //GET THE CURRENT ACTIVE USER
    //  / const activeUser = await this.prisma.user.findFirst({
    //     where: {
    //       kcId: user.id,
    //     },
    //   });

    // if (!activeUser.entityId) {
    //   throw new NotFoundException(
    //     'No department found for the particular user',
    //   );
    // }
    // GETTING ACTIVE USERS DEPARTMENT
    const activeUserDept = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
    });
    const entityInfo = await this.prisma.entity.findFirst({
      where: {
        id: entityId,
      },
    });

    //write document numbering logic
    //find the doctype and check numbering

    const doctype = await this.prisma.doctype.findFirst({
      where: {
        id: doctypeId,
      },
    });
    // //////////////console.log('documents doctype', doctype);
    let location;
    if (activeUser.userType !== 'globalRoles') {
      location = await this.prisma.location.findFirst({
        where: {
          // id: doctype.locationId,
          id: activeUser.locationId,
        },
      });
    } else {
      location = await this.prisma.location.findFirst({
        where: {
          // id: doctype.locationId,
          id: entityInfo.locationId,
        },
      });
    }

    const versionInfo = [
      {
        type: 'CREATOR',
        id: activeUser.id,
        name: activeUser.firstname + ' ' + activeUser.lastname,
        documentLink: file
          ? process.env.IS_OBJECT_STORE === 'true'
            ? documentLink
            : `${
                process.env.SERVER_IP
              }/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                file.filename
              }`
          : documentLink,
        docCode: hashValue,
      },
    ];

    // Create document
    const randomName: string = uuid();
    this.logger.log(
      `trace id=${randomName}, POST /api/documents payload=${payload} `,
      '',
    );

    let reviewersData = [];
    let approversData = [];

    if (
      reviewers !== undefined &&
      reviewers !== 'undefined' &&
      reviewers?.length > 0
    ) {
      reviewersData = reviewers?.map((value) => value?.id);
    }

    if (
      approvers !== undefined &&
      approvers !== 'undefined' &&
      approvers?.length > 0
    ) {
      approversData = approvers?.map((value) => value?.id);
    }
    let creatorLocation;
    if (activeUser.userType === 'globalRoles') {
      creatorLocation = entityInfo.locationId;
    } else {
      creatorLocation = locationId;
    }
    let body: any = {
      data: {
        doctype: {
          connect: {
            id: doctypeId,
          },
        },
        organization: {
          connect: {
            id: organization.id,
          },
        },
        description: description,
        documentName: documentName,
        documentState: documentState,
        reviewers: reviewersData,
        approvers: approversData,
        creators: [activeUser?.id],
        currentVersion: 'A',
        tags: tags,
        documentLink: file
          ? process.env.IS_OBJECT_STORE === 'true'
            ? documentLink
            : `${
                process.env.SERVER_IP
              }/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                file.filename
              }`
          : documentLink,
        // documentNumbering: documentNumbering || '',
        issueNumber: '001',
        reasonOfCreation: reasonOfCreation,
        system: systems,
        docType: doctypeName,
        documentClassification: docsClassification,
        // clause,
        distributionList,
        distributionUsers,
        readAccess,
        readAccessUsers,
        isVersion: false,
        creatorLocation: {
          connect: {
            id: creatorLocation,
          },
        },

        creatorEntity: {
          connect: {
            id: entityId,
          },
        },
        createdBy: activeUser.id,
        // deleted: false,
        section: section,
        revisionReminderFlag: false,
        countNumber: 1,
        versionInfo,
        // documentNumbering,
      },
    };

    const createDocument = await this.prisma.documents.create(body);
    if (documentLink != null) {
      const attachRec = await this.prisma.documentAttachmentHistory.create({
        data: {
          documentId: createDocument.id,
          updatedLink: createDocument.documentLink,
          updatedBy: createDocument.createdBy,
        },
      });
    }

    const data = {
      moduleType: doctype.id,
      prefix: doctype.prefix,
      suffix: doctype.suffix,
      loScation: locationId,
      createdBy: null,
      organizationId: organization.id,
    };

    try {
      const checkprefixsuffix = await this.prisma.prefixSuffix.findFirst({
        where: {
          moduleType: doctype.id,
          location: locationId,
        },
      });
      if (!checkprefixsuffix) {
        const createPrefixSufix =
          await this.serialNumberService.createPrefixSuffix(data);
      }
    } catch (error) {}

    if (refsData && refsData.length > 0) {
      const refs = refsData.map((ref: any) => ({
        ...ref,
        refTo: createDocument.id,
      }));

      const createRefs = await this.refsService.create(refs);
    }

    //first create document admins--- creator
    try {
      if (referenceDocuments) {
        for (let i = 0; i < referenceDocuments.length; i++) {
          const createRefDoc = await this.prisma.referenceDocuments.create({
            data: {
              version: referenceDocuments[i].currentVersion,
              type: referenceDocuments[i].type,
              documentLink: referenceDocuments[i].documentLink,
              documentName: referenceDocuments[i].documentName,
              referenceDocId: referenceDocuments[i].id,
              document: {
                connect: {
                  id: createDocument.id,
                },
              },
            },
          });
        }
      }

      const creator = [
        {
          userId: activeUser.id,
          firstname: activeUser.firstname,
          lastname: activeUser.lastname,
          email: activeUser.email,
        },
      ];
      if (reviewers !== 'undefined' && reviewers.length > 0) {
        // for (let reviewData of reviewers) {
        const reviwerData = reviewers.map((value: any) => value.id);
        const reviewUser = await this.prisma.user.findMany({
          where: { id: { in: reviwerData } },
        });
        const linkDocumentWithReviewers = await documentAdminsCreator(
          reviewUser,
          this.prisma.additionalDocumentAdmins,
          createDocument.id,
          'REVIEWER',
        );
        // }
      }

      if (approvers !== 'undefined' && approvers.length > 0) {
        // for (let approveData of approvers) {
        const approverData = approvers.map((value) => value.id);

        const approverUserData = await this.prisma.user.findMany({
          where: { id: { in: approverData } },
        });
        const linkDocumentWithApprovers = await documentAdminsCreator(
          approverUserData,
          this.prisma.additionalDocumentAdmins,
          createDocument.id,
          'APPROVER',
        );
        // }
      }

      const linkDocumentWithCreator = await documentAdminsCreator(
        creator,
        this.prisma.additionalDocumentAdmins,
        createDocument.id,
        'CREATOR',
      );

      if (readAccess === 'Selected Users') {
        if (readAccessUsers?.length > 0) {
          const userids = readAccessUsers.map((value) => value.id);
          let usersarray = await this.prisma.user.findMany({
            where: { id: { in: userids } },
          });
          //////////////console.log('userarray', usersarray);
          const linkDoctypeWithReaders = await documentAdminsCreator(
            usersarray,
            this.prisma.additionalDocumentAdmins,
            createDocument.id,
            'READER',
          );
        }
      }
      //console.log('document state ', createDocument.documentState);
      const createWorkFlowHistory =
        await this.prisma.documentWorkFlowHistory.create({
          data: {
            actionName: createDocument.documentState,
            user: {
              connect: {
                id: activeUser.id,
              },
            },
            actionBy: activeUser.email,

            document: {
              connect: {
                id: createDocument.id,
              },
            },
          },
        });
      const createddocument = await this.prisma.documents.findFirst({
        where: {
          id: createDocument.id,
        },
        include: {
          creatorEntity: true,
          creatorLocation: true,
          AdditionalDocumentAdmins: { include: { user: true } },
          organization: true,
        },
      });
      if (createDocument.documentState === 'IN_REVIEW') {
        //documentstate changed from draft to in review on send for review by creator, send mail to all reviewers for this doc
        const createdBy = await this.prisma.documentWorkFlowHistory.findFirst({
          where: {
            documentId: createDocument.id,
          },
          select: {
            actionBy: true,
            actionName: true,
            userId: true,
          },
        });
        // //console.log('createdby', createdBy);
        const user = await this.prisma.user.findUnique({
          where: {
            id: createdBy.userId,
          },
        });
        // //console.log('user', user);
        const mailRecipients =
          await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [
                { documentId: createDocument.id },
                // { NOT: { userId: createdBy.userId } },
                { type: 'REVIEWER' },
              ],
            },
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          });
        // //console.log('mailrecipients', mailRecipients);
        for (let users of mailRecipients) {
          await sendMailForReview(
            user,
            users,
            createddocument,
            this.emailService.sendEmail,
          );
        }
      }
    } catch (err) {
      const deleteTheCreatedDocument = await this.prisma.documents.delete({
        where: {
          id: createDocument.id,
        },
      });

      throw new BadRequestException(err);
    }
    this.logger.log(
      `trace id=${randomNumber} Post api/documents service successful`,
      '',
    );
    //update doc count in realm license
    await this.licenseModel.findOneAndUpdate(
      { organizationId: organization.id },
      { $inc: { addedDocs: 1 } },
      { new: true },
    );
    return {
      ...createDocument,
    };
    // }
    //  else {
    //   throw new NotFoundException();
    // }
    // } catch (err) {
    //   this.logger.error(
    //     `trace id=${randomNumber} Post api/documents  service failed ${err}`,
    //     '',
    //   );
    // }
  }

  async create(body: CreateDocumentDto, file) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Post api/documents service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );
      let hashValue = '',
        documentLink = '';
      // console.log('body', body, file);
      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');
        if (process.env.IS_OBJECT_STORE === 'true' && file) {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }
      }
      const docType = await this.doctypeModel.findById(body.doctypeId);
      // console.log('doctype in create', body.doctypeId);
      const rawDistributionList = body.distributionList;
      let parsedDistributionList;
      try {
        parsedDistributionList = JSON.parse(rawDistributionList);
      } catch (e) {
        this.logger.error(`invalid distribution type error:${e}`);
      }
      const rawReadAccessList = body.readAccess;
      let parsedAccessList;
      try {
        parsedAccessList = JSON.parse(rawReadAccessList);
      } catch (e) {
        this.logger.error(`invalid distribution type error:${e}`);
      }
      const rawWorkflowDetails: any = body.workflowDetails;
      let parsedWorkflowDetails;
      try {
        parsedWorkflowDetails = JSON.parse(rawWorkflowDetails);
      } catch (e) {
        this.logger.error(`invalid workflowDetails type error:${e}`);
      }
      const createDocument = await this.documentModel.create({
        ...body,
        distributionList: parsedDistributionList,
        readAccess: parsedAccessList,
        workflowDetails: parsedWorkflowDetails,
        documentLink: documentLink,
        issueNumber: body?.issueNumber
          ? body?.issueNumber
          : docType?.initialVersion,
        countNumber: 1,
        isVersion: false,
        revisionReminderFlag: false,
        currentVersion: docType?.versionType === 'Numeric' ? '0.0' : 'A',
      });

      await this.docUtils.createEntryInDocWorkflowHistory(
        createDocument.id,
        body?.createdBy,
        'Created',
      );

      this.logger.log(
        `trace id=${randomNumber} Document created successfully with ID: ${createDocument.id}`,
        '',
      );
      if (!!documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          createDocument.id,
          documentLink,
          body?.createdBy,
        );
      }
      if (body?.refsData && body?.refsData.length > 0) {
        const refs = body?.refsData.map((ref: any) => ({
          ...ref,
          refTo: createDocument.id,
        }));
        await this.refsService.create(refs);
      }
      return createDocument;
      //creating entry in workflow history for DRAFT state  ----TODO
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST /api/documents service failed: ${
          error.message || error
        }`,
        '',
      );
      throw new InternalServerErrorException(
        error.message || 'Failed to create document.',
      );
    }
  }

  async createForBulkUploadPython(body: CreateDocumentDto, file) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Post api/documents/createdoc service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );
      // let hashValue = '',
      //   documentLink = '';
      // console.log('body', body, file);
      // if (file) {
      //   const fileContent = fs.readFileSync(file.path);
      //   const hash = createHash('sha256');
      //   hash.update(fileContent);
      //   hashValue = hash.digest('hex');
      //   if (process.env.IS_OBJECT_STORE === 'true' && file) {
      //     documentLink = await this.ociUtils.addDocumentToOSNew(
      //       file,
      //       body?.organizationId,
      //       body?.locationName,
      //     );
      //   } else {
      //     const realmName = body?.realmName?.trim().toLowerCase();
      //     const locationName = body?.locationName
      //       ?.trim()
      //       .toLowerCase()
      //       .replace(/\s+/g, '_');
      //     documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
      //   }
      // }
      const docType = await this.doctypeModel.findById(body.doctypeId);
      // console.log('doctype in create', body.doctypeId);
      const createDocument = await this.documentModel.create({
        ...body,
        // distributionList: parsedDistributionList,
        // readAccess: parsedAccessList,
        workflowDetails: 'default',
        // documentLink: documentLink,
        // issueNumber: '001',
        countNumber: 1,
        isVersion: false,
        revisionReminderFlag: false,
        issueNumber: body?.issueNumber
          ? body?.issueNumber
          : docType?.initialVersion,
        currentVersion: docType?.versionType === 'Numeric' ? '0.0' : 'A',
      });
      // console.log("createDocument",createDocument);

      await this.docUtils.createEntryInDocWorkflowHistory(
        createDocument.id,
        body?.createdBy,
        'Created',
      );

      this.logger.log(
        `trace id=${randomNumber} Document created successfully with ID: ${createDocument.id}`,
        '',
      );
      if (!!body?.documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          createDocument.id,
          body?.documentLink,
          body?.createdBy,
        );
      }
      return createDocument;
      //creating entry in workflow history for DRAFT state  ----TODO
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} POST api/documents/createdoc service failed: ${
          error.message || error
        }`,
        '',
      );
      throw new InternalServerErrorException(
        error.message || 'Failed to create document.',
      );
    }
  }

  async createDocWithPublishedState(body: any, file: Express.Multer.File) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PUBLISH create api/documents service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );
      const organization = await this.prisma.organization.findFirst({
        where: { id: body.organizationId },
      });

      let hashValue = '',
        documentLink = '';
      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');
        if (process.env.IS_OBJECT_STORE === 'true') {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }
      }

      const parsedDistributionList = JSON.parse(body.distributionList || '{}');
      const parsedAccessList = JSON.parse(body.readAccess || '{}');
      const parsedWorkflowDetails = JSON.parse(body.workflowDetails || '{}');

      // Document Numbering
      const docType = await this.doctypeModel.findById(body.doctypeId);
      let documentNumbering = '';
      if (docType.documentNumbering === 'Serial') {
        const docLocation = await this.prisma.location.findFirst({
          where: { id: body.locationId },
        });
        const entity = await this.prisma.entity.findFirst({
          where: { id: body.entityId },
        });

        const fiscalYear = await this.organizationService.getFiscalYear(
          body.organizationId,
          new Date().getFullYear(),
        );
        const year =
          organization.fiscalYearFormat === 'YY-YY+1'
            ? fiscalYear
            : fiscalYear.toString().slice(-2);

        const prefix = generateNumbering(
          docType.prefix.split('-'),
          docLocation.locationId,
          entity.entityId,
          year,
        ).join('-');
        const suffix = generateNumbering(
          docType.suffix.split('-'),
          docLocation.locationId,
          entity.entityId,
          year,
        ).join('-');

        await prefixAndSuffix(
          this.prisma.prefixSuffix,
          body.locationId,
          docType._id,
          body.organizationId,
          body.createdBy,
          docType.prefix,
          docType.suffix,
          this.serialNumberService.createPrefixSuffix,
        );

        const serial = await this.serialNumberService.generateSerialNumberClone(
          {
            moduleType: docType._id,
            location: body.locationId,
            entity: body.entityId,
            year,
            createdBy: body.createdBy,
            organizationId: body.organizationId,
          },
        );

        documentNumbering = suffix
          ? `${prefix}-${serial}-${suffix}`
          : `${prefix}-${serial}`;
        if (documentNumbering.startsWith('-')) {
          documentNumbering = documentNumbering.slice(1);
        }
      }

      //caluclating nextRevisionDate
      const approvedDate = new Date();
      let nextRevisionDate = null;
      if (docType.reviewFrequency && docType.reviewFrequency > 0) {
        // console.log('IN APPPROVAL STAGE REVIEW FREQUENCY----->', docType.reviewFrequency);
        nextRevisionDate = new Date(approvedDate);
        nextRevisionDate.setDate(
          nextRevisionDate.getDate() + (docType.reviewFrequency || 0),
        );
      }

      // console.log('APPROVED DATE----->', approvedDate);
      // console.log('NEXT REVISION DATE----->', nextRevisionDate);

      const createDocument = await this.documentModel.create({
        ...body,
        distributionList: parsedDistributionList,
        readAccess: parsedAccessList,
        workflowDetails: parsedWorkflowDetails,
        documentLink,
        documentState: 'PUBLISHED',
        issueNumber: body?.issueNumber
          ? body?.issueNumber
          : docType?.initialVersion,
        countNumber: 1,
        isVersion: false,
        revisionReminderFlag: false,
        currentVersion: docType?.versionType === 'Numeric' ? '0.0' : 'A',
        documentNumbering,
        effectiveDate: new Date(),
        approvedDate,
        ...(!!docType?.reviewFrequency &&
        docType?.reviewFrequency > 0 &&
        !isNaN(nextRevisionDate.getTime())
          ? { nextRevisionDate }
          : {}),
      });

      let digiSign = undefined;
      if (organization.digitalSignature) {
        digiSign = await this.userService.signDocumentStage({
          userId: body.createdBy,
          docId: createDocument.id,
          action: 'Published',
          comment: body.digiSignComment,
        });
      }

      await this.docUtils.createEntryInDocWorkflowHistory(
        createDocument.id,
        body?.createdBy,
        'Published',
        digiSign,
      );

      if (documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          createDocument.id,
          documentLink,
          body?.createdBy,
        );
      }

      if (body?.refsData?.length > 0) {
        const refs = body.refsData.map((ref) => ({
          ...ref,
          refTo: createDocument.id,
        }));
        await this.refsService.create(refs);
      }

      const approver = await this.prisma.user.findUnique({
        where: { id: body?.createdBy },
      });
      const docEntity = await this.prisma.entity.findFirst({
        where: { id: createDocument.entityId },
      });
      const docLocation = await this.prisma.location.findFirst({
        where: { id: createDocument.locationId },
      });

      await this.sendMailOnCreatingDocWithPublishedState(
        approver,
        createDocument,
        docType,
        docLocation?.locationName,
        docEntity?.entityName,
      );

      return createDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} createAndPublish failed: ${
          error.message || error
        }`,
        '',
      );
      throw new InternalServerErrorException(
        error.message || 'Failed to create and publish document.',
      );
    }
  }

  async createDocWithInReviewState(body: any, file: Express.Multer.File) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} POST api/documents/createDocWithInReviewState service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );
      const organization = await this.prisma.organization.findFirst({
        where: { id: body.organizationId },
      });
      let hashValue = '',
        documentLink = '';
      // console.log('body', body, file);
      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');
        if (process.env.IS_OBJECT_STORE === 'true' && file) {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }
      }
      const docType = await this.doctypeModel.findById(body.doctypeId);
      // console.log("body in create ", body);
      const rawDistributionList = body.distributionList;
      let parsedDistributionList;
      try {
        parsedDistributionList = JSON.parse(rawDistributionList);
      } catch (e) {
        this.logger.error(`invalid distribution type error:${e}`);
      }
      const rawReadAccessList = body.readAccess;
      let parsedAccessList;
      try {
        parsedAccessList = JSON.parse(rawReadAccessList);
      } catch (e) {
        this.logger.error(`invalid distribution type error:${e}`);
      }
      const rawWorkflowDetails: any = body.workflowDetails;
      let parsedWorkflowDetails;
      try {
        parsedWorkflowDetails = JSON.parse(rawWorkflowDetails);
      } catch (e) {
        this.logger.error(`invalid workflowDetails type error:${e}`);
      }
      const createDocument = await this.documentModel.create({
        ...body,
        distributionList: parsedDistributionList,
        readAccess: parsedAccessList,
        workflowDetails: parsedWorkflowDetails,
        documentLink: documentLink,
        issueNumber: body?.issueNumber
          ? body?.issueNumber
          : docType?.initialVersion,
        countNumber: 1,
        isVersion: false,
        revisionReminderFlag: false,
        currentVersion: docType?.versionType === 'Numeric' ? '0.0' : 'A',
      });

      // let digiSign = await axios.post(
      //   process.env.SERVER_IP +
      //     /api/user/signDocument?userId=${body?.createdBy}&docId=${createDocument.id}&action=${body.documentState}&comment=${body.digiSignComment},
      //   null,
      //   {
      //     headers: {
      //       Authorization: Bearer ${user.kcToken},
      //     },
      //   },
      // );

      let digiSign = undefined;
      if (organization.digitalSignature) {
        digiSign = await this.userService.signDocumentStage({
          userId: body.createdBy,
          docId: createDocument.id,
          action: 'Created',
          comment: body.digiSignComment,
        });
      }

      await this.docUtils.createEntryInDocWorkflowHistory(
        createDocument.id,
        body?.createdBy,
        'Created',
        digiSign,
      );

      this.logger.log(
        `trace id=${randomNumber} Document created successfully with ID: ${createDocument.id}`,
        '',
      );
      if (!!documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          createDocument.id,
          documentLink,
          body?.createdBy,
        );
      }
      if (body?.refsData && body?.refsData.length > 0) {
        const refs = body?.refsData.map((ref: any) => ({
          ...ref,
          refTo: createDocument.id,
        }));
        await this.refsService.create(refs);
      }
      const createdUser = await this.prisma.user.findUnique({
        where: {
          id: createDocument?.createdBy,
        },

        include: {
          location: true,
          entity: true,
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          id: {
            in: createDocument.reviewers,
          },
        },
        select: {
          email: true,
        },
      });
      const ccRecipients = mailRecipients.map((user: any) => user.email) || [];
      //send email to creator and reviewers
      try {
        await this.sendMailOnReview(
          createdUser,
          createDocument,
          docType,
          ccRecipients,
        );
      } catch (error) {}
      return createDocument;
      return createDocument;
    } catch (error) {
      // console.log("erroor",error);

      this.logger.error(
        `trace id=${randomNumber} createDocWithInReviewState failed: ${error}`,
        '',
      );
      throw new InternalServerErrorException(
        error.message || 'createDocWithInReviewState',
      );
    }
  }

  async sendMailOnCreatingDocWithPublishedState(
    approver,
    documentInfo,
    docType,
    docLocation,
    docEntity,
  ) {
    const docLink = `${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}`;
    const subject = `${documentInfo.documentName} has been Published`;

    const html = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
      <p><strong>A new document has been published</strong></p>
      <p><strong>Document Type:</strong> ${docType.documentTypeName}</p>
      <p><strong>Document Name:</strong> ${documentInfo.documentName}</p>
      <p><strong>Corp Func/Unit:</strong> ${docLocation}</p>
      <p><strong>Department:</strong> ${docEntity}</p>
      <p><strong>Published By:</strong> ${approver.firstname} ${approver.lastname}</p>
      <p>
        <strong>Link:</strong>
        <a href="${docLink}" style="color: #1a73e8; text-decoration: none;">View Document</a>
      </p>
    </div>
  `;

    const mailRecipients = await this.prisma.user.findMany({
      where: {
        id: {
          in: [
            ...documentInfo?.approvers,
            documentInfo?.createdBy,
            ...documentInfo?.reviewers,
          ],
        },
      },
      select: { email: true },
    });

    const ccRecipients = mailRecipients.map((u: any) => u.email);
    const allRecipients = Array.from(
      new Set([approver.email, ...ccRecipients]),
    );
    const [to, ...cc] = allRecipients;

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        await this.emailService.sendBulkEmails(
          allRecipients,
          subject,
          '',
          html,
        );
      } else {
        const msg = {
          to,
          cc,
          from: process.env.FROM,
          subject,
          html,
        };
        await sgMail.send(msg);
      }
    } catch (error) {
      console.error('Email send error:', error.message || error);
    }
  }

  //save as updateDocInDraftMode only
  async updateDocInDraftMode(
    documentId: string,
    body: UpdateDocumentDto,
    file: Express.Multer.File,
  ) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );

      // console.log('body in updateDocInDraftMode', body);

      let hashValue = '',
        documentLink = '';
      const updatePayload: any = { ...body };

      const rawWorkflowDetails: any = updatePayload.workflowDetails;
      try {
        updatePayload.workflowDetails = JSON.parse(rawWorkflowDetails);
      } catch (e) {
        this.logger.error(`invalid workflowDetails type error:${e}`);
      }

      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');

        if (process.env.IS_OBJECT_STORE === 'true') {
          // Optional: delete existing object store file using old link if needed
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }

        updatePayload.documentLink = documentLink;
      }

      const updatedDocument = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $set: updatePayload },
        { new: true },
      );

      if (documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          documentId,
          documentLink,
          body?.updatedBy || body?.createdBy,
        );
      }

      if (body?.refsData && body?.refsData.length > 0) {
        const refs = body.refsData.map((ref: any) => ({
          ...ref,
          refTo: documentId,
        }));
        await this.refsService.deleteAllById(documentId);
        await this.refsService.create(refs);
      }

      // optionally: update workflow history,

      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents service: ${error.message}`,
        '',
      );
      throw error;
    }
  }
  //save for review
  async updateDocumentForReview(
    documentId: string,
    body: UpdateDocumentDto,
    file: Express.Multer.File,
    user,
  ) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });

      let hashValue = '',
        documentLink = '';
      const updatePayload: any = { ...body };

      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');

        if (process.env.IS_OBJECT_STORE === 'true') {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }
        updatePayload.documentLink = documentLink;
      }

      // console.log('updated payload', updatePayload);

      const updatedDocument: any = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $set: { ...updatePayload } },
        { new: true },
      );
      // console.log('updated document', updatedDocument);

      let digiSign = undefined;
      if (activeUser?.organization?.digitalSignature) {
        digiSign = await this.userService.signDocumentStage({
          userId: activeUser.id,
          docId: documentId,
          action: 'Sent for Review',
          comment: body.digiSignComment,
        });
      }

      await this.docUtils.createEntryInDocWorkflowHistory(
        updatedDocument.id,
        body?.updatedBy,
        'Sent for Review',
        digiSign,
      );

      const docType: any = await this.doctypeModel
        .findById(updatedDocument?.doctypeId)
        .select('documentTypeName');
      if (documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          updatedDocument.id,
          documentLink,
          body?.updatedBy || body?.createdBy, // fallback
        );
      }
      if (body?.refsData && body?.refsData.length > 0) {
        const refs = body?.refsData.map((ref: any) => ({
          ...ref,
          refTo: documentId,
        }));

        const createRefs = await this.refsService.create(refs);
      }
      //mail logic for send for review

      const createdUser = await this.prisma.user.findUnique({
        where: {
          id: updatedDocument?.createdBy,
        },

        include: {
          location: true,
          entity: true,
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          id: {
            in: updatedDocument.reviewers,
          },
        },
        select: {
          email: true,
        },
      });
      const ccRecipients = mailRecipients.map((user: any) => user.email) || [];
      //send email to creator and reviewers
      try {
        await this.sendMailOnReview(
          createdUser,
          updatedDocument,
          docType,
          ccRecipients,
        );
      } catch (error) {}
      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents service: ${error.message}`,
        '',
      );
      // console.log('error in updateDocumentForReview', error);
      throw error;
    }
  }
  async sendMailOnReview(creator, documentInfo, docType, ccRecipients) {
    const docLink = `${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}`;
    const emailMessageIP = `
 <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p><strong>Following document has been created and sent for review:</strong></p>
    <p><strong>Document Type:</strong> ${docType.documentTypeName}</p>
    <p><strong>Document Name:</strong> ${documentInfo.documentName}</p>
    <p><strong>Corp Func/Unit:</strong> ${creator?.location?.locationName}</p>
    <p><strong>Department:</strong> ${creator?.entity?.entityName}</p>
    <p><strong>Created By:</strong> ${creator.firstname} ${creator.lastname}</p>
    <p>
      <strong>Link:</strong> 
      <a href="${docLink}" style="color: #1a73e8; text-decoration: none;">
        View Document
      </a>
    </p>
  </div> 
  `;
    const allRecipients = Array.from(new Set([creator.email, ...ccRecipients]));
    const [to, ...cc] = allRecipients;

    const subject = `${documentInfo.documentName} has been created and sent for review`;

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        await this.emailService.sendBulkEmails(
          allRecipients,
          subject,
          '',
          emailMessageIP,
        );
      } else {
        const msg = {
          to,
          cc,
          from: process.env.FROM,
          subject,
          html: emailMessageIP,
        };
        await sgMail.send(msg);
        console.log('Sent mail');
      }
    } catch (error) {
      if (error.response?.body?.errors) {
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        console.error('Email send error:', error.message);
      }
    }
  }

  //api for saving document in review complete
  // async updateDocumentForReviewComplete(
  //   documentId: string,
  //   body: UpdateDocumentDto,
  //   file: Express.Multer.File,
  // ) {
  //   const randomNumber = uuid();
  //   try {
  //     this.logger.log(
  //       `trace id=${randomNumber} PATCH api/documents/updateDocumentForReviewComplete service started with Data ${JSON.stringify(
  //         body,
  //       )}`,
  //       '',
  //     );

  //     let hashValue = '',
  //       documentLink = '';
  //     const updatePayload: any = { ...body };

  //     if (file) {
  //       const fileContent = fs.readFileSync(file.path);
  //       const hash = createHash('sha256');
  //       hash.update(fileContent);
  //       hashValue = hash.digest('hex');

  //       if (process.env.IS_OBJECT_STORE === 'true') {
  //         documentLink = await this.ociUtils.addDocumentToOSNew(
  //           file,
  //           body?.organizationId,
  //           body?.locationName,
  //         );
  //       } else {
  //         const realmName = body?.realmName?.toLowerCase();
  //         const locationName = body?.locationName?.toLowerCase();
  //         documentLink = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document/${file.filename}`;
  //       }

  //       updatePayload.documentLink = documentLink;
  //     }

  //     console.log("updated payload", updatePayload);

  //     const updatedDocument: any = await this.documentModel.findByIdAndUpdate(
  //       documentId,
  //       { $set: {...updatePayload} },
  //       { new: true },
  //     );
  //     console.log("updated document", updatedDocument);

  //     const docType: any = await this.doctypeModel
  //       .findById(updatedDocument?.doctypeId)
  //       .select('documentTypeName');
  //     if (documentLink) {
  //       await this.docUtils.createEntryInDocumentAttachmentHistory(
  //         updatedDocument.id,
  //         documentLink,
  //         body?.updatedBy || body?.createdBy, // fallback
  //       );
  //     }
  //     if (body?.refsData && body?.refsData.length > 0) {
  //       const refs = body?.refsData.map((ref: any) => ({
  //         ...ref,
  //         refTo: documentId,
  //       }));

  //       const createRefs = await this.refsService.create(refs);
  //     }
  //     //mail logic for send for review

  //     const createdUser = await this.prisma.user.findUnique({
  //       where: {
  //         id: updatedDocument?.createdBy,
  //       },

  //       include: {
  //         location: true,
  //         entity: true,
  //       },
  //     });
  //     const mailRecipients = await this.prisma.user.findMany({
  //       where: {
  //         id: {
  //           in: updatedDocument.reviewers,
  //         },
  //       },
  //       select: {
  //         email: true,
  //       },
  //     });
  //     const ccRecipients = mailRecipients.map((user: any) => user.email) || [];

  //    //send email to creator and reviewers
  //     try {
  //       await this.sendMailOnReview(
  //         createdUser,
  //         updatedDocument,
  //         docType,
  //         ccRecipients,
  //       );
  //     } catch (error) {}
  //     return updatedDocument;
  //   } catch (error) {
  //     this.logger.error(
  //       `trace id=${randomNumber} Error in PATCH api/documents service: ${error.message}`,
  //       '',
  //     );
  //     throw error;
  //   }
  // }
  //api for approval
  async updateDocumentForApproval(
    documentId: string,
    body: UpdateDocumentDto,
    file: Express.Multer.File,
    user,
  ) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents/updateDocumentForApproval service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });

      let hashValue = '',
        documentLink = '';
      const updatePayload: any = { ...body };

      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');

        if (process.env.IS_OBJECT_STORE === 'true') {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }

        updatePayload.documentLink = documentLink;
      }

      const updatedDocument: any = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $set: updatePayload },
        { new: true },
      );
      const docType: any = await this.doctypeModel
        .findById(updatedDocument?.doctypeId)
        .select('documentTypeName');
      if (documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          updatedDocument.id,
          documentLink,
          body?.updatedBy || body?.createdBy, // fallback
        );
      }

      let digiSign = undefined;
      if (activeUser.organization.digitalSignature) {
        digiSign = await this.userService.signDocumentStage({
          userId: activeUser.id,
          docId: documentId,
          action: 'Reviewed',
          comment: body.digiSignComment,
        });
      }

      await this.docUtils.createEntryInDocWorkflowHistory(
        updatedDocument.id,
        body?.updatedBy,
        'Reviewed',
        digiSign,
      );
      if (body?.refsData && body?.refsData.length > 0) {
        const refs = body?.refsData.map((ref: any) => ({
          ...ref,
          refTo: documentId,
        }));

        const createRefs = await this.refsService.create(refs);
      }
      //mail logic for send for review
      const docLocation = await this.prisma.location.findFirst({
        where: {
          id: updatedDocument?.locationId,
        },
        select: {
          locationName: true,
        },
      });
      const docEntity = await this.prisma.entity.findFirst({
        where: {
          id: updatedDocument?.entityId,
        },
        select: {
          entityName: true,
        },
      });
      const reviewer = await this.prisma.user.findUnique({
        where: {
          id: updatedDocument?.updatedBy,
        },

        include: {
          location: true,
          entity: true,
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          id: {
            in: [...updatedDocument.approvers, updatedDocument?.createdBy],
          },
        },
        select: {
          email: true,
        },
      });
      const ccRecipients = mailRecipients.map((user: any) => user.email) || [];
      //send email to creator and reviewers
      try {
        await this.sendMailForApproval(
          reviewer,
          updatedDocument,
          docType,
          docLocation.locationName,
          docEntity.entityName,
          ccRecipients,
        );
      } catch (error) {}
      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents/updateDocumentForApproval service: ${error.message}`,
        '',
      );
      throw error;
    }
  }
  async sendMailForApproval(
    reviewer,
    documentInfo,
    docType,
    docLocation,
    docEntity,
    ccRecipients,
  ) {
    const docLink = `${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}`;
    const emailMessageIP = `
 <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p><strong>Following document has been reviewed and Sent for Approval:</strong></p>
    <p><strong>Document Type:</strong> ${docType.documentTypeName}</p>
    <p><strong>Document Name:</strong> ${documentInfo.documentName}</p>
    <p><strong>Corp Func/Unit:</strong> ${docLocation}</p>
    <p><strong>Department:</strong> ${docEntity}</p>
    <p><strong>Reviewed By:</strong> ${reviewer.firstname} ${reviewer.lastname}</p>
    <p>
      <strong>Link:</strong> 
      <a href="${docLink}" style="color: #1a73e8; text-decoration: none;">
        View Document
      </a>
    </p>
  </div> 
  `;
    const allRecipients = Array.from(
      new Set([reviewer.email, ...ccRecipients]),
    );
    const [to, ...cc] = allRecipients;

    const subject = `${documentInfo.documentName} has been reviewed and Sent for Approval`;

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        await this.emailService.sendBulkEmails(
          allRecipients,
          subject,
          '',
          emailMessageIP,
        );
      } else {
        const msg = {
          to,
          cc,
          from: process.env.FROM,
          subject,
          html: emailMessageIP,
        };
        await sgMail.send(msg);
        console.log('Sent mail');
      }
    } catch (error) {
      if (error.response?.body?.errors) {
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        console.error('Email send error:', error.message);
      }
    }
  }
  //send for edit
  async updateDocumentForSendForEdit(
    documentId: string,
    body: UpdateDocumentDto,
    file: Express.Multer.File,
  ) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents/updateDocumentForSendForEdit service started with Data ${JSON.stringify(
          body,
        )}`,
        '',
      );

      let hashValue = '',
        documentLink = '';
      const updatePayload: any = { ...body };

      const updatedDocument: any = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $set: updatePayload },
        { new: true },
      );
      const docType: any = await this.doctypeModel
        .findById(updatedDocument?.doctypeId)
        .select('documentTypeName');
      // if (documentLink) {
      //   await this.docUtils.createEntryInDocumentAttachmentHistory(
      //     updatedDocument.id,
      //     documentLink,
      //     body?.updatedBy || body?.createdBy, // fallback
      //   );
      // }
      // if (body?.refsData && body?.refsData.length > 0) {
      //   const refs = body?.refsData.map((ref: any) => ({
      //     ...ref,
      //     refTo: documentId,
      //   }));

      //   const createRefs = await this.refsService.create(refs);
      // }
      //mail logic for send for review
      const docLocation = await this.prisma.location.findFirst({
        where: {
          id: updatedDocument?.locationId,
        },
        select: {
          locationName: true,
        },
      });
      const docEntity = await this.prisma.entity.findFirst({
        where: {
          id: updatedDocument?.entityId,
        },
        select: {
          entityName: true,
        },
      });
      const sender = await this.prisma.user.findUnique({
        where: {
          id: updatedDocument?.updatedBy,
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          id: {
            in: [...updatedDocument.reviewers, updatedDocument?.createdBy],
          },
        },
        select: {
          email: true,
        },
      });
      const ccRecipients = mailRecipients.map((user: any) => user.email) || [];
      //send email to creator and reviewers
      try {
        await this.sendMailForEdit(
          sender,
          updatedDocument,
          docType,
          docLocation.locationName,
          docEntity.entityName,
          ccRecipients,
        );
      } catch (error) {}
      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents/updateDocumentForApproval service: ${error.message}`,
        '',
      );
      throw error;
    }
  }
  async sendMailForEdit(
    sender,
    documentInfo,
    docType,
    docLocation,
    docEntity,
    ccRecipients,
  ) {
    const docLink = `${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}`;
    const emailMessageIP = `
 <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p><strong>Following document has been sent back for edit:</strong></p>
    <p><strong>Document Type:</strong> ${docType.documentTypeName}</p>
    <p><strong>Document Name:</strong> ${documentInfo.documentName}</p>
    <p><strong>Corp Func/Unit:</strong> ${docLocation}</p>
    <p><strong>Department:</strong> ${docEntity}</p>
    <p><strong>Sent By:</strong> ${sender.firstname} ${sender.lastname}</p>
    <p>
      <strong>Link:</strong> 
      <a href="${docLink}" style="color: #1a73e8; text-decoration: none;">
        View Document
      </a>
    </p>
  </div> 
  `;
    const allRecipients = Array.from(new Set([sender.email, ...ccRecipients]));
    const [to, ...cc] = allRecipients;

    const subject = `${documentInfo.documentName} has been Sent Back For Edit`;

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        await this.emailService.sendBulkEmails(
          allRecipients,
          subject,
          '',
          emailMessageIP,
        );
      } else {
        const msg = {
          to,
          cc,
          from: process.env.FROM,
          subject,
          html: emailMessageIP,
        };
        await sgMail.send(msg);
        console.log('Sent mail');
      }
    } catch (error) {
      if (error.response?.body?.errors) {
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        console.error('Email send error:', error.message);
      }
    }
  }
  //save for published
  async updateDocumentForPublishedState(
    documentId: string,
    body: UpdateDocumentDto,
    file: Express.Multer.File,
    user,
  ) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        organization: true,
      },
    });
    const document: any = await this.documentModel.findById(documentId);
    const docType = await this.doctypeModel.findById(document.doctypeId);

    // Only fetch org if not passed in payload
    const organizationId = body?.organizationId || document.organizationId;
    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId },
    });

    const docLocation = await this.prisma.location.findFirst({
      where: { id: document.locationId },
    });

    const fiscalYear = await this.organizationService.getFiscalYear(
      organizationId,
      new Date().getFullYear(),
    );
    const year =
      organization.fiscalYearFormat === 'YY-YY+1'
        ? fiscalYear
        : fiscalYear.toString().slice(-2);

    // Clear nextRevisionDate for versioned documents
    if (document.countNumber > 1) {
      await this.documentModel.findByIdAndUpdate(
        documentId,
        { $set: { nextRevisionDate: null } },
        { new: true },
      );
    }

    // Auto-generate document numbering if needed
    let documentNumbering = document.documentNumbering;
    if (
      docType.documentNumbering === 'Serial' &&
      body.documentState === 'PUBLISHED'
    ) {
      const prefixArr = docType.prefix.split('-');
      const suffixArr = docType.suffix.split('-');

      const entity = await this.prisma.entity.findFirst({
        where: { id: document.entityId },
      });

      const prefix = generateNumbering(
        prefixArr,
        docLocation.locationId,
        entity.entityId,
        year,
      ).join('-');
      const suffix = generateNumbering(
        suffixArr,
        docLocation.locationId,
        entity.entityId,
        year,
      ).join('-');

      await prefixAndSuffix(
        this.prisma.prefixSuffix,
        document.locationId,
        docType._id,
        organizationId,
        body.updatedBy,
        docType.prefix,
        docType.suffix,
        this.serialNumberService.createPrefixSuffix,
      );

      if (!document.documentNumbering) {
        const serial = await this.serialNumberService.generateSerialNumberClone(
          {
            moduleType: docType._id,
            location: document.locationId,
            entity: document.entityId,
            year,
            createdBy: document.createdBy,
            organizationId,
          },
        );

        documentNumbering = suffix
          ? `${prefix}-${serial}-${suffix}`
          : `${prefix}-${serial}`;

        if (documentNumbering.startsWith('-')) {
          documentNumbering = documentNumbering.slice(1);
        }
      }
    }

    // versioning logic here
    if (document.countNumber >= 2) {
      const prevVersion = await this.documentModel.findOne({
        countNumber: document.countNumber - 1,
        documentId: document.documentId,
      });
      // console.log('previous version', prevVersion);
      //
      if (prevVersion) {
        await this.documentModel.findByIdAndUpdate(
          prevVersion._id,
          { $set: { documentState: 'OBSOLETE', nextRevisionDate: null } },
          { new: true },
        );
      }
    }

    // Document attachment history update
    // if (body?.documentLink && body.documentLink !== document.documentLink) {
    //   await this.docUtils.createEntryInDocumentAttachmentHistory(
    //     documentId,
    //     body.documentLink,
    //     body.updatedBy || body.createdBy,
    //   );
    // }

    const approvedDate = new Date();
    let nextRevisionDate = null;
    if (docType.reviewFrequency && docType.reviewFrequency > 0) {
      // console.log('updateDocumentForPublishedState IN APPPROVAL STAGE REVIEW FREQUENCY----->', docType.reviewFrequency);
      nextRevisionDate = new Date(approvedDate);
      nextRevisionDate.setDate(
        nextRevisionDate.getDate() + (docType.reviewFrequency || 0),
      );
    }

    // console.log('updateDocumentForPublishedState  APPROVED DATE----->', approvedDate);
    // console.log('updateDocumentForPublishedState NEXT REVISION DATE----->', nextRevisionDate);

    const updatePayload: any = {
      ...body,
      // doctypeId: body.doctypeId,
      // issueNumber: body.issueNumber,
      // distributionList: body.distributionList,
      // distributionUsers: body.distributionUsers,
      // readAccess: body.readAccess,
      // readAccessUsers: body.readAccessUsers,
      // currentVersion: body.currentVersion,
      // documentLink: body.documentLink,
      documentNumbering,
      effectiveDate: new Date(),
      approvedDate,
      ...(!!docType?.reviewFrequency &&
      docType?.reviewFrequency > 0 &&
      !isNaN(nextRevisionDate.getTime())
        ? { nextRevisionDate }
        : {}),
      isVersion: document.isVersion,
    };
    let hashValue = '',
      documentLink = '';

    if (file) {
      const fileContent = fs.readFileSync(file.path);
      const hash = createHash('sha256');
      hash.update(fileContent);
      hashValue = hash.digest('hex');

      if (process.env.IS_OBJECT_STORE === 'true') {
        documentLink = await this.ociUtils.addDocumentToOSNew(
          file,
          body?.organizationId,
          body?.locationName,
        );
      } else {
        const realmName = body?.realmName?.toLowerCase();
        const locationName = body?.locationName?.toLowerCase();
        documentLink = `${process.env.FOLDER_PATH}/${realmName}/${locationName}/document/${file.filename}`;
      }

      updatePayload.documentLink = documentLink;
    }

    const updatedDocument: any = await this.documentModel.findByIdAndUpdate(
      documentId,
      { $set: updatePayload },
      { new: true },
    );

    let digiSign = undefined;
    if (activeUser.organization.digitalSignature) {
      digiSign = await this.userService.signDocumentStage({
        userId: activeUser.id,
        docId: documentId,
        action: 'Approved',
        comment: body.digiSignComment,
      });
    }

    await this.docUtils.createEntryInDocWorkflowHistory(
      updatedDocument.id,
      body?.updatedBy,
      'Approved',
      digiSign,
    );

    //ref part
    if (body?.refsData && body?.refsData.length > 0) {
      const refs = body?.refsData.map((ref: any) => ({
        ...ref,
        refTo: documentId,
      }));

      const createRefs = await this.refsService.create(refs);
    }
    //mailing logic based in distibutionlist

    const approver = await this.prisma.user.findUnique({
      where: {
        id: body?.updatedBy,
      },
    });
    const mailRecipients = await this.prisma.user.findMany({
      where: {
        id: {
          in: [
            ...updatedDocument.approvers,
            updatedDocument?.createdBy,
            ...updatedDocument?.reviewers,
          ],
        },
      },
      select: {
        email: true,
      },
    });

    const ccRecipients = mailRecipients.map((user: any) => user.email) || [];

    const docEntity = await this.prisma.entity.findFirst({
      where: {
        id: updatedDocument?.entityId,
      },
      select: {
        entityName: true,
      },
    });
    try {
      await this.sendMailOnPublish(
        approver,
        updatedDocument,
        docType,
        docLocation?.locationName,
        docEntity?.entityName,
        ccRecipients,
      );
    } catch (error) {}
    return updatedDocument;
  }
  async sendMailOnPublish(
    approver,
    documentInfo,
    docType,
    docLocation,
    docEntity,
    ccRecipients,
  ) {
    const revDocCode = documentInfo?.versionInfo?.find(
      (item: any) => item.type === 'REVIEWER',
    )?.docCode;
    const appDocCode = documentInfo?.versionInfo?.find(
      (item: any) => item.type === 'APPROVER',
    )?.docCode;
    let docChangeMsg = '';
    if (appDocCode && revDocCode) {
      if (appDocCode !== revDocCode) {
        if (process.env.MAIL_SYSTEM !== 'IP_BASED') {
          docChangeMsg = `
          <p><strong>Approver has made changes to the document, please go to the document to view changes.</strong></p>
          `;
        } else {
          docChangeMsg =
            'Approver has made changes to the document, please go to the document to view changes.';
        }
      }
    }
    const docLink = `${process.env.PROTOCOL}://${process.env.REDIRECT}/processdocuments/processdocument/viewprocessdocument/${documentInfo.id}`;
    const emailMessageIP = `
 <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
    <p><strong>Following document has been published</strong></p>
    <p><strong>Document Type:</strong> ${docType.documentTypeName}</p>
    <p><strong>Document Name:</strong> ${documentInfo.documentName}</p>
    <p><strong>Corp Func/Unit:</strong> ${docLocation}</p>
    <p><strong>Department:</strong> ${docEntity}</p>
    <p><strong>Published By:</strong> ${approver.firstname} ${approver.lastname}</p>
     ${docChangeMsg}
    <p>
      <strong>Link:</strong> 
      <a href="${docLink}" style="color: #1a73e8; text-decoration: none;">
        View Document
      </a>
    </p>
  </div> 
  `;
    const allRecipients = Array.from(
      new Set([approver.email, ...ccRecipients]),
    );
    const [to, ...cc] = allRecipients;

    const subject = `${documentInfo.documentName} has been Published`;

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        await this.emailService.sendBulkEmails(
          allRecipients,
          subject,
          '',
          emailMessageIP,
        );
      } else {
        const msg = {
          to,
          cc,
          from: process.env.FROM,
          subject,
          html: emailMessageIP,
        };
        await sgMail.send(msg);
        console.log('Sent mail');
      }
    } catch (error) {
      if (error.response?.body?.errors) {
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        console.error('Email send error:', error.message);
      }
    }
  }

  async updateDocumentForCustomWorkflow(
    documentId: string,
    body: UpdateDocumentDto,
    file: Express.Multer.File,
    user,
  ) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents service started with Data`,
        '',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });
      const currentState = body.documentState;
      const document: any = await this.documentModel.findById(documentId);
      const docType = await this.doctypeModel.findById(document.doctypeId);

      // Only fetch org if not passed in payload
      const organizationId = body?.organizationId || document.organizationId;
      const organization = await this.prisma.organization.findFirst({
        where: { id: organizationId },
      });

      const docLocation = await this.prisma.location.findFirst({
        where: { id: document.locationId },
      });

      const fiscalYear = await this.organizationService.getFiscalYear(
        organizationId,
        new Date().getFullYear(),
      );
      const year =
        organization.fiscalYearFormat === 'YY-YY+1'
          ? fiscalYear
          : fiscalYear.toString().slice(-2);

      // Clear nextRevisionDate for versioned documents
      if (document.countNumber > 1) {
        await this.documentModel.findByIdAndUpdate(
          documentId,
          { $set: { nextRevisionDate: null } },
          { new: true },
        );
      }

      // Auto-generate document numbering if needed
      let documentNumbering = document.documentNumbering;

      const rawWorkflowDetails: any = body.workflowDetails;
      let parsedWorkflowDetails;
      try {
        parsedWorkflowDetails = JSON.parse(rawWorkflowDetails);
      } catch (e) {
        this.logger.error(`invalid workflowDetails type error:${e}`);
      }

      if (body.documentState === 'Send For Edit') {
        body.documentState = 'DRAFT';
      }

      if (
        docType.documentNumbering === 'Serial' &&
        body.documentState === 'PUBLISHED'
      ) {
        const prefixArr = docType.prefix.split('-');
        const suffixArr = docType.suffix.split('-');

        const entity = await this.prisma.entity.findFirst({
          where: { id: document.entityId },
        });

        const prefix = generateNumbering(
          prefixArr,
          docLocation.locationId,
          entity.entityId,
          year,
        ).join('-');
        const suffix = generateNumbering(
          suffixArr,
          docLocation.locationId,
          entity.entityId,
          year,
        ).join('-');

        await prefixAndSuffix(
          this.prisma.prefixSuffix,
          document.locationId,
          docType._id,
          organizationId,
          body.updatedBy,
          docType.prefix,
          docType.suffix,
          this.serialNumberService.createPrefixSuffix,
        );

        if (!document.documentNumbering) {
          const serial =
            await this.serialNumberService.generateSerialNumberClone({
              moduleType: docType._id,
              location: document.locationId,
              entity: document.entityId,
              year,
              createdBy: document.createdBy,
              organizationId,
            });

          documentNumbering = suffix
            ? `${prefix}-${serial}-${suffix}`
            : `${prefix}-${serial}`;

          if (documentNumbering.startsWith('-')) {
            documentNumbering = documentNumbering.slice(1);
          }
        }
      }

      const nextRevisionDate = await this.calculateNextDate(
        new Date(),
        docType.reviewFrequency,
      );

      // versioning logic here
      if (document.countNumber >= 2) {
        const prevVersion = await this.documentModel.findOne({
          countNumber: document.countNumber - 1,
          documentId: document.documentId,
        });
        //
        if (prevVersion && body.documentState === 'PUBLISHED') {
          await this.documentModel.findByIdAndUpdate(
            prevVersion._id,
            { $set: { documentState: 'OBSOLETE' } },
            { new: true },
          );
        }
      }

      // Document attachment history update
      // if (body?.documentLink && body.documentLink !== document.documentLink) {
      //   await this.docUtils.createEntryInDocumentAttachmentHistory(
      //     documentId,
      //     body.documentLink,
      //     body.updatedBy || body.createdBy,
      //   );
      // }

      const updatePayload: any = {
        ...body,
        // doctypeId: body.doctypeId,
        // issueNumber: body.issueNumber,
        // distributionList: body.distributionList,
        // distributionUsers: body.distributionUsers,
        // readAccess: body.readAccess,
        // readAccessUsers: body.readAccessUsers,
        // currentVersion: body.currentVersion,
        // documentLink: body.documentLink,
        approvedDate:
          body.documentState === 'PUBLISHED'
            ? new Date(body.approvedDate)
            : document.approvedDate,
        nextRevisionDate,
        documentNumbering,
        isVersion: document.isVersion,
        workflowDetails: parsedWorkflowDetails,
      };

      let hashValue = '',
        documentLink = '';

      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');

        if (process.env.IS_OBJECT_STORE === 'true') {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            body?.organizationId,
            body?.locationName,
          );
        } else {
          const realmName = body?.realmName?.trim().toLowerCase();
          const locationName = body?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }
        updatePayload.documentLink = documentLink;
      }

      const updatedDocument: any = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $set: { ...updatePayload } },
        { new: true },
      );

      if (body?.previousState) {
        let digiSign = undefined;
        if (activeUser.organization.digitalSignature) {
          digiSign = await this.userService.signDocumentStage({
            userId: activeUser.id,
            docId: documentId,
            action:
              body?.previousState +
              ' Complete' +
              (body.documentState === 'PUBLISHED' ? ' And Published' : ''),
            comment: body.digiSignComment,
          });
        }
        await this.docUtils.createEntryInDocWorkflowHistory(
          updatedDocument.id,
          body?.updatedBy,
          currentState === 'Send For Edit'
            ? currentState
            : body?.previousState +
                ' Complete' +
                (body.documentState === 'PUBLISHED' ? ' And Published' : ''),
          digiSign,
        );
      }

      if (documentLink) {
        await this.docUtils.createEntryInDocumentAttachmentHistory(
          updatedDocument.id,
          documentLink,
          body?.updatedBy || body?.createdBy, // fallback
        );
      }

      if (body?.refsData && body?.refsData.length > 0) {
        const refs = body?.refsData.map((ref: any) => ({
          ...ref,
          refTo: documentId,
        }));

        const createRefs = await this.refsService.create(refs);
      }
      //mail logic for send for review

      const createdUser = await this.prisma.user.findUnique({
        where: {
          id: updatedDocument?.createdBy,
        },

        include: {
          location: true,
          entity: true,
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          id: {
            in: updatedDocument.reviewers,
          },
        },
        select: {
          email: true,
        },
      });
      const ccRecipients = mailRecipients.map((user: any) => user.email) || [];
      //send email to creator and reviewers
      // try {
      //   await this.sendMailOnReview(
      //     createdUser,
      //     updatedDocument,
      //     docType,
      //     ccRecipients,
      //   );
      // } catch (error) {}
      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents service: ${error.message}`,
        '',
      );
      throw error;
    }
  }

  async markDocumentAsFavorite(documentId: string, userId: string) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents/markDocumentAsFavorite service started with Data ${documentId}`,
        '',
      );

      const updatedDocument = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $addToSet: { favoriteFor: userId } },
        { new: true },
      );

      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents/markDocumentAsFavorite service: ${error.message}`,
        '',
      );
      throw error;
    }
  }

  async removeDocumentFromFavorites(documentId: string, userId: string) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} PATCH api/documents/removeDocumentFromFavorite service started with Data ${documentId}`,
        '',
      );

      const updatedDocument = await this.documentModel.findByIdAndUpdate(
        documentId,
        { $pull: { favoriteFor: userId } },
        { new: true },
      );

      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Error in PATCH api/documents/removeDocumentFromFavorite service: ${error.message}`,
        '',
      );
      throw error;
    }
  }

  //doc comments  apis
  async createDocumentComment(comment: any) {
    return await this.documentCommentsModel.create(comment);
  }

  async findAllDocCommentsByDocumentId(documentId: string) {
    const comments = await this.documentCommentsModel
      .find({ documentId })
      .sort({ createdAt: 1 })
      .lean();

    const userIds = [
      ...new Set(comments.map((c) => c.commentBy).filter(Boolean)),
    ];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        avatar: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return comments.map((comment) => ({
      ...comment,
      userDetails: userMap.get(comment.commentBy),
    }));
  }

  //get attachement history api
  async getAttachmentHistoryForDocument(documentId: string) {
    const history = await this.documentAttachmentHistoryModel
      .find({ documentId })
      .sort({ updatedAt: -1 })
      .lean();

    const userIds = [
      ...new Set(history.map((h) => h.updatedBy).filter(Boolean)),
    ];

    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return history.map((entry) => ({
      ...entry,
      updatedByDetails: userMap.get(entry.updatedBy),
    }));
  }

  async getEntityForDocument(user) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
      include: { entity: true },
    });
    let data;
    let uniqueData;
    if (activeUser?.userType !== 'globalRoles') {
      if (activeUser.entityId !== null) {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            users: { has: activeUser.id },
          },
          select: { id: true, entityName: true },
        });
      } else {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            locationId: activeUser.locationId,
          },
        });
      }
    } else {
      if (activeUser?.additionalUnits?.includes('All')) {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
          },
        });
      } else {
        data = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            locationId: {
              in: activeUser.additionalUnits, // activeUser.additionalUnits is an array of strings
            },
          },
        });
      }
    }
    // if (data.length === 0) {
    //   data =

    // }
    const userDept = [
      {
        id: activeUser?.entityId,
        entityName: activeUser?.entity?.entityName,
      },
    ];

    const cominedData = [...data, ...userDept];

    uniqueData = cominedData.filter(
      (item, index, self) => index === self.findIndex((t) => t.id === item.id),
    );
    return uniqueData;
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }

  async findAllBySystems(filterString, systems, page, limit, realmName, user) {
    const skipValue = (page - 1) * Number(limit);

    // ?filter=locationAdmin|value,locationType|something
    let myFilter;

    if (filterString) {
      myFilter = filterString.split(',').map((item) => {
        //locationAdmin|value
        let [fieldName, fieldValue] = item.split('|'); //[locationAdmin,value]
        return { filterField: fieldName, filterString: fieldValue };
      });
    }

    let filterQuery: any;

    if (myFilter) {
      filterQuery = queryGeneartorForDocumentsFilter(myFilter);

      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          system: { has: systems },
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
              },
            },
          ],
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });
      //check permissionforUser
      const length = await this.prisma.documents.count({
        where: {
          system: { has: systems },
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
              },
            },
          ],
        },
      });

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      return { data: documentsWithPermssions, length: length };
    } else {
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          system: { has: systems },
          organization: {
            realmName: realmName,
          },
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });

      //permissions

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      //permission checking

      const length = await this.prisma.documents.count({
        where: {
          system: systems,
          organization: {
            realmName: realmName,
          },
        },
      });

      return { data: documentsWithPermssions, length: length };
    }
  }

  async findOneOld(documentId, version, versionId) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId} service started`,
        '',
      );

      let document;
      let versionDocs;
      let section, sectionName;
      let downloadAccess;
      const activeUser = await this.prisma.user.findFirst({
        // where: { kcId: user?.id },
      });
      let refDocument = await this.refsService.getAllById(documentId);
      if (version) {
        // const version = await this.getVersionOfDocument(documentId);
        // const refDocs = [];

        // if (version.referenceDocumentsForVersion?.length > 0) {
        //   for (const refDoc of version.referenceDocumentsForVersion) {
        //     refDocs.push({ ...refDoc, currentVersion: refDoc.version });
        //   }
        // }

        document = await this.prisma.documents.findUnique({
          where: {
            id: documentId,
          },
          include: {
            creatorLocation: true,
            creatorEntity: true,
            AdditionalDocumentAdmins: { include: { user: true } },
            doctype: true,
            DocumentVersions: true,
            DocumentWorkFlowHistory: true,
            ReferenceDocuments: true,
          },
        });

        let documentAccessData = document?.doctype?.whoCanDownloadUsers?.map(
          (item) => {
            if (
              item?.id === 'All Users' ||
              item?.id === activeUser.id ||
              item?.id === activeUser.entityId ||
              item?.id === activeUser.locationId
            ) {
              return true;
            }
          },
        );

        downloadAccess = documentAccessData.includes(true);
        const attachmentdetails = await this.getDocumentAttachmentHistory(
          documentId,
        );
        if (
          document.section !== undefined &&
          document.section !== 'undefined' &&
          document !== null &&
          document !== ''
        ) {
          const sectionData = await this.prisma.section.findFirst({
            where: { id: document?.section },
            select: { name: true, id: true },
          });
          section = sectionData?.name || '';
          sectionName = sectionData?.name || '';
        }
        ////console.log('attachment details', attachmentdetails);
        //we wre getting the document only and i am sending
        //if version then only send the other documentInfo and change th link

        if (document?.AdditionalDocumentAdmins) {
          const additionalDocumentAdmins = document.AdditionalDocumentAdmins;
          const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
          return {
            ...document,
            attachmentHistory: attachmentdetails,
            creators: seperatedAdmins.creators,
            reviewers: seperatedAdmins.reviewers,
            approvers: seperatedAdmins.approvers,
            additionalReaders: seperatedAdmins.readers,
            // ReferenceDocuments: refDocs,
            // DocumentVersions: version.versionHistory,
            // DocumentWorkFlowHistory: version.workflowHistory,
            downloadAccess,
            documentLink: document.documentLink,
            documentLinkNew: document.documentLink,
            sectionName,

            // comments: version.commentsForVersion,
            // currentVersion: version.version.versionName,
            // issueNumber: version?.version?.issueNumber,
            // documentName: version.version.documentName,
            // documentNumbering: version.version.documentNumbering,
            // effectiveDate: version.version.effectiveDate,
            // isVersion: true,
            // reasonOfCreation: version.version.reasonOfCreation,
            // description: version.version.description,
          };
        } else {
          return {
            ...document,
            attachmentHistory: attachmentdetails,
            documentLink: document?.documentLink,
            documentLinkNew: document?.documentLink,
            sectionName,
            downloadAccess,
            // ReferenceDocuments: refDocs,
            // DocumentVersions: version.versionHistory,
            // DocumentWorkFlowHistory: version.workflowHistory,
            // documentLink: version.version.versionLink,
            // documentLinkNew: version.version.versionLink,
            // currentVersion: version.version.versionName,
            // comments: version.commentsForVersion,
            // documentName: version.version.documentName,
            // documentNumbering: version.version.documentNumbering,
            // effectiveDate: version.version.effectiveDate,
            // issueNumber: version?.version?.issueNumber,
            // isVersion: true,
            // reasonOfCreation: version.version.reasonOfCreation,
            // description: version.version.description,
          };
        }
      }
      document = await this.prisma.documents.findUnique({
        where: {
          id: documentId,
        },
        include: {
          creatorLocation: true,
          creatorEntity: true,
          AdditionalDocumentAdmins: { include: { user: true } },
          doctype: true,
          DocumentVersions: true,
          DocumentWorkFlowHistory: true,
          ReferenceDocuments: true,
        },
      });
      let documentAccessData = document?.doctype?.whoCanDownloadUsers?.map(
        (item) => {
          if (
            item?.id === 'All Users' ||
            item?.id === activeUser.id ||
            item?.id === activeUser.entityId ||
            item?.id === activeUser.locationId
          ) {
            return true;
          }
        },
      );

      downloadAccess = documentAccessData.includes(true);
      if (
        document?.section !== undefined &&
        document?.section !== 'undefined' &&
        document !== null &&
        document !== ''
      ) {
        const sectionData = await this.prisma.section.findFirst({
          where: { id: document?.section || '' },
          select: { name: true, id: true },
        });
        section = sectionData?.id || '';
        sectionName = sectionData?.name || '';
      }
      const attachmentdetails = await this.getDocumentAttachmentHistory(
        documentId,
      );

      if (document?.countNumber > 1) {
        versionDocs = await this.prisma.documents.findMany({
          where: {
            OR: [
              { documentId: document?.documentId, isVersion: true },
              { id: document?.documentId, isVersion: true },
            ],
          },
        });
      }

      if (document?.AdditionalDocumentAdmins) {
        const additionalDocumentAdmins = document.AdditionalDocumentAdmins;
        const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
        this.logger.log(
          `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId} service successful`,
          '',
        );
        return {
          ...document,
          attachmentHistory: attachmentdetails,
          DocumentVersions: versionDocs || [],
          documentLinkNew: document.documentLink,
          section,
          sectionName,
          downloadAccess,
          // documentState: versionId !== null ? 'OBSOLETE' : document.documentState,
          // documentLinkNew:
          //   versionId !== null
          //     ? document.currentVersion === versionId
          //       ? document.documentLink
          //       : currentDocumentLink?.versionLink
          //     : document.documentLink,
          // isVersion: currentDocumentLink ? false : true,
          creators: seperatedAdmins.creators,
          reviewers: seperatedAdmins.reviewers,
          approvers: seperatedAdmins.approvers,
          additionalReaders: seperatedAdmins.readers,
          ReferenceDocuments: refDocument,
        };
      } else {
        return {
          ...document,
          attachmentHistory: attachmentdetails,
          DocumentVersions: versionDocs || [],
          documentLinkNew: document?.documentLink,
          sectionName,
          downloadAccess,
          // documentState: versionId !== null ? 'OBSOLETE' : document.documentState,
          // isVersion: currentDocumentLink ? false : true,
          // documentLinkNew:
          //   versionId === null
          //     ? document.currentVersion === versionId
          //       ? document.documentLink
          //       : currentDocumentLink?.versionLink
          //     : document.documentLink,
          ReferenceDocuments: refDocument,
        };
      }
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId}  service failed ${err}`,
        '',
      );
    }
  }

  async findOne(documentId: string, user: any) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId}  service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const document = await this.documentModel
        .findOne({
          _id: new ObjectId(documentId),
        })
        .lean();
      if (!document) {
        const errorMessage = `Document with ID ${documentId} not found`;
        this.logger.error(`trace id=${randomNumber} ${errorMessage}`, '');
        throw new NotFoundException(errorMessage);
      }
      const populatedDocument = await this.docUtils.populateDocumentDetails(
        document,
        randomNumber,
        activeUser,
      );

      return populatedDocument;
    } catch (error) {
      // console.log('error in findOne', error);

      if (error instanceof NotFoundException) {
        throw error;
      } else {
        this.logger.error(
          `trace id=${randomNumber} Get api/documents/getSingleDocument/${documentId} service failed: ${
            error.message || error
          }`,
          '',
        );
        throw new InternalServerErrorException(
          'An error occurred while fetching the document!',
        );
      }
    }
  }

  async updatetest(id, createDocumentDto: CreateDocumentDto, file?, user?) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} Patch api/documents/id service started `,
        '',
      );

      //GET THE CURRENT ACTIVE USER
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });
      // console.log('actove user', activeUser);
      // const auditTrail = await auditTrailWatcher(
      //   'Documents',
      //   'Document Control',
      //   'Documents',
      //   user,
      //   activeUser,
      //   '',
      // );
      let payload = JSON.parse(JSON.stringify(createDocumentDto));
      let {
        documentName,
        description,
        documentState,
        documentVersions,
        doctypeId,
        reasonOfCreation,
        documentNumbering,
        documentLink,
        effectiveDate,
        currentVersion,
        tags,
        realmName,
        additionalReaders,
        creators,
        reviewers,
        approvers,
        referenceDocuments,
        entityId,
        retireComment,
        locationId,
        distributionList,
        distributionUsers,
        readAccess,
        readAccessUsers,
        systems,
        refsData,
        locationName,
        section,
        aceoffixUrl,
        versionInfo,
        revertComment,
      } = payload;

      effectiveDate = new Date();
      let nextRevisionDate;
      let newVersion;
      let approvedDate;
      let resultForIssue;
      let issueNumber;
      let versionDoc;
      let notUpdate = false;
      let isAmmend = false;

      let currentDocumentState;

      let version;

      //Find the document to be updated
      // const activeUser = await this.prisma.user.findFirst({
      //   where: {
      //     kcId: user.id,
      //   },
      // });
      const documentToBeUpdated = await this.prisma.documents.findUnique({
        where: {
          id: id,
        },
        include: {
          ReferenceDocuments: true,
          organization: true,
          doctype: true,
        },
      });

      //store the current state of document
      currentDocumentState = documentToBeUpdated.documentState;

      //find the organization where document needs to be created
      // const organization = await this.prisma.organization.findFirst({
      //   where: {
      //     realmName: realmName,
      //   },
      // });
      const currentyear = new Date().getFullYear();
      let year;
      if (documentToBeUpdated?.organization.fiscalYearFormat === 'YY-YY+1') {
        year = await this.organizationService.getFiscalYear(
          documentToBeUpdated?.organization.id,
          currentyear,
        );
      } else {
        const cyear = await this.organizationService.getFiscalYear(
          documentToBeUpdated?.organization.id,
          currentyear,
        );
        year = cyear.toString().slice(-2);
      }
      //GET THE CURRENT ACTIVE USER
      let locations;
      if (activeUser.userType === 'globalRoles') {
        locations = documentToBeUpdated.locationId;
      } else {
        locations = activeUser.locationId;
      }
      const location = await this.prisma.location.findFirst({
        where: {
          id: {
            in: documentToBeUpdated?.doctype?.locationId?.includes('All')
              ? [locations]
              : documentToBeUpdated?.doctype?.locationId,
          },
        },
      });

      let hashValue = '';
      if (aceoffixUrl) {
        if (process.env.IS_OBJECT_STORE === 'true') {
          const revExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'REVIEWER',
          );
          const appExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'APPROVER',
          );
          if (
            documentState === 'DRAFT' ||
            (documentState === 'IN_REVIEW' &&
              currentDocumentState === 'DRAFT') ||
            (currentDocumentState === 'IN_REVIEW' &&
              (documentState === 'Save' || documentState === 'IN_APPROVAL') &&
              revExistinVerInfo !== -1) ||
            (currentDocumentState === 'IN_APPROVAL' &&
              (documentState === 'Save' || documentState === 'PUBLISHED') &&
              appExistinVerInfo !== -1)
          ) {
            documentLink = await this.ociUtils.addEditDocumentToOS(
              aceoffixUrl,
              activeUser,
              locationName,
              true,
            );
          } else {
            documentLink = await this.ociUtils.addEditDocumentToOS(
              aceoffixUrl,
              activeUser,
              locationName,
              false,
            );
          }
          const destDirectory = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            process.env.OB_ORG_NAME.replace('/', '').toLowerCase(),
            location.locationName.toLowerCase(),
            'document',
          );
          const fileName = aceoffixUrl.split('/').pop();

          if (!fs.existsSync(destDirectory)) {
            fs.mkdirSync(destDirectory, { recursive: true });
          }

          const filePath = await this.ociUtils.downloadFile(
            aceoffixUrl,
            path.join(destDirectory, fileName),
          );
          const fileContent = fs.readFileSync(filePath);
          const hash = createHash('sha256');
          hash.update(fileContent);
          hashValue = hash.digest('hex');
        } else {
          const revExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'REVIEWER',
          );
          const appExistinVerInfo = versionInfo.findIndex(
            (item: any) => item.type === 'APPROVER',
          );
          if (
            documentState === 'DRAFT' ||
            (documentState === 'IN_REVIEW' &&
              currentDocumentState === 'DRAFT') ||
            (currentDocumentState === 'IN_REVIEW' &&
              (documentState === 'Save' || documentState === 'IN_APPROVAL') &&
              revExistinVerInfo !== -1) ||
            (currentDocumentState === 'IN_APPROVAL' &&
              (documentState === 'Save' || documentState === 'PUBLISHED') &&
              appExistinVerInfo !== -1)
          ) {
            documentLink = `${
              process.env.SERVER_IP
            }/${documentToBeUpdated?.organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${aceoffixUrl
              .split('/')
              .pop()}`;
          } else {
            documentLink = `${
              process.env.SERVER_IP
            }/${documentToBeUpdated?.organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
              uuid() + '.docx'
            }`;
          }
          const destDirectory = path.join(
            __dirname,
            '..',
            '..',
            '..',
            '..',
            'uploads',
            documentToBeUpdated?.organization.organizationName.toLowerCase(),
            location.locationName.toLowerCase(),
            'document',
          );
          const fileName = documentLink.split('/').pop();

          if (!fs.existsSync(destDirectory)) {
            fs.mkdirSync(destDirectory, { recursive: true });
          }

          const filePath = await this.ociUtils.downloadFile(
            aceoffixUrl,
            path.join(destDirectory, fileName),
          );
          const fileContent = fs.readFileSync(filePath);
          const hash = createHash('sha256');
          hash.update(fileContent);
          hashValue = hash.digest('hex');
        }
      } else if (file) {
        const getRealmLicenseCount = await this.licenseModel.findOne({
          organizationId: activeUser?.organization?.id,
        });
        if (
          getRealmLicenseCount?.addedDocs <=
            getRealmLicenseCount?.authorizedDocs &&
          !!file
        ) {
          if (process.env.IS_OBJECT_STORE === 'true') {
            documentLink = await this.ociUtils.addDocumentToOS(
              file,
              activeUser,
              locationName,
            );
            const fileContent = fs.readFileSync(file.path);
            const hash = createHash('sha256');
            hash.update(fileContent);
            hashValue = hash.digest('hex');
          } else {
            // ${process.env.SERVER_IP}/${organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${file.filename}
            documentLink = `${
              process.env.SERVER_IP
            }/${documentToBeUpdated?.organization.organizationName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
              file.filename
            }`;
            const fileContent = fs.readFileSync(file.path);
            const hash = createHash('sha256');
            hash.update(fileContent);
            hashValue = hash.digest('hex');
          }
        } else {
          console.log('attachmetn count exceeded');
          return;
        }
      }

      if (
        (documentState === 'DRAFT' ||
          (currentDocumentState === 'DRAFT' &&
            documentState === 'IN_REVIEW')) &&
        (file || aceoffixUrl)
      ) {
        const index = versionInfo.findIndex(
          (item: any) => item.type === 'CREATOR',
        );
        versionInfo[index] = {
          type: 'CREATOR',
          id: activeUser.id,
          name: activeUser.firstname + ' ' + activeUser.lastname,
          documentLink: documentLink,
          docCode: hashValue,
        };
      }

      if (
        currentDocumentState === 'IN_REVIEW' &&
        (documentState === 'Save' || documentState === 'IN_APPROVAL')
      ) {
        const creIndex = versionInfo.findIndex(
          (item: any) => item?.type === 'CREATOR',
        );
        let revIndex = versionInfo.findIndex(
          (item: any) => item?.type === 'REVIEWER',
        );
        if (revIndex === -1) {
          versionInfo.push({
            type: 'REVIEWER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: versionInfo[creIndex].documentLink,
            docCode: versionInfo[creIndex]?.docCode,
          });
          revIndex = versionInfo.findIndex(
            (item: any) => item.type === 'REVIEWER',
          );
        }
        if (file || aceoffixUrl) {
          versionInfo[revIndex] = {
            type: 'REVIEWER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: documentLink,
            docCode: hashValue,
          };
        }
      }

      if (
        currentDocumentState === 'IN_APPROVAL' &&
        (documentState === 'Save' || documentState === 'PUBLISHED')
      ) {
        const revIndex = versionInfo.findIndex(
          (item: any) => item.type === 'REVIEWER',
        );
        let appIndex = versionInfo.findIndex(
          (item: any) => item.type === 'APPROVER',
        );
        if (appIndex === -1) {
          versionInfo.push({
            type: 'APPROVER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: versionInfo[revIndex]?.documentLink || '',
            docCode: versionInfo[revIndex]?.docCode,
          });
          appIndex = versionInfo.findIndex(
            (item: any) => item.type === 'APPROVER',
          );
        }
        if (file || aceoffixUrl) {
          versionInfo[appIndex] = {
            type: 'APPROVER',
            id: activeUser.id,
            name: activeUser.firstname + ' ' + activeUser.lastname,
            documentLink: documentLink,
            docCode: hashValue,
          };
        }
      }

      if (documentState == 'PUBLISHED') {
        const date = new Date();

        if (documentToBeUpdated.countNumber > 1) {
          let data;
          if (documentToBeUpdated.countNumber === 2) {
            data = await this.prisma.documents.findFirst({
              where: {
                id: documentToBeUpdated.documentId,
                countNumber: documentToBeUpdated.countNumber - 1,
              },
            });
          } else {
            data = await this.prisma.documents.findFirst({
              where: {
                documentId: documentToBeUpdated.documentId,
                countNumber: documentToBeUpdated.countNumber - 1,
              },
            });
          }

          await this.prisma.documents.update({
            where: { id: data?.id },
            data: {
              nextRevisionDate: null,
            },
          });
        }
        if (
          documentToBeUpdated?.doctype.documentNumbering === 'Serial' &&
          documentState === 'PUBLISHED'
        ) {
          const prefixArr = documentToBeUpdated?.doctype.prefix.split('-');
          const suffixArr = documentToBeUpdated?.doctype.suffix.split('-');
          const entitiId = await this.prisma.entity.findFirst({
            where: { id: documentToBeUpdated.entityId },
          });

          const prefix = generateNumbering(
            prefixArr,
            location.locationId,
            entitiId.entityId,
            year,
          ).join('-');
          const suffix = generateNumbering(
            suffixArr,
            location.locationId,
            entitiId.entityId,
            year,
          ).join('-');

          const presufdata = await prefixAndSuffix(
            this.prisma.prefixSuffix,
            documentToBeUpdated.locationId,
            documentToBeUpdated?.doctype.id,
            documentToBeUpdated?.doctype.organizationId,
            activeUser.id,
            documentToBeUpdated?.doctype.prefix,
            documentToBeUpdated?.doctype.suffix,
            this.serialNumberService.createPrefixSuffix,
          );

          if (
            documentToBeUpdated.documentNumbering === null ||
            documentToBeUpdated.documentNumbering == ''
          ) {
            const documentNumberGenerated =
              await this.serialNumberService.generateSerialNumberClone({
                moduleType: documentToBeUpdated?.doctype.id,
                location: documentToBeUpdated.locationId,
                entity: documentToBeUpdated.entityId,
                year: year,
                createdBy: documentToBeUpdated.createdBy,
                organizationId: documentToBeUpdated.organizationId,
              });

            documentNumbering = suffix
              ? `${prefix}-${documentNumberGenerated}-${suffix}`
              : `${prefix}-${documentNumberGenerated}`;

            documentNumbering = documentNumbering.startsWith('-')
              ? documentNumbering.slice(1)
              : documentNumbering;
          } else {
            documentNumbering = documentToBeUpdated.documentNumbering;
          }

          // //console.log('documentNumbering', documentNumbering);
          // Extract the substring between the two indices

          // const serialnumber =
          //   await this.serialNumberService.generateSerialNumber(query);
          // documentNumbering = serialnumber;
        }
        const revisionfrequencyOfDoctype = await this.prisma.doctype.findUnique(
          {
            where: { id: documentToBeUpdated.doctypeId },
            select: {
              reviewFrequency: true,
              revisionRemind: true,
            },
          },
        );
        nextRevisionDate = await this.calculateNextDate(
          date,
          revisionfrequencyOfDoctype.reviewFrequency,
        );

        // sending mail to users based on distributionList
        //const allUsers = [];
        const documentdetails = await this.prisma.documents.findFirst({
          where: {
            id,
          },
          include: {
            organization: true,
            creatorEntity: true,
            creatorLocation: true,
          },
        });

        // if (documentToBeUpdated.isVersion===false) {
        if (documentToBeUpdated.countNumber === 2) {
          const versionDocs = await this.prisma.documents.findFirst({
            where: {
              countNumber: documentToBeUpdated.countNumber - 1,
              id: documentToBeUpdated.documentId,
            },
          });
          const updateStatus = await this.prisma.documents.update({
            where: {
              id: versionDocs.id,
            },
            data: {
              documentState: 'OBSOLETE',
            },
          });
        } else if (documentToBeUpdated.countNumber > 2) {
          const versionDocs = await this.prisma.documents.findFirst({
            where: {
              countNumber: documentToBeUpdated.countNumber - 1,
              documentId: documentToBeUpdated.documentId,
            },
          });
          const updateStatus = await this.prisma.documents.update({
            where: {
              id: versionDocs.id,
            },
            data: {
              documentState: 'OBSOLETE',
            },
          });
        }

        if (
          documentLink !== null &&
          documentLink !== documentToBeUpdated.documentLink
        ) {
          const attachRec = await this.prisma.documentAttachmentHistory.create({
            data: {
              documentId: id,
              updatedLink: documentLink,
              updatedBy: activeUser.id,
            },
          });
        }
      }

      if (documentState == 'AMMEND') {
        isAmmend = true;
        if (
          documentToBeUpdated?.doctype.currentVersion ===
          documentToBeUpdated.currentVersion
        ) {
          newVersion = 'A';
        } else {
          newVersion = String.fromCharCode(
            documentToBeUpdated.currentVersion.charCodeAt(0) + 1,
          );
        }

        if (
          documentToBeUpdated?.doctype.currentVersion ===
          documentToBeUpdated.currentVersion
        ) {
          const numberValue = parseInt(documentToBeUpdated.issueNumber, 10) + 1;
          resultForIssue = numberValue
            .toString()
            .padStart(documentToBeUpdated?.issueNumber.toString().length, '0');
        }

        documentState = 'PUBLISHED';
        (approvedDate = documentToBeUpdated.approvedDate),
          // issueNumber =
          resultForIssue ? resultForIssue : documentToBeUpdated.issueNumber;
        //create new version with the currently saved version
        if (documentToBeUpdated.countNumber === 1) {
          version = await this.prisma.documents.create({
            data: {
              documentId: id,
              currentVersion: newVersion,
              // documentLink: documentToBeUpdated.documentLink,
              documentLink: documentLink,
              // approvedDate: documentToBeUpdated.approvedDate,
              documentName: documentToBeUpdated.documentName,
              approvers: approvers?.map((value) => value?.id),
              reviewers: reviewers?.map((value) => value?.id),
              creators: [activeUser?.id],
              documentNumbering: documentToBeUpdated.documentNumbering,
              reasonOfCreation: '',
              effectiveDate: documentToBeUpdated.effectiveDate,
              description: payload.reasonOfCreation,
              docType: documentToBeUpdated.docType,
              countNumber: documentToBeUpdated.countNumber + 1,
              issueNumber: resultForIssue
                ? resultForIssue
                : documentToBeUpdated.issueNumber,
              documentState: 'DRAFT',
              revisionReminderFlag: false,
              section: section,
              // user: {
              //   connect: {
              //     id: activeUser.id,
              //   },
              // },
              // description: description,
              system: systems,
              // locationId:documentToBeUpdated.locationId,
              creatorLocation: {
                connect: {
                  id: documentToBeUpdated.locationId,
                },
              },
              // entityId:documentToBeUpdated.entityId,
              creatorEntity: {
                connect: {
                  id: documentToBeUpdated.entityId,
                },
              },
              tags: tags,
              distributionList,
              distributionUsers,
              readAccess,
              readAccessUsers,
              doctype: {
                connect: {
                  id: doctypeId,
                },
              },
              organization: {
                connect: {
                  id: documentToBeUpdated?.organization.id,
                },
              },
              createdBy: activeUser.id,
              isVersion: false,
              // by: activeUser.email,
              versionInfo: [
                {
                  type: 'CREATOR',
                  id: activeUser.id,
                  name: activeUser.firstname + ' ' + activeUser.lastname,
                  documentLink: file
                    ? process.env.IS_OBJECT_STORE === 'true'
                      ? documentLink
                      : `${
                          process.env.SERVER_IP
                        }/${documentToBeUpdated?.organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                          file.filename
                        }`
                    : '',
                  docCode: hashValue,
                },
              ],
            },
          });
          if (
            documentLink !== null &&
            documentLink !== documentToBeUpdated.documentLink
          ) {
            const attachRec =
              await this.prisma.documentAttachmentHistory.create({
                data: {
                  documentId: version.id,
                  updatedLink: documentLink,
                  updatedBy: activeUser.id,
                },
              });
          }
          if (documentToBeUpdated.createdBy !== activeUser.id) {
            const creator = [
              {
                userId: activeUser.id,
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
              },
            ];
            await this.prisma.additionalDocumentAdmins.create({
              data: {
                type: 'CREATOR',
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
                user: {
                  connect: {
                    id: activeUser.id,
                  },
                },
                document: {
                  connect: {
                    id: id,
                  },
                },
              },
            });
          }
        } else {
          version = await this.prisma.documents.create({
            data: {
              documentId: documentToBeUpdated.documentId,
              currentVersion: newVersion,
              // documentLink: documentToBeUpdated.documentLink,
              documentLink: documentLink,
              approvers: approvers?.map((value) => value?.id),
              reviewers: reviewers?.map((value) => value?.id),
              creators: [activeUser?.id],
              // approvedDate: documentToBeUpdated.approvedDate,
              documentName: documentToBeUpdated.documentName,
              documentNumbering: documentToBeUpdated.documentNumbering,
              reasonOfCreation: '',
              effectiveDate: documentToBeUpdated.effectiveDate,
              description: payload.reasonOfCreation,
              docType: documentToBeUpdated.docType,
              countNumber: documentToBeUpdated.countNumber + 1,
              issueNumber: resultForIssue
                ? resultForIssue
                : documentToBeUpdated.issueNumber,
              documentState: 'DRAFT',
              section: section,
              // user: {
              //   connect: {
              //     id: activeUser.id,
              //   },
              // },
              // description: description,
              system: systems,
              // locationId:documentToBeUpdated.locationId,
              creatorLocation: {
                connect: {
                  id: documentToBeUpdated.locationId,
                },
              },
              // entityId:documentToBeUpdated.entityId,
              creatorEntity: {
                connect: {
                  id: documentToBeUpdated.entityId,
                },
              },
              tags: tags,
              distributionList,
              distributionUsers,
              readAccess,
              readAccessUsers,
              doctype: {
                connect: {
                  id: doctypeId,
                },
              },
              organization: {
                connect: {
                  id: documentToBeUpdated?.organization.id,
                },
              },
              createdBy: activeUser.id,
              isVersion: false,
              // by: activeUser.email,
              versionInfo: [
                {
                  type: 'CREATOR',
                  id: activeUser.id,
                  name: activeUser.firstname + ' ' + activeUser.lastname,
                  documentLink: file
                    ? process.env.IS_OBJECT_STORE === 'true'
                      ? documentLink
                      : `${
                          process.env.SERVER_IP
                        }/${documentToBeUpdated?.organization.realmName.toLowerCase()}/${location.locationName.toLowerCase()}/document/${
                          file.filename
                        }`
                    : '',
                  docCode: hashValue,
                },
              ],
            },
          });
          if (
            documentLink !== null &&
            documentLink !== documentToBeUpdated.documentLink
          ) {
            const attachRec =
              await this.prisma.documentAttachmentHistory.create({
                data: {
                  documentId: version.id,
                  updatedLink: documentLink,
                  updatedBy: activeUser.id,
                },
              });
          }

          if (documentToBeUpdated.createdBy !== activeUser.id) {
            const creator = [
              {
                userId: activeUser.id,
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
              },
            ];
            await this.prisma.additionalDocumentAdmins.create({
              data: {
                type: 'CREATOR',
                firstname: activeUser.firstname,
                lastname: activeUser.lastname,
                email: activeUser.email,
                user: {
                  connect: {
                    id: activeUser.id,
                  },
                },
                document: {
                  connect: {
                    id: documentToBeUpdated.documentId,
                  },
                },
              },
            });
          }
        }

        const creatorinfo = await this.prisma.user.findFirst({
          where: {
            id: documentToBeUpdated.createdBy,
          },
        });
        const creator = [
          {
            userId: activeUser.id,
            firstname: activeUser.firstname,
            lastname: activeUser.lastname,
            email: activeUser.email,
          },
        ];

        if (reviewers !== 'undefined') {
          // let reviewUser
          // for (let reviewData of reviewers) {
          const reviwerdata = reviewers?.map((value: any) => value.userId);
          const reviewUser = await this.prisma.user.findMany({
            where: { id: { in: reviwerdata } },
          });
          const linkDocumentWithReviewers = await documentAdminsCreator(
            reviewUser,
            this.prisma.additionalDocumentAdmins,
            version.id,
            'REVIEWER',
          );
        }
        if (approvers !== 'undefined') {
          const appData = approvers?.map((value: any) => value.userId);
          const approverUserData = await this.prisma.user.findMany({
            where: { id: { in: appData } },
          });
          const linkDocumentWithApprovers = await documentAdminsCreator(
            approverUserData,
            this.prisma.additionalDocumentAdmins,
            version.id,
            'APPROVER',
          );
        }

        const linkDocumentWithCreator = await documentAdminsCreator(
          creator,
          this.prisma.additionalDocumentAdmins,
          version.id,
          'CREATOR',
        );

        if (
          documentToBeUpdated?.doctype.currentVersion ===
          documentToBeUpdated.currentVersion
        ) {
          const numberValue = parseInt(documentToBeUpdated.issueNumber, 10) + 1;
          resultForIssue = numberValue
            .toString()
            .padStart(documentToBeUpdated?.issueNumber.toString().length, '0');
        }

        resultForIssue ? resultForIssue : documentToBeUpdated.issueNumber;

        notUpdate = true;

        versionDoc = true;
        await this.prisma.documents.update({
          where: {
            id: id,
          },
          data: {
            isVersion: versionDoc ? versionDoc : documentToBeUpdated.isVersion,
            creators:
              activeUser.id === documentToBeUpdated?.createdBy
                ? documentToBeUpdated?.creators
                : [...documentToBeUpdated?.creators, activeUser?.id],
          },
        });
        const refsDocs = await this.refsService.getAllById(
          documentToBeUpdated.id,
        );
        if (refsDocs.length > 0) {
          const refs = refsData.map((ref: any) => ({
            ...ref,
            refTo: version.id,
          }));

          const createRefs = await this.refsService.create(refs);
        }
      }

      if (documentState === 'Retire') {
        documentState = 'RETIRE_INREVIEW';
      }

      if (documentState === 'Review Complete') {
        documentState = 'RETIRE_INAPPROVE';
      }

      if (documentState === 'discard') {
        documentState = 'PUBLISHED';
      }

      if (documentState === 'Approve Complete') {
        if (documentToBeUpdated.countNumber === 1) {
          documentState = 'RETIRE';
        } else {
          await this.prisma.documents.updateMany({
            where: { documentId: documentToBeUpdated?.documentId },
            data: { documentState: 'RETIRE' },
          });
          await this.prisma.documents.update({
            where: { id: documentToBeUpdated?.documentId },
            data: { documentState: 'RETIRE' },
          });
          documentState = 'RETIRE';
        }
      }

      if (documentState === 'Revert') {
        if (documentToBeUpdated.countNumber !== 1) {
          await this.prisma.documents.updateMany({
            where: { documentId: documentToBeUpdated.documentId },
            data: { documentState: 'OBSOLETE' },
          });
          await this.prisma.documents.update({
            where: { id: documentToBeUpdated.documentId },
            data: { documentState: 'OBSOLETE' },
          });
        }

        documentState = 'PUBLISHED';
      }

      if (!notUpdate) {
        // below variable take separately to update document on the basis of the document state, if save then only content should be updated
        let dataToBeUpdated = {
          doctype: {
            connect: {
              id: doctypeId,
            },
          },
          organization: {
            connect: {
              id: documentToBeUpdated?.organization.id,
            },
          },
          description: description,
          documentName: documentName,
          // documentState,
          issueNumber,
          distributionList,
          distributionUsers,
          readAccess,
          readAccessUsers,
          currentVersion,
          tags: tags,
          reviewers:
            documentState === 'DRAFT' ||
            documentState === 'IN_REVIEW' ||
            documentState === 'SEND_FOR_EDIT' ||
            documentState === 'REVIEW_COMPLETE' ||
            documentState === 'Save' ||
            documentState === 'IN_APPROVAL' ||
            documentState === 'RETIRE_INREVIEW'
              ? reviewers?.map((value) => value?.id)
              : documentToBeUpdated?.reviewers,
          approvers:
            documentState === 'DRAFT' ||
            documentState === 'IN_REVIEW' ||
            documentState === 'SEND_FOR_EDIT' ||
            documentState === 'REVIEW_COMPLETE' ||
            documentState === 'Save' ||
            documentState === 'IN_APPROVAL' ||
            documentState === 'RETIRE_INREVIEW'
              ? approvers?.map((value) => value?.id)
              : documentToBeUpdated?.approvers,
          // documentLink: documentToBeUpdated.documentLink,

          documentLink: documentLink,
          // documentState === 'PUBLISHED'
          //   ? documentToBeUpdated.documentLink
          //   : documentLink,
          nextRevisionDate,
          documentNumbering:
            documentNumbering !== 'null' ? documentNumbering : null,
          reasonOfCreation: reasonOfCreation,
          effectiveDate,
          approvedDate: documentState === 'PUBLISHED' ? effectiveDate : null,
          system: systems,
          isVersion: versionDoc ? versionDoc : documentToBeUpdated.isVersion,
          section: section,
          retireComment,
          versionInfo: versionInfo,
          revertComment: revertComment || '',
        } as any;

        if (documentState === 'Save') {
          dataToBeUpdated = {
            ...dataToBeUpdated,
            documentState: currentDocumentState,
          };
        } else {
          dataToBeUpdated = {
            ...dataToBeUpdated,
            documentState: documentState,
          };
        }
        const updateDocument = await this.prisma.documents.update({
          where: {
            id: id,
          },
          data: {
            ...dataToBeUpdated,
          },
        });
        if (
          documentLink !== null &&
          documentLink !== documentToBeUpdated.documentLink
        ) {
          const attachRec = await this.prisma.documentAttachmentHistory.create({
            data: {
              documentId: updateDocument.id,
              updatedLink: updateDocument.documentLink,
              updatedBy: activeUser.id,
            },
          });
        }
        await this.prisma.referenceDocuments.deleteMany({
          where: {
            documentId: id,
          },
        });

        if (refsData && refsData.length > 0) {
          const refs = refsData.map((ref: any) => ({
            ...ref,
            refTo: id,
          }));

          const updateRefs = await this.refsService.update({
            refs: refs,
            id: id,
          });
          // //////////////console.log('created refs--->', updateRefs);
        }
        const deleteReferenceDocuments =
          await this.prisma.referenceDocuments.deleteMany({
            where: {
              documentId: id,
            },
          });
        if (referenceDocuments) {
          for (let i = 0; i < referenceDocuments.length; i++) {
            const createRefDoc = await this.prisma.referenceDocuments.create({
              data: {
                version: referenceDocuments[i].currentVersion,
                type: referenceDocuments[i].type,
                documentLink: referenceDocuments[i].documentLink,
                documentName: referenceDocuments[i].documentName,
                referenceDocId: referenceDocuments[i].id,
                document: {
                  connect: {
                    id: documentToBeUpdated.id,
                  },
                },
              },
            });
          }
        }

        if (
          documentState === 'DRAFT' ||
          documentState === 'IN_REVIEW' ||
          documentState === 'SEND_FOR_EDIT' ||
          documentState === 'REVIEW_COMPLETE' ||
          documentState === 'Save' ||
          documentState === 'IN_APPROVAL' ||
          documentState === 'RETIRE_INREVIEW'
        ) {
          if (!notUpdate) {
            const deleteAdditionalAdmins =
              await this.prisma.additionalDocumentAdmins.deleteMany({
                where: {
                  document: {
                    id: documentToBeUpdated.id,
                  },
                },
              });
            const creatorinfo = await this.prisma.user.findFirst({
              where: {
                id: documentToBeUpdated.createdBy,
              },
            });
            let creator;
            if (isAmmend) {
              creator = [
                {
                  userId: activeUser.id,
                  firstname: activeUser.firstname,
                  lastname: activeUser.lastname,
                  email: activeUser.email,
                },
              ];
            } else {
              creator = [
                {
                  userId: creatorinfo.id,
                  firstname: creatorinfo.firstname,
                  lastname: creatorinfo.lastname,
                  email: creatorinfo.email,
                },
              ];
            }

            if (reviewers !== undefined) {
              // let reviewUser
              // for (let reviewData of reviewers) {
              const reviwerdata = reviewers?.map((value: any) => value.userId);
              const reviewUser = await this.prisma.user.findMany({
                where: { id: { in: reviwerdata } },
              });
              const linkDocumentWithReviewers = await documentAdminsCreator(
                reviewUser,
                this.prisma.additionalDocumentAdmins,
                documentToBeUpdated.id,
                'REVIEWER',
              );

              //////////console.log('linkDocumentWithReviewers', linkDocumentWithReviewers);
              // }
            }
            ////////////console.log('approvers in edit', approvers);
            if (approvers !== undefined) {
              //////////console.log('approvers inside', approvers);

              // for (let approveData of approvers) {
              const appData = approvers?.map((value: any) => value.userId);
              const approverUserData = await this.prisma.user.findMany({
                where: { id: { in: appData } },
              });
              const linkDocumentWithApprovers = await documentAdminsCreator(
                approverUserData,
                this.prisma.additionalDocumentAdmins,
                documentToBeUpdated.id,
                'APPROVER',
              );
              // }
              //////////console.log('linkDocumentWithApprovers', linkDocumentWithApprovers);
            }

            const linkDocumentWithCreator = await documentAdminsCreator(
              creator,
              this.prisma.additionalDocumentAdmins,
              documentToBeUpdated.id,
              'CREATOR',
            );
          }
        }

        const documentCreated = await this.prisma.documents.findFirst({
          where: {
            id: updateDocument.id,
          },
          include: {
            AdditionalDocumentAdmins: { include: { user: true } },
            organization: true,
            creatorEntity: true,
            creatorLocation: true,
          },
        });
        // Creating workflow history for document
        const createWorkFlowHistory =
          await this.prisma.documentWorkFlowHistory.create({
            data: {
              actionName: updateDocument.documentState,
              user: {
                connect: {
                  id: activeUser.id,
                },
              },
              actionBy: activeUser.email,

              document: {
                connect: {
                  id: updateDocument.id,
                },
              },
            },
          });

        const additionalDocumentAdmins =
          documentCreated.AdditionalDocumentAdmins;
        const seperatedAdmins = adminsSeperators(additionalDocumentAdmins);
        if (updateDocument.documentState === 'IN_APPROVAL') {
          //state changed from inreview to in approval by reviewer and mail to approvers and creator

          const reviewedBy =
            await this.prisma.documentWorkFlowHistory.findFirst({
              where: {
                documentId: updateDocument.id,
                actionName: 'IN_APPROVAL',
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            });
          ////////console.log('inside in approval');
          const user = await this.prisma.user.findUnique({
            where: { id: reviewedBy.userId },
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          });
          const mailRecipients =
            await this.prisma.additionalDocumentAdmins.findMany({
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  { OR: [{ type: 'APPROVER' }, { type: 'CREATOR' }] },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            });
          for (let users of mailRecipients) {
            //////console.log('mail sending in approval');
            await sendMailForApproval(
              user,
              users,
              documentCreated,
              this.emailService.sendEmail,
            );
          }
        }
        if (updateDocument.documentState === 'IN_REVIEW') {
          //documentstate changed from draft to in review on send for review by creator, send mail to all reviewers for this doc
          const createdBy = await this.prisma.documentWorkFlowHistory.findFirst(
            {
              where: {
                documentId: updateDocument.id,
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            },
          );
          const user = await this.prisma.user.findUnique({
            where: {
              id: createdBy.userId,
            },
          });
          const mailRecipients =
            await this.prisma.additionalDocumentAdmins.findMany({
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  // { NOT: { userId: createdBy.userId } },
                  { type: 'REVIEWER' },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            });
          for (let users of mailRecipients) {
            await sendMailForReview(
              user,
              users,
              documentCreated,
              this.emailService.sendEmail,
            );
          }
        }
        if (updateDocument.documentState === 'SEND_FOR_EDIT') {
          // //console.log('inside send for edit');
          const reviewedBy =
            await this.prisma.documentWorkFlowHistory.findFirst({
              where: {
                documentId: updateDocument.id,
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            });
          // //console.log('reviewd by inside send for edit');
          const user = await this.prisma.user.findUnique({
            where: {
              id: reviewedBy.userId,
            },
          });
          const comment = await this.recentCommentForDocument(
            updateDocument.id,
          );
          // if (updateDocument.createdBy !== reviewedBy.userId) {
          const mailRecipients =
            await this.prisma.additionalDocumentAdmins.findMany({
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  { OR: [{ type: 'REVIEWER' }, { type: 'CREATOR' }] },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            });
          for (let users of mailRecipients) {
            await sendMailForEdit(
              user,
              users,
              documentCreated,
              comment,
              this.emailService.sendEmail,
            );
          }
          //}
        }
        if (updateDocument.documentState === 'PUBLISHED') {
          let allUsers = [];
          if (updateDocument.distributionList === 'All Users') {
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          } else if (distributionList === 'All in Units(S)') {
            const allUnits = distributionUsers.map((value: any) => value.id);
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
                locationId: {
                  in: allUnits,
                },
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          } else if (distributionList === 'All in Department(S)') {
            const allEntity = distributionUsers?.map((value: any) => value?.id);
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
                entityId: {
                  in: allEntity,
                },
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          } else if (distributionList === 'Selected Users') {
            const selectedUser = distributionUsers.map(
              (value: any) => value.id,
            );
            const allUser = await this.prisma.user.findMany({
              where: {
                organizationId: updateDocument.organizationId,
                id: {
                  in: selectedUser,
                },
              },
              select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                username: true,
              },
            });
            allUsers.push(...allUser);
          }
          // allUsers.map(async (value: any) => {
          //   ////console.log('documentdetails', documentdetails);
          //   await sendMailPublished(
          //     value,
          //     documentCreated,
          //     this.emailService.sendEmail,
          //   );
          // });
          const approvedBy =
            await this.prisma.documentWorkFlowHistory.findFirst({
              where: {
                documentId: updateDocument.id,
                actionName: 'PUBLISHED',
              },
              select: {
                actionBy: true,
                actionName: true,
                userId: true,
              },
            });
          const user = await this.prisma.user.findUnique({
            where: {
              id: approvedBy.userId,
            },
          });
          ////////////console.log('reviewed by', reviewedBy);
          // if (updateDocument.createdBy !== approvedBy.userId) {
          const docadmins = await this.prisma.additionalDocumentAdmins.findMany(
            {
              where: {
                AND: [
                  { documentId: updateDocument.id },
                  {
                    OR: [
                      { type: 'REVIEWER' },
                      { type: 'CREATOR' },
                      { type: 'APPROVER' },
                    ],
                  },
                ],
              },
              select: {
                firstname: true,
                lastname: true,
                email: true,
              },
            },
          );

          for (let users of docadmins) {
            await sendMailPublishedForDocumentAdmins(
              user,
              users,
              documentCreated,
              this.emailService.sendEmail,
            );
          }

          const mcoeId: any = await this.prisma.role.findFirst({
            where: {
              organizationId: activeUser.organizationId,
              roleName: 'ORG-ADMIN',
            },
          });
          const mrId: any = await this.prisma.role.findFirst({
            where: {
              organizationId: activeUser.organizationId,
              roleName: 'MR',
            },
          });
          const mailRecipients = await this.prisma.user.findMany({
            where: {
              OR: [
                { roleId: { has: mcoeId.id } },
                {
                  AND: [
                    // {
                    //   assignedRole: { some: { roleId: mrId.id } }
                    // },
                    { roleId: { has: mrId.id } },
                    { locationId: activeUser.locationId },
                  ],
                },
              ],
            },
            select: {
              firstname: true,
              lastname: true,
              email: true,
            },
          });
          //////////console.log('mailrecipients in send for edit', mailRecipients);
          // for (let users of mailRecipients) {
          //   await sendMailPublishedForAdmins(
          //     user,
          //     users,
          //     documentCreated,
          //     this.emailService.sendEmail,
          //   );
          // }
        }
        this.logger.log(
          `trace id=${randomNumber} Patch api/documents/${id} service successful`,
          '',
        );

        return {
          ...documentCreated,
          creators: seperatedAdmins.creators,
          reviewers: seperatedAdmins.reviewers,
          approvers: seperatedAdmins.approvers,
          readers: seperatedAdmins.readers,
        };
      }

      return 'successfully created new ammend doc';
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} Patch api/documents/${id} service failed ${error}`,
        '',
      );
      throw new InternalServerErrorException(error);
    }
  }
  async updateDocumentForAmend(id, payload, file?, user?) {
    const traceId = uuid();
    this.logger.log(
      `trace id=${traceId} PATCH updateDocumentForAmend started`,
      '',
    );

    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user?.id || undefined,
          id: user?.id ? undefined : payload?.createdBy,
        },
        include: {
          organization: true,
        },
      });

      const documentToBeUpdated: any = await this.documentModel.findById(id);
      const [docType, organization, location] = await Promise.all([
        this.doctypeModel.findById(documentToBeUpdated?.doctypeId),
        this.prisma.organization.findUnique({
          where: { id: activeUser.organizationId },
        }),
        this.prisma.location.findFirst({
          where: { id: documentToBeUpdated?.locationId },
        }),
      ]);
      //get the version type from associated doctype, increment either alphabet or numeric by 1, once the currentVersion limit is reached then increment the issue number
      const versionType = docType.versionType;
      const currentVersion = documentToBeUpdated.currentVersion;
      const versionLimit = docType.currentVersion;
      const issueNumLength = documentToBeUpdated.issueNumber.length;
      let newVersion = currentVersion;
      let issueNumber = documentToBeUpdated.issueNumber;

      if (versionType === 'Alphabet') {
        if (currentVersion === versionLimit) {
          // Reset version and increment issue number
          newVersion = 'A';
          issueNumber = (parseInt(issueNumber, 10) + 1)
            .toString()
            .padStart(issueNumLength, '0');
        } else {
          // Increment alphabet version
          newVersion = String.fromCharCode(currentVersion.charCodeAt(0) + 1);
        }
      }

      // Handle Numeric versioning
      else if (versionType === 'Numeric') {
        const current = parseFloat(currentVersion);
        const limit = parseFloat(versionLimit);

        if (current >= limit) {
          // Reset version and increment issue number
          newVersion = '0.0';
          // newVersion = docType?.initialVersion;
          issueNumber = (parseInt(issueNumber, 10) + 1)
            .toString()
            .padStart(issueNumLength, '0');
        } else {
          // Increment numeric version by 0.1
          const next = (current + 0.1).toFixed(1);
          newVersion = next;
        }
      }

      let resultForIssue = issueNumber;

      let hashValue = '',
        documentLink = '';
      // console.log('body', body, file);
      if (file) {
        const fileContent = fs.readFileSync(file.path);
        const hash = createHash('sha256');
        hash.update(fileContent);
        hashValue = hash.digest('hex');
        if (process.env.IS_OBJECT_STORE === 'true' && file) {
          documentLink = await this.ociUtils.addDocumentToOSNew(
            file,
            payload?.organizationId,
            payload?.locationName,
          );
        } else {
          const realmName = payload?.realmName?.trim().toLowerCase();
          const locationName = payload?.locationName
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, '_');
          documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
        }
      }

      // console.log('documentLink', documentLink);
      // console.log(
      //   'documentToBeUpdated.documentLink',
      //   documentToBeUpdated.documentLink,
      // );

      const baseDocData = {
        currentVersion: newVersion,

        doctypeId: documentToBeUpdated?.doctypeId,
        documentLink: !!documentLink
          ? documentLink
          : documentToBeUpdated.documentLink,
        documentName: documentToBeUpdated.documentName,
        approvers: documentToBeUpdated?.approvers,
        reviewers: documentToBeUpdated?.reviewers,
        // creators: [activeUser?.id],
        documentNumbering: documentToBeUpdated.documentNumbering,
        // reasonOfCreation: '',
        effectiveDate: documentToBeUpdated.effectiveDate,
        reasonOfCreation: payload.reasonOfCreation,
        issueNumber: resultForIssue
          ? resultForIssue
          : documentToBeUpdated.issueNumber,
        documentState: 'DRAFT',
        section: payload?.section,

        system: payload?.system,
        documentId:
          documentToBeUpdated?.countNumber === 1
            ? documentToBeUpdated?._id?.toString()
            : documentToBeUpdated.documentId,
        locationId: documentToBeUpdated.locationId,
        entityId: documentToBeUpdated.entityId,
        // distributionList: payload?.distributionList,
        // distributionUsers: payload?.distributionUsers,
        // readAccess: payload?.readAccess,
        // readAccessUsers: payload?.readAccessUsers,
        organizationId: documentToBeUpdated.organizationId,
        createdBy: activeUser.id,
        isVersion: false,
        versionInfo: [
          {
            type: 'CREATOR',
            id: activeUser.id,
            name: `${activeUser.firstname} ${activeUser.lastname}`,
            documentLink: !!documentLink
              ? documentLink
              : documentToBeUpdated.documentLink,
            docCode: '',
          },
        ],
        workflowDetails:
          documentToBeUpdated.workflowDetails === 'none' ||
          documentToBeUpdated.workflowDetails === 'default'
            ? documentToBeUpdated.workflowDetails
            : {
                ...documentToBeUpdated.workflowDetails,
                workflow: documentToBeUpdated.workflowDetails.workflow.map(
                  (stage: any) => ({
                    ...stage,
                    status: 'pending',
                    completedBy: [],
                    ownerSettings: stage.ownerSettings.map((group: any[]) =>
                      group.map((condition: any) => ({
                        ...condition,
                        status: 'pending',
                        completedBy: [],
                      })),
                    ),
                  }),
                ),
              },
      };

      // console.log('baseDocData', baseDocData);

      const version = await this.documentModel.create({
        ...baseDocData,
        countNumber: documentToBeUpdated.countNumber + 1,
      });
      // console.log('version', version);

      // if (
      //   payload?.documentLink &&
      //   payload?.documentLink !== documentToBeUpdated.documentLink
      // ) {
      //   await this.documentAttachmentHistoryModel.create({
      //     documentId: version.id,
      //     updatedLink: payload?.documentLink,
      //     updatedBy: activeUser.id,
      //     organizationId: activeUser?.organizationId,
      //   });
      // }

      // if (documentToBeUpdated.createdBy !== activeUser.id) {
      //   await this.additionalDocumentAdminsModel.create({
      //     type: 'CREATOR',
      //     firstname: activeUser.firstname,
      //     lastname: activeUser.lastname,
      //     email: activeUser.email,
      //     userId: activeUser.id,
      //     documentId:
      //       documentToBeUpdated.countNumber === 1
      //         ? activeUser.id
      //         : documentToBeUpdated.documentId,
      //   });
      // }

      const reviewerIds = payload?.reviewers || [];
      const approverIds = payload?.approvers || [];

      // if (reviewerIds.length > 0) {
      //   const reviewers = await this.prisma.user.findMany({
      //     where: { id: { in: reviewerIds } },
      //   });
      //   await documentAdminsCreator(
      //     reviewers,
      //     this.additionalDocumentAdminsModel,
      //     version.id,
      //     'REVIEWER',
      //   );
      // }

      // if (approverIds.length > 0) {
      //   const approvers = await this.prisma.user.findMany({
      //     where: { id: { in: approverIds } },
      //   });
      //   await documentAdminsCreator(
      //     approvers,
      //     this.additionalDocumentAdminsModel,
      //     version.id,
      //     'APPROVER',
      //   );
      // }

      // await documentAdminsCreator(
      //   [
      //     {
      //       userId: activeUser.id,
      //       firstname: activeUser.firstname,
      //       lastname: activeUser.lastname,
      //       email: activeUser.email,
      //     },
      //   ],
      //   this.additionalDocumentAdminsModel,
      //   version.id,
      //   'CREATOR',
      // );

      const updatedDoc = await this.documentModel.findByIdAndUpdate(
        id,
        {
          isVersion: true,
          documentId:
            documentToBeUpdated?.countNumber === 1
              ? id
              : documentToBeUpdated?.documentId,
        },
        { new: true },
      );

      let digiSign = undefined;
      if (activeUser.organization.digitalSignature) {
        digiSign = await this.userService.signDocumentStage({
          userId: activeUser.id,
          docId: id,
          action: 'Amended',
          comment: payload.digiSignComment,
        });
      }

      await this.docUtils.createEntryInDocWorkflowHistory(
        updatedDoc.id,
        activeUser.id,
        'Amended',
        digiSign,
      );

      const refsDocs = await this.refsService.getAllById(
        documentToBeUpdated.id,
      );
      if (refsDocs.length && payload?.refsData) {
        const refs = payload.refsData.map((ref) => ({
          ...ref,
          refTo: version.id,
        }));
        await this.refsService.create(refs);
      }
    } catch (error) {
      this.logger.error(
        `traceid=${traceId} PATCH updateDocumentForAmend failed error=${error}`,
      );
    }
  }
  // async updateDocumentForAmend(id, payload, file?, user?) {
  //   const traceId = uuid();
  //   this.logger.log(
  //     `trace id=${traceId} PATCH updateDocumentForAmend started`,
  //     '',
  //   );

  //   try {
  //     const activeUser = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: user?.id || undefined,
  //         id: user?.id ? undefined : payload?.createdBy,
  //       },
  //     });

  //     const documentToBeUpdated: any = await this.documentModel.findById(id);
  //     const [docType, organization, location] = await Promise.all([
  //       this.doctypeModel.findById(documentToBeUpdated?.doctypeId),
  //       this.prisma.organization.findUnique({
  //         where: { id: activeUser.organizationId },
  //       }),
  //       this.prisma.location.findFirst({
  //         where: { id: documentToBeUpdated?.locationId },
  //       }),
  //     ]);

  //     const isSameVersion =
  //       docType.currentVersion === documentToBeUpdated.currentVersion;
  //     const newVersion = isSameVersion
  //       ? 'A'
  //       : String.fromCharCode(
  //           documentToBeUpdated.currentVersion.charCodeAt(0) + 1,
  //         );

  //     const issueNumber = isSameVersion
  //       ? (parseInt(documentToBeUpdated.issueNumber, 10) + 1)
  //           .toString()
  //           .padStart(documentToBeUpdated.issueNumber.length, '0')
  //       : documentToBeUpdated.issueNumber;
  //     let resultForIssue = isSameVersion
  //       ? issueNumber
  //           .toString()
  //           .padStart(documentToBeUpdated?.issueNumber.toString().length, '0')
  //       : documentToBeUpdated.issueNumber;
  //     // console.log('newversion', newVersion, issueNumber);
  //     console.log('documentto beupdate', documentToBeUpdated?.countNumber);

  //     let hashValue = '',
  //     documentLink = '';
  //   // console.log('body', body, file);
  //   if (file) {
  //     const fileContent = fs.readFileSync(file.path);
  //     const hash = createHash('sha256');
  //     hash.update(fileContent);
  //     hashValue = hash.digest('hex');
  //     if (process.env.IS_OBJECT_STORE === 'true' && file) {
  //       documentLink = await this.ociUtils.addDocumentToOSNew(
  //         file,
  //         payload?.organizationId,
  //         payload?.locationName,
  //       );
  //     } else {
  //       const realmName = payload?.realmName?.trim().toLowerCase();
  //       const locationName = payload?.locationName
  //         ?.trim()
  //         .toLowerCase()
  //         .replace(/\s+/g, '_');
  //       documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/document/${file.filename}`;
  //     }
  //   }

  //   console.log('documentLink', documentLink);
  //   console.log('documentToBeUpdated.documentLink', documentToBeUpdated.documentLink);

  //     const baseDocData = {
  //       currentVersion: newVersion,

  //       doctypeId: documentToBeUpdated?.doctypeId,
  //       documentLink: !!documentLink ? documentLink : documentToBeUpdated.documentLink,
  //       documentName: documentToBeUpdated.documentName,
  //       approvers: documentToBeUpdated?.approvers,
  //       reviewers: documentToBeUpdated?.reviewers,
  //       // creators: [activeUser?.id],
  //       documentNumbering: documentToBeUpdated.documentNumbering,
  //       // reasonOfCreation: '',
  //       effectiveDate: documentToBeUpdated.effectiveDate,
  //       reasonOfCreation: payload.reasonOfCreation,
  //       issueNumber: resultForIssue
  //         ? resultForIssue
  //         : documentToBeUpdated.issueNumber,
  //       documentState: 'DRAFT',
  //       section: payload?.section,

  //       system: payload?.system,
  //       documentId:
  //         documentToBeUpdated?.countNumber === 1
  //           ? documentToBeUpdated?._id?.toString()
  //           : documentToBeUpdated.documentId,
  //       locationId: documentToBeUpdated.locationId,
  //       entityId: documentToBeUpdated.entityId,
  //       // distributionList: payload?.distributionList,
  //       // distributionUsers: payload?.distributionUsers,
  //       // readAccess: payload?.readAccess,
  //       // readAccessUsers: payload?.readAccessUsers,
  //       organizationId: documentToBeUpdated.organizationId,
  //       createdBy: activeUser.id,
  //       isVersion: false,
  //       versionInfo: [
  //         {
  //           type: 'CREATOR',
  //           id: activeUser.id,
  //           name: `${activeUser.firstname} ${activeUser.lastname}`,
  //           documentLink:   !!documentLink ? documentLink : documentToBeUpdated.documentLink,
  //           docCode: '',
  //         },
  //       ],
  //       workflowDetails: documentToBeUpdated.workflowDetails,
  //     };

  //     console.log('baseDocData', baseDocData);

  //     const version = await this.documentModel.create({
  //       ...baseDocData,
  //       countNumber: documentToBeUpdated.countNumber + 1,
  //     });
  //     console.log('version', version);

  //     // if (
  //     //   payload?.documentLink &&
  //     //   payload?.documentLink !== documentToBeUpdated.documentLink
  //     // ) {
  //     //   await this.documentAttachmentHistoryModel.create({
  //     //     documentId: version.id,
  //     //     updatedLink: payload?.documentLink,
  //     //     updatedBy: activeUser.id,
  //     //     organizationId: activeUser?.organizationId,
  //     //   });
  //     // }

  //     // if (documentToBeUpdated.createdBy !== activeUser.id) {
  //     //   await this.additionalDocumentAdminsModel.create({
  //     //     type: 'CREATOR',
  //     //     firstname: activeUser.firstname,
  //     //     lastname: activeUser.lastname,
  //     //     email: activeUser.email,
  //     //     userId: activeUser.id,
  //     //     documentId:
  //     //       documentToBeUpdated.countNumber === 1
  //     //         ? activeUser.id
  //     //         : documentToBeUpdated.documentId,
  //     //   });
  //     // }

  //     const reviewerIds = payload?.reviewers || [];
  //     const approverIds = payload?.approvers || [];

  //     // if (reviewerIds.length > 0) {
  //     //   const reviewers = await this.prisma.user.findMany({
  //     //     where: { id: { in: reviewerIds } },
  //     //   });
  //     //   await documentAdminsCreator(
  //     //     reviewers,
  //     //     this.additionalDocumentAdminsModel,
  //     //     version.id,
  //     //     'REVIEWER',
  //     //   );
  //     // }

  //     // if (approverIds.length > 0) {
  //     //   const approvers = await this.prisma.user.findMany({
  //     //     where: { id: { in: approverIds } },
  //     //   });
  //     //   await documentAdminsCreator(
  //     //     approvers,
  //     //     this.additionalDocumentAdminsModel,
  //     //     version.id,
  //     //     'APPROVER',
  //     //   );
  //     // }

  //     // await documentAdminsCreator(
  //     //   [
  //     //     {
  //     //       userId: activeUser.id,
  //     //       firstname: activeUser.firstname,
  //     //       lastname: activeUser.lastname,
  //     //       email: activeUser.email,
  //     //     },
  //     //   ],
  //     //   this.additionalDocumentAdminsModel,
  //     //   version.id,
  //     //   'CREATOR',
  //     // );

  //     const updatedDoc = await this.documentModel.findByIdAndUpdate(
  //       id,
  //       {
  //         isVersion: true,
  //         documentId:
  //           documentToBeUpdated?.countNumber === 1
  //             ? id
  //             : documentToBeUpdated?.documentId,
  //       },
  //       { new: true },
  //     );

  //     await this.docUtils.createEntryInDocWorkflowHistory(
  //       updatedDoc.id,
  //       activeUser.id,
  //       'Amended',
  //     );

  //     const refsDocs = await this.refsService.getAllById(
  //       documentToBeUpdated.id,
  //     );
  //     if (refsDocs.length && payload?.refsData) {
  //       const refs = payload.refsData.map((ref) => ({
  //         ...ref,
  //         refTo: version.id,
  //       }));
  //       await this.refsService.create(refs);
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `traceid=${traceId} PATCH updateDocumentForAmend failed error=${error}`,
  //     );
  //   }
  // }

  //send userId in payload
  async updateDocumentForRetire(id, payload, file, user) {
    const traceId = uuid();
    this.logger.log(
      `trace id=${traceId} Patch api/documents/updateDocumentForAmend service started`,
      '',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });
      const documentToBeUpdated: any = await this.documentModel.findById({
        id,
      });
      const documentStateFromPayload = payload.documentState;
      let documentState = documentStateFromPayload;

      // Handle state transitions
      switch (documentStateFromPayload) {
        case 'Retire':
          documentState = 'RETIRE_INREVIEW';
          break;
        case 'Review Complete':
          documentState = 'RETIRE_INAPPROVE';
          break;
        case 'discard':
          documentState = 'PUBLISHED';
          break;
        case 'Approve Complete':
          if (documentToBeUpdated.countNumber === 1) {
            documentState = 'RETIRE';
          } else {
            await this.prisma.documents.updateMany({
              where: { documentId: documentToBeUpdated?.documentId },
              data: { documentState: 'RETIRE' },
            });
            documentState = 'RETIRE';
          }
          break;
        case 'Revert':
          if (documentToBeUpdated.countNumber !== 1) {
            await this.prisma.documents.updateMany({
              where: { documentId: documentToBeUpdated.documentId },
              data: { documentState: 'OBSOLETE' },
            });
          }
          documentState = 'PUBLISHED';
          break;
      }

      const updatedData = {
        ...payload,

        reviewers:
          documentState === 'RETIRE_INREVIEW'
            ? payload?.reviewers?.map((r) => r?.id)
            : documentToBeUpdated.reviewers,
        approvers:
          documentState === 'RETIRE_INREVIEW'
            ? payload?.approvers?.map((a) => a?.id)
            : documentToBeUpdated.approvers,
        documentState,
        approvedDate: null,
        isVersion: documentToBeUpdated.isVersion, // Preserve existing version info
        retireComment: payload?.retireComment,
        revertComment: payload?.revertComment || '',
      };

      const updatedDocument = await this.documentModel.findByIdAndUpdate(
        id,
        updatedData,
        { new: true },
      );

      let digiSign = undefined;
      if (activeUser.organization.digitalSignature) {
        digiSign = await this.userService.signDocumentStage({
          userId: activeUser.id,
          docId: id,
          action: 'Retired',
          comment: payload.digiSignComment,
        });
      }

      await this.docUtils.createEntryInDocWorkflowHistory(
        updatedDocument.id,
        payload.userId,
        'Retired',
        digiSign,
      );

      return updatedDocument;
    } catch (error) {
      this.logger.error(
        `trace id=${traceId} error=${error?.message || error}`,
        '',
      );
      throw error;
    }
  }

  async remove(documentId, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    // const auditTrail = await auditTrailWatcher(
    //   'Documents',
    //   'Document Control',
    //   'Documents',
    //   user,
    //   activeUser,
    //   '',
    // );
    let document = await this.prisma.documents.findFirst({
      where: {
        id: documentId,
      },
    });

    if (
      document.documentState === 'DRAFT' ||
      activeUser.id === document.createdBy ||
      user.kcRoles.roles.includes('ORG-ADMIN') ||
      (user.kcRoles.roles.includes('MR') &&
        activeUser.locationId === document.locationId)
    ) {
      const deleteAditionadmins =
        await this.prisma.additionalDocumentAdmins.deleteMany({
          where: {
            documentId: documentId,
          },
          // data: {
          //   deleted: true,
          // },
        });

      if (document.countNumber === 2) {
        const updatedocument = await this.prisma.documents.update({
          where: {
            id: document.documentId,
          },
          data: {
            isVersion: false,
            // deleted: false
          },
        });
      } else if (document.countNumber > 2) {
        const documentToBeVersion = await this.prisma.documents.findFirst({
          where: {
            documentId: document.documentId,
            countNumber: document.countNumber - 1,
          },
        });

        await this.prisma.documents.update({
          where: { id: documentToBeVersion.id },
          data: { isVersion: false },
        });
      }
      // const deletedDocument = await this.prisma.documents.delete({
      //   where: {
      //     id: documentId,
      //   },
      // });
      const deletedDocument = await this.prisma.documents.delete({
        where: {
          id: documentId,
        },
        // data: {
        //   deleted: true,
        // },
      });

      return deletedDocument;
    } else if (
      user.kcRoles.roles.includes('ORG-ADMIN') ||
      (user.kcRoles.roles.includes('MR') &&
        activeUser.locationId === document.locationId)
    ) {
      const deleteAditionadmins =
        await this.prisma.additionalDocumentAdmins.deleteMany({
          where: {
            documentId: documentId,
          },
          // data: {
          //   deleted: true,
          // },
        });

      if (document.countNumber === 2) {
        const updatedocument = await this.prisma.documents.update({
          where: {
            id: document.documentId,
          },
          data: {
            isVersion: false,
            //deleted: false
          },
        });
      } else if (document.countNumber > 2) {
        const documentToBeVersion = await this.prisma.documents.findFirst({
          where: {
            documentId: document.documentId,
            countNumber: document.countNumber - 1,
          },
        });

        await this.prisma.documents.update({
          where: { id: documentToBeVersion.id },
          data: { isVersion: false },
        });
      }

      const deletedDocument = await this.prisma.documents.delete({
        where: {
          id: documentId,
        },
        // data: {
        //   deleted: true,
        // },
      });

      return deletedDocument;
    } else {
      throw new InternalServerErrorException({
        error: 'unable to delete the document by this user',
      });
    }
  }

  async saveFile(filename) {
    filename;
  }

  async createCommentOnDocument(user, createCommentDto: CreateCommentDto) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const comment = await this.prisma.documentComments.create({
      data: {
        commentBy: `${activeUser.firstname} ${activeUser.lastname}`,
        user: { connect: { id: activeUser.id } },
        commentText: createCommentDto.commentText,
        document: {
          connect: {
            id: createCommentDto.documentId,
          },
        },
      },
    });
    return comment;
  }
  async getCommentsForDocument(documentId, version) {
    if (version) {
      try {
        const commentsForVersion = await this.prisma.documentComments.findMany({
          where: {
            AND: [
              { documentId: documentId },
              // {
              //   createdAt: {
              //     lte: versionLast.createdAt,
              //   },
              // },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });
        ////////////console.log('commentsForVersion', commentsForVersion);
        return commentsForVersion;
      } catch (err) {
        // ////////////////console.log('err', err);
      }
    }

    const document = await this.prisma.documents.findFirst({
      where: {
        id: documentId,
      },
    });

    const versions = await this.prisma.documentVersions.findMany({
      where: {
        documentId: documentId,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
    let commentsForDoc;
    if (versions.length > 0) {
      commentsForDoc = await this.prisma.documentComments.findMany({
        where: {
          AND: [
            { documentId: documentId.documentId },
            {
              createdAt: {
                gte: versions[0].createdAt,
              },
            },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    } else {
      commentsForDoc = await this.prisma.documentComments.findMany({
        where: {
          documentId: documentId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      });
    }

    return commentsForDoc;
  }
  async deleteCommentForDocument(commentId) {
    const deletedCommentForDocument = await this.prisma.documentComments.delete(
      {
        where: {
          id: commentId,
        },
      },
    );

    return deletedCommentForDocument;
  }

  async getWorkFlowHistoryforDocument(documentId: string) {
    const workflowHistory = await this.prisma.documentWorkFlowHistory.findMany({
      where: {
        documentId: documentId,
      },
    });

    return workflowHistory;
  }

  async getVersionsforDocument(documentId: string) {
    const getVersionsForDocument = await this.prisma.documentVersions.findMany({
      where: {
        id: documentId,
      },
    });

    return getVersionsForDocument;
  }

  // async getApproverReviewerDocumentDetails(user, documentId) {
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: user.id,
  //     },
  //     include: {
  //       location: true,
  //       entity: true,
  //       documentAdmins: true,
  //     },
  //   });

  //   const currentDocument = await this.prisma.documents.findUnique({
  //     where: {
  //       id: documentId,
  //     },
  //   });

  //   //Check if the active user is reviewr of the document
  //   const isUserApprover = await this.prisma.additionalDocumentAdmins.findFirst(
  //     {
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'APPROVER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     },
  //   );

  //   //Check if the active user is reviewr of the document
  //   const isUserReviewer = await this.prisma.additionalDocumentAdmins.findFirst(
  //     {
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'REVIEWER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     },
  //   );

  //   //Check if the active user is reviewr of the document
  //   // const isUserCreator = await this.prisma.documentAdmins.findFirst({
  //   //   where: {
  //   //     AND: [
  //   //       { doctypeId: currentDocument.doctypeId },
  //   //       { type: 'CREATOR' },
  //   //       { userId: activeUser.id },
  //   //     ],
  //   //   },
  //   // });
  //   const isUserCreator = await this.prisma.documents.findFirst({
  //     where: {
  //       id: documentId,
  //       createdBy: activeUser.id,
  //     },
  //   });
  //   const isAdditionalReader =
  //     await this.prisma.additionalDocumentAdmins.findFirst({
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'READER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     });

  //   //check read acces of doctype
  //   const access = await this.checkPermissionsForPreviewPage(user, documentId);
  //   let optionsArray = [];
  //   if (
  //     isUserApprover ||
  //     isUserCreator ||
  //     isUserReviewer ||
  //     isAdditionalReader ||
  //     access ||
  //     user.kcRoles.roles.includes('ORG-ADMIN')
  //   ) {
  //     const adminsArray = [isUserCreator, isUserReviewer, isUserApprover];
  //     for (let i = 0; i < 3; i++) {
  //       if (i == 0) {
  //         if (
  //           user.kcRoles.roles.includes('ORG-ADMIN') ||
  //           (user.kcRoles.roles.includes('MR') &&
  //             currentDocument.locationId === activeUser.locationId)
  //         ) {
  //           optionsArray.push('Save');
  //         } else if (
  //           adminsArray[i]
  //           //  ||
  //           // (user.kcRoles.roles.includes('ORG-ADMIN') &&
  //           // activeUser.location !== null)
  //         ) {
  //           if (
  //             currentDocument.documentState == 'DRAFT' ||
  //             currentDocument.documentState == 'SEND_FOR_EDIT'
  //           ) {
  //             optionsArray.push('Save as Draft', 'Send for Review');
  //           } else if (currentDocument.documentState == 'IN_REVIEW') {
  //             optionsArray.push('In Review');
  //             optionsArray.push('Save'); //added save option for document in_review to save the content without changing the state
  //           } else if (currentDocument.documentState == 'REVIEW_COMPLETE') {
  //             optionsArray.push('Send for Approval');
  //           } else if (currentDocument.documentState == 'APPROVED') {
  //             optionsArray.push('Publish');
  //           } else if (currentDocument.documentState == 'IN_APPROVAL') {
  //             optionsArray.push('In Approval');
  //             optionsArray.push('Save'); //added save option for document in_approval to save the content without changing the state
  //           } else if (currentDocument.documentState == 'PUBLISHED') {
  //             optionsArray.push('Amend');
  //           } else if (currentDocument.documentState == 'AMMEND') {
  //             optionsArray.push('Save as Draft', 'Send for Review');
  //           }
  //         } else {
  //           if (currentDocument.documentState == 'PUBLISHED') {
  //             optionsArray.push('Amend');
  //           }
  //         }
  //       } else if (i == 1) {
  //         if (adminsArray[i]) {
  //           if (currentDocument.documentState == 'IN_REVIEW') {
  //             optionsArray.push('Send for Edit', 'Review Complete');
  //           }
  //         }
  //       } else {
  //         if (adminsArray[i]) {
  //           if (currentDocument.documentState == 'IN_APPROVAL') {
  //             optionsArray.push('Send for Edit', 'Approve');
  //           }
  //         }
  //       }
  //     }
  //     //filtering duplicate arrays
  //     const finalOptions = [...new Set(optionsArray)];

  //     return finalOptions;
  //   } else {
  //     if (currentDocument.documentState == 'PUBLISHED') {
  //       optionsArray.push('Amend');
  //       return optionsArray;
  //     } else {
  //       throw new ForbiddenException(
  //         'You dont have enough permissions to view this page',
  //       );
  //     }
  //   }
  // }
  // async getApproverReviewerDocumentDetails(user, documentId) {
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: user.id,
  //     },
  //     include: {
  //       location: true,
  //       entity: true,
  //       documentAdmins: true,
  //     },
  //   });

  //   const currentDocument = await this.prisma.documents.findUnique({
  //     where: {
  //       id: documentId,
  //     },
  //   });

  //   // //console.log('currentDocument', currentDocument);
  //   //Check if the active user is reviewr of the document
  //   const isUserApprover = await this.prisma.additionalDocumentAdmins.findFirst(
  //     {
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'APPROVER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     },
  //   );

  //   //Check if the active user is reviewr of the document
  //   const isUserReviewer = await this.prisma.additionalDocumentAdmins.findFirst(
  //     {
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'REVIEWER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     },
  //   );

  //   //Check if the active user is reviewr of the document
  //   // const isUserCreator = await this.prisma.documentAdmins.findFirst({
  //   //   where: {
  //   //     AND: [
  //   //       { doctypeId: currentDocument.doctypeId },
  //   //       { type: 'CREATOR' },
  //   //       { userId: activeUser.id },
  //   //     ],
  //   //   },
  //   // });
  //   const isUserCreator = await this.prisma.documents.findFirst({
  //     where: {
  //       id: documentId,
  //       createdBy: activeUser.id,
  //     },
  //   });
  //   const isAdditionalReader =
  //     await this.prisma.additionalDocumentAdmins.findFirst({
  //       where: {
  //         AND: [
  //           { documentId: documentId },
  //           { type: 'READER' },
  //           { userId: activeUser.id },
  //         ],
  //       },
  //     });

  //   //check read acces of doctype
  //   const access = await this.checkPermissionsForPreviewPage(user, documentId);
  //   let optionsArray = [];
  //   if (
  //     isUserApprover ||
  //     isUserCreator ||
  //     isUserReviewer ||
  //     isAdditionalReader ||
  //     access ||
  //     user.kcRoles.roles.includes('ORG-ADMIN')
  //   ) {
  //     const adminsArray = [isUserCreator, isUserReviewer, isUserApprover];

  //     for (let i = 0; i < 3; i++) {
  //       if (i == 0) {
  //         console.log('this is 1');
  //         {
  //           if (
  //             (currentDocument?.documentState == 'DRAFT' ||
  //               currentDocument?.documentState == 'SEND_FOR_EDIT') &&
  //             isUserCreator
  //           ) {
  //             optionsArray.push('Save as Draft', 'Send for Review');
  //             if (
  //               currentDocument?.documentLink?.endsWith('.docx') ||
  //               currentDocument?.documentLink?.endsWith('.doc') ||
  //               currentDocument?.documentLink?.endsWith('.xlsx') ||
  //               currentDocument?.documentLink?.endsWith('.xls') ||
  //               currentDocument?.documentLink?.endsWith('.pptx') ||
  //               currentDocument?.documentLink?.endsWith('.ppt')
  //             ) {
  //               optionsArray.push('Inline Edit');
  //             }
  //           } else if (currentDocument?.documentState == 'IN_REVIEW') {
  //             optionsArray.push('In Review');
  //             optionsArray.push('Save'); //added save option for document in_review to save the content without changing the state
  //           } else if (currentDocument?.documentState == 'REVIEW_COMPLETE') {
  //             optionsArray.push('Send for Approval');
  //           } else if (currentDocument?.documentState == 'APPROVED') {
  //             optionsArray.push('Publish');
  //           } else if (currentDocument?.documentState == 'IN_APPROVAL') {
  //             optionsArray.push('In Approval');
  //             optionsArray.push('Save'); //added save option for document in_approval to save the content without changing the state
  //           } else if (
  //             currentDocument?.documentState == 'PUBLISHED' &&
  //             currentDocument?.isVersion === false
  //           ) {
  //             if (
  //               currentDocument?.entityId === activeUser.entityId ||
  //               (user.kcRoles.roles.includes('MR') &&
  //                 activeUser.additionalUnits.includes(
  //                   currentDocument?.locationId,
  //                 ))
  //             ) {
  //               optionsArray.push('Amend');
  //             }
  //             if (
  //               user.kcRoles.roles.includes('ORG-ADMIN') ||
  //               (user.kcRoles.roles.includes('MR') &&
  //                 currentDocument.entityId === activeUser.entityId)
  //             ) {
  //               optionsArray.push('Retire');
  //             }
  //           } else if (currentDocument?.documentState == 'AMMEND') {
  //             optionsArray.push('Save as Draft', 'Send for Review');
  //           } else if (
  //             user.kcRoles.roles.includes('ORG-ADMIN') &&
  //             currentDocument?.documentState == 'PUBLISHED' &&
  //             currentDocument?.isVersion === false
  //           ) {
  //             optionsArray.push('Amend');

  //             optionsArray.push('Retire');
  //           } else if (
  //             // user.kcRoles.roles.includes('ORG-ADMIN') ||
  //             // user.kcRoles.roles.includes('MR') &&
  //             currentDocument?.documentState == 'RETIRE'
  //           ) {
  //             const index = optionsArray.indexOf('Save');
  //             if (index !== -1) {
  //               optionsArray.splice(index, 1);
  //             }
  //             if (
  //               user.kcRoles.roles.includes('ORG-ADMIN') ||
  //               user.kcRoles.roles.includes('MR')
  //             ) {
  //               optionsArray.push('Revert');
  //             }
  //           } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
  //             optionsArray.push('Save');
  //           } else if (
  //             adminsArray[i]
  //             //  ||
  //             // (user.kcRoles.roles.includes('ORG-ADMIN') &&
  //             // activeUser.location !== null)
  //           )
  //             if (
  //               user.kcRoles.roles.includes('MR') &&
  //               (currentDocument?.locationId === activeUser.locationId ||
  //                 activeUser?.additionalUnits?.includes(
  //                   currentDocument?.locationId,
  //                 )) &&
  //               currentDocument?.isVersion === false
  //             ) {
  //               optionsArray.push('Save');
  //             }
  //           if (
  //             currentDocument?.documentState == 'PUBLISHED' &&
  //             currentDocument?.isVersion === false
  //           ) {
  //             if (currentDocument?.entityId === activeUser.entityId)
  //               optionsArray.push('Amend');
  //             if (
  //               user.kcRoles.roles.includes('ORG-ADMIN') ||
  //               (user.kcRoles.roles.includes('MR') &&
  //                 currentDocument.entityId === activeUser.entityId)
  //             ) {
  //               optionsArray.push('Retire');
  //             }
  //           }
  //         }
  //       } else if (i == 1) {
  //         if (adminsArray[i]) {
  //           if (currentDocument?.documentState == 'IN_REVIEW') {
  //             optionsArray.push('Send for Edit', 'Review Complete', 'Save');
  //             if (
  //               currentDocument?.documentLink.endsWith('.docx') ||
  //               currentDocument?.documentLink?.endsWith('.doc') ||
  //               currentDocument?.documentLink?.endsWith('.xlsx') ||
  //               currentDocument?.documentLink?.endsWith('.xls') ||
  //               currentDocument?.documentLink?.endsWith('.pptx') ||
  //               currentDocument?.documentLink?.endsWith('.ppt')
  //             ) {
  //               optionsArray.push('Inline Edit');
  //             }
  //           } else if (
  //             // user.kcRoles.roles.includes('ORG-ADMIN') ||
  //             // user.kcRoles.roles.includes('MR') &&
  //             currentDocument?.documentState == 'RETIRE'
  //           ) {
  //             const index = optionsArray.indexOf('Save');
  //             if (index !== -1) {
  //               optionsArray.splice(index, 1);
  //             }
  //             if (
  //               user.kcRoles.roles.includes('ORG-ADMIN') ||
  //               user.kcRoles.roles.includes('MR')
  //             ) {
  //               optionsArray.push('Revert');
  //             }
  //           } else {
  //             if (currentDocument?.documentState == 'RETIRE_INREVIEW') {
  //               // optionsArray.filter((value)=>value !=='Save')
  //               const index = optionsArray.indexOf('Save');
  //               if (index !== -1) {
  //                 optionsArray.splice(index, 1);
  //               }
  //               optionsArray.push('Review Retire', 'discard');
  //             }
  //           }
  //         }
  //       } else {
  //         if (adminsArray[i]) {
  //           if (currentDocument?.documentState == 'IN_APPROVAL') {
  //             optionsArray.push('Send for Edit', 'Approve', 'Save');
  //             if (
  //               currentDocument?.documentLink.endsWith('.docx') ||
  //               currentDocument?.documentLink?.endsWith('.doc') ||
  //               currentDocument?.documentLink?.endsWith('.xlsx') ||
  //               currentDocument?.documentLink?.endsWith('.xls') ||
  //               currentDocument?.documentLink?.endsWith('.pptx') ||
  //               currentDocument?.documentLink?.endsWith('.ppt')
  //             ) {
  //               optionsArray.push('Inline Edit');
  //             }
  //           } else if (
  //             // user.kcRoles.roles.includes('ORG-ADMIN') ||
  //             // user.kcRoles.roles.includes('MR') &&
  //             currentDocument?.documentState == 'RETIRE'
  //           ) {
  //             const index = optionsArray.indexOf('Save');
  //             if (index !== -1) {
  //               optionsArray.splice(index, 1);
  //             }
  //             if (
  //               user.kcRoles.roles.includes('ORG-ADMIN') ||
  //               user.kcRoles.roles.includes('MR')
  //             ) {
  //               optionsArray.push('Revert');
  //             }
  //           } else if (currentDocument?.documentState == 'RETIRE_INAPPROVE') {
  //             const index = optionsArray.indexOf('Save');
  //             if (index !== -1) {
  //               optionsArray.splice(index, 1);
  //             }
  //             optionsArray.push('Approve Retire', 'discard');
  //           }
  //         }
  //       }
  //     }
  //     //filtering duplicate arrays
  //     const finalOptions = [...new Set(optionsArray)];
  //     return finalOptions;
  //   } else {
  //     if (currentDocument?.documentState == 'PUBLISHED') {
  //       if (currentDocument.entityId === activeUser.entityId) {
  //         optionsArray.push('Amend');
  //       }

  //       // optionsArray.push('Retire');

  //       return optionsArray;
  //     } else {
  //       throw new ForbiddenException(
  //         'You dont have enough permissions to view this page',
  //       );
  //     }
  //   }
  // }
  async getApproverReviewerDocumentDetails(user, documentId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        location: true,
        entity: true,
        // documentAdmins: true,
      },
    });
    const objId = new ObjectId(documentId);

    const currentDocument = await this.documentModel.findById(objId);

    // //console.log('currentDocument', currentDocument);
    //Check if the active user is reviewr of the document
    const isUserApprover = currentDocument.approvers.includes(activeUser?.id);

    //Check if the active user is reviewr of the document
    const isUserReviewer = currentDocument?.reviewers?.includes(activeUser?.id);

    //Check if the active user is reviewr of the document
    // const isUserCreator = await this.prisma.documentAdmins.findFirst({
    //   where: {
    //     AND: [
    //       { doctypeId: currentDocument.doctypeId },
    //       { type: 'CREATOR' },
    //       { userId: activeUser.id },
    //     ],
    //   },
    // });
    const isUserCreator = currentDocument?.createdBy === activeUser?.id;

    //check read acces of doctype
    const access = isUserApprover || isUserCreator || isUserReviewer;
    let optionsArray = [];
    if (
      isUserApprover ||
      isUserCreator ||
      isUserReviewer ||
      access ||
      user.kcRoles.roles.includes('ORG-ADMIN')
    ) {
      const adminsArray = [isUserCreator, isUserReviewer, isUserApprover];

      for (let i = 0; i < 3; i++) {
        if (i == 0) {
          // console.log('this is 1');
          {
            if (
              (currentDocument?.documentState == 'DRAFT' ||
                currentDocument?.documentState == 'SEND_FOR_EDIT') &&
              isUserCreator
            ) {
              optionsArray.push('Save as Draft', 'Send for Review');
              if (
                currentDocument?.documentLink?.endsWith('.docx') ||
                currentDocument?.documentLink?.endsWith('.doc') ||
                currentDocument?.documentLink?.endsWith('.xlsx') ||
                currentDocument?.documentLink?.endsWith('.xls') ||
                currentDocument?.documentLink?.endsWith('.pptx') ||
                currentDocument?.documentLink?.endsWith('.ppt')
              ) {
                optionsArray.push('Inline Edit');
              }
            } else if (currentDocument?.documentState == 'IN_REVIEW') {
              optionsArray.push('In Review');
              optionsArray.push('Save'); //added save option for document in_review to save the content without changing the state
            } else if (currentDocument?.documentState == 'REVIEW_COMPLETE') {
              optionsArray.push('Send for Approval');
            } else if (currentDocument?.documentState == 'APPROVED') {
              optionsArray.push('Publish');
            } else if (currentDocument?.documentState == 'IN_APPROVAL') {
              optionsArray.push('In Approval');
              optionsArray.push('Save'); //added save option for document in_approval to save the content without changing the state
            } else if (
              currentDocument?.documentState == 'PUBLISHED' &&
              currentDocument?.isVersion === false
            ) {
              if (
                currentDocument?.entityId === activeUser.entityId ||
                (user.kcRoles.roles.includes('MR') &&
                  activeUser.additionalUnits.includes(
                    currentDocument?.locationId,
                  ))
              ) {
                optionsArray.push('Amend');
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                (user.kcRoles.roles.includes('MR') &&
                  currentDocument.entityId === activeUser.entityId)
              ) {
                optionsArray.push('Retire');
              }
            } else if (currentDocument?.documentState == 'AMMEND') {
              optionsArray.push('Save as Draft', 'Send for Review');
            } else if (
              user.kcRoles.roles.includes('ORG-ADMIN') &&
              currentDocument?.documentState == 'PUBLISHED' &&
              currentDocument?.isVersion === false
            ) {
              optionsArray.push('Amend');

              optionsArray.push('Retire');
            } else if (
              // user.kcRoles.roles.includes('ORG-ADMIN') ||
              // user.kcRoles.roles.includes('MR') &&
              currentDocument?.documentState == 'RETIRE'
            ) {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                user.kcRoles.roles.includes('MR')
              ) {
                optionsArray.push('Revert');
              }
            } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
              optionsArray.push('Save');
            } else if (
              adminsArray[i]
              //  ||
              // (user.kcRoles.roles.includes('ORG-ADMIN') &&
              // activeUser.location !== null)
            )
              if (
                user.kcRoles.roles.includes('MR') &&
                (currentDocument?.locationId === activeUser.locationId ||
                  activeUser?.additionalUnits?.includes(
                    currentDocument?.locationId,
                  )) &&
                currentDocument?.isVersion === false
              ) {
                optionsArray.push('Save');
              }
            if (
              currentDocument?.documentState == 'PUBLISHED' &&
              currentDocument?.isVersion === false
            ) {
              if (currentDocument?.entityId === activeUser.entityId)
                optionsArray.push('Amend');
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                (user.kcRoles.roles.includes('MR') &&
                  currentDocument.entityId === activeUser.entityId)
              ) {
                optionsArray.push('Retire');
              }
            }
          }
        } else if (i == 1) {
          if (adminsArray[i]) {
            if (currentDocument?.documentState == 'IN_REVIEW') {
              optionsArray.push('Send for Edit', 'Review Complete', 'Save');
              if (
                currentDocument?.documentLink.endsWith('.docx') ||
                currentDocument?.documentLink?.endsWith('.doc') ||
                currentDocument?.documentLink?.endsWith('.xlsx') ||
                currentDocument?.documentLink?.endsWith('.xls') ||
                currentDocument?.documentLink?.endsWith('.pptx') ||
                currentDocument?.documentLink?.endsWith('.ppt')
              ) {
                optionsArray.push('Inline Edit');
              }
            } else if (
              // user.kcRoles.roles.includes('ORG-ADMIN') ||
              // user.kcRoles.roles.includes('MR') &&
              currentDocument?.documentState == 'RETIRE'
            ) {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                user.kcRoles.roles.includes('MR')
              ) {
                optionsArray.push('Revert');
              }
            } else {
              if (currentDocument?.documentState == 'RETIRE_INREVIEW') {
                // optionsArray.filter((value)=>value !=='Save')
                const index = optionsArray.indexOf('Save');
                if (index !== -1) {
                  optionsArray.splice(index, 1);
                }
                optionsArray.push('Review Retire', 'discard');
              }
            }
          }
        } else {
          if (adminsArray[i]) {
            if (currentDocument?.documentState == 'IN_APPROVAL') {
              optionsArray.push('Send for Edit', 'Approve', 'Save');
              if (
                currentDocument?.documentLink.endsWith('.docx') ||
                currentDocument?.documentLink?.endsWith('.doc') ||
                currentDocument?.documentLink?.endsWith('.xlsx') ||
                currentDocument?.documentLink?.endsWith('.xls') ||
                currentDocument?.documentLink?.endsWith('.pptx') ||
                currentDocument?.documentLink?.endsWith('.ppt')
              ) {
                optionsArray.push('Inline Edit');
              }
            } else if (
              // user.kcRoles.roles.includes('ORG-ADMIN') ||
              // user.kcRoles.roles.includes('MR') &&
              currentDocument?.documentState == 'RETIRE'
            ) {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              if (
                user.kcRoles.roles.includes('ORG-ADMIN') ||
                user.kcRoles.roles.includes('MR')
              ) {
                optionsArray.push('Revert');
              }
            } else if (currentDocument?.documentState == 'RETIRE_INAPPROVE') {
              const index = optionsArray.indexOf('Save');
              if (index !== -1) {
                optionsArray.splice(index, 1);
              }
              optionsArray.push('Approve Retire', 'discard');
            }
          }
        }
      }
      //filtering duplicate arrays
      const finalOptions = [...new Set(optionsArray)];
      return finalOptions;
    } else {
      if (currentDocument?.documentState == 'PUBLISHED') {
        if (currentDocument.entityId === activeUser.entityId) {
          optionsArray.push('Amend');
        }

        // optionsArray.push('Retire');

        return optionsArray;
      } else {
        throw new ForbiddenException(
          'You dont have enough permissions to view this page',
        );
      }
    }
  }
  async setStatusForDocument(status: string, documenId, user) {
    let approvedDate = new Date();
    let effectiveDate;
    let currentDate = new Date();
    let documentNumbering;

    const currentDocumentInDb = await this.prisma.documents.findUnique({
      where: {
        id: documenId,
      },
      include: {
        doctype: true,
        organization: true,
        creatorEntity: true,
        creatorLocation: true,
      },
    });

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        location: true,
        entity: true,
      },
    });

    //////////////console.log("currentDocumentInDb",currentDocumentInDb)
    //////////////console.log('documentNumbering 1 st', documentNumbering);
    if (
      status === 'SAVE' ||
      status === 'undefined' ||
      status === undefined ||
      status === 'Save'
    ) {
      return;
    }

    if (status === 'PUBLISHED') {
      if (currentDocumentInDb.countNumber > 1) {
        let data;
        if (currentDocumentInDb.countNumber === 2) {
          data = await this.prisma.documents.findFirst({
            where: {
              id: currentDocumentInDb.documentId,
              countNumber: currentDocumentInDb.countNumber - 1,
            },
          });
        } else {
          data = await this.prisma.documents.findFirst({
            where: {
              documentId: currentDocumentInDb.documentId,
              countNumber: currentDocumentInDb.countNumber - 1,
            },
          });
        }

        await this.prisma.documents.update({
          where: { id: data?.id },
          data: {
            nextRevisionDate: null,
          },
        });
      }
      if (!currentDocumentInDb.effectiveDate) {
        ////////////////console.log('inside published setstatus');
        effectiveDate = new Date();
      }

      if (
        currentDocumentInDb.doctype.documentNumbering === 'Serial' &&
        status === 'PUBLISHED'
      ) {
        const prefixArr = currentDocumentInDb.doctype.prefix.split('-');
        const suffixArr = currentDocumentInDb.doctype.suffix.split('-');
        const noOfDocumentsOfOrg = await this.prisma.documents.count({
          where: {
            organization: {
              realmName: currentDocumentInDb.organization.realmName,
            },
          },
        });
        const location = await this.prisma.location.findFirst({
          where: { id: currentDocumentInDb.locationId },
        });

        const entitiId = await this.prisma.entity.findFirst({
          where: { id: currentDocumentInDb.entityId },
        });
        const currentyear = new Date().getFullYear();
        let year;
        if (currentDocumentInDb.organization?.fiscalYearFormat === 'YY-YY+1') {
          year = await this.organizationService.getFiscalYear(
            currentDocumentInDb.organization?.id,
            currentyear,
          );
        } else {
          const cyear = await this.organizationService.getFiscalYear(
            currentDocumentInDb?.organization.id,
            currentyear,
          );
          year = cyear.toString().slice(-2);
        }
        const prefix = generateNumbering(
          prefixArr,
          location.locationId,
          entitiId.entityId,
          year,
        ).join('-');
        const suffix = generateNumbering(
          suffixArr,
          location.locationId,
          entitiId.entityId,
          year,
        ).join('-');

        // const findPrefixAndSuffix = await this.prisma.prefixSuffix.findFirst({})
        if (
          currentDocumentInDb.documentNumbering === null ||
          currentDocumentInDb.documentNumbering === ''
        ) {
          const documentNumberGenerated =
            await this.serialNumberService.generateSerialNumberClone({
              moduleType: currentDocumentInDb.doctype.id,
              location: currentDocumentInDb.locationId,
              entity: currentDocumentInDb.entityId,
              year: year,
              createdBy: currentDocumentInDb.createdBy,
              organizationId: currentDocumentInDb.organizationId,
            });

          documentNumbering = suffix
            ? `${prefix}-${documentNumberGenerated}-${suffix}`
            : `${prefix}-${documentNumberGenerated}`;
          documentNumbering = documentNumbering.startsWith('-')
            ? documentNumbering.slice(1)
            : documentNumbering;
          //////////////console.log("inside documentNumbering",documentNumbering)
        } else {
          documentNumbering = currentDocumentInDb.documentNumbering;
        }
      }

      // const currentDate=new Date()

      const documentdetails = await this.prisma.documents.findFirst({
        where: {
          id: documenId,
        },
        include: {
          organization: true,
          creatorEntity: true,
          creatorLocation: true,
        },
      });

      if (currentDocumentInDb.countNumber === 2) {
        const versionDocs = await this.prisma.documents.findFirst({
          where: {
            countNumber: currentDocumentInDb.countNumber - 1,
            id: currentDocumentInDb.documentId,
          },
        });
        const updateStatus = await this.prisma.documents.update({
          where: {
            id: versionDocs.id,
          },
          data: {
            documentState: 'OBSOLETE',
          },
        });
      } else if (currentDocumentInDb.countNumber > 2) {
        const versionDocs = await this.prisma.documents.findFirst({
          where: {
            countNumber: currentDocumentInDb.countNumber - 1,
            documentId: currentDocumentInDb.documentId,
          },
        });
        const updateStatus = await this.prisma.documents.update({
          where: {
            id: versionDocs.id,
          },
          data: {
            documentState: 'OBSOLETE',
          },
        });
      }
    }
    // if (status == 'APPROVED') {
    //   if (!currentDocumentInDb.approvedDate) {
    //     approvedDate = new Date();
    //   }
    // }

    // Creating workflow history for document
    const createWorkFlowHistory =
      await this.prisma.documentWorkFlowHistory.create({
        data: {
          actionName: status,
          user: {
            connect: {
              id: activeUser.id,
            },
          },
          actionBy: activeUser.email,

          document: {
            connect: {
              id: documenId,
            },
          },
        },
      });

    const revisionfrequencyOfDoctype = await this.prisma.doctype.findUnique({
      where: { id: currentDocumentInDb.doctypeId },
      select: {
        reviewFrequency: true,
        revisionRemind: true,
      },
    });
    const newdate = new Date();
    const nextDate = await this.calculateNextDate(
      newdate,
      revisionfrequencyOfDoctype.reviewFrequency,
    );
    ////////////console.log('documentNumbering', documentNumbering);
    // ////////////console.log('nextRevisiondate', nextDate);
    const currentDocument = await this.prisma.documents.update({
      where: {
        id: documenId,
      },
      data: {
        documentState: status,
        effectiveDate: effectiveDate
          ? effectiveDate
          : currentDocumentInDb.effectiveDate,
        documentNumbering,
        approvedDate: status === 'PUBLISHED' ? approvedDate : effectiveDate,
        nextRevisionDate: status === 'PUBLISHED' ? nextDate : null,
      },
    });
    const currentdocindb = await this.prisma.documents.findUnique({
      where: { id: documenId },
      include: {
        organization: true,
        creatorEntity: true,
        creatorLocation: true,
      },
    });
    //if published send email alerts to document admins,mcoe,mr and distribution list
    if (currentdocindb.documentState === 'PUBLISHED') {
      const allUsers = [];
      if (currentdocindb.distributionList === 'All Users') {
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      } else if (currentdocindb.distributionList === 'All in Units(S)') {
        const allUnits = currentdocindb.distributionUsers.map(
          (value: any) => value.id,
        );
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
            locationId: {
              in: allUnits,
            },
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      } else if (currentdocindb.distributionList === 'All in Department(S)') {
        const allEntity = currentdocindb.distributionUsers.map(
          (value: any) => value.id,
        );
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
            entityId: {
              in: allEntity,
            },
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      } else if (currentdocindb.distributionList === 'Selected Users') {
        const selectedUser = currentdocindb.distributionUsers.map(
          (value: any) => value.id,
        );
        const allUser = await this.prisma.user.findMany({
          where: {
            organizationId: currentdocindb.organizationId,
            id: {
              in: selectedUser,
            },
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            username: true,
          },
        });
        allUsers.push(...allUser);
      }
      // allUsers.map(async (value: any) => {
      //   try {
      //     await sendMailPublished(
      //       value,
      //       currentdocindb,
      //       this.emailService.sendEmail,
      //     );
      //   } catch (error) {
      //     return 'mail not sent';
      //   }
      // });
      const approvedBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          documentId: currentdocindb.id,
          actionName: 'PUBLISHED',
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      // console.log('approved By', approvedBy);
      const user = await this.prisma.user.findUnique({
        where: {
          id: approvedBy.userId,
        },
      });
      const docadmins = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [
            { documentId: currentDocumentInDb.id },
            {
              OR: [
                { type: 'REVIEWER' },
                { type: 'CREATOR' },
                { type: 'APPROVER' },
              ],
            },
          ],
        },
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      });

      for (let users of docadmins) {
        await sendMailPublishedForDocumentAdmins(
          user,
          users,
          currentdocindb,
          this.emailService.sendEmail,
        );
      }

      //////////console.log('reviewed by', reviewedBy);
      // if (updateDocument.createdBy !== approvedBy.userId) {
      const mcoeId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'ORG-ADMIN',
        },
      });
      const mrId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'MR',
        },
      });
      const mailRecipients = await this.prisma.user.findMany({
        where: {
          OR: [
            { roleId: { has: mcoeId.id } },
            {
              AND: [
                { roleId: { has: mrId.id } },
                { locationId: activeUser.locationId },
              ],
            },
          ],
        },
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      });
      ////////console.log('mailrecipients in send for edit', mailRecipients);
      // for (let users of mailRecipients) {
      //   await sendMailPublishedForAdmins(
      //     user,
      //     users,
      //     currentdocindb,
      //     this.emailService.sendEmail,
      //   );
      // }
    }
    //if in approval state send mail to approvers
    if (currentdocindb.documentState === 'IN_APPROVAL') {
      //state changed from inreview to in approval by reviewer and mail to approvers and creator
      const reviewedBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          documentId: currentdocindb.id,
          actionName: 'IN_APPROVAL',
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      //////////console.log('reviewed by', reviewedBy);
      const user = await this.prisma.user.findUnique({
        where: { id: reviewedBy.userId },
        select: {
          firstname: true,
          lastname: true,
          email: true,
        },
      });
      ////////console.log('created by user', user);
      const mailRecipients =
        await this.prisma.additionalDocumentAdmins.findMany({
          where: {
            AND: [
              { documentId: currentdocindb.id },
              { OR: [{ type: 'APPROVER' }, { type: 'CREATOR' }] },
            ],
          },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });
      //////////console.log('mailrecipeinets', mailRecipients);
      for (let users of mailRecipients) {
        await sendMailForApproval(
          user,
          users,
          currentdocindb,
          this.emailService.sendEmail,
        );
      }
    }
    if (currentdocindb.documentState === 'IN_REVIEW') {
      //documentstate changed from draft to in review on send for review by creator, send mail to all reviewers for this doc
      const createdBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          AND: [{ documentId: currentdocindb.id }, { actionName: 'IN_REVIEW' }],
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      //////////console.log('created by', createdBy);
      const user = await this.prisma.user.findUnique({
        where: {
          id: createdBy.userId,
        },
      });
      //////////console.log('user creator', user);
      const mailRecipients =
        await this.prisma.additionalDocumentAdmins.findMany({
          where: {
            AND: [
              { documentId: currentdocindb.id },
              // { NOT: { userId: createdBy.userId } },
              { type: 'REVIEWER' },
            ],
          },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });
      for (let users of mailRecipients) {
        await sendMailForReview(
          user,
          users,
          currentdocindb,
          this.emailService.sendEmail,
        );
      }
    }
    if (currentdocindb.documentState === 'SEND_FOR_EDIT') {
      const reviewedBy = await this.prisma.documentWorkFlowHistory.findFirst({
        where: {
          documentId: currentdocindb.id,
        },
        select: {
          actionBy: true,
          actionName: true,
          userId: true,
        },
      });
      const user = await this.prisma.user.findUnique({
        where: {
          id: reviewedBy.userId,
        },
      });
      const comment = await this.recentCommentForDocument(currentdocindb.id);
      ////////console.log('reviewed by', reviewedBy);
      // if (currentdocindb.createdBy !== reviewedBy.userId) {
      const mailRecipients =
        await this.prisma.additionalDocumentAdmins.findMany({
          where: {
            AND: [
              { documentId: currentdocindb.id },
              { OR: [{ type: 'REVIEWER' }, { type: 'CREATOR' }] },
            ],
          },
          select: {
            firstname: true,
            lastname: true,
            email: true,
          },
        });
      for (let users of mailRecipients) {
        await sendMailForEdit(
          user,
          users,
          currentdocindb,
          comment,
          this.emailService.sendEmail,
        );
      }
      //}
    }

    return currentDocument;
  }

  async getReferenceDocumentSearch(searchNameString: string, realmName, user) {
    const documents = await this.prisma.documents.findMany({
      where: {
        AND: [
          {
            organization: {
              realmName: realmName,
            },
          },
          {
            documentName: {
              contains: searchNameString,

              mode: 'insensitive',
            },
          },
          {
            OR: [
              {
                documentState: 'PUBLISHED',
              },
              {
                documentState: 'APPROVED',
              },
            ],
          },
        ],
      },
    });

    //FILTER REFDOCS ACCORDINGLY IF THE LOGGED IN USER HAS THE PERMISSIONS FOR THE PREVIEW PAGE

    const documentsWithPermssions = [];

    for (const document of documents) {
      const access = await this.checkPermissionsForPreviewPage(
        user,
        document.id,
      );
      if (access.access) {
        documentsWithPermssions.push({ ...document, access: access });
      }
    }

    return documentsWithPermssions;
  }

  async getReferenceDocumentsForDocument(documentId) {
    const referenceDocuments = await this.prisma.referenceDocuments.findMany({
      where: {
        documentId: documentId,
      },
    });

    return referenceDocuments;
  }

  async createReferenceDocuments(
    createReferenceDocuments: CreateReferenceDocumentsDto,
  ) {
    const refDoc = await this.prisma.documents.findUnique({
      where: {
        id: createReferenceDocuments.documentId,
      },
    });

    const createRefDoc = await this.prisma.referenceDocuments.create({
      data: {
        version: refDoc.currentVersion,
        type: createReferenceDocuments.type,
        documentLink: refDoc.documentLink,
        documentName: refDoc.documentName,
        document: {
          connect: {
            id: createReferenceDocuments.idOfDocToBeConnected,
          },
        },
      },
    });

    return createRefDoc;
  }

  async deleteReferenceDocument(refdocId: string) {
    const deleteRefDoc = await this.prisma.referenceDocuments.delete({
      where: {
        id: refdocId,
      },
    });
  }

  async checkPermissionsForPreviewPage(user, documentId) {
    let access = false;

    const currentDocument = await this.prisma.documents.findUnique({
      where: {
        id: documentId,
      },
      include: {
        doctype: true,
      },
    });
    // if (currentDocument.documentState !== 'PUBLISHED') {
    //   access = false;
    //   return {
    //     access,
    //   };
    // }
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    if (
      user?.kcRoles?.roles?.includes('ORG-ADMIN') // if logged in user is org admin return access true
    ) {
      access = true;
      return { access };
    } else {
      //////////////console.log('inside else of checkpermission');
      //else check if he is a creator/reviewer or approver
      let admin = await this.prisma.additionalDocumentAdmins.findMany({
        where: {
          AND: [
            { userId: activeUser.id },
            { documentId: currentDocument.id },
            {
              OR: [
                { type: 'CREATOR' },
                { type: 'APPROVER' },
                { type: 'REVIEWER' },
              ],
            },
          ],
        },
      });
      //////////////console.log('admin in checkpermission', admin);
      if (admin.length > 0) {
        access = true;
        return { access };
      } else {
        //check for other read access options
        const readAccess: any = currentDocument.readAccess;
        if (readAccess === 'All Users') {
          access = true;
          return {
            access,
          };
        } else if (readAccess === 'All in Unit(S)') {
          const creators = await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [{ documentId: currentDocument.id }, { type: 'CREATOR' }],
            },
            include: {
              user: {
                include: {
                  location: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          });

          if (creators) {
            creators.forEach((creator) => {
              if (creator.user.locationId == activeUser.locationId) {
                access = true;
              } else {
                access = false;
              }
            });
          }
          return {
            access,
          };
        } else if (readAccess === 'All in Department(S)') {
          const creators = await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [{ documentId: currentDocument.id }, { type: 'CREATOR' }],
            },
            include: {
              user: {
                include: {
                  entity: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          });

          if (creators) {
            creators.forEach((creator) => {
              if (creator.user.entityId == activeUser.entityId) {
                access = true;
              } else {
                access = false;
              }
            });
          }
          return {
            access,
          };
        } else if (readAccess == 'Selected Users') {
          const creators = await this.prisma.additionalDocumentAdmins.findMany({
            where: {
              AND: [{ documentId: currentDocument.id }, { type: 'READER' }],
            },
            include: {
              user: true,
            },
          });

          if (creators) {
            creators.forEach((creator) => {
              if (creator.user.id == activeUser.id) {
                access = true;
              } else {
                access = false;
              }
            });
          }
          return {
            access,
          };
        }
      }
    }
  }

  async checkIfUserCreatorForDocument(user, documentId) {
    let access = false;
    const currentDocument = await this.prisma.documents.findUnique({
      where: {
        id: documentId,
      },
      include: {
        doctype: true,
      },
    });
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const creators = await this.prisma.additionalDocumentAdmins.findMany({
      where: {
        AND: [
          { documentId: currentDocument.id },
          { type: 'CREATOR' },
          { userId: activeUser.id },
        ],
      },
      include: {
        user: {
          include: {
            location: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // ////////////////console.log("creators", creators)
    if (creators?.length) {
      return true;
    } else {
      return false;
    }
  }

  async getVersionOfDocument(versionId) {
    const version = await this.prisma.documentVersions.findFirst({
      where: {
        id: versionId,
      },
    });

    const versionLast = await this.prisma.documentVersions.findFirst({
      where: {
        documentId: version.documentId,
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const referenceDocumentsForVersion =
      await this.prisma.versionReferenceDocuments.findMany({
        where: {
          AND: [{ versionId: version.id }],
        },
      });

    const commentsForVersion = await this.prisma.documentComments.findMany({
      where: {
        AND: [
          { documentId: version.documentId },
          {
            createdAt: {
              lte: versionLast.createdAt,
            },
          },
        ],
      },
    });
    const workflowHistory = await this.prisma.documentWorkFlowHistory.findMany({
      where: {
        AND: [
          { documentId: versionLast.documentId },
          {
            createdAt: {
              lte: version.createdAt,
            },
          },
        ],
      },
    });

    const versionHistory = await this.prisma.documentVersions.findMany({
      where: {
        AND: [
          { documentId: versionLast.documentId },
          {
            createdAt: {
              lt: versionLast.createdAt,
            },
          },
        ],
      },
    });

    return {
      version: version,
      commentsForVersion: commentsForVersion,
      referenceDocumentsForVersion: referenceDocumentsForVersion,
      workflowHistory: workflowHistory,
      versionHistory: versionHistory,
    };
  }

  async findAllDocs(realmName: string, kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user.entity?.locationId;

      if (locId === undefined) {
        return [];
      }

      const documents = await this.prisma.documents.findMany({
        where: {
          locationId: locId,
          organizationId: user.organizationId,
          documentState: 'PUBLISHED',
          // deleted: false,
        },
      });

      return documents;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async fetchDocumentByEntity(entity: string, kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user.entity?.locationId;

      if (locId === undefined) {
        return [];
      }

      const documents = await this.prisma.documents.findMany({
        where: {
          entityId: entity,
          organizationId: user.organizationId,
          documentState: 'PUBLISHED',
          // deleted: false,
        },
      });

      return documents;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  //not used anywhere(services.spec,ts)
  async findAllDocsByUserEntity(kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user.entity?.locationId;

      const documents = await this.prisma.documents.findMany({
        where: {
          locationId: locId,
          organizationId: user.organizationId,
          entityId: user.entityId,
          //deleted: false,
        },
      });

      return documents;
    } catch (err) {
      // console.error(err);
    }
  }

  async systems(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const systems = await this.System.find({
        organizationId: activeUser.organizationId,
        deleted: false,
      }).select('name');
      return systems;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }

  async entity(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const entity = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          deleted: false,
        },
        select: {
          id: true,
          entityId: true,
          entityName: true,
          entityTypeId: true,
          entityType: true,
          locationId: true,
        },
      });

      return entity;
    } catch (error) {
      throw new ConflictException(error.message);
    }
  }
  async findAll(filterString, page, limit, realmName, user) {
    const skipValue = (page - 1) * Number(limit);

    // ?filter=locationAdmin|value,locationType|something
    let myFilter;

    if (filterString) {
      myFilter = filterString.split(',').map((item) => {
        //locationAdmin|value
        let [fieldName, fieldValue] = item.split('|'); //[locationAdmin,value]
        return { filterField: fieldName, filterString: fieldValue };
      });
    }

    let filterQuery: any;

    if (myFilter) {
      filterQuery = queryGeneartorForDocumentsFilter(myFilter);

      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
              },
              deleted: false,
            },
          ],
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });
      //check permissionforUser
      const length = await this.prisma.documents.count({
        where: {
          AND: [
            ...filterQuery,
            {
              organization: {
                realmName: realmName,
                deleted: false,
              },
            },
          ],
        },
      });

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      return { data: documentsWithPermssions, length: length };
    } else {
      const filteredDocuments = await this.prisma.documents.findMany({
        skip: skipValue,
        take: Number(limit),
        where: {
          organization: {
            realmName: realmName,
            // deleted: false,
          },
        },
        include: {
          doctype: {
            // include: {
            //   location: true,
            // },
          },
        },
        orderBy: {
          documentName: 'asc',
        },
      });

      //permissions

      const documentsWithPermssions = [];

      for (const document of filteredDocuments) {
        const access = await this.checkPermissionsForPreviewPage(
          user,
          document.id,
        );
        const isUserCreator = await this.checkIfUserCreatorForDocument(
          user,
          document.id,
        );

        documentsWithPermssions.push({
          ...document,
          access: access,
          isCreator: isUserCreator,
        });
      }

      //permission checking

      const length = await this.prisma.documents.count({
        where: {
          organization: {
            realmName: realmName,
          },
          // deleted: false,
        },
      });

      return { data: documentsWithPermssions, length: length };
    }
  }

  async findAllPublishedDocuments(body, organizationId, userId) {
    const {
      filterArr = [], // expecting array of {filterField, filterString}
      page = 1, // default page 1
      limit = 10,
      userEntityId,
      userLocationId,
      search = '',
    } = body;
    const skipValue = (page - 1) * Number(limit);

    const baseFilters = await this.docUtils.queryGeneratorForDocumentsFilter(
      filterArr,
    );

    if (search) {
      baseFilters.push({ documentName: { $regex: search, $options: 'i' } });
    }

    const finalQuery = {
      $and: [
        ...baseFilters,
        { documentState: 'PUBLISHED' },
        { organizationId: organizationId },
        { deleted: false },
      ],
    };

    const documents = await this.documentModel
      .find(finalQuery)
      .skip(skipValue)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalDocuments = await this.documentModel.countDocuments({
      ...finalQuery,
      countNumber: 1,
    });
    const populatedDocs = await this.docUtils.populatePublishedListDetails(
      documents,
      userId,
      userEntityId, // add this from session
      userLocationId, // add this from session
    );
    return {
      data: populatedDocs,
      total: totalDocuments,
    };
  }

  async findMyDocuments(body, organizationId, userId) {
    const {
      filterArr = [], // expecting array of {filterField, filterString}
      page = 1, // default page 1
      limit = 10,
      userEntityId,
      userLocationId,
      search = '',
    } = body;
    const skipValue = (page - 1) * Number(limit);
    const baseFilters = await this.docUtils.queryGeneratorForDocumentsFilter(
      filterArr,
    );

    if (search) {
      baseFilters.push({ documentName: { $regex: search, $options: 'i' } });
    }

    // console.log('baseFilters', baseFilters);

    const finalQuery = {
      $and: [
        ...baseFilters,
        { organizationId: organizationId },
        { deleted: false },
        {
          $or: [
            // Case 1: workflowDetails is 'default' and createdBy matches userId
            {
              $and: [
                { workflowDetails: 'default' },
                {
                  $or: [
                    { createdBy: userId },
                    { reviewers: { $in: [userId] } },
                    { approvers: { $in: [userId] } },
                  ],
                },
              ],
            },
            // Case 2: workflowDetails is NOT 'default' and ownerSettings.selectedUsers contains userId
            {
              $and: [
                { workflowDetails: { $ne: 'default' } },
                {
                  $or: [
                    { createdBy: userId },
                    {
                      'workflowDetails.workflow': {
                        $elemMatch: {
                          ownerSettings: {
                            $elemMatch: {
                              $elemMatch: {
                                $or: [
                                  {
                                    ifUserSelect: false,
                                    selectedUsers: userId,
                                  },
                                  {
                                    ifUserSelect: true,
                                    actualSelectedUsers: userId,
                                  },
                                ],
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const documents = await this.documentModel
      .find(finalQuery)
      .skip(skipValue)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // ascending order by document name

    const totalDocuments = await this.documentModel.countDocuments({
      ...finalQuery,
      countNumber: 1,
    });
    const populatedDocs = await this.docUtils.populateDocumentListDetails(
      documents,
      userId,
      userEntityId, // add this from session
      userLocationId, // add this from session
    );

    // console.log('populatedDocs', populatedDocs);
    const groupedDocs = this.docUtils.groupDocumentsWithVersions(populatedDocs);
    // console.log('grouped docs', groupedDocs);
    return {
      data: groupedDocs,
      total: totalDocuments,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findMyFavorites(body, organizationId, userId) {
    const {
      filterArr = [], // expecting array of {filterField, filterString}
      page = 1, // default page 1
      limit = 10,
      userEntityId,
      userLocationId,
      search = '',
    } = body;
    const skipValue = (page - 1) * Number(limit);
    const baseFilters = await this.docUtils.queryGeneratorForDocumentsFilter(
      filterArr,
    );

    if (search) {
      baseFilters.push({ documentName: { $regex: search, $options: 'i' } });
    }

    const finalQuery = {
      $and: [
        { favoriteFor: { $in: [userId] } },
        ...baseFilters,
        { organizationId: organizationId },
        { deleted: false },
      ],
    };

    const documents = await this.documentModel
      .find(finalQuery)
      .skip(skipValue)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // ascending order by document name

    const totalDocuments = await this.documentModel.countDocuments({
      ...finalQuery,
      countNumber: 1,
    });
    const populatedDocs = await this.docUtils.populatePublishedListDetails(
      documents,
      userId,
      userEntityId, // add this from session
      userLocationId, // add this from session
    );
    return {
      data: populatedDocs,
      total: totalDocuments,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findDistributedDocuments(body, organizationId, userId) {
    const {
      filterArr = [],
      page = 1,
      limit = 10,
      userEntityId,
      userLocationId,
      search = '',
    } = body;

    const skipValue = (page - 1) * Number(limit);
    const baseFilters = await this.docUtils.queryGeneratorForDocumentsFilter(
      filterArr,
    );

    if (search) {
      baseFilters.push({ documentName: { $regex: search, $options: 'i' } });
    }

    const distributedFilter = {
      $or: [
        {
          $and: [
            { 'distributionList.type': 'Selected Users' },
            { 'distributionList.ids': userId },
          ],
        },
        // Respective Entity / All in Entities
        {
          $and: [
            {
              'distributionList.type': {
                $in: ['Respective Entity', 'All in Entities'],
              },
            },
            { 'distributionList.ids': userEntityId },
          ],
        },
        // Respective Unit / All in Units
        {
          $and: [
            {
              'distributionList.type': {
                $in: ['Respective Unit', 'All in Units'],
              },
            },
            { 'distributionList.ids': userLocationId },
          ],
        },
        // All Users
        {
          'distributionList.type': 'All Users',
        },
      ],
    };

    const finalQuery = {
      $and: [
        distributedFilter,
        ...baseFilters,
        { deleted: false },
        { documentState: 'PUBLISHED' },
        { organizationId: organizationId },
      ],
    };

    const documents = await this.documentModel
      .find(finalQuery)
      .skip(skipValue)
      .limit(Number(limit))
      .sort({ documentName: 1 });

    const totalDocuments = await this.documentModel.countDocuments({
      ...finalQuery,
      countNumber: 1,
    });

    return {
      data: documents,
      total: totalDocuments,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findInWorkflowDocuments(body, organizationId, userId) {
    const {
      filterArr = [], // expecting array of {filterField, filterString}
      page = 1, // default page 1
      limit = 10,
      userEntityId,
      userLocationId,
      search = '',
    } = body;
    const skipValue = (page - 1) * Number(limit);
    const baseFilters = await this.docUtils.queryGeneratorForDocumentsFilter(
      filterArr,
    );

    if (search) {
      baseFilters.push({ documentName: { $regex: search, $options: 'i' } });
    }

    const finalQuery = {
      $and: [
        ...baseFilters,
        { organizationId: organizationId },
        { deleted: false },
        {
          documentState: { $nin: ['DRAFT', 'PUBLISHED', 'OBSOLETE'] },
        },
        {
          $or: [
            // Case 1: workflowDetails is 'default' and createdBy matches userId
            {
              $and: [
                { workflowDetails: 'default' },
                {
                  $or: [
                    { createdBy: userId },
                    { reviewers: { $in: [userId] } },
                    { approvers: { $in: [userId] } },
                  ],
                },
              ],
            },
            // Case 2: workflowDetails is NOT 'default' and ownerSettings.selectedUsers contains userId
            {
              $and: [
                { workflowDetails: { $ne: 'default' } },
                {
                  $or: [
                    { createdBy: userId },
                    {
                      'workflowDetails.workflow': {
                        $elemMatch: {
                          ownerSettings: {
                            $elemMatch: {
                              $elemMatch: {
                                $or: [
                                  {
                                    ifUserSelect: false,
                                    selectedUsers: userId,
                                  },
                                  {
                                    ifUserSelect: true,
                                    actualSelectedUsers: userId,
                                  },
                                ],
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const documents = await this.documentModel
      .find(finalQuery)
      .skip(skipValue)
      .limit(Number(limit))
      .sort({ createdAt: -1 }); // ascending order by document name

    const totalDocuments = await this.documentModel.countDocuments({
      ...finalQuery,
      countNumber: 1,
    });
    const populatedDocs = await this.docUtils.populateDocumentListDetails(
      documents,
      userId,
      userEntityId, // add this from session
      userLocationId, // add this from session
    );

    // console.log('populatedDocs', populatedDocs);
    const groupedDocs = this.docUtils.groupDocumentsWithVersions(populatedDocs);
    // console.log('grouped docs', groupedDocs);
    return {
      data: groupedDocs,
      total: totalDocuments,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async deleteDocumentWithVersions(documentId: string) {
    const randomNumber = uuid();
    try {
      this.logger.log(
        `trace id=${randomNumber} DELETE api/documents/${documentId} initiated`,
        '',
      );

      const document = await this.documentModel.findById(documentId).lean();

      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Case 1: It's a parent document (no `documentId` field or same as _id)
      if (
        !document.documentId ||
        document._id.toString() === document.documentId.toString()
      ) {
        // Find all child versions
        const childDocs = await this.documentModel
          .find({ documentId: document._id })
          .lean();

        const childIds = childDocs.map((d) => d._id);

        // Mark all child docs as deleted
        await this.documentModel.deleteMany(
          { _id: { $in: childIds } },
          { $set: { deleted: true } },
        );

        // Mark parent doc as deleted
        await this.documentModel.deleteOne({ _id: document._id });

        return {
          message: `Parent document and ${childIds.length} version(s) deleted.`,
        };
      }

      // Case 2: It's a child version → only delete this one
      await this.documentModel.deleteOne({ _id: documentId });

      return { message: 'Versioned document deleted.' };
    } catch (error) {
      this.logger.error(
        `trace id=${randomNumber} DELETE /api/documents failed: ${
          error.message || error
        }`,
      );
      throw new InternalServerErrorException('Failed to delete document');
    }
  }

  async getDocWorkflowHistory(documentId: string) {
    const randomName: string = uuid();
    try {
      this.logger.log(
        `trace id=${randomName}, GET /api/documents/getDocWorkflowHistory started`,
        '',
      );

      // 1. Get all history records for the given document
      const history = await this.docWorkflowHistoyModel
        .find({ documentId: documentId })
        .sort({ createdAt: 1 }) // oldest first
        .lean();

      if (!history.length) return [];

      // 2. Extract all unique user IDs
      const userIds = Array.from(new Set(history.map((h) => h.actionBy)));

      // 3. Fetch user details
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          username: true,
          avatar: true,
          roleId: true, // Include roleId to later get roleName
        },
      });

      // 4. Collect unique roleIds
      const roleIds: string[] = Array.from(
        new Set(
          users
            .flatMap((user) => user.roleId || []) // Flatten the arrays
            .filter(Boolean), // Remove any undefined/null
        ),
      );
      // console.log('roleIDs', roleIds);
      // 5. Fetch role names
      const roles = await this.prisma.role.findMany({
        where: { id: { in: roleIds } },
        select: {
          id: true,
          roleName: true,
        },
      });
      // console.log('roles', roles);
      const formatRoleName = (name: string) => {
        if (name === 'ORG-ADMIN') return 'MCOE';
        if (name === 'MR') return 'IMS Co-ordinator';
        return name;
      };
      // 6. Create maps
      const roleMap = new Map(roles.map((r) => [r.id, r.roleName]));
      // console.log('roleMap', roleMap);
      const userMap = new Map(
        users
          .map((user) => ({
            ...user,
            roles: (user.roleId || [])
              .map((id) => roleMap.get(id))
              .filter(Boolean)
              .map(formatRoleName), // Apply formatting here
          }))
          .map((user) => [user.id, user]),
      );
      // 7. Enrich history
      const enrichedHistory = history.map((entry) => ({
        ...entry,
        userDetails: userMap.get(entry.actionBy) || null,
      }));

      return enrichedHistory;
    } catch (error) {
      this.logger.error(
        `trace id=${randomName}, GET /api/documents/getDocWorkflowHistory failed ${error}`,
        'documents.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getFilterOptions(orgId: string, query: any) {
    const traceId = uuid();
    this.logger.log(
      `trace id=${traceId}, GET /api/documents/getFilterOptions`,
      'documents.service.ts',
    );

    try {
      const {
        view = 'all-docs',
        userId,
        userLocationId,
        userEntityId,
        userEntityName,
        userLocationName,
      } = query;

      const userEntityOption = {
        id: userEntityId,
        entityName: userEntityName,
      };

      const userLocationOption = {
        id: userLocationId,
        locationName: userLocationName,
      };

      let filter: any = { organizationId: orgId, deleted: false };

      if (view === 'my-docs') {
        filter.$or = [
          { createdBy: userId },
          { reviewers: { $in: [userId] } },
          { approvers: { $in: [userId] } },
        ];
      }

      if (view === 'favorites') {
        filter.$or = [
          { favoriteFor: { $in: [userId] } },
          {
            $and: [
              { 'distributionList.type': 'Selected Users' },
              { 'distributionList.ids': userId },
            ],
          },
          {
            $and: [
              {
                'distributionList.type': {
                  $in: ['Respective Entity', 'All in Entities'],
                },
              },
              { 'distributionList.ids': userEntityId },
            ],
          },
          {
            $and: [
              {
                'distributionList.type': {
                  $in: ['Respective Unit', 'All in Units'],
                },
              },
              { 'distributionList.ids': userLocationId },
            ],
          },
          {
            'distributionList.type': 'All Users',
          },
        ];
      }

      if (view === 'inWorkflow') {
        filter.$and = [
          {
            documentState: {
              $nin: ['DRAFT', 'PUBLISHED', 'OBSOLETE'],
            },
          },
          {
            $or: [
              // Case 1: workflowDetails is 'default' and createdBy matches userId
              {
                $and: [
                  { workflowDetails: 'default' },
                  {
                    $or: [
                      { createdBy: userId },
                      { reviewers: { $in: [userId] } },
                      { approvers: { $in: [userId] } },
                    ],
                  },
                ],
              },
              // Case 2: workflowDetails is NOT 'default' and ownerSettings.selectedUsers contains userId
              {
                $and: [
                  { workflowDetails: { $ne: 'default' } },
                  {
                    $or: [
                      { createdBy: userId },
                      {
                        'workflowDetails.workflow': {
                          $elemMatch: {
                            ownerSettings: {
                              $elemMatch: {
                                $elemMatch: {
                                  $or: [
                                    {
                                      ifUserSelect: false,
                                      selectedUsers: userId,
                                    },
                                    {
                                      ifUserSelect: true,
                                      actualSelectedUsers: userId,
                                    },
                                  ],
                                },
                              },
                            },
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];
        // filter.documentState = {
        //   $nin: ['DRAFT', 'PUBLISHED', 'OBSOLETE'],
        // };
      }

      const allDocs = await this.documentModel
        .find(filter)
        .select('doctypeId system entityId locationId');

      const usedDoctypeIds = new Set<string>();
      const usedSystemIds = new Set<string>();
      const usedEntityIds = new Set<string>();
      const usedLocationIds = new Set<string>();

      for (const doc of allDocs) {
        doc.doctypeId && usedDoctypeIds.add(String(doc.doctypeId));
        doc.entityId && usedEntityIds.add(String(doc.entityId));
        doc.locationId && usedLocationIds.add(String(doc.locationId));
        (doc.system || []).forEach(
          (s: string) => s && usedSystemIds.add(String(s)),
        );
      }

      const [docTypes, locations, systems, entities] = await Promise.all([
        this.doctypeModel
          .find({ _id: { $in: Array.from(usedDoctypeIds) } })
          .select('_id documentTypeName'),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(usedLocationIds) } },
          select: { id: true, locationName: true },
          orderBy: { locationName: 'asc' },
        }),
        this.System.find({ _id: { $in: Array.from(usedSystemIds) } }).select(
          '_id type name',
        ),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(usedEntityIds) } },
          select: { id: true, entityName: true },
          orderBy: { entityName: 'asc' },
        }),
      ]);

      const statusList = [
        'DRAFT',
        'IN_REVIEW',
        'IN_APPROVAL',
        'PUBLISHED',
        'Sent_For_Edit',
        'OBSOLETE',
      ];

      if (view === 'my-docs') {
        // Merge and remove duplicates by `id`
        const uniqueEntitiesMap = new Map();
        [...entities, userEntityOption].forEach((entity) => {
          if (entity?.id) {
            uniqueEntitiesMap.set(entity.id, entity);
          }
        });

        const uniqueLocationsMap = new Map();
        [...locations, userLocationOption].forEach((location) => {
          if (location?.id) {
            uniqueLocationsMap.set(location.id, location);
          }
        });

        return {
          docTypes,
          locations: Array.from(uniqueLocationsMap.values()),
          systems,
          entities: Array.from(uniqueEntitiesMap.values()),
          statuses: statusList,
        };
      }
      // console.log('doctypes', docTypes);
      return {
        docTypes,
        locations,
        systems,
        entities,
        statuses: statusList,
      };
    } catch (error) {
      this.logger.error(
        `trace id=${traceId}, GET /api/documents/getFilterOptions service failed ${error}`,
        'documents.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  //not used anywhere
  async displayAuditDocs(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    const allDocuments = await this.prisma.documents.findMany({
      where: {
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
        OR: [{ documentState: 'IN_REVIEW' }, { documentState: 'PUBLISHED' }],
      },
    });
    const countAllDocuments = await this.prisma.documents.count({
      where: {
        organizationId: activeUser.organizationId,
        createdBy: `${activeUser.firstname} ${activeUser.lastname}`,
        OR: [{ documentState: 'IN_REVIEW' }, { documentState: 'PUBLISHED' }],
      },
    });

    return { documents: allDocuments, count: countAllDocuments };
  }

  async filterValue(userId, query) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValue service started`,
        '',
      );

      const {
        searchLocation,
        searchBusinessType,
        searchEntity,
        searchSystems,
        searchDoctype,
        searchUser,
      } = query;
      // ////////////////console.log('query', query);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });

      let allLocation = [];
      let businessTypes = [];
      let allSystem = [];
      let allEntity = [];
      let allDoctype = [];
      let allUser = [];
      if (searchDoctype) {
        allDoctype = await this.prisma.doctype.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              documentTypeName: {
                contains: searchDoctype,
                mode: 'insensitive',
              },
            },
          },
        });
      }
      if (searchLocation) {
        allLocation = await this.prisma.location.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              deleted: false,
              locationName: { contains: searchLocation, mode: 'insensitive' },
            },
          },
        });
      }

      if (searchBusinessType) {
        businessTypes = await this.prisma.businessType.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              deleted: false,
              name: { contains: searchBusinessType, mode: 'insensitive' },
            },
          },
        });
      }

      if (searchEntity) {
        allEntity = await this.prisma.entity.findMany({
          where: {
            AND: {
              organizationId: activeUser.organizationId,
              deleted: false,
              entityName: { contains: searchEntity, mode: 'insensitive' },
            },
          },
        });
      }

      if (searchSystems) {
        allSystem = await this.System.find({
          $and: [
            { organizationId: activeUser.organizationId },
            { deleted: false },
            { name: { $regex: searchSystems, $options: 'i' } },
          ],
        });
      }
      if (searchUser) {
        allUser = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            username: { contains: searchUser, mode: 'insensitive' },
            deleted: false,
          },
          include: { location: { select: { id: true, locationName: true } } },
        });
      }
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValue service successful`,
        '',
      );
      return {
        locations: allLocation,
        businessTypes: businessTypes,
        entity: allEntity,
        allSystems: allSystem,
        allDoctype: allDoctype,
        allUser,
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/documents/filerValue  service failed ${err}`,
        '',
      );
      throw new NotFoundException(err);
    }
  }

  async filterValueNew(user, query) {
    const randomNumber = uuid();

    try {
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValueNew service started`,
        '',
      );
      const { locationId } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let [allLocation, allEntity, allDoctype, allUser, allSystem]: any =
        await Promise.all([
          this.prisma.location.findMany({
            where: { organizationId: activeUser.organizationId },
            select: { locationName: true, id: true },
            orderBy: { locationName: 'asc' },
          }),
          this.prisma.entity.findMany({
            where: {
              organizationId: activeUser.organizationId,
              locationId: locationId ?? activeUser.locationId,
              deleted: false,
            },
            select: { id: true, entityName: true },
            orderBy: { entityName: 'asc' },
          }),
          this.prisma.doctype.findMany({
            where: {
              organizationId: activeUser.organizationId,
              locationId: {
                hasSome: ['All', locationId ?? activeUser.locationId],
              },
            },
            select: { id: true, documentTypeName: true },
            orderBy: { documentTypeName: 'asc' },
          }),
          this.prisma.user.findMany({
            where: {
              organizationId: activeUser.organizationId,
              locationId: locationId ?? activeUser.locationId,
            },
            select: { id: true, username: true },
            orderBy: { username: 'asc' },
          }),
          this.System.find({
            $and: [
              { organizationId: activeUser.organizationId },
              { deleted: false },
            ],
          }),
        ]);
      this.logger.log(
        `trace id=${randomNumber} Get api/documents/filerValueNew service successful`,
        '',
      );

      return {
        locations: allLocation,
        // businessTypes: businessTypes,
        entity: allEntity,
        allSystems: allSystem,
        allDoctype: allDoctype,
        allUser,
      };
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} Get api/documents/filerValueNew  service failed ${err}`,
        '',
      );
    }
  }

  async calculateNextDate(startDate, monthsToAdd) {
    const date = new Date(startDate);

    // Add the specified number of months to the date
    if (
      monthsToAdd !== null &&
      monthsToAdd !== 'null' &&
      monthsToAdd !== undefined &&
      monthsToAdd !== 'undefined'
    ) {
      date.setMonth(date.getMonth() + monthsToAdd);
    } else {
      date.setMonth(date.getMonth() + 120);
    }

    // Return the result as a JavaScript Date object
    return date;
  }

  async updateDateForNextRevision(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const documents = await db
      .collection('Documents')
      .find({
        $expr: {
          $and: [
            {
              $eq: [
                {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: { $toDate: '$nextRevisionDate' },
                  },
                },
                {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: { $toDate: '$approvedDate' },
                  },
                },
              ],
            },
            {
              $ne: ['$nextRevisionDate', null], // Check if nextRevisionDate exists
            },
          ],
        },
      })
      .toArray(); // Get documents as an array

    // Step 2: Process each document and prepare update operations
    const updatePromises = documents.map((doc) => {
      const newNextRevisionDate = new Date(
        new Date(doc.approvedDate).setFullYear(
          new Date(doc.approvedDate).getFullYear() + 1,
        ),
      ); // Add 1 year to approvedDate

      return db.collection('Documents').updateOne(
        { _id: doc._id }, // Use the document ID to find the specific document
        {
          $set: {
            nextRevisionDate: newNextRevisionDate,
          },
        },
      );
    });

    // Step 3: Execute all updates
    const results = await Promise.all(updatePromises);
    return results;
  }

  async revisionReminder(orgId) {
    const documentoforg = await this.prisma.documents.findMany({
      where: {
        organizationId: orgId,
        documentState: 'PUBLISHED',
      },
    });

    for (let document of documentoforg) {
      const approvedDate = await this.prisma.documents.findFirst({
        where: { id: document.id },
        include: {
          organization: true,
          creatorLocation: true,
          doctype: true,
          creatorEntity: true,
        },
      });
      // console.log('approveddate', approvedDate);
      const nextdate = new Date(approvedDate.nextRevisionDate);
      const currentDate = new Date();
      const timeDifferenceMs = nextdate.getTime() - currentDate.getTime();
      const revisionreminderdays = approvedDate.doctype.revisionRemind;
      //////////////console.log('revisionreminder days', revisionreminderdays);

      // Convert the time difference to days
      const daysDifference = Math.floor(
        timeDifferenceMs / (1000 * 60 * 60 * 24),
      );
      const depthead = await this.entityService.getEntityHead(
        approvedDate.entityId,
      );
      // console.log('departmenthead', depthead);
      const doccreator = await this.prisma.user.findUnique({
        where: {
          id: approvedDate.createdBy,
        },
        // include: {
        //   location: true,
        // },
      });

      const data1: any = {
        revisionReminderFlag: true,
      };
      // ////////////console.log('before if');
      if (daysDifference <= revisionreminderdays) {
        for (let user of depthead) {
          // console.log(
          //   'send mail to dept head and doc creator',
          //   user,
          //   doccreator,
          // );
          await sendRevisionReminderMail(
            user,
            approvedDate,
            this.emailService.sendEmail,
          );
        }
        await sendRevisionReminderMail(
          doccreator,
          approvedDate,
          this.emailService.sendEmail,
        );
        const revisionflag = await this.prisma.documents.update({
          where: {
            id: document.id,
          },
          data: data1,
        });
      }
    }
  }
  async getDocumentAttachmentHistory(documentId) {
    const randomName: string = uuid();
    try {
      this.logger.log(
        `trace id=${randomName}, GET /getDocumentAttachmentHistory/${documentId} `,
        '',
      );
      const result = await this.prisma.documentAttachmentHistory.findMany({
        where: {
          documentId: documentId,
        },
      });
      let details = [];
      for (let doc of result) {
        let user = await this.prisma.user.findFirst({
          where: {
            id: doc.updatedBy,
          },
        });
        let data: any = {
          attachment: doc.updatedLink,
          updatedBy: user.username,
          updatedAt: doc.updatedAt,
        };
        details.push(data);
      }
      details.sort((a, b) => b.updatedAt - a.updatedAt);
      return details;
    } catch (error) {
      this.logger.error(
        `trace id=${randomName}, GET /getDocumentAttachmentHistory/${documentId} failed `,
      );
      return new NotFoundException(error);
    }
  }
  // async restoreDocument(documentId) {
  //   //////console.log('restore doc', documentId);
  //   const randomName: string = uuid();
  //   try {
  //     this.logger.log(
  //       `trace id=${randomName}, Patch /restoredocument/${documentId} `,
  //       '',
  //     );
  //     const docstatus = await this.prisma.documents.update({
  //       where: {
  //         id: documentId,
  //       },
  //       data: {
  //         deleted: false,
  //       },
  //     });
  //     const admins = await this.prisma.additionalDocumentAdmins.updateMany({
  //       where: {
  //         id: documentId,
  //       },
  //       data: {
  //         deleted: false,
  //       },
  //     });
  //   } catch (error) {
  //     this.logger.error(`could not restore doc${documentId}`);
  //     ////console.log('unable to restore doc');
  //     return new NotFoundException();
  //   }
  // }

  async recentCommentForDocument(documentId) {
    try {
      this.logger.log(
        `getting recent comment for document Id${documentId}`,
        'document.service.ts',
      );
      const comments = await this.prisma.documentComments.findMany({
        where: {
          documentId: documentId,
        },
        orderBy: {
          updatedAt: 'desc', // Sorting in descending order
        },
        take: 1, // Limiting the result to one comment (the most recent)
      });
      // //console.log('recent comment', comments[0]);
      return comments[0].commentText;
    } catch (error) {
      this.logger.log(
        ` recentCommentForDocument function failed for docid${documentId}`,
        'document.service.ts',
      );
    }
  }

  async addDocumentToOS(file, locationName) {
    const fs = require('fs');
    const getObjectStoreContents = await this.prisma.connectedApps.findFirst({
      where: {
        sourceName: process.env.CONNECTED_APPS_OB,
      },
    });

    //console.log('getObjectStoreContents', getObjectStoreContents);
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
    const bucketName = process.env.BUCKET_NAME;
    const objectName =
      process.env.OB_ORG_NAME +
      locationName +
      '/' +
      uuid() +
      '-' +
      file?.originalname.split(' ').join('');
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

  async addEditDocumentToOS(file, locationName, sameFile) {
    const fs = require('fs');
    const path = require('path');

    const destDirectory = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads',
      process.env.OB_ORG_NAME.replace('/', '').toLowerCase(),
      locationName.toLowerCase(),
      'document',
    );
    const fileName = file.split('/').pop();

    if (!fs.existsSync(destDirectory)) {
      fs.mkdirSync(destDirectory, { recursive: true });
    }

    const filePath = await this.downloadFile(
      file,
      path.join(destDirectory, fileName),
    );
    const fileContent = fs.readFileSync(filePath);

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
    const bucketName = process.env.BUCKET_NAME;
    let objectName = '';
    if (sameFile) {
      objectName = process.env.OB_ORG_NAME + locationName + '/' + fileName;
    } else {
      objectName =
        process.env.OB_ORG_NAME +
        locationName +
        '/' +
        uuid() +
        '-' +
        file.split('/').pop().split('-').pop();
    }
    let contentType;
    if (file.split('/').pop().split('.').pop() === 'pdf') {
      contentType = 'application/pdf';
    }
    if (file.split('/').pop().split('.').pop() === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    client.putObject({
      namespaceName: process.env.NAMESPACE,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  async downloadFile(urlString, destPath) {
    return new Promise((resolve, reject) => {
      const url = require('url');
      const http = require('http');
      const parsedUrl = url.parse(urlString);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const file = fs.createWriteStream(destPath);
      const request = protocol
        .get(urlString, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              resolve(destPath);
            });
          });
        })
        .on('error', (error) => {
          fs.unlink(destPath, () => {
            reject(error);
          });
        });
    });
  }
  async getMyDeptMyLocCount(user, data) {
    try {
      const { location, entity } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      // documentState: 'PUBLISHED',
      let whereCondition = {};

      if (
        location !== undefined &&
        location !== 'undefined' &&
        location?.length > 0
      ) {
        whereCondition = { ...whereCondition, location: { in: location } };
      }

      if (
        entity !== undefined &&
        entity !== 'undefined' &&
        entity?.length > 0
      ) {
        whereCondition = { ...whereCondition, entityId: { in: entity } };
      }

      const locresult = await this.prisma.documents.findMany(
        {
          where: {
            locationId: activeUser.locationId,
            documentState: 'PUBLISHED',
          },
        },
        // whereCondition,
      );
      const locfilteredDocumentIds = locresult.map((doc) => doc.id);
      const locChartData = await this.getChartData(
        locfilteredDocumentIds,
        activeUser,
      );

      const deptresult = await this.prisma.documents.findMany({
        where: {
          entityId: activeUser.entityId,
          documentState: 'PUBLISHED',
        },
      });
      const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
      const deptChartData = await this.getChartData(
        deptFilteredDocumentIds,
        activeUser,
      );
      // this.logger.log(``)

      return {
        locresult: locresult.length,
        locChartData: locChartData,
        docData: deptresult,
        deptresult: deptresult.length,
        deptchartData: deptChartData,
      };
    } catch (error) {
      this.logger.error(
        `GET /api/documents/myDeptmyLocForDashboard failed ${error}`,
      );
    }
  }
  async getChartData(ids, activeUser) {
    let whereCondition = {
      organizationId: activeUser.organizationId,

      id: { in: ids },
    };
    //doc type grouping
    const docTypeChartResult = await this.prisma.documents.groupBy({
      by: ['docType'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    // const docTypedocStatusChartResult = await this.prisma.documents.groupBy({
    //   by: ['docType', 'documentState'],
    //   where: {
    //     ...whereCondition,
    //     // documentState: 'PUBLISHED',
    //   },
    //   _count: {
    //     _all: true,
    //   },
    // });
    // console.log('doctypedocstatusresult', docTypedocStatusChartResult);
    const docStateChartResult = await this.prisma.documents.groupBy({
      by: ['documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const docMonthGroupResult = await this.prisma.documents.findMany({
      where: {
        ...whereCondition,
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });

    // Grouping documents by month
    const groupedByMonth = docMonthGroupResult.reduce((acc, doc) => {
      const createdAt = new Date(doc.createdAt);
      const monthYear = `${createdAt.getFullYear()}-${
        createdAt.getMonth() + 1
      }`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }

      acc[monthYear].push(doc);
      return acc;
    }, {});
    // console.log('grouped by month', groupedByMonth);
    const deptChartResult = await this.prisma.documents.groupBy({
      by: ['entityId'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });
    // console.log('depat chart result', deptChartResult);

    // Extract counts and entityIds from deptChartResult
    const entityCounts = deptChartResult.map((item) => item._count._all);
    const entityIds = deptChartResult.map((item) => item.entityId);

    // Fetch entity names for the entity IDs in the result
    const entities = await this.prisma.entity.findMany({
      where: {
        id: {
          in: entityIds,
        },
      },
    });

    // Create a map of entityId to entity name
    const entityIdToNameMap = {};
    entities.forEach((entity) => {
      entityIdToNameMap[entity.id] = entity.entityName;
    });

    // Map entity names to deptChartResult
    const entityLabels = entityIds.map(
      (id) => entityIdToNameMap[id] || 'Unknown',
    );
    // Map entity names to deptChartResult
    const deptChartDataWithNames = {
      lables: entityLabels,
      count: entityCounts,
    };
    // console.log('deptchartwithnames', deptChartDataWithNames);

    const systemWiseChartResult = await this.prisma.documents.groupBy({
      by: ['system', 'documentState'],
      _count: true,
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
    });
    const systemLabels = [];
    const systemCountData = [];
    const docstates = [];

    // Extract unique system IDs
    const uniqueSystemIds = Array.from(
      new Set(systemWiseChartResult.flatMap((data) => data.system)),
    );

    // Fetch system names for all unique system IDs
    const systems = await this.System.find({
      _id: { $in: uniqueSystemIds },
    }).exec();

    // Create a map to convert system IDs to system names
    const idToNameMap = new Map(
      systems.map((system) => [system.id, system.name]),
    );

    // Replace system IDs with system names in the systemWiseChartData
    const systemWiseChartDataWithNames = systemWiseChartResult.map((data) => ({
      ...data,
      system: data.system.map((id) => idToNameMap.get(id) || id), // Replace IDs with names
    }));

    systemWiseChartDataWithNames.forEach((result) => {
      const systemNames = result.system.join(', ');
      const count = result._count;
      const documentState = result.documentState;

      // Push system names, count, and document state into respective arrays
      systemLabels.push(systemNames);
      systemCountData.push(count);
      docstates.push(documentState);
    });
    const systemwiseChartData = {
      labels: systemLabels,
      counts: systemCountData,
      documentStates: docstates,
    };
    const docTypeChartData = {
      labels: docTypeChartResult.map((result) => result.docType),
      count: docTypeChartResult.map((result) => result._count._all),
    };

    const docStateChartData = {
      labels: docStateChartResult.map((result) => result.documentState),
      count: docStateChartResult.map((result) => result._count._all),
    };
    return {
      docTypeChartData: docTypeChartData,
      docStateChartData: docStateChartData,
      systemwiseChartData: systemwiseChartData,
      deptChartData: deptChartDataWithNames,
      monthwiseChartData: groupedByMonth,
      // statuswiseChartData: doctypedocstatusChartData,
    };
  }
  async getChartDataForStatuswise(ids, activeUser) {
    let whereCondition = {
      organizationId: activeUser.organizationId,

      id: { in: ids },
    };
    //doc type grouping
    const docTypeChartResult = await this.prisma.documents.groupBy({
      by: ['docType'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const docTypedocStatusChartResult = await this.prisma.documents.groupBy({
      by: ['docType', 'documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });
    const docStateChartResult = await this.prisma.documents.groupBy({
      by: ['documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const docMonthGroupResult = await this.prisma.documents.findMany({
      where: {
        ...whereCondition,
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });

    // Grouping documents by month
    const groupedByMonth = docMonthGroupResult.reduce((acc, doc) => {
      const createdAt = new Date(doc.createdAt);
      const monthYear = `${createdAt.getFullYear()}-${
        createdAt.getMonth() + 1
      }`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }

      acc[monthYear].push(doc);
      return acc;
    }, {});
    const deptChartResult = await this.prisma.documents.groupBy({
      by: ['entityId', 'documentState'],
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
      _count: {
        _all: true,
      },
    });

    const entityCounts = deptChartResult.map((item) => item._count._all);
    const entityIds = deptChartResult.map((item) => item.entityId);
    const documentStates = deptChartResult.map((item) => item.documentState);

    // Fetch entity names for the entity IDs in the result
    const entities = await this.prisma.entity.findMany({
      where: {
        id: {
          in: entityIds,
        },
      },
    });

    // Create a map of entityId to entity name
    const entityIdToNameMap = {};
    entities.forEach((entity) => {
      entityIdToNameMap[entity.id] = entity.entityName;
    });

    // Map entity names to deptChartResult
    const entityLabels = entityIds.map(
      (id) => entityIdToNameMap[id] || 'Unknown',
    );

    // Map entity names to deptChartResult
    const deptChartDataWithNames = {
      labels: entityLabels,
      counts: entityCounts,
      documentStates: documentStates,
    };
    // console.log('deptchartwithnames', deptChartDataWithNames);

    const systemWiseChartResult = await this.prisma.documents.groupBy({
      by: ['system', 'documentState'],
      _count: true,
      where: {
        ...whereCondition,
        // documentState: 'PUBLISHED',
      },
    });
    const systemLabels = [];
    const systemCountData = [];
    const docstates = [];

    // Extract unique system IDs
    const uniqueSystemIds = Array.from(
      new Set(systemWiseChartResult.flatMap((data) => data.system)),
    );

    // Fetch system names for all unique system IDs
    const systems = await this.System.find({
      _id: { $in: uniqueSystemIds },
    }).exec();

    // Create a map to convert system IDs to system names
    const idToNameMap = new Map(
      systems.map((system) => [system.id, system.name]),
    );

    // Replace system IDs with system names in the systemWiseChartData
    const systemWiseChartDataWithNames = systemWiseChartResult.map((data) => ({
      ...data,
      system: data.system.map((id) => idToNameMap.get(id) || id), // Replace IDs with names
    }));

    systemWiseChartDataWithNames.forEach((result) => {
      const systemNames = result.system.join(', ');
      const count = result._count;
      const documentState = result.documentState;

      // Push system names, count, and document state into respective arrays
      systemLabels.push(systemNames);
      systemCountData.push(count);
      docstates.push(documentState);
    });
    const systemwiseChartData = {
      labels: systemLabels,
      counts: systemCountData,
      documentStates: docstates,
    };
    const deptChartData = {
      labels: systemLabels,
      counts: systemCountData,
      documentStates: documentStates,
    };

    const docTypeChartData = {
      labels: docTypeChartResult.map((result) => result.docType),
      count: docTypeChartResult.map((result) => result._count._all),
    };
    const doctypedocstatusChartData = {
      data: docTypedocStatusChartResult.map((result) => ({
        docType: result.docType,
        documentState: result.documentState,
        count: result._count._all,
      })),
    };

    const docStateChartData = {
      labels: docStateChartResult.map((result) => result.documentState),
      count: docStateChartResult.map((result) => result._count._all),
    };
    return {
      docTypeChartData: docTypeChartData,
      docStateChartData: docStateChartData,
      systemwiseChartData: systemwiseChartData,
      deptChartData: deptChartDataWithNames,
      monthwiseChartData: groupedByMonth,
      statuswiseChartData: doctypedocstatusChartData,
    };
  }
  async getMyDeptMyLocCountForTheCurrentYear(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const currentYear = new Date().getFullYear();
    const locresult = await this.prisma.documents.findMany({
      where: {
        locationId: activeUser.locationId,
        documentState: 'PUBLISHED',
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartData(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        entityId: activeUser.entityId,
        documentState: 'PUBLISHED',
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const deptfilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartData(
      deptfilteredDocumentIds,
      activeUser,
    );

    return {
      locresult: locresult,
      locChartData: locChartData,
      docData: deptresult,
      deptresult: deptresult,
      deptChartData: deptChartData,
    };
  }
  async getMyDeptMyLocRevisedCount(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const currentYear = new Date().getFullYear();
    const locresult = await this.prisma.documents.findMany({
      where: {
        locationId: activeUser.locationId,
        documentState: 'PUBLISHED',
        countNumber: {
          gt: 1,
        },
        currentVersion: {
          not: 'A',
        },
        documentId: {
          not: null,
        },
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartData(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        entityId: activeUser.entityId,
        documentState: 'PUBLISHED',
        countNumber: {
          gt: 1,
        },
        currentVersion: {
          not: 'A',
        },
        documentId: {
          not: null,
        },
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });
    const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartData(
      deptFilteredDocumentIds,
      activeUser,
    );

    return {
      locresult: locresult,
      locChartData: locChartData,
      docData: deptresult,
      deptresult: deptresult,
      deptChartData: deptChartData,
    };
  }

  async getMyDeptMyLocRevisionDueCount(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const currentDate = new Date(); //get the current date
    // Calculate the date for two months from now
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2);

    const locresult = await this.prisma.documents.findMany({
      where: {
        OR: [
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate within next two months
              gte: currentDate,
              lte: twoMonthsFromNow,
            },
          },
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate in the past
              lt: currentDate,
            },
          },
        ],
        locationId: activeUser.locationId,
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartData(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        OR: [
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate within next two months
              gte: currentDate,
              lte: twoMonthsFromNow,
            },
          },
          {
            nextRevisionDate: {
              // Documents with nextRevisionDate in the past
              lt: currentDate,
            },
          },
        ],
        entityId: activeUser.entityId,
      },
    });
    const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartData(
      deptFilteredDocumentIds,
      activeUser,
    );
    return {
      locresult: locresult,
      locChartData: locChartData,
      deptresult: deptresult,
      docData: deptresult,
      deptChartData: deptChartData,
    };
  }

  async getMyDeptMyLocStatuswiseCount(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const locresult = await this.prisma.documents.findMany({
      where: {
        locationId: activeUser.locationId,
        OR: [
          { documentState: 'IN_REVIEW' },
          { documentState: 'SEND_FOR_EDIT' },
          { documentState: 'IN_APPROVAL' },
          { documentState: 'DRAFT' },
        ],
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });
    const locfilteredDocumentIds = locresult.map((doc) => doc.id);
    const locChartData = await this.getChartDataForStatuswise(
      locfilteredDocumentIds,
      activeUser,
    );
    const deptresult = await this.prisma.documents.findMany({
      where: {
        entityId: activeUser.entityId,
        OR: [
          { documentState: 'IN_REVIEW' },
          { documentState: 'SEND_FOR_EDIT' },
          { documentState: 'IN_APPROVAL' },
          { documentState: 'DRAFT' },
        ],
      },
      select: {
        id: true,
        doctypeId: true,
        docType: true,
        locationId: true,
        entityId: true,
        createdAt: true,
        documentState: true,
        system: true,
      },
    });
    const deptFilteredDocumentIds = deptresult.map((doc) => doc.id);
    const deptChartData = await this.getChartDataForStatuswise(
      deptFilteredDocumentIds,
      activeUser,
    );
    return {
      locresult: locresult,
      locChartData: locChartData,
      docData: locresult,
      deptresult: deptresult,
      deptChartData: deptChartData,
    };
  }
  async filterChartData(queryParams, user) {
    const filterObj: any = {};

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    // Check if queryParams.filter is truthy
    if (!!queryParams) {
      // Add properties to filterObj if they exist in queryParams

      if (queryParams.entityId) {
        filterObj.entityId = queryParams.entityId;
      }

      if (queryParams.locationId) {
        filterObj.locationId = queryParams.locationId;
      }
      if (queryParams.businessId) {
        filterObj.businessId = queryParams.businessId;
      }
      if (queryParams.functionId) {
        filterObj.functionId = queryParams.functionId;
      }
      if (queryParams.businessTypeId) {
        filterObj.businessTypeId = queryParams.businessTypeId;
      }
    }
    let resultingIds = [];
    let whereCondition: any = {};
    // Use the getTableQuery function to generate the MongoDB aggregation pipeline
    const aggregationPipeline = await this.getChartQuery(
      filterObj,
      activeUser.organizationId,
    );
    const client = new MongoClient(process.env.MONGO_DB_URI1);
    await client.connect();
    const db = client.db(process.env.MONGO_DB_NAME);
    const documents = await db
      .collection('Documents')
      .aggregate(aggregationPipeline)
      .toArray();

    // Adjust the Prisma queries based on the fetched MongoDB documents
    const filteredDocumentIds = documents.map((doc) => doc._id);

    if (!!queryParams.filter) {
      resultingIds = filteredDocumentIds;
    }

    const chartData = await this.getChartData(filteredDocumentIds, activeUser);
    return chartData;
  }
  async getChartQuery(filter: ChartFilter, organizationId: string) {
    const aggregationPipeline = [];
    const matchStage = {
      $match: {
        organizationId: organizationId,
      },
    };
    aggregationPipeline.push(matchStage);
    Object.entries(filter).forEach(([key, value]) => {
      if (typeof value === 'string') value = value.replace("'", "''");
      const lowerVal = typeof value === 'string' ? value.toLowerCase() : value;

      if (key === 'locationId' && value !== 'undefined') {
        aggregationPipeline.push({ $match: { locationId: value } });
      }
      if (key === 'entityId' && value !== 'undefined') {
        aggregationPipeline.push({ $match: { entityId: value } });
      }
      if (key === 'businessId' && value !== undefined) {
        aggregationPipeline.push(
          {
            $lookup: {
              from: 'LocationBusiness',
              let: { locationId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$locationId', '$$locationId'] }, // Match locationId
                        { $in: ['$businessId', value] }, // Match businessId from the provided array
                      ],
                    },
                  },
                },
              ],
              as: 'locationBusiness',
            },
          },
          {
            $unwind: '$locationBusiness',
          },
          {
            $group: {
              _id: '$locationBusiness.locationId', // Group by locationId from LocationBusiness
              documents: { $push: '$$ROOT' },
            },
          },
          {
            $lookup: {
              from: 'Documents',
              localField: '_id', // Using _id from the $group stage, representing locationId from LocationBusiness
              foreignField: 'locationId', // Matching with locationId from the Documents collection
              as: 'locationDocuments',
            },
          },
        );
      }

      if (key === 'businessTypeId' && value !== 'undefined') {
        aggregationPipeline.push({
          $lookup: {
            from: 'Location',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location',
          },
        });
        aggregationPipeline.push({ $unwind: '$location' });
        aggregationPipeline.push({
          $match: {
            'location.businessTypeId': value,
          },
        });
      }
      if (key === 'functionId' && value !== 'undefined') {
        aggregationPipeline.push({
          $lookup: {
            from: 'Location',
            localField: 'locationId',
            foreignField: '_id',
            as: 'location',
          },
        });
        aggregationPipeline.push({ $unwind: '$location' });
        aggregationPipeline.push({
          $match: {
            'location.functionId': { $in: value },
          },
        });
      }
    });

    return aggregationPipeline;
  }

  async UpdateDocumentBasedOnAdditionalDocument() {
    // try {
    const documents = await this.prisma.documents.findMany({
      include: { AdditionalDocumentAdmins: true },
    });

    for (let data of documents) {
      let reviwers = data?.AdditionalDocumentAdmins?.filter(
        (value) => value.type === 'REVIEWER',
      ).map((item) => item?.userId);
      let approvers = data?.AdditionalDocumentAdmins?.filter(
        (value) => value.type === 'APPROVER',
      ).map((item) => item?.userId);

      let creators = data?.AdditionalDocumentAdmins?.filter(
        (value) => value.type === 'CREATOR',
      ).map((item) => item?.userId);
      await this.prisma.documents.update({
        where: { id: data?.id },
        data: {
          reviewers: reviwers,
          approvers: approvers,
          creators: creators,
        },
      });
    }
    // } catch (err) {}
  }

  async getAIFlaggedCapaReferences(orgId: any, user: any) {
    try {
      let references: any = await this.refsModel
        .find({
          refToModule: 'CAPA',
          isFlagged: true,
          type: 'Document',
          organizationId: orgId,
        })
        .lean()
        .exec();

      const docIds = references.map((ref: any) => ref.refId);

      // console.log('docIds', docIds);

      let docs: any = await this.prisma.documents.findMany({
        where: {
          id: {
            in: docIds,
          },
        },
      });

      // console.log('docs', docs);

      for (let value of docs) {
        const { editAcess, deleteAccess, readAccess } =
          await this.accesforDocument(value.id, user);
        value.editAcess = editAcess;
        value.deleteAccess = deleteAccess;
        value.readDocAccess = readAccess;
      }

      const docMap = new Map(docs.map((doc: any) => [doc.id, doc]));

      let finalArray = references
        .map((ref: any) => {
          if (docMap.get(ref.refId)) {
            return {
              ...ref,
              document: docMap.get(ref.refId),
            };
          }
        })
        ?.filter((item) => item !== null && item !== undefined);

      // console.log('final array before', finalArray);

      const locationIds = finalArray
        .map(
          (ref: any) => ref?.document?.locationId && ref?.document?.locationId,
        )
        ?.filter((item) => item !== null || item !== undefined);
      const entityIds = finalArray
        .map((ref: any) => ref?.document?.entityId && ref?.document?.entityId)
        ?.filter((item) => item !== null || item !== undefined);

      // console.log('locationIds', locationIds);
      // console.log('entityIds', entityIds);

      const locationIdsSet: any = new Set(locationIds);
      const entityIdsSet: any = new Set(entityIds);

      const [locationDetails, entitydDetails] = await Promise.all([
        this.prisma.location.findMany({
          where: {
            id: {
              in: Array.from(locationIdsSet),
            },
          },
        }),
        this.prisma.entity.findMany({
          where: {
            id: {
              in: Array.from(entityIdsSet),
            },
          },
        }),
      ]);

      const locationIdToLocationMap = new Map(
        locationDetails.map((location: any) => [location.id, location]),
      );
      const entityIdToEntityMap = new Map(
        entitydDetails.map((entity: any) => [entity.id, entity]),
      );

      finalArray = finalArray?.map((ref: any) => ({
        ...ref,
        document: {
          ...ref.document,
          location:
            locationIdToLocationMap.get(ref.document.locationId) ||
            'unknown Unit',
          entity:
            entityIdToEntityMap.get(ref.document.entityId) ||
            'unknown department',
        },
      }));

      // console.log('finalArray', finalArray);

      return finalArray;
    } catch (error) {
      console.log('error in getAIFlaggedCapaReferences', error);

      throw new InternalServerErrorException();
    }
  }

  async accesforDocument(documentId, user) {
    let deleteAccess = false;
    let editAcess = false;
    let reviewersData = [],
      approversData = [];

    const [activeUser, documentData, additionalAdmins]: any = await Promise.all(
      [
        this.prisma.user.findFirst({
          where: { kcId: user.id },
        }),
        await this.prisma.documents.findFirst({
          where: { id: documentId },
        }),
        this.prisma.additionalDocumentAdmins.findMany({
          where: { documentId: documentId },
        }),
      ],
    );

    const reviewerdata = additionalAdmins.map((value) => {
      if (value.type === 'REVIEWER') {
        reviewersData.push(value);
      }
      if (value.type === 'APPROVER') {
        approversData.push(value);
      }
    });

    reviewersData = reviewersData.map((value) => value.userId);
    approversData = approversData.map((value) => value.userId);

    if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      deleteAccess = true;
      editAcess = true;
    } else if (
      user.kcRoles.roles.includes('MR') &&
      documentData.locationId === activeUser.locationId
    ) {
      deleteAccess = true;
      editAcess = true;
    } else if (
      (documentData.documentState === 'DRAFT' &&
        documentData.createdBy === activeUser.id) ||
      (documentData.documentState === 'SEND_FOR_EDIT' &&
        documentData.createdBy === activeUser.id)
    ) {
      editAcess = true;
      deleteAccess = true;
    } else if (
      documentData.documentState === 'IN_REVIEW' ||
      (documentData.documentState === 'RETIRE_INREVIEW' &&
        reviewersData.includes(activeUser.id))
    ) {
      deleteAccess = false;
      editAcess = true;
    } else if (
      documentData.documentState === 'IN_APPROVAL' ||
      (documentData.documentState === 'RETIRE_INAPPROVE' &&
        approversData.includes(activeUser.id))
    ) {
      deleteAccess = false;
      editAcess = true;
    } else if (
      documentData.documentState === 'PUBLISHED' &&
      documentData.locationId === activeUser.locationId &&
      // documentData.documentState === 'PUBLISHED' &&
      documentData.entityId === activeUser.entityId
    ) {
      deleteAccess = false;
      editAcess = true;
    } else {
      deleteAccess = false;
      editAcess = false;
    }

    return { deleteAccess, editAcess, readAccess: true };
  }

  async filterDocumentBasedOnMetadata(body) {
    const { filter } = body;
    try {
      const orConditions = [];

      for (const key in filter) {
        if (filter[key]) {
          orConditions.push({
            [`metadata.${key}`]: { $regex: filter[key], $options: 'i' },
          }); // Case-insensitive search
        }
      }

      const query = orConditions.length ? { $or: orConditions } : {};

      // console.log('query', JSON.stringify(query, null, 2));
      return this.aiMetaDataDocumentModel
        .find(query)
        .select('documentId')
        .exec();
    } catch (error) {
      console.log('error', error);
      throw error; // Rethrow the error after logging
    }
  }

  async getAiMetaDataByDocId(docId) {
    try {
      const dataToReturn = await this.aiMetaDataDocumentModel
        .findOne({ documentId: docId })
        .exec();
      // console.log('dataToReturn', dataToReturn);

      if (dataToReturn) {
        return [dataToReturn];
      } else {
        return [{}];
      }
    } catch (error) {
      console.log('error', error);
      throw error; // Rethrow the error after logging
    }
  }

  async getCountAndStatusByBatchId(batchId: string) {
    try {
      const totalDocumentsCount = await this.docProcessModel.count({ batchId });
      const processedDocumentsCount = await this.docProcessModel.count({
        batchId,
        status: 'completed',
      });
      const failedDocumentsCount = await this.docProcessModel.count({
        batchId,
        status: 'failed',
      });
      // console.log('totalDocumentsCount', totalDocumentsCount);
      // console.log('processedDocumentsCount', processedDocumentsCount);
      // console.log('failedDocumentsCount', failedDocumentsCount);

      return {
        totalDocumentsCount,
        processedDocumentsCount,
        failedDocumentsCount,
      };
    } catch (error) {
      console.log('getCountAndStatusByBatchId error', error);
      throw error; // Rethrow the error after logging
    }
  }

  async bulkCreateDocProcesses(body: any) {
    try {
      // console.log('body in bulkCreateDocProcesses', body);

      const dataToInsert = body?.map((item: any) => ({
        ...item,
        status: 'pending',
        docUrl: item?.docUrl,
      }));

      // console.log('dataToInsert', dataToInsert);

      // Bulk insert the documents
      const result = await this.docProcessModel.insertMany(dataToInsert);
      return result; // Return the inserted documents
    } catch (error) {
      console.error('bulkCreateDocuments error', error);
      throw error; // Rethrow the error after logging
    }
  }

  async updateProcessStatusByDocUrl(body: any) {
    try {
      // console.log('body in updateProcessStatusByDocUrl', body);
      const { file_path, status, batchId, docUrl, reason, isFailed } = body;

      // let docUrl = file_path.replace("../uploads", process.env.SERVER_IP);
      // Update the document where docUrl matches and update its status
      const result = await this.docProcessModel.findOneAndUpdate(
        { docUrl: docUrl, batchId: batchId }, // Find the document by docUrl
        { status: status, reason: reason ? reason : null, isFailed: isFailed }, // Update the status
        { new: true }, // Return the updated document
      );
      // console.log('RESULT IN UPDATE', result);
      if (!result) {
        throw new Error(`Document with docUrl ${docUrl} not found`);
      }

      return result; // Return the updated document
    } catch (error) {
      console.log('ERRROROR updateStatusByDocUrl error', error);
      throw error; // Rethrow the error after logging
    }
  }
  async getDocumentsForDownload(orgId: string, batchId: string) {
    try {
      // Step 1: Fetch all documents for the given organizationId
      const documents = await this.docProcessModel.find({
        organizationId: orgId,
        batchId: batchId,
      });
      // console.log('documents', documents);
      return documents;
    } catch (error) {
      console.log('Error in getBatchSummary:', error);
      throw error;
    }
  }
  async getJobSummary(orgId: string) {
    try {
      // Step 1: Fetch all documents for the given organizationId
      const documents = await this.docProcessModel
        .find({ organizationId: orgId })
        .lean();

      // Step 2: Group documents by batchId
      const batchMap = new Map();

      for (const doc of documents) {
        const batch = batchMap.get(doc.batchId) || {
          batchId: doc.batchId,
          initiatedBy: doc.createdBy,
          organizationId: doc.organizationId,
          type: doc.type,
          createdAt: doc.createdAt,
          totalDocumentsCount: 0,
          processedDocumentsCount: 0,
          failedDocumentsCount: 0,
          hasPending: false, // Track if there are any pending entries
        };

        batch.totalDocumentsCount += 1;
        if (doc.status === 'completed') {
          batch.processedDocumentsCount += 1;
        } else if (doc.status === 'failed') {
          batch.failedDocumentsCount += 1;
        } else if (doc.status === 'pending') {
          batch.hasPending = true; // Mark this batch as having pending entries
        }

        if (
          !batch.createdAt ||
          new Date(doc.createdAt) < new Date(batch.createdAt)
        ) {
          batch.createdAt = doc.createdAt; // Get the earliest creation date
        }

        batchMap.set(doc.batchId, batch);
      }

      const batches = Array.from(batchMap.values());

      // Step 3: Add OverallStatus based on the `hasPending` flag
      batches.forEach((batch) => {
        batch.status = batch.hasPending ? 'Pending' : 'Completed';
        delete batch.hasPending; // Remove the temporary flag
      });

      // Step 4: Fetch unique user IDs
      const userIdArray = batches.map((batch) => batch.initiatedBy);
      const userIdSet = new Set(userIdArray);
      const userIds = Array.from(userIdSet);

      // Step 5: Fetch user details from Prisma
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: {
          id: true,
          firstname: true,
          email: true,
          lastname: true,
        },
      });

      const userMap = new Map(users.map((user) => [user.id, user]));

      // Step 6: Populate user details in the batch summary
      const populatedBatches = batches.map((batch) => ({
        ...batch,
        initiatedBy: `${userMap.get(batch.initiatedBy)?.firstname || ''} ${
          userMap.get(batch.initiatedBy)?.lastname || ''
        }`.trim(),
      }));

      return populatedBatches;
    } catch (error) {
      console.log('Error in getBatchSummary:', error);
      throw error;
    }
  }
}
