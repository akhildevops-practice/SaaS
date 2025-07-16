import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AuditSchedule } from './schema/auditSchedule.schema';
import { AuditScheduleEntityWise } from './schema/auditScheduleEntityWise.schema';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { AuditTemplate } from 'src/audit-template/schema/audit-template.schema';
import { filterGenerator } from 'src/audit/helpers/mongoFilter.helper';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'bson';
import { AuditSettings } from 'src/audit-settings/schema/audit-settings.schema';
import { AuditPlan } from 'src/audit-plan/schema/auditPlan.schema';
import { Logger } from 'winston';
import { AuditorProfile } from 'src/audit-settings/schema/audit-auditorprofile.schema';
import utc from 'dayjs/plugin/utc'; // Import the utc plugin
import timezone from 'dayjs/plugin/timezone'; // Import timezone plugin (if you're using it)
import {
  dateCheckInAuditSchedule,
  filterAuditorBasedOnDepartment,
  filterAuditorBasedOnFilterByLocationFunction,
  filterAuditorBasedOnFilterBySystem,
  filterBasedDept,
  filterBasedOnDept,
  filterBasedScopeUnit,
  filterByAuditReport,
  getAllAuditorsBasedFilters,
  getAllAuditorsBasedLocationFilters,
  validateAuditorBasedOnAuditorProfile,
} from './utils';
import { Audit } from 'src/audit/schema/audit.schema';

import {
  sendMailToHeadOnAuditSchedule,
  sendMailForChangeAuditDate,
  sendMailForDeleteAuditSchedule,
} from 'src/audit-plan/helper/email.helper';
import { EmailService } from 'src/email/email.service';
import { AuditPlanEntityWise } from 'src/audit-plan/schema/auditplanentitywise.schema';
import * as sgMail from '@sendgrid/mail';
import { AuditScheduleTeamLead } from './schema/auditScheduleTeamLead.schema';
import { Hira } from 'src/risk-register/hiraRegisterSchema/hira.schema';
import { cara } from 'src/cara/schema/cara.schema';
import { Clauses } from 'src/systems/schema/clauses.schema';
import { parse } from 'path';
import dayjs from 'dayjs';
import { isErrored } from 'form-data';
import { find } from 'rxjs';
import {
  Nonconformance,
  NonconformanceDocument,
} from 'src/audit/schema/nonconformance.schema';
import { entity } from 'src/organization/dto/business-config.dto';

