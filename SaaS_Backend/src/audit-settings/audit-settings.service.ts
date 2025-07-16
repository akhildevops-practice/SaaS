import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  AuditSettingsSchema,
  AuditSettings,
} from './schema/audit-settings.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PrismaService } from 'src/prisma.service';
import { AuditFocusArea } from './schema/audit-focusarea.schema';
import { AuditorProfile } from './schema/audit-auditorprofile.schema';
import { Proficiency } from './schema/audit-proficiency.schema';
import { AuditFindings } from './schema/audit-findings.schema';
import { Logger } from 'winston';
import { RolesModule } from 'src/roles/roles.module';
import { RolesService } from 'src/roles/roles.service';
import { AnyCnameRecord } from 'node:dns';
import { entity } from 'src/organization/dto/business-config.dto';
import { ImpactSchema, Impact } from './schema/impact.schema';
@Injectable()
export class AuditSettingsService {
  constructor(
    @InjectModel(AuditSettings.name)
    private auditSettingsModel: Model<AuditSettings>,
    @InjectModel(AuditFocusArea.name)
    private auditFocusAreaModel: Model<AuditFocusArea>,
    @InjectModel(Proficiency.name)
    private ProficiencyModel: Model<Proficiency>,
    @InjectModel(AuditorProfile.name)
    private auditorProfileModel: Model<AuditorProfile>,
    @InjectModel(AuditFindings.name)
    private auditFindingsModel: Model<AuditFindings>,
    @InjectModel(Impact.name)
    private impactModel: Model<Impact>,
    private prisma: PrismaService,
    private rolesService: RolesService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async create(data, user) {
    try {
      const create = await this.auditSettingsModel.create(data);
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createFocusArea(data, user) {
    try {
      const create = await this.auditFocusAreaModel.create(data);
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createProficiency(data, user) {
    try {
      const create = await this.ProficiencyModel.create(data);
      return create;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createAuditorProfile(data, user, res) {
    try {
      const auditTypeArr = data.auditType
        .filter((item: any) => {
          if (Object.keys(item.item).length > 0) {
            return item.item;
          }
        })
        .map((item: any) => item.item);

      const userInfo = await this.prisma.user.findFirst({
        where: { id: data.auditorName.id },
      });
      const roles = await this.prisma.role.findFirst({
        where: {
          organizationId: userInfo.organizationId,
          roleName: 'AUDITOR',
        },
      });

      if (!userInfo.roleId.includes(roles.id)) {
        await this.checkAndAddAuditorRole(
          data.auditorName,
          data.organizationId,
          user,
          res,
        );
      }
      const create = await this.auditorProfileModel.create({
        ...data,
        auditType: auditTypeArr,
      });
      res.send(create);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async checkAndAddAuditorRole(user, orgId, userInfo, res) {
    const auditorRoleId = await this.prisma.role.findFirst({
      where: { roleName: 'AUDITOR', organizationId: orgId },
    });
    const userDetails = await this.prisma.user.findFirst({
      where: { id: user.id },
    });

    //   {
    //     "users": "clp7tveav0012urbwh3veztnz",
    //     "rolesData": {
    //         "id": "clp6vz2zm0007ure4au9xf5tw",
    //         "roleName": "AUDITOR",
    //         "isEdit": true
    //     }
    // }
    const userData = {
      users: user.id,
      rolesData: { id: auditorRoleId.id, roleName: auditorRoleId.roleName },
    };
    await this.rolesService.updateRoleTest('', userData, userInfo);
  }
  async createAuditFindings(data, uuid) {
    this.logger.log(
      `trace id = ${uuid} Creating Audit Finding`,
      'AuditSettingsService',
    );
    try {
      const create = await this.auditFindingsModel.create(data);
      this.logger.log(
        `trace id = ${uuid} Successfully Created Audit Finding ${create}`,
        'AuditTrialService',
      );
      return create;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} Exception occured while Creating Audit Findings`,
        'AuditSettingsService',
      );
    }
  }

  async fetchLocationForAuditProfile(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const finalresult = await this.auditorProfileModel
        .find({ organizationId: activeUser.organizationId })
        .distinct('unit');

      const locationData = await this.prisma.location.findMany({
        where: {
          locationName: { in: finalresult },
          organizationId: activeUser.organizationId,
        },
        select: { id: true, locationName: true },
      });
      locationData.sort((a: any, b: any) =>
        a.locationName
          .toLowerCase()
          .localeCompare(b.locationName.toLowerCase()),
      );
      locationData.sort((a: any, b: any) =>
        a.locationName
          .toLowerCase()
          .localeCompare(b.locationName.toLowerCase()),
      );
      return locationData;
    } catch (err) {}
  }

  async getAll(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });

      const getAllAuditStngs = await this.auditSettingsModel
        .find({
          organizationId: activeUser.organizationId,
          deleted: false,
        })
        .sort({ auditType: 1 })
        .exec();
      getAllAuditStngs.sort((a: any, b: any) =>
        a.auditType.toLowerCase().localeCompare(b.auditType.toLowerCase()),
      );
      const finalResult = await getAllAuditStngs.map(async (value) => {
        const data = {
          id: value._id,
          auditType: value.auditType,
          auditTypeId: value.auditTypeId,
          scope: value.scope,
          responsibility: value.responsibility,
          planType: value.planType,
          auditorCheck: value.auditorCheck,
          allowConsecutive: value.allowConsecutive,
          auditorsFromSameUnit: value.auditorsFromSameUnit,
          auditorsFromSameDept: value.auditorsFromSameDept,
          inductionApproval: value.inductionApproval,
          Description: value.Description,
          organizationId: value.organizationId,
          AutoAcceptNC: value.AutoAcceptNC,
          ClosureRemindertoDeptHead: value.ClosureRemindertoDeptHead,
          ClosureRemindertoMCOE: value.ClosureRemindertoMCOE,
          VerificationOwner: value.VerificationOwner,
          AuditeeReminder: value.AuditeeReminder,
          EscalationtoDepartmentHead: value.EscalationtoDepartmentHead,
          EscalationtoMCOE: value.EscalationtoMCOE,
          whoCanPlan: value.whoCanPlan,
          whoCanSchedule: value.whoCanSchedule,
          planningUnit: value.planningUnit,
          planningEntity: value.planningEntity,
          schedulingEntity: value.schedulingEntity,
          schedulingUnit: value.schedulingUnit,
          multipleEntityAudit: value?.multipleEntityAudit || false,
        };
        return data;
      });
      const result = await Promise.all(finalResult);
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getAllClone(userId, query) {
    try {
      const { search, skip, limit, selectedScope } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });
      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deleted: false,
      };

      if (search !== '' && search !== undefined && search !== 'undefined') {
        whereCondition = {
          ...whereCondition,
          auditType: { $regex: search, $options: 'i' },
        };
      }
      const getAllAuditStngs = await this.auditSettingsModel
        .find(whereCondition)
        .skip((skip - 1) * limit)
        .sort({ auditType: 1 })
        .limit(limit)
        .exec();

      const countData = await this.auditSettingsModel.countDocuments(
        whereCondition,
      );
      const finalResult = await getAllAuditStngs.map(async (value) => {
        const data = {
          id: value._id,
          auditType: value.auditType,
          auditTypeId: value.auditTypeId,
          scope: value.scope,
          responsibility: value.responsibility,
          planType: value.planType,
          auditorCheck: value.auditorCheck,
          allowConsecutive: value.allowConsecutive,
          auditorsFromSameUnit: value.auditorsFromSameUnit,
          auditorsFromSameDept: value.auditorsFromSameDept,
          inductionApproval: value.inductionApproval,
          Description: value.Description,
          organizationId: value.organizationId,
          AutoAcceptNC: value.AutoAcceptNC,
          ClosureRemindertoDeptHead: value.ClosureRemindertoDeptHead,
          ClosureRemindertoMCOE: value.ClosureRemindertoMCOE,
          VerificationOwner: value.VerificationOwner,
          AuditeeReminder: value.AuditeeReminder,
          EscalationtoDepartmentHead: value.EscalationtoDepartmentHead,
          EscalationtoMCOE: value.EscalationtoMCOE,
          whoCanPlan: value.whoCanPlan,
          whoCanSchedule: value.whoCanSchedule,
          planningUnit: value.planningUnit,
          planningEntity: value.planningEntity,
          schedulingEntity: value.schedulingEntity,
          schedulingUnit: value.schedulingUnit,
        };
        return data;
      });
      const result = await Promise.all(finalResult);
      return { data: result, count: countData };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllScopesData(useId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: useId.id },
      });

      const result = await this.auditSettingsModel.find({
        organizationId: activeUser.organizationId,
      });

      const scopeData = [];
      for (let value of result) {
        if (
          value.scope !== '' &&
          value.scope !== null &&
          value.scope !== undefined
        )
          scopeData.push(JSON.parse(value.scope));
      }
      const uniqueArray = Array?.from(
        new Map(scopeData?.map((item) => [item?.id, item])).values(),
      );

      return uniqueArray;
    } catch (err) {}
  }

  async getAllFocusArea(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getAllAuditStngs = await this.auditFocusAreaModel
        .find({
          organizationId: activeUser.organizationId,
        })
        .exec();

      const finalResult = await getAllAuditStngs.map(async (value) => {
        const data = {
          id: value._id,
          auditFocus: value.auditFocus,
          // areas: value.areas.map((name) => ({ name })),
          areas: value.areas,
          organizationId: value.organizationId,
        };
        return data;
      });
      const result = await Promise.all(finalResult);
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getAllProficiencies(userId, query) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    const { skip, limit } = query;
    const getAllProficiency = await this.ProficiencyModel.find({
      organizationId: activeUser.organizationId,
    })
      .sort({ proficiency: 1 })
      .skip((skip - 1) * limit)
      .limit(limit);

    const countData = await this.ProficiencyModel.countDocuments({
      organizationId: activeUser.organizationId,
    });
    const finalResult = await getAllProficiency.map(async (value) => {
      const data = {
        id: value._id,
        proficiency: value.proficiency,
        description: value.description,
        organizationId: value.organizationId,
      };
      return data;
    });
    const result = await Promise.all(finalResult);
    return { data: result, count: countData };
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
  }

  async getAllAuditorProfiles(userId, data) {
    try {
      const { page, limit, selectedUnit, selectedSystem, search, selectedDpt } =
        data;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId.id,
        },
      });

      let userIdData = [];

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
      };

      if (
        selectedUnit !== undefined &&
        selectedUnit !== 'undefined' &&
        selectedUnit.length > 0
      ) {
        const auditorId = await this.prisma.role.findFirst({
          where: {
            roleName: 'AUDITOR',
            organizationId: activeUser.organizationId,
          },
        });

        const user = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            roleId: { has: auditorId.id },
            locationId: { in: selectedUnit },
          },
        });
        const userIds = user.map((value) => value.id);
        userIdData = [...userIdData, ...userIds];
        // whereCondition = { ...whereCondition, unit: { $in: selectedUnit } };
      }

      if (
        selectedSystem !== undefined &&
        selectedSystem !== 'undefined' &&
        selectedSystem.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          'systemExpertise.id': { $in: selectedSystem },
        };
      }

      if (
        selectedDpt !== undefined &&
        selectedDpt !== 'undefined' &&
        selectedDpt.length > 0 &&
        selectedUnit?.length > 0
      ) {
        const auditorId = await this.prisma.role.findFirst({
          where: {
            roleName: 'AUDITOR',
            organizationId: activeUser.organizationId,
          },
        });

        const user = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            roleId: { has: auditorId.id },
            entityId: { in: selectedDpt },
          },
        });
        const userIds = user.map((value) => value.id);
        userIdData = [...userIds];
        // whereCondition = {
        //   ...whereCondition,
        //   'auditorName.id': { $in: userIds },
        // };
      }

      if (userIdData.length > 0) {
        whereCondition = {
          ...whereCondition,
          'auditorName.id': { $in: userIdData },
        };
      }
      if (search !== undefined && search !== 'undefined' && search !== '') {
        whereCondition = {
          ...whereCondition,
          $or: [
            { 'auditorName.username': { $regex: search, $options: 'i' } },
            { unit: { $regex: search, $options: 'i' } },
          ],
        };
      }

      const getAllAuditStngs: any = await this.auditorProfileModel
        .find(whereCondition)
        .skip((page - 1) * limit)
        .limit(limit);
      const countData = await this.auditorProfileModel.countDocuments(
        whereCondition,
      );
      const finalResult = [];

      for (let value of getAllAuditStngs) {
        const locationData = await this.prisma.user.findFirst({
          where: { id: value.auditorName.id },
          include: { location: true, entity: true },
        });

        //         id
        // "clp7tvox70015urbwtpycgg3c"
        // username
        // "a1"
        // locationName
        // "Bengaluru"
        // locationid
        // "clp7thpfj0009urbwd6726csg"
        // entityId
        // "clp7tncwh000wurbwst4u87ky"
        // entityName
        // "Rolling"

        const auditNameNew = {
          id: value.auditorName.id,
          username: value.auditorName.username,
          locationName: locationData.location.locationName,
          locationid: locationData.location.id,
          entityId: locationData?.entity?.entityId || '',
          entityName: locationData?.entity?.entityName || '',
        };

        if (userId.kcRoles.roles.includes('ORG-ADMIN')) {
          const data = {
            id: value._id,
            auditorName: auditNameNew,
            unit: locationData?.location?.locationName || '',
            systemExpertise: value.systemExpertise,
            inLead: value.inLead,
            proficiencies: value.proficiencies,
            access: true,
            certifications: value.certifications,
            organizationId: value.organizationId,
            functionproficiencies: value.functionproficiencies,
            auditType: value.auditType,
          };
          finalResult.push(data);
        } else if (
          userId.kcRoles.roles.includes('MR') &&
          (activeUser.locationId === value.auditorName.locationid ||
            activeUser?.additionalUnits?.includes(
              value?.auditorName?.locationid,
            ))
        ) {
          const data = {
            id: value._id,
            auditorName: auditNameNew,
            unit: value.unit,
            systemExpertise: value.systemExpertise,
            inLead: value.inLead,
            proficiencies: value.proficiencies,
            access: true,
            certifications: value.certifications,
            organizationId: value.organizationId,
            functionproficiencies: value.functionproficiencies,
            auditType: value.auditType,
          };
          finalResult.push(data);
        } else {
          const data = {
            id: value._id,
            auditorName: auditNameNew,
            unit: value.unit,
            systemExpertise: value.systemExpertise,
            inLead: value.inLead,
            proficiencies: value.proficiencies,
            access: false,
            certifications: value.certifications,
            organizationId: value.organizationId,
            functionproficiencies: value.functionproficiencies,
            auditType: value.auditType,
          };
          finalResult.push(data);
        }
      }

      return { data: finalResult, length: countData };
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getAllAuditFindings(userId, uuid) {
    this.logger.log(
      `trace id = ${uuid} Getting All Audit Findings`,
      'AuditSettingsService',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getAllAuditFindings = await this.auditFindingsModel
        .find({
          organizationId: activeUser.organizationId,
        })
        .exec();

      this.logger.log(
        `trace id = ${uuid} Successfully Retrieved All Audit Findings`,
        'AuditTrialService',
      );
      return getAllAuditFindings;
    } catch {
      this.logger.error(
        `trace id = ${uuid} Exception occured while Getting Audit Findings`,
        'AuditSettingsService',
      );
    }
  }

  async getSingle(id, userId) {
    const finalResult = await this.auditSettingsModel.findById({
      _id: id,
    });
    return {
      id: finalResult._id,
      auditType: finalResult.auditType,
      auditTypeId: finalResult.auditTypeId,
      scope: finalResult.scope,
      responsibility: finalResult.responsibility,
      planType: finalResult.planType,
      auditorCheck: finalResult.auditorCheck,
      allowConsecutive: finalResult.allowConsecutive,
      multipleEntityAudit: finalResult?.multipleEntityAudit,
      auditorsFromSameUnit: finalResult.auditorsFromSameUnit,
      auditorsFromSameDept: finalResult.auditorsFromSameDept,
      inductionApproval: finalResult.inductionApproval,
      Description: finalResult.Description,
      organizationId: finalResult.organizationId,
      system: finalResult?.system || [],
      AutoAcceptNC: finalResult.AutoAcceptNC,
      ClosureRemindertoDeptHead: finalResult.ClosureRemindertoDeptHead,
      ClosureRemindertoMCOE: finalResult.ClosureRemindertoMCOE,
      VerificationOwner: finalResult.VerificationOwner,
      AuditeeReminder: finalResult.AuditeeReminder,
      EscalationtoDepartmentHead: finalResult.EscalationtoDepartmentHead,
      EscalationtoMCOE: finalResult.EscalationtoMCOE,
      whoCanPlan: finalResult.whoCanPlan,
      whoCanSchedule: finalResult.whoCanSchedule,
      planningUnit: finalResult.planningUnit,
      planningEntity: finalResult.planningEntity,
      schedulingEntity: finalResult.schedulingEntity,
      schedulingUnit: finalResult.schedulingUnit,
      useFunctionsForPlanning: finalResult.useFunctionsForPlanning,
      maxSections: finalResult.maxSections,
      auditTimeFrame: finalResult.auditTimeFrame,
      noOfSopQuestions: finalResult.noOfSopQuestions,
      noOfFindingsQuestions: finalResult.noOfFindingsQuestions,
      noOfOperationQuestions: finalResult.noOfOperationQuestions,
      noOfHiraQuestions: finalResult.noOfHiraQuestions,
      noOfAspImpQuestions: finalResult.noOfAspImpQuestions,
      resolutionWorkFlow: finalResult?.resolutionWorkFlow || '',
    };
  }

  async getSingleFocusArea(id, userId) {
    const finalResult = await this.auditFocusAreaModel.findById({
      _id: id,
    });
    return {
      id: finalResult._id,
      auditFocus: finalResult.auditFocus,
      areas: finalResult.areas,
      organizationId: finalResult.organizationId,
    };
  }

  async getProficiency(id, userId) {
    const finalResult = await this.ProficiencyModel.findById({
      _id: id,
    });
    return {
      id: finalResult._id,
      proficiency: finalResult.proficiency,
      description: finalResult.description,
      organizationId: finalResult.organizationId,
    };
  }

  async getSingleAuditorProfile(id, userId) {
    const finalResult: any = await this.auditorProfileModel.findById({
      _id: id,
    });

    const locationName = await this.prisma.user.findFirst({
      where: {
        id: finalResult.auditorName.id,
      },
      include: { location: true, entity: true },
    });
    return {
      id: finalResult._id,
      auditorName: finalResult.auditorName,
      unit: locationName?.location?.locationName || '',
      systemExpertise: finalResult.systemExpertise,
      proficiencies: finalResult.proficiencies,
      functionproficiencies: finalResult.functionproficiencies,
      certifications: finalResult.certifications,
      inLead: finalResult.inLead,
      organizationId: finalResult.organizationId,
      auditType: finalResult.auditType,
    };
  }

  async deleteAuditType(id, userId) {
    try {
      const data: any = {
        deleted: true,
      };
      const deleteAuditType = await this.auditSettingsModel.findByIdAndUpdate(
        id,
        data,
      );
      return `Audit Type deleted Sucessfully`;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async deleteAuditFocusArea(id, userId) {
    try {
      const deleteAuditFocusArea =
        await this.auditFocusAreaModel.findByIdAndDelete(id);
      return `Audit Focus Area deleted Sucessfully`;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async deleteProficiency(id, userId) {
    try {
      const deleteProficiency = await this.ProficiencyModel.findByIdAndDelete(
        id,
      );
      return `Proficiency deleted Sucessfully`;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async deleteAuditorProfile(id, userId, res) {
    // try {
    const activeUser: any = await this.auditorProfileModel.findById(id);
    const auditorRole = await this.prisma.role.findFirst({
      where: { organizationId: activeUser.organizationId, roleName: 'AUDITOR' },
    });

    const userInfo = await this.prisma.user.findFirst({
      where: {
        organizationId: activeUser.organizationId,
        id: activeUser.auditorName.id,
      },
    });

    if (userInfo.roleId.includes(auditorRole.id)) {
      await this.checkAndAddAuditorRole(
        activeUser.auditorName,
        activeUser.organizationId,
        userId,
        res,
      );
    }

    const deleteAuditorProfile =
      await this.auditorProfileModel.findByIdAndDelete(id);
    res.send(`Auditor Profile deleted Sucessfully`);
    // } catch (e) {
    //   throw new InternalServerErrorException(e.message);
    // }
  }

  async deleteAuditFindings(id, uuid) {
    this.logger.log(
      `trace id = ${uuid} Deleting Audit Finding ID = ${id}`,
      'AuditSettingsService',
    );
    try {
      const deleteAuditFindings =
        await this.auditFindingsModel.findByIdAndDelete(id);
      this.logger.log(
        `trace id = ${uuid} Successfully Deleted Audit Finding ID = ${id}`,
        'AuditTrialService',
      );
      return `Audit Findings deleted Sucessfully`;
    } catch {
      this.logger.error(
        `trace id = ${uuid} Exception occured while Deleting Audit Finding ID = ${id}`,
        'AuditSettingsService',
      );
    }
  }

  async updateAuditType(auditTypesId, userId, data) {
    const {
      auditType,
      auditTypeId,
      auditor,
      Description,
      scope,
      responsibility,
      planType,
      system,
      auditorCheck,
      allowConsecutive,
      auditorsFromSameUnit,
      auditorsFromSameDept,
      inductionApproval,
      AutoAcceptNC,
      ClosureRemindertoDeptHead,
      ClosureRemindertoMCOE,
      VerificationOwner,
      AuditeeReminder,
      EscalationtoDepartmentHead,
      EscalationtoMCOE,
      resolutionWorkFlow,
      whoCanPlan,
      whoCanSchedule,
      planningUnit,
      multipleEntityAudit,
      planningEntity,
      schedulingEntity,
      schedulingUnit,
      useFunctionsForPlanning,
      maxSections,
      auditTimeFrame,
      noOfSopQuestions,
      noOfFindingsQuestions,
      noOfOperationQuestions,
      noOfHiraQuestions,
      noOfAspImpQuestions,
    } = data;
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const updateAuditType = await this.auditSettingsModel.findByIdAndUpdate(
        auditTypesId,
        {
          auditType,
          auditTypeId,
          scope,
          responsibility,
          planType,
          auditor,
          auditorCheck,
          system,
          allowConsecutive,
          auditorsFromSameUnit,
          multipleEntityAudit,
          resolutionWorkFlow,
          auditorsFromSameDept,
          inductionApproval,
          useFunctionsForPlanning,
          Description,
          AutoAcceptNC,
          ClosureRemindertoDeptHead,
          ClosureRemindertoMCOE,
          VerificationOwner,
          AuditeeReminder,
          EscalationtoDepartmentHead,
          EscalationtoMCOE,
          planningUnit,
          planningEntity,
          schedulingEntity,
          schedulingUnit,
          whoCanPlan,
          whoCanSchedule,
          maxSections,
          auditTimeFrame,
          noOfSopQuestions,
          noOfFindingsQuestions,
          noOfOperationQuestions,
          noOfHiraQuestions,
          noOfAspImpQuestions,
        },
      );
      return 'Audit Type updated successfully';
    } catch (error) {
      throw new Error('Failed to update audit Type');
    }
  }

  async updateAuditFocusArea(FocusAreaId, userId, data) {
    const { auditFocus, areas } = data;
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const updateAuditFocusArea =
        await this.auditFocusAreaModel.findByIdAndUpdate(FocusAreaId, {
          auditFocus,
          areas,
        });
      return 'Focus Area updated successfully';
    } catch (error) {
      throw new Error('Failed to update focus area');
    }
  }

  async updateProficiency(ProficiencyId, userId, data) {
    const { proficiency, description } = data;
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const updateProficiency = await this.ProficiencyModel.findByIdAndUpdate(
        ProficiencyId,
        {
          proficiency,
          description,
        },
      );
      return 'Proficiency updated successfully';
    } catch (error) {
      throw new Error('Failed to update Proficiency');
    }
  }

  async updateAuditorProfile(auditorProfileId, userId, data, res) {
    const {
      auditorName,
      unit,
      systemExpertise,
      proficiencies,
      functionproficiencies,
      allowedAuditTypes,
      auditType,
      inLead,
      certifications,
    } = data;
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
    });
    const userInfo = await this.prisma.user.findFirst({
      where: { id: auditorName.id },
    });
    const auditorRole = await this.prisma.role.findFirst({
      where: { organizationId: orgId.organizationId, roleName: 'AUDITOR' },
    });
    if (!userInfo.roleId.includes(auditorRole.id)) {
      await this.checkAndAddAuditorRole(
        auditorName,
        orgId.organizationId,
        userId,
        res,
      );
    }
    try {
      const updateAuditFocusArea =
        await this.auditorProfileModel.findByIdAndUpdate(auditorProfileId, {
          auditorName,
          unit,
          systemExpertise,
          functionproficiencies,
          allowedAuditTypes,
          auditType,
          proficiencies,
          inLead,
          certifications,
        });
      // return 'auditor profile updated successfully';
      res.send('auditor profile updated successfully');
    } catch (error) {
      throw new Error('Failed to update focus area');
    }
  }

  async isValidAuditSettingName(text, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      if (text !== 'undefined') {
        const result = await this.auditSettingsModel.find({
          organizationId: activeUser.organizationId,
          auditType: { $regex: new RegExp(`^${text}$`, 'i') },
          deleted: false,
        });
        if (result.length > 0) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateAuditFindings(auditFindingsId, data, uuid) {
    this.logger.log(
      `trace id = ${uuid} Updating Audit Finding ID = ${auditFindingsId}`,
      'AuditSettingsService',
    );
    try {
      const {
        findingType,
        findingTypeId,
        selectClause,
        accept,
        autoAccept,
        correctiveAction,
        auditorVerification,
        reject,
        closureBy,
        comments,
      } = data;

      const updateAuditFindings =
        await this.auditFindingsModel.findByIdAndUpdate(auditFindingsId, {
          findingType,
          findingTypeId,
          selectClause,
          accept,
          autoAccept,
          correctiveAction,
          auditorVerification,
          reject,
          closureBy,
          comments,
        });

      const updatedFinding = await this.auditFindingsModel.findById(
        auditFindingsId,
      );

      this.logger.log(
        `trace id = ${uuid} Successfully Updated Audit Finding ID = ${auditFindingsId}`,
        'AuditTrialService',
      );
      return updatedFinding;
    } catch {
      this.logger.error(
        `trace id = ${uuid} Exception occured while Updating Audit Finding ID = ${auditFindingsId}`,
        'AuditSettingsService',
      );
    }
  }

  async getAuditReportOptionData(id, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      const auditFindsData = await this.auditFindingsModel.find({
        organizationId: activeUser.organizationId,
        auditTypeId: id,
      });
      return auditFindsData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserPermissionBasedAuditTypes(user) {
    try {
      let auditType = [];
      let auditTypeWithEntityData = [];
      let functionSpocData = [];
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { entity: true },
      });
      const rolesCondition = await this.findRolesOfUser({
        ...activeUser,
        roles: user.kcRoles.roles,
      });

      const finalRoles = rolesCondition.filter(
        (value) => value !== 'Entity Head' && value !== 'Function SPOC',
      );
      auditType = await this.auditSettingsModel.find({
        organizationId: activeUser.organizationId,
        whoCanPlan: { $in: finalRoles },
        deleted: false,
      });
      if (rolesCondition.includes('Entity Head')) {
        const entityData = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            users: { has: activeUser.id },
          },
        });

        let entityIds = entityData.map((value) => value.id);
        let entityDataNames = entityData.map((value) => value.entityName);
        let entityLocation = entityData.map((value) => value.locationId);
        // auditTypeWithEntityData
        const firstData = await this.auditSettingsModel.find({
          organizationId: activeUser.organizationId,
          whoCanPlan: 'Entity Head',
          'planningUnit.id': 'All',
          planningEntity: { $exists: false },
          deleted: false,
        });
        if (firstData?.length > 0) {
          firstData.map((value) => {
            auditTypeWithEntityData.push(value);
          });
        }
        const secondData = await this.auditSettingsModel.find({
          whoCanPlan: 'Entity Head',
          'planningUnit.id': 'All',
          'planningEntity.entityName': { $in: entityDataNames },
          deleted: false,
        });
        if (secondData?.length > 0) {
          secondData.map((value) => {
            auditTypeWithEntityData.push(value);
          });
        }

        const thirdData = await this.auditSettingsModel.find({
          whoCanPlan: 'Entity Head',
          'planningUnit.id': { $in: entityLocation },
          'planningEntity.id': { $in: entityIds },
          deleted: false,
        });

        if (thirdData?.length > 0) {
          thirdData.map((value) => {
            auditTypeWithEntityData.push(value);
          });
        }
      }

      if (rolesCondition.includes('Function SPOC')) {
        const functionData = await this.prisma.functions.findMany({
          where: { functionSpoc: { has: activeUser.id } },
        });
        const functionIds = functionData?.map((value) => value.unitId);
        const firstData = await this.auditSettingsModel.find({
          organizationId: activeUser.organizationId,
          whoCanPlan: 'Function SPOC',
          'planningUnit.id': { $in: ['All', ...functionIds] },
          deleted: false,
        });
        if (firstData?.length > 0) {
          firstData.map((value) => {
            functionSpocData.push(value);
          });
        }
      }
      const finalData = [
        ...auditType,
        ...auditTypeWithEntityData,
        ...functionSpocData,
      ];
      const finalResult = await finalData.map(async (value) => {
        const data = {
          id: value._id,
          auditType: value.auditType,
          auditTypeId: value.auditTypeId,
          scope: value.scope,
          system: value?.system || [],
          responsibility: value.responsibility,
          planType: value.planType,
          auditorCheck: value.auditorCheck,
          allowConsecutive: value.allowConsecutive,
          auditorsFromSameUnit: value.auditorsFromSameUnit,
          auditorsFromSameDept: value.auditorsFromSameDept,
          inductionApproval: value.inductionApproval,
          Description: value.Description,
          organizationId: value.organizationId,
          AutoAcceptNC: value.AutoAcceptNC,
          ClosureRemindertoDeptHead: value.ClosureRemindertoDeptHead,
          ClosureRemindertoMCOE: value.ClosureRemindertoMCOE,
          VerificationOwner: value.VerificationOwner,
          AuditeeReminder: value.AuditeeReminder,
          EscalationtoDepartmentHead: value.EscalationtoDepartmentHead,
          EscalationtoMCOE: value.EscalationtoMCOE,
          whoCanPlan: value.whoCanPlan,
          whoCanSchedule: value.whoCanSchedule,
          planningUnit: value.planningUnit,
          planningEntity: value.planningEntity,
          schedulingEntity: value.schedulingEntity,
          schedulingUnit: value.schedulingUnit,
          useFunctionsForPlanning: value.useFunctionsForPlanning,
        };
        return data;
      });

      return Promise.all(finalResult);
    } catch {}
  }

  async getUserPermissionBasedAuditTypesSchedule(user) {
    // try {
    let auditType = [];
    let auditTypeWithEntityData = [];
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: { entity: true },
    });
    const rolesCondition = await this.findRolesOfUser({
      ...activeUser,
      roles: user.kcRoles.roles,
    });
    const finalRoles = rolesCondition.filter(
      (value) => value !== 'Entity Head',
    );
    auditType = await this.auditSettingsModel.find({
      organizationId: activeUser.organizationId,
      whoCanSchedule: { $in: finalRoles },
    });
    if (rolesCondition.includes('Entity Head')) {
      const entityData = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          users: { has: activeUser.id },
        },
      });

      let entityIds = entityData.map((value) => value.id);
      let entityDataNames = entityData.map((value) => value.entityName);
      let entityLocation = entityData.map((value) => value.locationId);
      // auditTypeWithEntityData
      const firstData = await this.auditSettingsModel.find({
        organizationId: activeUser.organizationId,
        whoCanSchedule: 'Entity Head',
        'schedulingUnit.id': 'All',
        schedulingEntity: { $exists: false },
        deleted: false,
      });

      if (firstData?.length > 0) {
        firstData.map((value) => {
          auditTypeWithEntityData.push(value);
        });
      }
      const secondData = await this.auditSettingsModel.find({
        whoCanSchedule: 'Entity Head',
        'schedulingUnit.id': 'All',
        'schedulingEntity.entityName': { $in: entityDataNames },
        deleted: false,
      });

      if (secondData?.length > 0) {
        secondData.map((value) => {
          auditTypeWithEntityData.push(value);
        });
      }

      const thirdData = await this.auditSettingsModel.find({
        whoCanSchedule: 'Entity Head',
        'schedulingUnit.id': { $in: entityLocation },
        'schedulingEntity.id': { $in: entityIds },
        deleted: false,
      });
      if (thirdData?.length > 0) {
        thirdData.map((value) => {
          auditTypeWithEntityData.push(value);
        });
      }
    }

    const finalData = [...auditType, ...auditTypeWithEntityData];
    const finalResult = await finalData.map(async (value) => {
      const data = {
        id: value._id,
        auditType: value.auditType,
        auditTypeId: value.auditTypeId,
        scope: value.scope,
        system: value?.system || [],
        responsibility: value.responsibility,
        planType: value.planType,
        auditorCheck: value.auditorCheck,
        allowConsecutive: value.allowConsecutive,
        auditorsFromSameUnit: value.auditorsFromSameUnit,
        auditorsFromSameDept: value.auditorsFromSameDept,
        inductionApproval: value.inductionApproval,
        Description: value.Description,
        organizationId: value.organizationId,
        AutoAcceptNC: value.AutoAcceptNC,
        ClosureRemindertoDeptHead: value.ClosureRemindertoDeptHead,
        ClosureRemindertoMCOE: value.ClosureRemindertoMCOE,
        VerificationOwner: value.VerificationOwner,
        AuditeeReminder: value.AuditeeReminder,
        EscalationtoDepartmentHead: value.EscalationtoDepartmentHead,
        EscalationtoMCOE: value.EscalationtoMCOE,
        whoCanPlan: value.whoCanPlan,
        whoCanSchedule: value.whoCanSchedule,
        planningUnit: value.planningUnit,
        planningEntity: value.planningEntity,
        schedulingEntity: value.schedulingEntity,
        schedulingUnit: value.schedulingUnit,
        useFunctionsForPlanning: value?.useFunctionsForPlanning,
      };
      return data;
    });

    return Promise.all(finalResult);
    // } catch {}
  }

  async findRolesOfUser(data) {
    let roles = [];
    roles.push('All');

    if (data.roles.includes('ORG-ADMIN')) {
      roles.push('MCOE');
    }
    if (data.roles.includes('MR')) {
      roles.push('IMS Coordinator');
    }

    const entityData = await this.prisma.entity.findMany({
      where: { organizationId: data.organizationId, users: { has: data.id } },
    });

    const functionSpoc = await this.prisma.functions.findMany({
      where: {
        organizationId: data.organizationId,
        functionSpoc: { has: data.id },
      },
    });

    if (functionSpoc?.length > 0) {
      roles.push('Function SPOC');
    }
    if (data.entity.users.includes(data.id) || entityData.length > 0) {
      roles.push('Entity Head');
    }

    return roles;
  }

  async getAuditorsBasedOnFilters(user, text) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const auditType = await this.auditorProfileModel.find({
        organizationId: activeUser.organizationId,
      });
      const auditorsIds: any = auditType.map(
        (value: any) => value?.auditorName?.id,
      );
      let auditorList;
      if (user.kcRoles.roles.includes('ORG-ADMIN')) {
        auditorList = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { notIn: auditorsIds },
            email: { contains: text, mode: 'insensitive' },
          },
          include: { location: true, entity: true },
        });
      } else if (user.kcRoles.roles.includes('MR')) {
        auditorList = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            locationId: {
              in: [activeUser?.locationId, ...activeUser?.additionalUnits],
            },
            id: { notIn: auditorsIds },
            email: { contains: text, mode: 'insensitive' },
          },
          include: { location: true, entity: true },
        });
      }

      return auditorList;
    } catch (err) {}
  }

  async getFindingsForAuditTypeAndFilterType(user, auditTypeId, type) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    const findings = await this.auditFindingsModel
      .find({
        auditTypeId: auditTypeId,
        findingType: { $ne: JSON.parse(JSON.stringify(type)) },
      })
      .select('findingType');
    return findings;
  }

  async getDepartmentForAudit(user, params) {
    try {
      let { scope, location } = params;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      let whereCondition: any = {
        organizationId: activeUser.organizationId,
      };
      // if (scope == 'Unit') {
      whereCondition = { ...whereCondition, locationId: location };
      // } else {
      //   whereCondition = { ...whereCondition, entityTypeId: scope };
      // }
      let result: any = await this.prisma.entity.findMany({
        where: whereCondition,
        select: { id: true, entityName: true },
      });

      result = result?.map((item: any) => ({
        id: item.id,
        lable: item?.entityName,
        name: item?.entityName,
        value: item?.entityName,
      }));
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getuserFromDept(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let result: any = await this.prisma.user.findMany({
        where: { entityId: id },
        select: { id: true, email: true },
      });
      result = result?.map((item: any) => ({
        id: item.id,
        lable: item?.email,
        name: item?.email,
        value: item?.email,
      }));
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getSystemOptions(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const result = await this.auditorProfileModel.find({
        organizationId: activeUser.organizationId,
      });
      let systemData = [];
      for (let value of result) {
        systemData.push(...value.systemExpertise);
      }
      const uniqueArray = Array?.from(
        new Map(systemData?.map((item) => [item?.id, item])).values(),
      );

      uniqueArray.sort((a: any, b: any) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
      );

      return uniqueArray;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async fetchDepartmentForAuditProfile(user, query) {
    try {
      const { unit } = query;
      if (unit?.length > 0) {
        const activeUser = await this.prisma.user.findFirst({
          where: { kcId: user.id },
        });
        const auditorId = await this.prisma.role.findFirst({
          where: {
            roleName: 'AUDITOR',
            organizationId: activeUser.organizationId,
          },
        });

        let userData: any = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            roleId: { has: auditorId.id },
            locationId: { in: unit },
          },
          include: { entity: true },
        });
        userData = userData.map((item: any) => ({
          id: item.entity.id,
          name: item.entity.entityName,
        }));

        const uniqueData = userData.filter(
          (item, index, self) =>
            index === self.findIndex((t) => t.id === item.id),
        );

        uniqueData.sort((a: any, b: any) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
        );
        return uniqueData;
      } else {
        return [];
      }
    } catch (err) {}
  }

  async getAllImpact(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.impactModel.find({
        organizationId: activeUser.organizationId,
      });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async createImpact(data, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const { impactType, impact } = data;
      const result = await this.impactModel.create({
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
        impact,
        impactType,
      });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateImpact(data, id, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const { impactType, impact } = data;
      const result = await this.impactModel.findByIdAndUpdate(id, {
        $set: {
          impact,
          impactType,
          updatedBy: activeUser.id,
        },
      });
      return result;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async deleteImpact(id, user) {
    const result = await this.impactModel.findByIdAndDelete(id);
    return result;
  }
}
