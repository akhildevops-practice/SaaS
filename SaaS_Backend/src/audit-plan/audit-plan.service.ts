import {
  ConsoleLogger,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now } from 'mongoose';
import { PrismaService } from 'src/prisma.service';
import { AuditPlan } from './schema/auditPlan.schema';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { AuditPlanEntityWise } from './schema/auditplanentitywise.schema';
import { newRoles } from 'src/utils/roles.global';
import { AuditSettings } from 'src/audit-settings/schema/audit-settings.schema';
// import { AuditorProfile } from 'src/audit-settings/schema/audit-auditorprofile.schema';
// import {sendMailToHeadOnAuditPlan} from '.email.helper.ts'
import { sendMailToHeadOnAuditPlan } from './helper/email.helper';

// import { ObjectUnsubscribedError } from 'rxjs';
import { ObjectId } from 'bson';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common/exceptions';
import {
  AuditorProfileSchema,
  AuditorProfile,
} from 'src/audit-settings/schema/audit-auditorprofile.schema';
import { AuditPlanUnitWise } from './schema/auditPlanUnitwiseSchema';
import * as sgMail from '@sendgrid/mail';
const moment = require('moment');
import { EmailService } from 'src/email/email.service';
import {
  filterAuditorBasedOnDepartment,
  filterAuditorBasedOnFilterBySystem,
  filterBasedOnDept,
  filterBasedScopeUnit,
  getAllAuditorsBasedFilters,
  getAllAuditorsBasedLocationFilters,
  validateAuditorBasedOnAuditorProfile,
  filterAuditorBasedOnFilterByLocationFunction,
  filterAuditorBasedOnFilterByProficiencies,
} from 'src/audit-schedule/utils';
import { AuditDocument, Audit } from 'src/audit/schema/audit.schema';
import { AuditSchedule } from 'src/audit-schedule/schema/auditSchedule.schema';
import { AuditScheduleEntityWise } from 'src/audit-schedule/schema/auditScheduleEntityWise.schema';
import { stat } from 'fs';
import { entity } from 'src/organization/dto/business-config.dto';
import { Logger } from 'winston';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { secureHeapUsed } from 'crypto';
sgMail.setApiKey(process.env.SMTP_PASSWORD);
@Injectable()
export class AuditsPlanService {
  constructor(
    @InjectModel(AuditPlan.name) private auditPlanModel: Model<AuditPlan>,
    @InjectModel(Audit.name) private readonly auditModel: Model<AuditDocument>,

    @InjectModel(AuditSchedule.name)
    private auditScheduleModel: Model<AuditSchedule>,
    @InjectModel(AuditScheduleEntityWise.name)
    private auditScheduleEntityModel: Model<AuditScheduleEntityWise>,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(AuditSettings.name)
    private readonly auditSettings: Model<AuditSettings>,
    @InjectModel(AuditPlanEntityWise.name)
    private auditPlanEntityWiseModel: Model<AuditPlanEntityWise>,
    private readonly prisma: PrismaService,
    @InjectModel(AuditorProfile.name)
    private auditorProfile: Model<AuditorProfile>,
    @InjectModel(AuditPlanUnitWise.name)
    private auditPlanUnitwiseModel: Model<AuditPlanUnitWise>,
    @InjectModel(AuditorProfile.name)
    private auditorProfileModel: Model<AuditorProfile>,
    private readonly emailService: EmailService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async createAuditPlanUnitWise(data) {
    this.logger.log(
      `POST /api/auditPlan/addUnitWiseAuditPlan - Service started`,
      '',
    );

    try {
      const auditUnitWiseData = await this.auditPlanUnitwiseModel.create(data);

      this.logger.log(
        `POST /api/auditPlan/addUnitWiseAuditPlan - Service successful`,
        '',
      );
      return auditUnitWiseData;
    } catch (error) {
      this.logger.error(
        `POST /api/auditPlan/addUnitWiseAuditPlan - Service failed`,
        error.stack || error.message,
      );
      throw new Error('Failed to create audit plan unit-wise'); // safer
    }
  }

  async updateAuditPlanUnitWise(id, data) {
    try {
      this.logger.log(
        `PATCH /api/auditPlan/updateAuditPlanUnitWise/${id} - Service started`,
        '',
      );

      const auditunitwisedata =
        await this.auditPlanUnitwiseModel.findByIdAndUpdate(id, data);
      this.logger.log(
        `PATCH /api/auditPlan/updateAuditPlanUnitWise/${id} - Service Sucessfull`,
        '',
      );
      return auditunitwisedata;
    } catch (error) {
      this.logger.error(
        `PATCH /api/auditPlan/updateAuditPlanUnitWise/${id}  - Service failed`,
        error.stack || error.message,
      );
      return error;
    }
  }
  async getAuditPlanUnitwiseForLocation(id) {
    //here id auditplanentitywiseid
    try {
      this.logger.log(
        `GET /api/auditPlan/getAuditPlanUnitwiseForLocation/${id} - Service started`,
        '',
      );

      const getAllAuditPlans = await this.auditPlanUnitwiseModel.find({
        where: { auditPlanEntitywiseId: id },
      });
      let getauditplan = [];
      for (let audit of getAllAuditPlans) {
        let unithead = await this.fetchUserdetails(audit.unitHead.id);
        let userunithead = {
          id: unithead.id,
          accepted: audit.unitHead.accepted,
          username: unithead.username,
          firstname: unithead.firstname,
          lastname: unithead.lastname,
          email: unithead.email,
          avatar: unithead.avatar,
        };

        let imscoordinator = await this.fetchUserdetails(
          audit.imsCoordinator.id,
        );
        let userimscoordinator = {
          id: imscoordinator.id,
          accepted: audit.imsCoordinator.accepted,
          username: imscoordinator.username,
          firstname: imscoordinator.firstname,
          lastname: imscoordinator.lastname,
          email: imscoordinator.email,
          avatar: imscoordinator.avatar,
        };

        let otherUsersData = [];
        for (let user of audit.otherUsers) {
          let data = await this.fetchUserdetails(user.id); ////////console.log('data', data);
          let userdata = {
            id: data.id,
            accepted: user.accepted,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            avatar: data.avatar,
          };

          otherUsersData.push(userdata);
        }

        let auditorsdata = [];
        for (let user of audit.auditors) {
          let data = await this.fetchUserdetails(user.id);
          let userdata = {
            id: data.id,
            accepted: user.accepted,
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email,
            avatar: data.avatar,
          };

          auditorsdata.push(userdata);
        }
        let data = {
          auditPlanEntitywiseId: audit.auditPlanEntitywiseId,
          organizationId: audit.organizationId,
          plannedBy: audit.plannedBy,
          fromDate: audit.fromDate,
          toDate: audit.toDate,
          comments: audit.comments,
          unithead: userunithead,
          imscoordinator: userimscoordinator,
          otherUsers: otherUsersData,
          auditors: auditorsdata,
        };
        getauditplan.push(data);
      }
      this.logger.log(
        `GET /api/auditPlan/getAuditPlanUnitwiseForLocation/${id} - Service is Successfull`,
        '',
      );
      return getauditplan;
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getAuditPlanUnitwiseForLocation/${id} - Service failed`,
        error.stack || error.message,
      );
      return error;
    }
  }
  async getAuditPlanUnitwiseById(id) {
    //here id auditplanentitywiseid
    try {
      this.logger.log(
        `GET /api/auditPlan/getAuditPlanUnitwiseById/${id} - Service started`,
        '',
      );
      const getauditplan = await this.auditPlanUnitwiseModel.findById(id);

      let unitHead,
        userunithead,
        imsCoordinator,
        userimscoordinator,
        otherUsersData = [],
        auditorsData = [];

      if (!getauditplan) return null;

      if (!!getauditplan?.unitHead?.id) {
        unitHead = await this.fetchUserdetails(getauditplan.unitHead.id);
        userunithead = {
          id: unitHead.id,
          accepted: getauditplan.unitHead.accepted,
          username: unitHead.username,
          firstname: unitHead.firstname,
          lastname: unitHead.lastname,
          email: unitHead.email,
          avatar: unitHead.avatar,
          location: unitHead.location,
        };
      }

      if (!!getauditplan?.imsCoordinator?.id) {
        imsCoordinator = await this.fetchUserdetails(
          getauditplan.imsCoordinator.id,
        );
        userimscoordinator = {
          id: imsCoordinator.id,
          accepted: getauditplan.imsCoordinator.accepted,
          username: imsCoordinator.username,
          firstname: imsCoordinator.firstname,
          lastname: imsCoordinator.lastname,
          email: imsCoordinator.email,
          avatar: imsCoordinator.avatar,
          location: imsCoordinator.location,
        };
      }

      if (!!getauditplan?.otherUsers?.length) {
        for (let user of getauditplan.otherUsers) {
          // if (!user.id) return;
          if (!!user.id) {
            let data = await this.fetchUserdetails(user.id); ////////console.log('data', data);
            let userdata = {
              id: data.id,
              accepted: user.accepted,
              username: data.username,
              firstname: data.firstname,
              lastname: data.lastname,
              email: data.email,
              avatar: data.avatar,
              location: data.location,
            };

            otherUsersData.push(userdata);
          }
        }
      }

      if (!!getauditplan?.auditors?.length) {
        for (let user of getauditplan.auditors) {
          if (!!user.id) {
            let data = await this.fetchUserdetails(user.id);
            let userdata = {
              id: data?.id,
              accepted: user.accepted,
              username: data.username,
              firstname: data.firstname,
              lastname: data.lastname,
              email: data.email,
              avatar: data.avatar,
              location: data.location,
            };

            auditorsData.push(userdata);
          }
        }
      }

      ////////console.log('userunithead', auditorsdata);
      const data = {
        _id: getauditplan._id,
        auditPlanEntitywiseId: getauditplan.auditPlanEntitywiseId,
        organizationId: getauditplan.organizationId,
        plannedBy: getauditplan.plannedBy,
        fromDate: getauditplan.fromDate,
        toDate: getauditplan.toDate,
        comments: getauditplan.comments,
        unithead: userunithead,
        imscoordinator: userimscoordinator,
        otherUsers: otherUsersData,
        auditors: auditorsData,
        auditPlanId: getauditplan.auditPlanId,
        unitId: getauditplan.unitId,
        isDraft: getauditplan.isDraft,
        teamLeadId: getauditplan.teamLeadId,
        auditPeriod: getauditplan?.auditPeriod,
      };
      this.logger.log(
        `GET /api/auditPlan/getAuditPlanUnitwiseById/${id} - Service Sucessfull`,
        '',
      );
      return data;
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getAuditPlanUnitwiseById/${id} - Service failed`,
        error.stack || error.message,
      );
      return error;
    }
  }