sgMail.setApiKey(process.env.SMTP_PASSWORD);
@Injectable()
export class AuditScheduleService {
  constructor(
    @InjectModel(AuditSchedule.name)
    private auditScheduleModel: Model<AuditSchedule>,
    @InjectModel(AuditScheduleEntityWise.name)
    private auditScheduleEntityModel: Model<AuditScheduleEntityWise>,
    @InjectModel(System.name) private System: Model<SystemDocument>,
    @InjectModel(AuditPlanEntityWise.name)
    private auditPlanEntityWise: Model<AuditPlanEntityWise>,
    @InjectModel(AuditTemplate.name)
    private auditTemplate: Model<AuditTemplate>,
    private prisma: PrismaService,
    @InjectModel(AuditSettings.name)
    private auditSettingsModel: Model<AuditSettings>,
    @InjectModel(AuditorProfile.name)
    private auditorProfileModel: Model<AuditorProfile>,

    @InjectModel(Nonconformance.name)
    private readonly ncModel: Model<NonconformanceDocument>,
    @InjectModel(AuditPlan.name)
    private auditPlan: Model<AuditPlan>,
    @InjectModel(Audit.name)
    private auditModel: Model<Audit>,
    @InjectModel(AuditScheduleTeamLead.name)
    private auditScheduleTeamLead: Model<AuditScheduleTeamLead>,
    private readonly emailService: EmailService,
    @InjectModel(Hira.name) private hiraModel: Model<Hira>,
    @InjectModel(cara.name) private caraModel: Model<cara>,
    @InjectModel(Clauses.name)
    private readonly clauseModel: Model<Clauses>,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  // async createAuditSchedule(data, userId) {
  //   const {
  //     auditScheduleName,
  //     auditPeriod,
  //     period,
  //     auditYear,
  //     status,
  //     createdBy,
  //     updatedBy,
  //     auditTemplateId,
  //     roleId,
  //     entityTypeId,
  //     auditPlanId,
  //     locationId,
  //     systemTypeId,
  //     auditScheduleEntityWise,
  //     systemMasterId,
  //     auditScheduleNumber,
  //     auditType,
  //     planType,
  //     auditNumber,
  //     prefixSuffix,
  //     auditScheduleId,
  //   } = data;

  //   const userActive = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: userId,
  //     },
  //   });

  //   try {
  //     let result;
  //     if (!auditScheduleId) {
  //       result = await this.auditScheduleModel.create({
  //         auditScheduleName,
  //         auditPeriod,
  //         period,
  //         auditYear,
  //         status,
  //         createdBy: userActive.username,
  //         organizationId: userActive.organizationId,
  //         roleId,
  //         entityTypeId,
  //         auditPlanId,
  //         locationId,
  //         systemTypeId,
  //         auditTemplateId,
  //         auditNumber,
  //         systemMasterId,
  //         auditType,
  //         planType,
  //         auditScheduleNumber,
  //         prefixSuffix,
  //       });
  //       await auditScheduleEntityWise.map(async (value) => {
  //         await this.auditScheduleEntityModel.create({
  //           entityId: value.entityId,
  //           time: value.time,
  //           auditor: value.auditor,
  //           auditee: value.auditee,
  //           comments: value.comments,
  //           auditScheduleId: result._id,
  //           areas: value.areas,
  //           auditTemplateId: value.auditTemplate,
  //         });
  //       });
  //       if (result) {
  //         return result;
  //       } else {
  //         return 'not able add auditschedule';
  //       }
  //     } else {
  //       const result = await auditScheduleEntityWise.map(async (value) => {
  //         await this.auditScheduleEntityModel.create({
  //           entityId: value.entityId,
  //           time: value.time,
  //           auditor: value.auditor,
  //           auditee: value.auditee,
  //           comments: value.comments,
  //           auditScheduleId: new ObjectId(auditScheduleId),
  //           areas: value.areas,
  //           auditTemplateId: value.auditTemplate,
  //         });
  //       });
  //       if (result) {
  //         return {
  //           message: 'success',
  //           _id: auditScheduleId,
  //         };
  //       } else {
  //         return 'not able add auditschedule';
  //       }
  //     }
  //   } catch (error) {
  //     return { 'error message': error };
  //   }
  // }
  async createAuditSchedule(data, userId) {
    const {
      auditScheduleName,
      auditPeriod,
      period,
      auditYear,
      status,
      createdBy,
      updatedBy,
      auditTemplateId,
      roleId,
      entityTypeId,
      auditPlanId,
      locationId,
      systemTypeId,
      auditScheduleEntityWise,
      useFunctionsForPlanning,
      systemMasterId,
      auditScheduleNumber,
      auditType,
      planType,
      auditNumber,
      prefixSuffix,
      auditScheduleId,
      selectedFunction,
      isDraft,
      auditTemplates,
      sop_refs,
      hira_refs,
      capa_refs,
      auditScope,
      clause_refs,
    } = data;

    let userActive;
    if (!!userId) {
      userActive = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
    } else {
      userActive = await this.prisma.user.findFirst({
        where: {
          id: data?.userId,
        },
      });
    }
    // console.log('active user in createAuditSchedule', userActive);
    try {
      let result, insertAuditScheduleEntityWiseData;

      //below if condition added  to handle create schedule from calendar while dragging entity one by one
      if (!auditScheduleId) {
        result = await this.auditScheduleModel.create({
          auditScheduleName,
          auditPeriod,
          period,
          auditYear,
          status,
          createdBy: userActive.username,
          organizationId: userActive.organizationId,
          roleId,
          entityTypeId,
          auditPlanId,
          locationId,
          systemTypeId,
          useFunctionsForPlanning,
          // auditTemplateId,
          auditNumber,
          systemMasterId,
          auditType,
          planType,
          auditScheduleNumber,
          prefixSuffix,
          isDraft: isDraft,
          auditTemplates,
          selectedFunction,
          sop_refs,
          hira_refs,
          capa_refs,
          auditScope,
          clause_refs,
        });
      } else {
        result = { _id: new ObjectId(auditScheduleId) };
      }

      if (result && auditScheduleEntityWise.length > 0) {
        const auditScheduleEntities = auditScheduleEntityWise.map((value) => ({
          entityId: value.entityId,
          time: value.time,
          auditor: value.auditor,
          auditee: value.auditee,
          comments: value.comments,
          auditScheduleId: result._id,
          areas: value.areas || '',
          createdBy: result.createdBy,
          // auditTemplateId: value.auditTemplate,
          auditTemplates: value.auditTemplates,
          endTime: value?.endTime,
          duration: value?.duration,
        }));

        insertAuditScheduleEntityWiseData =
          await this.auditScheduleEntityModel.insertMany(auditScheduleEntities);
      }
      try {
        // console.log('userId in createAuditSchedule', userId);

        const mail = await this.sendMailForHead(
          userId,
          result._id,
          data?.userId,
        );
      } catch (error) {
        return new NotFoundException();
      }
      return result && insertAuditScheduleEntityWiseData
        ? { message: 'success', _id: result._id }
        : 'Unable to Create Audit Schedule';
    } catch (error) {
      return { 'error message': error.message };
    }
  }

  async getAllAuditors(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId },
      });
      const auditorId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'AUDITOR',
        },
      });
      const allAuditors = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser.organizationId,
          roleId: { has: auditorId.id },
          // assignedRole: { some: { roleId: auditorId.id } },
        },
      });
      return allAuditors;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAuditorForLocation(location, role, userId, data) {
    //////console.log("data",data)
    const userActive = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      let roleId;
      if (role === 'Auditor') {
        roleId = 'AUDITOR';
      } else if (role === 'MCOE') {
        roleId = 'ORG-ADMIN';
      } else if (role === 'IMS Coordinator') {
        roleId = 'MR';
      }
      const roleInfo: any = await this.prisma.role.findFirst({
        where: {
          organizationId: userActive.organizationId,
          roleName: roleId,
        },
      });
      const result = await this.prisma.user.findMany({
        where: {
          locationId: location,
          roleId: { has: roleInfo.id },
          // assignedRole: {
          //   some: {
          //     roleId: roleInfo.id,
          //   },
          // },
        },
      });
      const data = [];
      result.map((value) => {
        data.push(value);
      });

      return data;
    } catch (error) {
      return error;
    }
  }

  /* 
    Update for AuditSchedule and AuditScheduleEntityWise
    */

  async getEntityHeadForDepartment(entity, userId) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    }); // const roleId = await this.prisma.role.findFirst({ //   where: { //     roleName: 'ENTITY-HEAD', //     organizationId: orgId.organizationId, //   }, // }); // const result = await this.prisma.user.findMany({ //   where: { //     entity: { //       id: entity, //     }, //     assignedRole: { //       some: { //         roleId: roleId.id, //       }, //     }, //   }, // });
    const entityHeads = await this.prisma.entity.findFirst({
      where: {
        id: entity,
      },
    });
    const result = await this.prisma.user.findMany({
      where: {
        id: {
          in: entityHeads.users,
        },
      },
    });
    const entityHead = [];

    const addentityHead = await result.map(async (value) => {
      entityHead.push(value);
    });
    const user = await this.prisma.user.findMany({
      where: {
        entity: {
          id: entity,
        },
      },
    });
    const users = [];
    const result1 = await user.map((value) => {
      users.push(value);
    });

    const finalData = [{ entityHead: entityHead, users: users }];
    return finalData;
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

  async getAll(userId, location, year, auditType, data) {
    // try {
    const { page, limit, search, system } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    // if (location?.length === 0) {
    //   return { data: [], count: 0 };
    // }
    // const locations = location?.map((value) => value?.id);
    let getAllauditSche;
    let count;

    let whereMainCondition = {};
    if (system !== undefined && system !== 'undefined' && system?.length > 0) {
      whereMainCondition = {
        ...whereMainCondition,
        systemMasterId: { $in: system },
      };
    }
    if (location === 'All') {
      if (auditType === 'All') {
        whereMainCondition = {
          ...whereMainCondition,
          organizationId: activeUser.organizationId,
          auditYear: year,
          //auditType: auditType,
        };
      } else {
        whereMainCondition = {
          ...whereMainCondition,
          organizationId: activeUser.organizationId,
          auditYear: year,
          auditType: auditType,
        };
      }
    } else {
      if (auditType === 'All') {
        whereMainCondition = {
          ...whereMainCondition,
          organizationId: activeUser.organizationId,
          auditYear: year,
          locationId: location,
          //auditType: auditType,
        };
      } else {
        whereMainCondition = {
          ...whereMainCondition,
          organizationId: activeUser.organizationId,
          auditYear: year,
          auditType: auditType,
          locationId: location,
        };
      }
    }
    if (search !== undefined && search !== 'undefined') {
      whereMainCondition = {
        ...whereMainCondition,
        auditScheduleName: { $regex: search, $options: 'i' },
      };
    }

    getAllauditSche = await this.auditScheduleModel
      .find(whereMainCondition)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });
    count = await this.auditScheduleModel.countDocuments(whereMainCondition);
    const resultFinal = [];
    for (let value of getAllauditSche) {
      const reportCheck = await this.checkIfReportAlreadyCreatedForDepartment(
        value._id,
        value.auditedEntity,
      );
      let auditStatus;
      if (reportCheck) {
        auditStatus = reportCheck.isDraft ? 'Draft' : 'Completed';
      } else {
        auditStatus = 'Not Created';
      }

      const query = await this.auditScheduleEntityModel.find({
        auditScheduleId: value._id,
      });
      const systemMaster = await this.System.find({
        _id: { $in: value.systemMasterId },
      });
      const systemType = await this.prisma.systemType.findFirst({
        where: {
          // id:value.systemTypeId
          id: String(value.systemTypeId),
        },
        select: {
          name: true,
        },
      });

      const locationName = await this.prisma.location.findFirst({
        where: {
          id: String(value.locationId),
        },
        select: {
          locationName: true,
        },
      });
      let entityFirstName;
      if (value.entityTypeId === 'Unit') {
        entityFirstName = { id: 'Unit', name: 'Unit' };
      } else if (value.entityTypeId === 'corpFunction') {
        entityFirstName = { id: 'corpFunction', name: 'Corporate Function' };
      } else {
        entityFirstName = await this.prisma.entityType.findFirst({
          where: {
            id: String(value.entityTypeId),
          },
          select: {
            name: true,
          },
        });
      }

      const roleName = await this.prisma.role.findFirst({
        where: {
          id: String(value.roleId),
        },
        select: {
          roleName: true,
        },
      });

      const auditType = await this.auditSettingsModel.findById(value.auditType);

      const data = {
        id: value._id,
        auditScheduleName: value.auditScheduleName,
        auditPeriod: value.auditPeriod,
        auditYear: value.auditYear,
        auditNumber: value.auditNumber,
        auditScheduleNumber: value.auditScheduleNumber,
        status: value.status,
        createdAt: value.createdAt,
        updatedAt: value.updatedAt,
        organizationId: value.organizationId,
        prefixSuffix: value.prefixSuffix,
        roleId: value.roleId,
        roleName: value.roleId,
        entityTypeId: value.entityTypeId,
        entityTypeName: entityFirstName.name,
        auditPlanId: value.auditPlanId,
        location: value.locationId,
        locationName: locationName?.locationName,
        auditTypeName: auditType?.auditType,
        planType: auditType?.planType,
        // systemTypeId: value.systemTypeId,
        // systemType: systemType.name,
        isDraft: value?.isDraft,
        auditTemplate: value.auditTemplateId,
        systemMasterId: value.systemMasterId,
        // systemMaster: systemMaster.name,
        systemMaster: systemMaster,
        auditScheduleEntityWise: query,
        auditStatus: auditStatus,
        // isDraft : value?.isDraft,
      };
      // return data;
      resultFinal.push(data);
    }
    return { data: resultFinal, count };
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
  }

  async getAllNew(userId, location, year, auditType, data) {
    const { page, limit, search, system } = data;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    // if (!location.length) {
    //   return { data: [], count: 0 };
    // }

    // const locations = location.map((value) => value.id);

    // Construct main query conditions
    let whereMainCondition: any = {
      organizationId: activeUser.organizationId,
      auditYear: year,
      ...(location !== 'All' && { locationId: location }),
      ...(auditType !== 'All' && { auditType: auditType }),
    };

    if (system !== undefined && system?.length > 0) {
      whereMainCondition = {
        ...whereMainCondition,
        systemMasterId: { $in: system },
      };
    }
    if (search) {
      whereMainCondition.auditScheduleName = { $regex: search, $options: 'i' };
    }
    const getAllauditSche = await this.auditScheduleModel
      .find(whereMainCondition)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const count = await this.auditScheduleModel.countDocuments(
      whereMainCondition,
    );

    // Gather IDs for bulk retrieval
    let systemMasterIds: any = getAllauditSche
      .map((audit) => audit.systemMasterId)
      .flat();
    let entityTypeIds: any = getAllauditSche
      .map((audit) => audit?.entityTypeId)
      ?.filter((item) => !!item);
    let roleIds: any = getAllauditSche
      .map((audit) => audit?.roleId)
      ?.filter((item) => !!item);
    let auditTypeIds: any = getAllauditSche
      .map((audit) => audit?.auditType)
      ?.filter((item) => !!item);

    // Fetch related data in bulk
    const [systemMasters, entityTypes, roles, auditTypes] = await Promise.all([
      this.System.find({ _id: { $in: systemMasterIds } }),
      this.prisma.entityType.findMany({ where: { id: { in: entityTypeIds } } }),
      this.prisma.role.findMany({ where: { id: { in: roleIds } } }),
      this.auditSettingsModel.find({ _id: { $in: auditTypeIds } }),
    ]);

    // Maps for quick lookup
    const systemMasterMap = new Map(
      systemMasters.map((system) => [system._id.toString(), system]),
    );
    const entityTypeMap = new Map(
      entityTypes.map((type) => [type.id, type.name]),
    );
    const roleMap = new Map(roles.map((role) => [role.id, role.roleName]));
    const auditTypeMap = new Map(
      auditTypes.map((type) => [type._id.toString(), type]),
    );
    const resultFinal = getAllauditSche.map((audit: any) => ({
      id: audit._id,
      auditScheduleName: audit.auditScheduleName,
      auditPeriod: audit.auditPeriod,
      auditYear: audit.auditYear,
      auditNumber: audit.auditNumber,
      auditScheduleNumber: audit.auditScheduleNumber,
      status: audit.status,
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt,
      organizationId: audit.organizationId,
      prefixSuffix: audit.prefixSuffix,
      roleId: audit.roleId,
      // roleName : audit.roleId,
      roleName: roleMap.get(audit.roleId),
      entityTypeId: audit.entityTypeId,
      entityTypeName: entityTypeMap.get(audit.entityTypeId),
      auditPlanId: audit.auditPlanId,
      location: audit.locationId,
      locationName: audit.locationId, // This needs proper mapping if location names are stored elsewhere
      auditTypeName: auditTypeMap.get(audit.auditType)?.auditType,
      planType: auditTypeMap.get(audit.auditType)?.planType,
      isDraft: audit.isDraft,
      auditTemplate: audit.auditTemplateId,
      systemMasterId: audit.systemMasterId,
      systemMaster: systemMasters?.filter((system) =>
        audit.systemMasterId.includes(system._id.toString()),
      ),
      // Additional properties can be mapped here
    }));

    return { data: resultFinal, count };
  }

  async getAuditScheduleByIdOld(id, orgName) {
    // const activeUser = await this.prisma.user.findFirst({
    //   where: { kcId: userId },
    // });
    // const organization = await this.prisma.organization.findFirst({
    //   where: { id: activeUser.organizationId },
    // });

    const auditScheduleResult: any = await this.auditScheduleModel.findById({
      _id: id,
    });
    let auditPlanData;
    if (auditScheduleResult.auditPlanId !== 'No plan') {
      auditPlanData = await this.auditSettingsModel.findById(
        auditScheduleResult.auditType,
      );
    }

    let entityType;

    if (auditScheduleResult.entityTypeId === 'Unit') {
      entityType = { id: 'Unit', name: 'Unit' };
    } else if (auditScheduleResult.entityTypeId === 'corpFunction') {
      entityType = { id: 'corpFunction', name: 'Corporate Function' };
    } else {
      entityType = await this.prisma.entityType.findFirst({
        where: { id: auditScheduleResult.entityTypeId },
      });
    }

    const location = await this.prisma.location.findFirst({
      where: { id: auditScheduleResult.locationId },
    });

    let auditPlanInfo;
    if (auditScheduleResult.auditPlanId !== 'No plan') {
      auditPlanInfo = await this.auditPlan.findById(
        auditScheduleResult.auditPlanId,
      );
    }

    //////////////console.log('auditPlanInfo', auditPlanInfo);
    const systemMaster = await this.System.find({
      _id: { $in: auditScheduleResult.systemMasterId },
    });

    const auditScheduleEntityWise = await this.auditScheduleEntityModel.find({
      auditScheduleId: new ObjectId(id),
    });

    const auditSchent = [];
    for (let x of auditScheduleEntityWise) {
      const entityNew = await this.prisma.entity.findFirst({
        where: {
          id: x.entityId,
        },
      });

      const auditTemplateData = [];
      for (let value of x?.auditTemplates) {
        const auditTemplateResult = await this.auditTemplate.findById(value);

        const data = {
          _id: value || '',
          title: auditTemplateResult.title || '',
        };
        auditTemplateData.push(data);
      }

      const finalValue = {
        id: x._id,
        entityId: x.entityId,
        entityName: entityNew.entityName,
        time: x.time,
        auditor: x.auditor,
        auditee: x.auditee,
        comments: x.comments,
        auditTemplateId: x.auditTemplateId,
        auditScheduleId: x.auditScheduleId,
        areas: x.areas,
        deleted: x.deleted,
        auditTemplates: auditTemplateData,
      };
      auditSchent.push(finalValue);
    }
    const role = await this.prisma.role.findFirst({
      where: {
        id: auditScheduleResult.roleId,
      },
    });
    let auditTemplate;
    if (auditScheduleResult?.auditTemplateId) {
      auditTemplate = await this.auditTemplate.findById({
        _id: auditScheduleResult?.auditTemplateId,
      });
    }

    let sop_refs = [],
      hira_refs = [],
      capa_refs = [],
      clause_refs = [];
    if (
      Array.isArray(auditScheduleResult?.sop_refs) &&
      auditScheduleResult?.sop_refs.length > 0
    ) {
      const onlySopRefIds = auditScheduleResult?.sop_refs
        .map((item: any) => item.reference_ids)
        .flat();
      sop_refs = await this.prisma.documents.findMany({
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
    if (
      Array.isArray(auditScheduleResult?.hira_refs) &&
      auditScheduleResult?.hira_refs.length > 0
    ) {
      const onlyHiraRefIds = auditScheduleResult?.hira_refs
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
    if (
      Array.isArray(auditScheduleResult?.capa_refs) &&
      auditScheduleResult?.capa_refs.length > 0
    ) {
      const onlyCapaRefIds = auditScheduleResult?.capa_refs
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
    if (
      Array.isArray(auditScheduleResult?.clause_refs) &&
      auditScheduleResult?.clause_refs.length > 0
    ) {
      const onlyClauseRefIds = auditScheduleResult?.capa_refs
        .map((item: any) => item.reference_ids)
        .flat();
      clause_refs = await this.clauseModel
        .find({
          _id: { $in: onlyClauseRefIds },
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

    const finalResult = {
      id: id,
      auditPeriod: auditScheduleResult.auditPeriod,
      period: auditScheduleResult.period,
      auditScheduleNumber: auditScheduleResult.auditScheduleNumber,
      auditScheduleName: auditScheduleResult.auditScheduleName,
      auditYear: auditScheduleResult.auditYear,
      status: auditScheduleResult.status,
      createdAt: auditScheduleResult.createdAt,
      createdBy: auditScheduleResult.createdBy,
      auditNumber: auditScheduleResult.auditNumber,
      roleName: auditScheduleResult.roleId,
      roleId: auditScheduleResult.roleId,
      prefixSuffix: auditScheduleResult.prefixSuffix,
      organization: orgName,
      entityTypeId: entityType.id,
      entityType: entityType.name,
      auditPlanId:
        auditScheduleResult.auditPlanId === 'No plan'
          ? 'No plan'
          : auditScheduleResult.auditPlanId,
      auditName:
        auditScheduleResult.auditPlanId === 'No plan'
          ? 'No plan'
          : auditPlanInfo.auditName,
      locationId: location.id,
      location: location.locationName,
      auditTemplateId: auditTemplate?._id || null,
      auditTemplate: auditTemplate?.title || null,
      // systemType: systemType.name,
      auditType: auditScheduleResult.auditType,
      planType:
        auditScheduleResult.auditPlanId === 'No plan'
          ? 'No Plan'
          : auditPlanData.planType,
      // systemTypeId: systemType.id,
      systemMaster: systemMaster,
      // systemMasterId: systemMaster._id,
      auditTemplates: auditScheduleResult.auditTemplates,
      auditScheduleEntityWise: auditSchent,
      clause_refs: clause_refs || [],
      sop_refs: sop_refs,
      hira_refs: hira_refs,
      capa_refs: capa_refs,
      auditScope: auditScheduleResult?.auditScope,
    };
    ////////////////console.log('finalResult', finalResult);
    return finalResult;
  }

  async getAuditScheduleById(id, orgName) {
    // try {
    const [auditScheduleResult] = (await Promise.all([
      this.auditScheduleModel.findById({ _id: id }),
    ])) as any;

    let [auditPlanData, entityType, location, auditPlanInfo, systemMaster] =
      await Promise.all([
        auditScheduleResult.auditPlanId !== 'No plan'
          ? this.auditSettingsModel.findById(auditScheduleResult.auditType)
          : null,
        // corpFunction
        auditScheduleResult.entityTypeId === 'Unit'
          ? { id: 'Unit', name: 'Unit' }
          : auditScheduleResult.entityTypeId === 'corpFunction'
          ? { id: 'corpFunction', name: 'Corporate Function' }
          : this.prisma.entityType.findFirst({
              where: { id: auditScheduleResult.entityTypeId },
            }),
        this.prisma.location.findFirst({
          where: { id: auditScheduleResult.locationId },
        }),
        auditScheduleResult.auditPlanId !== 'No plan'
          ? this.auditPlan.findById(auditScheduleResult.auditPlanId)
          : null,
        this.System.find({
          _id: { $in: auditScheduleResult.systemMasterId },
        }),
      ]);

    const auditScheduleEntityWise = await this.auditScheduleEntityModel.find({
      auditScheduleId: new ObjectId(id),
    });

    // Collect all unique auditor and auditee IDs
    const userIds = auditScheduleEntityWise.reduce((acc, entity) => {
      const ids = [...entity.auditor, ...entity.auditee].filter(
        (id) => id != null && !acc.includes(id),
      );
      return [...acc, ...ids];
    }, []);

    // Fetch user details in a single query
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        deleted: false,
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        avatar: true,
        email: true,
        kcId: true,
      },
    });

    // //console.log('auditScheduleEntityWise', auditScheduleEntityWise.length);

    const entityIds = auditScheduleEntityWise.map((x) => x.entityId);
    //Fetch Data in Bulk
    const [entities] = await Promise.all([
      this.prisma.entity.findMany({
        where: { id: { in: entityIds } },
      }),
    ]);

    // Generic helper function to find items by their IDs
    const findByIds = (ids, collection) => {
      // Ensure ids is always an array
      const idsArray = Array.isArray(ids) ? ids : [ids];

      return idsArray
        .map((id) =>
          collection.find((item) => item.id === id || item._id === id),
        )
        .filter((item) => item != null);
    };
    const auditScheduleEntityDetails = auditScheduleEntityWise.map((x) => {
      const entityNew = findByIds(x.entityId, entities)[0];
      const auditors = findByIds(x.auditor, users);
      const auditees = findByIds(x.auditee, users);
      return {
        id: x._id,
        entityId: x.entityId,
        entityName: entityNew.entityName || '',
        time: x.time,
        auditor: auditors,
        auditee: auditees,
        comments: x.comments,
        auditTemplateId: x.auditTemplateId,
        auditScheduleId: x.auditScheduleId,
        areas: x.areas,
        deleted: x.deleted,
        auditTemplates: x.auditTemplates || [],
      };
    });

    // //console.log('auditScheduleEntityDetails', auditScheduleEntityDetails);

    let auditTemplate, auditTypeData;
    if (auditScheduleResult?.auditTemplateId) {
      auditTemplate = await this.auditTemplate.findById({
        _id: auditScheduleResult?.auditTemplateId,
      });
    }

    auditTypeData = await this.auditSettingsModel.findById(
      auditScheduleResult?.auditType,
    );

    let sop_refs = [],
      hira_refs = [],
      capa_refs = [],
      clause_refs = [];
    if (
      Array.isArray(auditScheduleResult?.sop_refs) &&
      auditScheduleResult?.sop_refs.length > 0
    ) {
      const onlySopRefIds = auditScheduleResult?.sop_refs
        .map((item: any) => item.reference_ids)
        .flat();
      sop_refs = await this.prisma.documents.findMany({
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
    if (
      Array.isArray(auditScheduleResult?.hira_refs) &&
      auditScheduleResult?.hira_refs.length > 0
    ) {
      const onlyHiraRefIds = auditScheduleResult?.hira_refs
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
    if (
      Array.isArray(auditScheduleResult?.capa_refs) &&
      auditScheduleResult?.capa_refs.length > 0
    ) {
      const onlyCapaRefIds = auditScheduleResult?.capa_refs
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
    if (
      Array.isArray(auditScheduleResult?.clause_refs) &&
      auditScheduleResult?.clause_refs.length > 0
    ) {
      const onlyClauseRefIds = auditScheduleResult?.capa_refs
        .map((item: any) => item.reference_ids)
        .flat();
      clause_refs = await this.clauseModel
        .find({
          _id: { $in: onlyClauseRefIds },
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
    // //console.log('auditScheduleResult', auditScheduleResult);

    const finalResult = {
      id: id,
      auditPeriod: auditScheduleResult.auditPeriod,
      period: auditScheduleResult.period,
      auditScheduleNumber: auditScheduleResult.auditScheduleNumber,
      auditScheduleName: auditScheduleResult.auditScheduleName,
      auditYear: auditScheduleResult.auditYear,
      status: auditScheduleResult.status,
      createdAt: auditScheduleResult.createdAt,
      createdBy: auditScheduleResult.createdBy,
      auditNumber: auditScheduleResult.auditNumber,
      roleName: auditScheduleResult.roleId,
      roleId: auditScheduleResult.roleId,
      prefixSuffix: auditScheduleResult.prefixSuffix,
      selectedFunction: auditScheduleResult?.selectedFunction || [],
      organization: orgName,
      entityTypeId: entityType.id,
      entityType: entityType.name,
      useFunctionsForPlanning:
        auditScheduleResult?.useFunctionsForPlanning || false,
      auditPlanId:
        auditScheduleResult.auditPlanId === 'No plan'
          ? 'No plan'
          : auditScheduleResult.auditPlanId,
      auditName:
        auditScheduleResult.auditPlanId === 'No plan'
          ? 'No plan'
          : auditPlanInfo?.auditName,
      locationId: location.id,
      location: location.locationName,
      auditTemplateId: auditTemplate?._id || null,
      auditTemplate: auditTemplate?.title || null,
      // systemType: systemType.name,
      auditType: auditScheduleResult.auditType,
      auditTypeName: auditTypeData?.auditType || null,
      planType:
        auditScheduleResult.auditPlanId === 'No plan'
          ? 'No Plan'
          : auditPlanData?.planType,
      // systemTypeId: systemType.id,
      systemMaster: systemMaster,
      // systemMasterId: systemMaster._id,
      auditTemplates: auditScheduleResult.auditTemplates || [],
      auditScheduleEntityWise: auditScheduleEntityDetails,
      isDraft: auditScheduleResult?.isDraft,
      isAiGenerated: auditScheduleResult?.isAiGenerated || false,
      clause_refs: clause_refs,
      sop_refs: sop_refs,
      hira_refs: hira_refs,
      capa_refs: capa_refs,
      auditScope: auditScheduleResult?.auditScope,
      completion_status: auditScheduleResult?.completion_status || {},
    };

    return finalResult;
    // } catch (error) {
    //   // //console.log('error in getAuditScheduleById', error);
    //   new InternalServerErrorException(error);
    // }
  }

  async getFunctionForUser(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const getFunctions = await this.prisma.functions.findMany({
        where: {
          organizationId: activeUser.organizationId,
          functionSpoc: { has: activeUser.id },
        },
        select: { id: true, name: true },
      });
      return getFunctions;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
  async getAuditeeByEntity(entityType, location, userId) {
    const orgId = await this.prisma.user.findFirst({ where: { kcId: userId } });
    const data = [];
    if (entityType === 'Unit') {
      const entities = await this.prisma.entity.findMany({
        where: { locationId: location },
      });
      entities.map((value) => {
        data.push(value);
      });
    } else {
      const entityTypeId = await this.prisma.entityType.findFirst({
        where: { id: entityType, organizationId: orgId.organizationId },
        select: { entity: { select: { entityName: true, id: true } } },
      });
      const result = await entityTypeId?.entity?.map(async (value) => {
        data.push(value);
      });
    }
    const finalData = [];
    for (const i in data) {
      const result = await this.getEntityHeadForDepartment(data[i].id, userId);
      const entityName = data[i];
      const data1 = { entity: data[i].entityName, data: result };
      finalData.push(data1);
    }
    return finalData;
  }

  async getAuditeeByDepartment(entityId: string, orgId: string) {
    try {
      let entityHeads = [];
      const entityDetails: any = await this.prisma.entity.findFirst({
        where: {
          id: entityId,
          organizationId: orgId,
          deleted: false,
        },
      });

      const additionalAuditee = entityDetails?.additionalAuditee?.map(
        (item: any) => item?.id,
      );

      // const auditorId = await this.prisma.role.findFirst({
      //   where: { organizationId: orgId, roleName: 'AUDITOR' },
      // });

      // //console.log('checkaudit entityDetails', entityDetails);

      if (!entityDetails) {
        return { data: [], message: 'No Entity Found with provided id' };
      }

      // //console.log('checkaudit entityDetails', entityDetails, entityId);

      const allUsersInDepartment = await this.prisma.user.findMany({
        where: {
          OR: [{ id: { in: additionalAuditee } }, { entityId: entityId }],
          // entity: {
          //   id: entityId,
          // },
          // entityId : entityId,
          organizationId: orgId,
          deleted: false,
          // NOT: { roleId: { has: auditorId.id } },
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          avatar: true,
          email: true,
          kcId: true,
        },
      });

      // //console.log('checkaudit allUsersInDepartment', allUsersInDepartment);

      if (entityDetails.users && entityDetails.users.length > 0) {
        entityHeads = allUsersInDepartment.filter((user) =>
          entityDetails.users.includes(user.id),
        );
      }
      const otherUsers = await this.prisma.user.findMany({
        where: { id: { in: entityDetails.users } },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          username: true,
          avatar: true,
          email: true,
          kcId: true,
        },
      });
      const entityHeadsId = allUsersInDepartment?.map((value) => value?.id);
      const otherUsersInfo = otherUsers.filter(
        (value) => !entityHeadsId.includes(value.id),
      );
      const finalData = {
        entityHead: [...entityHeads, ...otherUsersInfo],
        users: allUsersInDepartment || [],
      };
      // //console.log('checkaudit finalData', finalData);
      return finalData;
    } catch (error) {
      // //console.log('error inside getAuditeeByDepartment', error);
    }
  }

  async auditScheduleDelete(id, userId) {
    try {
      const deleteAuditScheduleEntityWise =
        await this.auditScheduleEntityModel.deleteMany({
          auditScheduleId: new ObjectId(id),
        });
      // //console.log('deleteeauditscheduleent', deleteAuditScheduleEntityWise);
      // try {
      const deleteAuditSchedule = await this.auditScheduleModel.deleteOne({
        _id: new ObjectId(id),
      });
      // //console.log('deleteas', deleteAuditSchedule);
      // } catch (error) {
      //   throw new NotFoundException(error);
      // }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async updateAuditSchedule(data, id, userId) {
    const {
      auditScheduleName,
      auditPeriod,
      period,
      auditYear,
      auditScheduleNumber,
      status,
      auditTemplateId,
      roleId,
      entityTypeId,
      locationId,
      systemTypeId,
      systemMasterId,
      auditNumber,
      auditScheduleEntityWise,
      prefixSuffix,
      isDraft,
      selectedFunction,
      useFunctionsForPlanning,
      auditTemplates,
      sop_refs,
      hira_refs,
      capa_refs,
      auditScope,
      clause_refs,
    } = data;

    // try {
    const entityExist = await this.auditScheduleModel.findById({
      _id: id,
      // entityTypeId: entityTypeId,
    });
    //try{} catch (error){throw new NotFoundException(error)}
    if (entityExist) {
      const updateAuditSchedule =
        await this.auditScheduleModel.findByIdAndUpdate(new ObjectId(id), {
          auditScheduleName,
          auditPeriod,
          period,
          auditYear,
          auditScheduleNumber,
          status,
          auditTemplateId,
          auditNumber,
          roleId,
          locationId,
          systemTypeId,
          systemMasterId,
          selectedFunction,
          prefixSuffix,
          isDraft,
          auditTemplates,
          useFunctionsForPlanning,
          sop_refs,
          hira_refs,
          capa_refs,
          auditScope,
          clause_refs,
        });
      // try {
      if (!auditScheduleEntityWise) {
        // ////////////////console.log('no auditScheduleEntityWise');
      } else {
        // ////////////////console.log('auditSchedule is there');
        auditScheduleEntityWise.map(async (value) => {
          await this.auditScheduleEntityModel.findByIdAndUpdate(
            new ObjectId(value.id),
            {
              entityId: value.entityId,
              time: value.time,
              auditor: value.auditor,
              auditee: value.auditee,
              comments: value.comments,
              auditTemplateId: value.auditTemplate,
              areas: value.areas,
              deleted: value.deleted,
              createdBy: updateAuditSchedule.createdBy,
              auditTemplates: value?.auditTemplates || [],
            },
          );
        });
      }
      // } catch (error) {
      //   throw new NotFoundException(error);
      // }
    } else {
      // ////////////////console.log('data is not exist');
      // try {
      const res = await this.auditScheduleModel.findByIdAndUpdate(id, {
        auditScheduleName,
        auditPeriod,
        period,
        auditYear,
        auditScheduleNumber,
        status,
        auditTemplateId,
        roleId,
        locationId,
        systemTypeId,
        auditNumber,
        entityTypeId,
        auditTemplates,
        selectedFunction,
        useFunctionsForPlanning,
        sop_refs,
        hira_refs,
        capa_refs,
        auditScope,
        clause_refs,
      });
      await this.auditScheduleEntityModel.deleteMany({
        auditScheduleId: new ObjectId(id),
      });
      if (auditScheduleEntityWise) {
        auditScheduleEntityWise.map(async (value) => {
          await this.auditScheduleEntityModel.create({
            entityId: value.entityId,
            time: value.time,
            auditor: value.auditor,
            auditee: value.auditee,
            comments: value.comments,
            createdBy: res?.createdBy,
            auditScheduleId: id,
            auditTemplateId: value.auditTemplate,
            areas: value.areas,
            auditTemplates: value?.auditTemplates || [],
          });
        });
      }
      // } catch (error) {
      //   throw new NotFoundException(error);
      // }
    }
    return 'succesfully Updated';
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
  }

  async updateAuditScheduleDetails(data, id, userId) {
    const {
      auditScheduleName,
      auditPeriod,
      period,
      auditYear,
      auditScheduleNumber,
      status,
      auditTemplateId,
      roleId,
      entityTypeId,
      locationId,
      systemTypeId,
      systemMasterId,
      auditNumber,
      prefixSuffix,
      isDraft,
      audiTemplates,
      useFunctionsForPlanning,
      sop_refs,
      hira_refs,
      capa_refs,
      auditScope,
      clause_refs,
    } = data;
    // try {
    const entityExist = await this.auditScheduleModel.findById({
      _id: id,
      // entityTypeId: entityTypeId,
    });
    //try{} catch (error){throw new NotFoundException(error)}
    if (entityExist) {
      const updateAuditSchedule =
        await this.auditScheduleModel.findByIdAndUpdate(new ObjectId(id), {
          auditScheduleName,
          auditPeriod,
          period,
          auditYear,
          auditScheduleNumber,
          useFunctionsForPlanning,

          status,
          auditTemplateId,
          auditNumber,
          roleId,
          locationId,
          systemTypeId,
          systemMasterId,
          prefixSuffix,
          isDraft,
          audiTemplates,
          sop_refs,
          hira_refs,
          capa_refs,
          auditScope,
          clause_refs,
        });
      // try {
      // } catch (error) {
      //   throw new NotFoundException(error);
      // }
    } else {
      // ////////////////console.log('data is not exist');
      // try {
      await this.auditScheduleModel.findByIdAndUpdate(id, {
        auditScheduleName,
        auditPeriod,
        period,
        auditYear,
        auditScheduleNumber,
        status,
        auditTemplateId,
        roleId,
        locationId,
        systemTypeId,
        auditNumber,
        entityTypeId,
        useFunctionsForPlanning,

        audiTemplates,
        sop_refs,
        hira_refs,
        capa_refs,
        auditScope,
        clause_refs,
      });
      // } catch (error) {
      //   throw new NotFoundException(error);
      // }
    }
    if (isDraft === false) {
      try {
        const response = await this.updateTeamLeadEntry(id);
      } catch (error) {
        // console.log('error writing into auditschedule tema lead');
      }
    }
    return 'succesfully Updated';
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
  }

  async updateAuditScheduleEntityWise(id, data) {
    try {
      const auditScheduleEntityWiseData =
        await this.auditScheduleEntityModel.findByIdAndUpdate(id, data);
      return auditScheduleEntityWiseData;
    } catch (error) {
      return error;
    }
  }

  async createEntryInAuditScheduleEntityWise(data) {
    try {
      let dataToCreate = {
        ...data,
        auditScheduleId: new ObjectId(data?.auditScheduleId),
      };
      const auditScheduleEntityWiseData =
        await this.auditScheduleEntityModel.create(dataToCreate);
      return auditScheduleEntityWiseData;
    } catch (error) {
      return error;
    }
  }

  async deleteAuditScheduleEntityWise(paramId) {
    try {
      let id = new ObjectId(paramId);
      const auditScheduleEntityWiseData =
        await this.auditScheduleEntityModel.deleteOne({ _id: id });
      return auditScheduleEntityWiseData;
    } catch (error) {
      return error;
    }
  }

  async auditScheduleTemplate(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const finalResult = await this.auditTemplate
        .find({
          organizationId: activeUser.organizationId,
          // isDraft: false,
        })
        .select('_id title');

      return finalResult;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
  async getAuditScheduleEntityWiseCalendardata(userId, query) {
    const {
      auditYear,
      locationId,
      systemTypeId,
      systemMasterId,
      auditor,
      auditType,
    } = query;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });
    // //console.log(auditType);
    // try {
    const finalResult = [];
    let result = [];
    if (auditType != 'all') {
      result = await this.auditScheduleModel.find({
        // systemTypeId: systemTypeId,
        organizationId: activeUser.organizationId,
        auditType: query.auditType,
      });
    } else if (auditType === 'all') {
      result = await this.auditScheduleModel.find({
        // systemTypeId: systemTypeId,
        organizationId: activeUser.organizationId,
      });
    }

    for (let value of result) {
      const auditSEntity = await this.auditScheduleEntityModel
        .find({
          $or: [{ auditScheduleId: new ObjectId(value._id) }],
        })
        .populate('auditScheduleId')
        .exec();
      // //console.log('auditSEntity',auditSEntity);

      for (let obj of auditSEntity) {
        const entityName = await this.prisma.entity.findFirst({
          where: { id: obj.entityId },
        });
        // //console.log('entityName',entityName);
        const time: any = obj.time;

        const storedDate = new Date(time);
        const year = storedDate.getFullYear();
        const month = String(storedDate.getMonth() + 1).padStart(2, '0');
        const day = String(storedDate.getDate()).padStart(2, '0');

        const formattedDate = new Date(`${year}-${month}-${day}`); // Convert formatted date back to Date object

        const currentDate = new Date();
        const differenceInMilliseconds =
          currentDate.getTime() - formattedDate.getTime(); // Get time in milliseconds
        const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

        let auditScheduleObj: any = obj.auditScheduleId;

        // //////////////console.log("auditScheduleObj",auditScheduleObj);

        const locationDetails = await this.prisma.location.findFirst({
          where: { id: auditScheduleObj.locationId },
        });
        const auditTypeDetails = await this.auditSettingsModel.findById(
          new ObjectId(auditScheduleObj.auditType),
        );

        const auditReportData = await this.auditModel.find({
          auditedEntity: obj.entityId,
          auditScheduleId: auditScheduleObj?._id?.toString(),
        });
        // ////////////////console.log('auditTypeDetails--->', auditTypeDetails);

        // ////////////////console.log('locationName--->', locationDetails);

        const data = {
          id: obj._id,
          entityName: entityName?.entityName || '',
          time: obj.time,
          auditTemplateId: obj.auditTemplateId,
          color: 'black',
          auditor: obj.auditor,
          auditee: obj.auditee,
          locationName: locationDetails?.locationName,
          auditReport: auditReportData?.length > 0 ? true : false,
          auditType: auditTypeDetails?.auditType,
          planType: auditTypeDetails?.planType,
          auditScheduleId: auditScheduleObj?._id,
          responsibility: auditTypeDetails?.responsibility,
          dateExcceds: differenceInDays > 30,
        };
        // ////////////////console.log('color', systemTypeColor.color);
        finalResult.push(data);
      }
    }
    // //console.log('getallcalendardata', finalResult);
    return finalResult;
    // } catch (error) {}
  }

  async getAuditScheduleEntityWiseCalendardataNew(userId, query) {
    const { auditType } = query;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });

    // Fetch all audit schedules based on type
    const result = await this.auditScheduleModel
      .find({
        organizationId: activeUser.organizationId,
        ...(auditType !== 'all' && { auditType }),
      })
      .sort({ createdAt: -1 });

    // Aggregate all audit schedule IDs
    const auditScheduleIds = result.map((schedule) => schedule._id);

    // Fetch all audit entities related to these schedules in one go
    const auditEntities = await this.auditScheduleEntityModel
      .find({
        auditScheduleId: { $in: auditScheduleIds },
      })
      .populate('auditScheduleId')
      .exec();

    // Collect unique IDs from audit entities for bulk retrieval
    let entityIds: any = new Set();
    let locationIds: any = new Set();
    let auditorIds: any = new Set();
    let auditeeIds: any = new Set();
    let auditTypeIds: any = new Set();

    auditEntities.forEach((entity: any) => {
      if (entity.entityId) entityIds.add(entity.entityId);
      if (entity.auditScheduleId.locationId)
        locationIds.add(entity.auditScheduleId.locationId);
      if (entity.auditor)
        entity.auditor.forEach((id: any) => auditorIds.add(id));
      if (entity.auditee)
        entity.auditee.forEach((id: any) => auditeeIds.add(id));
      if (entity.auditScheduleId.auditType)
        auditTypeIds.add(entity.auditScheduleId.auditType);
    });

    // Perform bulk data retrieval
    const [entities, locations, auditors, auditees, auditTypes] =
      await Promise.all([
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
        }),
        this.prisma.user.findMany({
          where: { id: { in: Array.from(auditorIds) } },
        }),
        this.prisma.user.findMany({
          where: { id: { in: Array.from(auditeeIds) } },
        }),
        this.auditSettingsModel.find({
          _id: { $in: Array.from(auditTypeIds) },
        }),
      ]);

    // Create maps for quick lookup
    const entityMap = new Map(entities.map((e) => [e.id, e]));
    const locationMap = new Map(locations.map((l) => [l.id, l]));
    const auditorMap = new Map(auditors.map((a) => [a.id, a]));
    const auditeeMap = new Map(auditees.map((a) => [a.id, a]));
    const auditTypeMap = new Map(auditTypes.map((t) => [t._id.toString(), t]));

    // Construct final result with reduced in-loop processing
    const finalResult = auditEntities.map((entity: any) => {
      const time: any = entity.time;

      const storedDate = new Date(time);
      const year = storedDate.getFullYear();
      const month = String(storedDate.getMonth() + 1).padStart(2, '0');
      const day = String(storedDate.getDate()).padStart(2, '0');

      const formattedDate = new Date(`${year}-${month}-${day}`); // Convert formatted date back to Date object

      const currentDate = new Date();
      const differenceInMilliseconds =
        currentDate.getTime() - formattedDate.getTime(); // Get time in milliseconds
      const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

      return {
        id: entity._id,
        entityName: entityMap.get(entity.entityId)?.entityName,
        time: entity.time,
        color: 'black',
        auditor: entity.auditor.map((id) => auditorMap.get(id)),
        auditee: entity.auditee.map((id) => auditeeMap.get(id)),
        locationName: locationMap.get(entity.auditScheduleId.locationId)
          ?.locationName,
        auditType: auditTypeMap.get(entity.auditScheduleId.auditType.toString())
          ?.auditType,
        planType: auditTypeMap.get(entity.auditScheduleId.auditType.toString())
          ?.planType,
        auditScheduleId: entity.auditScheduleId._id,
        responsibility: auditTypeMap.get(
          entity.auditScheduleId.auditType.toString(),
        )?.responsibility,
        dateExceeds: differenceInDays > 30,
      };
    });

    return finalResult;
  }

  async getAuditFilterData(query, userId) {
    const { auditYear, locationId, systemTypeId, systemMasterId, auditor } =
      query;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });
    const result = await this.auditScheduleModel.aggregate([
      {
        $match: {
          organizationId: activeUser.organizationId,
          locationId: locationId,
        },
      },
      // {
      //   $match: {
      //     locationId: locationId ,
      //   },
      // },
    ]);
    return result;
  }

  async search(text, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });
    try {
      let systems = await this.prisma.systemType.findMany({
        where: {
          AND: [
            { organizationId: activeUser.organizationId },
            { name: { contains: text, mode: 'insensitive' } },
          ],
        },
      });
      let systemMaster = await this.System.find({
        $and: [
          {
            $and: [{ organizationId: activeUser.organizationId }],
          },
          { name: { $regex: text, $options: 'i' } },
        ],
      });

      let roles = await this.prisma.role.findMany({
        where: {
          AND: [
            { organizationId: activeUser.organizationId },
            { roleName: { contains: text, mode: 'insensitive' } },
          ],
        },
      });

      let entityType = await this.prisma.entityType.findMany({
        where: {
          AND: [
            { organizationId: activeUser.organizationId },
            { name: { contains: text, mode: 'insensitive' } },
          ],
        },
      });
      const entityTypeIds = entityType.map((item) => item.id);
      const rolesIds = roles.map((item) => item.id);
      const systemIds = await systems.map((item) => item.id);
      const systemMasterIds = systemMaster.map((item) => item._id.toString());
      const getAllauditSche = await this.auditScheduleModel.find({
        $and: [{ organizationId: activeUser.organizationId }],
        $or: [
          { systemTypeId: { $in: systemIds } },
          { systemMasterId: { $in: systemMasterIds } },
          { roleId: { $in: rolesIds } },
          { entityTypeId: { $in: entityTypeIds } },
          { auditYear: { $regex: text, $options: 'i' } },
          { createdBy: { $regex: text, $options: 'i' } },
        ],
      });
      const finalResult = await getAllauditSche.map(async (value) => {
        const query = await this.auditScheduleEntityModel.find({
          auditScheduleId: value._id,
        });
        const systemMaster = await this.System.findById(value.systemMasterId);
        const systemType = await this.prisma.systemType.findFirst({
          where: {
            // id:value.systemTypeId
            id: String(value.systemTypeId),
          },
        });

        const locationName = await this.prisma.location.findFirst({
          where: {
            id: String(value.locationId),
          },
        });

        const entityFirstName = await this.prisma.entityType.findFirst({
          where: {
            id: String(value.entityTypeId),
          },
        });
        const roleName = await this.prisma.role.findFirst({
          where: {
            id: String(value.roleId),
          },
        });
        const data = {
          id: value._id,
          auditScheduleName: value.auditScheduleName,
          auditPeriod: value.auditPeriod,
          period: value.period,
          auditYear: value.auditYear,
          auditNumber: value.auditNumber,
          auditScheduleNumber: value.auditScheduleNumber,
          status: value.status,
          createdAt: value.createdAt,
          updatedAt: value.updatedAt,
          organizationId: value.organizationId,
          roleId: value.roleId,
          roleName: roleName.roleName,
          entityTypeId: value.entityTypeId,
          entityTypeName: entityFirstName.name,
          auditPlanId: value.auditPlanId,
          location: value.locationId,
          locationName: locationName.locationName,
          systemTypeId: value.systemTypeId,
          systemType: systemType.name,
          auditTemplate: value.auditTemplateId,
          systemMasterId: value.systemMasterId,
          systemMaster: systemMaster.name,
          auditScheduleEntityWise: query,
        };
        return data;
      });
      const result = Promise.all(finalResult);
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async myaudit(userId, query) {
    // //console.log('my audit api called id', id);

    // try {
    //   const finalResult = [];
    //   const activeUser = await this.prisma.user.findFirst({
    //     where: {
    //       kcId: userId.id,
    //     },
    //   });
    //   //////console.log('activeuser', activeUser);
    //   let auditSchEntityData;

    //   auditSchEntityData = await this.auditScheduleEntityModel.find({
    //     $and: [{ organizationId: activeUser.organizationId }],
    //     $or: [
    //       { auditor: { $in: [activeUser.id] } }, // Check if activeUser.id is in the auditor array
    //       { auditee: { $in: [activeUser.id] } }, // Check if activeUser.id is in the auditee array],
    //     ],
    //   });

    //   ////console.log('auditscheduleentitydata', auditSchEntityData);

    //   const allData = auditSchEntityData.map((value) => value.auditScheduleId);
    //   let result;
    //   if (id === 'all') {
    //     result = await this.auditScheduleModel
    //       .find({
    //         $and: [{ organizationId: activeUser.organizationId }],
    //         $or: [{ _id: { $in: allData } }],
    //       })
    //       .sort({ createdAt: -1 });
    //   } else {
    //     result = await this.auditScheduleModel
    //       .find({
    //         $and: [
    //           { organizationId: activeUser.organizationId },
    //           { auditType: id },
    //         ],
    //         $or: [{ _id: { $in: allData } }],
    //       })
    //       .sort({ createdAt: -1 });
    //   }

    //   const resultFirst = await result.map(async (value) => {
    //     let scheduleEntitydata = [];
    //     const query = await this.auditScheduleEntityModel.find({
    //       auditScheduleId: value._id,
    //     });
    //     console.log('query in yqudit', query);
    //     for (let rec of query) {
    //       console.log('rec', rec);
    //       let auditors = await this.prisma.user.findMany({
    //         where: {
    //           id: {
    //             in: rec.auditor,
    //           },
    //         },
    //       });
    //       let auditees = await this.prisma.user.findMany({
    //         where: {
    //           id: {
    //             in: rec.auditee,
    //           },
    //         },
    //       });
    //       let dat: any = {
    //         rec,
    //         auditor: auditors,
    //         auditee: auditees,
    //       };
    //       scheduleEntitydata.push(dat);
    //     }

    //     const systemMaster = await this.System.find({
    //       _id: { $in: value.systemMasterId },
    //     });
    //     const systemType = await this.prisma.systemType.findFirst({
    //       where: {
    //         // id:value.systemTypeId
    //         id: String(value.systemTypeId),
    //       },
    //       select: {
    //         name: true,
    //       },
    //     });

    //     const locationName = await this.prisma.location.findFirst({
    //       where: {
    //         id: String(value.locationId),
    //       },
    //       select: {
    //         locationName: true,
    //       },
    //     });
    //     let entityFirstName;
    //     if (value.entityTypeId === 'Unit') {
    //       entityFirstName = { id: 'Unit', name: 'Unit' };
    //     } else {
    //       entityFirstName = await this.prisma.entityType.findFirst({
    //         where: {
    //           id: String(value.entityTypeId),
    //         },
    //         select: {
    //           name: true,
    //         },
    //       });
    //     }

    //     const roleName = await this.prisma.role.findFirst({
    //       where: {
    //         id: String(value.roleId),
    //       },
    //       select: {
    //         roleName: true,
    //       },
    //     });

    //     const auditType = await this.auditSettingsModel.findById(
    //       value.auditType,
    //     );

    //     const data = {
    //       id: value._id,
    //       auditScheduleName: value.auditScheduleName,
    //       auditPeriod: value.auditPeriod,
    //       auditYear: value.auditYear,
    //       auditNumber: value.auditNumber,
    //       auditScheduleNumber: value.auditScheduleNumber,
    //       status: value.status,
    //       createdAt: value.createdAt,
    //       updatedAt: value.updatedAt,
    //       organizationId: value.organizationId,
    //       prefixSuffix: value.prefixSuffix,
    //       roleId: value.roleId,
    //       roleName: value.roleId,
    //       entityTypeId: value.entityTypeId,
    //       entityTypeName: entityFirstName.name,
    //       auditPlanId: value.auditPlanId,
    //       location: value.locationId,
    //       locationName: locationName?.locationName,
    //       auditTypeName: auditType?.auditType || '',
    //       planType: auditType?.planType || '',
    //       // systemTypeId: value.systemTypeId,
    //       // systemType: systemType.name,
    //       auditTemplate: value.auditTemplateId,
    //       systemMasterId: value.systemMasterId,
    //       // systemMaster: systemMaster.name,
    //       systemMaster: systemMaster,
    //       auditScheduleEntityWise: scheduleEntitydata,
    //     };
    //     return data;
    //   });
    //   const answer = Promise.all(resultFirst);
    //   return answer;
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
    const {
      auditYear,
      locationId,
      systemTypeId,
      systemMasterId,
      auditor,
      auditType,
      page,
      limit,
    } = query;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });

    // try {
    const finalResult = [];
    let result = [];
    if (auditType === 'all') {
      result = await this.auditScheduleModel.find({
        // systemTypeId: systemTypeId,
        organizationId: activeUser.organizationId,
      });
    } else {
      result = await this.auditScheduleModel.find({
        auditType: auditType,
        organizationId: activeUser.organizationId,
      });
    }
    for (let value of result) {
      let newlist = [];
      const auditSEntity = await this.auditScheduleEntityModel
        .find({
          $and: [
            { organizationId: activeUser.organizationId },
            { auditScheduleId: new ObjectId(value._id) },
          ],
          $or: [
            { auditor: { $in: [activeUser.id] } }, // Check if activeUser.id is in the auditor array
            { auditee: { $in: [activeUser.id] } }, // Check if activeUser.id is in the auditee array],
            { createdBy: activeUser.username },
          ],
        })
        .populate('auditScheduleId')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec();

      for (let obj of auditSEntity) {
        const entityName = await this.prisma.entity.findFirst({
          where: { id: obj.entityId },
        });
        let auditScheduleObj: any = obj.auditScheduleId;

        // ////////////console.log("auditScheduleObj",auditScheduleObj);
        let color = 'black';
        const locationDetails = await this.prisma.location.findFirst({
          where: { id: auditScheduleObj.locationId },
        });
        const auditTypeDetails = await this.auditSettingsModel.findById(
          new ObjectId(auditScheduleObj.auditType),
        );
        const systemMaster = await this.System.find({
          _id: { $in: auditScheduleObj.systemMasterId },
        });
        let auditors = await this.prisma.user.findMany({
          where: {
            id: {
              in: obj.auditor,
            },
          },
        });

        let auditees = await this.prisma.user.findMany({
          where: {
            id: {
              in: obj.auditee,
            },
          },
        });

        const data = {
          id: obj._id,
          entityName: entityName.entityName,
          time: obj.time,
          color: color,
          auditor: obj.auditor,
          auditee: obj.auditee,
          locationName: locationDetails?.locationName,
          auditType: auditTypeDetails?.auditType,
          planType: auditTypeDetails?.planType,
          auditScheduleId: auditScheduleObj?._id,
          responsibility: auditTypeDetails?.responsibility,
          auditScheduleDetails: obj.auditScheduleId,
          myauditors: auditors,
          myauditees: auditees,
          systemMaster: systemMaster,
        };
        // ////////////////console.log('color', systemTypeColor.color);
        finalResult.push(data);
      }
    }
    return finalResult;
    // } catch (error) {}
  }

  async getAuditors(user, data) {
    // try {
    const { auditType, location, system, dept, date } = data;

    if (auditType === 'All') {
      return [];
    }
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });

    const auditSettings: any = await this.auditSettingsModel.findById(
      auditType,
    );
    // //console.log('auditSettings', auditSettings.auditorsFromSameUnit);
    const auditorId: any = await this.prisma.role.findFirst({
      where: {
        organizationId: activeUser.organizationId,
        roleName: 'AUDITOR',
      },
    });
    let auditors;
    if (!auditSettings.auditorsFromSameUnit) {
      // //console.log('this api is called');
      auditors = await getAllAuditorsBasedFilters(
        this.prisma.user,
        activeUser.organizationId,
        auditorId,
      );
    } else if (auditSettings.auditorsFromSameUnit) {
      auditors = await getAllAuditorsBasedLocationFilters(
        this.prisma.user,
        activeUser.organizationId,
        location,
        auditorId,
      );
      auditors = await filterAuditorBasedOnDepartment(auditors, dept, 'NOTIN');
    }

    // if (!auditSettings.auditorsFromSameDept) {
    //   // //console.log('not in condition');
    //   auditors = await filterAuditorBasedOnDepartment(auditors, dept, 'NOTIN');
    // } else if (auditSettings.auditorsFromSameDept) {
    //   // //console.log('in condition');
    //   auditors = await filterAuditorBasedOnDepartment(auditors, dept, 'IN');
    // }
    auditors = await validateAuditorBasedOnAuditorProfile(
      auditors,
      this.auditorProfileModel,
      auditType,
    );

    // if (auditors.length > 0) {
    //   auditors = await filterAuditorBasedOnFilterBySystem(
    //     auditors,
    //     this.auditorProfileModel,
    //     activeUser.organizationId,
    //     system,
    //   );
    // }

    // //console.log('filterAuditorBasedOnFilterBySystem', auditors);
    //add scope validation
    // if (
    //    auditors.length > 0 &&
    //   JSON.parse(auditSettings.scope).name === 'Unit'
    //  ) {
    // //console.log('inside if auditor uni');

    //    auditors = await filterAuditorBasedOnFilterByLocationFunction(
    //     auditors,
    //   this.prisma.location,
    //  this.prisma.functions,
    //   this.auditorProfileModel,
    //   location,
    //  );
    //  }
    // else if (auditors.length > 0) {
    //   //console.log("inside else if");

    //   auditors = await filterBasedDept(auditors, dept, location);
    // }

    // //console.log('filterAuditorBasedOnFilterByLocationFunction', auditors);
    if (auditors.length > 0) {
      if (auditSettings.auditorsFromSameDept) {
        auditors = await filterBasedOnDept(auditors, dept);
      }
    }

    // //console.log('filterBasedOnDept', auditors.length);
    //if (auditors.length > 0) {
    //   if (JSON.parse(auditSettings.scope).name === 'Unit') {
    //   auditors = await filterByAuditReport(
    //     this.auditModel,
    //       auditors,
    //     location,
    //    activeUser.organizationId,
    //     );
    // }
    //    }

    if (
      auditors.length > 0 &&
      JSON.parse(auditSettings.scope).name === 'Unit'
    ) {
      auditors = await filterBasedScopeUnit(auditors, location);
    }

    // await this.auditScheduleEntityModel.
    // if (auditors.length > 0) {
    //   auditors = await dateCheckInAuditSchedule(
    //     auditors,
    //     date,
    //     this.auditScheduleEntityModel,
    //   );
    // }
    // //console.log('dateCheckInAuditSchedule', auditors.length);

    if (!!data?.dept) {
      // console.log("data dept", data.dept);

      const deptDetails = await this.prisma.entity.findFirst({
        where: {
          id: data?.dept,
        },
      });

      // Filter auditors based on deptDetails.users
      const filteredAuditors = auditors.filter(
        (auditor) => !deptDetails?.users?.includes(auditor.id),
      );

      auditors = filteredAuditors;
    }

    return auditors;
    // } catch (error) {
    //   throw new InternalServerErrorException(error);
    // }
  }

  async updateAuditEntityByCalendarData(query, user) {
    try {
      const { date, id } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      await this.auditScheduleEntityModel.findByIdAndUpdate(id, {
        $set: { time: date },
      });
      return 'Sucessfull changed';
    } catch {
      return 'Something went Wrong';
    }
  }
  async getMyAuditCalendardata(query, userId) {
    const {
      auditYear,
      locationId,
      systemTypeId,
      systemMasterId,
      auditor,
      auditType,
    } = query;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });

    // try {
    const finalResult = [];
    let result = [];
    if (auditType === 'All') {
      result = await this.auditScheduleModel
        .find({
          // systemTypeId: systemTypeId,
          organizationId: activeUser.organizationId,
        })
        .sort({ createdAt: -1 });
    } else {
      result = await this.auditScheduleModel
        .find({
          auditType: auditType,
          organizationId: activeUser.organizationId,
        })
        .sort({ createdAt: -1 });
    }

    for (let value of result) {
      let newlist = [];
      const auditSEntity = await this.auditScheduleEntityModel
        .find({
          $and: [
            { organizationId: activeUser.organizationId },
            { auditScheduleId: new ObjectId(value._id) },
          ],
          $or: [
            { auditor: { $in: [activeUser.id] } }, // Check if activeUser.id is in the auditor array
            { auditee: { $in: [activeUser.id] } }, // Check if activeUser.id is in the auditee array],
            { createdBy: activeUser.username },
          ],
        })
        .populate('auditScheduleId')
        .exec();

      for (let obj of auditSEntity) {
        const time: any = obj.time;

        const storedDate = new Date(time);
        const year = storedDate.getFullYear();
        const month = String(storedDate.getMonth() + 1).padStart(2, '0');
        const day = String(storedDate.getDate()).padStart(2, '0');

        const formattedDate = new Date(`${year}-${month}-${day}`); // Convert formatted date back to Date object

        const currentDate = new Date();
        const differenceInMilliseconds =
          currentDate.getTime() - formattedDate.getTime(); // Get time in milliseconds
        const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);

        const entityName = await this.prisma.entity.findFirst({
          where: { id: obj.entityId },
        });
        let auditScheduleObj: any = obj.auditScheduleId;

        // ////////////console.log("auditScheduleObj",auditScheduleObj);
        let color = 'black';
        const locationDetails = await this.prisma.location.findFirst({
          where: { id: auditScheduleObj.locationId },
        });
        const auditTypeDetails = await this.auditSettingsModel.findById(
          new ObjectId(auditScheduleObj.auditType),
        );
        const systemMaster = await this.System.find({
          _id: { $in: auditScheduleObj.systemMasterId },
        });
        let auditors = await this.prisma.user.findMany({
          where: {
            id: {
              in: obj.auditor,
            },
          },
        });

        let auditees = await this.prisma.user.findMany({
          where: {
            id: {
              in: obj.auditee,
            },
          },
        });
        const data = {
          id: obj._id,
          entityName: entityName.entityName,
          time: obj.time,
          color: color,
          auditor: obj.auditor,
          auditee: obj.auditee,
          locationName: locationDetails?.locationName,
          auditType: auditTypeDetails?.auditType,
          planType: auditTypeDetails?.planType,
          auditScheduleId: auditScheduleObj?._id,
          responsibility: auditTypeDetails?.responsibility,
          auditScheduleDetails: obj.auditScheduleId,
          myauditors: auditors,
          myauditees: auditees,
          systemMaster: systemMaster,
          dateExcceds: differenceInDays > 30,
        };
        // ////////////////console.log('color', systemTypeColor.color);
        finalResult.push(data);
      }
    }
    return finalResult;
    // } catch (error) {}
  }

  async getMyAuditCalendardataNew(query, userId) {
    const { auditType } = query;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });

    // Get all audits for the active user's organization
    const audits = await this.auditScheduleModel
      .find({
        ...(auditType === 'all' && { auditType: auditType }),
        // auditType: auditType === 'all' ? {} : { auditType },
        organizationId: activeUser.organizationId,
      })
      .sort({ createdAt: -1 });

    // Aggregate all needed IDs
    let auditScheduleIds = audits.map((audit) => audit._id);

    auditScheduleIds = auditScheduleIds.map((id) => new ObjectId(id));

    // Fetch all related audit entities in one go
    const auditEntities = await this.auditScheduleEntityModel
      .find({
        auditScheduleId: { $in: auditScheduleIds },
        $or: [
          { auditor: { $in: [activeUser.id] } },
          { auditee: { $in: [activeUser.id] } },
          { createdBy: activeUser.username },
        ],
      })
      .populate('auditScheduleId')
      .exec();

    // Aggregate entity IDs, auditor IDs, and auditee IDs
    const entityIds: any = new Set();
    const auditorIds: any = new Set();
    const auditeeIds: any = new Set();
    let auditTypeIds: any = new Set();
    let locationIds: any = new Set();
    let systemMasterIds: any = new Set();
    auditEntities.forEach((entity: any) => {
      if (entity.entityId) entityIds.add(entity.entityId);
      if (entity.auditScheduleId.locationId)
        locationIds.add(entity.auditScheduleId.locationId);
      if (entity.auditor)
        entity.auditor.forEach((id: any) => auditorIds.add(id));
      if (entity.auditee)
        entity.auditee.forEach((id: any) => auditeeIds.add(id));
      if (entity.auditScheduleId.auditType)
        auditTypeIds.add(entity.auditScheduleId.auditType);
      if (entity?.systemMasterId) systemMasterIds.add(entity.systemMasterId);
    });

    auditTypeIds = Array.from(auditTypeIds);
    auditTypeIds = auditTypeIds.map((id) => new ObjectId(id));

    // Fetch entities, auditors, auditees in bulk
    const [
      entities,
      locations,
      auditors,
      auditees,
      auditTypeObjects,
      systemMasters,
    ] = await Promise.all([
      this.prisma.entity.findMany({
        where: { id: { in: Array.from(entityIds) } },
      }),
      this.prisma.location.findMany({
        where: { id: { in: Array.from(locationIds) } },
      }),
      this.prisma.user.findMany({
        where: { id: { in: Array.from(auditorIds) } },
      }),
      this.prisma.user.findMany({
        where: { id: { in: Array.from(auditeeIds) } },
      }),
      this.auditSettingsModel.find({
        _id: { $in: auditTypeIds },
      }),
      this.System.find({
        _id: { $in: Array.from(systemMasterIds) },
      }),
    ]);

    // Map for quick lookup
    const entityMap = new Map(entities.map((e) => [e.id, e]));
    const auditorMap = new Map(auditors.map((a) => [a.id, a]));
    const auditeeMap = new Map(auditees.map((a) => [a.id, a]));
    const auditTypeMap = new Map(auditTypeObjects.map((a) => [a._id, a]));
    const locationMap = new Map(locations.map((l) => [l.id, l]));

    // Prepare final results
    const finalResult = auditEntities.map((entity: any) => {
      const time: any = entity.time;

      const storedDate = new Date(time);
      const year = storedDate.getFullYear();
      const month = String(storedDate.getMonth() + 1).padStart(2, '0');
      const day = String(storedDate.getDate()).padStart(2, '0');

      const formattedDate = new Date(`${year}-${month}-${day}`); // Convert formatted date back to Date object

      const currentDate = new Date();
      const differenceInMilliseconds =
        currentDate.getTime() - formattedDate.getTime(); // Get time in milliseconds
      const differenceInDays = differenceInMilliseconds / (1000 * 3600 * 24);
      // const differenceInDays = (currentDate.getTime() - new Date(entity.time).getTime()) / (1000 * 3600 * 24);

      return {
        id: entity._id,
        entityName: entityMap.get(entity.entityId)?.entityName,
        time: entity.time,
        color: 'lightblue',
        auditor: entity.auditor.map((id) => auditorMap.get(id)),
        auditee: entity.auditee.map((id) => auditeeMap.get(id)),
        dateExceeds: differenceInDays > 30,
        locationName: locationMap.get(entity.auditScheduleId.locationId)
          ?.locationName,
        auditType: auditTypeMap?.get(entity.auditType)?.auditType,
        planType: auditTypeMap?.get(entity.auditType)?.planType,
        auditScheduleId: entity?.auditScheduleId?._id,
        responsibility: auditTypeMap?.get(entity.auditType)?.responsibility,
        auditScheduleDetails: entity?.auditScheduleId,
        myauditors: auditors?.filter((auditor: any) =>
          entity.auditor.includes(auditor.id),
        ),
        myauditees: auditees?.filter((auditee: any) =>
          entity.auditee.includes(auditee.id),
        ),
        systemMaster: systemMasters?.filter((systemMaster: any) =>
          entity.systemMasterId.includes(systemMaster._id),
        ),
        // Additional fields can be added here
      };
    });

    return finalResult;
  }

  async isLoggedinUsercreateAuditSchedule(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: { select: { entityName: true } } },
      });
      const result = [];
      if (userId.kcRoles.roles.includes('ORG-ADMIN')) {
        const value = await this.auditSettingsData(
          'MCOE',
          activeUser.organizationId,
          {
            entityId: activeUser.entityId,
            locationId: activeUser.locationId,
            entityName: activeUser.entity.entityName,
          },
          false,
        );
        result.push(value);
      }
      if (userId.kcRoles.roles.includes('MR')) {
        const value = await this.auditSettingsData(
          'IMS Coordinator',
          activeUser.organizationId,
          {
            entityId: activeUser.entityId,
            locationId: activeUser.locationId,
            entityName: activeUser.entity.entityName,
          },
          false,
        );
        result.push(value);
      }
      // else {
      const entityData = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          users: { has: activeUser.id },
        },
      });
      if (entityData.length > 0) {
        const value = await this.auditSettingsData(
          'Entity Head',
          activeUser.organizationId,
          {
            entityData: entityData.map((value) => value.id),
            entityDataNames: entityData.map((value) => value.entityName),
            entityId: activeUser.entityId,
            locationId: activeUser.locationId,
            entityLocation: entityData.map((value) => value.locationId),
            entityName: activeUser.entity.entityName,
          },
          true,
        );
        result.push(value);
      } else {
        const value = await this.auditSettingsData(
          'All',
          activeUser.organizationId,
          {
            entityId: activeUser.entityId,
            locationId: activeUser.locationId,
            entityName: activeUser.entity.entityName,
          },
          false,
        );
        result.push(value);
      }
      return result.includes(true) ? true : false;
    } catch (err) {
      // }

      throw new InternalServerErrorException(err);
    }
  }

  async auditSettingsData(type, orgId, entity, entityHead) {
    //Entity Head
    //All
    const {
      entityId,
      locationId,
      entityName,
      entityData,
      entityLocation,
      entityDataNames,
    } = entity;
    let auditTypeData;
    if (type === 'MCOE' || type === 'IMS Coordinator') {
      auditTypeData = await this.auditSettingsModel.find({
        organizationId: orgId,
        whoCanSchedule: type,
      });
      return auditTypeData.length > 0 ? true : false;
    } else {
      if (entityHead === true) {
        const locations = ['All', locationId];
        // auditTypeData = await this.auditSettingsModel.find({
        //   organizationId: orgId,
        //   whoCanSchedule: { $in: type },
        //   'schedulingUnit.id': 'All',
        //   deleted:false
        // });

        // if(auditTypeData.length ===0){
        //   auditTypeData = await this.auditSettingsModel.find({
        //     organizationId: orgId,
        //     whoCanSchedule: { $in: type },
        //     'schedulingEntity.id': {$in:entityData},
        //     deleted:false
        //   });
        //   return auditTypeData.length > 0 ? true : false;
        // }
        // return auditTypeData.length > 0 ? true : false;
        auditTypeData = await this.auditSettingsModel.find({
          organizationId: orgId,
          whoCanSchedule: { $in: type },
          'schedulingUnit.id': 'All',
          schedulingEntity: { $exists: false },
          deleted: false,
        });
        if (auditTypeData?.length == 0) {
          auditTypeData = await this.auditSettingsModel.find({
            organizationId: orgId,
            whoCanSchedule: { $in: type },
            'schedulingUnit.id': 'All',
            'schedulingEntity.entityName': { $in: entityDataNames },
            deleted: false,
          });

          if (auditTypeData?.length === 0) {
            auditTypeData = await this.auditSettingsModel.find({
              organizationId: orgId,
              whoCanSchedule: { $in: type },
              'schedulingUnit.id': { $in: entityLocation },
              'schedulingEntity.id': { $in: entityData },
              deleted: false,
            });
          }

          if (auditTypeData?.length === 0) {
            auditTypeData = await this.auditSettingsModel.find({
              organizationId: orgId,
              whoCanSchedule: 'All',
              deleted: false,
            });
          }
        }

        return auditTypeData.length > 0 ? true : false;
      } else {
        auditTypeData = await this.auditSettingsModel.find({
          organizationId: orgId,
          whoCanSchedule: type,
        });
        return auditTypeData.length > 0 ? true : false;
      }
    }
  }

  async getDeptHeadForEntity(id) {
    if (id != undefined) {
      const users = await this.prisma.entity.findFirst({
        where: {
          id: id,
        },
        include: {
          organization: true,
        },
      });
      let usersArray = [];

      for (let user of users.users) {
        const userDetails = await this.prisma.user.findUnique({
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
    const data = await this.prisma.location.findMany({
      where: {
        id: id,
      },
      select: { users: true },
    });

    // Extract unique user IDs from data[0].users
    const userIds = [...new Set(data[0].users.map((user: any) => user.id))];

    // Fetch user details based on the unique user IDs
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });

    return { users };
  }
  async getAllMrsOfLocation(id) {
    const orgId = await this.prisma.location.findFirst({
      where: {
        id: id,
      },
    });

    const roleId = await this.prisma.role.findFirst({
      where: {
        organizationId: orgId.organizationId,
        roleName: 'MR',
      },
    });
    return await this.prisma.user.findMany({
      where: {
        locationId: id,
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
  }

  async getAllMrsOfEntity(id) {
    const orgId = await this.prisma.entity.findFirst({
      where: {
        id: id,
      },
    });

    const roleId = await this.prisma.role.findFirst({
      where: {
        organizationId: orgId.organizationId,
        roleName: 'MR',
      },
    });
    return await this.prisma.user.findMany({
      where: {
        locationId: id,
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
  }
  //mail api independent of create and update data to make it flexible
  async sendMailForHead(user, id, dataUserId) {
    // try {

    const [activeUser, auditSchedule]: any = await Promise.all([
      this.prisma.user.findFirst({
        where: { kcId: user },
        include: { organization: true },
      }),
      this.auditScheduleModel.findById(new ObjectId(id)),
    ]);

    const auditype = await this.auditSettingsModel.findById(
      auditSchedule.auditType,
    );
    let mailreceipients: any = [];
    const MR = await this.getAllMrsOfLocation(auditSchedule.locationId);
    for (let mr of MR) {
      mailreceipients.push(mr);
    }
    const getallentitydata = await this.auditScheduleEntityModel.find({
      auditScheduleId: new ObjectId(id),
    });
    // console.log('getallentitwisedata', getallentitydata);
    // console.log('auditSchedule is draft', auditSchedule.isDraft);
    if (
      getallentitydata.length > 0
      // && auditSchedule?.isDraft === false
    ) {
      for (let rowdata of getallentitydata) {
        const auditorPromises = rowdata.auditor.map(async (userId) => {
          const details = await this.prisma.user.findFirst({
            where: {
              id: userId,
            },
            select: {
              username: true,
              email: true,
            },
          });
          mailreceipients.push(details);
          return details;
        });

        const entityData = await this.prisma.entity.findFirst({
          where: { id: rowdata?.entityId },
        });

        const auditor = await Promise.all(auditorPromises);
        const auditeePromises = rowdata.auditee.map(async (userId) => {
          const details = await this.prisma.user.findFirst({
            where: {
              id: userId,
            },
            select: {
              username: true,
              email: true,
            },
          });
          mailreceipients.push(details);
          return details;
        });
        // console.log('auditors', auditor);
        const auditee = await Promise.all(auditeePromises);
        // console.log('auditee', auditee);
        const formatteddate = new Date(rowdata.time[0]);
        // console.log('formatted date', formatteddate);
        // mailreceipients.push(auditee);
        // mailreceipients.push(auditor);
        let data: any = {
          auditScheduleName: auditSchedule.auditScheduleName,
          entityName: entityData?.entityName,
          auditType: auditype.auditType,
          _id: id,
          auditee: auditee,
          auditor: auditor,
          time: rowdata.time,
          endTime: rowdata?.endTime,
          duration: rowdata?.duration,
        };
        // console.log('dept heads', deptHead);
        //send mail to department heads

        //send mail to auditee and audtors and mr of location
        // console.log('mailReceipients', mailreceipients);
        // for (let user of mailreceipients) {
        const uniqueEmailObjects = mailreceipients.filter(
          (item, index, self) =>
            index === self.findIndex((obj) => obj.email === item.email),
        );
        // console.log(
        //   'uuniqueEmail objects in send mail for head',
        //   uniqueEmailObjects,
        // );

        const result = await sendMailToHeadOnAuditSchedule(
          uniqueEmailObjects,
          data,
          activeUser,
          this.emailService.sendEmailWithInvite,
        );
        // console.log('mail sent to ', user.username);
        // }
      }
    }

    this.logger.log(
      `POST /api/auditSchedule/sendMailToHeadOnAuditSchedule/${id} is successful`,
      '',
    );
    // } catch (error) {
    //   this.logger.error(`/api/senMailToHeadOnAuditSchedule/${id} failed`);
    // }
  }
  async sendMailToTeamLead(data) {
    const { teamLeadId, url, user, scheduleDetails, isUpdate } = data;
    const newUrl = `${process.env.PROTOCOL}://${url}`;

    ///fetch details of teamLead Id
    const teamLead = await this.prisma.user.findFirst({
      where: {
        id: teamLeadId,
        organizationId: user?.organizationId,
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
        id: true,
      },
    });
    //fetch location details based on locationId
    const scheduleLocationDetails = await this.prisma.location.findFirst({
      where: {
        id: scheduleDetails?.locationId,
      },
      select: {
        locationName: true,
        id: true,
      },
    });

    const subject = `Audit Schedule Has Been ${
      isUpdate ? 'Updated' : 'Created'
    }`;
    const html = `
    <p>Hello</p>
    <p>The Audit Schedule Has been ${
      isUpdate ? 'Updated' : 'Created'
    } by the user ${user?.firstname + ' ' + user?.lastname || ''} (${
      user?.email
    })  </p>
    For the Unit : ${scheduleLocationDetails?.locationName}
    For the Finalised Date : ${scheduleDetails?.finalisedDate}
    <p>Please click on the link to view the audit schedule and finalise the auditors and Checklist:</p>
    ${newUrl}
  `;
    this.sendEmail(teamLead?.email, subject, html);
  }

  sendEmail = async (recipient, subject, html) => {
    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendEmail(
          recipient,
          subject,
          '',
          html,
        );
      } else {
        try {
          await sgMail.send({
            to: recipient,
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
        } catch (error) {
          throw error;
        }
      }
    } catch (error) {
      // console.error('Error sending email:', error);
      // console.log('errroror, ', error.response.body);
    }
  };

  async getFinalizedInfoForInbox(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });
      //check if he is there in unithead/imscoordinator,auditors,otherusersplanned by or teamlead
      const audits = await this.auditScheduleEntityModel.find({
        $or: [
          {
            auditors: {
              $elemMatch: { id: activeUser.id },
            },
          },
        ],
      });
      // console.log('audits where i am one of the responsible person', audits);
      let auditPlanData = [];
      for (let au of audits) {
        let auditPlan;
        try {
          auditPlan = await this.auditScheduleModel.findById(
            au?.auditScheduleId,
          );
        } catch (error) {
          throw new InternalServerErrorException();
        }
        const data: any = {
          au,
          auditPlanName: auditPlan?.auditName ? auditPlan.auditName : '',
          // url: `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/audit/auditplan/auditplanform/${au?.auditPlanId}?auditplanunitwiseId=${au._id}`,
        };
        auditPlanData.push(data);
      }
      return auditPlanData;
    } catch (error) {
      return new InternalServerErrorException();
    }
  }
  async createTeamLeadEntry(data) {
    try {
      this.logger.log(
        `POST /api/auditSchedule/createTeamEntry called for the payload${data}`,
        'auditSchedule',
      );
      const result = await this.auditScheduleTeamLead.create(data);
      return result._id;
    } catch (error) {
      this.logger.error(
        `POST /api/auditSchedule/createTeamEntry failed for the payload${data},${error}`,
        'auditSchedule',
      );
    }
  }
  async updateTeamLeadEntry(id) {
    try {
      this.logger.log(
        `PATCH /api/auditSchedule/upateTeamLeadEntry called for the schedule id${id}`,
        'auditSchedule',
      );

      const result = await this.auditScheduleTeamLead.findOne({
        auditScheduleId: id,
      });
      // console.log('result', result);
      const update = await this.auditScheduleTeamLead.findByIdAndUpdate(
        result._id,
        {
          pendingForUpdate: false,
        },
      );
      return update;
    } catch (error) {
      this.logger.error(
        `PATCH /api/auditSchedule/upateTeamLeadEntry called for the schedule id${id} failed,${error}`,
        'auditSchedule',
      );
    }
  }

  async getAuditScheduleInfoForInboxOld(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user },
      include: {
        organization: true,
      },
    });
    const result = await this.auditScheduleTeamLead.find({
      teamLeadId: activeUser.id,
      pendingForUpdate: true,
    });
    // console.log('result', result);
    let auditSchedule = [];
    for (let record of result) {
      // console.log(
      //   'auditscheudle',
      //   record.auditScheduleId,
      //   typeof record.auditScheduleId,
      // );

      const scheduleInfo = await this.auditScheduleModel.findById(
        record.auditScheduleId,
      );

      let url;
      //http://apple.localhost:3000/audit/auditschedule/auditscheduleform/schedule/65fbf804569a970e4dec207b
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/auditschedule/auditscheduleform/schedule/${record?.auditScheduleId}`;
      } else {
        url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/audit/auditschedule/auditscheduleform/schedule/${record?.auditScheduleId}`;
      }
      const data: any = {
        _id: scheduleInfo?._id,
        auditScheduleName: scheduleInfo?.auditScheduleName,
        updatedAt: scheduleInfo?.updatedAt,
        url: url,
      };
      // console.log('scheduleinfo', scheduleInfo);
      auditSchedule.push(data);
    }
    return auditSchedule;
  }

  async getAuditScheduleInfoForInbox(user) {
    // Fetch the active user and their organization details
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user },
      include: {
        organization: true,
      },
    });

    // Find records where the active user is in the auditor or auditee arrays
    const result = await this.auditScheduleEntityModel.find({
      $or: [
        { auditor: { $in: [activeUser.id] } },
        { auditee: { $in: [activeUser.id] } },
      ],
    });

    // console.log('result', result);

    // Initialize the auditSchedule array to collect data
    let auditSchedule = [];

    for (let record of result) {
      // Fetch audit schedule info using the auditScheduleId
      const scheduleInfo = await this.auditScheduleModel.findById(
        record.auditScheduleId,
      );

      let url;
      // Construct the URL based on MAIL_SYSTEM environment variable
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/auditschedule/auditscheduleform/schedule/${record?.auditScheduleId}`;
      } else {
        url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/audit/auditschedule/auditscheduleform/schedule/${record?.auditScheduleId}`;
      }

      // Prepare the data object with required fields
      const data = {
        _id: scheduleInfo?._id,
        auditScheduleName: scheduleInfo?.auditScheduleName,
        updatedAt: scheduleInfo?.updatedAt,
        url: url,
      };

      // Push the data into the auditSchedule array
      auditSchedule.push(data);
    }

    // Remove duplicate entries based on the `_id` field
    const uniqueAuditSchedule = Array.from(
      new Map(
        auditSchedule.map((item) => [item._id.toString(), item]),
      ).values(),
    );

    // Return the formatted unique auditSchedule data
    return uniqueAuditSchedule;
  }

  async getAuditScheduleEntityDataForDropAndDown(user, query) {
    try {
      const query = {};
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      let whereCondition: any = { organizationId: activeUser.organizationId };
      const auditScheduleData = await this.auditScheduleModel.find(
        whereCondition,
      );
      const auditScheduleIds = auditScheduleData?.map((value) => value._id);
      const auditScheduleEntityData = await this.auditScheduleEntityModel.find({
        _id: { $in: auditScheduleIds },
      });

      for (let value of auditScheduleEntityData) {
      }
    } catch (err) {}
  }

  async dropAndAuditPlan(user, data) {
    const {
      auditType,
      system,
      location,
      year,
      auditor,
      auditee,
      auditPlanId,
      entityId,
      date,
      status,
      checklist,
      monthName,
    } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
      include: { organization: true },
    });

    const auditSettingsData = await this.auditSettingsModel.findById(auditType);
    const systemNames = await this.System.find({
      _id: { $in: auditSettingsData?.system },
    }).then((systems) => systems.map((s) => s.name));

    let auditScheduleData = await this.auditScheduleModel.findOne({
      auditPeriod: monthName,
      auditYear: year,
      locationId: location,
      auditType: auditType,
      auditPlanId: auditPlanId,
    });
    const originalDate = new Date(date);
    const newTime = new Date(
      originalDate.getFullYear(),
      originalDate.getMonth(),
      originalDate.getDate(),
      originalDate.getHours(),
      originalDate.getMinutes(),
    );

    const plus30 = new Date(newTime.getTime() + 30 * 60 * 1000);
    const minus30 = new Date(newTime.getTime() - 30 * 60 * 1000);

    const findData = await this.auditScheduleEntityModel.find({
      time: {
        $gte: new Date(minus30.toISOString()),
        $lte: new Date(plus30.toISOString()),
      },
      $or: [{ auditee: { $in: auditee } }, { auditor: { $in: auditor } }],
      // optional: avoid matching itself
      // auditee: { $in: auditee },
      // auditor: { $in: auditor },
      // _id: { $ne: id }, // ignore self during update
    });

    // console.log('Checking between:', minus30.toISOString(), 'and', plus30.toISOString());
    // console.log("time",time)
    // console.log('Conflicts found:', findData.length);

    if (findData.length > 0 && !status) {
      const conflictAuditeeIds = findData.flatMap((item) =>
        item.auditee.filter((id) => auditee.includes(id)),
      );
      const conflictAuditorIds = findData.flatMap((item) =>
        item.auditor.filter((id) => auditor.includes(id)),
      );

      const conflictUserIds = [
        ...new Set([...conflictAuditeeIds, ...conflictAuditorIds]),
      ];

      const conflictingUsers = await this.prisma.user.findMany({
        where: { id: { in: conflictUserIds } },
      });

      const conflictNames = conflictingUsers
        .map((u: any) => `${u.email}`)
        .join(', ');

      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Auditor/Auditee conflict: These users already have schedules around this time - ${conflictNames}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!auditScheduleData) {
      auditScheduleData = await this.auditScheduleModel.create({
        auditScheduleName: `${auditSettingsData.auditType}${systemNames}`,
        auditPeriod: monthName,
        auditYear: year,
        status: 'active',
        createdBy: activeUser.username,
        organizationId: activeUser.organizationId,
        roleId: auditSettingsData.responsibility,
        entityTypeId: JSON.parse(auditSettingsData.scope).id,
        auditPlanId,
        locationId: location,
        useFunctionsForPlanning: false,
        auditNumber: '',
        systemMasterId: system,
        auditType: auditType,
        isDraft: true,
        auditTemplates: checklist,
      });
    }

    const auditScheduleEntityData = await this.auditScheduleEntityModel.create({
      entityId: entityId,
      time: date,
      auditor,
      auditee,
      comments: '',
      deleted: false,
      auditScheduleId: new ObjectId(auditScheduleData._id),
      createdBy: activeUser.username,
      auditTemplates: checklist,
    });

    const [MR, entityHead] = await Promise.all([
      this.getAllMrsOfEntity(entityId),
      this.getDeptHeadForEntity(entityId),
    ]);

    const fetchUserDetails = async (userIds) => {
      return Promise.all(
        userIds.map(async (id) =>
          this.prisma.user.findFirst({
            where: { id },
            select: { username: true, email: true },
          }),
        ),
      );
    };

    const [auditors, auditees] = await Promise.all([
      fetchUserDetails(auditScheduleEntityData.auditor),
      fetchUserDetails(auditScheduleEntityData.auditee),
    ]);

    const entityData = await this.prisma.entity.findFirst({
      where: { id: entityId },
    });

    let mailRecipients: any = [...auditors, ...auditees, ...MR, activeUser];

    mailRecipients = mailRecipients.filter(
      (user, index, self) =>
        user?.email && index === self.findIndex((u) => u.email === user.email),
    );

    const mailData = {
      entityName: entityData?.entityName,
      auditScheduleName: auditScheduleData.auditScheduleName,
      auditType: auditSettingsData?.auditType,
      _id: auditScheduleData?._id,
      auditee: auditees,
      auditor: auditors,
      time: auditScheduleEntityData.time,
    };

    try {
      await sendMailToHeadOnAuditSchedule(
        mailRecipients,
        mailData,
        activeUser,
        this.emailService.sendEmail,
      );
      return 'succesfully created Audit Schedule';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBoardData(user, data) {
    try {
      // ['Completed','OverDue','Schedule']
      const { auditType, location, system, year, auditPeriod, myAudit } = data;
      let finalResult = [
        { label: 'Scheduled', data: [] },
        {
          label: 'Completed',
          data: [],
        },
        { label: 'OverDue', data: [] },
      ];
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
        include: { organization: true },
      });
      let pipeline = [];
      let whereCondition: any = { organizationId: activeUser.organizationId };
      if (auditType !== undefined && auditType !== 'All') {
        whereCondition = { ...whereCondition, auditType };
      }

      if (
        location !== undefined &&
        location !== 'undefined' &&
        location !== 'All'
      ) {
        whereCondition = { ...whereCondition, locationId: location };
      }

      if (year !== undefined) {
        whereCondition = { ...whereCondition, auditYear: year };
      }

      if (myAudit === 'true') {
        whereCondition = {
          ...whereCondition,
          organizationId: activeUser.organizationId,
        };
      }

      const auditScheduleData = await this.auditScheduleModel.find(
        whereCondition,
      );

      const auditScheduleIds = auditScheduleData?.map((value) => value._id);
      if (auditPeriod !== 'All') {
        pipeline = [
          {
            // Match documents with the specified auditScheduleIds
            $match: {
              auditScheduleId: { $in: auditScheduleIds },
            },
          },
          {
            // Convert the date string to a date object
            $addFields: {
              dateObj: {
                $dateFromString: {
                  dateString: '$time',
                  format: '%Y-%m-%dT%H:%M',
                },
              },
            },
          },
          {
            // Extract the month number from the date object
            $addFields: {
              monthNumber: { $month: '$dateObj' },
            },
          },
          {
            // Map the month number to the month name
            $addFields: {
              monthName: {
                $arrayElemAt: [
                  [
                    '',
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ],
                  '$monthNumber',
                ],
              },
            },
          },
          // {
          //   // Filter by the month name
          //   $match: {
          //     monthName: auditPeriod,
          //   },
          // },
          {
            // Optionally, you can remove the temporary fields
            $project: {
              dateObj: 0,
              monthNumber: 0,
            },
          },
        ];
      } else {
        pipeline = [
          {
            // Match documents with the specified auditScheduleIds
            $match: {
              auditScheduleId: { $in: auditScheduleIds },
            },
          },
        ];
      }

      // Execute the aggregation pipeline

      const auditScheduleEntityData =
        await this.auditScheduleEntityModel.aggregate(pipeline);

      for (let value of auditScheduleEntityData) {
        const givenTime = new Date(value?.time);
        const currentTime = new Date();
        const auditScheduleDatas = auditScheduleData.find(
          (item) => item._id.toString() === value.auditScheduleId.toString(),
        );
        const auditPlanData = await this.auditPlan.findById(
          auditScheduleDatas?.auditPlanId,
        );

        // const auditPlanEntityData = asdfdsf
        const auditPlanEntityData = await this.auditPlanEntityWise.find({
          auditPlanId: auditPlanData?._id,
        });

        let [
          entityData,
          auditReportdata,
          auditeeData,
          auditorData,
          systemData,
          ,
        ]: any = await Promise.all([
          this.prisma.entity.findFirst({
            where: { id: value.entityId },
          }),
          this.auditModel.findOne({
            auditScheduleId: value?.auditScheduleId,
            auditedEntity: value?.entityId,
          }),
          this.prisma.user.findMany({
            where: { id: { in: value?.auditee } },
            select: { firstname: true, lastname: true },
          }),
          this.prisma.user.findMany({
            where: { id: { in: value?.auditor } },
            select: { firstname: true, lastname: true },
          }),
          this.System.find({
            _id: { $in: auditScheduleDatas?.systemMasterId },
          }),
        ]);
        const auditTypeData = await this.auditSettingsModel.findById(
          auditPlanData?.auditType,
        );
        let auditPlanEntityDatafind;
        if (
          JSON.parse(auditTypeData?.scope).id === 'Unit' ||
          JSON.parse(auditTypeData?.scope).id === 'corpFunction'
        ) {
          auditPlanEntityDatafind = auditPlanEntityData.find(
            (item) => item?.entityId === auditScheduleDatas?.locationId,
          );
        } else {
          auditPlanEntityDatafind = auditPlanEntityData.find(
            (item) => item?.entityId === value?.entityId,
          );
        }

        const monthData = await this.monthDecide(
          auditPlanEntityDatafind?.auditschedule,
          activeUser?.organization,
        );

        auditeeData = auditeeData
          ?.map((value) => {
            return `${value?.firstname} ${value?.lastname}`;
          })
          .join(' , ');
        auditorData = auditorData
          ?.map((value) => {
            return `${value?.firstname} ${value?.lastname}`;
          })
          .join(' , ');
        if (auditReportdata !== null) {
          finalResult.forEach((item) => {
            if (item.label === 'Completed') {
              item.data.push({
                ...value,
                lable: 'Completed',
                auditScheduleDatas,
                auditeeData,
                auditorData,
                auditschedule: monthData,
                auditReportId: auditReportdata._id.toString(),
                name: entityData.entityName,
                created: true,
                systems: systemData
                  ?.map((value) => {
                    return value?.name;
                  })
                  .join(' , '),
                // auditScheduledata: value,
              });
            }
          });
          // completed.push(value);
        } else if (givenTime < currentTime) {
          finalResult.forEach((item) => {
            if (item.label === 'OverDue') {
              item.data.push({
                ...value,
                lable: 'OverDue',
                auditScheduleDatas,
                auditeeData,
                auditorData,
                auditschedule: monthData,
                name: entityData.entityName,
                created: false,
                systems: systemData
                  ?.map((value) => {
                    return value?.name;
                  })
                  .join(' , '),
                // auditScheduledata: value,
              });
            }
          });
          // overDue.push(value);
        } else {
          // scheduleData.push(value);

          finalResult.forEach((item) => {
            if (item.label === 'Scheduled') {
              item.data.push({
                ...value,
                lable: 'Scheduled',
                auditScheduleDatas,
                auditeeData,
                auditorData,
                auditschedule: monthData,
                name: entityData.entityName,
                created: false,
                systems: systemData
                  ?.map((value) => {
                    return value?.name;
                  })
                  .join(' , '),
                // auditScheduledata: value,
              });
            }
          });
        }
      }
      return finalResult;
    } catch (err) {}
  }

  async monthDecide(data, organization) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    const secMonth = [
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
      'January',
      'February',
      'March',
    ];
    if (organization.fiscalYearQuarters === 'April - Mar') {
      const result = data
        ?.map((value, index) => {
          if (value === true) {
            return secMonth[index];
          }
        })
        .filter((value) => value !== undefined);

      return result;
    } else {
      const result = data
        ?.map((value, index) => {
          if (value === true) {
            return months[index];
          }
        })
        .filter((value) => value !== undefined);
      return result;
    }
  }

  async getMonthdata(user, data) {
    // try {
    const { system, location, auditType, year, myAudit } = data;

    let finalResult = [];
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    let whereCondition;
    if (location === 'All') {
      whereCondition = {
        // auditType: auditType,
        auditYear: year,
        // systemMasterId: { $in: system },
        organizationId: activeUser.organizationId,
      };
    } else {
      whereCondition = {
        locationId: location,
        // auditType: auditType,
        auditYear: year,
        // systemMasterId: { $in: system },
        organizationId: activeUser.organizationId,
      };
    }

    if (system !== undefined && system?.length > 0) {
      whereCondition = { ...whereCondition, systemMasterId: { $in: system } };
    }
    if (auditType !== 'All') {
      whereCondition = { ...whereCondition, auditType: auditType };
    }

    if (myAudit === 'true') {
      whereCondition = {
        organizationId: activeUser.organizationId,
        auditYear: year,
      };
    }
    let auditScheduleData = await this.auditScheduleModel.find(whereCondition);
    if (myAudit === 'true' && system === undefined) {
      auditScheduleData = auditScheduleData?.map((value) => value._id);
    } else {
      auditScheduleData = auditScheduleData
        ?.filter((item: any) =>
          item.systemMasterId.every((value) => system?.includes(value)),
        )
        .map((value) => value._id);
    }

    for (let value of auditScheduleData) {
      let secWhereCondition: any = { auditScheduleId: value._id };
      if (myAudit === 'true') {
        secWhereCondition = {
          ...secWhereCondition,
          $or: [
            { auditor: { $in: [activeUser?.id] } },
            { auditee: { $in: [activeUser?.id] } },
          ],
        };
      }
      let auditEntityWiseData = await this.auditScheduleEntityModel.find(
        secWhereCondition,
      );
      auditEntityWiseData?.map((value: any) => {
        const monthName = new Date(value.time).getMonth();
        const monthNames = [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July',
          'August',
          'September',
          'October',
          'November',
          'December',
        ];
        finalResult.push(monthNames[monthName], 'All');
      });
    }

    return [...new Set(finalResult)];
    // } catch (err) {}
  }

  async getAccessTokenMsCal(code) {
    const getMsCalContents = await this.prisma.connectedApps.findFirst({
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
    const redirectUri =
      process.env.PROTOCOL + '://' + process.env.REDIRECT + '/calRedirect';

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
      &redirect_uri=${redirectUri}`,
    });

    const data = await response.json();
    return data.access_token;
  }

  async createCalendarEvent(urlData: any, user) {
    const { code, state, error, auditSchId } = urlData;
    if (auditSchId) {
      const accessToken = await this.getAccessTokenMsCal(code);
      const scheduleData = await this.auditScheduleEntityModel.find({
        auditScheduleId: new ObjectId(auditSchId),
      });
      const auditSchData = await this.auditScheduleModel.findById(auditSchId);

      for (let schedule of scheduleData) {
        const time: any = schedule.time;
        const startDate = new Date(time);
        let endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + 30);
        const formattedStartDateTime = startDate.toISOString().slice(0, 19);
        const formattedEndDateTime = endDate.toISOString().slice(0, 19);

        const allAttendees = [...schedule.auditor, ...schedule.auditee];

        const transformedAttendees = [];
        for (const attendeeId of allAttendees) {
          const user = await this.prisma.user.findFirst({
            where: {
              id: attendeeId,
            },
          });
          transformedAttendees.push({
            emailAddress: {
              address: user.email,
              name: user.firstname + ' ' + user.lastname,
            },
            type: 'required',
          });
        }

        const eventData = {
          subject: auditSchData.auditScheduleName,
          start: {
            dateTime: formattedStartDateTime,
            timeZone: 'UTC',
          },
          end: {
            dateTime: formattedEndDateTime,
            timeZone: 'UTC',
          },
          attendees: transformedAttendees,
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
      }
    }
  }

  async getAuditorAndAuditeeAvaibility(data, user) {
    const { time, auditor, auditee } = data;
    // Fetch active user
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    function getTimeWithOffsetUTC(time, offsetMinutes) {
      // Parse the input time explicitly as UTC
      const baseTime = new Date(`${time}:00Z`); // Adding 'Z' treats it as UTC

      // Calculate the new time by adding/subtracting offset in milliseconds
      return new Date(baseTime.getTime() + offsetMinutes * 60 * 1000);
    }

    // Parse input time and calculate the range
    const inputTime = '2024-11-28T08:08'; // Example time
    const timePlus30 = getTimeWithOffsetUTC(inputTime, 30);
    const timeMinus30 = getTimeWithOffsetUTC(inputTime, -30);

    // Mongoose query to find records within the time range
    const auditScheduleEntityData = await this.auditScheduleEntityModel.find({
      createdAt: {
        $gte: '2024-11-30T14:36:00.000Z', // Records created after or at this time
        $lte: '2024-11-30T16:36:00.000Z', // Records created before or at this time
      },
    });
    // Initialize result
    let result: any = { time };

    // Process fetched data
    if (auditScheduleEntityData.length > 0) {
      for (let i of auditScheduleEntityData) {
        // Filter auditor data
        const auditorData = i.auditor.filter((value: any) =>
          value.includes(auditor),
        );
        result = { ...result, auditor: auditorData };

        // Filter auditee data
        const auditeeData = i.auditee.filter((value: any) =>
          value.includes(auditee),
        );
        result = { ...result, auditee: auditeeData };
      }
    }

    return result;
  }

  async updateAuditScheduleEntityData(data, id, userId) {
    try {
      const { auditee, auditor, time, comment, status } = data;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      // Normalize and parse time to strip seconds & milliseconds
      const originalDate = new Date(time);
      const newTime = new Date(
        originalDate.getFullYear(),
        originalDate.getMonth(),
        originalDate.getDate(),
        originalDate.getHours(),
        originalDate.getMinutes(),
      );

      const plus30 = new Date(newTime.getTime() + 30 * 60 * 1000);
      const minus30 = new Date(newTime.getTime() - 30 * 60 * 1000);

      const findData = await this.auditScheduleEntityModel.find({
        time: {
          $gte: new Date(minus30.toISOString()),
          $lte: new Date(plus30.toISOString()),
        },
        $or: [{ auditee: { $in: auditee } }, { auditor: { $in: auditor } }],
        _id: { $ne: id }, // optional: avoid matching itself
        // auditee: { $in: auditee },
        // auditor: { $in: auditor },
        // _id: { $ne: id }, // ignore self during update
      });

      // console.log('Checking between:', minus30.toISOString(), 'and', plus30.toISOString());
      // console.log("time",time)
      // console.log('Conflicts found:', findData.length);

      if (findData.length > 0 && !status) {
        const conflictAuditeeIds = findData.flatMap((item) =>
          item.auditee.filter((id) => auditee.includes(id)),
        );
        const conflictAuditorIds = findData.flatMap((item) =>
          item.auditor.filter((id) => auditor.includes(id)),
        );

        const conflictUserIds = [
          ...new Set([...conflictAuditeeIds, ...conflictAuditorIds]),
        ];

        const conflictingUsers = await this.prisma.user.findMany({
          where: { id: { in: conflictUserIds } },
        });

        const conflictNames = conflictingUsers
          .map((u: any) => `${u.email}`)
          .join(', ');

        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: `Auditor/Auditee conflict: These users already have schedules around this time - ${conflictNames}`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const updateData = await this.auditScheduleEntityModel.findByIdAndUpdate(
        id,
        {
          auditor,
          auditee,
          time: newTime.toISOString(), // store clean time
          comments: comment,
          updatedBy: activeUser.id,
        },
        { new: true },
      );

      setImmediate(() => {
        this.sendMailtoDateChange(
          {
            ...data,
            auditScheduleId: updateData?.auditScheduleId,
            entityId: updateData.entityId,
          },
          activeUser,
        );
      });

      return updateData;
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to update audit schedule. Please try again later.',
          error: err.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendMailtoDateChange(data: any, user) {
    // try {
    const userIds = [...data.auditee, ...data.auditor, user.id];
    const entityData = await this.prisma.entity.findFirst({
      where: { id: data.entityId },
    });
    const userdetails = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(userIds)] } },
    });
    const emails: any = userdetails?.map((item) => item?.email);
    const auditors = userdetails?.filter((item) =>
      data.auditor.includes(item.id),
    );
    const auditees = userdetails?.filter((item) =>
      data.auditee.includes(item.id),
    );

    const auditScheduleData = await this.auditScheduleModel.findById(
      data.auditScheduleId,
    );
    // console.log("auditScheduleData",auditScheduleData)
    const auditType = await this.auditSettingsModel.findById(
      auditScheduleData.auditType,
    );

    function formatDate(dateString) {
      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }
    await sendMailForChangeAuditDate(
      emails,
      {
        ...data,
        time: data.time,
        entityName: entityData.entityName,
        auditor: auditors,
        auditee: auditees,
        ...auditScheduleData.toObject(),
        auditType: auditType?.auditType,
      },
      user,
      this.emailService.sendEmail,
    );
    // } catch (err) {}
  }

  async deleteAuditScheduleById(id, userId) {
    try {
      const result = await this.auditScheduleEntityModel.findByIdAndDelete(id);
      // console.log("result",result)
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      setImmediate(() => {
        this.sendMailtodeleteateChange(result, activeUser);
      });
      return 'successfully deleted';
    } catch (err) {}
  }

  async sendMailtodeleteateChange(data: any, user) {
    // try {
    const userIds = [...data?.auditee, ...data.auditor, user.id];
    const entityData = await this.prisma.entity.findFirst({
      where: { id: data.entityId },
    });
    const userdetails = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(userIds)] } },
    });
    const emails: any = userdetails?.map((item) => item?.email);
    const auditors = userdetails?.filter((item) =>
      data.auditor.includes(item.id),
    );
    const auditees = userdetails?.filter((item) =>
      data.auditee.includes(item.id),
    );
    function formatDate(dateString) {
      const date = new Date(dateString);

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }
    await sendMailForDeleteAuditSchedule(
      emails,
      {
        ...data,
        time: data.time,
        entityName: entityData.entityName,
        auditor: auditors,
        auditee: auditees,
      },
      user,
      this.emailService.sendEmail,
    );
    // } catch (err) {}
  }

  async getMonthByPlannedData(query, user) {
    const { type, location, year } = query;

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user?.id },
      include: { organization: true },
    });

    if (!activeUser || !type || !location || !year) return [];

    const whereCondition: any = {
      organizationId: activeUser.organizationId,
      location,
      auditType: type,
      auditYear: year,
    };

    const auditPlanData = await this.auditPlan.find(whereCondition);
    const auditPlanIds = auditPlanData.map((ele) => ele._id);

    const auditPlanEntityData = await this.auditPlanEntityWise.find({
      auditPlanId: { $in: auditPlanIds },
    });

    const entityData = await this.prisma.entity.findMany({
      where: {
        id: { in: auditPlanEntityData.map((ele) => ele.entityId) },
      },
    });

    const auditScheduleData = await this.auditScheduleModel.find({
      auditPlanId: { $in: auditPlanIds },
    });

    const auditScheduleEntityData = await this.auditScheduleEntityModel.find({
      auditScheduleId: { $in: auditScheduleData?.map((ele) => ele?._id) },
    });

    const auditReportData = await this.auditModel.find({
      auditScheduleId: {
        $in: auditScheduleData.map((ele) => ele._id?.toString()),
      },
    });

    const findingsData = await this.ncModel.find({
      audit: { $in: auditReportData.map((ele) => ele._id) },
    });

    const auditScheduleMap = new Map(
      auditScheduleData.map((item) => [item._id?.toString(), item]),
    );

    const auditReportMap = new Map(
      auditReportData.map((item) => [item.auditScheduleId?.toString(), item]),
    );

    const entityMap = new Map(entityData.map((e) => [e.id, e]));

    // Month mapping based on fiscal year
    const calendarMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const fiscalMonths = [
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
      'January',
      'February',
      'March',
    ];

    const monthsList =
      activeUser.organization.fiscalYearQuarters === 'April - Mar'
        ? fiscalMonths
        : calendarMonths;

    const resultMap = new Map();

    for (const item of auditPlanEntityData) {
      const entity = entityMap.get(item.entityId);
      if (!entity || !item.auditschedule || !Array.isArray(item.auditschedule))
        continue;

      const entityName = entity.entityName;
      const key = entityName;
      // console.log("entityName",entityName)
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          entityName: key,
          totalPlanned: 0,
          totalScheduled: 0,
          totalCompleted: 0,
          findings: 0,
          months: [],
        });
      }

      const group = resultMap.get(key);

      item.auditschedule.forEach((isPlanned, index) => {
        if (!isPlanned) return;

        const month = monthsList[index] || 'Unknown';

        // Find schedule matching entityId and month
        const scheduled = auditScheduleData.find(
          (s: any) =>
            s.auditPlanId === item.auditPlanId?.toString() &&
            s.auditPeriod === month,
        );
        const scheduledData = auditScheduleEntityData.find(
          (ele: any) =>
            ele?.auditScheduleId.toString() === scheduled?._id.toString() &&
            ele?.entityId === item.entityId,
        );

        const completed: any = scheduled
          ? auditReportData.find(
              (rep) =>
                rep.auditScheduleId?.toString() === scheduled._id?.toString(),
            )
          : null;

        const scheduledDate = scheduledData?.time
          ? new Date(scheduled.createdAt).toLocaleDateString('en-GB')
          : '-';

        const completedDate = completed?.createdAt
          ? new Date(completed.createdAt).toLocaleDateString('en-GB')
          : '-';

        const findingsCount = completed
          ? findingsData.filter(
              (f) => f.audit.toString() === completed._id?.toString(),
            ).length
          : 0;

        // Accumulate
        group.totalPlanned += 1;
        if (scheduledDate !== '-') group.totalScheduled += 1;
        if (completedDate !== '-') group.totalCompleted += 1;
        group.findings += findingsCount;

        group.months.push({
          month,
          scheduled: scheduledDate,
          complete: completedDate,
        });

        // console.log('group', group);
      });
    }

    return Array.from(resultMap.values());
  }

  // Optional: helper to reverse fiscal index to calendar month index
}
