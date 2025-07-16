import {
  BadRequestException,
  ConflictException,
  ConsoleLogger,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';

import { InjectModel } from '@nestjs/mongoose';
import { Model, now } from 'mongoose';
import { LocationService } from '../location/location.service';
import { OrganizationService } from '../organization/organization.service';
import { UserService } from '../user/user.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { CreateNcDto } from './dto/create-nc.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';
import { UpdateNcDto } from './dto/update-nc.dto';
import { Audit, AuditDocument } from './schema/audit.schema';
import {
  Nonconformance,
  NonconformanceDocument,
} from './schema/nonconformance.schema';
import { NcActionPoint } from './schema/ncActionPoint.schema';
import { filterGenerator } from './helpers/mongoFilter.helper';
import { getExactPath } from '../utils/getImagePath.helper';
import { stat, unlinkSync } from 'fs';
import * as path from 'path';
import { SystemsService } from '../systems/systems.service';
import { EntityService } from '../entity/entity.service';
import { getNcCount } from './helpers/NcCounter.helper';
import { DocumentsService } from '../documents/documents.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import {
  AuditorRating,
  AuditorRatingDocument,
} from './schema/auditorRating.schema';
import { CreateAuditorRating } from './dto/create-auditor-rating.dto';
import { NcComment, NcCommentDocument } from './schema/NcComment.schema';
import { roles, newRoles } from '../utils/roles.global';
import { NcAction, NcStatus } from '../utils/nc.global';
import {
  NcWorkflowHistory,
  NcWorkflowHistoryDocument,
} from './schema/NcWorkflowHistory.schema';
import { Types } from 'mongoose';
import { UniqueId, UniqueIdDocument } from './schema/UniqueId.schema';
import * as sgMail from '@sendgrid/mail';
import * as cron from 'node-cron';
import { Scheduler } from 'timers/promises';
import {
  sendAuditorNcAcceptanceEmail,
  sendMrNcAcceptanceEmail,
  sendNcAcceptedEmail,
  sendNcClosureEmail,
  sendNcRaisedEmail,
  sendNcRejectedEmail,
  sendDepartmentHeadEscalationEmail,
  sendMCOEEscalationEmail,
  sendFindingAcceptanceEmail,
  sendFindingRejectEmail,
  sendFindingSentBackEmail,
  sendFindingVerifiedEmail,
  sendFindingClosureEmail,
} from './helpers/email.helper';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import {
  AuditFindings,
  AuditFindingsSchema,
} from 'src/audit-settings/schema/audit-findings.schema';
import {
  AuditSettingsSchema,
  AuditSettings,
} from 'src/audit-settings/schema/audit-settings.schema';
import { AuditPlan } from 'src/audit-plan/schema/auditPlan.schema';
import { AuditSchedule } from 'src/audit-schedule/schema/auditSchedule.schema';
import { logger } from 'src/utils/logger';
import { ObjectId } from 'mongodb';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { v4 as uuid } from 'uuid';
import { EmailService } from 'src/email/email.service';

import { ClausesSchema, Clauses } from 'src/systems/schema/clauses.schema';
import { count, table } from 'console';
import { audit } from 'rxjs';
import { KpiDefinitionService } from 'src/kpi-definition/kpi-definition.service';
import auditTrial from '../watcher/changesStream';
import { cara_settings } from 'src/cara/schema/cara-setting.schema';
import { cara } from 'src/cara/schema/cara.schema';
import { Hira } from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { OciUtils } from 'src/documents/oci_utils';