  async getAllFinalizedDatesByMonthName(query: any) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllFinalizedDatesByMonthName - Service Started`,
        '',
      );
      const { month, orgId, auditPlanId } = query;
      const auditPlans = await this.auditPlanUnitwiseModel.find({
        auditPeriod: month,
        organizationId: orgId,
        auditPlanId: auditPlanId,
      });

      const groupedResults = {};
      const userIds = new Set();
      const locationIds = new Set();

      // Collect all unique user IDs
      auditPlans.forEach((plan) => {
        if (plan.unitHead?.id) userIds.add(plan.unitHead.id);
        if (plan.imsCoordinator?.id) userIds.add(plan.imsCoordinator.id);
        plan.auditors.forEach((auditor) => userIds.add(auditor.id));
        plan.otherUsers.forEach((user) => userIds.add(user.id));
        if (plan.unitId) locationIds.add(plan.unitId);
      });

      // Convert userIds Set to Array
      const userIdsArray: any = Array.from(userIds);

      // Fetch user details in a single request
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIdsArray } },
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
          username: true,
          location: { select: { id: true, locationName: true } },
        },
      });
      // Fetch location details in a single request
      const locations = await this.prisma.location.findMany({
        where: { id: { in: Array.from(locationIds) as any } },
        select: { locationId: true, id: true, locationName: true },
      });

      // Create a map for quick lookup of user details by ID
      const userMap = new Map(users.map((user) => [user.id, user]));
      const locationMap = new Map(
        locations.map((location) => [location.id, location]),
      );
      // Populate groupedResults with audit plans and user details
      for (const plan of auditPlans) {
        const unitDetails = locationMap.get(plan.unitId);

        const unitHead = plan.unitHead?.id
          ? {
              ...userMap.get(plan.unitHead.id),
              accepted: plan.unitHead.accepted,
            }
          : null;
        const imsCoordinator = plan.imsCoordinator?.id
          ? {
              ...userMap.get(plan.imsCoordinator.id),
              accepted: plan.imsCoordinator.accepted,
            }
          : null;
        const auditors = plan.auditors.map((auditor) => ({
          ...userMap.get(auditor.id),
          accepted: auditor.accepted,
        }));
        const otherUsers = plan.otherUsers.map((user) => ({
          ...userMap.get(user.id),
          accepted: user.accepted,
        }));

        if (!groupedResults[plan.unitId]) {
          groupedResults[plan.unitId] = {
            unitDetails: unitDetails,
            id: plan.unitId,
            auditPlans: [],
          };
        }

        groupedResults[plan.unitId].auditPlans.push({
          _id: plan._id,
          auditPlanEntitywiseId: plan.auditPlanEntitywiseId,
          organizationId: plan.organizationId,
          plannedBy: plan.plannedBy,
          fromDate: plan.fromDate,
          toDate: plan.toDate,
          comments: plan.comments,
          auditPlanId: plan.auditPlanId,
          unitId: plan.unitId,
          unitHead: unitHead,
          imsCoordinator: imsCoordinator,
          auditors: auditors,
          otherUsers: otherUsers,
          isDraft: plan.isDraft,
          teamLeadId: plan.teamLeadId,
          auditPeriod: plan.auditPeriod,
        });
      }
      this.logger.log(
        `GET /api/auditPlan/getAllFinalizedDatesByMonthName - Service Succesfull`,
        '',
      );
      return Object.values(groupedResults);
    } catch (error) {
      this.logger.log(
        `GET /api/auditPlan/getAllFinalizedDatesByMonthName - Service Failed`,
        error.stack || error.message,
      );
      throw new Error(`Failed to fetch audit plans: ${error.message}`);
    }
  }
  async fetchUserdetails(userid) {
    const userdetails = await this.prisma.user.findUnique({
      where: { id: userid },
      // select: {
      //   id: true,
      //   firstname: true,
      //   lastname: true,
      //   email: true,
      //   avatar: true,
      //   username: true,
      // },
      include: { location: { select: { id: true, locationName: true } } },
    });

    return userdetails;
  }

  async getAllMrsOfLocation(id) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllMrsOfLocation/${id} - Service started`,
        '',
      );
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
      this.logger.log(
        `GET /api/auditPlan/getAllMrsOfLocation/${id} - Service Successfull`,
        '',
      );
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
    } catch (error) {
      this.logger.warn(
        `GET /api/auditPlan/getAllMrsOfLocation/${id} - Service failed`,
        '',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllUsersOfLocation(id) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllUsersOfLocation/${id} - Service started`,
        '',
      );

      const users = await this.prisma.user.findMany({
        where: {
          locationId: id,
        },
        include: { location: { select: { id: true, locationName: true } } },
      });

      // Extract all roleIds from users
      let roleIds = [];
      users.forEach((user) => {
        roleIds.push(...user.roleId);
      });
      roleIds = [...new Set(roleIds)]; // Deduplicate roleIds

      // Fetch role names based on the unique roleIds
      const roles = await this.prisma.role.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      });

      // Create a map of roleId to roleName for easy lookup
      const roleIdToRoleName = roles.reduce((acc, role) => {
        acc[role.id] = role.roleName;
        return acc;
      }, {});

      const roleNameMapping = {
        MR: 'IMSC',
        'LOCATION-ADMIN': 'Unit Head',
        'ORG-ADMIN': 'MCOE',
      };

      // Map role names back to users with the desired logic
      const usersWithFilteredRoleNames = users.map((user) => {
        const mappedRoles = user.roleId.map((roleId) => {
          const originalRoleName = roleIdToRoleName[roleId] || 'N/A';
          return roleNameMapping[originalRoleName] || originalRoleName;
        });

        const filteredRoles =
          mappedRoles.includes('IMSC') || mappedRoles.includes('MCOE')
            ? mappedRoles.filter((role) => role === 'IMSC' || role === 'MCOE')
            : ['User'];

        return {
          ...user,
          roleId: filteredRoles,
        };
      });
      this.logger.log(
        `GET /api/auditPlan/getAllUsersOfLocation/${id} - Service Successfull`,
        '',
      );
      return usersWithFilteredRoleNames;
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getAllUsersOfLocation/${id} - Service failed`,
        error.stack || error.message,
      );
    }
  }

  async getAllUsersOfDepartment(id) {
    const users = await this.prisma.user.findMany({
      where: {
        entityId: id,
      },
      include: { entity: { select: { id: true, entityName: true } } },
    });

    return users;
  }

  async getAllFinalizedDatesForAuditPlan(id) {
    // Get all entitywise records for this auditplan
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllFinalizedDatesForAuditPlan/${id} - Service started`,
        '',
      );

      const auditplanentitywise = await this.auditPlanEntityWiseModel
        .find({
          auditPlanId: new ObjectId(id),
        })
        .select('_id entityId');

      let records = [];
      for (let entitydata of auditplanentitywise) {
        let recid = entitydata._id.toString();

        const getallunitwiserecords = await this.auditPlanUnitwiseModel
          .find({
            auditPlanEntitywiseId: recid,
          })
          .select(
            '_id fromDate toDate auditPlanEntitywiseId auditors unitId auditPlanId auditPeriod',
          );

        let data = {
          auditplanunitwiseId: getallunitwiserecords,
          unitId: entitydata.entityId,
          // auditors : auditorsdata
        };

        records.push(data);
      }
      this.logger.log(
        `GET /api/auditPlan/getAllFinalizedDatesForAuditPlan/${id} - Service Sucessfull`,
        '',
      );
      return records;
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getAllFinalizedDatesForAuditPlan/${id} - Service failed`,
        error.stack || error.message,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getLocationForAuditPlan(userid, type) {
    const activeuser = await this.prisma.user.findFirst({
      where: { kcId: userid.id },
    });
    const result = await this.prisma.location.findMany({
      where: {
        organizationId: activeuser.organizationId,
        // user: userid.id,
        deleted: false,
        type,
      },
      orderBy: {
        locationName: 'asc', // Order by entityName in ascending order
      },
      // select: {
      //   id: true,
      //   locationName: true,
      //   locationType: true,
      // },
    });
    return result;
  }
  async getFunction(user, entityTypeId) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    const entity = await this.prisma.entity.findMany({
      where: {
        organizationId: activeUser.organizationId,
        entityTypeId: entityTypeId,
      },
    });

    const functionId = entity
      ?.map((value: any) => value.functionId)
      .filter((value) => value !== null);

    const uniqueIds = [...new Set(functionId)];
    const finalResult = await this.prisma.functions.findMany({
      where: {
        // organizationId: activeUser.organizationId,
        id: { in: uniqueIds },
      },
      select: { id: true, name: true },
    });
    return finalResult;
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }

  async sendMailForAcceptance(data) {
    const { mailUsers, url, auditPlanUnitWiseData, isFinalise } = data;

    //fetch userIds from all the obj, array, unithead, imscoord, auditors, othersusers
    const userIds: any = this.extractUniqueUserIds(auditPlanUnitWiseData);

    const userDetails = await this.prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        firstname: true,
        lastname: true,
        id: true,
        email: true,
      },
    });

    const userMap = new Map(userDetails.map((user) => [user.id, user]));

    const populatedAuditPlanUnitWiseData = {
      ...auditPlanUnitWiseData,
      unitHead: auditPlanUnitWiseData?.unitHead
        ? {
            ...userMap?.get(auditPlanUnitWiseData.unitHead.id),
            ...auditPlanUnitWiseData.unitHead,
          }
        : auditPlanUnitWiseData?.unitHead,
      imsCoordinator: auditPlanUnitWiseData?.imsCoordinator
        ? {
            ...userMap?.get(auditPlanUnitWiseData.imsCoordinator.id),
            ...auditPlanUnitWiseData.imsCoordinator,
          }
        : auditPlanUnitWiseData?.imsCoordinator,
      auditors:
        auditPlanUnitWiseData?.auditors?.map((auditor) =>
          auditor ? { ...userMap?.get(auditor.id), ...auditor } : auditor,
        ) || [],
      otherUsers:
        auditPlanUnitWiseData?.otherUsers?.map((otherUser) =>
          otherUser
            ? { ...userMap?.get(otherUser.id), ...otherUser }
            : otherUser,
        ) || [],
      teamLeadDetails: auditPlanUnitWiseData?.teamLeadId
        ? userMap?.get(auditPlanUnitWiseData.teamLeadId) || null
        : null,
    };

    const newUrl = `${process.env.PROTOCOL}://${url}`;

    const userEmails = mailUsers?.map((userObj: any) => userObj?.email);
    const subject = isFinalise
      ? 'Audit Plan Auditor Dates Has Been Finalised'
      : 'Audit Plan to be reviewed';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          p {
            margin: 10px 0;
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 10px;
            text-align: center;
            font-size: 24px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
          a {
            color: #007bff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            Audit Plan Notification
          </div>
          <p>Hello,</p>
          <p>${
            isFinalise
              ? 'Audit Plan Auditor Dates Has Been Finalised'
              : 'A new audit plan is created and sent for your acceptance.'
          }</p>
          <p>Plan Details:</p>
          <p><strong>Coordinators:</strong></p>
          <p>${populatedAuditPlanUnitWiseData?.unitHead?.firstname} ${
      populatedAuditPlanUnitWiseData?.unitHead?.lastname
    } [Unit Head]</p>
          <p>${populatedAuditPlanUnitWiseData?.imsCoordinator?.firstname} ${
      populatedAuditPlanUnitWiseData?.imsCoordinator?.lastname
    } [IMSC]</p>
          <p><strong>Auditors:</strong></p>
          ${populatedAuditPlanUnitWiseData.auditors
            .map((auditor) => `<p>${auditor.firstname} ${auditor.lastname}</p>`)
            .join('')}
          <p><strong>Other Users:</strong></p>
          ${populatedAuditPlanUnitWiseData.otherUsers
            .map(
              (otherUser) =>
                `<p>${otherUser.firstname} ${otherUser.lastname}</p>`,
            )
            .join('')}
          <p>Please click on the <a href="${newUrl}">link</a> to view the audit plan.</p>
          <div class="footer">
            This email was automatically generated. Please do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
      `;
    this.sendEmail(userEmails, subject, html);
  }
  async sendMailAfterUpdate(data) {
    try {
      this.logger.log(
        `POST /api/auditPlan/sendMailAfterUpdate - Service started`,
        '',
      );
      const { mailUsers, url, auditPlanUnitWiseData, isFinalise } = data;
      const newUrl = `${process.env.PROTOCOL}://${url}`;

      const userEmails = mailUsers?.map((userObj: any) => userObj?.email);
      const userIds: any = this.extractUniqueUserIds(auditPlanUnitWiseData);
      const userDetails = await this.prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          firstname: true,
          lastname: true,
          id: true,
          email: true,
        },
      });
      // console.log("USER DETAILS ---->", userDetails);

      const userMap = new Map(userDetails.map((user) => [user.id, user]));

      const populatedAuditPlanUnitWiseData = {
        ...auditPlanUnitWiseData,
        unitHead: auditPlanUnitWiseData?.unitHead?.id
          ? {
              ...userMap?.get(auditPlanUnitWiseData.unitHead.id),
              ...auditPlanUnitWiseData.unitHead,
            }
          : auditPlanUnitWiseData?.unitHead,
        imsCoordinator: auditPlanUnitWiseData?.imsCoordinator?.id
          ? {
              ...userMap?.get(auditPlanUnitWiseData.imsCoordinator.id),
              ...auditPlanUnitWiseData.imsCoordinator,
            }
          : auditPlanUnitWiseData?.imsCoordinator,
        auditors: Array.isArray(auditPlanUnitWiseData?.auditors)
          ? auditPlanUnitWiseData.auditors.map((auditor) =>
              auditor?.id
                ? { ...userMap?.get(auditor.id), ...auditor }
                : auditor,
            )
          : [],
        otherUsers: Array.isArray(auditPlanUnitWiseData?.otherUsers)
          ? auditPlanUnitWiseData.otherUsers.map((otherUser) =>
              otherUser?.id
                ? { ...userMap?.get(otherUser.id), ...otherUser }
                : otherUser,
            )
          : [],
        teamLeadDetails: auditPlanUnitWiseData?.teamLeadId
          ? userMap?.get(auditPlanUnitWiseData.teamLeadId) || null
          : null,
      };

      const subject = isFinalise
        ? 'Audit Plan Auditor Dates Has Been Finalised'
        : 'Audit Plan to be reviewed';
      const html = `
      <p>Hello,</p>
      <p> ${
        isFinalise
          ? 'Audit Plan Auditor Dates Has Been Finalised'
          : 'Audit plan has been Updated and sent for your acceptance.'
      } </p>
  
      <p>Plan Details:</p>
  
    
    <p>Coordinators:</p>
    <p>${populatedAuditPlanUnitWiseData?.unitHead?.firstname} ${
        populatedAuditPlanUnitWiseData?.unitHead?.lastname
      } [Unit Head]</p>
    <p>${populatedAuditPlanUnitWiseData?.imsCoordinator?.firstname} ${
        populatedAuditPlanUnitWiseData?.imsCoordinator?.lastname
      } [IMSC]</p>
  
    <p>Auditors:</p>
    ${populatedAuditPlanUnitWiseData.auditors
      .map((auditor) => `<p>${auditor.firstname} ${auditor.lastname}</p>`)
      .join('')}
  
    <p>Other Users:</p>
    ${populatedAuditPlanUnitWiseData.otherUsers
      .map((otherUser) => `<p>${otherUser.firstname} ${otherUser.lastname}</p>`)
      .join('')}
      <p>Please click on the link to view the audit plan:</p>
      ${newUrl}
    `;
      this.sendEmail(userEmails, subject, html);
      this.logger.log(
        `POST /api/auditPlan/sendMailAfterUpdate - Service SuccessFull`,
        '',
      );
    } catch (error) {
      this.logger.warn(
        `POST /api/auditPlan/sendMailAfterUpdate - Service Failed`,
        error.stack || error.message,
      );
    }
  }

  async sendConfirmationMail(data) {
    // console.log("data data------", data);
    try {
      this.logger.log(
        `POST /api/auditPlan/sendConfirmationMail - Service started`,
        '',
      );
      const { mailUsers, url, user } = data;
      const newUrl = `${process.env.PROTOCOL}://${url}`;

      const userEmails = mailUsers?.map((userObj: any) => userObj?.email);
      const subject = 'Audit Plan Has Been Accepted / Rejected';
      const html = `
  <p>Hello,</p>
  <p>The Audit Plan Has been ${user?.accepted || ''} by the user ${
        user?.name?.email || ''
      }</p>

  <p>Please click on the link to view the audit plan:</p>
  ${newUrl}
`;
      this.sendEmail(userEmails, subject, html);
      this.logger.log(
        `POST /api/auditPlan/sendConfirmationMail - Service Succesfull`,
        '',
      );
    } catch (error) {
      this.logger.error(
        `POST /api/auditPlan/sendConfirmationMail - Service failed`,
        error.stack || error.message,
      );
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

  async sendMailForHead(user, id) {
    try {
      this.logger.log(
        `POST /api/auditPlan/sendMailForHead/${id} - Service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user },
        include: {
          organization: true,
        },
      });
      let mailreceipients = [];
      const oid = new ObjectId(id);
      // console.log('id', id, typeof id);
      const auditPlan = await this.auditPlanModel.findById(id);
      const auditype = await this.auditSettings.findById(auditPlan.auditType);
      // console.log('audit type', auditype);
      const scopeObject = JSON.parse(auditype.scope);

      const name = scopeObject.name;

      // console.log('name', name);
      if (name === 'Department') {
        const mrs = await this.getAllMrsOfLocation(auditPlan.location);
        const getallentitydata = await this.auditPlanEntityWiseModel.find({
          auditPlanId: oid,
        });
        // console.log('getallentitwisedata', getallentitydata);
        if (getallentitydata.length > 0) {
          for (let rowdata of getallentitydata) {
            const deptHead = await this.getDeptHeadForEntity(rowdata.entityId);
            let data: any = {
              auditName: auditPlan.auditName,
              auditType: auditype.auditType,
              _id: id,
            };

            //send mail to all deptheads
            for (let user of deptHead) {
              const result = await sendMailToHeadOnAuditPlan(
                user,
                data,
                activeUser,
                this.emailService.sendEmail,
              );
            }
            //send mail to all mrs of the location
            for (let user of mrs) {
              const result = await sendMailToHeadOnAuditPlan(
                user,
                data,
                activeUser,
                this.emailService.sendEmail,
              );
            }
          }
        }
      } else if (name === 'Unit') {
        const getallunitwisedata = await this.auditPlanUnitwiseModel.find({
          auditPlanId: id,
        });
        if (getallunitwisedata.length > 0) {
          for (let rowdata of getallunitwisedata) {
            const mrs = await this.getAllMrsOfLocation(rowdata.unitId);
            const locadmin = await this.getLocationAdmin(rowdata.unitId);
            let data: any = {
              auditName: auditPlan.auditName,
              auditType: auditype.auditType,
              _id: id,
            };
            // console.log('locadmin', locadmin);
            for (let user of locadmin.users) {
              const result = await sendMailToHeadOnAuditPlan(
                user,
                data,
                activeUser,
                this.emailService.sendEmail,
              );
            }
            //send mail to all mrs of the location
            for (let user of mrs) {
              const result = await sendMailToHeadOnAuditPlan(
                user,
                data,
                activeUser,
                this.emailService.sendEmail,
              );
            }
          }
        }
      }
      this.logger.log(
        `POST /api/auditPlan/sendMailForHead/${id} - Service Successfull`,
        '',
      );
    } catch (error) {
      this.logger.error(
        `POST /api/auditPlan/sendMailForHead/${id} - Service failed`,
        error.stack || error.message,
      );
    }
  }
  // async getFinalizedDatesAndAuditors(planid, unitid) {
  //   try {
  //     let auditors = [];
  //     const getallunitrecords = await this.auditPlanUnitwiseModel
  //       .find({
  //         auditPlanId: planid,
  //         unitId: unitid,
  //       })
  //       .select('_id auditors fromDate toDate unitId');
  //     return getallunitrecords;
  //   } catch (error) {
  //     throw new NotFoundException();
  //   }
  // }

  async getLocationUserId(uId) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getLocationUserId - Service started`,
        '',
      );

      const userId = await this.prisma.user.findFirst({
        where: {
          kcId: uId,
        },
      });
      const location = await this.prisma.location.findFirst({
        where: {
          user: {
            some: {
              username: userId.username,
            },
          },
          organizationId: userId.organizationId,
        },
        select: {
          id: true,
          locationName: true,
        },
      });
      const result = { ...location, username: userId.username };
      this.logger.log(
        `GET /api/auditPlan/getLocationUserId - Service Sucessfull`,
        '',
      );

      return result;
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getLocationUserId - Service failed`,
        error.stack || error.message,
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllSystemsByOrganisation(userId) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllSystemsByOrganisation - Service started`,
        '',
      );

      const orgId = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      try {
        const systems = await this.prisma.systemType.findMany({
          where: {
            organizationId: orgId.organizationId,
          },
          select: {
            id: true,
            name: true,
          },
        });
        this.logger.log(
          `GET /api/auditPlan/getAllSystemsByOrganisation  - Service Successfully fetched System`,
          '',
        );
        return systems;
      } catch (error) {
        this.logger.error(
          `GET /api/auditPlan/getAllSystemsByOrganisation - Service failed`,
          error.stack || error.message,
        );
        throw new NotFoundException(error);
      }
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getAllSystemsByOrganisation - Service failed`,
        error.stack || error.message,
      );
      throw new NotFoundException(error);
    }
  }

  async getSystemsBySystemType(userId, system) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getSystemsBySystemType - Service started`,
        '',
      );

      const user = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      try {
        const systems = await this.SystemModel.find({
          organizationId: user.organizationId,
          type: system,
        }).select('_id type name');
        // ////////////////console.log('systems', systems);
        this.logger.log(
          `GET /api/auditPlan/getSystemsBySystemType - Service Sucessfull`,
          '',
        );
        return systems;
      } catch (error) {
        throw new NotFoundException(error);
      }
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getAuditPlanData(id, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
      include: {
        organization: {
          select: {
            fiscalYearQuarters: true,
          },
        },
        location: { select: { id: true, locationName: true } },
      },
    });
    const finalResult = await this.auditPlanModel.findById({
      _id: id,
    });
    // //////////////////console.log('finalResult', finalResult);
    let entityType;

    if (finalResult.entityTypeId === 'Unit') {
      entityType = { id: 'Unit', name: 'Unit' };
    } else if (finalResult.entityTypeId === 'corpFunction') {
      entityType = { id: 'corpFunction', name: 'Corporate Function' };
    } else {
      entityType = await this.prisma.entityType.findFirst({
        where: { id: finalResult.entityTypeId },
      });
    }
    const formatDate = (originalDate: any) => {
      const year = originalDate.getFullYear();
      const month = (originalDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
      const day = originalDate.getDate().toString().padStart(2, '0');

      // Create the desired date string
      const desiredDateStr = `${year}-${month}-${day}`;
      return desiredDateStr;
    };
    let location;
    if (finalResult.entityTypeId === 'Unit') {
      location = await this.prisma.location.findFirst({
        where: { id: activeUser.locationId },
      });
    } else {
      location = await this.prisma.location.findFirst({
        where: { id: finalResult.location },
      });
    }

    const systemType = await this.prisma.systemType.findFirst({
      where: {
        id: finalResult.systemTypeId,
      },
    });

    const auditType: any = await this.auditSettings.findById(
      finalResult.auditType,
    );
    let dataSystem;
    if (finalResult.systemMasterId[0]?.hasOwnProperty('id')) {
      dataSystem = finalResult.systemMasterId.map((value: any) => value.id);
    } else {
      dataSystem = finalResult.systemMasterId;
    }
    const systemMaster = await this.SystemModel.find({
      _id: { $in: dataSystem },
    });

    const role = await this.prisma.role.findFirst({
      where: {
        id: finalResult.roleId,
      },
    });
    ////////////////////console.log("systemMaster",systemMaster)
    const auditPlanEntityWise = await this.auditPlanEntityWiseModel.find({
      auditPlanId: new ObjectId(id),
    });

    let auditPlanEnt = [];
    for (let value of auditPlanEntityWise) {
      let entityName;
      const monthNames = [];
      let flag;
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
      const current = new Date().getMonth();
      if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
        flag = value.auditschedule[current];
      } else {
        if (current < 9) {
          flag = value.auditschedule[current + 3];
        } else {
          flag = value.auditschedule[current + 3 - 12];
        }
      }

      if (
        JSON.parse(auditType.scope).id === 'Unit' &&
        auditType.planType === 'Month'
      ) {
        const entities = await this.prisma.entity.findMany({
          where: { locationId: location.id },
        });
        if (location.id === value.entityId) {
          for (let entData of entities) {
            if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(months[index]);
                }
              });
            } else {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(fiscalMonths[index]);
                }
              });
            }
            const sendData = {
              id: value._id,
              entityId: entData.id,
              flag,
              monthNames,
              auditSchedule: value.auditschedule,
              auditors: value.auditors,
              entityName: entData.entityName,
              auditPlanId: value.auditPlanId,
              deleted: value.deleted,
            };
            auditPlanEnt.push(sendData);
          }
        }
      } else if (
        JSON.parse(auditType.scope).id === 'Unit' &&
        auditType.planType === 'Date Range'
      ) {
        const entities = await this.prisma.entity.findMany({
          where: { locationId: activeUser.locationId },
        });

        if (activeUser.locationId === value.entityId) {
          for (let entData of entities) {
            if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(months[index]);
                }
              });
            } else {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(fiscalMonths[index]);
                }
              });
            }
            const auditorsData = await this.getFinalizedDatesAndAuditors(
              id,
              entData.locationId,
            );
            //////console.log("auditorsData",auditorsData)
            let auditorData = [];
            let scheduleDate = [];
            let combinedDate = [];

            for (let auditorUnitData of auditorsData) {
              for (let aud of auditorUnitData.auditors) {
                auditorData.push(aud.id);
              }
              scheduleDate.push({
                startDate: formatDate(auditorUnitData.fromDate),
                endDate: formatDate(auditorUnitData.toDate),
                id: auditorUnitData._id,
              });

              // combinedDate.push({
              //   id: auditorUnitData._id,
              //   date: `${formatDate(auditorUnitData.fromDate)}-${formatDate(
              //     auditorUnitData.toDate,
              //   )}`,
              // });
            }

            const sendData = {
              id: value._id,
              entityId: entData.id,
              flag,
              combinedDate,
              auditSchedule: scheduleDate,
              auditors: auditorData,
              entityName: entData.entityName,
              auditPlanId: value.auditPlanId,
              deleted: value.deleted,
            };

            if (activeUser.locationId === entData.locationId) {
              //////console.log('api is called');
              auditPlanEnt.push(sendData);
            }
          }
        }
      } else if (JSON.parse(auditType.scope).id === 'corpFunction') {
        entityName = await this.prisma.location.findFirst({
          where: { id: value.entityId },
        });
      } else if (auditType.useFunctionsForPlanning === true) {
        entityName = await this.prisma.functions.findFirst({
          where: { id: value.entityId },
        });
      } else {
        entityName = await this.prisma.entity.findFirst({
          where: { id: value.entityId },
        });

        if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
          value.auditschedule.map((value, index) => {
            if (value === true) {
              monthNames.push(months[index]);
            }
          });
        } else {
          value.auditschedule.map((value, index) => {
            if (value === true) {
              monthNames.push(fiscalMonths[index]);
            }
          });
        }
        const sendData = {
          id: value._id,
          entityId: value.entityId,
          flag,
          monthNames,
          auditSchedule: value.auditschedule,
          auditors: value.auditors,
          // entityName:auditType?.useFunctionsForPlanning === true?
          // entityName.name:
          //   JSON.parse(auditType.scope).id === 'Unit'
          //     ? entityName.locationName
          //     : entityName.entityName,
          entityName:
            auditType.useFunctionsForPlanning === true
              ? entityName.name
              : JSON.parse(auditType.scope).id === 'Unit' ||
                JSON.parse(auditType.scope).id === 'corpFunction'
              ? entityName.locationName
              : entityName.entityName,
          auditPlanId: value.auditPlanId,
          deleted: value.deleted,
        };
        auditPlanEnt.push(sendData);
      }
    }
    return {
      id: finalResult._id,
      auditName: finalResult.auditName,
      auditYear: finalResult.auditYear,
      status: finalResult.status,
      version: finalResult.version,
      publishedOnDate: finalResult.publishedOnDate,
      createdAt: finalResult.createdAt,
      createdBy: finalResult.createdBy,
      updatedAt: finalResult.updatedAt,
      updatedBy: finalResult.updatedBy,
      auditType: finalResult.auditType,
      planType: auditType.planType,
      systemMaster: systemMaster,
      // systemType: systemType.name,
      // systemTypeId: systemType.id,
      useFunctionsForPlanning: auditType.useFunctionsForPlanning,
      entityTypeId: entityType.id,
      entityType: entityType.name,
      comments: finalResult.comments,
      location: activeUser?.location?.locationName || '',
      locationId: activeUser?.locationId || '',
      organizationId: finalResult.organizationId,
      prefixSuffix: finalResult.prefixSuffix,
      // systemMaster: systemMaster.name,
      // systemMasterId: systemMaster.id,
      // roleName: role.roleName,
      roleId: finalResult.roleId || null,
      auditPlanEntityWise: auditPlanEnt,
    };
  }

  async getAuditPlanEntityWiseData(id, data, userId) {
    const { month, locationId } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: {
        organization: {
          select: {
            fiscalYearQuarters: true,
          },
        },
      },
    });
    const finalResult = await this.auditPlanModel.findById({
      _id: id,
    });
    // //////////////////console.log('finalResult', finalResult);
    let entityType;

    if (finalResult.entityTypeId === 'Unit') {
      entityType = { id: 'Unit', name: 'Unit' };
    } else {
      entityType = await this.prisma.entityType.findFirst({
        where: { id: finalResult.entityTypeId },
      });
    }

    const location = await this.prisma.location.findFirst({
      where: { id: finalResult.location },
    });

    const systemType = await this.prisma.systemType.findFirst({
      where: {
        id: finalResult.systemTypeId,
      },
    });

    const auditType = await this.auditSettings.findById(finalResult.auditType);

    const systemMaster = await this.SystemModel.find({
      _id: { $in: finalResult.systemMasterId },
    });

    const role = await this.prisma.role.findFirst({
      where: {
        id: finalResult.roleId,
      },
    });
    ////////////////////console.log("systemMaster",systemMaster)
    const auditPlanEntityWise = await this.auditPlanEntityWiseModel.find({
      auditPlanId: new ObjectId(id),
    });

    let auditPlanEnt = [];
    for (let value of auditPlanEntityWise) {
      let entityName;
      const monthNames = [];
      let flag;
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
      const current = new Date().getMonth();
      if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
        flag = value.auditschedule[current];
      } else {
        if (current < 9) {
          flag = value.auditschedule[current + 3];
        } else {
          flag = value.auditschedule[current + 3 - 12];
        }
      }

      if (
        JSON.parse(auditType.scope).id === 'Unit' &&
        auditType.planType === 'Month'
      ) {
        const entities = await this.prisma.entity.findMany({
          where: { locationId: location.id },
        });
        if (location.id === value.entityId) {
          for (let entData of entities) {
            if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(months[index]);
                }
              });
            } else {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(fiscalMonths[index]);
                }
              });
            }
            const sendData = {
              id: value._id,
              entityId: entData.id,
              flag,
              monthNames,
              auditSchedule: value.auditschedule,
              auditors: value.auditors,
              entityName: entData.entityName,
              auditPlanId: value.auditPlanId,
            };
            auditPlanEnt.push(sendData);
          }
        }
      } else if (
        JSON.parse(auditType.scope).id === 'Unit' &&
        auditType.planType === 'Date Range'
      ) {
        const entities = await this.prisma.entity.findMany({
          where: { locationId: location.id },
        });
        if (location.id === value.entityId) {
          for (let entData of entities) {
            //////////////console.log('entityData', entData);
            if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(months[index]);
                }
              });
            } else {
              value.auditschedule.map((value, index) => {
                if (value === true) {
                  monthNames.push(fiscalMonths[index]);
                }
              });
            }
            const sendData = {
              id: value._id,
              entityId: entData.id,
              flag,
              auditSchedule: value.auditschedule,
              auditors: value.auditors,
              entityName: entData.entityName,
              auditPlanId: value.auditPlanId,
            };
            auditPlanEnt.push(sendData);
          }
        }
      } else {
        entityName = await this.prisma.entity.findFirst({
          where: { id: value.entityId },
        });

        if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
          value.auditschedule.map((value, index) => {
            if (value === true) {
              monthNames.push(months[index]);
            }
          });
        } else {
          value.auditschedule.map((value, index) => {
            if (value === true) {
              monthNames.push(fiscalMonths[index]);
            }
          });
        }
        if (monthNames.includes(month)) {
          const sendData = {
            id: value._id,
            entityId: value.entityId,
            flag,
            monthNames,
            auditSchedule: value.auditschedule,
            auditors: value.auditors,
            entityName:
              JSON.parse(auditType.scope).id === 'Unit'
                ? entityName.locationName
                : entityName.entityName,
            auditPlanId: value.auditPlanId,
          };
          auditPlanEnt.push(sendData);
        }
      }
    }

    return {
      id: finalResult._id,
      auditName: finalResult.auditName,
      auditYear: finalResult.auditYear,
      status: finalResult.status,
      version: finalResult.version,
      publishedOnDate: finalResult.publishedOnDate,
      createdAt: finalResult.createdAt,
      createdBy: finalResult.createdBy,
      updatedAt: finalResult.updatedAt,
      updatedBy: finalResult.updatedBy,
      auditType: finalResult.auditType,
      planType: auditType.planType,
      systemMaster: systemMaster,
      // systemType: systemType.name,
      // systemTypeId: systemType.id,
      entityTypeId: entityType.id,
      entityType: entityType.name,
      comments: finalResult.comments,
      location: location.locationName,
      locationId: location.id,
      organizationId: finalResult.organizationId,
      prefixSuffix: finalResult.prefixSuffix,
      // systemMaster: systemMaster.name,
      // systemMasterId: systemMaster.id,
      // roleName: role.roleName,
      roleId: finalResult.roleId || null,
      auditPlanEntityWise: auditPlanEnt,
    };
  }

  async getEntityByLocation(userId) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
      select: {
        organizationId: true,
      },
    });

    const entityType = await this.prisma.entityType.findMany({
      where: {
        organizationId: orgId.organizationId,
      },
      select: {
        id: true,
        name: true,
      },
    });
    return entityType;
  }

  async getRoles(uid) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: uid,
      },
      select: {
        organizationId: true,
      },
    });

    const roles = await this.prisma.role.findMany({
      where: {
        organizationId: orgId.organizationId,
      },
      select: {
        id: true,
        roleName: true,
      },
    });
    return roles;
  }

  async createAudit(userId, data) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    const auditTypeDetails = await this.auditSettings.findById(
      data.auditTypeId,
    );
    // //////console.log('audittypescope', auditTypeDetails.scope);
    const auditDuplicate = await this.auditPlanModel.find({
      organization: orgId.organizationId,
      auditName: data.auditName,
      location: data.location,
      auditYear: data.auditYear,
    });

    // if same name documents exists in organization
    if (auditDuplicate.length > 0) {
      throw new ConflictException(
        'An audit plan with the same name already exists in this organization.',
      );
    }
    try {
      const audit = await this.auditPlanModel.create({
        auditName: data.auditName,
        auditYear: data.auditYear,
        status: data.status,
        version: data.version,
        isDraft: data.isDraft,
        publishedOnDate: data.publishedOnDate,
        createdBy: orgId.username,
        updatedBy: orgId.username,
        // systemTypeId: data.systemTypeId,
        entityTypeId: data.entityTypeId,
        comments: data.comments,
        prefixSuffix: data.prefixSuffix,
        location: data.location,
        auditType: data.auditType,
        organizationId: orgId.organizationId,
        systemMasterId: data.systemMasterId,
        roleId: data.roleId,
      });
      try {
        await data.AuditPlanEntitywise.map(async (value) => {
          const auditEntitywiseData =
            await this.auditPlanEntityWiseModel.create({
              entityId: value.entityId,
              auditschedule: value.months,
              auditors: value.auditors,
              organizationId: orgId.organizationId,
              auditPlanId: audit._id,
              deleted: value?.deleted ? value?.deleted : false,
            });
        });
        try {
          // await this.sendMailForHead(userId, audit._id);
        } catch (error) {}
      } catch (error) {
        return {
          'error message': error.message,
          message: 'Auditplan is created problem in auditschedule create',
        };
      }
    } catch (error) {
      return {
        'error message': error.message,
      };
    }

    return 'successfully data created in auditPlan and auditSchedule';
  }

  async updateAudit(auditId, userId, data) {
    const {
      auditName,
      status,
      location,
      comments,
      prefixSuffix,
      systemTypeId,
      entityTypeId,
      publishedondate,
      auditType,
      entityId,
      organization,
      systemMasterId,
      AuditPlanEntitywise,
      roleId,
      auditYear,
      AuditPlanUnitWise,
      removedId,
    } = data;

    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    const auditTypeDetails = await this.auditSettings.findById(
      data.auditTypeId,
    );

    // try {
    const updateAuditPlan = await this.auditPlanModel.findByIdAndUpdate(
      auditId,
      {
        auditName,
        status,
        prefixSuffix,
        location,
        comments,
        isDraft: data.isDraft,

        auditType,
        systemTypeId,
        roleId,
        publishedondate,
        systemMasterId: [...new Set(systemMasterId)],
        auditYear,
        removedId,
      },
    );
    // } catch (error) {}

    const isValidEntity = await this.auditPlanModel.find({
      organizationId: orgId.organizationId,
      entityTypeId,
    });
    if (isValidEntity.length === 0) {
      await this.auditPlanEntityWiseModel.deleteMany({
        auditPlanId: new ObjectId(auditId),
      });
      await this.auditPlanModel.findByIdAndUpdate(auditId, {
        entityTypeId,
      });
      if (!AuditPlanEntitywise) {
      } else {
        AuditPlanEntitywise.map(async (value) => {
          await this.auditPlanEntityWiseModel.create({
            entityId: value.entityId,
            auditschedule: value.months,
            auditors: value.auditors,
            organizationId: orgId.organizationId,
            auditPlanId: auditId,
            deleted: value?.deleted ? value?.deleted : false,
          });
        });
      }
    } else {
      if (AuditPlanEntitywise) {
        await AuditPlanEntitywise.map(async (value) => {
          const result = await this.auditPlanEntityWiseModel.findByIdAndUpdate(
            { _id: value.id },
            {
              auditschedule: value.months,
              auditors: value.auditors,
            },
          );
          // if (auditTypeDetails.scope === 'unit') {
          //   //if the audit type scope is unit then create unit wise audit plans
          //   //if the data for unit wise audit pla is sent then update the records
          //   if (AuditPlanUnitWise) {
          //     for (let audit of AuditPlanUnitWise) {
          //       //for each of the record sent check it has _id or not if its existing record then just update for this id
          //       if (audit.hasOwnProperty('_id')) {
          //         const auditplanunitwise = await this.updateAuditPlanUnitWise(
          //           audit._id,
          //           audit,
          //         );
          //       } // else create a new record
          //       else {
          //         const auditplanunitwise = await this.createAuditPlanUnitWise(
          //           audit,
          //         );
          //       }
          //     }
          //   }
          // }
        });
      } else {
        // ////////////////console.log('no auditplanEntityWise is exist');
      }
    }
    try {
      // await this.sendMailForHead(userId, auditId);
    } catch (error) {}
  }

  async getAuditPlanSingle(id, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
      include: {
        organization: {
          select: {
            fiscalYearQuarters: true,
          },
        },
      },
    });
    const finalResult = await this.auditPlanModel.findById({
      _id: id,
    });
    // ////////////////console.log('finalResult', finalResult);
    let entityType;

    if (finalResult.entityTypeId === 'Unit') {
      entityType = { id: 'Unit', name: 'Unit' };
    } else if (finalResult.entityTypeId === 'corpFunction') {
      entityType = { id: 'corpFunction', name: 'Corporate Function' };
    } else {
      entityType = await this.prisma.entityType.findFirst({
        where: { id: finalResult.entityTypeId },
      });
    }
    let location;
    if (finalResult.location) {
      location = await this.prisma.location.findFirst({
        where: { id: finalResult.location },
      });
    }

    const systemType = await this.prisma.systemType.findFirst({
      where: {
        id: finalResult.systemTypeId,
      },
    });

    const auditType = await this.auditSettings.findById(finalResult.auditType);

    let dataSystem;
    if (finalResult.systemMasterId[0]?.hasOwnProperty('id')) {
      dataSystem = finalResult.systemMasterId.map((value: any) => value.id);
    } else {
      dataSystem = finalResult.systemMasterId;
    }

    const systemMaster = await this.SystemModel.find({
      _id: { $in: dataSystem },
    });

    const role = await this.prisma.role.findFirst({
      where: {
        id: finalResult.roleId,
      },
    });
    //////////////////console.log("systemMaster",systemMaster)
    const auditPlanEntityWise = await this.auditPlanEntityWiseModel.find({
      auditPlanId: new ObjectId(id),
      // deleted: false,
    });

    const auditPlanEnt = [];
    const auditPlanUnitwise = [];
    for (let value of auditPlanEntityWise) {
      let entityName;
      if (
        JSON.parse(auditType.scope).id === 'Unit' ||
        JSON.parse(auditType.scope).id === 'corpFunction'
      ) {
        entityName = await this.prisma.location.findFirst({
          where: { id: value.entityId },
        });
      } else if (auditType.useFunctionsForPlanning === true) {
        entityName = await this.prisma.functions.findFirst({
          where: { id: value.entityId },
        });
      } else {
        entityName = await this.prisma.entity.findFirst({
          where: { id: value.entityId },
        });
      }
      const monthNames = [];
      let flag;
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
      const current = new Date().getMonth();
      if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
        flag = value.auditschedule[current];
      } else {
        if (current < 9) {
          flag = value.auditschedule[current + 3];
        } else {
          flag = value.auditschedule[current + 3 - 12];
        }
      }

      if (activeUser.organization.fiscalYearQuarters === 'Jan - Dec') {
        value.auditschedule.map((value, index) => {
          if (value === true) {
            monthNames.push(months[index]);
          }
        });
      } else {
        value.auditschedule.map((value, index) => {
          if (value === true) {
            monthNames.push(fiscalMonths[index]);
          }
        });
      }
      const sendData = {
        id: value._id,
        entityId: value.entityId,
        flag,
        deleted: value.deleted,
        monthNames,
        auditors: value.auditors,
        auditSchedule: value.auditschedule,
        entityName:
          auditType.useFunctionsForPlanning === true
            ? entityName?.name
            : JSON.parse(auditType.scope).id === 'Unit' ||
              JSON.parse(auditType.scope).id === 'corpFunction'
            ? entityName.locationName
            : entityName.entityName,
        auditPlanId: value.auditPlanId,
      };
      auditPlanEnt.push(sendData);
      // if (JSON.parse(auditType.scope).id === 'Unit') {
      //   const unitdata = await this.auditPlanUnitwiseModel.find({
      //     where: {
      //       unitId: value.entityId,
      //       auditPlanEntitywiseId: value._id,
      //     },
      //   });
      //   auditPlanUnitwise.push(unitdata);
      // }
    }

    return {
      id: finalResult._id,
      auditName: finalResult.auditName,
      auditYear: finalResult.auditYear,
      status: finalResult.status,
      version: finalResult.version,
      publishedOnDate: finalResult.publishedOnDate,
      createdAt: finalResult.createdAt,
      createdBy: finalResult.createdBy,
      updatedAt: finalResult.updatedAt,
      updatedBy: finalResult.updatedBy,
      auditType: finalResult.auditType,
      planType: auditType.planType,
      auditorCheck: auditType.auditorCheck,
      systemMaster: systemMaster,
      // systemType: systemType.name,
      // systemTypeId: systemType.id,
      entityTypeId: entityType.id,
      entityType: entityType.name,
      comments: finalResult.comments,
      location: location?.locationName || '',
      locationId: location?.id || '',
      organizationId: finalResult.organizationId,
      prefixSuffix: finalResult.prefixSuffix,
      isDraft: finalResult?.isDraft,
      useFunctionsForPlanning: auditType?.useFunctionsForPlanning,
      // systemMaster: systemMaster.name,
      // systemMasterId: systemMaster.id,
      // roleName: role.roleName,
      roleId: finalResult.roleId || null,
      auditPlanEntityWise: auditPlanEnt,
      auditTypeName: auditType.auditType,
      auditPlanUnitwise: auditPlanUnitwise,
    };
  }

  async getAuditPlanSingleByIdAndAuditType(auditTypeId, userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      const auditType = await this.auditSettings.findById(auditTypeId);
      let whereCondition;

      if (
        JSON.parse(auditType.scope).name === 'Unit' ||
        JSON.parse(auditType.scope).name === 'Corporate Function'
      ) {
        whereCondition = {
          organizationId: activeUser.organizationId,
          auditType: auditTypeId,
          deleted: false,
        };
      } else {
        whereCondition = {
          organizationId: activeUser.organizationId,
          auditType: auditTypeId,
          deleted: false,
        };
      }
      const auditPlanData = await this.auditPlanModel
        .find(whereCondition)
        .select('_id auditName');
      return auditPlanData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getAllAuditors(userId, system) {
    try {
      //console.log('system value in getallauditors', system);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const systemData = await this.SystemModel.find({
        _id: { $in: system },
      });
      const systemNames = systemData.map((value: any) => value.name);
      const auditorProfile = await this.auditorProfile.find({
        inLead: { $in: systemNames },
      });
      const leadAuditor = auditorProfile.map(
        (value: any) => value.auditorName.id,
      );
      const auditorId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'AUDITOR',
        },
      });
      let finalResult = [];
      const result = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser.organizationId,
          roleId: { has: auditorId.id },
          deleted: false,
          // assignedRole: { some: { roleId: auditorId.id } },
        },
        include: { location: { select: { id: true, locationName: true } } },
      });
      result.map((value) => {
        if (leadAuditor.includes(value.id)) {
          finalResult.push({ ...value, leadAuditor: true });
        } else {
          finalResult.push({ ...value, leadAuditor: false });
        }
      });
      return finalResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAll(userId, year, locationData, data) {
    // try {
    // &myAudit=${myAuditShow}
    const {
      system,
      auditType,
      page,
      limit,
      search,
      myAudit,
      secAuditType,
      systemNew,
    } = data;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId.id,
      },
      include: { entity: true },
    });

    const auditPlanQuery = () => {
      if (myAudit === 'true') {
        let standardQuery: any = {
          organizationId: activeUser.organizationId,
          createdBy: activeUser.username,
          deleted: false,
        };
        return standardQuery;
      } else {
        let standardQuery: any = {
          organizationId: activeUser.organizationId,
          auditYear: year,
          deleted: false,
        };

        if (locationData !== 'All') {
          standardQuery = {
            ...standardQuery,
            location: { $in: [locationData, ''] },
          };
        }
        if (system !== undefined) {
          const systemData = JSON.parse(system);
          standardQuery = {
            ...standardQuery,
            systemMasterId: { $elemMatch: { $in: systemData } },
          };
        }
        if (auditType !== undefined) {
          const auditTypeData = JSON.parse(auditType);
          standardQuery = {
            ...standardQuery,
            auditType: { $in: auditTypeData },
          };
        }

        if (search !== undefined && search !== 'undefined') {
          standardQuery = {
            ...standardQuery,
            auditName: { $regex: search, $options: 'i' },
          };
        }

        if (
          secAuditType !== undefined &&
          secAuditType !== 'undefined' &&
          secAuditType !== 'All'
        ) {
          standardQuery = {
            ...standardQuery,
            auditType: secAuditType,
            // auditName: { $regex: search, $options: 'i' },
          };
        }
        if (
          systemNew !== undefined &&
          systemNew !== 'undefined' &&
          systemNew.length > 0
        ) {
          standardQuery = {
            ...standardQuery,
            systemMasterId: { $in: systemNew },
          };
        }
        return standardQuery;
      }
    };
    let getAllaudit;

    getAllaudit = await this.auditPlanModel
      .find(auditPlanQuery())
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const entityId: any = await this.prisma.entity.findMany({
      where: {
        users: { has: activeUser.id },
      },
    });

    const entityIds =
      entityId?.length > 0 ? entityId.map((value) => value.id) : [];

    let entityDataNames = entityId.map((value) => value.entityName);
    let entityLocation = entityId.map((value) => value.locationId);
    let totalAudit = await this.auditPlanModel.count(auditPlanQuery());
    const finalData = [];
    // getAllaudit
    for (let value of getAllaudit) {
      let query;
      const auditSetting = await this.auditSettings.findById(value.auditType);
      const functionData = await this.prisma.functions.findMany({
        where: {
          functionSpoc: { has: activeUser.id },
          organizationId: activeUser.organizationId,
        },
      });
      const functionUnitIds = functionData?.map((value) => value.unitId);
      const editAccess =
        await this.validateUserAbleToEditAuditPlanBasedOnAuditType(
          {
            ...activeUser,
            roles: userId.kcRoles.roles,
            unitId: functionUnitIds,
          },
          auditSetting,
          value,
        );
      const scheduleAccess = await this.validateAuditTypeForUser(
        userId,
        value.auditType,
        entityIds,
        entityDataNames,
        entityLocation,
        value.isDraft,
      );
      if (JSON.parse(auditSetting?.scope)?.name === 'Unit') {
        // //////console.log('if');
        query = await this.auditPlanEntityWiseModel.find({
          auditPlanId: value._id,
          entityId: locationData,
        });
        let entityType;
        if (value.entityTypeId === 'Unit') {
          entityType = {
            id: 'Unit',
            name: 'Unit',
          };
        } else if (value.entityTypeId === 'corpFunction') {
          entityType = { id: 'corpFunction', name: 'Corporate Function' };
        } else {
          entityType = await this.prisma.entityType.findFirst({
            where: { id: value.entityTypeId },
            select: {
              id: true,
              name: true,
            },
          });
        }

        const location = await this.prisma.location.findFirst({
          where: { id: value.location },
          select: {
            locationName: true,
            id: true,
          },
        });

        const systemType = await this.prisma.systemType.findFirst({
          where: {
            id: value.systemTypeId,
          },
          select: {
            id: true,
            name: true,
          },
        });
        const systemMaster = await this.SystemModel.find({
          _id: { $in: value.systemMasterId },
        });
        const role = await this.prisma.role.findFirst({
          where: {
            id: value.roleId,
          },
          select: {
            id: true,
            roleName: true,
          },
        });
        const auditType = await this.auditSettings.findById(value.auditType);
        const data = {
          id: value._id,
          auditName: value?.auditName,
          auditYear: value.auditYear,
          status: value.status,
          version: value.version,
          publishedOnDate: value.publishedOnDate,
          createdAt: value.createdAt,
          createdBy: value.createdBy,
          updatedAt: value.updatedAt,
          auditType: value.auditType,
          updatedBy: value.updatedBy,
          comments: value.comments,
          prefixSuffix: value.prefixSuffix,
          location: value.location,
          roleId: value.roleId || null,
          auditTypeName: auditType.auditType,
          editAccess,
          whoCanSchedule: scheduleAccess,
          // roleName: role.roleName,
          // systemMasterId: systemMaster.id,
          // systemMasterName: systemMaster.name,
          // systemTypeId: systemType.id,
          // systemTypeName: systemType.name,
          systemMaster: systemMaster,
          locationId: location?.id || '',
          locationName: location?.locationName || '',
          entityTypeId: entityType.id,
          entityTypeName: entityType.name,
          organizationId: value.organizationId,
          isDraft: value.isDraft,
          // systemMaster: value.systemMasterId,
          auditPlanEntityWise: query,
          auditorCheck: auditSetting?.auditorCheck,
        };
        finalData.push(data);
      } else {
        // //////console.log('else condition');
        if (locationData === value.location || locationData === 'All') {
          // //////console.log('location filter', locationData, value.location);
          query = await this.auditPlanEntityWiseModel.find({
            auditPlanId: value._id,
          });
          let entityType;
          if (value.entityTypeId === 'Unit') {
            entityType = {
              id: 'Unit',
              name: 'Unit',
            };
          } else if (value.entityTypeId === 'corpFunction') {
            entityType = { id: 'corpFunction', name: 'Corporate Function' };
          } else {
            entityType = await this.prisma.entityType.findFirst({
              where: { id: value.entityTypeId },
              select: {
                id: true,
                name: true,
              },
            });
          }

          const location = await this.prisma.location.findFirst({
            where: { id: value.location },
            select: {
              locationName: true,
              id: true,
            },
          });

          const systemType = await this.prisma.systemType.findFirst({
            where: {
              id: value.systemTypeId,
            },
            select: {
              id: true,
              name: true,
            },
          });

          const role = await this.prisma.role.findFirst({
            where: {
              id: value.roleId,
            },
            select: {
              id: true,
              roleName: true,
            },
          });
          const auditType = await this.auditSettings.findById(value.auditType);
          let dataSystem;
          if (value.systemMasterId[0]?.hasOwnProperty('id')) {
            dataSystem = value.systemMasterId.map((value) => value.id);
          } else {
            dataSystem = value.systemMasterId;
          }

          const systemMaster = await this.SystemModel.find({
            _id: { $in: dataSystem },
          });
          const data = {
            id: value._id,
            auditName: value?.auditName,
            auditYear: value.auditYear,
            status: value.status,
            version: value.version,
            publishedOnDate: value.publishedOnDate,
            createdAt: value.createdAt,
            createdBy: value.createdBy,
            updatedAt: value.updatedAt,
            auditType: value.auditType,
            isDraft: value?.isDraft,
            updatedBy: value.updatedBy,
            comments: value.comments,
            prefixSuffix: value.prefixSuffix,
            location: value.location,
            roleId: value.roleId || null,
            whoCanSchedule: scheduleAccess,
            auditTypeName: auditType.auditType,
            editAccess,
            // roleName: role.roleName,
            // systemMasterId: systemMaster.id,
            // systemMasterName: systemMaster.name,
            // systemTypeId: systemType.id,
            // systemTypeName: systemType.name,
            systemMaster: systemMaster,
            locationId: location?.id || '',
            locationName: location?.locationName || '',
            entityTypeId: entityType.id,
            entityTypeName: entityType.name,
            organizationId: value.organizationId,
            // systemMaster: value.systemMasterId,
            auditPlanEntityWise: query,
          };
          finalData.push(data);
        }
      }
    }
    const result = {
      data: finalData,
      count: totalAudit,
    };
    return result;
    // } catch (error) {
    //   throw new NotFoundException(error);
    // }
  }

  async validateAuditTypeForUser(
    userRole,
    auditTypeId,
    entityData,
    entityDataNames,
    entityLocation,
    isDraft,
  ) {
    const auditType: any = await this.auditSettings.findById(auditTypeId);

    // console.log('whocanSchedule', auditType.whoCanSchedule);
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userRole.id },
      include: { entity: true },
    });
    // if (isDraft === false) {
    const auditTypeunit = auditType?.schedulingUnit?.map((value) => value?.id);

    if (auditType?.whoCanSchedule === 'Entity Head' && entityData?.length > 0) {
      if (
        auditType?.schedulingUnit[0]?.id === 'All' &&
        !auditType.hasOwnProperty('schedulingEntity')
      ) {
        return true;
      } else if (
        auditType?.schedulingUnit[0]?.id === 'All' &&
        entityDataNames?.includes(auditType?.schedulingEntity?.entityName)
      ) {
        return true;
      } else if (
        auditTypeunit.some((item) => entityLocation.includes(item)) &&
        entityData.includes(auditType?.schedulingEntity?.id)
      ) {
        return true;
      } else {
        return false;
      }
    } else if (auditType?.whoCanSchedule === 'All') {
      return true;
    } else if (auditType?.whoCanSchedule === 'Function SPOC') {
      const functionData = await this.prisma.functions.findMany({
        where: {
          organizationId: activeUser.organizationId,
          functionSpoc: { has: activeUser.id },
        },
      });

      if (functionData.length > 0) {
        return true;
      }
    } else if (
      auditType?.whoCanSchedule === 'IMS Coordinator' &&
      userRole.kcRoles?.roles?.includes('MR') &&
      (entityLocation.includes(activeUser.locationId) ||
        entityLocation?.filter((item: any) =>
          activeUser?.additionalUnits?.includes(item),
        )?.length > 0)
    ) {
      return true;
    } else if (
      userRole.kcRoles?.roles?.includes(newRoles[auditType?.whoCanSchedule])
    ) {
      return true;
    }

    return false;
    // } else {
    // return false;
    // }
  }
  async validateUserAbleToEditAuditPlanBasedOnAuditType(
    user,
    auditType,
    auditPlanData,
  ) {
    // try {
    if (auditType?.whoCanPlan) {
      // if (JSON.parse(auditType?.scope).name !== 'Unit') {
      if (
        auditType?.whoCanPlan === 'MCOE' &&
        user?.roles?.includes('ORG-ADMIN')
        //   ||
        // user.roles.includes('MR')
      ) {
        return true;
      } else if (
        auditType?.whoCanPlan === 'IMS Coordinator' &&
        user.roles?.includes('MR') &&
        (user.locationId === auditPlanData?.location ||
          user?.additionalUnits?.includes(auditPlanData?.location))
        //    ||
        // user.roles.includes('ORG-ADMIN')
      ) {
        return true;
      } else if (
        auditType?.whoCanPlan === 'Entity Head' &&
        user?.entity?.users.includes(user.id)
      ) {
        return true;
      } else if (auditType?.whoCanPlan === 'All') {
        return true;
      } else if (auditType?.whoCanPlan === 'Function SPOC') {
        const auditTypeData = await this.auditSettings.find({
          whoCanPlan: 'Function SPOC',
          'planningUnit.id': { $in: [...user?.unitId, 'All'] },
        });

        if (auditTypeData.length > 0) {
          return true;
        }
      } else {
        return false;
      }
      // } else {
      //   if (
      //     user.kcRoles.roles.includes('ORG-ADMIN') ||
      //     user.kcRoles.roles('MR')
      //   ) {
      //     return true;
      //   }
      // }
    } else {
      return false;
    }
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }
  async deleteAuditPlanId(id, userId) {
    try {
      const deleteAuditPlan = await this.auditPlanModel.findByIdAndUpdate(id, {
        deleted: true,
      });
      const deleteAuditPlanEntityWise =
        await this.auditPlanEntityWiseModel.updateMany(
          { auditPlanId: id },
          { deleted: true },
        );
      return `Sucessfully deleted auditPlan and auditschedule`;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async removeAuditPlanEntityWiseById(id, userId) {
    try {
      const deleteApe = await this.auditPlanEntityWiseModel.findByIdAndUpdate(
        id,
        { deleted: true },
      );
      return deleteApe;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async restoreAuditPlanEntityWiseById(id, userId) {
    try {
      const restoreApe = await this.auditPlanEntityWiseModel.findByIdAndUpdate(
        id,
        { deleted: false },
      );
      return restoreApe;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getEntityname(locId, entityType) {
    try {
      const locEntityId = await this.prisma.location.findFirst({
        where: {
          id: locId,
          deleted: false,
        },
        select: {
          id: true,
        },
      });

      const scopeId = await this.prisma.entityType.findFirst({
        where: {
          id: entityType,
        },
        select: {
          id: true,
        },
      });
      let whereCondition;
      if (entityType === 'Unit') {
        whereCondition = {
          // entityTypeId: scopeId.id,
          locationId: locEntityId.id,
          deleted: false,
        };
      } else {
        whereCondition = {
          entityTypeId: scopeId.id,
          locationId: locEntityId.id,
          deleted: false,
        };
      }

      const result = await this.prisma.entity.findMany({
        where: whereCondition,
        select: {
          id: true,
          entityName: true,
        },
      });
      return result;
    } catch (e) {
      throw new NotFoundException(e);
    }
  }
  //not used
  async getEntitiesFromEntityType(userId, entityTypeId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const entites = await this.prisma.entity.findMany({
        where: {
          entityTypeId,
          organizationId: activeUser.organizationId,
        },
      });

      return entites;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
  async getAuditYear(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      this.logger.log(`GET /api/auditPlan/getAuditYear - Service started`, '');
      const result: any = await this.prisma.organization.findFirst({
        where: {
          id: activeUser.organizationId,
        },
        select: {
          auditYear: true,
          id: true,
          fiscalYearFormat: true,
          fiscalYearQuarters: true,
        },
      });
      const isAprilToMarch = result.fiscalYearQuarters === 'April - Mar';

      const date = new Date();
      const currentMonth = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month

      // Check if the fiscal year starts in April (April-March)
      const isBeforeApril = isAprilToMarch && currentMonth < 4;
      ////console.log('isbeforeapril', isBeforeApril);

      if (!result.auditYear) {
        let cYear = date.getFullYear();
        let nYear = cYear + 1;

        if (isBeforeApril) {
          // If current date is before April, adjust the previous fiscal year
          cYear--;
          nYear--;
        }
        const clastTwoDigits = cYear.toString().slice(-2);
        const nlastTwoDigits = nYear.toString().slice(-2);

        switch (result.fiscalYearFormat) {
          case 'YYYY':
            return cYear;
          case 'YY-YY+1':
            return `${clastTwoDigits}-${nlastTwoDigits}`;
          case 'YYYY-YY+1':
            return `${cYear}-${nlastTwoDigits}`;
          case 'YY+1':
            return `${nlastTwoDigits}`;
        }
      } else {
        let inputYear = parseInt(result.auditYear, 10);
        if (isBeforeApril) {
          // If current date is before April, adjust the previous fiscal year
          inputYear--;
          result.auditYear--;
        }
        // //console.log('cyear and nextyear', searchyear);
        const nYear = inputYear + 1;

        const clastTwoDigits = inputYear.toString().slice(-2);
        const nlastTwoDigits = nYear.toString().slice(-2);

        switch (result.fiscalYearFormat) {
          case 'YYYY': {
            ////console.log('result.audityear', result.auditYear);
            return inputYear;
          }
          case 'YY-YY+1': {
            // //console.log('result.audityear', clastTwoDigits, nlastTwoDigits);
            return `${clastTwoDigits}-${nlastTwoDigits}`;
          }
          case 'YYYY-YY+1': {
            ////console.log('result.audityear', `${inputYear}-${nlastTwoDigits}`);
            return `${inputYear}-${nlastTwoDigits}`;
          }
          case 'YY+1':
            return `${nlastTwoDigits}`;
        }
        this.logger.log(
          `GET /api/auditPlan/getAuditYear - Service Successfull`,
          '',
        );
      }
    } catch (error) {
      this.logger.error(
        `GET /api/auditPlan/getAuditYear  - Service failed`,
        error.stack || error.message,
      );
      throw new NotFoundException(error);
    }
  }
  async searchAuditPlan(text, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
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
      let systemMaster = await this.SystemModel.find({
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
      const getAllaudit = await this.auditPlanModel.find({
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
      const finalResult = await getAllaudit.map(async (value) => {
        const query = await this.auditPlanEntityWiseModel.find({
          auditPlanId: value._id,
        });
        const entityType = await this.prisma.entityType.findFirst({
          where: { id: value.entityTypeId },
          select: {
            id: true,
            name: true,
          },
        });

        const location = await this.prisma.location.findFirst({
          where: { id: value.location },
          select: {
            id: true,
            locationName: true,
          },
        });

        const systemType = await this.prisma.systemType.findFirst({
          where: {
            id: value.systemTypeId,
          },
          select: {
            id: true,
            name: true,
          },
        });
        const systemMaster = await this.SystemModel.findById({
          _id: value.systemMasterId,
        });
        const role = await this.prisma.role.findFirst({
          where: {
            id: value.roleId,
          },
          select: {
            id: true,
            roleName: true,
          },
        });

        const data = {
          id: value._id,
          auditYear: value.auditYear,
          status: value.status,
          version: value.version,
          publishedOnDate: value.publishedOnDate,
          createdAt: value.createdAt,
          createdBy: value.createdBy,
          updatedAt: value.updatedAt,
          updatedBy: value.updatedBy,
          comments: value.comments,
          prefixSuffix: value.prefixSuffix,
          location: value.location,
          roleId: value.roleId || null,
          // roleName: role.roleName,
          systemMasterId: systemMaster.id,
          systemMasterName: systemMaster.name,
          // systemTypeId: systemType.id,
          // systemTypeName: systemType.name,
          locationId: location.id,
          locationName: location.locationName,
          entityTypeId: entityType.id,
          entityTypeName: entityType.name,
          organizationId: value.organizationId,
          systemMaster: value.systemMasterId,
          auditPlanEntityWise: query,
        };
        return data;
      });
      const result = Promise.all(finalResult);
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getFinalizedDatesAndAuditors(planid, unitid) {
    try {
      let auditors = [];
      const getallunitrecords = await this.auditPlanUnitwiseModel
        .find({
          auditPlanId: planid,
          unitId: unitid,
        })
        .select('_id auditors fromDate toDate unitId');
      return getallunitrecords;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async getUnitWiseData(id, data, user) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getUnitWiseData/${id} - Service started`,
        '',
      );
      const { location, date } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const findata = date.split(' - ');
      const finalResult = await this.auditPlanModel.findById({
        _id: id,
      });
      // //////////////////console.log('finalResult', finalResult);
      let entityType;

      if (finalResult.entityTypeId === 'Unit') {
        entityType = { id: 'Unit', name: 'Unit' };
      } else {
        entityType = await this.prisma.entityType.findFirst({
          where: { id: finalResult.entityTypeId },
        });
      }

      const locationData = await this.prisma.location.findFirst({
        where: { id: finalResult.location },
      });

      const systemType = await this.prisma.systemType.findFirst({
        where: {
          id: finalResult.systemTypeId,
        },
      });

      const auditType = await this.auditSettings.findById(
        finalResult.auditType,
      );

      const systemMaster = await this.SystemModel.find({
        _id: { $in: finalResult.systemMasterId },
      });

      const role = await this.prisma.role.findFirst({
        where: {
          id: finalResult.roleId,
        },
      });
      ////////////////////console.log("systemMaster",systemMaster)

      const unitWiseData = await this.auditPlanUnitwiseModel.find({
        auditPlanId: id,
        unitId: activeUser.locationId,
        fromDate: {
          $gte: `${findata[0]}T00:00:00.000Z`,
          $lte: `${findata[0]}T23:59:59.999Z`,
        },
        toDate: {
          $gte: `${findata[1]}T00:00:00.000Z`,
          $lte: `${findata[1]}T23:59:59.999Z`,
        },
      });

      let auditorData = [];
      for (let aud of unitWiseData) {
        for (let auditData of aud.auditors) {
          auditorData.push(auditData.id);
        }
      }
      let auditPlanEnt = [];

      const auditPlanEntityWise = await this.auditPlanEntityWiseModel.findById(
        unitWiseData[0].auditPlanEntitywiseId,
      );

      const entitiesData = await this.prisma.entity.findMany({
        where: {
          locationId: activeUser.locationId,
        },
      });

      //////console.log('entitiesData', entitiesData);
      for (let value of entitiesData) {
        const sendData = {
          id: auditPlanEntityWise._id,
          entityId: value.id,
          auditSchedule: auditPlanEntityWise.auditschedule,
          auditors: auditorData,
          entityName: value.entityName,
          auditPlanId: id,
          deleted: value.deleted,
        };

        auditPlanEnt.push(sendData);
      }
      this.logger.log(
        `GET /api/auditPlan/getUnitWiseData/${id} - Service Successfull`,
        '',
      );
      return {
        id: finalResult._id,
        auditName: finalResult.auditName,
        auditYear: finalResult.auditYear,
        status: finalResult.status,
        version: finalResult.version,
        publishedOnDate: finalResult.publishedOnDate,
        createdAt: finalResult.createdAt,
        createdBy: finalResult.createdBy,
        updatedAt: finalResult.updatedAt,
        updatedBy: finalResult.updatedBy,
        auditType: finalResult.auditType,
        planType: auditType.planType,
        systemMaster: systemMaster,
        // systemType: systemType.name,
        // systemTypeId: systemType.id,
        entityTypeId: entityType.id,
        entityType: entityType.name,
        comments: finalResult.comments,
        location: locationData.locationName,
        locationId: locationData.id,
        organizationId: finalResult.organizationId,
        prefixSuffix: finalResult.prefixSuffix,
        // systemMaster: systemMaster.name,
        // systemMasterId: systemMaster.id,
        // roleName: role.roleName,
        roleId: finalResult.roleId || null,
        auditPlanEntityWise: auditPlanEnt,
      };
    } catch (err) {
      this.logger.error(
        `GET /api/auditPlan/getUnitWiseData/${id} - Service failed`,
        err.stack || err.message,
      );
      throw new InternalServerErrorException(err);
    }
  }

  async isLoggedinUsercreateAuditPlan(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: { select: { entityName: true } } },
      });

      const result = [];
      if (activeUser.userType !== 'globalRoles') {
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

        const entityData: any = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            users: { has: activeUser.id },
          },
          include: { location: true },
        });

        const functionSpoc = await this.prisma.functions.findMany({
          where: { functionSpoc: { has: activeUser.id } },
        });
        const unitIds = functionSpoc.map((value) => value.unitId);
        if (functionSpoc?.length > 0) {
          const value = await this.auditSettingsData(
            'Function SPOC',
            activeUser.organizationId,
            {
              entityData: entityData.map((value) => value.id),
              entityDataNames: entityData.map((value) => value.entityName),
              entityId: activeUser.entityId,
              locationId: activeUser.locationId,
              entityLocation: entityData.map((value) => value.locationId),
              entityName: activeUser.entity.entityName,
              unitIds,
            },
            false,
          );
          result.push(value);
        }

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
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async isLoggedinUsercreateAuditPlanByAuditTypeId(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: true, location: true },
      });

      const auditType: any = await this.auditSettings.findById(id);

      if (auditType?.whoCanPlan === 'All') {
        return true;
      } else if (
        auditType?.whoCanPlan === 'MCOE' &&
        userId.kcRoles.roles.includes('ORG-ADMIN')
      ) {
        return true;
      } else if (
        auditType?.whoCanPlan === 'IMS Coordinator' &&
        userId.kcRoles.roles.includes('MR')
      ) {
        return true;
      } else if (auditType?.whoCanPlan === 'Function SPOC') {
        const functionSpoc = await this.prisma.functions.findMany({
          where: { functionSpoc: { has: activeUser.id } },
        });
        const unitIds = functionSpoc.map((value) => value.unitId);
        const locationData = ['All', ...unitIds];
        return auditType?.planningUnit?.filter((item: any) =>
          locationData?.includes(item.id),
        ).length > 0
          ? true
          : false;
      } else if (auditType?.whoCanPlan === 'Entity Head') {
        const entityData: any = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            users: { has: activeUser.id },
          },
          include: { location: true },
        });
        const entityIds = entityData?.map((value) => value?.id);
        const entityLocatioNames = entityData.map((value) => value.locationId);
        const entityNames = entityData?.map((value) => value?.entityName);
        const planningUnitData = auditType?.planningUnit?.map(
          (item: any) => item?.id,
        );
        if (
          planningUnitData.includes('All') &&
          !auditType?.planningEntity.hasOwnProperty('id')
        ) {
          return true;
        } else if (
          planningUnitData.includes('All') &&
          entityNames?.includes(auditType?.planningEntity?.entityName)
        ) {
          return true;
        } else if (
          planningUnitData.filter((value) => entityLocatioNames.includes(value))
            .length > 0 &&
          entityIds.includes(auditType?.planningEntity?.id)
        ) {
          return true;
        }
      }
      return false;
    } catch (err) {}
  }

  async isLoggedinUsercreateAuditScheduleByAuditTypeId(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: true, location: true },
      });

      const auditType: any = await this.auditSettings.findById(id);

      if (auditType?.whoCanSchedule === 'All') {
        return true;
      } else if (
        auditType?.whoCanSchedule === 'MCOE' &&
        userId.kcRoles.roles.includes('ORG-ADMIN')
      ) {
        return true;
      } else if (
        auditType?.whoCanSchedule === 'IMS Coordinator' &&
        userId.kcRoles.roles.includes('MR')
      ) {
        return true;
      } else if (auditType?.whoCanSchedule === 'Function SPOC') {
        const functionSpoc = await this.prisma.functions.findMany({
          where: { functionSpoc: { has: activeUser.id } },
        });
        const unitIds = functionSpoc.map((value) => value.unitId);
        const locationData = ['All', ...unitIds];
        return auditType?.schedulingUnit?.filter((item: any) =>
          locationData?.includes(item.id),
        ).length > 0
          ? true
          : false;
      } else if (auditType?.whoCanSchedule === 'Entity Head') {
        const entityData: any = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            users: { has: activeUser.id },
          },
          include: { location: true },
        });
        const entityIds = entityData?.map((value) => value?.id);
        const entityLocatioNames = entityData.map((value) => value.locationId);
        const entityNames = entityData?.map((value) => value?.entityName);
        const planningUnitData = auditType?.schedulingUnit?.map(
          (item: any) => item?.id,
        );
        if (
          planningUnitData.includes('All') &&
          !auditType?.schedulingEntity.hasOwnProperty('id')
        ) {
          return true;
        } else if (
          planningUnitData.includes('All') &&
          entityNames?.includes(auditType?.schedulingEntity?.entityName)
        ) {
          return true;
        } else if (
          planningUnitData.filter((value) => entityLocatioNames.includes(value))
            .length > 0 &&
          entityIds.includes(auditType?.schedulingEntity?.id)
        ) {
          return true;
        }
      }
      return false;
    } catch (err) {}
  }

  async auditSettingsData(type, orgId, entity, entityHead) {
    //Entity Head
    //All
    let types = ['All', type];
    const {
      entityId,
      locationId,
      entityName,
      entityData,
      entityLocation,
      entityDataNames,
      unitIds,
    } = entity;
    let auditTypeData;
    if (type === 'MCOE' || type === 'IMS Coordinator') {
      auditTypeData = await this.auditSettings.find({
        organizationId: orgId,
        whoCanPlan: { $in: types },
        deleted: false,
      });
      return auditTypeData.length > 0 ? true : false;
    } else if (type === 'Function SPOC') {
      const locationData = ['All', ...unitIds];
      auditTypeData = await this.auditSettings.find({
        organizationId: orgId,
        whoCanPlan: { $in: types },
        'planningUnit.id': { $in: locationData },
        // planningEntity: { $exists: false },
        deleted: false,
      });
      return auditTypeData.length > 0 ? true : false;
    } else {
      if (entityHead === true) {
        const locations = ['All', locationId];

        auditTypeData = await this.auditSettings.find({
          whoCanPlan: { $in: types },
          'planningUnit.id': 'All',
          planningEntity: { $exists: false },
          deleted: false,
        });
        if (auditTypeData?.length == 0) {
          auditTypeData = await this.auditSettings.find({
            whoCanPlan: { $in: types },
            'planningUnit.id': 'All',
            'planningEntity.entityName': { $in: entityDataNames },
            deleted: false,
          });

          if (auditTypeData?.length === 0) {
            auditTypeData = await this.auditSettings.find({
              whoCanPlan: { $in: types },
              'planningUnit.id': { $in: entityLocation },
              'planningEntity.id': { $in: entityData },
              deleted: false,
            });
          }

          if (auditTypeData?.length === 0) {
            auditTypeData = await this.auditSettings.find({
              whoCanPlan: { $in: types },
              deleted: false,
            });
          }
        }

        return auditTypeData.length > 0 ? true : false;
      } else {
        auditTypeData = await this.auditSettings.find({
          organizationId: orgId,
          whoCanPlan: { $in: types },
          deleted: false,
        });
        return auditTypeData.length > 0 ? true : false;
      }
    }
  }

  async getEntityListingForMonthType(auditPlanId, query, user) {
    try {
      const { locationId, month, orgId, scope, selectedFunction } = query;

      // Define month arrays for different fiscal year formats
      const monthsJanToDec = [
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
      const monthsAprToMar = [
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
      if ((!!scope && scope === 'Unit') || scope === 'Corporate Function') {
        const [entities, orgSettings, auditPlanEntityWise, sampleData] =
          await Promise.all([
            // Fetch all departments by location id
            this.prisma.entity.findMany({
              where: {
                locationId: locationId,
                deleted: false,
                organizationId: orgId,
              },
              select: {
                id: true,
                entityName: true,
              },
            }),
            // Fetch the fiscal year format from org settings
            this.prisma.organization.findFirst({
              where: {
                id: orgId,
                deleted: false,
              },
              select: {
                fiscalYearQuarters: true,
              },
            }),
            //fetch all the audit plan entity wise entries matching with audit plan id
            this.auditPlanEntityWiseModel.findOne({
              auditPlanId: new ObjectId(auditPlanId),
              deleted: false,
              entityId: locationId, ///in case of scope == unit, location id is being stored in entityId
            }),

            this.auditPlanEntityWiseModel.findOne({
              auditPlanId: new ObjectId(auditPlanId),
            }),
          ]);
        if (!entities.length) {
          return {
            data: [],
            message: 'No Departments found in the Selected Unit!',
          };
        }
        if (!auditPlanEntityWise) {
          return {
            data: [],
            message:
              'There is no Audit Plan Entity found with the Provided auditPlanId!',
          };
        }

        // console.log("entities ------>", entities);
        // console.log("audit plan entity wise ---->", auditPlanEntityWise);

        // Determine which month array to use based on fiscal year format
        const months =
          orgSettings.fiscalYearQuarters === 'Jan - Dec'
            ? monthsJanToDec
            : monthsAprToMar;

        // console.log("months====", months);

        // Map auditSchedule to months
        const scheduledMonths = auditPlanEntityWise.auditschedule
          ?.map((scheduled, index) => (scheduled ? months[index] : null))
          .filter((month) => month !== null);

        // console.log("schedule months --->", scheduledMonths);

        if (scheduledMonths && scheduledMonths.length) {
          if (scheduledMonths.includes(month)) {
            return {
              data: entities,
              auditPlanEntityWiseId: auditPlanEntityWise?._id,
              message:
                'Successfully fetched departments for the selected month!',
            };
          } else {
            return {
              data: [],
              message: 'No Matching Departments found for the selected month!',
            };
          }
        } else {
          return {
            data: [],
            message: 'No Unit Has Been Added in the Associated Audit Plan!',
          };
        }
      } else if (
        selectedFunction !== undefined &&
        selectedFunction !== 'undefined' &&
        selectedFunction?.length > 0
      ) {
        const [entities, orgSettings, auditPlanEntityWise] = await Promise.all([
          // Fetch all departments by location id
          this.prisma.entity.findMany({
            where: {
              functionId: { in: selectedFunction },
              deleted: false,
              organizationId: orgId,
            },
            select: {
              id: true,
              entityName: true,
              functionId: true,
            },
          }),

          // Fetch the fiscal year format from org settings
          this.prisma.organization.findFirst({
            where: { id: orgId, deleted: false },
            select: {
              fiscalYearQuarters: true,
            },
          }),
          //fetch all the audit plan entity wise entries matching with audit plan id
          this.auditPlanEntityWiseModel.find({
            auditPlanId: new ObjectId(auditPlanId),
            deleted: false,
          }),
        ]);

        if (!entities.length) {
          return {
            data: [],
            message: 'No Departments found in the Selected Unit!',
          };
        }

        if (!auditPlanEntityWise) {
          return {
            data: [],
            message:
              'There is no Audit Plan Entity found with the Provided auditPlanId!',
          };
        }

        // Determine which month array to use based on fiscal year format

        // Filter entities based on auditPlanEntityWise

        if (entities.length) {
          // Create the entityToEntityWiseMapping

          return {
            data: entities,
            entityToEntityWiseMapping: entities,
            message: 'Successfully fetched departments for the selected month!',
          };
        } else {
          return {
            data: [],
            message: 'No Matching Departments found for the selected month!',
          };
        }
      } else if (scope === 'useFunctionsForPlanning') {
        const [orgSettings, auditPlanEntityWise] = await Promise.all([
          // Fetch all departments by location id

          // Fetch the fiscal year format from org settings
          this.prisma.organization.findFirst({
            where: { id: orgId, deleted: false },
            select: {
              fiscalYearQuarters: true,
            },
          }),
          //fetch all the audit plan entity wise entries matching with audit plan id
          this.auditPlanEntityWiseModel.find({
            auditPlanId: new ObjectId(auditPlanId),
            deleted: false,
          }),
        ]);

        const months =
          orgSettings.fiscalYearQuarters === 'Jan - Dec'
            ? monthsJanToDec
            : monthsAprToMar;

        // Find the index of the month from the query
        const monthIndex = months.indexOf(month);

        // Check if the month is valid
        if (monthIndex === -1) {
          return {
            data: [],
            message: 'Invalid month in the query!',
          };
        }

        const filterMonthData = auditPlanEntityWise.filter(
          (value) => value.auditschedule[monthIndex] === true,
        );

        if (filterMonthData.length > 0) {
          const functionIds = filterMonthData.map(
            (value: any) => value?.entityId,
          );

          const functionData = await this.prisma.functions.findMany({
            where: { id: { in: functionIds }, organizationId: orgId },
            select: { id: true, name: true },
          });

          return {
            data: [],
            functionData,
            message: 'Successfully Fetched Functions For Month',
          };
        } else {
          return {
            data: [],
            message: 'No Function Found For Month!',
          };
        }

        // Filter entities based on auditPlanEntityWise
        // const auditPlanEntry = auditPlanEntityWise.find(
        //   (entry) => entry.entityId === entity.id,
        // );
      } else if (!!scope) {
        const [entities, orgSettings, auditPlanEntityWise] = await Promise.all([
          // Fetch all departments by location id
          this.prisma.entity.findMany({
            where: {
              locationId: locationId,
              deleted: false,
              organizationId: orgId,
            },
            select: {
              id: true,
              entityName: true,
              functionId: true,
            },
          }),
          // Fetch the fiscal year format from org settings
          this.prisma.organization.findFirst({
            where: { id: orgId, deleted: false },
            select: {
              fiscalYearQuarters: true,
            },
          }),
          //fetch all the audit plan entity wise entries matching with audit plan id
          this.auditPlanEntityWiseModel.find({
            auditPlanId: new ObjectId(auditPlanId),
            deleted: false,
          }),
        ]);

        if (!entities.length) {
          return {
            data: [],
            message: 'No Departments found in the Selected Unit!',
          };
        }

        if (!auditPlanEntityWise) {
          return {
            data: [],
            message:
              'There is no Audit Plan Entity found with the Provided auditPlanId!',
          };
        }

        // Determine which month array to use based on fiscal year format
        const months =
          orgSettings.fiscalYearQuarters === 'Jan - Dec'
            ? monthsJanToDec
            : monthsAprToMar;

        // Find the index of the month from the query
        const monthIndex = months.indexOf(month);

        // Check if the month is valid
        if (monthIndex === -1) {
          return {
            data: [],
            message: 'Invalid month in the query!',
          };
        }

        // Filter entities based on auditPlanEntityWise
        const filteredEntities = entities.filter((entity) => {
          const auditPlanEntry = auditPlanEntityWise.find(
            (entry) => entry.entityId === entity.id,
          );

          return auditPlanEntry && auditPlanEntry.auditschedule[monthIndex];
        });

        if (filteredEntities.length) {
          // Create the entityToEntityWiseMapping
          const entityToEntityWiseMapping = filteredEntities.map((entity) => {
            // Find the corresponding entry in auditPlanEntityWise
            const auditPlanEntityWiseEntry = auditPlanEntityWise.find(
              (entry) => entry.entityId === entity.id,
            );

            return {
              id: entity.id,
              entityName: entity.entityName,
              auditPlanEntityWiseId: auditPlanEntityWiseEntry
                ? auditPlanEntityWiseEntry._id
                : null,
            };
          });
          return {
            data: filteredEntities,
            entityToEntityWiseMapping: entityToEntityWiseMapping,
            message: 'Successfully fetched departments for the selected month!',
          };
        } else {
          return {
            data: [],
            message: 'No Matching Departments found for the selected month!',
          };
        }
      } else if (!!scope && scope === 'ENtitytype') {
      } else {
        return {
          data: [],
          message: 'Please provide scope!',
        };
      }
    } catch (err) {
      // console.log('error', err);
      throw new InternalServerErrorException(err);
    }
  }
  async getEntityListingForDateRange(auditPlanId, query, user) {
    try {
      const { dateRange, scope, locationId, auditPlanEntityWiseId, orgId } =
        query;
      // console.log('checkaudit query in getEntityListingForDateRange', typeof dateRange);

      if (typeof dateRange === 'string') {
        const auditPlanUnit = await this.auditPlanUnitwiseModel.find({
          auditPlanId: auditPlanId,
          locationId: locationId,
          auditPlanEntitywiseId: auditPlanEntityWiseId,
          // deleted: false,
          isDraft: false,
          // other necessary filters...
        });

        // console.log("audit plan unittt-====>", auditPlanUnit);

        if (!auditPlanUnit) {
          return {
            data: [],
            message: 'No matching audit plan unit found!',
          };
        }
        const entities = await this.prisma.entity.findMany({
          where: {
            locationId: locationId,
            deleted: false,
            organizationId: orgId,
          },
          select: {
            id: true,
            entityName: true,
            // other necessary fields...
          },
        });

        // //console.log('checkaudit entities', entities);

        return {
          data: entities,
          auditPlanEntityWiseId: auditPlanUnit[0]?.auditPlanEntitywiseId,
          message:
            'Successfully fetched entities for the selected date range in the unit!',
        };
      }

      // Parse the start and end dates from the dateRange query
      const [startDate, endDate] = dateRange
        .split(' - ')
        .map((date) => new Date(date));

      // //console.log('checkaudit startDate endDate', startDate, endDate);

      const payloadStartDate = startDate.toISOString().split('T')[0];
      const payloadEndDate = endDate.toISOString().split('T')[0];

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException(
          'Invalid date range format. Expected format: YYYY-MM-DD - YYYY-MM-DD',
        );
      }

      // //console.log(
      //   'checkaudit start date end date auditPlanId ',
      //   startDate,
      //   endDate,
      //   auditPlanId,
      // );

      if (scope === 'Department') {
        // Fetch all audit plan unit wise entries matching with audit plan id
        const auditPlanUnits = await this.auditPlanUnitwiseModel.find({
          auditPlanId: auditPlanId,
          isDraft: false,
          // deleted: false,
        });

        // //console.log('checkaudit auditPlanUnits', auditPlanUnits);

        // Filter audit plan units based on the exact date range (ignoring time)
        const matchingAuditPlanUnits = auditPlanUnits.filter((unit) => {
          const unitStartDate = new Date(unit.fromDate)
            .toISOString()
            .split('T')[0];
          const unitEndDate = new Date(unit.toDate).toISOString().split('T')[0];

          return (
            unitStartDate === payloadStartDate && unitEndDate === payloadEndDate
          );
        });

        // //console.log(
        //   'checkaudit matchingAuditPlanUnits',
        //   matchingAuditPlanUnits,
        // );

        // Extract unique auditPlanEntitywiseIds from the filtered audit plan units
        const auditPlanEntitywiseIds = [
          ...new Set(
            matchingAuditPlanUnits.map((unit: any) =>
              unit.auditPlanEntitywiseId.toString(),
            ),
          ),
        ];

        // //console.log(
        //   'checkaudit auditPlanEntitywiseIds',
        //   auditPlanEntitywiseIds,
        // );

        // Fetch audit plan entity wise entries matching with the extracted ids
        const auditPlanEntities = await this.auditPlanEntityWiseModel.find({
          _id: { $in: auditPlanEntitywiseIds.map((id) => new ObjectId(id)) },
          deleted: false,
        });

        // //console.log('checkaudit auditPlanEntities', auditPlanEntities);

        // Extract unique entity IDs from the audit plan entities
        const entityIds = auditPlanEntities.map((entity) => entity.entityId);

        // //console.log('checkaudit entityIds', entityIds);

        // Fetch entities that match the extracted entity IDs
        const entities = await this.prisma.entity.findMany({
          where: {
            id: { in: entityIds },
            deleted: false,
            organizationId: user.orgId, // assuming orgId is part of the user object
          },
          select: {
            id: true,
            entityName: true,
          },
        });

        // //console.log('checkaudit entities', entities);

        // Create the entityToEntityWiseMapping
        const entityToEntityWiseMapping = entities.map((entity) => {
          // Find the corresponding entry in auditPlanEntityWise
          const auditPlanEntityWiseEntry = auditPlanEntities.find(
            (entry) => entry.entityId === entity.id,
          );

          return {
            id: entity.id,
            entityName: entity.entityName,
            auditPlanEntityWiseId: auditPlanEntityWiseEntry
              ? auditPlanEntityWiseEntry._id
              : null,
          };
        });

        if (!entities.length) {
          return {
            data: [],
            message: 'No entities found matching the selected date range!',
          };
        }

        return {
          data: entities,
          entityToEntityWiseMapping: entityToEntityWiseMapping,
          message: 'Successfully fetched entities for the selected date range!',
        };
      }
      if (scope === 'Unit' || scope === 'Corporate Function') {
        // Fetch a single audit plan unit wise entry matching with audit plan id
        const auditPlanUnit = await this.auditPlanUnitwiseModel.find({
          auditPlanId: auditPlanId,
          locationId: locationId,
          auditPlanEntitywiseId: auditPlanEntityWiseId,
          // deleted: false,
          isDraft: false,
          // other necessary filters...
        });

        // console.log("audit plan unittt-====>", auditPlanUnit);

        if (!auditPlanUnit) {
          return {
            data: [],
            message: 'No matching audit plan unit found!',
          };
        }
        // Filter the auditPlanUnits array
        const matchingUnits = auditPlanUnit.filter((unit: any) => {
          const unitStartDate = new Date(unit.fromDate)
            .toISOString()
            .split('T')[0];
          const unitEndDate = new Date(unit.toDate).toISOString().split('T')[0];

          return (
            unitStartDate === payloadStartDate && unitEndDate === payloadEndDate
          );
        });

        // //console.log('checkaudit matchingUnits', matchingUnits);

        if (!matchingUnits?.length) {
          return {
            data: [],
            message:
              'No matching audit plan units found for the selected date range!',
          };
        }

        // Fetch entities based on the unitId
        const entities = await this.prisma.entity.findMany({
          where: {
            locationId: locationId,
            deleted: false,
            organizationId: orgId,
          },
          select: {
            id: true,
            entityName: true,
            // other necessary fields...
          },
        });

        // //console.log('checkaudit entities', entities);

        return {
          data: entities,
          auditPlanEntityWiseId: auditPlanUnit[0]?.auditPlanEntitywiseId,
          message:
            'Successfully fetched entities for the selected date range in the unit!',
        };
      } else {
        return {
          data: [],
          message: 'Invalid or missing scope!',
        };
      }
    } catch (err) {
      // console.error('Error in getEntityListingForDateRange:', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getDateRangesByAuditPlanId(auditPlanId, query) {
    try {
      const { locationId } = query;

      // Fetch all audit plan unit wise entries matching with audit plan id
      const auditPlanUnits = await this.auditPlanUnitwiseModel.find({
        auditPlanId: new ObjectId(auditPlanId),
        unitId: locationId,
        deleted: false,
        isDraft: false,
      });

      if (!auditPlanUnits.length) {
        return {
          data: [],
          message: 'No Audit Plan Units found with the provided auditPlanId!',
        };
      }

      // //console.log("dateranges in audit plan unit", auditPlanUnits);

      // Extracting and formatting date ranges
      const dateRanges = auditPlanUnits
        // .map((unit) => {
        //   return {
        //     startDate: unit.fromDate
        //       ? moment(unit.fromDate).format('DD-MM-YYYY')
        //       : null,
        //     endDate: unit.toDate
        //       ? moment(unit.toDate).format('DD-MM-YYYY')
        //       : null,
        //   };
        // })
        .map((unit) => {
          return {
            startDate: unit.fromDate
              ? unit.fromDate.toISOString().split('T')[0]
              : null,
            endDate: unit.toDate
              ? unit.toDate.toISOString().split('T')[0]
              : null,
          };
        })
        .filter((dateRange) => dateRange.startDate && dateRange.endDate);

      // //console.log('checkaudit dateRanges', dateRanges);

      return {
        data: dateRanges,
        message:
          'Successfully fetched date ranges for the provided auditPlanId!',
      };
    } catch (err) {
      // console.error('Error in getDateRangesByAuditPlanId:', err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async getAuditPeriodForMonthPlanType(auditPlanId, query) {
    try {
      const { locationId, month, orgId, scope, selectedFunction } = query;

      // Define month arrays for different fiscal year formats
      const monthsJanToDec = [
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
      const monthsAprToMar = [
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
      const auditPlan = await this.auditPlanModel.findById(auditPlanId);
      const auditType = await this.auditSettings.findById(auditPlan.auditType);
      if (auditType?.useFunctionsForPlanning === true) {
        if (selectedFunction?.length > 0) {
          const [orgSettings, auditPlanEntityWiseEntries] = await Promise.all([
            // Fetch the fiscal year format from org settings
            this.prisma.organization.findFirst({
              where: { id: orgId, deleted: false },
              select: {
                fiscalYearQuarters: true,
              },
            }),
            //fetch all the audit plan entity wise entries matching with audit plan id
            this.auditPlanEntityWiseModel.find({
              auditPlanId: new ObjectId(auditPlanId),
              // entityId: locationId,
              entityId: { $in: selectedFunction },
              deleted: false,
            }),
          ]);
          const auditPeriodSet = new Set();
          const auditPlanEntityIdLookupArray = {};

          auditPlanEntityWiseEntries.forEach((entry: any) => {
            // //console.log("checkaudit unitEntries", unitEntries);

            // Add each scheduled month to the Set
            const months =
              orgSettings.fiscalYearQuarters === 'Jan - Dec'
                ? monthsJanToDec
                : monthsAprToMar;
            entry.auditschedule.forEach((scheduled, index) => {
              if (scheduled) {
                auditPeriodSet.add(months[index]);
              }
            });

            // Populate the lookup array
            const lookupKey = `${entry.entityId}-${auditPlanId}`;
            auditPlanEntityIdLookupArray[lookupKey] = entry._id.toString();
          });
          // Convert Set to Array
          const auditPeriodArray = Array.from(auditPeriodSet);
          return {
            data: {
              auditPeriodArray,
              auditPlanEntityIdLookupArray,
            },
            status: false,
            message:
              'Successfully fetched audit period for the selected Audit Plan!',
          };
        } else {
          return {
            status: true,
          };
        }
      } else {
        if (!!scope && scope === 'Unit') {
          const [orgSettings, auditPlanEntityWise] = await Promise.all([
            // Fetch the fiscal year format from org settings
            this.prisma.organization.findFirst({
              where: { id: orgId },
              select: {
                fiscalYearQuarters: true,
              },
            }),
            //fetch all the audit plan entity wise entries matching with audit plan id
            this.auditPlanEntityWiseModel.findOne({
              auditPlanId: new ObjectId(auditPlanId),
              entityId: locationId,
              deleted: false,
            }),
          ]);
          if (!auditPlanEntityWise) {
            return {
              data: [],
              status: false,

              message:
                'There is no Audit Plan Entity found with the Provided auditPlanId!',
            };
          }

          // Check for corresponding entry in auditPlanUnitWise
          const unitWiseEntry: any = await this.auditPlanUnitwiseModel
            .find({
              auditPlanEntitywiseId: auditPlanEntityWise?._id.toString(),
              isDraft: false,
            })
            .select(
              '_id auditPlanEntitywiseId fromDate toDate auditPlanId auditors isDraft teamLeadId',
            );
          if (unitWiseEntry && unitWiseEntry.length) {
            const finalArray = unitWiseEntry.map((item) => {
              const months =
                orgSettings.fiscalYearQuarters === 'Jan - Dec'
                  ? monthsJanToDec
                  : monthsAprToMar;
              const scheduledMonths = auditPlanEntityWise.auditschedule
                .map((scheduled, index) => (scheduled ? months[index] : null))
                .filter((month) => month !== null);

              if (item?.auditors !== undefined && item?.auditors.length > 0) {
                return {
                  id: item._id,
                  months: [
                    ...scheduledMonths,
                    `${item.fromDate.toISOString().split('T')[0]} - ${
                      item.toDate.toISOString().split('T')[0]
                    }`,
                  ],
                  startDate: item.fromDate
                    ? item.fromDate.toISOString().split('T')[0]
                    : null,
                  endDate: item.toDate
                    ? item.toDate.toISOString().split('T')[0]
                    : null,
                  teamLeadId: item?.teamLeadId,
                  auditors: item.auditors,
                };
              } else {
                return {
                  id: item._id,
                  months: [
                    ...scheduledMonths,
                    `${item.fromDate.toISOString().split('T')[0]} - ${
                      item.toDate.toISOString().split('T')[0]
                    }`,
                  ],
                  startDate: item.fromDate
                    ? item.fromDate.toISOString().split('T')[0]
                    : null,
                  endDate: item.toDate
                    ? item.toDate.toISOString().split('T')[0]
                    : null,
                  teamLeadId: item?.teamLeadId,
                };
              }
            });

            return {
              data: finalArray,
              status: false,

              auditPlanEntityWiseId: auditPlanEntityWise?._id,
              isFinaliseDatesExist: true,
              message:
                'Successfully fetched date ranges for the selected Audit Plan!',
            };
          } else {
            // If no entry, determine month names based on auditschedule
            const months =
              orgSettings.fiscalYearQuarters === 'Jan - Dec'
                ? monthsJanToDec
                : monthsAprToMar;
            const scheduledMonths = auditPlanEntityWise.auditschedule
              .map((scheduled, index) => (scheduled ? months[index] : null))
              .filter((month) => month !== null);
            return {
              data: scheduledMonths,
              auditPlanEntityWiseId: auditPlanEntityWise?._id,
              status: false,
              isFinaliseDatesExist: false,
              message:
                'Successfully fetched date ranges for the selected Audit Plan!',
            };
          }
        } else if (!!scope && scope === 'Department') {
          const resultArray = [];
          const [orgSettings, auditPlanEntityWiseEntries, entities] =
            await Promise.all([
              // Fetch the fiscal year format from org settings
              this.prisma.organization.findFirst({
                where: { id: orgId, deleted: false },
                select: {
                  fiscalYearQuarters: true,
                },
              }),
              //fetch all the audit plan entity wise entries matching with audit plan id
              this.auditPlanEntityWiseModel.find({
                auditPlanId: new ObjectId(auditPlanId),
                // entityId: locationId,
                deleted: false,
              }),

              this.prisma.entity.findMany({
                where: {
                  locationId: locationId,
                  deleted: false,
                  organizationId: orgId,
                },
                select: {
                  id: true,
                  entityName: true,
                },
              }),
            ]);

          // //console.log("checkaudit auditPlanEntityWiseEntries", auditPlanEntityWiseEntries);

          if (!entities.length) {
            return {
              data: [],
              status: false,
              message: 'No Departments found in the Selected Unit!',
            };
          }

          if (
            !auditPlanEntityWiseEntries ||
            !auditPlanEntityWiseEntries?.length
          ) {
            return {
              data: [],
              status: false,
              message:
                'There is no Audit Plan Entity found with the Provided auditPlanId!',
            };
          }

          const auditPlanEntityWiseIds = auditPlanEntityWiseEntries?.map(
            (item) => item._id,
          );

          const unitWiseEntry = await this.auditPlanUnitwiseModel
            .find({
              auditPlanEntitywiseId: { $in: auditPlanEntityWiseIds },
              isDraft: false,
            })
            .select(
              '_id auditPlanEntitywiseId fromDate toDate auditPlanId teamLeadId isDraft',
            );

          // //console.log('checkaudit unitWiseEntry', unitWiseEntry);

          try {
            const auditPeriodSet = new Set();
            const auditPlanEntityIdLookupArray = {};

            auditPlanEntityWiseEntries.forEach((entry: any) => {
              const unitEntries = unitWiseEntry.filter(
                (u: any) =>
                  u.auditPlanEntitywiseId.toString() === entry._id.toString(),
              );

              // //console.log("checkaudit unitEntries", unitEntries);

              if (unitEntries.length > 0) {
                unitEntries.forEach((unitEntry: any) => {
                  // Add the date range for each unitEntry to the Set
                  const dateRange = `${
                    unitEntry.fromDate.toISOString().split('T')[0]
                  } - ${unitEntry.toDate.toISOString().split('T')[0]}`;
                  const teamLeadId = unitEntry?.teamLeadId;
                  auditPeriodSet.add(dateRange);
                  if (teamLeadId) {
                    auditPeriodSet.add(teamLeadId);
                  }
                });
              } else {
                // Add each scheduled month to the Set
                const months =
                  orgSettings.fiscalYearQuarters === 'Jan - Dec'
                    ? monthsJanToDec
                    : monthsAprToMar;
                entry.auditschedule.forEach((scheduled, index) => {
                  if (scheduled) {
                    auditPeriodSet.add(months[index]);
                  }
                });
              }

              // Populate the lookup array
              const lookupKey = `${entry.entityId}-${auditPlanId}`;
              auditPlanEntityIdLookupArray[lookupKey] = entry._id.toString();
            });
            // Convert Set to Array
            const auditPeriodArray = Array.from(auditPeriodSet);

            // //console.log('checkaudit auditPeriodArray', auditPeriodArray);
            // //console.log('checkaudit auditPlanEntityIdLookupArray', auditPlanEntityIdLookupArray);

            // ... existing code to return or process the data ...

            return {
              data: {
                auditPeriodArray,
                auditPlanEntityIdLookupArray,
                status: false,
              },
              message:
                'Successfully fetched audit period for the selected Audit Plan!',
            };
          } catch (error) {
            //console.log('checkaudit error in foreach', error);
          }
        }
        // else if (!!scope) {
        // }
        else if (!!scope) {
          const resultArray = [];
          const [orgSettings, auditPlanEntityWiseEntries, entities] =
            await Promise.all([
              // Fetch the fiscal year format from org settings
              this.prisma.organization.findFirst({
                where: { id: orgId, deleted: false },
                select: {
                  fiscalYearQuarters: true,
                },
              }),
              //fetch all the audit plan entity wise entries matching with audit plan id
              this.auditPlanEntityWiseModel.find({
                auditPlanId: new ObjectId(auditPlanId),
                // entityId: locationId,
                deleted: false,
              }),

              this.prisma.entity.findMany({
                where: {
                  locationId: locationId,
                  deleted: false,
                  organizationId: orgId,
                  entityType: {
                    name: { mode: 'insensitive', equals: scope },
                  },
                },
                select: {
                  id: true,
                  entityName: true,
                },
              }),
            ]);

          // //console.log("checkaudit auditPlanEntityWiseEntries", auditPlanEntityWiseEntries);

          if (!entities.length) {
            return {
              data: [],
              status: false,
              message: 'No Departments found in the Selected Unit!',
            };
          }

          if (
            !auditPlanEntityWiseEntries ||
            !auditPlanEntityWiseEntries?.length
          ) {
            return {
              data: [],
              status: false,
              message:
                'There is no Audit Plan Entity found with the Provided auditPlanId!',
            };
          }

          const auditPlanEntityWiseIds = auditPlanEntityWiseEntries?.map(
            (item) => item._id,
          );

          const unitWiseEntry = await this.auditPlanUnitwiseModel
            .find({
              auditPlanEntitywiseId: { $in: auditPlanEntityWiseIds },
              isDraft: false,
            })
            .select(
              '_id auditPlanEntitywiseId fromDate toDate auditPlanId teamLeadId isDraft',
            );

          try {
            const auditPeriodSet = new Set();
            const auditPlanEntityIdLookupArray = {};

            auditPlanEntityWiseEntries.forEach((entry: any) => {
              const unitEntries = unitWiseEntry.filter(
                (u: any) =>
                  u.auditPlanEntitywiseId.toString() === entry._id.toString(),
              );

              if (unitEntries.length > 0) {
                unitEntries.forEach((unitEntry: any) => {
                  // Add the date range for each unitEntry to the Set
                  const dateRange = `${
                    unitEntry.fromDate.toISOString().split('T')[0]
                  } - ${unitEntry.toDate.toISOString().split('T')[0]}`;
                  const teamLeadId = unitEntry?.teamLeadId;
                  auditPeriodSet.add(dateRange);
                  if (teamLeadId) {
                    auditPeriodSet.add(teamLeadId);
                  }
                });
              } else {
                // Add each scheduled month to the Set
                const months =
                  orgSettings.fiscalYearQuarters === 'Jan - Dec'
                    ? monthsJanToDec
                    : monthsAprToMar;
                entry.auditschedule.forEach((scheduled, index) => {
                  if (scheduled) {
                    auditPeriodSet.add(months[index]);
                  }
                });
              }

              // Populate the lookup array
              const lookupKey = `${entry.entityId}-${auditPlanId}`;
              auditPlanEntityIdLookupArray[lookupKey] = entry._id.toString();
            });

            // Convert Set to Array
            const auditPeriodArray = Array.from(auditPeriodSet);

            // //console.log('checkaudit auditPeriodArray', auditPeriodArray);
            // //console.log('checkaudit auditPlanEntityIdLookupArray', auditPlanEntityIdLookupArray);

            // ... existing code to return or process the data ...

            return {
              data: {
                auditPeriodArray,
                auditPlanEntityIdLookupArray,
                status: false,
              },
              message:
                'Successfully fetched audit period for the selected Audit Plan!',
            };
          } catch (error) {
            //console.log('checkaudit error in foreach', error);
          }
        } else {
          const resultArray = [];
          const [orgSettings, auditPlanEntityWise] = await Promise.all([
            // Fetch the fiscal year format from org settings
            this.prisma.organization.findFirst({
              where: { id: orgId, deleted: false },
              select: {
                fiscalYearQuarters: true,
              },
            }),
            //fetch all the audit plan entity wise entries matching with audit plan id
            this.auditPlanEntityWiseModel.findOne({
              auditPlanId: new ObjectId(auditPlanId),
              entityId: locationId,
              deleted: false,
            }),
          ]);

          //console.log("checkaudit auditPlanEntityWiseEntries", auditPlanEntityWiseEntries);

          if (!auditPlanEntityWise) {
            return {
              data: [],
              status: false,

              message:
                'There is no Audit Plan Entity found with the Provided auditPlanId!',
            };
          }

          // Check for corresponding entry in auditPlanUnitWise
          const unitWiseEntry: any = await this.auditPlanUnitwiseModel
            .find({
              auditPlanEntitywiseId: auditPlanEntityWise?._id,
              isDraft: false,
            })
            .select(
              '_id auditPlanEntitywiseId fromDate toDate auditPlanId auditors isDraft teamLeadId',
            );

          if (unitWiseEntry && unitWiseEntry.length) {
            const finalArray = unitWiseEntry.map((item) => {
              const months =
                orgSettings.fiscalYearQuarters === 'Jan - Dec'
                  ? monthsJanToDec
                  : monthsAprToMar;
              const scheduledMonths = auditPlanEntityWise.auditschedule
                .map((scheduled, index) => (scheduled ? months[index] : null))
                .filter((month) => month !== null);

              if (item?.auditors !== undefined && item?.auditors.length > 0) {
                return {
                  id: item._id,
                  months: [
                    ...scheduledMonths,
                    `${item.fromDate.toISOString().split('T')[0]} - ${
                      item.toDate.toISOString().split('T')[0]
                    }`,
                  ],
                  startDate: item.fromDate
                    ? item.fromDate.toISOString().split('T')[0]
                    : null,
                  endDate: item.toDate
                    ? item.toDate.toISOString().split('T')[0]
                    : null,
                  teamLeadId: item?.teamLeadId,
                  auditors: item.auditors,
                };
              } else {
                return {
                  id: item._id,
                  months: [
                    ...scheduledMonths,
                    `${item.fromDate.toISOString().split('T')[0]} - ${
                      item.toDate.toISOString().split('T')[0]
                    }`,
                  ],
                  startDate: item.fromDate
                    ? item.fromDate.toISOString().split('T')[0]
                    : null,
                  endDate: item.toDate
                    ? item.toDate.toISOString().split('T')[0]
                    : null,
                  teamLeadId: item?.teamLeadId,
                };
              }
            });

            return {
              data: finalArray,
              status: true,

              auditPlanEntityWiseId: auditPlanEntityWise?._id,
              isFinaliseDatesExist: true,
              message:
                'Successfully fetched date ranges for the selected Audit Plan!',
            };
          } else {
            // If no entry, determine month names based on auditschedule
            const months =
              orgSettings.fiscalYearQuarters === 'Jan - Dec'
                ? monthsJanToDec
                : monthsAprToMar;
            const scheduledMonths = auditPlanEntityWise.auditschedule
              .map((scheduled, index) => (scheduled ? months[index] : null))
              .filter((month) => month !== null);
            return {
              data: scheduledMonths,
              auditPlanEntityWiseId: auditPlanEntityWise?._id,
              status: true,
              isFinaliseDatesExist: false,
              message:
                'Successfully fetched date ranges for the selected Audit Plan!',
            };
          }
        }
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAuditorsByAuditPlanEntityWiseId(auditPlanEntityWiseId, query, user) {
    try {
      // const { locationId, month, orgId } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          organization: true,
        },
      });

      const auditPlanUnitWise = await this.auditPlanUnitwiseModel
        .findOne({
          auditPlanEntitywiseId: auditPlanEntityWiseId,
          deleted: false,
        })
        .select('auditors');

      if (!auditPlanUnitWise) {
        return {
          data: [],
          message:
            'There is No Audit Plan Entity Wise Found with the Provided Id!',
        };
      }

      if (
        !!auditPlanUnitWise?.auditors &&
        !!auditPlanUnitWise?.auditors.length
      ) {
        const auditorIds = auditPlanUnitWise.auditors.map(
          (auditor) => auditor.id,
        );
        const auditorsWithData = await this.prisma.user.findMany({
          where: {
            id: { in: auditorIds },
            locationId: activeUser.locationId,
            deleted: false,
          },
          select: {
            id: true,
            firstname: true,
            lastname: true,
            username: true,
            email: true,
            avatar: true,
          },
        });

        return {
          data: auditorsWithData,
          message: 'Successfully fetched auditors for the Selected Department!',
        };
      } else {
        return {
          data: [],
          message: 'No Auditors Found for the Selected Audit Plan Entity Wise!',
        };
      }
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAuditPlanEntitywiseId(auditPlanId, entityId, query) {
    try {
      const { locationId, scope } = query;
      let entityIdTobeUsed;
      if (scope === 'Unit' || scope === 'Corporate Function') {
        entityIdTobeUsed = locationId;
      } else {
        entityIdTobeUsed = entityId;
      }

      if (!auditPlanId || !entityId) {
        return {
          data: [],
          message: 'Please provide auditPlanId and entityId both!',
        };
      }

      const auditPlanEntityWise = await this.auditPlanEntityWiseModel
        .findOne({
          auditPlanId: new ObjectId(auditPlanId),
          entityId: entityIdTobeUsed,
          // deleted: false,
        })
        .select('_id');

      return auditPlanEntityWise;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  sendEmail = async (recipients, subject, html) => {
    // console.log('recipents', recipients);
    // console.log('subject', subject);
    // console.log('html', html);

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendBulkEmails(
          recipients,
          subject,
          '',
          html,
        );
      } else {
        try {
          // Check if there are recipients provided
          if (recipients.length === 0) {
            throw new Error('No recipients provided');
          }

          const primaryRecipient = recipients[0]; // First email in the 'To' field
          const ccRecipients = recipients.slice(1); // Rest in the 'CC' field

          await sgMail.send({
            to: primaryRecipient,
            cc: ccRecipients, // CC the rest of the recipients
            from: process.env.FROM,
            subject: subject,
            html: html,
          });
        } catch (error) {
          // console.error('Error sending email:', error);
          throw error;
        }
      }
    } catch (error) {
      // console.error('Error sending email:', error);
      // console.log('errroror, ', error.response.body);
    }
  };

  extractUniqueUserIds(auditPlanUnitWiseData) {
    const userIds = new Set();

    // Add unitHead and imsCoordinator IDs
    if (auditPlanUnitWiseData?.unitHead) {
      userIds.add(auditPlanUnitWiseData?.unitHead?.id);
    }
    if (auditPlanUnitWiseData?.imsCoordinator) {
      userIds.add(auditPlanUnitWiseData?.imsCoordinator?.id);
    }
    if (auditPlanUnitWiseData?.teamLeadId) {
      userIds.add(auditPlanUnitWiseData?.teamLeadId);
    }

    // Add auditor and otherUser IDs
    auditPlanUnitWiseData?.auditors?.forEach((auditor) =>
      userIds.add(auditor?.id),
    );
    auditPlanUnitWiseData?.otherUsers?.forEach((otherUser) =>
      userIds.add(otherUser?.id),
    );

    return Array.from(userIds);
  }

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
      const audits = await this.auditPlanUnitwiseModel.find({
        $or: [
          { 'unitHead.id': activeUser.id, 'unitHead.accepted': 'WAITING' },
          {
            'imsCoordinator.id': activeUser.id,
            'imsCoordinator.accepted': 'WAITING',
          },
          {
            auditors: {
              $elemMatch: { id: activeUser.id, accepted: 'WAITING' },
            },
          },
          { otherUsers: { $elemMatch: { id: activeUser.id } } },
          { plannedBy: activeUser.id },
          { teamLeadId: activeUser.id },
        ],
      });
      // console.log('audits where i am one of the responsible person', audits);
      let auditPlanData = [];
      for (let au of audits) {
        let auditPlan;
        try {
          auditPlan = await this.auditPlanModel.findById(au?.auditPlanId);
        } catch (error) {
          throw new InternalServerErrorException();
        }
        let url;
        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/audit/auditplan/auditplanform/${au?.auditPlanId}?auditplanunitwiseId=${au?._id}`;
        } else {
          url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/audit/auditplan/auditplanform/${au?.auditPlanId}?auditplanunitwiseId=${au._id}`;
        }
        const data: any = {
          au,
          auditPlanName: auditPlan?.auditName ? auditPlan?.auditName : '',
          url: url,
        };
        auditPlanData.push(data);
      }
      return auditPlanData;
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  //below api service for getting auditors based on search filter to be
  //used in finalised modal
  async getAuditorsBasedOnSearchFilters(query) {
    try {
      // console.log("query in getAuditorsBasedOnSearchFilters", query);

      const {
        auditTypeId,
        locationId,
        entityId,
        orgId,
        systemIds,
        functionIds,
        proficiencyIds,
        skip = 0,
        take = 10,
      } = query;
      const systems = JSON.parse(systemIds);
      const functions = JSON.parse(functionIds);
      const proficiencies = JSON.parse(proficiencyIds);

      const auditSettings: any = await this.auditSettings.findById({
        _id: auditTypeId,
      });
      if (!auditSettings) {
        throw new NotFoundException('Audit Type not found');
      }

      //get auditor role id
      const auditorRoleId: any = await this.prisma.role.findFirst({
        where: {
          organizationId: orgId,
          roleName: 'AUDITOR',
        },
      });
      let auditors = [];
      if (!auditSettings.auditorsFromSameUnit) {
        // //console.log('this api is called');
        auditors = await getAllAuditorsBasedFilters(
          this.prisma.user,
          orgId,
          auditorRoleId,
        );
      } else if (auditSettings.auditorsFromSameUnit) {
        auditors = await getAllAuditorsBasedLocationFilters(
          this.prisma.user,
          orgId,
          locationId,
          auditorRoleId,
        );
      }
      if (!!entityId) {
        if (!auditSettings.auditorsFromSameDept) {
          //console.log('not in condition');
          auditors = await filterAuditorBasedOnDepartment(
            auditors,
            entityId,
            'NOTIN',
          );
        } else if (auditSettings.auditorsFromSameDept) {
          // //console.log('in condition');
          auditors = await filterAuditorBasedOnDepartment(
            auditors,
            entityId,
            'IN',
          );
        }
      }

      auditors = await validateAuditorBasedOnAuditorProfile(
        auditors,
        this.auditorProfileModel,
        auditTypeId,
      );

      if (
        auditors.length > 0 &&
        JSON.parse(auditSettings.scope).name === 'Unit'
      ) {
        auditors = await filterBasedScopeUnit(auditors, locationId);
      }

      if (systems?.length && auditors?.length) {
        auditors = await filterAuditorBasedOnFilterBySystem(
          auditors,
          this.auditorProfileModel,
          orgId,
          systems,
        );
      }
      if (functions?.length && auditors?.length) {
        auditors = await filterAuditorBasedOnFilterByLocationFunction(
          auditors,
          this.prisma.location,
          this.prisma.functions,
          this.auditorProfileModel,
          locationId,
        );
      }

      if (proficiencies?.length && auditors?.length) {
        auditors = await filterAuditorBasedOnFilterByProficiencies(
          auditors,
          this.auditorProfileModel,
          orgId,
          proficiencies,
        );
      }
      const paginatedAuditors = auditors.slice(skip, skip + take);

      return {
        data: paginatedAuditors,
        total: auditors.length, // Total count before pagination
      };
      // return auditors;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow the NotFoundException to be handled by the controller
      }
      // Handle other types of errors or throw a generic error
    }
  }

  async addComment(auditPlanUnitWiseId: string, commentPayload) {
    this.logger.log(
      `GET /api/auditPlan/auditPlanUnitWiseId - Service Started`,
      '',
    );
    const newComment = {
      createdBy: commentPayload.createdBy,
      commentString: commentPayload.commentString,
      createdAt: new Date(), // Ensure date is captured when adding the comment
    };

    const updatedDocument = await this.auditPlanUnitwiseModel.findByIdAndUpdate(
      auditPlanUnitWiseId,
      { $push: { comments: newComment } },
      { new: true }, // Return the modified document rather than the original.
    );

    if (!updatedDocument) {
      this.logger.warn(
        `GET /api/auditPlan/auditPlanUnitWiseId - Service failed`,
        '',
      );
      throw new NotFoundException('AuditPlanUnitWise not found');
    }
    this.logger.log(
      `GET /api/auditPlan/auditPlanUnitWiseId - Service SuccessFull`,
      '',
    );
    return updatedDocument;
  }

  async getComments(auditPlanUnitWiseId: string) {
    this.logger.log(
      `GET /api/auditPlan//comments/${auditPlanUnitWiseId} - Service Started`,
      '',
    );
    const auditPlanUnitWise = await this.auditPlanUnitwiseModel.findById(
      auditPlanUnitWiseId,
    );
    if (!auditPlanUnitWise) {
      throw new NotFoundException('AuditPlanUnitWise not found');
    }
    this.logger.log(
      `GET /api/auditPlan//comments/${auditPlanUnitWiseId} - Service Succesfull`,
      '',
    );
    return auditPlanUnitWise.comments;
  }

  async getDetailsForDragAndDrop(user, query) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getDetailsForDragAndDrop - Service started`,
        '',
      );
      const { location, system, year, type, myAudit, status, scope } = query;
      const finalData = [];
      let finalResult = [];
      let completed = [];
      let scheduled = [];
      let auditPlanData = [];

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
        include: { organization: true },
      });

      let whereCondition: any = {};
      if (
        location !== undefined &&
        location !== 'undefined' &&
        location !== '' &&
        location !== 'All' &&
        scope !== 'Unit'
      ) {
        whereCondition = {
          ...whereCondition,
          location: { $in: [location] },
          locationId: { $in: [location] },
        };
      }

      // if (system !== undefined && system !== 'undefined' && system?.length > 0) {
      //   whereCondition = {
      //     ...whereCondition,
      //     systemMasterId: { $in: system },
      //   };
      // }

      if (year !== undefined && year !== 'undefined' && year !== '') {
        whereCondition = { ...whereCondition, auditYear: year };
      }

      if (
        type !== undefined &&
        type !== 'undefined' &&
        type !== '' &&
        type !== 'All'
      ) {
        whereCondition = { ...whereCondition, auditType: type };
      }

      if (
        Object.keys(whereCondition).length === 0 ||
        type === undefined ||
        type === 'undefined'
      ) {
        return [];
      }

      if (status === 'Planned' || status === 'All') {
        let auditPlanDataNeed: any = await this.auditPlanModel.find({
          ...whereCondition,
          deleted: false,
        });

        auditPlanData = auditPlanDataNeed?.map((value) => value._id);

        let data: any = await this.auditPlanEntityWiseModel
          .find({
            auditPlanId: {
              $in: auditPlanData,
            },
          })
          .populate({ path: 'auditPlanId', model: this.auditPlanModel });
        for (let value of data) {
          let [
            mouthData,
            entity,
            location,
            auditSettings,
            entityId,
            systemData,
          ]: any = await Promise.all([
            this.monthDecide(value?.auditschedule, activeUser?.organization),
            this.prisma.entity.findFirst({ where: { id: value.entityId } }),
            this.prisma.location.findFirst({ where: { id: value.entityId } }),
            this.auditSettings.findById({
              _id: new ObjectId(value.auditPlanId.auditType),
            }),
            this.prisma.entity.findMany({
              where: {
                users: { has: activeUser.id },
              },
            }),
            this.SystemModel.find({
              _id: { $in: value?.auditPlanId?.systemMasterId },
            }),
          ]);
          const auditPlanUnitData = await this.auditPlanUnitwiseModel.find({
            auditPlanEntitywiseId: value?._id.toString(),
            auditPlanId: value.auditPlanId._id.toString(),
            auditPeriod: { $in: mouthData },
          });

          let unitMonthNames = [];

          const unitMonthData = auditPlanUnitData?.map((value) => {
            const startDate = value.fromDate
              ? value.fromDate.toISOString().split('T')[0]
              : null;
            const endDate = value.toDate
              ? value.toDate.toISOString().split('T')[0]
              : null;
            unitMonthNames.push(value?.auditPeriod);
            return `${startDate} - ${endDate}`;
          });

          const unitPlanData = auditPlanUnitData?.map((item) => {
            const startDate = item.fromDate
              ? item.fromDate.toISOString().split('T')[0]
              : null;
            const endDate = item.toDate
              ? item.toDate.toISOString().split('T')[0]
              : null;
            unitMonthNames.push(item?.auditPeriod);
            return {
              time: `${startDate} - ${endDate}`,
              auditPlanId: item?.auditPlanId,
              auditPeriod: item?.auditPeriod,
            };
          });
          const functionData = await this.prisma.functions.findMany({
            where: {
              functionSpoc: { has: activeUser.id },
              organizationId: activeUser.organizationId,
            },
          });
          const functionUnitIds = functionData?.map((value) => value.unitId);
          const editAccess =
            await this.validateUserAbleToEditAuditPlanBasedOnAuditType(
              {
                ...activeUser,
                roles: user?.kcRoles?.roles,
                unitId: functionUnitIds,
              },
              auditSettings,
              value?.auditPlanId,
            );

          const entityIds =
            entityId?.length > 0 ? entityId.map((value) => value.id) : [];

          let entityDataNames = entityId.map((value) => value.entityName);
          let entityLocation = entityId.map((value) => value.locationId);

          const scheduleAccess = await this.validateAuditTypeForUser(
            user,
            value.auditPlanId.auditType,
            entityIds,
            entityDataNames,
            entityLocation,
            value.auditPlanId.isDraft,
          );

          const {
            isScheduleCreated,
            createdMonth,
            isAuditReportCreated,
            scheduleId,
            auditorReportId,
            auditUnitReport,
          } = await this.isScheduleCreated({
            entityId: value.entityId,
            auditPlanId: value.auditPlanId,
            auditType: auditSettings,
            mouthData: [...unitMonthData, ...mouthData],
            activeUser,
            auditPlanUnitData: unitPlanData,
          });
          const monthData = auditUnitReport?.filter((value) => {
            if (value.scheduleCreated === false) return value;
          });

          if (isScheduleCreated === false || monthData?.length > 0) {
            finalData.push({
              entityId: value.entityId,
              systems: systemData
                ?.map((value) => {
                  return value?.name;
                })
                .join(' , '),
              auditPlanEntityWiseId: value._id,
              type: 'Planned',
              name:
                entity?.entityName === undefined
                  ? location?.locationName
                  : entity?.entityName,
              unitId: location?.id,
              auditPlanId: value.auditPlanId._id,
              auditPlanData: value.auditPlanId,
              auditPlanName: value.auditPlanId.auditName,
              unitData: JSON.parse(auditSettings.scope).id,
              unitChecker:
                JSON.parse(auditSettings.scope).id === 'corpFunction'
                  ? true
                  : JSON.parse(auditSettings.scope).id === 'Unit'
                  ? true
                  : false,
              auditschedule:
                monthData?.length > 0
                  ? monthData?.map((item: any) => item?.monthName)
                  : mouthData,
              isAuditReportCreated,
              editAccess,
              auditUnitReport,
              months: value?.auditschedule,
              auditTypeName: auditSettings?.auditType,
              auditorCheck: auditSettings.auditorCheck,
              createdAt: value?.createdAt,
              createdBy: value?.auditPlanId?.createdBy,
              scheduleAccess,
              format: activeUser.organization.fiscalYearQuarters,
              isScheduleCreated,
              scheduleId,
              createdMonth: [...createdMonth, ...unitMonthNames],
              auditPlanUnitData,
              auditorReportId: auditorReportId ?? '',
            });
          }
        }
        // return finalData;
      }

      if (status !== 'Planned') {
        let pipeline = [];
        const auditScheduleData = await this.auditScheduleModel.find(
          whereCondition,
        );

        const auditScheduleIds = auditScheduleData?.map((value) => value._id);

        pipeline = [
          {
            // Match documents with the specified auditScheduleIds
            $match: {
              auditScheduleId: { $in: auditScheduleIds },
            },
          },
        ];

        const auditScheduleEntityData =
          await this.auditScheduleEntityModel.aggregate(pipeline);
        for (let value of auditScheduleEntityData) {
          const givenTime = new Date(value?.time);
          const date = new Date(value?.time);

          const currentTime = new Date();
          const auditScheduleDatas = auditScheduleData.find(
            (item) => item._id.toString() === value.auditScheduleId.toString(),
          );
          let auditPlanData;
          let auditPlanEntityData;
          if (auditScheduleDatas?.auditPlanId !== 'No plan') {
            auditPlanData = await this.auditPlanModel.findById(
              auditScheduleDatas?.auditPlanId,
            );

            // const auditPlanEntityData = asdfdsf
            auditPlanEntityData = await this.auditPlanEntityWiseModel.find({
              auditPlanId: auditPlanData?._id,
            });
          }

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
            this.SystemModel.find({
              _id: { $in: auditScheduleDatas?.systemMasterId },
            }),
          ]);
          const auditTypeData = await this.auditSettings.findById(
            auditScheduleDatas?.auditType,
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
            auditPlanEntityDatafind = auditPlanEntityData?.find(
              (item) => item?.entityId === value?.entityId,
            );
          }

          let monthData = date.toLocaleString('en-US', { month: 'long' });
          // if (auditScheduleDatas?.auditPlanId !== 'No plan') {
          //   monthData = await this.monthDecide(
          //     auditPlanEntityDatafind?.auditschedule,
          //     activeUser?.organization,
          //   );
          // } else {
          //   monthData = date.toLocaleString('en-US', { month: 'long' });
          // }
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
            if (
              (status === 'Completed' || status === 'All') &&
              auditReportdata?.auditedEntity === value?.entityId
            ) {
              completed.push({
                ...value,
                lable: 'Completed',
                auditScheduleDatas,
                auditTypeData,
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
            // completed.push(value);
          } else if (givenTime < currentTime) {
            // finalResult.forEach((item) => {
            scheduled.push({
              ...value,
              lable: 'OverDue',
              auditScheduleDatas,
              auditeeData,
              auditPlanData,
              auditorData,
              auditschedule: monthData,
              auditTemplates: value?.auditTemplates,
              name: entityData.entityName,
              created: false,
              auditTypeData,
              systems: systemData
                ?.map((value) => {
                  return value?.name;
                })
                .join(' , '),
              // auditScheduledata: value,
            });

            // });
            // overDue.push(value);
          } else {
            // scheduleData.push(value);

            // finalResult.forEach((item) => {
            // if (item.label === 'Scheduled') {
            scheduled.push({
              ...value,
              lable: 'Scheduled',
              auditScheduleDatas,
              auditeeData,
              auditPlanData,
              auditorData,
              auditTypeData,
              auditTemplates: value?.auditTemplates,
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
            // }
            // });
          }
        }
      }
      this.logger.log(
        `GET /api/auditPlan/getDetailsForDragAndDrop - Service Succesfull`,
        '',
      );
      return {
        data:
          status === 'Planned'
            ? finalData
            : status === 'Completed'
            ? completed
            : status === 'All'
            ? [...finalData, ...completed, ...scheduled]
            : scheduled,
        id: auditPlanData,
      };
      // : scheduled;
    } catch (err) {
      this.logger.warn(
        `GET /api/auditPlan/getDetailsForDragAndDrop - Service failed`,
        err?.stack || err?.message,
      );
    }
  }

  async getDetailsForDragAndDropForAll(user, query) {
    // try {
    let auditPlanData = [];
    let planned = [];
    let scheduld = [];
    let completed = [];
    let finalData = [];
    const { location, system, year, type, myAudit, status, scope, month } =
      query;

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user?.id },
      include: { organization: true },
    });

    const result: any = [
      { label: 'Planned', data: planned },
      {
        label: 'Scheduled',
        color: '#FF8000',
        data: scheduld,
      },
      { label: 'Completed', data: completed, color: '#808080' },
    ];

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
    if (
      location === undefined ||
      location === '' ||
      location == 'undefined' ||
      type === undefined ||
      type === '' ||
      type === 'undefined'
    ) {
      return result;
    }

    let whereCondition: any = {};
    if (
      location !== undefined &&
      location !== 'undefined' &&
      location !== '' &&
      location !== 'All' &&
      scope !== 'Unit'
    ) {
      whereCondition = {
        ...whereCondition,
        location: { $in: [location] },
        locationId: { $in: [location] },
      };
    }

    if (year !== undefined && year !== 'undefined' && year !== '') {
      whereCondition = { ...whereCondition, auditYear: year };
    }

    if (
      type !== undefined &&
      type !== 'undefined' &&
      type !== '' &&
      type !== 'All'
    ) {
      whereCondition = { ...whereCondition, auditType: type };
    }
    let auditPlanDataNeed: any = await this.auditPlanModel.find({
      ...whereCondition,
      deleted: false,
      organizationId: activeUser?.organizationId,
    });

    auditPlanData = auditPlanDataNeed
      ?.map((value) => value._id)
      .filter(Boolean);
    const auditPlanEntityQuery = {};
    const monthIndex = months.indexOf(month); // returns 2 for 'March'

    // Or if you're using `secMonth`:
    const secMonthIndex = secMonth.indexOf(month); // returns 11 for 'March'

    auditPlanEntityQuery[
      `auditschedule.${
        activeUser.organization.fiscalYearQuarters === 'April - Mar'
          ? secMonthIndex
          : monthIndex
      }`
    ] = true;

    let data: any = await this.auditPlanEntityWiseModel
      .find({
        auditPlanId: {
          $in: auditPlanData,
        },
        ...auditPlanEntityQuery,
      })
      .populate({ path: 'auditPlanId', model: this.auditPlanModel });

    for (let value of data) {
      let [
        mouthData,
        entity,
        location,
        auditSettings,
        entityId,
        systemData,
      ]: any = await Promise.all([
        this.monthDecide(value?.auditschedule, activeUser?.organization),
        this.prisma.entity.findFirst({ where: { id: value.entityId } }),
        this.prisma.location.findFirst({ where: { id: value.entityId } }),
        this.auditSettings.findById({
          _id: new ObjectId(value.auditPlanId.auditType),
        }),
        this.prisma.entity.findMany({
          where: {
            users: { has: activeUser.id },
          },
        }),
        this.SystemModel.find({
          _id: { $in: value?.auditPlanId?.systemMasterId },
        }),
      ]);

      const auditPlanUnitData = await this.auditPlanUnitwiseModel.find({
        auditPlanEntitywiseId: value?._id.toString(),
        auditPlanId: value.auditPlanId._id.toString(),
        auditPeriod: { $in: mouthData },
      });

      let unitMonthNames = [];

      const unitMonthData = auditPlanUnitData?.map((value) => {
        const startDate = value.fromDate
          ? value.fromDate.toISOString().split('T')[0]
          : null;
        const endDate = value.toDate
          ? value.toDate.toISOString().split('T')[0]
          : null;
        unitMonthNames.push(value?.auditPeriod);
        return `${startDate} - ${endDate}`;
      });

      const unitPlanData = auditPlanUnitData?.map((item) => {
        const startDate = item.fromDate
          ? item.fromDate.toISOString().split('T')[0]
          : null;
        const endDate = item.toDate
          ? item.toDate.toISOString().split('T')[0]
          : null;
        unitMonthNames.push(item?.auditPeriod);
        return {
          time: `${startDate} - ${endDate}`,
          auditPlanId: item?.auditPlanId,
          auditPeriod: item?.auditPeriod,
        };
      });
      const functionData = await this.prisma.functions.findMany({
        where: {
          functionSpoc: { has: activeUser.id },
          organizationId: activeUser.organizationId,
        },
      });
      const functionUnitIds = functionData?.map((value) => value.unitId);
      const editAccess =
        await this.validateUserAbleToEditAuditPlanBasedOnAuditType(
          {
            ...activeUser,
            roles: user?.kcRoles?.roles,
            unitId: functionUnitIds,
          },
          auditSettings,
          value?.auditPlanId,
        );

      const entityIds =
        entityId?.length > 0 ? entityId.map((value) => value.id) : [];

      let entityDataNames = entityId.map((value) => value.entityName);
      let entityLocation = entityId.map((value) => value.locationId);

      const scheduleAccess = await this.validateAuditTypeForUser(
        user,
        value.auditPlanId.auditType,
        entityIds,
        entityDataNames,
        entityLocation,
        value.auditPlanId.isDraft,
      );

      const {
        isScheduleCreated,
        createdMonth,
        isAuditReportCreated,
        scheduleId,
        auditorReportId,
        auditUnitReport,
        auditScheduleData,
      } = await this.isScheduleCreated({
        entityId: value.entityId,
        auditPlanId: value.auditPlanId,
        auditType: auditSettings,
        mouthData: [...unitMonthData, ...mouthData],
        activeUser,
        auditPlanUnitData: unitPlanData,
      });

      const monthData = auditUnitReport?.filter((value) => {
        if (value.scheduleCreated === false) return value;
      });

      const monthFindData = auditUnitReport?.find(
        (ele) => ele.orginalMonthName === month,
      );

      console.log('monthFindData', monthFindData);

      if (monthFindData?.isScheduleCreated === false) {
        result.forEach((item) => {
          if (item.label === 'Planned') {
            item?.data?.push({
              entityId: value.entityId,
              systems: systemData
                ?.map((value) => {
                  return value?.name;
                })
                .join(' , '),
              auditPlanEntityWiseId: value._id,
              type: 'Planned',
              name:
                entity?.entityName === undefined
                  ? location?.locationName
                  : entity?.entityName,
              unitId: location?.id,
              auditPlanId: value.auditPlanId._id,
              auditPlanData: value.auditPlanId,
              auditPlanName: value.auditPlanId.auditName,
              unitData: JSON.parse(auditSettings.scope).id,
              unitChecker:
                JSON.parse(auditSettings.scope).id === 'corpFunction'
                  ? true
                  : JSON.parse(auditSettings.scope).id === 'Unit'
                  ? true
                  : false,
              auditschedule:
                monthData?.length > 0
                  ? monthData?.map((item: any) => item?.monthName)
                  : mouthData,
              isAuditReportCreated,
              editAccess,
              auditUnitReport,
              months: value?.auditschedule,
              auditTypeName: auditSettings?.auditType,
              auditorCheck: auditSettings.auditorCheck,
              createdAt: value?.createdAt,
              auditScheduleData: auditScheduleData,
              createdBy: value?.auditPlanId?.createdBy,
              scheduleAccess,
              format: activeUser.organization.fiscalYearQuarters,
              isScheduleCreated,
              scheduleId,
              createdMonth: [...createdMonth, ...unitMonthNames],
              auditPlanUnitData,
              auditorReportId: auditorReportId ?? '',
            });
          }
        });
      } else if (
        monthFindData?.isScheduleCreated === true &&
        monthFindData?.isAuditReportCreated === false
      ) {
        const findScheduleData = auditScheduleData?.filter(
          (ele) => ele?.monthName === month,
        );
        result.forEach((item) => {
          if (item.label === 'Scheduled') {
            item?.data?.push({
              entityId: value.entityId,
              systems: systemData
                ?.map((value) => {
                  return value?.name;
                })
                .join(' , '),
              auditPlanEntityWiseId: value._id,
              type: 'Scheduled',
              name:
                entity?.entityName === undefined
                  ? location?.locationName
                  : entity?.entityName,
              unitId: location?.id,
              auditScheduleData: findScheduleData,
              auditPlanId: value.auditPlanId._id,
              auditPlanData: value.auditPlanId,
              auditPlanName: value.auditPlanId.auditName,
              unitData: JSON.parse(auditSettings.scope).id,
              unitChecker:
                JSON.parse(auditSettings.scope).id === 'corpFunction'
                  ? true
                  : JSON.parse(auditSettings.scope).id === 'Unit'
                  ? true
                  : false,
              auditschedule:
                monthData?.length > 0
                  ? monthData?.map((item: any) => item?.monthName)
                  : mouthData,
              isAuditReportCreated,
              editAccess,
              auditUnitReport,
              months: value?.auditschedule,
              auditTypeName: auditSettings?.auditType,
              auditorCheck: auditSettings.auditorCheck,
              createdAt: value?.createdAt,
              createdBy: value?.auditPlanId?.createdBy,
              scheduleAccess,
              format: activeUser.organization.fiscalYearQuarters,
              isScheduleCreated,
              scheduleId,
              unitPlanData,
              createdMonth: [...createdMonth, ...unitMonthNames],
              auditPlanUnitData,
              auditorReportId: auditorReportId ?? '',
            });
          }
        });
      } else {
        const findScheduleData = auditScheduleData?.filter(
          (ele) => ele?.monthName === month,
        );
        result.forEach((item) => {
          if (item.label === 'Completed') {
            item?.data?.push({
              entityId: value.entityId,
              systems: systemData
                ?.map((value) => {
                  return value?.name;
                })
                .join(' , '),
              auditPlanEntityWiseId: value._id,
              type: 'Completed',
              name:
                entity?.entityName === undefined
                  ? location?.locationName
                  : entity?.entityName,
              unitId: location?.id,
              auditScheduleData: findScheduleData,
              auditPlanId: value.auditPlanId._id,
              auditPlanData: value.auditPlanId,
              auditPlanName: value.auditPlanId.auditName,
              unitData: JSON.parse(auditSettings.scope).id,
              unitChecker:
                JSON.parse(auditSettings.scope).id === 'corpFunction'
                  ? true
                  : JSON.parse(auditSettings.scope).id === 'Unit'
                  ? true
                  : false,
              auditschedule:
                monthData?.length > 0
                  ? monthData?.map((item: any) => item?.monthName)
                  : mouthData,
              isAuditReportCreated,
              editAccess,
              unitPlanData,
              auditUnitReport,
              months: value?.auditschedule,
              auditTypeName: auditSettings?.auditType,
              auditorCheck: auditSettings.auditorCheck,
              createdAt: value?.createdAt,
              createdBy: value?.auditPlanId?.createdBy,
              scheduleAccess,
              format: activeUser.organization.fiscalYearQuarters,
              isScheduleCreated,
              scheduleId,
              createdMonth: [...createdMonth, ...unitMonthNames],
              auditPlanUnitData,
              auditorReportId: auditorReportId ?? '',
            });
          }
        });
      }
    }

    // return {{label:"",data:completed},planned,scheduld}
    return { data: result, auditPlanId: auditPlanData[0] };
    // if (system !== undefined && system !== 'undefined' && system?.length > 0) {
    //   whereCondition = {
    //     ...whereCondition,
    //     systemMasterId: { $in: system },
    //   };
    // }
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }

  async isScheduleCreated(data) {
    if (
      JSON.parse(data.auditType.scope).id === 'Unit' ||
      JSON.parse(data.auditType.scope).id === 'corpFunction'
    ) {
      const scheduleData = await this.auditScheduleModel.find({
        auditPlanId: data?.auditPlanId.id,
        locationId: data.entityId,
        auditPeriod: { $in: data?.mouthData },
      });
      const auditScheduleId = scheduleData?.map((value) =>
        value?._id.toString(),
      );
      const createdMonth = scheduleData?.map((value) => value.auditPeriod);
      const auditReportData = await this.auditModel.find({
        auditScheduleId: { $in: auditScheduleId },
      });
      const auditorReportId = auditReportData.map((value) =>
        value?._id.toString(),
      );
      const auditUnitReport = [];

      // data?.mouthData?.map((item: any) =>
      for (let item of data?.mouthData) {
        const scheduleDataFind = scheduleData.filter(
          (item2) => item2.auditPeriod === item,
        );
        const auditScheduleEntityWiseData =
          await this.auditScheduleEntityModel.find({
            auditScheduleId: {
              $in: scheduleDataFind?.map((item1) => item1?._id),
            },
          });

        const scheduleDataForMonth = scheduleData.find(
          (audit) => audit.auditPeriod === item,
        );

        const scheduleEntityDataForMonth = auditScheduleEntityWiseData.find(
          (schedule) =>
            schedule?.auditScheduleId.toString() ===
              scheduleDataForMonth?._id.toString() &&
            schedule?.entityId === data.entityId,
        );

        const entityIds = auditScheduleEntityWiseData?.map(
          (item) => item?.entityId,
        );
        const auditeeIds = auditScheduleEntityWiseData?.flatMap(
          (item) => item?.auditee,
        );
        const auditorIds = auditScheduleEntityWiseData?.flatMap(
          (item) => item?.auditor,
        );

        const entityData = await this.prisma.entity.findMany({
          where: { id: { in: entityIds || [] } },
        });
        const auditeeData = await this.prisma.user.findMany({
          where: { id: { in: auditeeIds || [] } },
        });
        const auditorData = await this.prisma.user.findMany({
          where: { id: { in: auditorIds || [] } },
        });

        const auditScheduleEntityWiseDataNew = auditScheduleEntityWiseData?.map(
          (value) => {
            const auditScheduleFindNew = scheduleData.find(
              (item2) =>
                item2._id.toString() === value?.auditScheduleId.toString(),
            );

            const auditReportFindForEntity = auditReportData.find(
              (item3) =>
                item3?.auditScheduleId ===
                  auditScheduleFindNew?._id.toString() &&
                item3.auditedEntity === value?.entityId,
            );

            const entityFindData = entityData?.find(
              (value1) => value1.id === value?.entityId,
            );
            const auditorFindData = auditorData?.filter((item4) =>
              value.auditor.includes(item4?.id),
            );
            const auditeeFindData = auditeeData?.filter((item4) =>
              value.auditee.includes(item4?.id),
            );
            const auditorNames = auditorFindData
              ?.map((names) => {
                return names.username;
              })
              .join(',');
            const auditeeNames = auditeeFindData
              ?.map((names) => {
                return names.username;
              })
              .join(',');
            const auditPlanUnitDataTime = data?.auditPlanUnitData?.find(
              (item1) => item1.time === auditScheduleFindNew?.auditPeriod,
            );
            return {
              monthName: auditScheduleFindNew?.auditPeriod
                ?.toString()
                .includes('-')
                ? auditPlanUnitDataTime?.auditPeriod
                : auditScheduleFindNew?.auditPeriod || '',
              entityName: entityFindData?.entityName,
              entityData: entityFindData,
              entityId: entityFindData?.id,
              isScheduleCreated: scheduleEntityDataForMonth?._id?.toString()
                ? true
                : false,
              // time: scheduleEntityDataForMonth?.time,

              scheduleCreated: scheduleEntityDataForMonth?._id?.toString()
                ? true
                : false,
              auditor: auditorFindData,
              auditorNames: auditorNames,
              auditeeNames,
              time: value?.time,
              auditee: auditeeFindData,
              auditReportCreated:
                auditReportFindForEntity !== undefined ? true : false,
              auditScheduleDataId: auditScheduleFindNew?._id,
            };
          },
        );

        auditUnitReport.push({
          monthName: item,
          orginalMonthName: item,
          type: 'unit',
          auditScheduleDataId: '',
          auditReportFind: '',
          // scheduleCreated: false,
          auditReportCreated: false,
          isScheduleCreated: scheduleEntityDataForMonth?._id?.toString()
            ? true
            : false,
          // time: scheduleEntityDataForMonth?.time,

          scheduleCreated: scheduleEntityDataForMonth?._id?.toString()
            ? true
            : false,
          auditScheduleEntityWiseDataNew,
        });
      }

      return {
        scheduleId: scheduleData?.length > 0 ? auditScheduleId[0] : '',
        isScheduleCreated: scheduleData?.length > 0 ? true : false,
        createdMonth,
        isAuditReportCreated: auditReportData?.length > 0,
        auditorReportId: auditorReportId[0],
        auditUnitReport,
        auditScheduleData: auditUnitReport,
      };
    } else {
      const scheduleData = await this.auditScheduleModel.find({
        auditPlanId: data.auditPlanId._id.toString(),
        auditPeriod: { $in: data?.mouthData },

        // locationId: data.entityId,
      });
      const scheduleDataId = scheduleData.map((value) => value?._id);
      const auditScheduleId = scheduleData?.map((value) =>
        value?._id.toString(),
      );

      const scheduleEntityData = await this.auditScheduleEntityModel.find({
        auditScheduleId: { $in: scheduleDataId },
        entityId: data.entityId,
      });
      const createdMonth = scheduleData?.map((value) => value.auditPeriod);
      const auditReportData = await this.auditModel.find({
        auditScheduleId: {
          $in: auditScheduleId,
        },
        auditedEntity: data?.entityId,
      });
      const auditorReportId = auditReportData.map((value) =>
        value?._id.toString(),
      );

      let auditUnitReport = [];
      // console.log("month name",data?.mouthData)

      for (let item of data?.mouthData) {
        const scheduleDataForMonth = scheduleData.find(
          (audit) => audit.auditPeriod === item,
        );

        const scheduleEntityDataForMonth = scheduleEntityData.find(
          (schedule) =>
            schedule?.auditScheduleId.toString() ===
              scheduleDataForMonth?._id.toString() &&
            schedule?.entityId === data.entityId,
        );

        const auditeeDataForEntity = await this.prisma.user.findMany({
          where: { id: { in: scheduleEntityDataForMonth?.auditee || [] } },
        });

        const auditorDataForEntity = await this.prisma.user.findMany({
          where: { id: { in: scheduleEntityDataForMonth?.auditor || [] } },
        });
        const auditReportFind = auditReportData.find(
          (auditRepo) =>
            auditRepo?.auditScheduleId.toString() ===
            scheduleDataForMonth?._id.toString(),
        );

        const auditPlanUnitDataTime = data?.auditPlanUnitData?.find(
          (item1) => item1.time === scheduleDataForMonth?.auditPeriod,
        );

        auditUnitReport.push({
          monthName: item,
          // scheduleDataForMonth?.auditPeriod?.toString().includes('-')
          //   ? auditPlanUnitDataTime?.auditPeriod
          //   : scheduleDataForMonth?.auditPeriod || '',
          orginalMonthName: item,
          time: scheduleEntityDataForMonth?.time,
          auditScheduleDataId: scheduleDataForMonth?._id?.toString() || '',
          auditReportFind: auditReportFind?._id.toString() || '',
          isScheduleCreated: scheduleEntityDataForMonth?._id?.toString()
            ? true
            : false,
          scheduleCreated: scheduleEntityDataForMonth?._id?.toString()
            ? true
            : false,
          auditScheduleEntityData: scheduleEntityDataForMonth,
          auditReportCreated: auditReportFind?._id.toString() ? true : false,
          isAuditReportCreated: auditReportFind?._id.toString() ? true : false,
          auditee: auditeeDataForEntity,
          auditor: auditorDataForEntity,
          type: 'dept',
          isUserAbleToCreateReport:
            scheduleEntityDataForMonth?.auditor.includes(data.activeUser.id),
        });
        // console.log("month name",item,scheduleEntityDataForMonth)
      }

      return {
        scheduleId: scheduleEntityData.length > 0 ? auditScheduleId[0] : '',
        isScheduleCreated: scheduleEntityData.length > 0 ? true : false,
        createdMonth,
        isAuditReportCreated: auditReportData?.length > 0,
        auditorReportId: auditorReportId[0],
        auditUnitReport: auditUnitReport,
        auditScheduleData: auditUnitReport,
      };
    }
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

  async createAuditPlanFromDragAndDrop(userId, data) {
    // try {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: userId.id },
      include: { organization: true },
    });
    const auditType = await this.auditSettings.findById(data?.auditType?.id);

    const refinedData = {
      auditName: `${data.auditType.value}-${data.currentYear}`,
      auditYear: data.currentYear,
      status: 'active',
      isDraft: true,
      publishedOnDate: new Date(),
      createdBy: activeUser.username,
      updatedBy: activeUser.username,
      entityTypeId: JSON.parse(auditType.scope).id,
      comments: '',
      location: data.hasOwnProperty('location') ? data.location : '',
      auditType: data?.auditType?.id,
      organizationId: activeUser.organizationId,
      systemMasterId: auditType?.system || [],
      roleId: auditType?.responsibility,
    };

    const audit = await this.auditPlanModel.create(refinedData);
    // try {
    const entityData: any = await this.getOptionsForDragAndDrop(
      userId,
      data?.auditType?.id,
      data.location,
    );

    await entityData.map(async (value) => {
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
      let monthData = [];

      // for (let itemNew of new Set(data.auditPlanentityId)) {
      if (activeUser.organization.fiscalYearQuarters === 'April - Mar') {
        monthData = secMonth.map((item) => {
          if (
            item === data.index &&
            data.auditPlanentityId.includes(value.id)
          ) {
            return true;
          } else {
            return false;
          }
        });
      } else {
        monthData = months.map((item) => {
          if (
            item === data.index &&
            data.auditPlanentityId.includes(value.id)
          ) {
            return true;
          } else {
            return false;
          }
        });
      }
      const auditEntitywiseData = await this.auditPlanEntityWiseModel.create({
        entityId: value.id,
        auditschedule: monthData,
        // auditors: value.auditors,
        organizationId: activeUser.organizationId,
        auditPlanId: audit._id,
        deleted: false,
      });
      // }
    });
    try {
      // await this.sendMailForHead(userId, audit._id);
    } catch (error) {}
    // } catch (error) {
    //   return {
    //     'error message': error.message,
    //     message: 'Auditplan is created problem in auditschedule create',
    //   };
    // }
    // } catch (error) {
    //   return {
    //     'error message': error.message,
    //   };
    // }
  }

  async getAllSystemsData(user, locationId) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllSystemsData/${locationId} - Service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      if (locationId !== 'undefined' && locationId !== undefined) {
        let whereCondition: any = { organizationId: activeUser.organizationId };
        if (locationId !== 'All' && locationId !== null) {
          whereCondition = {
            ...whereCondition,
            'applicable_locations.id': { $in: ['All', locationId] },
          };
        }
        let systems: any = await this.SystemModel.find(whereCondition);
        systems = systems?.map((value) => {
          return { id: value._id, name: value.name };
        });
        this.logger.log(
          `GET /api/auditPlan/getAllSystemsData/${locationId} - Service Successfull`,
          '',
        );
        return systems;
      } else {
        return [];
      }
    } catch (err) {
      this.logger.warn(
        `GET /api/auditPlan/getAllSystemsData/${locationId} - Service failed`,
        '',
      );
    }
  }

  async getOptionsForDragAndDrop(user, auditType, locId) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getOptionsForDragAndDrop - Service started`,
        '',
      );

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let [auditTypeData, entityId, functionData]: any = await Promise.all([
        this.auditSettings.findById({
          organizationId: activeUser.organizationId,
          _id: auditType,
        }),
        this.prisma.entity.findMany({
          where: {
            users: { has: activeUser.id },
          },
        }),
        this.prisma.functions.findMany({
          where: { functionSpoc: { has: activeUser.id } },
        }),
      ]);
      let access = false;
      const functionUnitId = functionData?.map((value) => value.unitId);
      const entityData =
        entityId?.length > 0 ? entityId.map((value) => value.id) : [];
      let entityDataNames = entityId.map((value) => value.entityName);
      let entityLocation = entityId.map((value) => value.locationId);
      const auditTypeunit = auditTypeData.planningUnit.map(
        (value) => value?.id,
      );

      // if (user.kcRoles.roles.includes('ORG-ADMIN')) {
      //   access = true;
      // } else

      if (auditTypeData?.whoCanPlan === 'All') {
        access = true;
      } else if (
        auditTypeData?.whoCanPlan === 'Entity Head' &&
        entityData?.length > 0
      ) {
        if (
          auditTypeData?.planningUnit[0]?.id === 'All' &&
          !auditTypeData.hasOwnProperty('planningEntity')
        ) {
          access = true;
        } else if (
          auditTypeData?.planningUnit[0]?.id === 'All' &&
          entityDataNames?.includes(auditTypeData?.planningEntity?.entityName)
        ) {
          access = true;
        } else if (
          auditTypeunit.some((item) => entityLocation.includes(item)) &&
          entityData.includes(auditType?.planningEntity?.id)
        ) {
          access = true;
        } else {
          access = false;
        }
      } else if (
        auditTypeData?.whoCanPlan === 'Function SPOC' &&
        (auditTypeData?.planningUnit.filter((value) => value.id === 'All')
          .length > 0 ||
          // functionUnitId.includes(auditTypeData?.planningUnit?.id)
          auditTypeData?.planningUnit
            ?.map((value: any) => value?.id)
            .some((value) => functionUnitId.includes(value)))
      ) {
        access = true;
      } else if (
        auditTypeData?.whoCanPlan === 'IMS Coordinator' &&
        user.kcRoles.roles.includes('MR') &&
        (entityLocation.includes(activeUser.locationId) ||
          activeUser?.additionalUnits?.filter((item: any) =>
            entityLocation?.includes(item),
          )?.length > 0)
      ) {
        access = true;
      } else if (
        user.kcRoles.roles.includes(newRoles[auditTypeData?.whoCanPlan])
      ) {
        access = true;
      }

      if (auditTypeData.useFunctionsForPlanning === true) {
        // console.log('function');
        const entity = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            entityTypeId: JSON.parse(auditTypeData.scope).id,
          },
        });

        const functionId = entity
          ?.map((value: any) => value.functionId)
          .filter((value) => value !== null);

        const uniqueIds = [...new Set(functionId)];
        let finalResult = await this.prisma.functions.findMany({
          where: {
            // organizationId: activeUser.organizationId,
            id: { in: uniqueIds },
          },
          select: { id: true, name: true },
        });

        finalResult = finalResult.map((value) => {
          return { ...value, access };
        });
        return finalResult;
      } else {
        if (
          JSON.parse(auditTypeData.scope).name === 'Unit' ||
          JSON.parse(auditTypeData.scope).name === 'Corporate Function'
        ) {
          let result: any = await this.prisma.location.findMany({
            where: {
              organizationId: activeUser.organizationId,
              // user: userid.id,
              deleted: false,
              type:
                JSON.parse(auditTypeData.scope).name === 'Unit'
                  ? 'Unit'
                  : 'Function',
            },
            orderBy: {
              locationName: 'asc',
            },
            select: { id: true, locationName: true },
          });
          result = result?.map((value) => ({
            id: value.id,
            name: value.locationName,
          }));
          result = result.map((value) => {
            return { ...value, access };
          });
          this.logger.log(
            `GET /api/auditPlan/getOptionsForDragAndDrop - Service Successfull`,
            '',
          );
          return result;
        } else {
          let whereCondition;
          if (JSON.parse(auditTypeData.scope).id === 'Unit') {
            whereCondition = {
              // entityTypeId: scopeId.id,
              locationId: locId,
              deleted: false,
            };
          } else {
            whereCondition = {
              entityTypeId: JSON.parse(auditTypeData.scope).id,
              locationId: locId,
              deleted: false,
            };
          }

          let result: any = await this.prisma.entity.findMany({
            where: whereCondition,
            select: {
              id: true,
              entityName: true,
            },
          });
          result = result?.map((value) => ({
            id: value.id,
            name: value.entityName,
            access,
          }));
          this.logger.log(
            `GET /api/auditPlan/getOptionsForDragAndDrop - Service Successfull`,
            '',
          );
          return result;
        }
      }
    } catch (err) {
      this.logger.log(
        `GET /api/auditPlan/getOptionsForDragAndDrop - Service failed`,
        '',
      );
      return [];
    }
  }

  async getAllAuditType(user) {
    try {
      this.logger.log(
        `GET /api/auditPlan/getAllAuditType - Service started`,
        '',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.auditSettings
        .find({
          organizationId: activeUser.organizationId,
          deleted: false,
        })
        .sort({ auditType: 1 })
        .select('_id auditType scope planType responsibility system');

      this.logger.log(
        `GET /api/auditPlan/getAllAuditType - Service SucessFull`,
        '',
      );
      return result;
    } catch (err) {
      this.logger.log(
        `GET /api/auditPlan/getAllAuditType - Service Failed`,
        err?.stack || err?.message,
      );
    }
  }

  async updateDataofDropDown(user, data, status) {
    try {
      this.logger.log(
        `PATCH /api/auditPlan/updateDataofDropDown/${status} - Service started`,
        '',
      );

      let {
        index,
        auditPlanId,
        auditPlanentityId,
        location,
        system,
        currentYear,
        auditType,
      } = data;

      let monthIndex;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
        include: { organization: true },
      });

      if (activeUser.organization.fiscalYearQuarters === 'April - Mar') {
        const months = [
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
        monthIndex = months.indexOf(index);
      } else {
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
        monthIndex = monthNames.indexOf(index);
      }
      let datas = await this.auditPlanEntityWiseModel.find({
        auditPlanId: new ObjectId(auditPlanId),
        entityId: auditPlanentityId,
      });
      if (status === 'create') {
        const checkDataIsCreated = await this.auditPlanModel.findOne({
          auditType: auditType?.id,
          auditYear: currentYear,
          location,
        });
        if (checkDataIsCreated === undefined || checkDataIsCreated === null) {
          await this.createAuditPlanFromDragAndDrop(user, data);
        } else {
          return 'Not Added AuditPlan becuase it exist';
        }
      } else {
        for (let dataNew of datas) {
          if (status === `true`) {
            dataNew.auditschedule[monthIndex] = true;
          } else {
            dataNew.auditschedule[monthIndex] = false;
          }
          const updateData = await this.auditPlanEntityWiseModel.updateOne(
            {
              auditPlanId: new ObjectId(auditPlanId),
              entityId: dataNew.entityId,
            },
            { $set: { auditschedule: dataNew.auditschedule, deleted: false } },
          );
        }
      }
      this.logger.log(
        `PATCH /api/auditPlan/updateDataofDropDown/${status} - Service Successfull`,
        '',
      );

      // console.log('updateData', updateData);
      return 'successfull updated AuditPlan Drag data';
    } catch (err) {
      this.logger.log(
        `PATCH /api/auditPlan/updateDataofDropDown/${status} - Service failed`,
        err.stack || err.message,
      );
    }
  }

  async getAuditeeByEntities(body) {
    try {
      const { entityIdArray } = body;
      const auditeeData: any = await this.prisma.entity.findMany({
        where: {
          id: {
            in: entityIdArray,
          },
        },
        select: { id: true, auditees: true },
      });
      const userIds = auditeeData
        ?.map((item: any) => item?.auditees)
        ?.flat()
        ?.filter((id) => !!id);
      const userSet: any = new Set(userIds);

      const userDetails = await this.prisma.user.findMany({
        where: { id: { in: Array.from(userSet) as any } },
        select: { id: true, firstname: true, lastname: true, email: true },
      });

      const userMap = new Map(
        userDetails?.map((userObj) => [userObj.id, userObj]),
      );
      // return userDetails;
      const finalData = auditeeData?.map((entity: any) => ({
        entityId: entity.id,
        auditees: entity?.auditees?.map((id) => userMap.get(id)),
      }));
      return finalData;
    } catch (err) {}
  }

  async getReportForAudit(user, data) {
    try {
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
      const { auditType, location, year } = data;
      if (!auditType) return {};
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const result: any = {};

      const auditPlanData = await this.auditPlanModel.find({
        organizationId: activeUser.organizationId,
        location: location,
        auditType,
      });

      const auditPlanEntityData = await this.auditPlanEntityWiseModel.find({
        auditPlanId: { $in: auditPlanData.map((value) => value._id) },
      });

      const auditScheduleData = await this.auditScheduleModel.find({
        organizationId: activeUser.organizationId,
        locationId: location,
        // audit
      });

      for (let item of auditPlanEntityData) {
        const entityId = item?.entityId?.toString?.();

        // Find the matching key in `result` where label === entityId
        const key = Object.keys(result).find(
          (key) => result[key].label === entityId,
        );

        if (key) {
          result[key].data.push(item);
        } else {
          // Optional: If not found, add a new entry
          const newKey = `entity_${entityId}`;
          result[newKey] = {
            label: entityId,
            data: [item],
          };
        }
      }
    } catch (err) {}
  }
}