// sendgrid config
sgMail.setApiKey(process.env.SMTP_PASSWORD);

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,
    @InjectModel(AuditSettings.name)
    private auditSettingsModel: Model<AuditSettings>,
    private readonly ociUtils: OciUtils,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(AuditSchedule.name)
    private auditSchModel: Model<AuditSchedule>,
    @InjectModel(AuditPlan.name)
    private auditPlanModel: Model<AuditPlan>,
    @InjectModel(Nonconformance.name)
    private readonly NcModel: Model<NonconformanceDocument>,
    @InjectModel(AuditSettings.name)
    private readonly auditSetting: Model<AuditSettings>,
    @InjectModel(AuditorRating.name)
    private readonly AuditorRatingModel: Model<AuditorRatingDocument>,

    @InjectModel(cara_settings.name)
    private readonly caraSettingModel: Model<cara_settings>,

    @InjectModel(cara.name)
    private readonly caraModel: Model<cara>,
    @InjectModel(Hira.name) private hiraModel: Model<Hira>,

    @InjectModel(NcComment.name)
    private readonly NcCommentModel: Model<NcCommentDocument>,
    @InjectModel(NcActionPoint.name)
    private readonly ncActionPointModel: Model<NcActionPoint>,
    @InjectModel(NcWorkflowHistory.name)
    private readonly NcWorkflowHistoryModel: Model<NcWorkflowHistoryDocument>,
    @InjectModel(AuditFindings.name)
    private readonly AuditFindingsModel: Model<AuditFindings>,
    @InjectModel(Clauses.name)
    private readonly clauseModel: Model<Clauses>,
    @InjectModel(UniqueId.name)
    private readonly UniqueIdModel: Model<UniqueIdDocument>,
    @InjectModel(System.name) private System: Model<SystemDocument>,
    private readonly organizationService: OrganizationService,
    private readonly locationService: LocationService,
    private readonly userService: UserService,
    private readonly systemService: SystemsService,
    private readonly entityService: EntityService,
    private readonly documentService: DocumentsService,
    private readonly prismaService: PrismaService,
    private readonly serialNumberService: SerialNumberService,
    private readonly emailService: EmailService,
    @Inject('Logger') private readonly logger: Logger,

    private readonly kpiDefinition: KpiDefinitionService,
  ) {}

  /**
   * @method create
   *  This method creates a new audit
   * @param createAuditDto audit payload
   * @param kcId kcID of user
   * @returns created audit
   */
  async create(createAuditDto, kcId: any, req: any) {
    // try {
    const activeUser = await this.userService.getUserInfo(req.user);
    // const auditTrail = await auditTrial(
    //   'audits',
    //   'Audit',
    //   'Audit Report',
    //   req.user,
    //   activeUser,
    //   '',
    // );
    let locationId;

    // Adding unique id for each nc
    createAuditDto.sections.forEach((outerSection: any) => {
      outerSection.sections.forEach((innerSection: any) => {
        innerSection.fieldset.forEach((field: any) => {
          if (!field.hasOwnProperty('ncId')) {
            field.ncId = uuid();
          }
        });
      });
    });

    const user = await this.userService.getUserInfo(kcId);
    console.log('user', user);
    if (kcId.kcRoles.roles.includes('ORG-ADMIN')) {
      locationId = createAuditDto.location;
    } else {
      locationId = createAuditDto.location;
    }
    // const totalSections = createAuditDto?.sections?.length ?? 0;
    const auditorForEmail = createAuditDto.auditors[0];
    const audits = await this.auditModel.find({
      organization: user.organizationId,
      location: locationId,
      auditName: createAuditDto.auditName,
    });

    // if same name documents exists in organization
    if (audits.length > 0) {
      throw new ConflictException();
    }
    const clausesArr = createAuditDto.auditedClauses
      .filter((item: any) => {
        if (Object.keys(item.item).length > 0) {
          return item.item;
        }
      })
      .map((item: any) => item.item);
    const documentsArr = createAuditDto.auditedDocuments
      .filter((item: any) => {
        if (Object.keys(item.item).length > 0) {
          return item.item;
        }
      })
      .map((item: any) => item.item.id);

    const auditors = createAuditDto.auditors.map((item: any) => item.id);
    const auditees = createAuditDto.auditees.map((item: any) => item.id);
    let serialNumber;
    serialNumber = await this.serialNumberService.generateSerialNumber({
      moduleType: 'Audit Report',
      location: locationId,
      entity: createAuditDto.auditedEntity,
      year: createAuditDto.auditYear.toString(),
      createdBy: user?.id,
      organizationId: user.organizationId,
    });
    let serialNumberGen = '';
    if (
      serialNumber !== null &&
      serialNumber !== undefined &&
      serialNumber !== 'undefined'
    ) {
      serialNumberGen = await this.mapserialnumber(
        serialNumber,
        locationId,
        createAuditDto.auditedEntity,
        user.organizationId,
        createAuditDto.auditTypeId,
      );
    }

    const sop_refs = Object.values(
      createAuditDto.sop_refs.reduce((acc: any, { id, entityId }: any) => {
        if (!acc[entityId]) {
          acc[entityId] = { entityId, reference_ids: [] };
        }
        acc[entityId].reference_ids.push(id);
        return acc;
      }, {} as Record<string, { entityId: string; reference_ids: string[] }>),
    );

    const hira_refs = Object.values(
      createAuditDto.hira_refs.reduce((acc: any, { _id, entityId }: any) => {
        if (!acc[entityId]) {
          acc[entityId] = { entityId, reference_ids: [] };
        }
        acc[entityId].reference_ids.push(_id);
        return acc;
      }, {} as Record<string, { entityId: string; reference_ids: string[] }>),
    );

    const capa_refs = Object.values(
      createAuditDto.capa_refs.reduce((acc: any, { _id, entityId }: any) => {
        if (!acc[entityId]) {
          acc[entityId] = { entityId, reference_ids: [] };
        }
        acc[entityId].reference_ids.push(_id);
        return acc;
      }, {} as Record<string, { entityId: string; reference_ids: string[] }>),
    );

    const audit: any = new this.auditModel({
      ...createAuditDto,
      auditedClauses: clausesArr,
      auditedDocuments: documentsArr,
      auditors,
      auditees,
      auditNumber: serialNumberGen,
      organization: user.organizationId,
      auditObjective: createAuditDto?.auditObjective || '',
      location: locationId,
      system: createAuditDto.system,
      sections: createAuditDto.sections,
      selectedTemplates: createAuditDto.selectedTemplates,
      auditScheduleId: createAuditDto.auditScheduleId,
      createdBy: activeUser.id,
      sop_refs: sop_refs,
      hira_refs: hira_refs,
      capa_refs: capa_refs,
      auditScope: createAuditDto.auditScope,
    });
    // loop through sections and add the nc to db and save the uid /
    if (createAuditDto.isDraft === false) {
      for (let checklistData of createAuditDto.sections) {
        // const totalSections = createAuditDto?.sections?.length ?? 0
        const textCounter = {
          counts: {},
          getNumber: function (text) {
            if (this.counts[text]) {
              this.counts[text]++;
            } else {
              this.counts[text] = 1;
            }
            return this.counts[text];
          },
        };
        for (let i = 0; i < checklistData?.sections?.length; i++) {
          const section = checklistData?.sections[i];
          let nc;

          for (let j = 0; j < section.fieldset.length; j++) {
            const field: any = section.fieldset[j];
            const sectionFindingId = field.ncId;
            if (field.nc.type !== '') {
              const document =
                field.image === 'image url' ? undefined : field.image;
              const questionNumber = `${i}.${j}`;
              const serialNumber = textCounter.getNumber(field.nc.type);

              const auditFindings = await this.AuditFindingsModel.findOne({
                findingType: field.nc.type,
                auditTypeId: createAuditDto.auditType,
              });

              let status = 'OPEN';

              const auditTypeData = await this.auditSettingsModel.findById(
                createAuditDto?.auditType,
              );

              if (
                auditFindings?.accept === false &&
                auditFindings?.reject === false
              ) {
                status = 'ACCEPTED';
              }
              if (auditTypeData?.resolutionWorkFlow === 'NC') {
                nc = await this.createNewNC({
                  ...field?.nc,
                  severity: '',
                  serialNumberGen,
                  audit: audit?._doc?._id,
                  document,
                  status: status,
                  serialNumber,
                  auditTypeId: createAuditDto.auditType,
                  questionNumber,
                  auditors,
                  location: locationId,
                  auditees:
                    auditTypeData?.multipleEntityAudit === true
                      ? [field?.nc?.responsiblePerson?.id]
                      : auditees,
                  auditedClauses: clausesArr,
                  auditedDocuments: documentsArr,
                  organization: user?.organizationId,
                  system: createAuditDto?.system,
                  auditYear: createAuditDto?.auditYear,
                  auditedEntity: auditTypeData?.multipleEntityAudit
                    ? field?.nc?.entity?.id
                    : createAuditDto?.auditedEntity,
                  findingTypeId: auditFindings?.findingTypeId,
                  sectionFindingId: sectionFindingId,
                });
              } else if (auditTypeData?.resolutionWorkFlow === 'CAPA') {
                await this.createNewCapa({
                  organizationId: activeUser.organizationId,
                  location: locationId,
                  audit: audit?._doc?._id,
                  entity: auditTypeData?.multipleEntityAudit
                    ? field?.nc?.entity?.id
                    : createAuditDto?.auditedEntity,
                  users:
                    auditTypeData?.multipleEntityAudit === true
                      ? [field?.nc?.responsiblePerson?.id]
                      : auditees,
                  systemId: createAuditDto.system || [],
                  type: `${field.nc.type}-${field?.nc?.comment || ''}`,
                  year: createAuditDto?.auditYear,
                  comments: ` ${field?.nc?.clause?.clauseName || ''} - ${
                    field?.title || ''
                  } - ${field?.nc?.comment || ''}`,
                  highPriority: field?.nc?.highPriority,
                  impactType: field?.nc?.impactType?.id,
                  impact: field?.nc?.impact || [],
                  activeUser,
                });
              }

              // audit._doc.sections[i].fieldset[j].nc = nc._id;
            } else {
              field.nc = null;
            }
          }
        }
      }
    }

    const result = await audit.save();
    // console.log('result', result);
    // getting all created Ncs data for sending emails

    let allNcs: any = await this.NcModel.find({
      audit: new Types.ObjectId(audit._id),
      //  type:  field.nc.type,
    });

    // getting all mrs ot put on CC
    let mr: any = await this.getAllMrsOfLocation(result.location);
    let notification: any = await this.getAllNotificationUser(
      result?.auditedEntity,
    );

    //console.log('mrs of location', mr);
    // getting realmName to make direct link to Nc
    let organization: any = await this.prismaService.organization.findUnique({
      where: {
        id: user.organizationId,
      },
    });

    // [allNcs, mr, organization] = await Promise.all([allNcs, mr, organization]);
    mr = mr.map((item) => item.email); // extracting all mr emails
    notification = notification?.map((item) => item?.email);
    // sending mail to auditees
    let combinedData = [...new Set([...mr, ...notification])];
    for (let nc of allNcs) {
      try {
        await sendNcRaisedEmail(
          result,
          nc,
          auditorForEmail,
          auditees,
          combinedData,
          organization.realmName,
          this.prismaService.user,
          this.emailService.sendEmail,
        );
      } catch (error) {
        // console.log('send mail error inside catch', error);
      }
    }
    return result;
    // } catch (err) {
    //   // if (err.status === 409) {
    //   //   throw new ConflictException(
    //   //     'Audit with same name exists in the organization',
    //   //   );
    //   // }
    //   throw new InternalServerErrorException();
    // }
  }

  async ValidateAuditIsUnique(userInfo, data) {
    const { locationId, auditName } = data;
    const user = await this.userService.getUserInfo(userInfo.id);
    const audits = await this.auditModel.find({
      organization: user.organizationId,
      location: locationId,
      auditName: auditName,
    });

    if (audits.length > 0) {
      return false;
    } else {
      return true;
    }
  }
  /**
   * @method findAll
   *  This method will get all the audits for an organization
   * @param kcId kcId of user
   * @returns Array of audits
   */
  async findAll(kcId: string) {
    const user = await this.userService.getUserInfo(kcId);
    const locId = user.locationId ?? user.entity.locationId;
    const audits = await this.auditModel.find({
      organization: user.organizationId,
      location: locId,
    });
    const response = [];

    for (let i = 0; i < audits.length; i++) {
      const audit: any = audits[i];
      let systemtype: any = this.organizationService.getSystemTypeById(
        audit.auditType,
      );
      let organization: any = this.organizationService.getOrgById(
        audit.organization,
      );
      let location: any = this.locationService.getLocationById(audit.location);
      let auditors: any = audit.auditors.map((item) =>
        this.userService.getUserById(item),
      );
      let auditees: any = audit.auditees.map((item) =>
        this.userService.getUserById(item),
      );

      let rest: any;

      [rest, auditors, auditees] = await Promise.all([
        Promise.all([systemtype, organization, location]),
        Promise.all(auditors),
        Promise.all(auditees),
      ]);

      response.push({
        ...audit._doc,
        auditType: rest[0],
        organization: rest[1],
        location: rest[2],
        auditors,
        auditees,
      });
    }

    return response;
  }

  /**
   * @method findOne
   *  This method fetches an audit by its id
   * @param id Audit id
   * @returns returns audit
   */
  async findOne(id: string, user: any) {
    const activeUser = await this.prismaService.user.findFirst({
      where: { kcId: user?.id },
    });
    const audit: any = await this.auditModel.findById(id).populate({
      path: 'sections',
      populate: {
        path: 'fieldset',
        populate: {
          path: 'nc',
          model: 'Nonconformance',
        },
      },
    });

    const organization = await this.organizationService.getOrgById(
      audit.organization,
    );
    // const location = await this.locationService.getLocationById(audit.location);
    const location = await this.prismaService.location.findFirst({
      where: {
        id: audit.location,
      },
    });
    const auditors = await Promise.all(
      audit.auditors.map((item) => this.userService.getUserById(item)),
    );
    let auditees = [];
    if (audit?.auditees.length > 0) {
      auditees = await Promise.all(
        audit.auditees.map((item) => this.userService.getUserById(item)),
      );
    }

    let auditedEntity = {};
    if (
      audit.auditedEntity !== undefined &&
      audit.auditedEntity !== null &&
      audit.auditedEntity !== ''
    ) {
      auditedEntity = await this.entityService.getEntityById(
        audit.auditedEntity,
      );
    }
    // const auditedDocuments = [];
    const auditedDocuments = await Promise.all(
      audit.auditedDocuments.map((item) =>
        this.documentService.findOneOld(item, '', null),
      ),
    );

    let sop_refs = [],
      hira_refs = [],
      capa_refs = [],
      systemDtls = [],
      clause_refs = [];
    if (Array.isArray(audit?.sop_refs) && audit?.sop_refs.length > 0) {
      const onlySopRefIds = audit?.sop_refs
        .map((item: any) => item.reference_ids)
        .flat();
      sop_refs = await this.prismaService.documents.findMany({
        where: {
          id: { in: onlySopRefIds },
        },
      });
      sop_refs = sop_refs.map((item: any) => ({
        ...item,
        refId: item.id,
        type: 'Document',
      }));
    }
    if (Array.isArray(audit?.hira_refs) && audit?.hira_refs.length > 0) {
      const onlyHiraRefIds = audit?.hira_refs
        .map((item: any) => item.reference_ids)
        .flat();
      hira_refs = await this.hiraModel
        .find({
          _id: { $in: onlyHiraRefIds },
        })
        .lean();
      hira_refs = hira_refs.map((item: any) => ({
        ...item,
        refId: item._id,
        type: 'HIRA',
      }));
    }
    if (Array.isArray(audit?.capa_refs) && audit?.capa_refs.length > 0) {
      const onlyCapaRefIds = audit?.capa_refs
        .map((item: any) => item.reference_ids)
        .flat();
      capa_refs = await this.caraModel
        .find({
          _id: { $in: onlyCapaRefIds },
        })
        .lean();
      capa_refs = capa_refs.map((item: any) => ({
        ...item,
        refId: item._id,
        type: 'CAPA',
      }));
    }
    if (Array.isArray(audit?.system) && audit?.system.length > 0) {
      systemDtls = await this.SystemModel.find({
        _id: { $in: audit?.system },
      }).lean();
      systemDtls = systemDtls.map((value: any) => ({
        item: {
          id: value._id,
          name: value.name,
        },
      }));
    }
    if (
      Array.isArray(audit?.auditedClauses) &&
      audit?.auditedClauses.length > 0
    ) {
      const clauseIds = audit?.auditedClauses.map((item: any) => item.id);
      clause_refs = await this.clauseModel
        .find({
          _id: { $in: clauseIds },
        })
        .lean();
      const allSystems = clause_refs.map((item: any) => item.systemId);
      const getAllSystems = await this.System.find({
        _id: { $in: allSystems },
      }).lean();
      // Create a mapping of systemId to systemName for quick lookup
      const systemMap = getAllSystems.reduce((acc: any, system: any) => {
        acc[system._id] = system.name; // Assuming 'name' is the field for systemName
        return acc;
      }, {});
      clause_refs = clause_refs.map((item: any) => ({
        ...item,
        refId: item._id,
        type: 'Clause',
        systemName: systemMap[item.systemId] || null,
      }));
    }
    // const questionCount = audit._doc.sections.reduce(
    //   (prevVal, current) => prevVal + current.fieldset.length,
    //   0,
    // );

    // for (let i = 0; i < audit._doc.sections.length; i++) {
    //   const section = audit._doc.sections[i];
    //   for (let j = 0; j < section.fieldset.length; j++) {
    //     const field = section.fieldset[j];
    //     if (field.nc == null) {
    //       field.nc = {
    //         type: '',
    //         comment: '',
    //         clause: [],
    //         severity: '',
    //       };
    //     }
    //   }
    // }

    return {
      ...audit._doc,
      organization,
      location,
      auditors,
      auditees,
      auditedEntity,
      auditedDocuments,
      questionCount: 0,
      systemDtls,
      sop_refs,
      hira_refs,
      capa_refs,
      clause_refs,
    };
  }

  async findOneForPdf(id: string, userId: any) {
    const audit: any = await this.auditModel.findById(id).populate({
      path: 'sections',
      populate: {
        path: 'fieldset',
        populate: {
          path: 'nc',
          model: 'Nonconformance',
        },
      },
    });

    if (process.env.IS_OBJECT_STORE === 'true' && audit?.sections?.length > 0) {
      for (const section of audit?.sections[0]?.sections) {
        for (const field of section.fieldset) {
          const nc = field.nc;
          if (nc && nc.evidence) {
            for (const evi of nc.evidence) {
              if (
                evi?.attachment &&
                Array.isArray(evi?.attachment) &&
                evi?.attachment?.length > 0
              ) {
                for (const attachment of evi.attachment) {
                  try {
                    if (
                      attachment.url.toLowerCase().endsWith('.png') ||
                      attachment.url.toLowerCase().endsWith('.jpg') ||
                      attachment.url.toLowerCase().endsWith('.jpeg')
                    ) {
                      const response = await this.getAttachmentUrlOBJ(
                        attachment.url,
                        userId,
                      );
                      attachment.obsUrl = response;
                    } else {
                      attachment.obsUrl = attachment.url;
                    }
                  } catch (error) {
                    // console.error('Error fetching attachment URL:', error);
                  }
                }
              }
            }
          }
        }
      }
    }

    const organization = await this.organizationService.getOrgById(
      audit.organization,
    );
    // const location = await this.locationService.getLocationById(audit.location);
    const location = await this.prismaService.location.findFirst({
      where: {
        id: audit.location,
      },
    });
    const auditors = await Promise.all(
      audit.auditors.map((item) => this.userService.getUserById(item)),
    );
    const auditees = await Promise.all(
      audit.auditees.map((item) => this.userService.getUserById(item)),
    );
    let auditedEntity;
    if (
      auditedEntity !== undefined &&
      auditedEntity !== null &&
      auditedEntity !== ''
    ) {
      auditedEntity = await this.entityService.getEntityById(
        audit.auditedEntity,
      );
    }

    const auditedDocuments = [];
    // const auditedDocuments = await Promise.all(
    //   audit.auditedDocuments.map((item) =>
    //     this.documentService.findOne(item, '', null),
    //   ),
    // );
    // const questionCount = audit._doc.sections.reduce(
    //   (prevVal, current) => prevVal + current.fieldset.length,
    //   0,
    // );

    // for (let i = 0; i < audit._doc.sections.length; i++) {
    //   const section = audit._doc.sections[i];
    //   for (let j = 0; j < section.fieldset.length; j++) {
    //     const field = section.fieldset[j];
    //     if (field.nc == null) {
    //       field.nc = {
    //         type: '',
    //         comment: '',
    //         clause: [],
    //         severity: '',
    //       };
    //     }
    //   }
    // }

    return {
      ...audit._doc,
      organization,
      location,
      auditors,
      auditees,
      auditedEntity,
      auditedDocuments,
      questionCount: 0,
    };
  }

  /**
   * @method update
   *  This method updates an audit by its id
   * @param id audit id
   * @param updateAuditDto payload
   * @returns Updated audit
   */
  async update(id: string, updateAuditDto: any, userDtls) {
    const user = await this.userService.getUserInfo(userDtls);
    // const auditTrail = await auditTrial(
    //   'audits',
    //   'Audit',
    //   'Audit Report',
    //   userDtls.user,
    //   user,
    //   '',
    // );

    // Adding unique id for each nc
    updateAuditDto.sections.forEach((outerSection: any) => {
      outerSection.sections.forEach((innerSection: any) => {
        innerSection.fieldset.forEach((field: any) => {
          if (!field.hasOwnProperty('ncId')) {
            field.ncId = uuid();
          }
        });
      });
    });

    const audit: any = await this.auditModel.findById(id);

    // checking if auditor before edit
    const check = audit.auditors.filter((user) => user == user.id);

    if (check.length > 0) {
      throw new ForbiddenException();
    }

    const clausesArr = updateAuditDto.auditedClauses
      .filter((item: any) => {
        if (Object.keys(item.item).length > 0) {
          return item.item;
        }
      })
      .map((item: any) => item.item);

    const documentsArr = updateAuditDto?.auditedDocuments
      ?.filter((item: any) => {
        return (
          item?.item &&
          typeof item.item === 'object' &&
          Object.keys(item.item).length > 0
        );
      })
      .map((item: any) => item?.item?.id);

    const auditors = updateAuditDto.auditors.map((item: any) => item.id);
    const auditees = updateAuditDto.auditees.map((item: any) => item.id);

    // loop through sections and add the nc to db and save the uid /
    const textCounter = {
      counts: {},
      getNumber: function (text) {
        if (this.counts[text]) {
          this.counts[text]++;
        } else {
          this.counts[text] = 1;
        }
        return this.counts[text];
      },
    };
    if (updateAuditDto.isDraft === false) {
      for (let checklist of updateAuditDto.sections) {
        for (let i = 0; i < checklist.sections.length; i++) {
          const section = checklist.sections[i];

          for (let j = 0; j < section.fieldset.length; j++) {
            const field: any = section.fieldset[j];
            const document = field.image === 'image url' ? '' : field.image;
            const questionNumber = `${i}.${j}`;
            const sectionFindingId = field.ncId;
            // console.log('field.nc', field.nc.type);
            if (field?.nc?.hasOwnProperty('_id')) {
              const res = await this.NcModel.findByIdAndUpdate(field.nc._id, {
                $set: {
                  type: field.nc.type,
                  comment: field.nc.comment,
                  severity: field.nc.severity,
                  clause: field.nc.clause,
                },
              });

              // field.nc = res._id;
            } else {
              if (
                field.nc?.type !== '' &&
                field.hasOwnProperty('nc') &&
                field?.nc?.type !== '-'
              ) {
                const serialNumber = textCounter.getNumber(field?.nc?.type);
                const auditFindings = await this.AuditFindingsModel.findOne({
                  findingType: field?.nc?.type,
                  auditTypeId: updateAuditDto.auditType,
                });
                const auditTypeData = await this.auditSettingsModel.findById(
                  updateAuditDto.auditType,
                );

                if (auditTypeData?.resolutionWorkFlow === 'NC') {
                  let status = 'OPEN';

                  if (
                    auditFindings.accept === false &&
                    auditFindings.reject === false
                  ) {
                    status = 'ACCEPTED';
                  }
                  const res = await this.createNewNC({
                    ...field.nc,
                    audit: new Types.ObjectId(id),
                    document: field.image,
                    serialNumberGen: audit.auditNumber,
                    serialNumber,
                    status: status,
                    auditTypeId: updateAuditDto.auditType,

                    questionNumber,
                    auditors,
                    location: updateAuditDto.location,
                    auditees:
                      auditTypeData?.multipleEntityAudit === true
                        ? [field?.nc?.responsiblePerson?.id]
                        : auditees,
                    system: updateAuditDto.system,
                    auditedEntity: auditTypeData?.multipleEntityAudit
                      ? field?.nc?.entity?.id
                      : updateAuditDto.auditedEntity,
                    organization: user.organizationId,
                    auditYear: updateAuditDto.auditYear,
                    findingTypeId: auditFindings.findingTypeId,
                    sectionFindingId: sectionFindingId,
                  });
                } else if (auditTypeData?.resolutionWorkFlow === 'CAPA') {
                  await this.createNewCapa({
                    organizationId: user.organizationId,
                    audit: new Types.ObjectId(id),
                    location: updateAuditDto.location,
                    entity: auditTypeData?.multipleEntityAudit
                      ? field?.nc?.entity?.id
                      : updateAuditDto.auditedEntity,
                    users:
                      auditTypeData?.multipleEntityAudit === true
                        ? [field?.nc?.responsiblePerson?.id]
                        : auditees,
                    systemId: updateAuditDto.system,
                    type: `${field.nc.type}-${field?.nc?.comment || ''}`,
                    comments: ` ${field?.nc?.clause?.clauseName || ''} - ${
                      field?.title || ''
                    } - ${field?.nc?.comment || ''}`,
                    year: updateAuditDto.auditYear,
                    highPriority: field?.nc?.highPriority,
                    impactType: field?.nc?.impactType?.id,
                    impact: field?.nc?.impact || [],
                    activeUser: user,
                  });
                }

                // const res = await nc.save();
                // field.nc = res._id;
              } else {
                // field.nc = null;
              }
            }
          }
        }
      }
    }

    const sop_refs = Object.values(
      updateAuditDto.sop_refs.reduce((acc: any, { id, entityId }: any) => {
        if (!acc[entityId]) {
          acc[entityId] = { entityId, reference_ids: [] };
        }
        acc[entityId].reference_ids.push(id);
        return acc;
      }, {} as Record<string, { entityId: string; reference_ids: string[] }>),
    );

    const hira_refs = Object.values(
      updateAuditDto.hira_refs.reduce((acc: any, { _id, entityId }: any) => {
        if (!acc[entityId]) {
          acc[entityId] = { entityId, reference_ids: [] };
        }
        acc[entityId].reference_ids.push(_id);
        return acc;
      }, {} as Record<string, { entityId: string; reference_ids: string[] }>),
    );

    const capa_refs = Object.values(
      updateAuditDto.capa_refs.reduce((acc: any, { _id, entityId }: any) => {
        if (!acc[entityId]) {
          acc[entityId] = { entityId, reference_ids: [] };
        }
        acc[entityId].reference_ids.push(_id);
        return acc;
      }, {} as Record<string, { entityId: string; reference_ids: string[] }>),
    );

    updateAuditDto = {
      ...updateAuditDto,
      auditedClauses: clausesArr,
      auditedDocuments: documentsArr,
      auditors,
      auditees,
      location: updateAuditDto.location,
      system: updateAuditDto.system,
      selectedTemplates: updateAuditDto.selectedTemplates,
      updatedBy: user.id,
      sop_refs: sop_refs,
      hira_refs: hira_refs,
      capa_refs: capa_refs,
      auditScope: updateAuditDto.auditScope,
    };

    return await this.auditModel.findByIdAndUpdate(id, {
      $set: updateAuditDto,
    });
  }

  /**
   * @method remove
   *  This method deletes an audit by its id
   * @param id audit id
   * @returns Deleted audit
   */
  async remove(id: string) {
    return await this.auditModel.findByIdAndRemove(id);
  }

  /**
   * @method findAllCalendarView
   *  This method fetches all the audits with dates for the users organization
   * @param kcId kcId of user
   * @returns Array of audits
   */
  async findAllCalendarView(kcId: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const locId = user?.locationId ?? user?.entity?.locationId;
      return await this.auditModel
        .find({
          organization: user.organizationId,
          location: locId,
        })
        .select('auditName date auditors auditees');
    } catch (err) {}
  }

  /**
   * @method getNcByAuditId
   *  This method fetches all the ncs for a audit
   * @param auditId Audit ID
   * @returns Array of Ncs
   */
  async getNcByAuditId(auditId: string) {
    return await this.NcModel.find({ audit: auditId });
  }

  /**
   * @method createNewNC
   *  This method creates a new NC for an audit
   * @param createNcDto New NC payload
   * @returns Created NC
   */
  async createNewNC(createNcDto: CreateNcDto) {
    let id = '';
    console.log('createNcDto', createNcDto);
    if (createNcDto.type) {
      if (createNcDto.serialNumberGen) {
        id = `${createNcDto.serialNumberGen}/${createNcDto?.findingTypeId}${createNcDto?.serialNumber}`;
      } else {
        id = `${createNcDto?.findingTypeId}${createNcDto?.serialNumber}`;
      }
      const newNc = await this.NcModel.create({ ...createNcDto, id });
      return await newNc.populate('clause');
    }
    // else if (createNcDto.type === 'OFI') {
    //   id = 'OFI' + (await this.getOfiUniqueId());
    // } else {
    //   id = 'OBS' + (await this.getObsUniqueId());
    // }
  }

  async createNewCapa(data) {
    const randomNumber = uuid();

    try {
      const {
        organizationId,
        location,
        entity,
        users,
        systemId,
        type,
        year,
        audit,
        activeUser,
        comments,
        highPriority,
        impactType,
        impact,
      } = data;

      let caraSetting = await this.caraSettingModel.findOne({
        organizationId,
        deviationType: 'Audit data from Audit Report',
      });


      if (!caraSetting) {
        caraSetting = await this.caraSettingModel?.create({
          organizationId: organizationId,
          deviationType: 'Audit data from Audit Report',
          description: 'Audit',
          deleted: false,
        });
      }
      await this.caraModel.create({
        organizationId,
        type,
        title: type,
        systemId: systemId,
        locationId: location,
        entityId: entity,
        origin: caraSetting?._id,
        year: year,
        status: 'Open',
        description: comments,
        auditId: audit,
        highPriority,
        impactType,
        impact,
        caraCoordinator: users[0],
        registeredBy: activeUser?.id,
        // caraOwner: activeUser.id,
      });
      this.logger.log(
        `trace id = ${randomNumber} Post /api/audits successful capa`,
        'Cara-controller',
      );
    } catch (err) {
      this.logger.log(
        `trace id = ${randomNumber} Post /api/audits failed to create CAPA ${err}`,
        'Cara-controller',
      );
    }
  }

  /**
   * @method updateNcById
   *  This method updates an NC by its ID
   * @param ncId Nc ID
   * @param updateNcDto Update payload
   * @returns Updated NC
   */
  async updateNcById(ncId: string, updateNcDto: any) {
    return await this.NcModel.findByIdAndUpdate(
      ncId,
      {
        $set: updateNcDto,
      },
      { new: true },
    );
  }

  /**
   * @method deleteNcById
   *  This method delete an NC by its ID
   * @param ncId NC id
   * @returns Deleted NC
   */
  async deleteNcById(ncId: string, user: any) {
    // const nc = await this.NcModel.findById(ncId);
    // const indexes = nc.questionNumber.toString().split('.');
    // const [i, j] = indexes;
    // //console.log('INDEX',indexes)
    // const audit = await this.auditModel.findById(nc.audit);
    // audit.sections[i].fieldset[j].nc = null;
    // await audit.save();
    return await this.NcModel.findByIdAndUpdate(ncId, { deleted: true });
  }

  /**
   * @method search
   *  This method fetches all the audits that matches the passed filters
   * @param query query filters
   * @param kcId kcId of user
   * @returns Array of matched audits
   */
  async search(query: any, kcId: string, year) {
    // try {
    const response = [];
    const overallRatingMap = {};
    const parsedLoc = JSON.parse(query?.location);
    const user = await this.userService.getUserInfo(kcId);
    const locId =
      parsedLoc?.length > 0 ? parsedLoc?.map((value: any) => value.id) : [];
    if (query.selectedAuditee === '') {
      query.selectedAuditee = [];
    }
    if (query.selectedAuditor === '') {
      query.selectedAuditor = [];
    }
    let auditedEntity = user.entityId;
    const filter = filterGenerator({
      // ...query,
      organization: user.organizationId,
      locIds: locId.includes('All') ? undefined : locId,
      skip: query.skip,
      limit: query.limit,
      auditedEntity: auditedEntity,
      myDept: query?.myDept,
      auditTypeNew: query?.auditTypeNew,
      auditYear: year,
      SelectedAuditor:
        query.SelectedAuditor !== undefined ||
        query.SelectedAuditor !== '' ||
        query.SelectedAuditor !== 'undefined'
          ? query.SelectedAuditor
          : 'undefined',
      selectedAuditee:
        query.selectedAuditee !== undefined ||
        query.selectedAuditee !== '' ||
        query.selectedAuditee !== 'undefined'
          ? query.selectedAuditee
          : 'undefined',
    });

    // counting documents
    const auditCount = await this.auditModel.countDocuments(filter[0]?.$match);
    const audits = await this.auditModel.aggregate(filter);

    // looping through all audits
    for (let i = 0; i < audits.length; i++) {
      const audit: any = audits[i];
      let systemtype: any = this.organizationService.getSystemTypeById(
        audit.auditType,
      );

      let organization: any = this.organizationService.getOrgById(
        audit.organization,
      );

      let location: any = this.locationService.getLocationById(audit.location);

      // let system: any = this.systemService.findById(audit.system);
      let system: any = this.SystemModel.find({ _id: audit.system }).select(
        '_id name',
      );

      let auditors: any = audit.auditors.map((item) =>
        this.userService.getUserById(item),
      );

      let auditees: any = audit.auditees.map((item) =>
        this.userService.getUserById(item),
      );

      let rest: any;

      // Resolving promises
      [rest, auditors, auditees] = await Promise.all([
        Promise.all([systemtype, organization, location, system]),
        Promise.all(auditors),
        Promise.all(auditees),
      ]);

      let auditedEntity;
      if (audit.auditedEntity)
        auditedEntity = await this.entityService.getEntityById(
          audit.auditedEntity,
        );

      const ncCount = getNcCount(audit.sections);
      const auditorRating = await this.getAuditorRating(
        audit._id,
        auditors[0]?.id,
      );

      let overallRating;
      // if (!overallRatingMap[auditors[0]?.id]) {
      //   console.log("auditors[0]?",auditors)
      //   overallRating = await this.getAuditorAvgRating(auditors[0]?.id);
      //   overallRatingMap[auditors[0]?.id] = overallRating;
      // } else {
      //   overallRating = overallRatingMap[auditors[0]?.id];
      // }
      response.push({
        ...audit,
        auditType: rest[0],
        auditTypeId: audit?.auditType,
        organization: rest[1],
        location: rest[2],
        auditors,
        auditees,
        system: rest[3],
        auditedEntity,
        ncCount: ncCount,
        rating: auditorRating?.rating ?? 0,
        // overallRating: overallRating[0]?.rating||[],
      });
    }
    return { audits: response, count: auditCount };
    // } catch (err) {
    //   throw new InternalServerErrorException();
    // }
  }

  /**
   * @method uploadAttachment
   *  This method handles file uploads for audit ncs proofs
   * @param file uploaded file
   * @returns returns file info
   */
  async uploadAttachment(file: any, userid) {
    try {
      const path = file.path;
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: userid.id },
        include: { location: true, organization: true },
      });
      if (process.env.IS_OBJECT_STORE === 'true') {
        const objectName = this.ociUtils.addDocumentToOS(
          file,
          activeUser,
          activeUser?.location?.locationName,
        );

        return { name: file.originalname, path: objectName };
      } else {
        let path = `${
          process.env.SERVER_IP
        }/${activeUser.organization.realmName.toLowerCase()}/${activeUser.location.locationName.toLowerCase()}/audit/${
          file.filename
        }`;
        return { name: file.originalname, path: path };
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getAttachmentUrlOBJ(documentLink, userId) {
    try {
      const randomNumber = uuid();
      return this.ociUtils?.getViewerOBJ(documentLink, userId, randomNumber);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async uploadsAttachment(files: any, data) {
    try {
      //file,req.query.realm.toLowerCase()
      const documentLinks = [];
      const realmName = data.realm.toLowerCase();
      let locationName;

      if (locationName) {
        locationName = locationName;
      } else {
        locationName = 'NoLocation';
      }

      for (let file of files) {
        const documentLink = `${process.env.SERVER_IP}/${realmName}/${locationName}/audit/${file.filename}`;
        documentLinks.push({ documentLink, fileName: file.originalname });
      }
      // const path = file.path;
      return documentLinks;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
  /**
   * @method deleteAttachment
   *  This method handles deletion of uploaded files for audit ncs proofs
   * @param link path to delete file from
   * @returns returns file deletion status code 200 or 500
   */
  async deleteAttachment(link: string) {
    try {
      const deletePath = path.join(
        __dirname,
        process.env.ATTACHMENT_DIR_PATH,
        `${process.env.ATTACHMENT_DELETE_PATH}${link}`,
      );
      unlinkSync(deletePath);
      return { status: 200, msg: 'Attachmemt deleted' };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method isAuditNumberUnique
   *  This method is used to check if the passsed auditNumber is unique for an orginization
   * @param kcId kcId of current user
   * @param auditNumber auditNumber
   * @returns true | false
   */
  async isAuditNumberUnique(kcId: string, auditNumber: string) {
    try {
      const user = await this.userService.getUserInfo(kcId);
      const audits = await this.auditModel.find({
        auditNumber: auditNumber,
        organization: user.organizationId,
      });

      return { unique: audits.length === 0 };
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method rateAuditor
   *  This method rates user by its ID
   * @param audit Audit ID
   * @param ratedBy The user who is rating user
   * @param payload Payload
   * @returns AuditorRating document
   */
  async rateAuditor(
    audit: string,
    ratedBy: string,
    payload: CreateAuditorRating,
  ) {
    try {
      const ratedAudit = await this.auditModel.findById(audit);
      const rater = await this.userService.getUserInfo(ratedBy);
      const data = {
        ...payload,
        audit: ratedAudit._id,
        ratedBy: rater.id,
        user: ratedAudit.auditors[0],
      };
      const isRatedBefore = await this.AuditorRatingModel.findOne({
        audit: ratedAudit._id,
        ratedBy: rater.id,
      });

      if (isRatedBefore) {
        return await this.AuditorRatingModel.findByIdAndUpdate(
          isRatedBefore._id,
          {
            $set: {
              comment: data.comment,
              rating: data.rating,
              ratedBy: data.ratedBy,
            },
          },
        );
      } else {
        const newRating = await this.AuditorRatingModel.create(data);
        return newRating;
      }
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method getAuditorRating
   *  This method get the rating of a auditor by its ID
   * @param auditId Audit ID
   * @param auditorId Auditor ID
   * @returns Auditor Rating document
   */
  async getAuditorRating(auditId: string, auditorId: string) {
    return await this.AuditorRatingModel.findOne({
      user: auditorId,
      audit: new Types.ObjectId(auditId),
    }).select('rating comment');
  }

  /**
   * @method getAuditorAvgRating
   *  This method get a Auditor's overall rating of all the ratings he has
   * @param auditorId Auditor ID
   * @returns Average Rating
   */
  async getAuditorAvgRating(auditorId: string) {
    return await this.AuditorRatingModel.aggregate([
      { $match: { user: { $regex: auditorId, $options: 'i' } } },
      { $group: { _id: null, rating: { $avg: '$rating' } } },
    ]);
  }

  /**
   * @method checkIfAuditee
   *  This method checks if the a user is an auditee for any given audit
   * @param auditId Audit ID
   * @param userId User ID
   * @returns Boolean
   */
  async checkIfAuditee(auditId: string, userId: string) {
    try {
      const audit = await this.auditModel.findById({
        _id: new Types.ObjectId(auditId),
        // auditees: { $in: [userId] },
      });
      if (audit) {
        if (audit.auditees.includes(userId)) {
          return true;
        } else {
          const deptHead = await this.prismaService.entity.findFirst({
            where: {
              id: String(audit.auditedEntity),
            },
          });
          if (deptHead.users.includes(userId)) {
            return true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
    // return audit?.length > 0;
  }

  /**
   * @method checkIfAuditor
   *  This method checks if the a user is an auditor for any given audit
   * @param auditId Audit ID
   * @param userId User ID
   * @returns Boolean
   */
  async checkIfAuditor(auditId: string, userId: string) {
    const audit = await this.auditModel.find({
      _id: new Types.ObjectId(auditId),
      auditors: { $in: [userId] },
    });
    return audit.length > 0;
  }

  /** ==========   NC-OBS methods    ========================   */

  async createActionPoint(data, user) {
    try {
      const create = await this.ncActionPointModel.create(data);
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllNcActionPoints(userId) {
    // try {
    const activeUser = await this.prismaService.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    const getAllNcAps = await this.ncActionPointModel
      .find({
        organizationId: activeUser.organizationId,
      })
      .exec();

    const finalResult = await getAllNcAps.map(async (value) => {
      const data = {
        id: value._id,
        ncId: value.ncId,
        ncDate: value.ncDate,
        ncNumber: value.ncNumber,
        createdBy: value.createdBy,
        title: value.title,
        organizationId: value.organizationId,
        description: value.description,
        comments: value.comments,
        createdAt: value.createdAt,
        assignee: value.assignee,
        entity: value.entity,
        status: value.status,
        entityHead: value.entityHead || null,
      };
      return data;
    });
    const result = await Promise.all(finalResult);
    return result;
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
  }

  async getSingle(id, userId) {
    const finalResult = await this.ncActionPointModel.findById({
      _id: id,
    });
    return {
      _id: finalResult.id,
      ncId: finalResult.ncId,
      ncDate: finalResult.ncDate,
      ncNumber: finalResult.ncNumber,
      createdBy: finalResult.createdBy,
      title: finalResult.title,
      organizationId: finalResult.organizationId,
      description: finalResult.description,
      comments: finalResult.comments,
      createdAt: finalResult.createdAt,
      assignee: finalResult.assignee,
      entity: finalResult.entity,
      status: finalResult.status,
      entityHead: finalResult.entityHead,
      // updatedAt: value.updatedAt,
    };
  }

  async updateNCActionPoint(_id, userId, data) {
    const {
      ncId,
      ncDate,
      ncNumber,
      createdBy,
      title,
      organizationId,
      description,
      comments,
      createdAt,
      updatedAt,
      assignee,
      entityHead,
      entity,
      status,
    } = data;
    const orgId = await this.prismaService.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const updateActionPoint = await this.ncActionPointModel.findByIdAndUpdate(
        _id,
        {
          ncId,
          ncDate,
          ncNumber,
          createdBy,
          title,
          organizationId,
          description,
          comments,
          createdAt,
          entityHead,
          updatedAt,
          assignee,
          entity,
          status,
        },
      );
      return 'Action Point updated successfully';
    } catch (error) {
      throw new Error('Failed to update audit Type');
    }
  }

  async deleteActionPoint(id, userId) {
    try {
      const deleteNcAP = await this.ncActionPointModel.findByIdAndDelete(id);
      return `Action Point deleted Sucessfully`;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * @method getAllNcs
   *  This method fetches all the NCs for a user by its organization and location
   * @param kcId KcId of user
   * @returns Array of NCs / Observations
   */
  //  async getAllNcs(kcId: string) {
  //   const response = []

  //   const user = await this.userService.getUserInfo(kcId);
  //   const locId = user.locationId ?? user.entity.locationId;
  //   const audits = await this.auditModel.find( { organization: user.organizationId, location: locId});
  //   const ids = audits.map((item:any) => item._id);
  //   const ncs = await this.NcModel.find({ audit: { $in: ids } })
  //       .populate("audit", "_id auditName system auditors");

  //   for (let i=0; i< ncs.length; i++) {
  //     const nc:any = ncs[i];
  //     const doc = {...nc._doc };
  //     const system = await this.systemService.findById(nc.audit.system);
  //     const auditors = await Promise.all(nc.audit.auditors.map(item => this.userService.getUserById(item)));
  //     const audit = {
  //       _id: doc.audit._id,
  //       auditName: doc.audit.auditName,
  //       system,
  //       auditors
  //     }
  //     response.push({ ...doc,  audit });
  //   }

  //   return response;
  // }

  /**
   * @method filterNcSummary
   *  This method filters NCs for the given filter parameters
   * @param query filters
   * @param kcId kcId of user
   * @returns Array of NC
   */
  async getAllAuditReports(auditScheduleId) {
    const data = await this.auditModel.find({
      auditScheduleId: auditScheduleId,
    });
    return data;
  }

  async deleteAccess(nc, user) {
    try {
      const status = ['VERIFIED', 'CLOSED'];
      if (!status.includes(nc.status)) {
        if (user.kcRoles.roles.includes('ORG-ADMIN')) {
          return true;
        } else if (user.kcRoles.roles.includes('MR')) {
          if (user.user.locationId === nc.loction) {
            return true;
          }
          return false;
        }
        return false;
      }
      return false;
    } catch (err) {}
  }
  async filterNcSummary(year, query: any, kcId: any) {
    const {
      system,
      auditor,
      skip,
      limit,
      from,
      to,
      clauseNumber,
      auditType,
      sort,
      type,
      status,
      location,
      auditedEntity,
      selectedDepartment,
      selectedAuditee,
      SelectedAuditor,
      selectedAudit,
      selectedStatus,
      selectedType,
      selectedSystem,
      selectedClause,
      auditTypeNew,
      myDept,
      auditTypeId,
    } = query;
    const response = [];
    const user = await this.userService.getUserInfo(kcId);
    const parsedLocation =
      location !== '' && location?.length > 0 ? JSON.parse(location) : [];
    let locationData =
      parsedLocation.length > 0
        ? parsedLocation.map((value: any) => value?.id)
        : [];

    let whereCondition;
    if (locationData.includes('All')) {
      whereCondition = {
        organizationId: user.organizationId,
      };
    } else {
      whereCondition = { id: { in: locationData } };
    }

    let filters;
    const orgLocation = await this.prismaService.location.findMany({
      where: whereCondition,
    });
    const orgLocIds = orgLocation.map((value: any) => value?.id);
    let ncFilters = filterGenerator({
      createdAt: { gte: from, lte: to },
      skip: (skip - 1) * limit,
      limit,
      auditYear: year,
      locIds: orgLocIds?.length > 0 ? orgLocIds : [],
      organization: user?.organizationId,
      deleted: false,
      clauseNumber,
      auditTypeId,
      type,
      status,
      auditTypeNew,
      selectedStatus:
        selectedStatus !== undefined || selectedStatus !== 'undefined'
          ? selectedStatus
          : 'undefined',
      SelectedAuditor:
        SelectedAuditor !== undefined || SelectedAuditor !== 'undefined'
          ? SelectedAuditor
          : 'undefined',
      selectedAuditee:
        selectedAuditee !== undefined || selectedAuditee !== 'undefined'
          ? selectedAuditee
          : 'undefined',
      selectedSystem:
        selectedSystem !== undefined || selectedSystem !== 'undefined'
          ? selectedSystem
          : 'undefined',
      selectedDepartment:
        selectedDepartment !== undefined || selectedDepartment !== 'undefined'
          ? selectedDepartment
          : 'undefined',

      selectedAudit:
        selectedAudit !== undefined || selectedAudit !== 'undefined'
          ? selectedAudit
          : 'undefined',
      selectedType:
        selectedType !== undefined || selectedType !== 'undefined'
          ? selectedType
          : 'undefined',
      selectedClause:
        selectedClause !== undefined || selectedType !== 'undefined'
          ? selectedClause
          : 'undefined',
      sort: sort ?? '',
      myDept,
      auditedEntity: user?.entityId,
    });

    // ncFilters[0].$match['audit'] = { $in: ids };
    const count = await this.NcModel.countDocuments(ncFilters[0].$match);
    const ncs: any = await this.NcModel.aggregate(ncFilters).lookup({
      from: 'audits',
      as: 'audit',
      foreignField: '_id',
      localField: 'audit',
    });

    // looping over ncs and populating data

    for (let i = 0; i < ncs.length; i++) {
      const auditFindings = await this.AuditFindingsModel.findOne({
        findingType: ncs[i]?.type,
        auditTypeId: ncs[i]?.audit[0]?.auditType,
      });
      const nc: any = ncs[i];
      nc.audit = nc.audit[0];
      const isAccessible =
        nc?.auditors?.includes(user.id) || nc?.auditees?.includes(user.id);
      let auditedEntity: any = this.entityService.getEntityById(
        nc?.auditedEntity,
      );
      // let system: any = this.systemService.findById(nc.audit?.system);
      let system: any = nc?.system?.map((item) =>
        this.systemService.findById(item),
      );
      let location: any = this.locationService.getLocationById(nc?.location);

      let auditors: any = nc?.auditors?.map((item: any) =>
        this.userService.getUserById(item),
      );

      let auditees: any = nc?.auditees?.map((item) =>
        this.userService.getUserById(item),
      );

      let rest: any;

      [rest, auditors, auditees, system] = await Promise.all([
        Promise.all([auditedEntity, location]),
        Promise.all(auditors),
        Promise.all(auditees),
        Promise.all(system),
      ]);
      const access = await this.accessRigts(nc?.audit, nc, kcId);
      const deleteAccess = await this.deleteAccess(nc?.audit, {
        ...kcId,
        user,
      });
      // console.log('access', access);
      nc.system = system;

      nc.auditors = auditors || [];

      nc.auditees = auditees || [];

      nc.auditedEntityNew = rest[0];

      nc.location = rest[1];

      nc.isAccessible = isAccessible;

      nc.auditFindings = auditFindings;
      nc.date = nc.date === null ? nc.closureDate : nc.date;
      // console.log("access",access,nc.auditees,user.id)
      nc.access = access;
      nc.deleteAccess = deleteAccess;

      response.push(nc);
    }
    // console.log('response', response);
    return { nc: response, count };
  }

  async accessRigts(audit, nc, user) {
    // try {
    const activeUser = await this.prismaService.user.findFirst({
      where: { kcId: user.id },
      include: { location: true, entity: true },
    });

    let status = false;
    if (nc.currentlyUnder === 'AUDITEE') {
      if (nc?.auditees?.includes(activeUser.id)) {
        status = true;
      }

      if (activeUser?.entity?.users.includes(activeUser.id)) {
        status = true;
      }

      if (user.kcRoles.roles.includes('MR')) {
        status = true;
      }
    }

    if (nc.currentlyUnder === 'AUDITOR' && nc.status === 'AUDITORREVIEW') {
      if (audit?.auditors.includes(activeUser.id)) {
        status = true;
      }
    }

    if (nc.currentlyUnder === 'AUDITOR' && nc.status === 'VERIFIED') {
      if (
        user.kcRoles.roles.includes('AUDITOR') &&
        activeUser.entityId === nc.auditedEntity
      ) {
        status = true;
      }
    }

    if (nc.currentlyUnder === 'Function Spoc') {
      // if (
      //   user.kcRoles.roles.includes('AUDITOR') &&
      //   activeUser.entityId === nc.auditedEntity
      // ) {
      //   status = true;
      // }

      const entityForNc = await this.prismaService.entity.findFirst({
        where: {
          id: nc.auditedEntity,
        },
      });
      if (entityForNc?.functionId !== null) {
        const currentFunction = await this.prismaService.functions.findFirst({
          where: { id: entityForNc?.functionId },
        });
        if (currentFunction?.functionSpoc?.includes(activeUser.id)) {
          status = true;
        }
      }
    }

    if (
      user.kcRoles.roles.includes('ORG-ADMIN') &&
      nc.currentlyUnder === 'ORG-ADMIN'
    ) {
      status = true;
    }

    if (user.kcRoles.roles.includes('MR') && nc.currentlyUnder === 'MR') {
      status = true;
    }

    if (
      nc.currentlyUnder === 'ENTITY-HEAD' &&
      activeUser.entity.users.includes(activeUser.id)
    ) {
      status = true;
    }

    if (
      nc.currentlyUnder === 'LOCATION-ADMIN' &&
      activeUser.location.users.includes(activeUser.id)
    ) {
      status = true;
    }

    if (nc.currentlyUnder === 'DeptHead') {
      const entityData = await this.prismaService.entity.findFirst({
        where: { id: nc?.auditedEntity },
      });
      return entityData?.users?.includes(activeUser.id);
    }

    return status;
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }
  async myNcSummary(year, query: any, kcId: any) {
    const {
      system,
      auditor,
      skip,
      limit,
      from,
      to,
      clauseNumber,
      auditType,
      sort,
      type,
      status,
      auditedEntity,
    } = query;
    const response = [];
    const user = await this.userService.getUserInfo(kcId.id);
    // const filters = filterGenerator({
    //   organization: user.organizationId,
    //   deleted: false,
    //   auditedEntity,
    //   auditType,
    //   auditYear: year,
    //   system,
    //   // user: user.id,
    //   isDraft: false,
    //   auditor: auditor ?? '',
    //   date: { gte: from, lte: to },
    // });
    // const audits = await this.auditModel.aggregate(filters);
    // const ids = audits.map((item) => item._id);
    let ncFilters = filterGenerator({
      createdAt: { gte: from, lte: to },
      skip: (skip - 1) * limit,
      organization: user.organizationId,
      limit,
      clauseNumber,
      type,
      status,
      sort: sort ?? '',
    });
    ncFilters[0].$match['$or'] = [{ auditors: user.id }, { auditees: user.id }];
    const count = await this.NcModel.countDocuments(ncFilters[0].$match);
    const ncs: any = await this.NcModel.aggregate(ncFilters).lookup({
      from: 'audits',
      as: 'audit',
      foreignField: '_id',
      localField: 'audit',
    });
    // looping over ncs and populating data
    for (let i = 0; i < ncs.length; i++) {
      const auditFindings = await this.AuditFindingsModel.findOne({
        findingType: ncs[i].type,
        auditTypeId: ncs[i].audit[0].auditType,
      });
      const nc: any = ncs[i];
      nc.audit = nc.audit[0];
      const isAccessible =
        nc.audit.auditors.includes(user.id) ||
        nc.audit.auditees.includes(user.id);
      let auditedEntity: any = this.entityService.getEntityById(
        nc.audit.auditedEntity,
      );
      // let system: any = this.systemService.findById(nc.audit?.system);
      let system: any = nc.system.map((item) =>
        this.systemService.findById(item),
      );
      let location: any = this.locationService.getLocationById(
        nc.audit.location,
      );
      let auditors: any = nc.audit.auditors.map((item) =>
        this.userService.getUserById(item),
      );
      let auditees: any = nc.audit.auditees.map((item) =>
        this.userService.getUserById(item),
      );

      let rest: any;

      [rest, auditors, auditees, system] = await Promise.all([
        Promise.all([auditedEntity, location]),
        Promise.all(auditors),
        Promise.all(auditees),
        Promise.all(system),
      ]);
      const access = await this.accessRigts(nc.audit, nc, kcId);
      const deleteAccess = await this.deleteAccess(nc?.audit, {
        ...kcId,
        user,
      });

      nc.system = system;
      nc.audit.auditors = auditors;
      nc.auditors = auditors;
      nc.auditees = auditees;
      nc.audit.auditees = auditees;
      nc.audit.auditedEntity = rest[0];
      nc.audit.location = rest[1];
      nc.auditedEntityNew = rest[0];
      nc.isAccessible = isAccessible;
      nc.auditFindings = auditFindings;
      nc.access = access;
      nc.deleteAccess = deleteAccess;
      response.push(nc);
    }

    return { nc: response, count: count };
  }

  async searchNcData(query: any, user: any) {
    const { text, organization, pagination = true, skip, limit } = query;
    const response = [];

    let locations: any = this.prismaService.location.findMany({
      where: {
        AND: [
          { organizationId: organization },
          { locationName: { contains: text, mode: 'insensitive' } },
        ],
      },
    });

    let entities: any = this.prismaService.entity.findMany({
      where: {
        AND: [
          { organizationId: organization },
          { entityName: { contains: text, mode: 'insensitive' } },
        ],
      },
    });

    let systems: any = this.prismaService.systemType.findMany({
      where: {
        AND: [
          { organizationId: organization },
          { name: { contains: text, mode: 'insensitive' } },
        ],
      },
    });

    let users: any = this.prismaService.user.findMany({
      where: {
        AND: [
          { organizationId: organization },
          { OR: [{ email: { contains: text, mode: 'insensitive' } }] },
        ],
      },
    });

    // resolving all promises
    [locations, systems, users, entities] = await Promise.all([
      locations,
      systems,
      users,
      entities,
    ]);

    // getting all ids
    const locIds = locations.map((item) => item.id);
    const entityIds = entities.map((item) => item.id);
    const systemsIds = systems.map((item) => item.id);
    const userIds = users.map((item) => item.id);

    const audits = await this.auditModel
      .find({
        $or: [
          {
            $and: [
              { auditName: { $regex: text, $options: 'i' } },
              { organization },
            ],
          },
          { location: { $in: locIds } },
          { auditedEntity: { $in: entityIds } },
          { auditType: { $in: systemsIds } },
          { auditors: { $elemMatch: { $in: userIds } } },
          { auditees: { $elemMatch: { $in: userIds } } },
        ],
      })
      .select('_id');

    const auditIds = audits.map((item) => item._id); // getting all matching audit ids

    let ncs: any;
    if (pagination) {
      ncs = await this.NcModel.find({
        $or: [
          { audit: { $in: auditIds } },
          { type: { $regex: text, $options: 'i' } },
          { id: { $regex: text, $options: 'i' } },
          { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
          { status: { $regex: text, $options: 'i' } },
          { severity: { $regex: text, $options: 'i' } },
        ],
      })
        .skip(skip)
        .limit(limit)
        .populate('audit audit.system');
    } else {
      ncs = await this.NcModel.find({
        $or: [
          { audit: { $in: auditIds } },
          { type: { $regex: text, $options: 'i' } },
          { id: { $regex: text, $options: 'i' } },
          { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
          { status: { $regex: text, $options: 'i' } },
          { severity: { $regex: text, $options: 'i' } },
        ],
      }).populate('audit audit.system');
    }

    const count = await this.NcModel.countDocuments({
      $or: [
        { audit: { $in: auditIds } },
        { type: { $regex: text, $options: 'i' } },
        { id: { $regex: text, $options: 'i' } },
        { 'clause.clauseNumber': { $regex: text, $options: 'i' } },
        { status: { $regex: text, $options: 'i' } },
      ],
    }).lean();

    //  looping over ncs and populating data
    for (let i = 0; i < ncs.length; i++) {
      const nc: any = ncs[i].toObject();
      let auditedEntity: any = this.entityService.getEntityById(
        nc?.audit?.auditedEntity,
      );
      const isAccessible =
        nc.audit?.auditors.includes(user.id) ||
        nc.audit?.auditees.includes(user.id);
      let system: any = this.systemService.findById(nc.audit?.system);
      let location: any = this.locationService.getLocationById(
        nc.audit?.location,
      );

      // [auditedEntity, system, location] = await Promise.all([auditedEntity, system, location]);
      let auditors: any = nc.audit?.auditors?.map((item) =>
        this.userService.getUserById(item),
      );
      let auditees: any = nc.audit?.auditees?.map((item) =>
        this.userService.getUserById(item),
      );
      let rest: any;

      // resolving all promises parallely
      [rest, auditors, auditees] = await Promise.all([
        Promise.all([auditedEntity, system, location]),
        Promise.all(auditors),
        Promise.all(auditees),
      ]);

      nc.audit.system = rest[1];
      nc.audit.auditors = auditors;
      nc.audit.auditees = auditees;
      nc.audit.auditedEntity = rest[0];
      nc.audit.location = rest[2];
      nc.isAccessible = isAccessible;
      response.push(nc);
    }

    return { nc: response, count };
  }

  /**
   * @method getNcById
   *  This method gets an NC by its ID
   * @param ncId nc id
   * @returns populated NC
   */
  async getNcById(ncId: string) {
    const userMap = {};

    const nc: any = await this.NcModel.findById(ncId).populate(
      'audit ncComments workflowHistory',
    );
    const findingsData = await this.AuditFindingsModel.findOne({
      auditTypeId: nc?.audit?.auditType,
      findingType: nc.type,
    });
    const doc: any = nc.toObject();
    let entity: any = this.entityService.getEntityById(doc?.auditedEntity);
    let sample = await entity;
    // let entity: any = await this.prismaService.entity.findFirst({
    //   where: { id: doc.audit.auditedEntity },
    // });
    let location: any = this.locationService.getLocationById(doc?.location);
    let auditType: any = await this.auditSetting
      .findOne({ _id: new ObjectId(doc?.audit?.auditType) })
      .select('_id auditType VerificationOwner');
    let auditors: any = doc?.auditors.map((item) =>
      this.userService.getUserById(item),
    );
    let auditees: any = doc?.auditees.map((item) =>
      this.userService.getUserById(item),
    );

    for (let i = 0; i < doc.ncComments.length; i++) {
      let comment = doc.ncComments[i];

      if (userMap[comment.user]) {
        comment.user = userMap[comment.user];
      } else {
        const user = await this.userService.getUserById(comment.user);
        comment.user = user;
        userMap[comment.user] = user;
      }
    }

    for (let i = 0; i < doc.workflowHistory.length; i++) {
      const history = doc.workflowHistory[i];
      if (userMap[history.user]) {
        history.user = userMap[history.user];
      } else {
        const user = await this.userService.getUserById(history.user);
        history.user = user;
        userMap[history.user] = user;
      }
    }

    // resolving promises
    // let auditTypetest: any = await this.auditSetting.findOne({
    //   _id: new ObjectId(doc.audit.auditType),
    // });

    let rest: any;

    [rest, auditors, auditees] = await Promise.all([
      Promise.all([entity, location]),
      Promise.all(auditors),
      Promise.all(auditees),
    ]);

    doc.audit.auditedEntity = rest[0];
    doc.audit.location = rest[1];
    doc.audit.auditType = auditType;
    doc.audit.auditors = auditors;
    doc.audit.auditees = auditees;
    doc.entityHead = sample.users;
    doc.findings = findingsData;
    return doc;
  }

  async searchaudit(query: any, user: any) {
    const { text, skip, limit } = query;
    const response = [];
    const organization = await this.prismaService.user.findFirst({
      where: {
        kcId: user,
      },
    });
    let locations: any = this.prismaService.location.findMany({
      where: {
        AND: [
          { organizationId: organization.organizationId },
          { locationName: { contains: text, mode: 'insensitive' } },
        ],
      },
    });

    let entities: any = this.prismaService.entity.findMany({
      where: {
        AND: [
          { organizationId: organization.organizationId },
          { entityName: { contains: text, mode: 'insensitive' } },
        ],
      },
    });

    let systems: any = this.prismaService.systemType.findMany({
      where: {
        AND: [
          { organizationId: organization.organizationId },
          { name: { contains: text, mode: 'insensitive' } },
        ],
      },
    });

    let systemMasters: any = this.SystemModel.find({
      $and: [
        { organizationId: organization.organizationId },
        { name: { $regex: text, $options: 'i' } },
      ],
    });
    let users: any = this.prismaService.user.findMany({
      where: {
        AND: [
          { organizationId: organization.organizationId },
          { OR: [{ email: { contains: text, mode: 'insensitive' } }] },
        ],
      },
    });

    // resolving all promises
    [locations, systems, users, entities, systemMasters] = await Promise.all([
      locations,
      systems,
      users,
      entities,
      systemMasters,
    ]);

    // getting all ids
    const locIds = locations.map((item) => item.id);
    const entityIds = entities.map((item) => item.id);
    const systemsIds = systems.map((item) => item.id);
    const userIds = users.map((item) => item.id);
    const systemMasterIds = systemMasters.map((item) => item._id);
    const audits = await this.auditModel
      .find({
        $and: [{ organization: organization.organizationId }],
        $or: [
          {
            auditName: { $regex: text, $options: 'i' },
          },
          { auditNumber: { $regex: text, $options: 'i' } },
          { location: { $in: locIds } },
          { auditedEntity: { $in: entityIds } },
          { auditType: { $in: systemsIds } },
          { auditors: { $elemMatch: { $in: userIds } } },
          { auditees: { $elemMatch: { $in: userIds } } },
          { system: { $in: systemMasterIds } },
        ],
      })
      .skip(skip)
      .limit(limit);
    for (let i = 0; i < audits.length; i++) {
      const audit: any = audits[i];
      let systemtype: any = this.organizationService.getSystemTypeById(
        audit.auditType,
      );
      let organization: any = this.organizationService.getOrgById(
        audit.organization,
      );
      // let system: any = this.systemService.findById(audit.system);
      let system: any = this.SystemModel.find({ _id: audit.system }).select(
        '_id name',
      );
      let location: any = this.locationService.getLocationById(audit.location);
      let auditors: any = audit.auditors.map((item) =>
        this.userService.getUserById(item),
      );
      let auditees: any = audit.auditees.map((item) =>
        this.userService.getUserById(item),
      );
      let auditedEntity;
      if (audit.auditedEntity)
        auditedEntity = await this.entityService.getEntityById(
          audit.auditedEntity,
        );
      let rest: any;
      const ncCount = getNcCount(audit.sections);

      [rest, auditors, auditees] = await Promise.all([
        Promise.all([systemtype, organization, location, system]),
        Promise.all(auditors),
        Promise.all(auditees),
      ]);

      response.push({
        ...audit._doc,
        auditType: rest[0],
        auditTypeId: audit?.auditType,
        organization: rest[1],
        location: rest[2],
        auditors,
        auditees,
        system: rest[3],
        auditedEntity,
        ncCount,
      });
    }

    return { audits: response, count: response.length };
  }

  /**
   * @method createNewNcComment
   *  This method creates a new comment for any provided NC
   * @param ncId NC ID
   * @param comment comment text
   * @param kcId kcId of user
   * @returns created comment
   */
  async createNewNcComment(ncId: string, comment: string, kcId: string) {
    const user = await this.userService.getUserInfo(kcId);
    const newComment = await this.NcCommentModel.create({
      nc: ncId,
      comment,
      user: user.id,
    });
    const res = newComment.toObject();
    const isUpdated = await this.NcModel.findByIdAndUpdate(ncId, {
      $push: { ncComments: res._id },
    });

    if (!isUpdated) {
      throw new InternalServerErrorException();
    }
    res.user = user;
    return res;
  }

  async getFilterList(userId: any) {
    try {
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: userId },
      });
      const auditData = await this.auditModel.find({
        organization: activeUser.organizationId,
      });
      const auditDataIds = auditData.map((item: any) => item._id);
      let systemsIds = [];
      let auditorsId = [];
      let auditeesIds = [];
      const deptAllData = auditData.map((item: any) => item.auditedEntity);
      const auditDetailData = auditData.map((item: any) => {
        return {
          id: String(item._id),
          name: item.auditName,
        };
      });
      // const systemData = auditData.map((item:any)=> {...item.system})
      for (let value of auditData) {
        if (value.system.length > 0) {
          systemsIds.push(...value.system);
        }
        if (value.auditors.length > 0) {
          auditorsId.push(...value.auditors);
        }
        if (value.auditors.length > 0) {
          auditeesIds.push(...value.auditees);
        }
      }

      const systemData = await this.SystemModel.find({
        _id: { $in: systemsIds },
      }).sort({ name: 1 });
      systemData.sort((a: any, b: any) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );

      const auditorData = await this.prismaService.user.findMany({
        where: { id: { in: auditorsId } },
        orderBy: { username: 'asc' },
      });
      auditorData.sort((a: any, b: any) =>
        a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
      );

      const auditeeData = await this.prismaService.user.findMany({
        where: { id: { in: auditeesIds } },
        orderBy: { username: 'asc' },
      });

      auditeeData.sort((a: any, b: any) =>
        a.username.toLowerCase().localeCompare(b.username.toLowerCase()),
      );

      const allDeptData = await this.prismaService.entity.findMany({
        where: { id: { in: deptAllData } },
        orderBy: { entityName: 'asc' },
      });

      allDeptData.sort((a: any, b: any) =>
        a.entityName.toLowerCase().localeCompare(b.entityName.toLowerCase()),
      );

      const allNcs = await this.NcModel.find({
        audit: { $in: auditDataIds },
      });

      const typeData = allNcs?.map((item: any) => item.type);
      const statusData = allNcs?.map((item: any) => item.status);
      return {
        audit: auditDetailData,
        system: systemData,
        auditee: auditeeData,
        auditor: auditorData,
        deptData: allDeptData,
        typeData: [...new Set(typeData)],
        statusData: [...new Set(statusData)],
      };
    } catch (err) {}
  }

  /**
   * @method ncAcceptHandler This method handles a NCs accept action for a user of any role
   * @param ncId NC ID
   * @param user current user
   * @param body payload
   * @returns updated NC
   */
  async ncAcceptHandler(ncId: string, user: any, body: any) {
    let update;
    const {
      proofDocument,
      documentName,
      comment,
      isDraft,
      userId,
      date,
      statusDetail,
      targetDate,
      whyAnalysis,
      correction,
      verficationDate,
      verficationAction,
      closureDate,
      closureRemarks,
      save,
      actualDate,
      actualTargetDate,
      actualCorrection,
      actualComment,
      rejectComment,
    } = body;
    const nc: any = await this.NcModel.findById(ncId);
    const currentUser = await this.userService.getUserById(userId);
    const currentNc = await this.NcModel.findById(ncId);
    const ncDepartMent: any = await this.prismaService.entity.findFirst({
      where: { id: nc.auditedEntity },
    });
    let isAuditee: any = this.checkIfAuditee(currentNc.audit, currentUser.id);
    let isAuditor: any = this.checkIfAuditor(currentNc.audit, currentUser.id);
    let organization: any = this.organizationService.getOrgById(
      currentUser.organizationId,
    );
    // resolving promises
    [isAuditee, isAuditor, organization] = await Promise.all([
      isAuditee,
      isAuditor,
      organization,
    ]);

    const audit = (await this.auditModel.findById(nc.audit)).toObject();
    if (save === true) {
      const newHistory = new this.NcWorkflowHistoryModel({
        nc: new Types.ObjectId(ncId),
        action: correction ? NcStatus.IN_PROGRESS : NcStatus.ACCEPTED,
        user: currentUser.id,
        comment: rejectComment,
      });

      const history = await newHistory.save();
      update = await this.NcModel.findByIdAndUpdate(ncId, {
        $set: {
          correctiveAction: {
            proofDocument,
            documentName,
            date,
            comment,
            correction,
            whyAnalysis,
            targetDate,
            actualDate,
            actualTargetDate,
            actualCorrection,
            actualComment,
          },
          status: correction ? NcStatus.IN_PROGRESS : NcStatus.ACCEPTED,
        },
        $push: {
          workflowHistory: history._id,
        },
      });

      return update;
    } else {
      if (statusDetail) {
        const newHistory = new this.NcWorkflowHistoryModel({
          nc: new Types.ObjectId(ncId),
          action: correction ? NcStatus.IN_PROGRESS : NcStatus.ACCEPTED,
          user: currentUser.id,
          comment: rejectComment,
        });

        const history = await newHistory.save();
        let mr: any = await this.getAllMrsOfLocation(audit.location); // getting all mrs to send email
        const notification = await this.getAllNotificationUser(
          audit?.auditedEntity,
        );

        const update = await this.NcModel.findByIdAndUpdate(ncId, {
          $set: {
            status: NcStatus.ACCEPTED,
            correctiveAction: {
              proofDocument,
              documentName,
              comment,
              isDraft,
              targetDate,
              correction,
              whyAnalysis,
              actualDate,
              actualTargetDate,
              actualCorrection,
              actualComment,
            },
            currentlyUnder: 'AUDITEE',
          },
          $push: {
            workflowHistory: history._id,
          },
        });

        let auditors: any = audit.auditors
          .filter((value) => value !== currentUser.id)
          .map((user) => this.userService.getUserById(user));
        let auditees: any = audit.auditees
          .filter((value) => value !== currentUser.id)
          .map((value: any) => this.userService.getUserById(value));
        auditors = await Promise.all(auditors);
        auditees = await Promise.all(auditees);
        let cc = [
          ...auditees?.map((user) => user.email),
          ...mr
            ?.filter((value) => value?.id !== currentUser)
            ?.map((value) => value?.email),
          ...notification
            ?.filter((value) => value?.id !== currentUser)
            ?.map((value) => value?.email),
        ];
        await sendFindingAcceptanceEmail(
          ncDepartMent,
          audit,
          currentNc,
          currentUser,
          auditors,
          [...new Set(cc)],
          currentUser.realmName,
          this.prismaService.user,
          this.emailService.sendEmail,
        );
      } else {
        if (isAuditee && nc.currentlyUnder === 'AUDITEE') {
          // if (currentNc.type === 'OFI' || currentNc.type === 'Observation') {
          //   if (isDraft) {
          //     update = await this.NcModel.findByIdAndUpdate(ncId, {
          //       $set: {
          //         status: NcStatus.CLOSED,
          //         correctiveAction: {
          //           proofDocument,
          //           documentName,
          //           date,
          //           comment,
          //           isDraft,
          //           targetDate,
          //           correction,
          //           whyAnalysis,
          //           actualDate,
          //           actualTargetDate,
          //           actualCorrection,
          //           actualComment,
          //         },
          //         currentlyUnder: 'NONE',
          //       },
          //     });
          //   } else {
          //     const newHistory = new this.NcWorkflowHistoryModel({
          //       nc: new Types.ObjectId(ncId),
          //       action: NcAction.CLOSED,
          //       user: currentUser.id,
          //     });

          //     const history = await newHistory.save();
          //     update = await this.NcModel.findByIdAndUpdate(ncId, {
          //       $set: {
          //         status: NcStatus.CLOSED,
          //         auditeeAccepted: true,
          //         auditeeRejected: false,
          //         correctiveAction: {
          //           proofDocument,
          //           documentName,
          //           date,
          //           comment,
          //           isDraft: false,
          //           correction,
          //           whyAnalysis,
          //           targetDate,
          //           actualDate,
          //           actualTargetDate,
          //           actualCorrection,
          //           actualComment,
          //         },
          //         currentlyUnder: 'None',
          //       },
          //       $push: {
          //         workflowHistory: history._id,
          //       },
          //     });
          //   }
          // }

          // else {
          if (isDraft) {
            update = await this.NcModel.findByIdAndUpdate(ncId, {
              $set: {
                status: NcStatus.OPEN,
                correctiveAction: {
                  proofDocument,
                  documentName,
                  date,
                  comment,
                  isDraft,
                  targetDate,
                  correction,
                  whyAnalysis,
                  actualDate,
                  actualTargetDate,
                  actualCorrection,
                  actualComment,
                },
                currentlyUnder: 'AUDITEE',
              },
            });
          } else {
            const newHistory = new this.NcWorkflowHistoryModel({
              nc: new Types.ObjectId(ncId),
              action: NcStatus.AUDITORREVIEW,
              user: currentUser.id,
              comment: rejectComment,
            });

            const history = await newHistory.save();
            update = await this.NcModel.findByIdAndUpdate(ncId, {
              $set: {
                status: NcStatus.AUDITORREVIEW,
                auditeeAccepted: true,
                auditeeRejected: false,
                correctiveAction: {
                  proofDocument,
                  documentName,
                  date,
                  comment,
                  isDraft: false,
                  correction,
                  whyAnalysis,
                  targetDate,
                  actualDate,
                  actualTargetDate,
                  actualCorrection,
                  actualComment,
                },
                currentlyUnder: 'AUDITOR',
              },
              $push: {
                workflowHistory: history._id,
              },
            });
          }
          // }

          //sending mail for Nc acceptance
          let mr: any = await this.getAllMrsOfLocation(audit?.location); // getting all mrs ot put on CC
          let notification: any = await this.getAllNotificationUser(
            audit?.auditedEntity,
          );

          mr = mr.map((item) => item.email);
          notification = notification?.map((item) => item?.email);
          let combinedData = [...new Set([...mr, ...notification])];
          await sendNcAcceptedEmail(
            nc,
            currentUser,
            audit.auditors,
            combinedData,
            organization.realmName,

            this.prismaService.user,
            this.emailService.sendEmail,
          );
        } else if (user.kcRoles.roles.includes(roles['AUDITOR']) && isAuditor) {
          if (isDraft) {
            const newHistory = await this.NcWorkflowHistoryModel.create({
              nc: new Types.ObjectId(ncId),
              action: NcStatus.SENTBACK,
              user: currentUser.id,
              comment: rejectComment,
            });

            const history = newHistory;
            update = await this.NcModel.findByIdAndUpdate(ncId, {
              $set: {
                status: NcStatus.IN_PROGRESS,
                currentlyUnder: 'AUDITEE',
                auditeeAccepted: false,
              },
              $push: {
                workflowHistory: history._id,
              },
            });
            let auditors: any = audit.auditors.map((user) =>
              this.userService.getUserById(user),
            );
            let auditees: any = audit.auditees
              .filter((value) => value !== currentUser.id)
              .map((value: any) => this.userService.getUserById(value));
            auditors = await Promise.all(auditors);
            auditees = await Promise.all(auditees);
            let mr: any = await this.getAllMrsOfLocation(audit.location);
            let notification = await this.getAllNotificationUser(
              audit?.auditedEntity,
            );

            let cc = [
              ...auditors?.map((user) => user.email),
              ...mr
                ?.filter((value) => value?.id !== currentUser)
                ?.map((value) => value?.email),

              ...notification
                ?.filter((value) => value?.id !== currentUser)
                ?.map((value) => value?.email),
            ];
            await sendFindingSentBackEmail(
              ncDepartMent,
              audit,
              currentNc,
              currentUser,
              auditees,
              [...new Set(cc)],
              currentUser.organization.realmName,
              this.prismaService.user,
              rejectComment,
              this.emailService.sendEmail,
            );
          } else {
            const newHistory = await this.NcWorkflowHistoryModel.create({
              nc: new Types.ObjectId(ncId),
              action: NcStatus.VERIFIED,
              user: currentUser.id,
              comment: rejectComment,
            });

            const history = newHistory;
            const currentAudit = await this.auditModel.findById(
              currentNc.audit,
            );
            const userPermission = await this.auditSetting.findById(
              currentAudit.auditType,
            );
            const findingsData = await this.AuditFindingsModel.findOne({
              auditTypeId: currentAudit.auditType,
              findingType: nc.type,
            });

            update = await this.NcModel.findByIdAndUpdate(ncId, {
              $set: {
                status: NcStatus.VERIFIED,
                currentlyUnder: newRoles[findingsData.closureBy],
                closureRemarks,
                closureDate,
                auditorAccepted: true,
                auditorReview: {
                  date,
                  comment,
                  isDraft: false,
                  verficationDate,
                  verficationAction,
                },
                closureReview: {
                  closureRemarks,
                  closureDate,
                },
              },
              $push: {
                workflowHistory: history._id,
              },
            });
            let auditors: any = audit.auditors
              .filter((value) => value !== currentUser.id)
              .map((user) => this.userService.getUserById(user));
            auditors = await Promise.all(auditors);
            // mail to MR
            let auditees: any = audit.auditees
              .filter((value) => value !== currentUser.id)
              .map((value: any) => this.userService.getUserById(value));

            auditees = await Promise.all(auditees);
            let mr: any = await this.getAllMrsAndMcoeOfLocation(audit.location); // getting all mrs to send email
            let cc = [
              ...auditees?.map((user) => user.email),
              ...auditees
                ?.filter((value) => value?.id !== currentUser)
                ?.map((value) => value?.email),
            ];
            await sendFindingVerifiedEmail(
              ncDepartMent,
              audit,
              currentNc,
              currentUser,
              mr,
              [...new Set(cc)],
              currentUser.organization.realmName,
              this.prismaService.user,
              this.emailService.sendEmail,
            );
          }
        }
        // if current user is MR, he can accept and send it back to auditee
        else if (
          user.kcRoles.roles.includes(roles['MR']) ||
          user.kcRoles.roles.includes(roles['ORG-ADMIN'])
        ) {
          // if auditee rejected
          if (!currentNc?.auditeeAccepted) {
            const newHistory = await this.NcWorkflowHistoryModel.create({
              nc: new Types.ObjectId(ncId),
              action: NcAction.ACCEPTED,
              user: currentUser.id,
              comment: rejectComment,
            });

            const history = newHistory;
            update = await this.NcModel.findByIdAndUpdate(ncId, {
              $set: {
                status: NcStatus.ACCEPTED,
                currentlyUnder: 'AUDITEE',
                correctiveAction: {
                  isDraft: true,
                },
                auditeeRejected: false,
              },
              $push: {
                workflowHistory: history._id,
              },
            });

            let auditors: any = audit.auditors.map((user) =>
              this.userService.getUserById(user),
            );
            auditors = await Promise.all(auditors);
            const cc = auditors.map((user) => user.email);
            await sendMrNcAcceptanceEmail(
              currentNc,
              currentUser,
              audit.auditees,
              cc,
              currentUser?.organization?.realmName,
              sgMail,
              this.prismaService.user,
            );
          } else {
            // if auditee accepted and Auditor reviewed
            const newHistory = new this.NcWorkflowHistoryModel({
              nc: new Types.ObjectId(ncId),
              action: NcAction.CLOSED,
              user: currentUser.id,
              comment: rejectComment,
            });

            const history = await newHistory.save();
            update = await this.NcModel.findByIdAndUpdate(ncId, {
              $set: {
                status: NcStatus.CLOSED,
                currentlyUnder: '',
                closureDate: Date.now(),
                closureRemarks,
                mrAccepted: true,
              },
              $push: {
                workflowHistory: history._id,
              },
            });

            // sending NC closure mail
            const receivers = [...audit.auditors, ...audit.auditees];
            await sendNcClosureEmail(
              nc,
              currentUser,
              receivers,
              organization.realmName,

              this.prismaService.user,
              this.emailService.sendEmail,
            );
          }
        }

        // if current user is Auditor, he will review

        return await this.getNcById(update._id);
      }
    }
    // if current user is Auditee
  }

  /**
   * @method ncRejectHandler
   *  This handler a NC rejects action performed of a user of any role
   * @param ncId NC ID
   * @param user current user
   * @param body payload
   * @returns updated NC
   */
  async ncRejectHandler(ncId: string, user: any, body: any) {
    const { userId, proofDocument, documentName, comment, rejectComment } =
      body;
    try {
      let update;
      const nc: any = await this.NcModel.findById(ncId);
      const currentUser = await this.userService.getUserById(userId);
      const currentNc = await this.NcModel.findById(ncId);
      const isAuditee = await this.checkIfAuditee(
        currentNc.audit,
        currentUser.id,
      );
      const audit: any = await this.auditModel.findById(currentNc.audit);
      const organization = await this.organizationService.getOrgById(
        currentUser.organizationId,
      );
      const ncDepartMent: any = await this.prismaService.entity.findFirst({
        where: { id: nc.auditedEntity },
      });
      const findingsData = await this.AuditFindingsModel.findOne({
        auditTypeId: audit.auditType,
        findingType: nc.type,
      });
      let permission;
      if (findingsData.closureBy === 'IMSC') {
        permission = 'MR';
      } else if (findingsData.closureBy === 'MCOE') {
        permission = 'ORG-ADMIN';
      } else {
        permission = 'None';
      }
      // if current user is Auditee, he will reject the NC
      if (isAuditee) {
        // NC under Auditee
        const newHistory = new this.NcWorkflowHistoryModel({
          nc: new Types.ObjectId(ncId),
          action: NcAction.REJECTED,
          user: currentUser.id,
          comment: rejectComment,
        });

        const history = await newHistory.save();
        update = await this.NcModel.findByIdAndUpdate(ncId, {
          $set: {
            status: NcStatus.REJECTED,
            currentlyUnder: newRoles[findingsData.closureBy],
            auditeeRejected: true,
            correctiveAction: {
              comment,
              proofDocument,
              documentName,
            },
          },
          $push: {
            workflowHistory: history._id,
          },
        });

        // sending mail
        //sending mail for Nc acceptance
        let mr: any = await this.getAllMrsOfLocation(
          // user.organizationId,
          audit.location,
        ); // getting all mrs to send email
        let notification = await this.getAllNotificationUser(
          audit?.auditedEntity,
        );

        mr = mr.map((item) => item.id);
        let emailReceivers = [...audit.auditors, ...mr];
        let auditors: any = audit.auditors.map((user) =>
          this.userService.getUserById(user),
        );
        auditors = await Promise.all(auditors);
        let auditees: any = audit.auditees
          .filter((value) => value !== currentUser.id)
          .map((value: any) => this.userService.getUserById(value));
        auditees = await Promise.all(auditees);
        let cc = [
          ...auditees?.map((user) => user.email),
          mr
            ?.filter((value) => value?.id !== currentUser)
            ?.map((value) => value?.email),

          notification
            ?.filter((value) => value?.id !== currentUser)
            ?.map((value) => value?.email),
        ];
        await sendFindingRejectEmail(
          ncDepartMent,
          audit,
          currentNc,
          currentUser,
          auditors,
          cc,
          currentUser?.organization?.realmName,
          this.prismaService.user,
          this.emailService.sendEmail,
        );
      }

      // if current user is MR, he will reject nc
      else if (user.kcRoles.roles.includes(roles['MR'])) {
        // currentlyUnder: "AUDITEE"
        const id = 'OBS' + (await this.getObsUniqueId());
        const newHistory = new this.NcWorkflowHistoryModel({
          nc: new Types.ObjectId(ncId),
          action: NcAction.REJECTED_AND_CLOSED,
          user: currentUser.id,
        });

        const history = await newHistory.save();
        update = await this.NcModel.findByIdAndUpdate(
          ncId,
          {
            $set: {
              clause: [],
              type: 'Observation',
              status: NcStatus.OPEN,
              currentlyUnder: 'AUDITEE',
              severity: '',
              id,
              auditeeAccepted: false,
              auditeeRejected: false,
              auditorAccepted: false,
              mrAccepted: false,
              mrRejected: false,
              correctiveAction: {
                isDraft: true,
              },
            },
            $push: {
              workflowHistory: history._id,
            },
          },
          { new: true },
        );

        const receivers = [...audit.auditors, ...audit.auditees];
        await sendNcClosureEmail(
          nc,
          currentUser,
          receivers,
          organization.realmName,
          sgMail,
          this.prismaService.user,
        );
      }

      return await this.getNcById(update._id);
    } catch (err) {}
  }

  async finalNcRejectHandler(ncId: string, user: any, body: any) {
    const { userId, proofDocument, documentName, comment, rejectComment } =
      body;
    try {
      let update;
      const nc = await this.NcModel.findById(ncId);
      const currentUser = await this.userService.getUserById(userId);
      const currentNc = await this.NcModel.findById(ncId);

      const audit = await this.auditModel.findById(currentNc.audit);
      const organization = await this.organizationService.getOrgById(
        currentUser.organizationId,
      );

      const findingsData = await this.AuditFindingsModel.findOne({
        auditTypeId: audit.auditType,
        findingType: nc.type,
      });

      // if current user is Auditee, he will reject the NC
      // NC under Auditee
      const newHistory = new this.NcWorkflowHistoryModel({
        nc: new Types.ObjectId(ncId),
        action: NcAction.REMOVED,
        user: currentUser.id,
        comment: rejectComment,
      });

      const history = await newHistory.save();
      update = await this.NcModel.findByIdAndUpdate(ncId, {
        $set: {
          status: NcStatus.REMOVED,
          currentlyUnder: '',
        },
        $push: {
          workflowHistory: history._id,
        },
      });

      // sending mail
      //sending mail for Nc acceptance
      let mr: any = await this.getAllMrsOfLocation(
        // user.organizationId,
        audit.location,
      ); // getting all mrs to send email
      let notification: any = await this.getAllNotificationUser(
        audit?.auditedEntity,
      );

      mr = mr.map((item) => item.email);
      notification = notification?.map((item) => item?.email);
      let emailReceivers = [...audit.auditors, ...mr, ...notification];
      await sendNcRejectedEmail(
        nc,
        currentUser,
        [...new Set(emailReceivers)],
        organization.realmName,

        this.prismaService.user,
        this.emailService.sendEmail,
      );

      // if current user is MR, he will reject nc

      return await this.getNcById(update._id);
    } catch (err) {}
  }
  async rejectToConvert(ncId: string, user: any, body: any) {
    const {
      userId,
      proofDocument,
      documentName,
      comment,
      type,
      rejectComment,
    } = body;
    //console.log('type', type);
    try {
      let update;
      const nc = await this.NcModel.findById(ncId);
      const currentUser = await this.userService.getUserById(userId);
      const currentNc = await this.NcModel.findById(ncId);

      const audit = await this.auditModel.findById(currentNc.audit);
      const organization = await this.organizationService.getOrgById(
        currentUser.organizationId,
      );

      // if current user is Auditee, he will reject the NC

      // if current user is MR, he will reject nc
      // currentlyUnder: "AUDITEE"
      // const id = type + (await this.getObsUniqueId());

      const auditFindins = await this.AuditFindingsModel.findOne({
        auditTypeId: audit.auditType,
        findingType: type,
      });
      let status = 'OPEN';

      if (auditFindins.accept === false && auditFindins.reject === false) {
        status = 'ACCEPTED';
      }
      const newHistory = new this.NcWorkflowHistoryModel({
        nc: new Types.ObjectId(ncId),
        action: `Finding Type Converted To ${type} `,
        user: currentUser.id,
        comment: rejectComment,
      });

      const history = await newHistory.save();
      update = await this.NcModel.findByIdAndUpdate(
        ncId,
        {
          $set: {
            clause: [],
            type: type,
            status: status,
            currentlyUnder: 'AUDITEE',
            severity: '',
            auditeeAccepted: false,
            auditeeRejected: false,
            auditorAccepted: false,
            mrAccepted: false,
            mrRejected: false,
            correctiveAction: {
              isDraft: true,
            },
          },
          $push: {
            workflowHistory: history._id,
          },
        },
        { new: true },
      );

      const receivers = [...audit.auditors, ...audit.auditees];
      await sendNcClosureEmail(
        nc,
        currentUser,
        receivers,
        organization.realmName,
        sgMail,
        this.prismaService.user,
      );

      return await this.getNcById(update._id);
    } catch (err) {}
  }
  /**
   * @method ncCloseHandler
   *  This method handles NC close action performed by any user
   * @param ncId NC ID
   * @param user current user
   * @param body payoad
   * @returns updated NC
   */
  async ncCloseHandler(ncId: string, user: any, body: any) {
    const {
      userId,
      date,
      comment,
      isDraft,
      verficationDate,
      verficationAction,
      proofDocument,
      targetDate,
      correction,
      whyAnalysis,
      closureRemarks,
      closureDate,
      auditRequired,
      actualDate,
      actualTargetDate,
      actualCorrection,
      actualComment,
      documentName,
    } = body;
    // try {
    let update;
    const nc: any = await this.NcModel.findById(ncId);
    const audit = await this.auditModel.findById(nc.audit);
    const currentUser = await this.userService.getUserById(userId);
    const organization = await this.organizationService.getOrgById(
      currentUser.organizationId,
    );
    const ncDepartMent: any = await this.prismaService.entity.findFirst({
      where: { id: nc.auditedEntity },
    });
    const auditFindins = await this.AuditFindingsModel.findOne({
      auditTypeId: audit.auditType,
      findingType: nc.type,
    });

    // if (
    //   user.kcRoles.roles.includes(newRoles[auditFindins.closureBy]) &&
    //   nc.currentlyUnder === newRoles[auditFindins.closureBy]
    // ) {
    const newHistory = new this.NcWorkflowHistoryModel({
      nc: new Types.ObjectId(ncId),
      action: NcAction.CLOSED,
      user: currentUser.id,
    });

    const history = await newHistory.save();
    update = await this.NcModel.findByIdAndUpdate(
      ncId,
      {
        $set: {
          status: NcStatus.CLOSED,
          currentlyUnder: '',
          closureDate: Date.now(),
          date,
          comment,
          isDraft,
          verficationDate,
          verficationAction,
          proofDocument,
          targetDate,
          correction,
          whyAnalysis,
          closureRemarks,
          auditRequired,
          closureReview: {
            closureRemarks,
            closureDate,
          },
          auditorReview: {
            date,
            comment,
            isDraft,
            verficationDate,
            verficationAction,
          },
          correctiveAction: {
            proofDocument,
            date,
            comment,
            correction,
            whyAnalysis,
            targetDate,
            actualDate,
            actualTargetDate,
            actualCorrection,
            actualComment,
            documentName,
          },
        },
        $push: {
          workflowHistory: history._id,
        },
      },
      { new: true },
    );
    // }
    let auditors: any = audit.auditors
      .filter((value) => value !== currentUser.id)
      .map((user) => this.userService.getUserById(user));
    auditors = await Promise.all(auditors);
    // mail to MR
    let auditees: any = audit.auditees
      .filter((value) => value !== currentUser.id)
      .map((value: any) => this.userService.getUserById(value));

    auditees = await Promise.all(auditees);
    let mr: any = await this.getAllMrsAndMcoeOfLocation(audit.location); // getting all mrs to send email
    let cc = [
      ...auditors?.map((user) => user.email),
      ...mr
        ?.filter((value) => value?.id !== currentUser)
        ?.map((value) => value?.email),
    ];

    // sending emial
    await sendFindingClosureEmail(
      ncDepartMent,
      audit,
      nc,
      currentUser,
      auditees,
      [...new Set(cc)],
      currentUser.organization.realmName,
      this.prismaService.user,
      this.emailService.sendEmail,
    );

    return await this.getNcById(update._id);
    // } catch (err) {}
  }

  /**
   * @method ncBtnStatusHandler
   *  This method checks and retuns the action availbel for a user of any NC
   * @param ncId NC ID
   * @param user current user
   * @param userId User ID
   * @returns u
   */
  async ncBtnStatusHandler(ncId: string, user: any, data: any) {
    const { userId, type } = data;
    const currentUser: any = await this.userService.getUserById(userId);
    const currentNc: any = await this.NcModel.findById(ncId);
    const isAuditee: any = await this.checkIfAuditee(
      currentNc.audit,
      currentUser.id,
    );
    const isAuditor: any = await this.checkIfAuditor(
      currentNc.audit,
      currentUser.id,
    );
    const auditData = await this.auditModel.findById(currentNc.audit);

    const auditFindins = await this.AuditFindingsModel.findOne({
      auditTypeId: auditData.auditType,
      findingType: currentNc.type,
    });

    // const auditFindClosure = auditFindins.closure ==="MCOE"
    if (currentNc.currentlyUnder === 'None') {
      return { status: false, options: [] };
    } else {
      if (isAuditee && currentNc.currentlyUnder === 'AUDITEE') {
        // const ifAuditeeRejectedBefore = await this.NcWorkflowHistoryModel.findOne({
        //   nc: currentNc._id,
        //   action: NcAction.REJECTED,
        //   user: currentUser.id
        // });
        if (currentNc?.auditeeAcepted) {
          if (currentNc.type === 'OFI') {
            return { status: true, options: ['Accept OFI', 'Save'] };
          } else if (currentNc.type === 'Observation') {
            return { status: true, options: ['Accept OBS', 'Save'] };
          } else {
            if (auditFindins.accept === true) {
              return { status: true, options: ['Accept NC', 'Save'] };
            } else {
              return { status: true, options: ['Save'] };
            }
          }
        }

        if (currentNc?.status === 'ACCEPTED') {
          if (currentNc.type === 'OFI') {
            return {
              options: ['Close OFI', 'Save'],
            };
          } else if (currentNc.type === 'Observation') {
            return {
              options: ['Close OBS', 'Save'],
            };
          } else {
            if (auditFindins.auditorVerification) {
              return {
                options: ['Submit to Auditor', 'Save'],
              };
            } else {
              return {
                options: ['Save'],
              };
            }
          }
        } else {
          if (currentNc.type === 'OFI') {
            return {
              status: true,
              options: ['Accept OFI', 'Save'],
            };
          } else if (currentNc.type === 'Observation') {
            return {
              status: true,
              options: ['Accept OBS', 'Save'],
            };
          } else {
            if (auditFindins.accept === true) {
              return {
                status: true,
                options: [
                  'Accept NC',
                  'Reject NC',
                  'Save',
                  'Submit to Auditor',
                ],
              };
            } else {
              return {
                status: true,
                options: [
                  // 'Accept NC',
                  'Reject NC',
                  'Save',
                  'Submit to Auditor',
                ],
              };
            }
          }
        }
      } else if (isAuditor && currentNc.currentlyUnder === 'AUDITOR') {
        // if auditee has already accepted the NC
        if (currentNc?.auditeeAccepted && auditFindins.auditorVerification) {
          return { status: true, options: ['Verify', 'Save'] };
        }
        if (auditFindins.rejected) {
          return {
            status: true,
            options: ['Accept', 'Reject', 'Save'],
          };
        } else {
          return { status: true, options: ['Accept', 'Save'] };
        }
      } else if (currentNc.status === 'VERIFIED') {
        if (auditFindins.closureBy !== 'None') {
          const ownerInfo =
            auditFindins.closureBy === 'MCOE'
              ? 'ORG-ADMIN'
              : auditFindins.closureBy === 'IMSC'
              ? 'MR'
              : auditFindins.closureBy;

          //   currentNc.status === 'VERIFIED' ||
          //   (currentNc.status === 'REJECTED' &&
          //     (user.kcRoles.roles.includes(roles['MR']) ||
          //       (user.kcRoles.roles.includes(roles['ORG-ADMIN']) &&
          //         currentNc.currentlyUnder === 'MR') ||
          //       currentNc.currentlyUnder === 'ORG-ADMIN'))
          // ) {
          //   if (currentNc?.auditorAccepted) {
          //     return { status: true, options: ['Accept & Close'] };
          //   }

          return { status: true, options: ['Accept', 'Reject NC', 'Close NC'] };
        }
      } else {
        return { status: false, options: [] };
      }
    }
  }

  async ncBtnStatusHandlerClone(ncId: string, user: any, data: any) {
    const { userId, type } = data;
    const currentUser: any = await this.userService.getUserById(userId);
    const currentNc: any = await this.NcModel.findById(ncId);
    const isAuditee: any = await this.checkIfAuditee(
      currentNc.audit,
      currentUser.id,
    );
    const isAuditor: any = await this.checkIfAuditor(
      currentNc.audit,
      currentUser.id,
    );
    const auditData = await this.auditModel.findById(currentNc.audit);

    const auditFindins = await this.AuditFindingsModel.findOne({
      auditTypeId: auditData?.auditType,
      findingType: currentNc.type,
    });
    let options = [];
    let status = false;

    if (currentNc.currentlyUnder === 'None') {
    } else if (currentNc.currentlyUnder === 'AUDITEE' && isAuditee) {
      if (currentNc.status === 'OPEN') {
        if (auditFindins.accept === true) {
          status = true;
          options.push('ACCEPT');
        }
        if (auditFindins.reject === true || auditFindins.rejected === true) {
          status = true;
          options.push('Reject NC');
        }
      } else if (
        currentNc.status === 'ACCEPTED' ||
        currentNc.status === 'IN_PROGRESS'
      ) {
        if (auditFindins.auditorVerification === true) {
          status = true;
          options.push('Submit to Auditor');
        }
        // if (auditFindins.reject === true || auditFindins.rejected === true) {
        //   status = true;
        //   options.push('Reject NC');
        // }
        status = true;
        options.push('Save');
      }
    } else if (
      currentNc.currentlyUnder === 'AUDITOR' &&
      isAuditor &&
      currentNc.status === 'AUDITORREVIEW'
    ) {
      if (auditFindins.auditorVerification === true) {
        status = true;
        options.push('Verify');
        options.push('Send Back to Auditee');
      }
    } else if (currentNc.status === 'VERIFIED') {
      // currentNc.currentlyUnder === newRoles[auditFindins.closureBy]
      if (currentNc.currentlyUnder === 'DeptHead') {
        const currentNcEntity = await this.prismaService.entity.findFirst({
          where: { id: currentNc.auditedEntity },
        });
        if (currentNcEntity.users.includes(currentUser.id)) {
          status = true;
          options.push('Close NC');
        }
      } else if (
        currentNc.currentlyUnder === 'AUDITOR' &&
        user.kcRoles.roles.includes('AUDITOR')
      ) {
        if (currentNc.auditedEntity === currentUser.entityId) {
          status = true;
          options.push('Close NC');
        }
      } else if (
        currentNc.currentlyUnder === 'MR' &&
        user.kcRoles.roles.includes('MR')
      ) {
        if (currentNc.location === currentUser.locationId) {
          status = true;
          options.push('Close NC');
        }
      } else if (currentNc.currentlyUnder === 'Function Spoc') {
        const entityForNc = await this.prismaService.entity.findFirst({
          where: {
            id: currentNc.auditedEntity,
          },
        });

        const currentFunction = await this.prismaService.functions.findFirst({
          where: { id: entityForNc.functionId },
        });

        if (currentFunction.functionSpoc.includes(currentUser.id)) {
          status = true;
          options.push('Close NC');
        }
      } else {
        if (user.kcRoles.roles.includes(newRoles[auditFindins.closureBy])) {
          status = true;
          options.push('Close NC');
        }
      }

      // if (auditFindins.reject === true || auditFindins.rejected === true) {
      //   status = true;
      //   options.push('Reject NC');
      // }
    } else if (currentNc.status === 'REJECTED') {
      if (currentNc.currentlyUnder === 'DeptHead') {
        const currentNcEntity = await this.prismaService.entity.findFirst({
          where: { id: currentNc.auditedEntity },
        });
        if (currentNcEntity.users.includes(currentUser.id)) {
          status = true;
          options.push('Accept');
          options.push('REJECT');
          options.push('Change Audit Type');
        }
      }

      if (currentNc.currentlyUnder === 'Function Spoc') {
        const currentNcEntity = await this.prismaService.entity.findFirst({
          where: { id: currentNc.auditedEntity },
        });

        const currentFunction = await this.prismaService.functions.findFirst({
          where: { id: currentNcEntity?.functionId },
        });

        if (currentFunction?.functionSpoc?.includes(currentUser.id)) {
          status = true;
          options.push('Accept');
          options.push('REJECT');
          options.push('Change Audit Type');
        }
      } else if (
        currentNc.currentlyUnder === 'AUDITOR' &&
        user.kcRoles.roles.includes('AUDITOR')
      ) {
        if (currentNc.auditedEntity === currentUser.entityId) {
          status = true;
          options.push('Accept');
          options.push('REJECT');
          options.push('Change Audit Type');
        }
      } else if (
        currentNc.currentlyUnder === 'MR' &&
        user.kcRoles.roles.includes('MR')
      ) {
        if (
          currentNc.location === currentUser.locationId ||
          currentUser.additionalUnits.includes(currentNc.location)
        ) {
          status = true;
          options.push('Accept');
          options.push('REJECT');
          options.push('Change Audit Type');
        }
      } else {
        if (user.kcRoles.roles.includes(newRoles[auditFindins.closureBy])) {
          status = true;
          options.push('Accept');
          options.push('REJECT');
          options.push('Change Audit Type');
        }
      }
    } else {
      options = [];
      status = false;
    }

    // const auditFindClosure = auditFindins.closure ==="MCOE"

    return { status, options };
  }

  /**
   * @method obsSubmitHandler
   *  This method handles the corrective action submit for any OBS
   * @param obsId OBS ID
   * @param user current User
   * @param body payload
   * @return updated OBS
   */
  async obsSubmitHandler(obsId: string, user: any, body: any) {
    const { userId, proofDocument, documentName, date, comment, isDraft } =
      body;
    const currentUser = await this.userService.getUserInfo(user.id);
    const obs: any = await this.NcModel.findById(obsId);
    const isAuditee: any = await this.checkIfAuditee(obs.audit, currentUser.id);

    let update;

    // if the current user is aduitee
    if (isAuditee) {
      // if current OBS is under draft
      if (isDraft) {
        update = await this.NcModel.findByIdAndUpdate(
          obsId,
          {
            $set: {
              status: NcStatus.IN_PROGRESS,
              correctiveAction: {
                proofDocument,
                documentName,
                date,
                comment,
                isDraft,
              },
            },
          },
          { new: true },
        );
      }

      //if OBS is not user draft
      else {
        update = await this.NcModel.findByIdAndUpdate(
          obsId,
          {
            $set: {
              status: NcStatus.CLOSED,
              currentlyUnder: '',
              correctiveAction: {
                proofDocument,
                documentName,
                date,
                comment,
                isDraft,
              },
            },
          },
          { new: true },
        );
      }
    }
    return update;
  }

  /**
   * @method getNcUniqueId
   *  This method generates a unique NC ID and returns.
   * @returns Unique NC Id
   */
  async getNcUniqueId() {
    const doc = await this.UniqueIdModel.findOne({ ncId: { $gte: 999 } });

    if (doc !== null) {
      // if doc exists we inc and return the new number
      const update = await this.UniqueIdModel.findByIdAndUpdate(
        doc._id,
        {
          $inc: { ncId: 1 },
        },
        { new: true },
      );
      return update.ncId;
    } else {
      // create doc and continue
      const doc = new this.UniqueIdModel();
      const res = await doc.save();
      return res.ncId;
    }
  }

  /**
   * @method getObsUniqueId
   *  This method generates a unique OBS ID and returns.
   * @returns Unique OBS ID
   */
  async getObsUniqueId() {
    const doc = await this.UniqueIdModel.findOne({ obsId: { $gte: 999 } });

    if (doc !== null) {
      // if doc exists we inc and return the new number
      const update = await this.UniqueIdModel.findByIdAndUpdate(
        doc._id,
        {
          $inc: { obsId: 1 },
        },
        { new: true },
      );
      return update.obsId;
    } else {
      // create doc and continue
      const doc = new this.UniqueIdModel();
      const res = await doc.save();
      return res.obsId;
    }
  }

  async getOfiUniqueId() {
    const doc = await this.UniqueIdModel.findOne({ ofiId: { $gte: 999 } });

    if (doc !== null) {
      // if doc exists we inc and return the new number
      const update = await this.UniqueIdModel.findByIdAndUpdate(
        doc._id,
        {
          $inc: { ofiId: 1 },
        },
        { new: true },
      );
      return update.ofiId;
    } else {
      // create doc and continue
      const doc = new this.UniqueIdModel();
      const res = await doc.save();
      return res.obsId;
    }
  }
  async myAudit(query: any, user: any) {
    try {
      const { skip, limit } = query;
      const response = [];
      const organization = await this.prismaService.user.findFirst({
        where: {
          kcId: user,
        },
      });

      let users: any = await this.prismaService.user.findMany({
        where: {
          AND: [
            { organizationId: organization.organizationId },
            { id: organization.id },
            { deleted: false },
          ],
        },
      });

      // getting all ids

      const userIds = users.map((item) => item.id);
      const audits = await this.auditModel
        .find({
          $and: [
            { organization: organization.organizationId },
            { deleted: false },
          ],
          $or: [
            { auditors: { $elemMatch: { $in: userIds } } },
            { auditees: { $elemMatch: { $in: userIds } } },
          ],
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      for (let i = 0; i < audits.length; i++) {
        const audit: any = audits[i];
        let systemtype: any = this.organizationService.getSystemTypeById(
          audit.auditType,
        );
        let organization: any = this.organizationService.getOrgById(
          audit.organization,
        );
        let system: any = this.SystemModel.find({ _id: audit.system }).select(
          '_id name',
        );
        let location: any = this.locationService.getLocationById(
          audit.location,
        );
        let auditors: any = audit.auditors.map((item) =>
          this.userService.getUserById(item),
        );
        let auditees: any = audit.auditees.map((item) =>
          this.userService.getUserById(item),
        );
        let auditedEntity;
        if (audit.auditedEntity)
          auditedEntity = await this.entityService.getEntityById(
            audit.auditedEntity,
          );
        let rest: any;
        const ncCount = getNcCount(audit.sections);

        [rest, auditors, auditees] = await Promise.all([
          Promise.all([systemtype, organization, location, system]),
          Promise.all(auditors),
          Promise.all(auditees),
        ]);

        response.push({
          ...audit._doc,
          auditType: rest[0],
          organization: rest[1],
          location: rest[2],
          auditors,
          auditees,
          system: rest[3],
          auditedEntity,
          ncCount,
        });
      }

      return { audits: response, count: response.length };
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  //function to genearate oauth token (to provide token for executing an api in cron)
  async generateOAuthToken() {
    const qs = require('qs');
    try {
      const tokenEndpoint =
        'http://localhost:8080/auth/realms/hindalco/protocol/openid-connect/token'; // Replace with your token endpoint URL

      const requestBody = qs.stringify({
        grant_type: 'password',
        client_id: 'admin-cli',
        username: 'hadmin',
        password: 'admin',
      });
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      };

      const response = await axios.post(tokenEndpoint, requestBody, config);

      if (response.status === 200) {
        const token = response.data.access_token;
        return token;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
  async ncAutoAccept() {
    //get all ncs which are open
    const ncs = await this.NcModel.find({
      where: {
        // type: 'NC' || 'OFI',
        status: 'OPEN',
      },
    });

    let currentDate = new Date().getTime();
    for (let nc of ncs) {
      //get the audit type based on the audit id of nc
      const audittype = await this.auditModel
        .findById(nc.audit)
        .select('auditType');
      //get no of days for autoacceptance from audit settings
      const autoacceptdays = await this.auditSettingsModel.findById(
        audittype?.auditType,
      );
      let ncDate = new Date(nc.date).getTime();
      let diff = (currentDate - ncDate) / (1000 * 60 * 60 * 24); //get the timestamp difference and convert into days
      if (diff > autoacceptdays?.AutoAcceptNC) {
        const auditFindingData = await this.AuditFindingsModel.findOne({
          auditTypeId: autoacceptdays._id,
          findingType: nc.type,
        });
        if (auditFindingData.autoAccept === true) {
          let updatestatus = await this.NcModel.findByIdAndUpdate(nc._id, {
            $set: {
              status: 'ACCEPTED',
            },
          });
        }
        //if difference is greater than autoacceotdays in automation settings then update the status to accept
      }
    }
  }
  async sendEscalationMAil() {
    const ncs = await this.NcModel.find({
      where: {
        AND: [
          { OR: [{ type: 'NC' }, { type: 'OFI' }] },
          ,
          { NOT: { status: 'CLOSED' } },
        ],
      },
    });
    for (let nc of ncs) {
      const audittype: any = await this.auditModel.findById(nc.audit);

      const ncclosuredays = await this.auditSettingsModel.findById(
        audittype.auditType,
      );

      const currentDate = new Date().getTime();
      const closureDate = new Date(nc.date).getTime();
      const diff = (currentDate - closureDate) / (1000 * 60 * 60 * 24);
      const organization = await this.prismaService.organization.findUnique({
        where: { id: ncclosuredays?.organizationId },
      });

      const ent = await this.entityService.getEntityById(
        audittype.auditedEntity,
      );
      const depthead = await this.entityService.getEntityHead(ent.id);
      const mcoe = await this.userService.getOrgAdmin(organization.realmName);

      if (diff > ncclosuredays.ClosureRemindertoDeptHead) {
        for (let user of depthead) {
          sendDepartmentHeadEscalationEmail(
            nc._id,
            user.id,
            organization.realmName,

            this.prismaService.user,
            this.emailService.sendEmail,
          );
        }
      }
      if (diff > ncclosuredays.ClosureRemindertoMCOE) {
        sendMCOEEscalationEmail(
          nc._id,
          mcoe[0].id,
          organization.realmName,

          this.prismaService.user,
          this.emailService.sendEmail,
        );
      }
    }
  }
  async sendReminderMail() {
    const ncs = await this.NcModel.find({
      type: { $in: ['NC', 'OFI'] },
      status: { $in: ['OPEN', 'ACCEPTED'] },
    });
  }
  async startCron() {
    const cron = require('node-cron');
    try {
      const app = await this.prismaService.connectedApps.findFirst({
        where: {
          sourceName: {
            contains: 'watcher',
          },
        },
      });
      const response1 = await this.ncAutoAccept();
      const response2 = await this.sendEscalationMAil();

      const response3 = await this.documentService.revisionReminder(
        app.organizationId,
      );
      const response4 = await this.kpiDefinition.monitorKPI();
      // if (
      //   response1 &&
      //   response2&&
      //   response3
      // ) {

      // }
      //});
      //job.start();
    } catch (error) {
      // console.error('Error starting cron jobs:', error);
    }
  }

  async checkIfReportAlreadyCreatedForDepartment(auditScheduleId, entityId) {
    try {
      if (!!auditScheduleId || !!entityId) {
        const findReport = await this.auditModel
          .findOne({
            auditScheduleId: auditScheduleId,
            auditedEntity: entityId,
          })
          .select('_id isDraft');
        if (findReport) {
          return { auditReportId: findReport._id, isDraft: findReport.isDraft };
        } else {
          return false;
        }
      } else {
        throw new BadRequestException('auditScheduleId or entityId is missing');
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async mapserialnumber(
    serialnumber,
    locationId,
    entityId,
    organizationId,
    auditTypeId,
  ) {
    //console.log('va;ues', entityId);

    const currentTime = new Date();
    const year = currentTime.getFullYear();
    const currentYear: any = await this.organizationService.getFiscalYear(
      organizationId,
      year,
    );
    const organization = await this.prismaService.organization.findFirst({
      where: {
        id: organizationId,
      },
      select: {
        fiscalYearFormat: true,
      },
    });
    let showyear;
    if (organization.fiscalYearFormat === 'YY-YY+1') {
      showyear = currentYear;
    } else {
      showyear = currentYear.toString().slice(-2);
    }
    const location = await this.prismaService.location.findFirst({
      where: {
        id: locationId,
      },
      select: {
        locationId: true,
      },
    });
    const entity = await this.prismaService.entity.findFirst({
      where: {
        id: entityId,
      },
      select: {
        entityId: true,
      },
    });
    const month = (currentTime.getMonth() + 1).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
    }); //get current month
    const serialNumber1 = serialnumber
      .replace(/LocationId/g, locationId ? location.locationId : '') // replace all occurrences of 'LocationId'
      .replace(/DepartmentId/g, entityId ? entity.entityId : '') // replace all occurrences of 'DepartmentId'
      .replace(/YY/g, showyear) // replace all occurrences of 'YY' with last two digits of currentyear fron std api
      .replace(/MM/g, month) // replace all occurrences of 'MM'
      .replace(/AuditTypeId/g, auditTypeId);

    return serialNumber1;
  }
  //getMRoflocation

  async getAllMrsOfLocation(id) {
    const orgId = await this.prismaService.location.findFirst({
      where: {
        id: id,
      },
    });
    const roleId = await this.prismaService.role.findFirst({
      where: {
        organizationId: orgId.organizationId,
        roleName: 'MR',
      },
    });
    const mrs = await this.prismaService.user.findMany({
      where: {
        locationId: id,
        deleted: false,
        roleId: { has: roleId.id },
        // assignedRole: {
        //   some: {
        //     role: {
        //       roleName: 'MR',
        //     },
        //   },
        // },
      },
      include: { location: { select: { id: true, locationName: true } } },
    });
    return mrs;
  }

  async getAllNotificationUser(id: any) {
    const entityData: any = await this.prismaService.entity.findFirst({
      where: { id },
    });

    const notificationUserIds =
      entityData?.notification?.map((item: any) => item.id) || [];

    const mrs = await this.prismaService.user.findMany({
      where: {
        id: { in: notificationUserIds },
        // You can add role filters here if needed
      },
      include: {
        location: {
          select: {
            id: true,
            locationName: true,
          },
        },
      },
    });

    return mrs;
  }

  async getAllMrsAndMcoeOfLocation(id) {
    const orgId = await this.prismaService.location.findFirst({
      where: {
        id: id,
      },
    });
    const roleId = await this.prismaService.role.findFirst({
      where: {
        organizationId: orgId.organizationId,
        roleName: { in: ['MR', 'ORG-ADMIN'] },
      },
    });
    const mrs = await this.prismaService.user.findMany({
      where: {
        locationId: { not: null },
        organizationId: orgId.organizationId,
        deleted: false,
        roleId: { has: roleId.id },
        // assignedRole: {
        //   some: {
        //     role: {
        //       roleName: 'MR',
        //     },
        //   },
        // },
      },
      include: { location: { select: { id: true, locationName: true } } },
    });
    return mrs;
  }
  async getDeptHeadForEntity(id) {
    if (id != undefined) {
      const users = await this.prismaService.entity.findFirst({
        where: {
          id: id,
        },
        include: {
          organization: true,
        },
      });
      let usersArray = [];

      for (let user of users?.users) {
        const userDetails = await this.prismaService.user.findUnique({
          where: { id: user },
          include: {
            organization: true,
          },
        });

        usersArray.push(userDetails);
      }
      return usersArray;
    } else {
      return 'entityid not found';
    }
  }
  async getLocationAdmin(id: string) {
    const data = await this.prismaService.location.findMany({
      where: {
        id: id,
      },
      select: { users: true },
    });

    // Extract unique user IDs from data[0].users
    const userIds = [...new Set(data[0].users.map((user: any) => user.id))];

    // Fetch user details based on the unique user IDs
    const users = await this.prismaService.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return { users };
  }
  async formatDateTime(dateString: any) {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  async sendPDFMailAttachment(id) {
    let mailrecipients = [];
    const response: any = await this.auditModel.findById(id);
    const formattedDateTime = (await this.formatDateTime(response?.date)).split(
      'T',
    )[0];
    // console.log("check response in get audit data", response.data.urls);
    let systemtype: any = await this.organizationService.getSystemTypeById(
      response.auditType,
    );
    let organization: any = await this.organizationService.getOrgById(
      response.organization,
    );
    let location: any = await this.locationService.getLocationById(
      response.location,
    );
    const mrs = await this.getAllMrsOfLocation(response.location);
    const deptHead = await this.getDeptHeadForEntity(response.auditedEntity);
    const notification = await this.getAllNotificationUser(
      response?.auditedEntity,
    );
    const unithead = await this.getLocationAdmin(response.location);
    const systems = await this.SystemModel.find({
      _id: { $in: response.system },
    }).exec();

    // Extract names from system objects
    const systemNames = systems.map((system) => system.name);

    let auditors: any = response.auditors.map((item) =>
      this.userService.getUserById(item),
    );
    let auditees: any = response.auditees.map((item) =>
      this.userService.getUserById(item),
    );
    let rest: any;
    const resolvedAuditors = await Promise.all(auditors);
    const resolvedAuditees = await Promise.all(auditees);
    for (let user of resolvedAuditees) {
      mailrecipients.push(user);
    }
    for (let user of resolvedAuditors) {
      mailrecipients.push(user);
    }
    for (let user of mrs) {
      mailrecipients.push(user);
    }

    for (let user of notification) {
      mailrecipients.push(user);
    }
    // for (let user of deptHead) {
    //   mailrecipients.push(user);
    // }
    // for (let user of unithead.users) {
    //   mailrecipients.push(user);
    // }
    // Resolving promises
    [rest, auditors, auditees] = await Promise.all([
      Promise.all([systemtype, organization, location]),
      Promise.all(auditors),
      Promise.all(auditees),
    ]);

    let auditedEntity;
    if (response.auditedEntity)
      auditedEntity = await this.entityService.getEntityById(
        response.auditedEntity,
      );
    const ncCount = getNcCount(response.sections);
    const auditorRating = await this.getAuditorRating(
      response._id,
      auditors[0]?.id,
    );

    let overallRating;
    const overallRatingMap = {};
    if (!overallRatingMap[auditors[0]?.id]) {
      overallRating = await this.getAuditorAvgRating(auditors[0]?.id);
      overallRatingMap[auditors[0]?.id] = overallRating;
    } else {
      overallRating = overallRatingMap[auditors[0]?.id];
    }

    const uniqueFindingsObject: Record<string, any[]> = {};
    let count = 0;

    response?.sections?.forEach((section: any) => {
      section?.sections?.forEach((sections: any) => {
        sections?.fieldset?.forEach((field: any) => {
          const fieldType = field?.nc?.type;
          if (fieldType) {
            if (!uniqueFindingsObject[fieldType]) {
              uniqueFindingsObject[fieldType] = [];
            }
            uniqueFindingsObject[fieldType].push(field.nc);
          }
        });
      });
    });
    const pdfData = {
      auditType: rest[0],
      organization: rest[1],
      system: systemNames,
      auditors: resolvedAuditors,
      location: location.locationName,
      auditNumber: response.auditNumber,
      auditYear: response.auditYear,
      auditName: response.auditName,
      date: formattedDateTime,
      draft: response.isDraft,
      auditedEntity: auditedEntity.entityName,
      auditees: resolvedAuditees,
      findings: uniqueFindingsObject,
      comment: response?.comment || '',
    };
    const tableHtmlFormat = `<table>
    <tr>
      <th>%NUMBER%</th>
      <th colspan="5">%TITLE%</th>
    </tr>
    <tr>
      <th width="4%">Sr.No</th>
      <th width="48%">Findings Details</th>
      <th width="24%">Clause Number</th>
      <th width="24%">Reference</th>
    </tr>
    %CONTENT%
   </table>`;

    const reportHtmlFormatG = `
   <div>
   <style>
     * {
   font-family: "poppinsregular", sans-serif !important;
     }
         table {
             border-collapse: collapse;
             width: 100%;
             margin-bottom: 20px;
         }
     
         td,
         th {
             border: 1px solid black;
             padding: 8px;
             text-align: left;
         }
         
   </style>
 
   <table>
     <tr>
     <td style="width : 100px;">
 </td>
       <td colspan="3" style="text-align : center; margin : auto; font-size : 22px; font-weight : 600; letter-spacing : 0.6px">
         ${organization?.organizationName}<br /> 
         INTERNAL AUDIT REPORT
       
       </td>
     </tr>
     <tr>
       <td colspan="2">
        
         <b> AUDITOR(s): </b> 
          %AUDITORS%
        
       </td>
       <td colspan="2">
     
         <b> AUDITTEE: </b>   %AUDITEE% 
       </td>
     </tr>
     <tr>
       <td colspan="4">
     
         <b> Corp. Function/SBU/ Unit/Department Audited: </b>   %LOCATION/ENTITY% 
       </td>
     </tr>
     <tr>
       <td colspan="3">
      
         <b> Audit Name : </b>  %AUDITNAME%
       </td>
 
       <td colspan="1">
       
         <b> Audit No. : </b>   %AUDITNUMBER% 
       </td>
     </tr>
 
     <tr>
       <td colspan="2">
      
         <b> Audit Date : </b>  %DATE%
       </td>
 
       <td colspan="2">
      
       <b> Status : </b> %STATUS%
       </td>
 
       
     </tr>
   </table>`;

    const endHtmlFormat = `<table>
    <tr>
      <td> <b>Audit Report Comments</b></td>
    </tr>
    <tr>
      <td colspan="4">
        %COMMENT%
      </td>
    </tr>
  </table>
  </div>`;

    let fillTemplate = reportHtmlFormatG
      .replace(
        '%AUDITORS%',
        pdfData?.auditors
          ?.map((item: any) => item.firstname + ' ' + item.lastname)
          .join(', ') ?? '-',
      )
      .replace(
        '%AUDITEE%',
        pdfData?.auditees
          ?.map((item: any) => item.firstname + ' ' + item.lastname)
          .join(', ') ?? '-',
      )
      .replace(
        '%LOCATION/ENTITY%',
        pdfData?.location + ' / ' + pdfData?.auditedEntity,
      )
      .replace('%STATUS%', pdfData?.draft === true ? 'Draft' : 'Published')
      .replace('%AUDITNUMBER%', pdfData?.auditNumber)
      .replace(
        '%DATE%',
        pdfData?.date.split('-')[2] +
          '-' +
          pdfData?.date.split('-')[1] +
          '-' +
          pdfData?.date.split('-')[0],
      )
      .replace('%AUDITNAME%', pdfData?.auditName);

    Object.entries(pdfData.findings).forEach(([type, fields]) => {
      fillTemplate =
        fillTemplate +
        tableHtmlFormat
          .replace('%NUMBER%', (++count).toString())
          .replace('%TITLE%', type)
          .replace(
            '%CONTENT%',
            fields && fields.length
              ? fields
                  .map((nc: any, index: any) => {
                    const ncRef = nc.reference
                      ?.map((ref: any) => this.nameConstruct(ref))
                      .join(', ');
                    const ncHtml = `
                      <tr key={index}>
                        <td>${index + 1})</td>
                        <td>${nc.comment ? nc.comment : 'N/A'}</td>
                        <td>${nc?.clause ? nc?.clause?.clauseName : ''}</td>
                        <td>${ncRef ? ncRef : ''}</td>
                      </tr>
                      <tr key={index}>
                        <th colspan="1"></th>
                        <th colspan="3" style="text-align: left;">
                          Evidence
                        </th>
                      </tr>
                      `;
                    let imageHtml = '';
                    const evidenceHtml = nc.evidence
                      ?.map((item: any) => {
                        let attFileName: any[] = [];
                        if (item.attachment && item.attachment.length > 0) {
                          if (
                            process.env.REACT_APP_IS_OBJECT_STORAGE === 'true'
                          ) {
                            imageHtml = item.attachment
                              ?.map((attachment: any) => {
                                attFileName.push(attachment.name);
                                if (
                                  attachment.obsUrl
                                    .toLowerCase()
                                    .endsWith('.png') ||
                                  attachment.obsUrl
                                    .toLowerCase()
                                    .endsWith('.jpg') ||
                                  attachment.obsUrl
                                    .toLowerCase()
                                    .endsWith('.jpeg')
                                ) {
                                  return `<img src="${attachment.obsUrl}" alt="Description of the image" width="356" height="200" style="margin-right: 40px; margin-bottom: 5px;">`;
                                }
                              })
                              .join('');
                          } else {
                            imageHtml = item.attachment
                              ?.map((attachment: any) => {
                                attFileName.push(attachment.name);
                                if (
                                  attachment.url
                                    .toLowerCase()
                                    .endsWith('.png') ||
                                  attachment.url
                                    .toLowerCase()
                                    .endsWith('.jpg') ||
                                  attachment.url.toLowerCase().endsWith('.jpeg')
                                ) {
                                  return `<img src="${attachment.url}" alt="Description of the image" width="356" height="200" style="margin-right: 40px;">`;
                                }
                              })
                              .join('');
                          }
                          return `
                          <tr key={index}>
                            <td colspan="1"></td>
                            <td colspan="3" style="text-align: left;">
                              ${item.text}<br><br>
                              <strong>Attached Files:</strong> ${attFileName.join(
                                ',  ',
                              )}<br>
                              ${imageHtml}
                            </td>
                          </tr>
                        `;
                        } else {
                          return `
                          <tr key={index}>
                            <td colspan="1"></td>
                            <td colspan="3" style="text-align: left;">
                              ${item.text}
                            </td>
                          </tr>
                        `;
                        }
                      })
                      .join('');
                    return ncHtml + (evidenceHtml ? evidenceHtml : '');
                  })
                  .join('')
              : `
                    <tr style="background-color: #ffa07a; text-align: center;" >
                      <td colspan="4" style="margin: auto;"> No Data Found  </td>
                    </tr>
                    `,
          );
    });

    fillTemplate =
      fillTemplate +
      endHtmlFormat.replace('%COMMENT%', pdfData?.comment ?? '-');

    const options = {
      format: 'A4', // Standard size for PDFs
      orientation: 'portrait', // Can be 'portrait' or 'landscape'
      border: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    };

    const fs = require('fs');
    const pdf = require('html-pdf');
    fs.writeFileSync('temp.pdf', fillTemplate);
    // console.log('mailrecipeints before', mailrecipients);

    let uniqueMailRecipients = mailrecipients.reduce((acc, current) => {
      // Check if the current email already exists in acc
      if (!acc.some((item) => item.email === current.email)) {
        // If not, add it to the accumulator array
        acc.push(current);
      }
      return acc;
    }, []);

    pdf.create(fillTemplate, options).toFile('temp.pdf', function (err, res) {
      if (err) {
        return;
      }

      // console.log('PDF file written successfully');

      // Read PDF file and attach it to the email
      const pdfContent = fs.readFileSync('temp.pdf');

      const msg = {
        to: uniqueMailRecipients,
        from: process.env.FROM,
        subject: 'Audit Report has been generated',
        text: `Audit report ${response.auditName} has been created. Please find the PDF report attached.`,

        attachments: [
          {
            content: pdfContent.toString('base64'), // Convert PDF content to base64
            filename: 'report.pdf',
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        try {
          let subject = 'Audit Report has been generated';
          let textmsg = `Audit report ${response.auditName} has been created. Please find the PDF report attached.`;
          const result = this.emailService.sendBulkEmails(
            uniqueMailRecipients,
            subject,
            textmsg,
            [
              {
                content: pdfContent.toString('base64'), // Convert PDF content to base64
                filename: 'report.pdf',
                type: 'application/pdf',
                disposition: 'attachment',
              },
            ],
          );
        } catch (err) {}
      }
      // Send email thru sendgrid
      uniqueMailRecipients = uniqueMailRecipients.map((value) => value?.email);

      const primaryRecipient = uniqueMailRecipients[0]; // First email in the 'To' field
      const ccRecipients = uniqueMailRecipients.slice(1); // Rest in the 'CC' field
      // for (let user of uniqueMailRecipients) {
      // console.log("primaryRecipient",primaryRecipient,ccRecipients)
      const msg1 = {
        to: primaryRecipient,
        from: process.env.FROM,
        cc: ccRecipients,
        subject: 'Audit Report has been generated',
        text: `Audit report ${response?.auditName} has been created. Please find the PDF report attached.`,

        attachments: [
          {
            content: pdfContent.toString('base64'), // Convert PDF content to base64
            filename: 'report.pdf',
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      };
      sgMail
        .send(msg1)
        .then(() => {})
        .catch((error) => {
          return new InternalServerErrorException(error);
        });
      // }
    });

    fs.unlinkSync('temp.pdf');
  }

  async chartData(data, user) {
    // try {
    let {
      businessType,
      business,
      selectedFunction,
      unit,
      department,
      auditType,
      dateRange,
      clickedAudit,
      clickedFinding,
      clickedCoverage,
      clickedFindingType,
      clickedClause,
      clickedSystem,
      auditSkip,
      auditLimit,
    } = data;

    const activeUser = await this.prismaService.user.findFirst({
      where: { kcId: user.id },
    });
    department = department?.filter(
      (item) => item !== undefined && item !== 'undefined',
    );
    let whereCondition: any = {
      organization: activeUser.organizationId,
      deletedAt: false,
    };
    // if (
    //   dateRange !== undefined &&
    //   dateRange[0] !== undefined &&
    //   dateRange[1] !== undefined &&
    //   dateRange[0] !== 'undefined' &&
    //   dateRange[1] !== 'undefined' &&
    //   dateRange !== 'undefined' &&
    //   dateRange?.length > 0 &&
    //   dateRange !== null
    // ) {
    //   let startDate = await new Date(dateRange[0]);
    //   let endDate = await new Date(dateRange[1]);
    //   whereCondition = {
    //     ...whereCondition,
    //     createdAt: { $gte: startDate, $lte: endDate },
    //   };
    // } else {
    //   const date = await this.yearFormater(new Date().getFullYear());
    //   whereCondition = {
    //     ...whereCondition,
    //     createdAt: { $gte: date[0], $lte: date[1] },
    //   };
    // }
    if (
      businessType !== undefined &&
      businessType !== 'undefined' &&
      businessType.length > 0
    ) {
      const locationData = await this.prismaService.location.findMany({
        where: { businessTypeId: { in: businessType } },
      });
      const locationId = locationData?.map((value) => value?.id);
      whereCondition = { ...whereCondition, location: { $in: locationId } };
    }

    if (
      business !== undefined &&
      business !== 'undefined' &&
      business.length > 0
    ) {
      const locationData = await this.prismaService.location.findMany({
        where: { business: { some: { businessId: { in: business } } } },
      });
      const locationId = locationData?.map((value) => value?.id);
      whereCondition = { ...whereCondition, location: { $in: locationId } };
    }

    if (
      selectedFunction !== undefined &&
      selectedFunction !== 'undefined' &&
      selectedFunction.length > 0
    ) {
      const locationData = await this.prismaService.location.findMany({
        where: { functionId: { hasSome: selectedFunction } },
      });
      const locationId = locationData?.map((value) => value?.id);
      whereCondition = { ...whereCondition, location: { $in: locationId } };
    }

    if (
      auditType !== undefined &&
      auditType !== 'undefined' &&
      auditType?.length > 0
    ) {
      if (!auditType.includes('All')) {
        whereCondition = {
          ...whereCondition,
          auditType: { $in: auditType },
        };
      }
    }

    if (unit !== undefined && unit !== 'undefined' && unit?.length > 0) {
      if (!unit.includes('All')) {
        whereCondition = {
          ...whereCondition,
          location: { $in: unit },
        };
      }
    }

    if (
      department !== undefined &&
      department !== 'undefined' &&
      department?.length > 0
    ) {
      if (!department.includes('All')) {
        whereCondition = {
          ...whereCondition,
          auditedEntity: { $in: department },
        };
      }
    }
    const auditReportData = await this.auditModel.find(whereCondition);
    if (clickedSystem !== undefined && clickedSystem !== 'undefined') {
      whereCondition = { ...whereCondition, system: { $in: [clickedSystem] } };
    }

    // if (clickedClause !== undefined && clickedClause !== 'undefined') {
    //   const combinedData = ['All', clickedClause];
    //   whereCondition = {
    //     ...whereCondition,
    //     'auditedClauses.id': { $in: combinedData },
    //   };
    // }

    const [
      system,
      auditConducted,
      findingsConducted,
      auditorData,
      tableData,
      // ncTableData,
      findingData,
      auditCoverage,
      ageAnalysis,
    ]: any = await Promise.all([
      this.systemCalculate(auditReportData),
      this.auditConducted(auditReportData),
      this.findingsConducted(auditReportData),
      this.auditorData(auditReportData, activeUser),
      this.tableData(whereCondition, data),
      // this.ncTableData(whereCondition, data, user),
      this.findingData(auditReportData),
      this.auditCoverage(auditReportData),
      this.ageAnalysis(auditReportData, activeUser.organizationId),
    ]);
    return {
      system,
      auditConducted,
      findingsConducted,
      auditorData,
      findingData,
      auditCoverage,
      ageAnalysis,
      tableData,
      // ncTableData,
    };
    // } catch (err) {}
  }

  async tableData(whereCondition: any, query) {
    // try {\
    let { auditSkip, auditLimit } = query;

    auditSkip = (auditSkip - 1) * auditLimit;
    const audits = await this.auditModel
      .find(whereCondition)
      .skip(auditSkip)
      .limit(auditLimit);

    const count = await this.auditModel.countDocuments(whereCondition);
    let response = [];
    for (let audit of audits as any) {
      let ncs: any = this.NcModel.find({ audit: audit?._id });

      let location: any = this.locationService.getLocationById(audit.location);
      let auditors: any = audit?.auditors?.map((item) =>
        this.userService.getUserById(item),
      );
      let auditees: any = audit?.auditees?.map((item) =>
        this.userService.getUserById(item),
      );
      // let system: any = this.systemService.findById(audit.system);
      let system: any = this.SystemModel.find({ _id: audit.system }).select(
        '_id name',
      );

      let rest: any;

      // Resolving promises
      [rest, ncs, auditors, auditees] = await Promise.all([
        Promise.all([location, system]),
        ncs,
        Promise.all(auditors),
        Promise.all(auditees),
      ]);

      let auditedEntity;
      if (audit.auditedEntity)
        auditedEntity = await this.entityService.getEntityById(
          audit.auditedEntity,
        );

      const ncCount = getNcCount(audit.sections);

      let overallRating;
      // if (!overallRatingMap[auditors[0]?.id]) {
      //   console.log("auditors[0]?",auditors)
      //   overallRating = await this.getAuditorAvgRating(auditors[0]?.id);
      //   overallRatingMap[auditors[0]?.id] = overallRating;
      // } else {
      //   overallRating = overallRatingMap[auditors[0]?.id];
      // }
      response.push({
        id: audit._id,
        auditName: audit.auditName,
        auditNumber: audit.auditNumber,
        location: rest[0],
        listOfFindings: ncs,
        system: rest[1],
        auditedEntity,
        ncCount: ncCount,
        auditors,
        auditees,
        // overallRating: overallRating[0]?.rating||[],
      });
    }

    return { response, count };
    // } catch (err) {}
  }
  async tableNcData(query, user) {
    try {
      const tabledata = await this.NcModel.find({
        _id: { $in: query.id },
      }).populate({
        path: 'audit',
        model: this.auditModel,
      });
      return tabledata;
    } catch (err) {}
  }
  async ncTableData(whereCondition: any, query, kcId) {
    // try {
    // delete whereCondition.auditType;
    const user = await this.userService.getUserInfo(kcId.id);
    let { clickedFindingType, clickedClause, clickedSystem, skip, limit } =
      query;

    skip = (skip - 1) * limit;

    if (
      clickedFindingType !== undefined &&
      clickedFindingType !== 'undefined' &&
      clickedFindingType !== ''
    ) {
      whereCondition = { ...whereCondition, type: clickedFindingType };
    }
    if (
      clickedClause !== undefined &&
      clickedClause !== 'undefined' &&
      clickedClause !== ''
    ) {
      whereCondition = {
        ...whereCondition,
        'clause.id': { $in: [clickedClause] },
      };
    }

    if (
      clickedSystem !== undefined &&
      clickedSystem !== 'undefined' &&
      clickedSystem !== ''
    ) {
      whereCondition = {
        ...whereCondition,
        system: { $in: [clickedSystem] },
      };
    }
    let response = [];
    const ncs = await this.NcModel.find(whereCondition)
      .skip(skip) // Add skip value here
      .limit(limit) // Add limit value here

      .populate({
        path: 'audit',
        model: this.auditModel,
      });
    const count = await this.NcModel.countDocuments(whereCondition);

    const ncDataType = ncs.map((value: any) => value?.type);

    for (let i = 0; i < ncs.length; i++) {
      let nc: any = ncs[i];
      const auditFindings = await this.AuditFindingsModel.findOne({
        findingType: ncs[i].type,
        auditTypeId: nc.audit.auditType,
      });

      // nc.audit = nc.audit[0];
      const isAccessible =
        nc?.audit?.auditors?.includes(user.id) ||
        nc?.audit?.auditees?.includes(user.id);
      let auditedEntity: any = this.entityService.getEntityById(
        nc?.auditedEntity,
      );
      // let system: any = this.systemService.findById(nc.audit?.system);
      let system: any = nc.system.map((item) =>
        this.systemService.findById(item),
      );
      let location: any = this.locationService.getLocationById(nc.location);
      let auditors: any = nc.auditors.map((item) =>
        this.userService.getUserById(item),
      );

      let auditees: any = nc.auditees.map((item) =>
        this.userService.getUserById(item),
      );

      let rest: any;

      [rest, auditors, auditees, system] = await Promise.all([
        Promise.all([auditedEntity, location]),
        Promise.all(auditors),
        Promise.all(auditees),
        Promise.all(system),
      ]);

      const access = await this.accessRigts(nc.audit, nc, kcId);
      nc.system = system;

      nc.auditors = auditors;

      nc.auditees = auditees;

      nc.auditedEntity = rest[0];

      nc.location = rest[1];

      nc.isAccessible = isAccessible;

      nc.auditFindings = auditFindings;

      nc.access = access;

      response.push(nc);
    }
    return { response, count };
    // } catch (err) {}
  }
  async findingData(data) {
    // try {
    // delete condition.auditType;
    let condition = data.map((value) => value._id);
    const ncData = await this.NcModel.find({ audit: { $in: condition } });
    const result = ncData.reduce((acc, currentItem) => {
      const auditedEntity = currentItem?.auditedEntity?.toString(); // Convert to string if it's not already a string
      const type = currentItem.type;

      if (!acc[auditedEntity]) {
        acc[auditedEntity] = { auditedEntity: auditedEntity, data: [] };
      }

      const entityData = acc[auditedEntity]?.data;
      const existingTypeIndex = entityData.findIndex(
        (item) => item?.type === type,
      );

      if (existingTypeIndex === -1) {
        entityData.push({
          type: type,
          count: 1,
          open: {
            count: currentItem.status === 'OPEN' ? 1 : 0,
            ids: currentItem.status === 'OPEN' ? [currentItem._id] : [],
          },
          verfied: {
            count: currentItem.status === 'VERIFIED' ? 1 : 0,
            ids: currentItem.status === 'VERIFIED' ? [currentItem._id] : [],
          },
          closed: {
            count: currentItem.status === 'CLOSED' ? 1 : 0,
            ids: currentItem.status === 'CLOSED' ? [currentItem._id] : [],
          },
          accepted: {
            count: currentItem.status === 'ACCEPTED' ? 1 : 0,
            ids: currentItem.status === 'ACCEPTED' ? [currentItem._id] : [],
          },
          auditorReview: {
            count: currentItem.status === 'AUDITORREVIEW' ? 1 : 0,
            ids:
              currentItem.status === 'AUDITORREVIEW' ? [currentItem._id] : [],
          },
          removed: {
            count: currentItem.status === 'REMOVED' ? 1 : 0,
            ids: currentItem.status === 'REMOVED' ? [currentItem._id] : [],
          },
          rejected: {
            count: currentItem.status === 'REJECTED' ? 1 : 0,
            ids: currentItem.status === 'REJECTED' ? [currentItem._id] : [],
          },
        });
      } else {
        entityData[existingTypeIndex].count++;
        entityData[existingTypeIndex].open =
          currentItem.status === 'OPEN'
            ? {
                count: entityData[existingTypeIndex].open.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].open.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].open.count,
                ids: [...entityData[existingTypeIndex].open.ids],
              };
        entityData[existingTypeIndex].verfied =
          currentItem.status === 'VERIFIED'
            ? {
                count: entityData[existingTypeIndex].verfied.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].verfied.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].verfied.count,
                ids: [...entityData[existingTypeIndex].verfied.ids],
              };
        entityData[existingTypeIndex].closed =
          currentItem.status === 'CLOSED'
            ? {
                count: entityData[existingTypeIndex].closed.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].closed.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].closed.count,
                ids: [...entityData[existingTypeIndex].closed.ids],
              };
        entityData[existingTypeIndex].accepted =
          currentItem.status === 'ACCEPTED'
            ? {
                count: entityData[existingTypeIndex].accepted.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].accepted.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].accepted.count,
                ids: [...entityData[existingTypeIndex].accepted.ids],
              };
        entityData[existingTypeIndex].auditorReview =
          currentItem.status === 'AUDITORREVIEW'
            ? {
                count: entityData[existingTypeIndex].auditorReview.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].auditorReview.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].auditorReview.count,
                ids: [...entityData[existingTypeIndex].auditorReview.ids],
              };
        entityData[existingTypeIndex].removed =
          currentItem.status === 'REMOVED'
            ? {
                count: entityData[existingTypeIndex].removed.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].removed.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].removed.count,
                ids: [...entityData[existingTypeIndex].removed.ids],
              };
        entityData[existingTypeIndex].rejected =
          currentItem.status === 'REJECTED'
            ? {
                count: entityData[existingTypeIndex].rejected.count + 1,
                ids: [
                  ...entityData[existingTypeIndex].rejected.ids,
                  currentItem._id,
                ],
              }
            : {
                count: entityData[existingTypeIndex].rejected.count,
                ids: [...entityData[existingTypeIndex].rejected.ids],
              };
      }

      return acc;
    }, {});

    let finalResult = Object.values(result);
    const entityData = await this.prismaService.entity.findMany({
      where: {
        id: {
          in: finalResult
            .map((value: any) => value?.auditedEntity)
            .filter((value) => value !== undefined),
        },
      },
      select: { id: true, entityName: true, location: true },
    });
    finalResult = finalResult.map((value: any) => {
      const foundObject = entityData.find((item) => {
        return item.id === value.auditedEntity;
      });
      return {
        id: value?.id,
        name: foundObject?.entityName,
        ...value,
        locationId: foundObject?.location?.id,
        locationName: foundObject?.location?.locationName,
      };
    });
    return finalResult;
    // } catch (err) {}
  }
  async auditorData(data, activeUser) {
    // try {
    const auditorId = await this.prismaService.role.findFirst({
      where: {
        roleName: 'AUDITOR',
        organizationId: activeUser?.organizationId,
      },
    });

    const auditors = await this.prismaService.user.count({
      where: { roleId: { has: auditorId?.id } },
    });
    const existAuditors = data.flatMap((value) => value.auditors);
    const uniqueAuditors = [...new Set(existAuditors)];
    return {
      auditors,
      uniqueAuditors,
      auditorUsed: uniqueAuditors?.length,
      utilization: (uniqueAuditors?.length / auditors) * 100,
    };
    // } catch (err) {}
  }

  async yearFormater(currentYear) {
    try {
      const startDate = new Date(Date.UTC(currentYear, 0, 1));
      const endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      return [startDate, endDate];
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async systemCalculate(data) {
    const systemData = data.flatMap((value) => value?.system);
    // console.log("systemData",systemData,data)
    const repeatedValuesCount = systemData?.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {});
    const result = Object.entries(repeatedValuesCount).map(([id, count]) => ({
      id,
      count,
    }));
    const systemQueryData = await this.SystemModel.find({
      _id: { $in: systemData },
    }).select('_id name');

    const finalResult = result.map((value) => {
      const foundObject = systemQueryData.find((item) => {
        return item?._id?.toString() === value.id;
      });
      return { id: value.id, name: foundObject?.name, count: value?.count };
    });
    return finalResult;
  }

  async auditConducted(data) {
    let auditReport = 0;
    let auditSchedule = 0;
    let auditPlan = 0;
    for (let value of data) {
      auditReport++;
      if (value?.auditScheduleId !== 'No Schedule') {
        auditSchedule++;
        const auditScheduleData = await this.auditSchModel?.findById(
          value?.auditScheduleId,
        );
        if (auditScheduleData?.auditPlanId !== 'No plan') {
          auditPlan++;
        }
      }
    }
    const adHoc = auditReport - auditSchedule;
    return { auditReport, auditSchedule, auditPlan, adHoc };
  }

  async findingsConducted(data) {
    const finalData = [];
    const ncBigData = [];
    let totalCount = 0;
    for (let value of data) {
      const ncData = await this.NcModel.find({ audit: value?._id });
      totalCount += ncData?.length;
      ncBigData.push(...ncData);
      const ncFinData = await this.ncDataHandler(ncData);

      finalData.push({
        _id: value._id,
        name: value.auditName,
        ...ncFinData,
        totalFindings: ncData?.length || 0,
      });
    }
    const clauseData = await this.clauseData(ncBigData);

    const countOpen = finalData?.reduce((a, b) => {
      return a + b.open;
    }, 0);
    // const verfied = finalData?.reduce(
    //   (value) => value?.verified && value?.verified,
    // );
    const verfied = finalData?.reduce((a, b) => {
      return a + b.verified;
    }, 0);

    const closed = finalData?.reduce((a, b) => {
      return a + b.closed;
    }, 0);

    const accepted = finalData?.reduce((a, b) => {
      return a + b.accepted;
    }, 0);

    const auditorReview = finalData?.reduce((a, b) => {
      return a + b.auditorReview;
    }, 0);

    const removed = finalData?.reduce((a, b) => {
      return a + b.removed;
    }, 0);
    const rejected = finalData?.reduce((a, b) => {
      return a + b.rejected;
    }, 0);

    const count = {
      open: countOpen,
      verfied: verfied?.length || 0,
      clause: clauseData?.length || 0,
      totalfindings: totalCount || 0,
      closed,
      accepted,
      auditorReview,
      removed,
      rejected,
    };

    return { finalData, clauseData, count };
  }

  async clauseData(data) {
    const clauseFirstData = data.flatMap((value) =>
      value?.clause?.map((item) => {
        return {
          id: item.id,
          name: item.clauseName,
          type: value.type,
          auditId: value.audit,
        };
      }),
    );

    const finalData = clauseFirstData.reduce((acc, data) => {
      acc[data.id] = (acc[data.id] || 0) + 1;
      return acc;
    }, {});
    const result = Object.entries(finalData).map(([id, count]) => ({
      id,
      count,
    }));
    const resultIds = result
      ?.map((value) => value?.id) // Map the ids
      ?.filter((id) => id !== 'undefined');
    const clauseQueryData = await this.clauseModel
      .find({
        _id: { $in: resultIds },
      })
      .select('_id name');

    const finalResult = result.map((value) => {
      const foundObject = clauseQueryData.find((item) => {
        return item._id.toString() === value.id;
      });
      return {
        id: value.id,
        name: foundObject?.name || '',
        count: value?.count || 0,
      };
    });
    return finalResult;
  }

  async auditCoverage(data) {
    let auditedDocuments = 0;
    let system = 0;
    let documentData = [];
    let systemData = [];

    data.map((value) => {
      if (value?.auditedDocuments?.length > 0) {
        auditedDocuments += value?.auditedDocuments?.length;
      }
      if (value?.system?.length > 0) {
        system += value?.system?.length;
      }
      documentData.push(...value.auditedDocuments);
      systemData.push(...value.system);
    });
    const mostUsedDocuments = documentData.reduce((acc, data) => {
      acc[data] = (acc[data] || 0) + 1;
      return acc;
    }, {});

    const mostUsedSystems = systemData.reduce((acc, data) => {
      acc[data] = (acc[data] || 0) + 1;
      return acc;
    }, {});
    const usedDocuments = Object.entries(mostUsedDocuments).map(
      ([id, count]) => ({
        id,
        count,
      }),
    );
    const ids = usedDocuments.map((value) => value.id);
    const documentDataIds = await this.prismaService.documents.findMany({
      where: { id: { in: ids } },
      select: { id: true, documentName: true },
    });
    const finalResult = usedDocuments.map((value) => {
      const foundObject = documentDataIds.find((item) => {
        return item.id.toString() === value.id;
      });
      return {
        id: value.id,
        name: foundObject?.documentName || '',
        count: value.count,
      };
    });

    const usedSystems = Object.entries(mostUsedSystems).map(([id, count]) => ({
      id,
      count,
    }));
    return {
      auditedDocuments,
      system,
      usedDocuments: finalResult,
      usedSystems,
    };
  }
  async ncDataHandler(data) {
    let open = 0;
    let verified = 0;
    let closed = 0;
    let accepted = 0;
    let auditorReview = 0;
    let removed = 0;
    let rejected = 0;
    for (let value of data) {
      if (value.status === 'OPEN') {
        open++;
      } else if (value.status === 'VERIFIED') {
        verified++;
      } else if (value.status === 'ACCEPTED') {
        accepted++;
      } else if (value.status === 'CLOSED') {
        closed++;
      } else if (value.status === 'AUDITORREVIEW') {
        auditorReview++;
      } else if (value.status === 'REMOVED') {
        removed++;
      } else if (value.status === 'REJECTED') {
        rejected++;
      }
    }
    return {
      open,
      verified,
      closed,
      accepted,
      auditorReview,
      removed,
      rejected,
    };
  }

  async ageAnalysis(data, organizationId) {
    const response = {
      labels: [],
      datasets: [
        {
          label: 'Open',
          data: [],
        },
        {
          label: 'Closed',
          data: [],
        },
      ],
    };
    response.labels = ['<15', '<30', '<60', '>60'];
    let ids = [];
    const offset = [15, 30, 60];

    ids = data?.map((item) => item?._id);

    for (let i = 0; i < response?.labels?.length; i++) {
      const label = response?.labels[i];
      const numArr = label?.split('');
      const num = parseInt(numArr[1] + numArr[2]) - 1;
      let totalOpenCount = [];
      let totalClosedCount = [];
      const findings = await this.NcModel.find({
        organization: organizationId,
      }).distinct('type');
      if (i === 0) {
        for (let value of findings) {
          let openCount = await this.NcModel.countDocuments({
            audit: { $in: ids },
            type: value,
            $or: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
            date: {
              // $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000))),
              $gte: new Date(
                new Date().setHours(0, 0, 0) - 15 * 24 * 60 * 60 * 1000,
              ),
            },
          });

          let closedCount = await this.NcModel.countDocuments({
            audit: { $in: ids },
            type: value,
            status: 'CLOSED',
            date: {
              // $gte: new Date((new Date().getTime() - (15 * 24 * 60 * 60 * 1000))),
              $gte: new Date(
                new Date().setHours(0, 0, 0) - 15 * 24 * 60 * 60 * 1000,
              ),
            },
          });
          totalOpenCount.push(openCount);
          totalClosedCount.push(closedCount);
        }

        response?.datasets[0]?.data?.push(totalOpenCount);
        response?.datasets[1]?.data?.push(totalClosedCount);
      } else if (i === response?.labels?.length - 1) {
        for (let value of findings) {
          let openCount = await this.NcModel.countDocuments({
            audit: { $in: ids },
            type: value,
            $or: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
            date: {
              $lte: new Date(
                new Date().setHours(23, 59, 999) - 60 * 24 * 60 * 60 * 1000,
              ),
            },
          });

          let closedCount = await this.NcModel.countDocuments({
            audit: { $in: ids },
            type: value,
            status: 'CLOSED',
            date: {
              $lte: new Date(
                new Date().setHours(23, 59, 999) - 60 * 24 * 60 * 60 * 1000,
              ),
            },
          });
          totalOpenCount?.push(openCount);
          totalClosedCount?.push(closedCount);
        }

        response?.datasets[0]?.data.push(totalOpenCount);
        response?.datasets[1]?.data.push(totalClosedCount);
      } else {
        for (let value of findings) {
          let openCount = await this.NcModel.countDocuments({
            audit: { $in: ids },
            $or: [{ status: 'OPEN' }, { status: 'IN_PROGRESS' }],
            type: value,
            date: {
              $gte: new Date(
                new Date().setHours(0, 0, 0) - num * 24 * 60 * 60 * 1000,
              ),
              $lte: new Date(
                new Date().setHours(23, 59, 999) -
                  offset[i - 1] * 24 * 60 * 60 * 1000,
              ),
            },
          });

          let closedCount = await this.NcModel.countDocuments({
            audit: { $in: ids },
            type: value,
            status: 'CLOSED',
            date: {
              $gte: new Date(
                new Date().setHours(0, 0, 0) - num * 24 * 60 * 60 * 1000,
              ),
              $lte: new Date(
                new Date().setHours(23, 59, 999) -
                  offset[i - 1] * 24 * 60 * 60 * 1000,
              ),
            },
          });
          totalOpenCount.push(openCount);
          totalClosedCount.push(closedCount);
        }

        response.datasets[0].data.push(totalOpenCount);
        response.datasets[1].data.push(totalClosedCount);
      }
    }

    response.labels = response.labels.reverse();
    response.datasets[0].data = response.datasets[0].data.reverse();
    response.datasets[1].data = response.datasets[1].data.reverse();
    return response;
  }
  async getAllAuditType(user) {
    try {
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: user.id },
      });
      const auditType = await this.auditSettingsModel
        .find({ organizationId: activeUser.organizationId })
        .select('_id auditType');
      return auditType;
    } catch (err) {}
  }

  async getAllLocationForSeletedFunction(user, data) {
    try {
      const { functionData, business, businessType } = data;
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: user.id },
      });
      let whereCondition: any = { organizationId: activeUser.organizationId };
      if (
        functionData !== undefined &&
        functionData !== 'undefined' &&
        functionData?.length > 0
      ) {
        if (!functionData.includes('All')) {
          whereCondition = {
            ...whereCondition,
            functionId: { hasSome: functionData },
          };
        }
      }

      if (
        business !== undefined &&
        business !== 'undefined' &&
        business?.length > 0
      ) {
        if (!business.includes('All')) {
          whereCondition = {
            ...whereCondition,
            business: { some: { businessId: { in: business } } },
          };
        }
      }

      if (
        businessType !== undefined &&
        businessType !== 'undefined' &&
        businessType?.length > 0
      ) {
        if (!businessType.includes('All')) {
          whereCondition = {
            ...whereCondition,
            businessTypeId: { in: businessType },
          };
        }
      }

      let locationData = await this.prismaService.location.findMany({
        where: { ...whereCondition, deleted: false },
        select: { id: true, locationName: true },
      });

      // locationData = [...locationData, { id: 'All', locationName: 'All' }];
      locationData.sort((a, b) => {
        const nameA = a.locationName.toLowerCase();
        const nameB = b.locationName.toLowerCase();

        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      return locationData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAllEntityForLocation(user, data) {
    try {
      const { location } = data;
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: user.id },
      });

      if (
        location !== undefined &&
        location !== 'undefined' &&
        location?.length > 0
      ) {
        let whereCondition = {};
        if (location.includes('All')) {
          whereCondition = {
            ...whereCondition,
            organizationId: activeUser.organizationId,
          };
        } else {
          whereCondition = {
            ...whereCondition,
            organizationId: activeUser.organizationId,
            locationId: { in: location },
          };
        }
        let entityData = await this.prismaService.entity.findMany({
          where: { ...whereCondition, deleted: false },
          select: { id: true, entityName: true },
        });

        // entityData = [...entityData, { id: 'All', entityName: 'All' }];
        entityData.sort((a, b) => {
          const nameA = a.entityName.toLowerCase();
          const nameB = b.entityName.toLowerCase();

          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });
        return entityData;
      }
      return [];
    } catch (err) {}
  }

  async getAllFunction(user) {
    try {
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: user.id },
      });
      const functions = await this.prismaService.functions.findMany({
        where: { organizationId: activeUser.organizationId },
        select: { id: true, name: true },
      });
      return functions;
    } catch (err) {}
  }

  async getAllBusinessType(user) {
    try {
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: user.id },
      });

      const businessType = await this.prismaService.businessType.findMany({
        where: { organizationId: activeUser.organizationId },
        select: { id: true, name: true },
      });
      return businessType;
    } catch (err) {}
  }

  async getAllBusiness(user) {
    try {
      const activeUser = await this.prismaService.user.findFirst({
        where: { kcId: user.id },
      });

      const business = await this.prismaService.business.findMany({
        where: { organizationId: activeUser.organizationId },
        select: { id: true, name: true },
      });
      return business;
    } catch (err) {}
  }

  async getAccessTokenMsCal(code) {
    const getMsCalContents = await this.prismaService.connectedApps.findFirst({
      where: {
        sourceName: 'MsCalendar',
      },
    });

    const tokenEndpoint = `https://login.microsoftonline.com/common/oauth2/v2.0/token`;
    const clientId = getMsCalContents.clientId;
    const clientSecret = Buffer.from(
      getMsCalContents.clientSecret,
      'base64',
    ).toString('ascii');
    const scope = 'Calendars.ReadWrite offline_access User.Read';

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `client_id=${encodeURIComponent(
        clientId,
      )}&scope=${encodeURIComponent(scope)}&client_secret=${encodeURIComponent(
        clientSecret,
      )}&code=${code}
      &grant_type=authorization_code
      &redirect_uri=${process.env.SERVER_IP}/api/audits/MsCalToken`,
    });

    const data = await response.json();
    return data.access_token;
  }

  async createCalendarEvent(urlData: any) {
    const { code, state, error } = urlData;
    const accessToken = await this.getAccessTokenMsCal(code);
    const eventData = {
      subject: 'TESTING CALENDAR API',
      start: {
        dateTime: '2024-05-10T10:00:00',
        timeZone: 'UTC',
      },
      end: {
        dateTime: '2024-05-10T11:00:00',
        timeZone: 'UTC',
      },
      attendees: [
        {
          emailAddress: {
            address: 'admin@processridge.onmicrosoft.com',
            name: 'Aravind',
          },
          type: 'required',
        },
      ],
    };

    const apiUrl = `https://graph.microsoft.com/v1.0/me/calendar/events`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    return data;
  }

  async getNcDataByAuditId(user, data) {
    // try {
    const { id, auditTypeId } = data;
    const activeUser = await this.prismaService.user.findFirst({
      where: { kcId: user.id },
    });
    const auditTypeData = await this.auditSettingsModel.findById(auditTypeId);
    if (auditTypeData?.resolutionWorkFlow === 'CAPA') {
      const caras: any = await this.caraModel.find({
        organizationId: activeUser.organizationId,
        auditId: id,
      });

      let finalresult = [];
      for (let cara of caras) {
        const entity = await this.prismaService.entity.findFirst({
          where: {
            id: cara.entityId,
          },
          select: {
            id: true,
            entityId: true,
            entityName: true,
            users: true,
          },
        });
        const user: any = await this.prismaService.user.findFirst({
          where: {
            id: cara.registeredBy,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatar: true,
            email: true,
          },
        });
        const cordinator: any = await this.prismaService.user.findFirst({
          where: {
            id: cara.caraCoordinator,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            avatar: true,
            email: true,
          },
        });

        const location = await this.prismaService.location.findFirst({
          where: {
            id: cara.locationId,
          },
          select: {
            id: true,
            locationId: true,
            locationName: true,
          },
        });
        const systemIds = cara.systemId;

        // Fetching multiple systems based on the array of system IDs and selecting only _id and name
        const systems = await this.SystemModel.find(
          { _id: { $in: systemIds } },
          { _id: 1, name: 1 }, // Projection: Include only _id and name fields
        );
        const depthead = await this.getDeptHeadForEntity(cara.entityId);
        const origin: any = await this.caraSettingModel.findById(cara?.origin);
        const data1 = {
          _id: cara._id,
          organizationId: cara.organizationId,
          title: cara.title,
          kpiId: cara.kpiId,
          registeredBy: user,
          caraCoordinator: cordinator,
          highPriority: cara?.highPriority,
          typeData: cara.title.split('-')[0],
          // deviationFromDate: cara?.deviationFromDate,
          createdAt: cara.createdAt?.$date
            ? new Date(cara.createdAt.$date) // Convert to a Date object
            : cara.createdAt,
          date: cara?.date,
          kpiReportLink: cara?.kpiReportLink,
          locationId: cara?.locationId,
          locationDetails: location,
          entityId: entity,
          systemId: systems,
          status: cara.status,
          description: cara?.description,
          origin: origin,
          // createdAt: cara.createdAt?.$date ? new Date(cara.createdAt.$date) : undefined,
          // startDate: cara?.date?.startDate,
          // endDate: cara?.date?.endDate,
          rootCauseAnalysis: cara?.rootCauseAnalysis,
          actualCorrectiveAction: cara?.actualCorrectiveAction,
          containmentAction: cara?.containmentAction,
          // actionPointOwner: cara?.actionPointOwner,
          correctiveAction: cara?.correctiveAction,
          // deviationType: cara?.deviationType,
          targetDate: cara?.targetDate,
          correctedDate: cara?.correctedDate,
          deptHead: depthead,
          files: cara?.files,
          attachments: cara?.attachments,
          registerfiles: cara?.registerfiles,
          type: cara?.type,
          serialNumber: cara?.serialNumber,
          comments: cara?.comments ? cara.comments : '',
          why1: cara?.why1,
          why2: cara?.why2,
          why3: cara?.why3,
          why4: cara?.why4,
          why5: cara?.why5,
          man: cara?.man,
          material: cara?.material,
          measurement: cara?.measurement,
          method: cara?.method,
          environment: cara?.environment,
          machine: cara?.machine,
        };
        finalresult.push(data1);
      }
      return { nc: finalresult, count: finalresult?.length, type: 'cara' };
    } else {
      // console.log("id",id)
      let ncs: any = await this.NcModel.find({
        organization: activeUser.organizationId,
        audit: new ObjectId(id),
      }).populate('audit audit.system');

      // console.log("ncs",ncs.length,activeUser.organizationId)
      let response = [];
      for (let i = 0; i < ncs.length; i++) {
        const auditFindings = await this.AuditFindingsModel.findOne({
          findingType: ncs[i]?.type,
          auditTypeId: ncs[i]?.audit[0]?.auditType,
        });
        let nc: any = ncs[i];
        const isAccessible =
          nc?.auditors?.includes(user.id) || nc?.auditees?.includes(user.id);
        let auditedEntity: any = this.entityService.getEntityById(
          nc?.auditedEntity,
        );
        // let system: any = this.systemService.findById(nc.audit?.system);
        let system: any = nc?.system?.map((item) =>
          this.systemService.findById(item),
        );
        let location: any = this.locationService.getLocationById(nc?.location);

        let auditors: any = nc?.auditors?.map((item: any) =>
          this.userService.getUserById(item),
        );

        let auditees: any = nc?.auditees?.map((item) =>
          this.userService.getUserById(item),
        );

        let rest: any;

        [rest, auditors, auditees, system] = await Promise.all([
          Promise.all([auditedEntity, location]),
          Promise.all(auditors),
          Promise.all(auditees),
          Promise.all(system),
        ]);
        // const access = await this.accessRigts(nc?.audit, nc, user);
        // console.log('access', access);
        nc.system = system;

        nc.auditors = auditors || [];

        nc.auditees = auditees || [];

        nc.auditedEntityNew = rest[0];

        nc.location = rest[1];

        nc.isAccessible = isAccessible;

        nc.auditFindings = auditFindings;

        nc.access = false;

        response.push({
          auditors,
          auditees,
          id: nc.id,
          _id: nc._id,
          location: rest[1],
          auditFindings,
          isAccessible,
          system,
          status: nc.status,
          audit: nc.audit,
          type: nc.type,
          auditedEntityNew: rest[0],
          currentlyUnder: nc.currentlyUnder,
        });
      }
      // console.log('response', response);
      return { nc: response, count: response.length, type: 'nc' };
    }

    // } catch (err) {}
  }

  nameConstruct(data: any) {
    if (data?.hasOwnProperty('documentNumbering')) {
      return data?.documentNumbering;
    } else if (data?.hasOwnProperty('type')) {
      return data?.name;
    } else if (data?.jobTitle) {
      return data?.jobTitle;
    }
  }

  async getAllNcStatusByAuditId(user, id) {
    const activeUser = await this.prismaService.user.findFirst({
      where: { kcId: user.id },
    });

    let ncs: any = await this.NcModel.find({
      organization: activeUser.organizationId,
      audit: new ObjectId(id),
    }).select('sectionFindingId status');
    return ncs;
  }
}
