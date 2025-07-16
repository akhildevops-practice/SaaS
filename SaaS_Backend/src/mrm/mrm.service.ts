import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MRM } from './schema/mrm.schema';
import { ScheduleMRM } from './schema/scheduleMrm.schema';
import { MeetingType } from 'src/key-agenda/schema/meetingType.schema';
import { PrismaService } from 'src/prisma.service';
import { UserService } from '../user/user.service';

import { ActionPoint } from './schema/actionPoint.schema';
import { OrganizationService } from '../organization/organization.service';
import * as sgMail from '@sendgrid/mail';
import { getExactPath } from '../utils/getImagePath.helper';
import * as path from 'path';
import { unlinkSync } from 'fs';
import { LocationService } from '../location/location.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import moment = require('moment');
import { Logger } from 'winston';
import { Agenda, AgendaDocument } from './schema/agenda.schema';
import { ObjectId } from 'bson';
import { Meeting } from './schema/meeting.schema';
import { Types } from 'mongoose';

import { EmailService } from 'src/email/email.service';
import { sendMailToOwner } from './helper/email.helper';
import common = require('oci-common');
import * as objectstorage from 'oci-objectstorage';
import st = require('stream');
import { v4 as uuid } from 'uuid';
import { ActionItems } from 'src/actionitems/schema/actionitems.schema';
import { CaraService } from 'src/cara/cara.service';
import { DocumentsService } from 'src/documents/documents.service';
import axios from 'axios';
import { License } from 'src/license/schema/license.schema';

sgMail.setApiKey(process.env.SMTP_PASSWORD);

@Injectable()
export class MRMService {
  constructor(
    @InjectModel(MRM.name) private MRMModel: Model<MRM>,
    @InjectModel(MeetingType.name) private keyAgendaModel: Model<MeetingType>,
    @InjectModel(ScheduleMRM.name) private ScheduleMRMModel: Model<ScheduleMRM>,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(Agenda.name) private AgendaModel: Model<Agenda>,
    @InjectModel(Meeting.name) private MeetingModel: Model<Meeting>,
    @InjectModel(ActionPoint.name)
    private ActionPointMRMModel: Model<ActionPoint>,
    private readonly organizationService: OrganizationService,
    private readonly userService: UserService,
    private readonly locationService: LocationService,
    @InjectModel(License.name)
    private readonly licenseModel: Model<License>,
    private readonly cara: CaraService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly documentService: DocumentsService,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(ActionItems.name) private actionitems: Model<ActionItems>,
  ) {}
  async create(data: any, user, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      this.logger.debug(
        `create MRM monthly data service started with ${data} for user=${activeUser}`,
      );
      // const auditTrail = await auditTrial(
      //   'mrms',
      //   'MRM',
      //   'MRM Plan',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      // setTimeout(async () => {
      const mrmData = await this.MRMModel.insertMany(data);
      this.logger.debug(`inserted mrmData?.length data`);
      this.logger.log(
        `trace id=${randomNumber} Post api/mrm/create for ${data}service successful`,
        '',
      );
      return mrmData;
      // }, 1000);
    } catch (err) {
      ////////////////console.log(err, 'err');
      this.logger.log(
        `trace id=${randomNumber} Post api/mrm/create for ${data}service faile ${err}`,
        '',
      );
      throw new InternalServerErrorException();
    }
  }

  async update(data: any, user, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      // const auditTrail = await auditTrial(
      //   'mrms',
      //   'MRM',
      //   'MRM Plan',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      // setTimeout(async () => {
      this.logger.debug(
        `update monthly data for mrm plan started for ${data} for user ${activeUser}`,
      );
      const result = await Promise.all(
        data.map(async (element: any) => {
          this.logger.debug(`processing element ${element}`);
          element = await this.MRMModel.findByIdAndUpdate(element?._id, {
            ...element,
          });
          return { ...element };
        }),
      );
      this.logger.log(
        `trace id=${randomNumber} PATCH api/mrm for ${data} service successful`,
        '',
      );
      return result;
      // }, 1000);
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} PATCH api/mrm for ${data} service failed ${err} for ${activeUser} and data ${data}`,
        err?.stack || err?.message,
      );
      throw new InternalServerErrorException();
    }
  }

  async getMrmByOrgId(orgId: string, unitId: string, randomNumber) {
    try {
      this.logger.debug(
        `trace id=${randomNumber} - getMrmByOrgId service started for orgId=${orgId}, unitId=${unitId}`,
      );

      const result = await this.MRMModel.find({
        organizationId: orgId,
        unitId: unitId,
      }).populate('keyAgendaId');

      this.logger.debug(
        `trace id=${randomNumber} - Retrieved ${result.length} MRM records`,
      );

      let mrms = [];

      for (let mrm of result) {
        this.logger.debug(
          `trace id=${randomNumber} - Processing MRM id=${mrm._id}`,
        );

        let location = await this.prisma.location.findFirst({
          where: {
            id: unitId,
          },
        });
        this.logger.debug(
          `trace id=${randomNumber} - Retrieved location for unitId=${unitId}: ${JSON.stringify(
            location,
          )}`,
        );

        let meetingType = await this.keyAgendaModel.findById(
          mrm.keyAgendaId._id,
        );
        this.logger.debug(
          `trace id=${randomNumber} - Retrieved key agenda for id=${mrm.keyAgendaId._id}`,
        );

        let system: any = await this.SystemModel.find({
          _id: { $in: meetingType.applicableSystem },
        });

        this.logger.debug(
          `trace id=${randomNumber} - Retrieved ${system.length} systems for meetingType=${meetingType._id}`,
        );

        const data1: any = {
          _id: mrm._id,
          organizationId: mrm.organizationId,
          fiscalYear: mrm.fiscalYear,
          mrmPlanData: mrm.mrmPlanData,
          keyAgendaId: mrm.keyAgendaId,
          unitId: location,
          systemData: system,
          momPlanYear: mrm.momPlanYear,
        };

        mrms.push(data1);
      }

      this.logger.log(
        `trace id=${randomNumber} GET api/mrm/getMRMByOrgId for ${orgId} & ${unitId} service successful`,
        '',
      );

      return mrms;
    } catch (err) {
      this.logger.error(
        `trace id=${randomNumber} GET api/mrm/getMRMByOrgId for ${orgId} & ${unitId} service failed ${err}`,
        '',
      );
      throw new InternalServerErrorException();
    }
  }

  async createSchedule(data: any, user, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - createSchedule started with data: ${JSON.stringify(
          data,
        )}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `trace id = ${randomNumber} - Fetched active user: ${JSON.stringify(
          activeUser,
        )}`,
      );

      const duplicateCheck = await this.ScheduleMRMModel.find({
        meetingName: { $regex: new RegExp('^' + data.meetingName + '$', 'i') },
        deleted: false,
      });

      this.logger.debug(
        `trace id = ${randomNumber} - Duplicate check found ${duplicateCheck.length} records`,
      );

      if (duplicateCheck.length > 0) {
        this.logger.error(
          `trace id = ${randomNumber} POST /api/mrm/schedule failed for ${data} conflict error`,
          'MRM-Controller',
        );
        return new ConflictException(
          'Conflict error occurred during processing',
        );
      } else {
        const ScheduleData = new this.ScheduleMRMModel({
          ...data,
          entityId: activeUser.entityId,
        });

        this.logger.debug(
          `trace id = ${randomNumber} - Prepared ScheduleData: ${JSON.stringify(
            ScheduleData,
          )}`,
        );

        const result = await ScheduleData.save();

        this.logger.log(
          `trace id = ${randomNumber} POST /api/mrm/schedule successful for ${data}`,
          'MRM-Controller',
        );

        return result;
      }
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/mrm/schedule failed for ${data} ${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async deleteSchedule(id, user, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - deleteSchedule started for id: ${id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `trace id = ${randomNumber} - Active user fetched: ${JSON.stringify(
          activeUser,
        )}`,
      );

      const data: any = {
        deleted: true,
      };

      this.logger.debug(
        `trace id = ${randomNumber} - Marking schedule as deleted with payload: ${JSON.stringify(
          data,
        )}`,
      );

      const result = await this.ScheduleMRMModel.findByIdAndUpdate(id, data);

      this.logger.debug(
        `trace id = ${randomNumber} - Schedule updated. Result ID: ${result?._id}`,
      );

      this.logger.log(
        `trace id = ${randomNumber} DELETE /api/mrm/deleteSchedule/${id} successful`,
        'MRM-Controller',
      );

      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} DELETE /api/mrm/deleteSchedule/${id} failed ${error}`,
        'MRM-Controller',
      );
      return error;
    }
  }

  async updateSchedule(id: string, data: any, user, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - updateSchedule started for id: ${id}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      this.logger.debug(
        `trace id = ${randomNumber} - Active user fetched: ${JSON.stringify(
          activeUser,
        )}`,
      );

      this.logger.debug(
        `trace id = ${randomNumber} - Updating schedule with payload: ${JSON.stringify(
          data,
        )}`,
      );

      const result = await this.ScheduleMRMModel.findByIdAndUpdate(id, {
        ...data,
        entityId: activeUser.entityId,
      });

      this.logger.debug(
        `trace id = ${randomNumber} - Update result: ${
          result ? 'success' : 'null'
        }`,
      );

      this.logger.log(
        `trace id = ${randomNumber} PATCH /api/mrm/:${id} successful`,
        'MRM-Controller',
      );

      return result;
    } catch (err) {
      this.logger.log(
        `trace id = ${randomNumber} PATCH /api/mrm/:${id} failed for data: ${JSON.stringify(
          data,
        )} error=${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async getMRMValues(query, userid, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - getMRMValues started with query: ${JSON.stringify(
          query,
        )}`,
      );

      let condition = {
        organizationId: query.orgId,
        unitId: query.locationId,
        entityId: query.entityId,
        currentYear: query.currentYear ? query.currentYear : moment().year(),
        deleted: false,
      };

      if (query.locationId === 'All' || query.locationId === '') {
        this.logger.debug(
          `trace id = ${randomNumber} - Removing unitId from condition`,
        );
        delete condition.unitId;
      }
      if (query.entityId === 'All' || query.entityId === '') {
        this.logger.debug(
          `trace id = ${randomNumber} - Removing entityId from condition`,
        );
        delete condition.entityId;
      }
      if (query.selectedOwner || query.selectedType) {
        query.page = 1;
      }

      const pipeline: any[] = [
        { $match: condition },
        {
          $lookup: {
            from: 'actionpoints',
            localField: '_id',
            foreignField: 'mrmId',
            as: 'actionPointdata',
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (query.page - 1) * Number(query.limit) },
        { $limit: Number(query.limit) },
      ];

      if (
        Array.isArray(query.selectedOwner) &&
        query.selectedOwner.length > 0
      ) {
        this.logger.debug(
          `trace id = ${randomNumber} - Filtering by selectedOwner`,
        );
        pipeline.unshift({
          $match: {
            organizer: { $in: query.selectedOwner },
            ...condition,
          },
        });
      }

      if (Array.isArray(query.selectedType) && query.selectedType?.length > 0) {
        this.logger.debug(
          `trace id = ${randomNumber} - Filtering by selectedType`,
        );
        pipeline.unshift({
          $match: {
            meetingType: { $in: query.selectedType },
            ...condition,
          },
        });
      }

      this.logger.debug(
        `trace id = ${randomNumber} - Aggregation pipeline: ${JSON.stringify(
          pipeline,
        )}`,
      );

      const newRes = await this.ScheduleMRMModel.aggregate(pipeline).exec();
      this.logger.debug(
        `trace id = ${randomNumber} - ScheduleMRMModel aggregate result length: ${newRes.length}`,
      );

      let newValues: any = [];

      if (newRes.length) {
        for (let value of newRes) {
          this.logger.debug(
            `trace id = ${randomNumber} - Processing schedule ID: ${value._id}`,
          );

          let [activeUser, systemData, location, meetingType] =
            await Promise.all([
              value?.organizer
                ? this.prisma.user.findFirst({
                    where: { id: value?.organizer },
                  })
                : Promise.resolve(null),

              value?.systemId && value.systemId.length
                ? this.SystemModel.find({ _id: { $in: value.systemId } })
                : Promise.resolve([]),

              value?.unitId
                ? this.locationService.getLocationById(value?.unitId)
                : Promise.resolve({}),

              value?.meetingType
                ? this.keyAgendaModel.findById(value.meetingType)
                : Promise.resolve({}),
            ]);

          const meetingData = await this.MeetingModel.find({
            meetingSchedule: value._id.toString(),
          });

          const actionItemsData = await this.actionitems.aggregate([
            {
              $match: {
                referenceId: {
                  $in: meetingData.map((meeting) => meeting._id.toString()),
                },
              },
            },
            {
              $group: {
                _id: {
                  meetingId: '$referenceId',
                  name: '$title',
                  id: '$_id',
                  status: '$status',
                },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: '$_id.meetingId',
                totalCount: { $sum: '$count' },
                actionItems: {
                  $push: {
                    name: '$_id.name',
                    status: '$_id.status',
                    id: '$_id.id',
                    count: '$count',
                  },
                },
              },
            },
          ]);

          const actionItemsMap = actionItemsData.reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
          }, {});

          const meetingDataWithActionItems = meetingData.map((meeting) => ({
            ...meeting.toObject(),
            actionItems: actionItemsMap[meeting._id]
              ? actionItemsMap[meeting._id].actionItems
              : [],
            totalActionItemsCount: actionItemsMap[meeting._id]
              ? actionItemsMap[meeting._id].totalCount
              : 0,
          }));

          const access = await this.getOwnerForSchedule(
            value._id,
            uuid,
            userid,
            value.unitId,
          );

          newValues.push({
            value,
            userName: activeUser?.username || '',
            systemData: systemData || [],
            unit: location,
            meetingType: meetingType,
            meetingData: meetingDataWithActionItems,
            access: access,
          });

          this.logger.debug(
            `trace id = ${randomNumber} - Processed MRM record for ID: ${value._id}`,
          );
        }
      }

      const countPipeline = [...pipeline]; // Clone
      const count = await this.ScheduleMRMModel.aggregate(countPipeline).count(
        'count',
      );
      const totalCount = count[0] ? count[0].count : 0;

      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getScheduleDetails/${query} successful`,
        'MRM-Controller',
      );

      return { newValues: newValues, count: totalCount };
    } catch (err) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getScheduleDetails/${query} failed`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async getScheduleById(id, userId, randomNumber) {
    try {
      this.logger.debug(
        `trace id = ${randomNumber} - getScheduleById started for ID: ${id}`,
      );

      const oid = new ObjectId(id);
      const newRes = await this.ScheduleMRMModel.findById(oid);

      this.logger.debug(
        `trace id = ${randomNumber} - ScheduleMRMModel.findById result: ${
          newRes ? 'found' : 'not found'
        }`,
      );

      let newValues: any = [];

      if (newRes) {
        let value = newRes;

        this.logger.debug(
          `trace id = ${randomNumber} - Processing schedule ID: ${value._id}`,
        );

        let activeUser: any = {},
          systemData: any = [],
          location: any = {},
          meetingType: any = {};

        if (value?.organizer) {
          activeUser = await this.prisma.user.findFirst({
            where: { id: value?.organizer },
          });

          this.logger.debug(
            `trace id = ${randomNumber} - Organizer fetched: ${activeUser?.username}`,
          );
        }

        if (value?.systemId && value.systemId.length) {
          const newValue = value.systemId;

          this.logger.debug(
            `trace id = ${randomNumber} - Fetching system data for IDs: ${JSON.stringify(
              newValue,
            )}`,
          );

          systemData = await this.SystemModel.find({
            _id: { $in: newValue },
          });
        }

        if (value?.unitId) {
          location = await this.locationService.getLocationById(value?.unitId);

          this.logger.debug(
            `trace id = ${randomNumber} - Location fetched for unitId: ${value?.unitId}`,
          );
        }

        if (value?.meetingType) {
          meetingType = await this.keyAgendaModel.findById(value.meetingType);

          this.logger.debug(
            `trace id = ${randomNumber} - MeetingType fetched for ID: ${value.meetingType}`,
          );
        }

        const meetingData = await this.MeetingModel.find({
          meetingSchedule: value._id.toString(),
        });

        this.logger.debug(
          `trace id = ${randomNumber} - MeetingModel.find results count: ${meetingData.length}`,
        );

        const access = await this.getOwnerForSchedule(
          value._id,
          uuid,
          userId,
          value.unitId,
        );

        this.logger.debug(
          `trace id = ${randomNumber} - Access check result: ${JSON.stringify(
            access,
          )}`,
        );

        newValues.push({
          value,
          userName: activeUser?.username || '',
          systemData: systemData || [],
          unit: location,
          meetingType: meetingType,
          meetingData: meetingData,
          access: access,
        });
      }

      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getScheduleById/${id} successful`,
        'MRM-Controller',
      );

      return newValues[0];
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/mrm/getScheduleById/${id} failed ${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async getParticipantMeetings(query, user, uuid) {
    try {
      this.logger.debug(
        `trace id=${uuid} - getParticipantMeetings started with query: ${JSON.stringify(
          query,
        )}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      this.logger.debug(
        `trace id=${uuid} - Active user fetched: ${
          activeUser?.username || 'N/A'
        }`,
      );

      const skip = (query.page - 1) * query.limit;

      const condition = {
        organizationId: query.orgId,
        year: query.currentYear,
        participants: { $elemMatch: { id: activeUser.id } },
      };

      this.logger.debug(
        `trace id=${uuid} - MongoDB find condition: ${JSON.stringify(
          condition,
        )}`,
      );

      const count = await this.MeetingModel.countDocuments(condition);
      this.logger.debug(`trace id=${uuid} - Total matching meetings: ${count}`);

      const result = await this.MeetingModel.find(condition)
        .populate('meetingSchedule')
        .skip(skip)
        .limit(query.limit);

      this.logger.debug(
        `trace id=${uuid} - Meetings fetched: ${result.length}`,
      );

      let res = [];

      for (let meet of result) {
        this.logger.debug(
          `trace id=${uuid} - Processing meeting ID: ${meet._id}`,
        );

        let meetingTypeInfo = {};
        if ((meet.meetingSchedule as any)?.meetingType) {
          meetingTypeInfo = await this.keyAgendaModel
            .findOne({
              _id: (meet.meetingSchedule as any).meetingType,
            })
            .select('name');
          this.logger.debug(
            `trace id=${uuid} - Meeting type fetched: ${meetingTypeInfo}`,
          );
        }

        let participants: any = meet.meetingSchedule;
        let scheduledParticipants = participants?.attendees || [];
        let actualParticipants = meet?.participants || [];

        let attendedCount = scheduledParticipants.filter((scheduled: any) =>
          actualParticipants.some(
            (actual: any) => actual.id?.toString() === scheduled.id?.toString(),
          ),
        ).length;

        let attendancePercentage = scheduledParticipants.length
          ? ((attendedCount / scheduledParticipants.length) * 100).toFixed(2)
          : 'N/A';

        this.logger.debug(
          `trace id=${uuid} - Attendance %: ${attendancePercentage}`,
        );

        let groupedActionItems = [];
        const agendaItems: any = meet.agenda || [];

        for (const agendaItem of agendaItems) {
          const relatedActionItems = await this.actionitems.find({
            organizationId: activeUser.organizationId,
            source: 'MRM',
            referenceId: meet._id.toString(),
            'additionalInfo.agenda': agendaItem.agenda,
            'additionalInfo.decisionPoint': agendaItem.decision,
          });

          this.logger.debug(
            `trace id=${uuid} - Found ${relatedActionItems.length} action items for agenda: ${agendaItem.agenda}`,
          );

          if (relatedActionItems.length > 0) {
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: relatedActionItems.every(
                (action) => action.status === true,
              )
                ? 'Open'
                : relatedActionItems.every((action) => action.status === false)
                ? 'Closed'
                : 'In Progress',
              actionItems: relatedActionItems,
            });
          } else {
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: 'Open',
              actionItems: [],
            });
          }
        }

        const owneraccess = meet.createdBy == activeUser.id ? true : false;

        const access = await this.getOwnerForSchedule(
          meet?.meetingSchedule._id,
          uuid,
          user,
          query.unitId,
        );

        this.logger.debug(
          `trace id=${uuid} - Access resolved for meeting ${meet._id}: ${access}`,
        );

        let roles = [];
        let meetingSchedule: any = meet?.meetingSchedule;

        if (meet.createdBy.toString() === activeUser.id.toString()) {
          roles.push('Meeting Owner');
        }

        if (
          meet?.participants?.some(
            (participant: any) =>
              participant?.id?.toString() === activeUser.id.toString(),
          )
        ) {
          roles.push('Participant');
        }

        if (
          meetingSchedule?.keyAgendaId?.some((agenda) =>
            agenda?.owner?.some(
              (owner) => owner.id?.toString() === activeUser.id.toString(),
            ),
          )
        ) {
          roles.push('Agenda Owner');
        }

        const createdBy = await this.prisma.user.findFirst({
          where: {
            id: meet?.createdBy,
          },
          select: {
            id: true,
            firstname: true,
            username: true,
            email: true,
            avatar: true,
          },
        });

        const data1: any = {
          _id: meet._id,
          organizationId: meet.organizationId,
          meetingSchedule: meet.meetingSchedule,
          meetingName: meet.meetingName,
          agenda: meet.agenda,
          createdBy: createdBy,
          year: meet.year,
          meetingdate: meet.meetingdate,
          minutesofMeeting: meet.minutesofMeeting,
          participants: meet.participants,
          externalparticipants: meet.externalparticipants,
          access: access || owneraccess,
          status: meet.status,
          actionItem: groupedActionItems,
          roleName: roles,
          meetingType: meetingTypeInfo,
          percentage: attendancePercentage,
        };

        res.push(data1);
      }

      this.logger.log(
        `GET trace id=${uuid} GET /api/mrm/getParticipantmeetings successful`,
        'getallMeeting',
      );

      return { res: res, count: count };
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid} GET /api/mrm/getParticipantsmeeting failed ${error}`,
        'createMeeting',
      );
    }
  }

  async getAgendaOwnerMeetings(query, user, uuid) {
    try {
      this.logger.debug(
        `trace id=${uuid} - getAgendaOwnerMeetings started with query: ${JSON.stringify(
          query,
        )}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      this.logger.debug(
        `trace id=${uuid} - Active user fetched: ${
          activeUser?.username || 'N/A'
        }`,
      );

      const skip = (query.page - 1) * query.limit;
      const condition = {
        organizationId: query.orgId,
        year: query.currentYear,
      };

      this.logger.debug(
        `trace id=${uuid} - MongoDB condition: ${JSON.stringify(condition)}`,
      );

      const count = await this.MeetingModel.countDocuments(condition);
      this.logger.debug(`trace id=${uuid} - Total matching meetings: ${count}`);

      const result = await this.MeetingModel.find(condition)
        .populate('meetingSchedule')
        .skip(skip)
        .limit(query.limit);

      this.logger.debug(
        `trace id=${uuid} - Meetings fetched: ${result.length}`,
      );

      let res = [];

      for (let meet of result) {
        this.logger.debug(
          `trace id=${uuid} - Processing meeting ID: ${meet._id}`,
        );

        let meetingTypeInfo: any = {};
        if ((meet.meetingSchedule as any)?.meetingType) {
          meetingTypeInfo = await this.keyAgendaModel
            .findOne({
              _id: (meet.meetingSchedule as any).meetingType,
            })
            .select('name');

          this.logger.debug(
            `trace id=${uuid} - MeetingType fetched: ${meetingTypeInfo?.name}`,
          );
        }
        let meetingScheduleInfo: any = meet?.meetingSchedule;
        const scheduledParticipants = meetingScheduleInfo?.attendees || [];
        const actualParticipants = meet?.participants || [];

        const attendedCount = scheduledParticipants.filter((scheduled: any) =>
          actualParticipants.some(
            (actual: any) => actual.id?.toString() === scheduled.id?.toString(),
          ),
        ).length;

        const attendancePercentage = scheduledParticipants.length
          ? ((attendedCount / scheduledParticipants.length) * 100).toFixed(2)
          : 'N/A';

        this.logger.debug(
          `trace id=${uuid} - Attendance calculated: ${attendancePercentage}%`,
        );

        let groupedActionItems = [];
        const agendaItems: any = meet.agenda || [];

        for (const agendaItem of agendaItems) {
          const relatedActionItems = await this.actionitems.find({
            organizationId: activeUser.organizationId,
            source: 'MRM',
            referenceId: meet._id.toString(),
            'additionalInfo.agenda': agendaItem.agenda,
            'additionalInfo.decisionPoint': agendaItem.decision,
          });

          this.logger.debug(
            `trace id=${uuid} - Agenda "${agendaItem.agenda}" has ${relatedActionItems.length} related action items`,
          );

          if (relatedActionItems.length > 0) {
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: relatedActionItems.every((a) => a.status === true)
                ? 'Open'
                : relatedActionItems.every((a) => a.status === false)
                ? 'Closed'
                : 'In Progress',
              actionItems: relatedActionItems,
            });
          } else {
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: 'Open',
              actionItems: [],
            });
          }
        }

        const owneraccess = meet.createdBy == activeUser.id;

        const access = await this.getOwnerForSchedule(
          meet?.meetingSchedule._id,
          uuid,
          user,
          query.unitId,
        );

        this.logger.debug(
          `trace id=${uuid} - Access check result: ${access || owneraccess}`,
        );

        let roles = [];
        const meetingSchedule: any = meet?.meetingSchedule;

        if (meet.createdBy.toString() === activeUser.id.toString()) {
          roles.push('Meeting Owner');
        }

        if (
          meet?.participants?.some(
            (participant: any) =>
              participant?.id?.toString() === activeUser.id.toString(),
          )
        ) {
          roles.push('Participant');
        }

        if (
          meetingSchedule?.keyAgendaId?.some((agenda) =>
            agenda?.owner?.some(
              (owner) => owner.id?.toString() === activeUser.id.toString(),
            ),
          )
        ) {
          roles.push('Agenda Owner');
        }

        this.logger.debug(`trace id=${uuid} - User roles: ${roles.join(', ')}`);

        const createdBy = await this.prisma.user.findFirst({
          where: {
            id: meet?.createdBy,
          },
          select: {
            id: true,
            firstname: true,
            username: true,
            email: true,
            avatar: true,
          },
        });

        const data1 = {
          _id: meet._id,
          organizationId: meet.organizationId,
          meetingSchedule: meet.meetingSchedule,
          meetingName: meet.meetingName,
          agenda: meet.agenda,
          createdBy: createdBy,
          year: meet.year,
          meetingdate: meet.meetingdate,
          minutesofMeeting: meet.minutesofMeeting,
          participants: meet.participants,
          externalparticipants: meet.externalparticipants,
          access: access || owneraccess,
          status: meet.status,
          actionItem: groupedActionItems,
          roleName: roles,
          meetingType: meetingTypeInfo,
          percentage: attendancePercentage,
        };

        if (roles.includes('Agenda Owner')) {
          this.logger.debug(
            `trace id=${uuid} - Adding meeting ${meet._id} to result as Agenda Owner`,
          );
          res.push(data1);
        }
      }

      this.logger.log(
        `GET trace id=${uuid} GET /api/mrm/getAgendaOwnermeetings/ successful`,
        '',
      );

      return { res: res, count: count };
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid} GET /api/mrm/getAgendaOwnermeeting failed ${error}`,
        '',
      );
    }
  }

  async createActionPoint(data: any) {
    this.logger.debug(
      `createActionPoint called with data: ${JSON.stringify(data)}`,
    );

    try {
      const result = await this.ActionPointMRMModel.create(data);
      this.logger.debug(
        `createActionPoint successful. Created ID: ${result?._id}`,
      );
      return result;
    } catch (err) {
      this.logger.error(`createActionPoint failed with error: ${err}`);
      throw new InternalServerErrorException();
    }
  }

  async updateActionPoint(id: string, data: any) {
    this.logger.debug(
      `updateActionPoint called with id: ${id} and data: ${JSON.stringify(
        data,
      )}`,
    );

    try {
      const result = await this.ActionPointMRMModel.findByIdAndUpdate(id, {
        ...data,
      });

      this.logger.debug(`updateActionPoint successful for id: ${id}`);
      return result;
    } catch (err) {
      this.logger.error(
        `updateActionPoint failed for id: ${id} with error: ${err}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async sendInviteForMRM(id, userid) {
    this.logger.debug(
      `sendInviteForMRM called with id: ${id}, userid: ${JSON.stringify(
        userid,
      )}`,
    );

    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: {
          organization: true,
        },
      });
      this.logger.debug(
        `Fetched activeUser: ${JSON.stringify(activeUser?.id)}`,
      );

      const meeting = await this.MeetingModel.findById(id);
      this.logger.debug(
        `Fetched meeting: ${JSON.stringify(meeting?.meetingName)}`,
      );

      const schedule = await this.ScheduleMRMModel.findById(
        meeting?.meetingSchedule,
      );
      this.logger.debug(
        `Fetched schedule for meetingScheduleId: ${meeting?.meetingSchedule}`,
      );

      const scheduleParticipants =
        schedule.attendees?.map((attendee: any) => attendee.email) || [];
      const attendeesEmails =
        meeting.participants?.map((attendee: any) => attendee.email) || [];

      this.logger.debug(
        `Schedule participants: ${JSON.stringify(scheduleParticipants)}`,
      );
      this.logger.debug(
        `Meeting participants: ${JSON.stringify(attendeesEmails)}`,
      );

      const combinedEmails = Array.from(
        new Set([...scheduleParticipants, ...attendeesEmails]),
      );
      this.logger.debug(
        `Combined unique emails: ${JSON.stringify(combinedEmails)}`,
      );

      try {
        await this.sendMRMAttendeesEmail(
          combinedEmails,
          meeting,
          activeUser,
          this.emailService.sendEmailMRM,
          // Pass CC list here
        );
        this.logger.debug(`Email sent successfully to MRM participants`);
      } catch (emailError) {
        this.logger.error(
          `Failed to send invite for meeting ${meeting.meetingName}: ${emailError.message}`,
          'MRM-Controller',
        );
      }

      this.logger.log(
        `POST /api/mrm/sendInvite/${id} successful`,
        'MRM-Controller',
      );
    } catch (err) {
      this.logger.error(
        `POST /api/mrm/sendInvite/${id} failed ${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async sendAgendOwnerMail(id, userid, randomNumber) {
    this.logger.debug(
      `sendAgendOwnerMail called with id: ${id}, userid: ${userid}, traceId: ${randomNumber}`,
    );

    try {
      const oid = new ObjectId(id);
      const meetingSchedule = await this.ScheduleMRMModel.findById(oid);
      this.logger.debug(`Fetched meetingSchedule with id: ${oid}`);

      let details = meetingSchedule.keyAgendaId?.map((item: any) => ({
        agenda: item.agenda,
        owner: item.owner?.map((owner) => ({
          id: owner.id,
          email: owner.email,
          username: owner.username,
        })),
      }));
      this.logger.debug(
        `Extracted agenda owner details: ${JSON.stringify(details)}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          id: meetingSchedule.organizer,
        },
        include: {
          organization: true,
        },
      });
      this.logger.debug(
        `Fetched activeUser (organizer): ${activeUser?.username} (${activeUser?.id})`,
      );

      // Send details to owners
      details.forEach((item) => {
        if (item.owner && item.owner.length > 0) {
          item.owner.forEach((owner) => {
            this.logger.debug(
              `Sending email to agenda owner: ${owner.email} for agenda: ${item.agenda}`,
            );
            sendMailToOwner(
              owner,
              item,
              meetingSchedule,
              activeUser,
              this.emailService.sendEmail,
            );
          });
        } else {
          this.logger.debug(`No owners found for agenda: ${item.agenda}`);
        }
      });

      this.logger.log(
        `trace id = ${randomNumber} POST /api/mrm/sendAgendOwnerMail/${id} successful`,
        'MRM-Controller',
      );
    } catch (err) {
      this.logger.log(
        `trace id = ${randomNumber} POST /api/mrm/sendAgendOwnerMail/${id} failed`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async sendMRMAttendeesEmail(
    attendees: any,
    data: any,
    currentUser: any,
    mailService,
  ) {
    this.logger.debug(
      `sendMRMAttendeesEmail called for meeting: ${data?.meetingName}, organizer: ${currentUser?.email}`,
    );

    let date = moment(data?.meetingdate ?? new Date());
    let dateComponent = date.format('DD-MM-YYYY');
    this.logger.debug(`Formatted meeting date: ${dateComponent}`);

    const participantsList =
      data?.participants
        ?.map((participant, index) => `<li>${participant?.fullname} </li>`)
        .join('') || '';
    const cleanDescription = data?.minutesofMeeting?.replace(/<[^>]*>/g, '');

    const emailMessageIP = `...`; // skipped for brevity, remains unchanged

    const msg = {
      to: attendees[0],
      cc: attendees,
      from: process.env.FROM,
      subject: `MoM of ${data.meetingName}`,
      html: `<div>${emailMessageIP}</div>`,
      attachments: [],
    };

    const toEmails = new Set([currentUser.email, ...msg.cc]);
    const uniqueEmails = Array.from(toEmails);
    msg.to = uniqueEmails[0];
    msg.cc = uniqueEmails.slice(1);

    this.logger.debug(
      `Final recipients - To: ${msg.to}, CC: ${JSON.stringify(msg.cc)}`,
    );

    let attachments = [];
    if (data?.attachments && data?.attachments?.length > 0) {
      for (const attachment of data?.attachments) {
        if (attachment?.url) {
          try {
            this.logger.debug(
              `Fetching attachment from URL: ${attachment.url}`,
            );
            const fileContent = await this.fetchFileContent(attachment?.url);
            attachments.push({
              filename: attachment?.name || 'attachment.pdf',
              content: fileContent,
              encoding: 'base64',
              contentType: attachment?.contentType || 'application/pdf',
            });
          } catch (error) {
            this.logger.error(
              `Error fetching file from storage or URL: ${error}`,
            );
          }
        } else if (attachment?.content) {
          this.logger.debug(
            `Using inline base64 attachment: ${attachment.name}`,
          );
          attachments.push({
            filename: attachment?.name || 'attachment.pdf',
            content: attachment?.content,
            encoding: 'base64',
            contentType: attachment?.contentType || 'application/pdf',
          });
        }
      }
    }
    msg.attachments = attachments;
    this.logger.debug(`Total attachments prepared: ${attachments.length}`);

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        this.logger.debug(
          `Using IP-based email system for meeting: ${data.meetingName}`,
        );
        await this.emailService.sendEmailMRM(
          uniqueEmails[0],
          uniqueEmails.slice(1),
          `MoM of ${data.meetingName}`,
          '',
          emailMessageIP,
          attachments,
        );
        this.logger.debug('Mail sent via IP-based system');
      } else {
        this.logger.debug(
          `Using SendGrid to send mail for meeting: ${data.meetingName}`,
        );
        await sgMail.send(msg);
        this.logger.debug('Email sent via SendGrid');
      }
    } catch (error) {
      this.logger.error(
        `Error sending email for meeting ${data.meetingName}: ${error}`,
      );
    }
  }

  //mail to participants and owner
  async sendParticipantMail(id, userid, randomNumber) {
    try {
      this.logger.debug(
        `sendParticipantMail started with id=${id}, userid=${userid}, trace=${randomNumber}`,
      );

      const oid = new ObjectId(id);
      const meetingSchedule: any = await this.ScheduleMRMModel.findById(oid);

      this.logger.debug(
        `Fetched meetingSchedule for id=${id}: ${!!meetingSchedule}`,
      );

      const activeUser = await this.prisma.user.findFirst({
        where: {
          id: meetingSchedule.organizer,
        },
        include: {
          organization: true,
        },
      });

      this.logger.debug(`Fetched organizer: ${activeUser?.email}`);

      const attendeesEmails =
        meetingSchedule?.attendees?.map((attendee: any) => attendee.email) ||
        [];

      this.logger.debug(
        `Initial attendeesEmails: ${JSON.stringify(attendeesEmails)}`,
      );

      const isOrganizerInAttendees = meetingSchedule?.attendees?.some(
        (attendee: any) => attendee.id === activeUser.id,
      );

      this.logger.debug(`Is organizer in attendees: ${isOrganizerInAttendees}`);

      if (!isOrganizerInAttendees) {
        attendeesEmails.push(activeUser.email);
        this.logger.debug(`Organizer added to CC list: ${activeUser.email}`);
      }

      await this.sendMailToParticipants(
        activeUser,
        meetingSchedule,
        attendeesEmails,
        this.emailService.sendEmailwithICSandFiles,
      );

      this.logger.debug(
        `sendMailToParticipants invoked successfully for meeting id=${id}`,
      );

      this.logger.log(
        `trace id = ${randomNumber} POST /api/mrm/sendParticipantMail/${id} successful`,
        'MRM-Controller',
      );
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/mrm/sendParticipantMail/${id} failed ${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async getMrmMeetingDetails(id: any, randomNumber) {
    try {
      this.logger.debug(
        `getMrmMeetingDetails started for id=${id}, trace=${randomNumber}`,
      );

      const condition = { _id: id };

      const newRes = await this.ScheduleMRMModel.aggregate([
        { $match: condition },
        {
          $lookup: {
            from: 'actionpoints',
            localField: '_id',
            foreignField: 'mrmId',
            as: 'actionPointdata',
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      this.logger.debug(`Aggregation result length: ${newRes.length}`);

      let newValues: any = [];

      if (newRes.length) {
        for (let i = 0; i < newRes.length; i++) {
          let value = newRes[i];
          this.logger.debug(
            `Processing meeting index=${i}, meetingId=${value._id}`,
          );

          let activeUser: any = {},
            systemData: any = [],
            location: any = {};

          if (value?.organizer) {
            activeUser = await this.prisma.user.findFirst({
              where: { id: value?.organizer },
            });
            this.logger.debug(`Fetched organizer: ${activeUser?.username}`);
          }

          if (value?.systemId && value.systemId.length) {
            let newValue = value.systemId;
            systemData = await this.SystemModel.find({
              _id: { $in: newValue },
            });
            this.logger.debug(
              `Fetched system data count: ${systemData.length}`,
            );
          }

          if (value?.unitId) {
            location = await this.locationService.getLocationById(
              value?.unitId,
            );
            this.logger.debug(`Fetched location: ${location?.locationName}`);
          }

          newValues.push({
            value,
            userName: activeUser?.username || '',
            systemData: systemData || [],
            unit: location,
          });
        }
      }

      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getMrmMeetingDetails/${id} successful`,
        'MRM-Controller',
      );

      return newValues;
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/mrm/getMrmMeetingDetails/${id} failed ${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method deleteAttachment
   *  This method handles deletion of uploaded files for mrm
   * @param link path to delete file from
   * @returns returns file deletion status code 200 or 500
   */
  async deleteAttachment(uid: string) {
    //  //console.log('uid', uid);
    // try {
    if (process.env.IS_OBJECT_STORE === 'false') {
      const deletePath = path.join(
        __dirname,
        process.env.ATTACHMENT_DIR_PATH,
        `${process.env.ATTACHMENT_DELETE_PATH}${uid}`,
      );
      unlinkSync(deletePath);
      return { status: 200, msg: 'Attachment deleted' };
    } else {
      //console.log('inside else');
    }
    // } catch (err) {
    //   throw new InternalServerErrorException();
    // }
  }

  async getOwnMRMValues(orgId: string, userID: any, randomNumber) {
    try {
      const condition = {
        organizationId: orgId,
        createdBy: userID,
        deleted: false,
      };
      // const result = await this.ScheduleMRMModel.find(condition);

      const newRes = await this.ScheduleMRMModel.aggregate([
        {
          $match: condition,
        },
        {
          $lookup: {
            from: 'actionpoints',
            localField: '_id',
            foreignField: 'mrmId',
            as: 'actionPointdata',
          },
        },
      ]);

      let newValues: any = [];

      if (newRes.length) {
        for (let i = 0; i < newRes.length; i++) {
          let value = newRes[i];
          let activeUser: any = {},
            systemData: any = [],
            location: any = {};
          if (value?.organizer) {
            activeUser = await this.prisma.user.findFirst({
              where: {
                id: value?.organizer,
              },
            });

            if (value?.systemId && value.systemId.length) {
              let newValue = value.systemId;

              systemData = await this.SystemModel.find({
                _id: { $in: newValue },
              });
            }

            if (value?.unitId) {
              location = await this.locationService.getLocationById(
                value?.unitId,
              );
            }
          }

          newValues.push({
            value,
            userName: activeUser?.username || '',
            systemData: systemData || [],
            unit: location,
          });
        }
      }
      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getOwnScheduleDetails successful`,
        'MRM-Controller',
      );
      return newValues;
      // return [...newResult];
    } catch (err) {
      //////////////console.log(err, 'err');
      throw new InternalServerErrorException();
    }
  }

  async searchSchedule(query, user, randomNumber) {
    try {
      this.logger.debug(
        `searchSchedule started with query=${JSON.stringify(
          query,
        )} trace=${randomNumber}`,
      );

      const page = 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      const activeuser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      this.logger.debug(
        `Fetched active user: ${activeuser?.id}, orgId=${activeuser?.organizationId}`,
      );

      let users: any = await this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: activeuser.organizationId },
            {
              OR: [{ username: { contains: query.text, mode: 'insensitive' } }],
            },
            ...(query.unitId && query.unitId !== 'All'
              ? [{ locationId: query.unitId }]
              : []),
            ...(query.entityId && query.entityId !== 'All'
              ? [{ entityId: query.entityId }]
              : []),
          ],
        },
      });

      this.logger.debug(
        `Found ${users.length} users matching username like ${query.text}`,
      );

      const userIds = users.map((item) => item.id);

      const newRes = await this.ScheduleMRMModel.find({
        $and: [
          { organizationId: activeuser.organizationId },
          { currentYear: query.year },
          { deleted: false },
          {
            unitId:
              query.unitId && query.unitId !== 'All'
                ? query.unitId
                : { $exists: true },
          },
          {
            entityId:
              query.entityId && query.entityId !== 'All'
                ? query.entityId
                : { $exists: true },
          },
          {
            $or: [
              { meetingName: { $regex: query.text, $options: 'i' } },
              { createdBy: { $in: userIds } },
            ],
          },
        ],
      })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      this.logger.debug(`Fetched ${newRes.length} schedules matching query`);

      let newValues: any = [];

      for (let value of newRes) {
        this.logger.debug(`Processing schedule with id=${value._id}`);
        let activeUser: any = {},
          systemData: any = [],
          meetingType,
          location: any = {};

        if (value?.organizer) {
          activeUser = await this.prisma.user.findFirst({
            where: { id: value.organizer },
          });
          this.logger.debug(`Organizer: ${activeUser?.username}`);

          if (value?.systemId?.length) {
            systemData = await this.SystemModel.find({
              _id: { $in: value.systemId },
            });
            this.logger.debug(
              `Fetched ${systemData.length} systems for schedule ${value._id}`,
            );
          }

          if (value?.unitId) {
            location = await this.locationService.getLocationById(value.unitId);
            this.logger.debug(`Fetched location for unitId=${value.unitId}`);
          }
        }

        if (value.meetingType) {
          meetingType = await this.keyAgendaModel.findById(value.meetingType);
          this.logger.debug(`Fetched meeting type: ${meetingType?.name}`);
        }

        const meetingData = await this.MeetingModel.find({
          meetingSchedule: value._id.toString(),
        });
        this.logger.debug(`Fetched ${meetingData.length} meeting entries`);

        const access = await this.getOwnerForSchedule(
          value._id,
          uuid,
          user,
          value.unitId,
        );
        this.logger.debug(
          `Access resolved for schedule ${value._id}: ${access}`,
        );

        newValues.push({
          value,
          userName: activeUser?.username || '',
          systemData: systemData || [],
          meetingType: meetingType,
          unit: location,
          meetingData: meetingData,
          access: access,
        });
      }

      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/search successful`,
        'MRM-Controller',
      );
      return newValues;
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/mrm/search failed error=${err}`,
        'MRM-Controller',
      );
      throw new InternalServerErrorException();
    }
  }

  async createAgenda(data, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      // const auditTrail = await auditTrial(
      //   'agendas',
      //   'MRM',
      //   'MRM Agendas',
      //   user.user,
      //   activeUser,
      //   uuid,
      // );
      // setTimeout(async () => {
      this.logger.debug(
        `createAgenda service started for ${activeUser} with data $[data]`,
      );
      const result = await this.AgendaModel.create(data);
      this.logger.log(
        `trace id = ${uuid} createAgend response complete is successful for user ${activeUser} with ${data}`,
        'MRMService',
      );
      return result;
      // }, 1000);
    } catch (error) {
      this.logger.log(
        `trace id = ${uuid} createAgenda failed for ${activeUser} for  ${data}`,
        error?.stack || error?.message,
      );
    }
  }
  async getAgendaById(id, uuid) {
    try {
      this.logger.debug(`getAgendaById/${id} started `);
      const result = await this.AgendaModel.findById(id);
      this.logger.log(
        `trace id = ${uuid} getAgendaById${id}response complete is successfull  ${result}`,
        'MRMService',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} getKeyAgendById for ${id} failed`,
        error?.stack || error?.message,
      );
    }
  }
  async updateAgenda(id, data, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      this.logger.debug(
        `updateAgenda started for ${activeUser} with data ${data} for ${id}`,
      );
      // const auditTrail = await auditTrial(
      //   'agendas',
      //   'MRM',
      //   'MRM Agendas',
      //   user.user,
      //   activeUser,
      //   uuid,
      // );
      // setTimeout(async () => {
      const result = await this.AgendaModel.findByIdAndUpdate(id, data);

      this.logger.log(
        `trace id = ${uuid} updateAgenda/${id} response complete is successfull  ${result}`,
        'MRMService',
      );
      return result;
      // }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} updateAgenda failed for id=${id} and payload= ${data}`,
        error?.stack || error?.message,
      );
    }
  }
  async deleteAgenda(id, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      this.logger.debug(`deleteAgenda started for ${activeUser} with ${id}`);
      // const auditTrail = await auditTrial(
      //   'agendas',
      //   'MRM',
      //   'MRM Agendas',
      //   user.user,
      //   activeUser,
      //   uuid,
      // );
      // setTimeout(async () => {
      const result = await this.AgendaModel.findByIdAndDelete(id);
      this.logger.log(
        `trace id = ${uuid} deleteAgenda is successfull  ${id}`,
        'MRMService',
      );
      return result;
      // }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} deleteAgenda failed for id=${id} error=${error} for ${activeUser}`,
        error?.stack || error?.message,
      );
    }
  }
  async getAllAgendaForMeetingType(id, uuid, user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user,
      },
    });
    try {
      // const oid = new ObjectId(id);'
      this.logger.debug(
        `getAllAgendaForMeetingTyoe service started for ${activeUser} meetingType=${id}`,
      );
      const result = await this.AgendaModel.find({
        meetingType: id,
      }).populate('meetingType');
      const meetingTypeinfo = await this.keyAgendaModel.findById(id);

      this.logger.log(
        `trace id = ${uuid} getAllAgendaForMeetingType is successfull  ${result}`,
        'MRMService',
      );
      return { result: result, participants: meetingTypeinfo.participants };
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} deleteAgenda failed for id=${id} error=${error}`,
        error?.message || error?.stack,
      );
    }
  }
  async getAllAgendaOwnersForMeetingType(id, uuid, userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid.id,
      },
    });
    try {
      this.logger.debug(
        `getallAgendaOwnersForMeetingType service started for ${activeUser}`,
      );
      // //console.log('activeuser', activeUser);
      let agendaowners = [];

      const oid = new Types.ObjectId(id);
      const meetingTypeowner = await this.keyAgendaModel
        .findById(oid)
        .select('owner');
      this.logger.debug(`fetched meeting type and owner ${meetingTypeowner}`);
      // //console.log('meetingtypeowner', meetingTypeowner);

      const isUserOwner = meetingTypeowner.owner.some(
        (owner: any) => owner.id === activeUser.id,
      );
      this.logger.debug(`checking if user is owner ${isUserOwner}`);

      if (
        userid.kcRoles.roles.includes('ORG-ADMIN') ||
        userid.kcRoles.roles.includes('MR') ||
        isUserOwner
      ) {
        this.logger.debug(
          `inside if user is either org admin or mr or owner send access as true`,
        );
        this.logger.log(
          ` trace id=${uuid}GET /api/mrm/getAllAgendaOwnersForMeetingschedule successful for id ${id}`,
          'getAllAgendaOwnersForMeetingType',
        );
        return { access: true };
      } else {
        this.logger.debug(`inside else conditon user is not mcoe/mr/owner`);
        this.logger.log(
          ` trace id=${uuid}GET /api/mrm/getAllAgendaOwnersForMeetingschedule successful for id ${id}`,
          'getAllAgendaOwnersForMeetingType',
        );
        return { access: false };
      }
    } catch (error) {
      this.logger.error(
        `GET ${uuid}/api/mrm/getAllAgendaOwnersForMeetingschedule failed for id ${id} ${error}`,
      );
      return error;
    }
  }
  async getAllAgendaOwnersIdForMeetingType(id, uuid, userid) {
    try {
      this.logger.debug(
        `trace id=${uuid} - Fetching agenda owners for meetingType id=${id}`,
      );

      const meetingTypeowner = await this.AgendaModel.find({
        meetingType: id,
      }).select('owner');

      this.logger.debug(
        `trace id=${uuid} - Retrieved ${meetingTypeowner?.length} agenda items`,
      );

      const userIds = [
        ...new Set(
          meetingTypeowner?.flatMap((item: any) =>
            item.owner.map((owner) => owner.id),
          ),
        ),
      ];

      this.logger.debug(
        `trace id=${uuid} - Extracted ${userIds.length} unique owner IDs`,
      );

      this.logger.log(
        `trace id=${uuid} GET /api/mrm/getAllAgendaOwnerIDs successful for id ${id}`,
        'getAllAgendaOwnersForMeetingType',
      );

      return userIds;
    } catch (error) {
      this.logger.error(
        `GET ${uuid} /api/mrm/getAllAgendaOwnersForMeetingschedule failed for id ${id} ${error}`,
      );
      return error;
    }
  }

  async getOwnerForSchedule(id, uuid, userid, unitId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: {
          location: true,
        },
      });
      ////console.log('activeuser', activeUser);
      const isOrgAdmin: boolean = userid.kcRoles.roles.includes('ORG-ADMIN')
        ? true
        : false;
      const isMR: boolean =
        userid.kcRoles.roles.includes('MR') &&
        activeUser?.location?.id === unitId
          ? true
          : false;
      const oid = new Types.ObjectId(id);
      // //console.log('oid', oid);
      const schedule: any = await this.ScheduleMRMModel.findById(oid).select(
        'createdBy keyAgendaId',
      );
      //  //console.log('schedule', schedule);
      const createdByMatches = schedule.createdBy === activeUser.id;

      const ownerMatches: boolean =
        schedule?.keyAgendaId?.some((agendaItem) =>
          agendaItem.owner?.some((owner) => owner.id === activeUser.id),
        ) ?? false;
      //console.log('owner ', ownerMatches);
      if (ownerMatches || createdByMatches || isOrgAdmin || isMR) {
        this.logger.log(
          ` trace id=${uuid}GET /api/mrm/getOwnerForSchedule successful for id ${id}`,
          '/api/mrm/getOwnerForSchedule',
        );
        return true;
      } else {
        this.logger.log(
          ` trace id=${uuid}GET /api/mrm/getOwnerForSchedule successful for id ${id}`,
          '/api/mrm/getOwnerForSchedule',
        );
        return false;
      }
    } catch (error) {
      this.logger.error(
        `GET ${uuid} /api/mrm/getOwnerForSchedule failed for id ${id} ${error} `,
      );
    }
  }
  async createMeeting(data, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      this.logger.debug(
        `createMeeting service started for ${activeUser} with data =${data} and checking for duplication`,
      );
      // console.log('data in create', data);
      const duplicateCheck = await this.MeetingModel.find({
        meetingName: { $regex: new RegExp('^' + data.meetingName + '$', 'i') },
        meetingdate: data.meetingdate,
        deleted: false,
      });
      if (duplicateCheck.length > 0) {
        this.logger.error(
          `trace id = ${uuid} POST /api/mrm/createMeeting failed for ${data} conflict error`,
          'MRM-Controller',
        );
        return new ConflictException(
          'Conflict error occurred during processing',
        );
      } else {
        const result = await this.MeetingModel.create({
          ...data,
          entityId: activeUser.entityId,
        });
        this.logger.log(
          ` trace id=${uuid}POST /api/mrm/createMeeting successful for payload ${data}`,
          'createMeeting',
        );
        if (result.status === 'Submit') {
          await this.sendInviteForMRM(result?._id, user.user);
        }
        return result;
      }
      // }, 1000);
    } catch (error) {
      this.logger.error(
        `POSt ${uuid}/api/mrm/createMeeting failed for payload ${data} ${error} `,
      );
      return error;
    }
  }

  async updateMeeting(data, id, user, uuid) {
    try {
      // const auditTrail = await auditTrial(
      //   'meetings',
      //   'MRM',
      //   'Minutes Of Meeting',
      //   user.user,
      //   activeUser,
      //   uuid,
      // );
      // setTimeout(async () => {
      this.logger.debug(`updateMeeting/${id} started for ${user} with ${data}`);
      const duplicateCheck = await this.MeetingModel.find({
        meetingName: { $regex: new RegExp('^' + data.meetingName + '$', 'i') },
        meetingdate: data.meetingdate,
        deleted: false,
        _id: { $ne: id },
      });
      this.logger.debug(`duplicate check ${duplicateCheck}`);
      if (duplicateCheck.length > 0) {
        this.logger.error(
          `trace id = ${uuid} POST /api/mrm/createMeeting failed for ${data} conflict error`,
          'MRM-Controller',
        );
        return new ConflictException(
          'Conflict error occurred during processing',
        );
      } else {
        this.logger.debug(`not duplicate proceeding  with updating`);
        const result = await this.MeetingModel.findByIdAndUpdate(id, data);

        this.logger.log(
          ` trace id=${uuid}PATCH /api/mrm/upateMeeting/${id} successful for payload ${data}`,
          'createMeeting',
        );
        const updatedresult = await this.MeetingModel.findById(result._id);
        if (updatedresult.status === 'Submit') {
          await this.sendInviteForMRM(updatedresult?._id, user.user);
        }
        return updatedresult;
      }
      // }, 1000);
    } catch (error) {
      this.logger.error(
        `PATCH ${uuid}/api/mrm/updateMeeting/${id} failed for payload ${data} ${error}`,
      );
      return error;
    }
  }

  async getMeetingById(id, uuid, userid) {
    try {
      this.logger.debug(`getMeetingById/${id} started for ${userid}`);
      const result = await this.MeetingModel.findById(id);
      this.logger.debug(`fetched meeting ${result}`);
      const meetingSchedule = await await this.ScheduleMRMModel.findById(
        result.meetingSchedule,
      );
      this.logger.debug(`fetched meeting schedule ${meetingSchedule}`);
      const location: any = await this.prisma.location.findFirst({
        where: {
          id: result.locationId,
        },
      });
      this.logger.debug(`fetched location ${location}`);
      const oid = new ObjectId(meetingSchedule.meetingType);

      const meetitngtype: any = await this.keyAgendaModel.findById(oid);
      this.logger.debug(`fetched meeting type ${meetitngtype}`);
      // //console.log('meetingtype', meetitngtype);
      const data: any = {
        _id: result._id,
        meetingName: result.meetingName,
        meetingSchedule: meetingSchedule,
        venue: result.venue,
        agenda: result.agenda,
        createdBy: result.createdBy,
        year: result.year,
        meetingdate: result.meetingdate,
        participants: result.participants,
        externalparticipants: result.externalparticipants,
        minutesofMeeting: result.minutesofMeeting,
        attachments: result.attachments,
        organizationId: result.organizationId,
        locationId: location,
        meetingType: meetitngtype,
      };

      this.logger.log(
        ` trace id=${uuid}PATCH /api/mrm/getMeeting/${id} successful for payload`,
        'createMeeting',
      );
      return data;
    } catch (error) {
      this.logger.error(
        `PATCH ${uuid}/api/mrm/getMeeting/${id} failed for payload ${error}`,
      );
      return error;
    }
  }
  async getMeetingByIdForActionItem(id, uuid, userid) {
    try {
      this.logger.debug(`getMeetingByIdForActionItem ${id} for user ${userid}`);
      let meet;
      try {
        meet = await this.MeetingModel.findById(id);
        this.logger.debug(`fetched meeting ${meet}`);
      } catch (error) {
        this.logger.debug(`error fetching meeting`);
      }

      let meetingSchedule;
      try {
        meetingSchedule = await await this.ScheduleMRMModel.findById(
          meet.meetingSchedule,
        );
        this.logger.debug(`fetched meeting Schedule ${meetingSchedule}`);
      } catch (error) {
        this.logger.error(`error fetching meetig schedule`, error);
      }
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
      });

      const actionItem = await this.actionitems.find({
        organizationId: activeuser.organizationId,
        source: 'MRM',
        referenceId: meet._id,
      });
      this.logger.debug(`fetched action items ${actionItem?.length}`);
      const owneraccess = meet.createdBy == activeuser.id ? true : false;
      const access = await this.getOwnerForSchedule(
        meetingSchedule._id,
        uuid,
        userid,
        meet?.locationId,
      );
      this.logger.debug(`getting access ${access}`);
      const data1: any = {
        _id: meet._id,
        organizationId: meet.organizationId,
        meetingSchedule: meetingSchedule,
        meetingName: meet.meetingName,
        agenda: meet.agenda,
        createdBy: await this.userService.getUserById(meet.createdBy),
        year: meet.year,
        meetingdate: meet.meetingdate,
        minutesofMeeting: meet.minutesofMeeting,
        participants: meet.participants,
        externalparticipants: meet.externalparticipants,
        attachments: meet.attachments,
        access: access || owneraccess,
        status: meet.status,
        actionItem: actionItem,
      };

      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getallmeetings/ successful`,
        'getallMeeting',
      );

      return { data1 };
    } catch (error) {
      this.logger.error(
        `PATCH ${uuid}/api/mrm/getMeeting/${id} failed for payload ${error}`,
      );
      return error;
    }
  }

  async getAllMeetingByScheduleId(query, uuid) {
    try {
      let data = [];
      this.logger.debug(`getAllMeetingByScheduleId started with ${query}`);
      const skip = (query.page - 1) * query.limit;
      const result = await this.MeetingModel.find({
        meetingSchedule: query.id,
      })
        .populate('meetingSchedule')
        .skip(skip)
        .limit(query.limit);

      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getallmeetingbyschedule/${query.id} successful`,
        'createMeeting',
      );
      return result;
    } catch (error) {
      this.logger.error(
        ` ${uuid}/api/mrm/getallmeetingbyschedule/${query.id} failed ${error} `,
      );
      return error;
    }
  }
  async getAgendaForOwner(mtid, userid, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    try {
      this.logger.debug(
        `getAgendaForOWner service started for meeting schduel id ${mtid}`,
      );

      const result = await this.ScheduleMRMModel.find({ _id: mtid });
      this.logger.debug(`fetched result ${result}`);

      // First check if the logged-in user is the owner of this meeting schedule
      if (result[0].organizer === activeUser.id) {
        this.logger.debug(
          `if user is owner of meetingscheudle return all agenda for meeting type`,
        );
        const agendas = result
          ? result[0].keyAgendaId.map((item: any) => ({
              agenda: item.agenda,
              owner: item.owner, // Include the owner along with the agenda
            }))
          : [];
        return agendas;
      } else {
        this.logger.debug(`inside agenda owner condition`);
        const data1 = result[0].keyAgendaId;
        let agendas = [];

        data1.forEach((item: any) => {
          if (item.owner) {
            item.owner.forEach((user: any) => {
              if (user.id === activeUser.id) {
                agendas.push({
                  agenda: item.agenda,
                  owner: item.owner, // Include the owner in the agenda
                });
              }
            });
          }
        });
        this.logger.debug(`fetched agenda ${agendas}`);

        this.logger.log(
          `GET trace id=${uuid} GET /api/mrm/getallmeetingbyschedule/ successful`,
          'createMeeting',
        );

        return agendas;
      }
    } catch (error) {
      this.logger.error(
        ` ${uuid}/api/mrm/getallmeetingbyschedule failed ${error}`,
      );
      return error;
    }
  }

  async uploadfileformeeting(file: any) {
    try {
      const path = file.path;
      return { name: file.originalname, path: getExactPath(path) };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  async getAllMeetings(query, uuid, userid) {
    try {
      let skip = (query.page - 1) * query.limit;
      let condition;
      this.logger.debug(`getAllMeetng service started with ${query}`);
      // console.log('current year', query);
      if (query.unitId === 'All' || query.unitId === '') {
        condition = {
          organizationId: query.orgId,
          year: query.currentYear ? query.currentYear : query.currentYear,
        };
      } else {
        if (query.entityId === 'All' || query.entityId === '') {
          condition = {
            organizationId: query.orgId,
            locationId: query.unitId,
            year: query.currentYear ? query.currentYear : moment().year(),
          };
        } else {
          condition = {
            organizationId: query.orgId,
            locationId: query.unitId,
            entityId: query.entityId,
            year: query.currentYear,
          };
        }
      }

      // Modify condition if selectedOwner exists and is a string of comma-separated IDs
      if (
        typeof query.selectedOwner === 'string' &&
        query.selectedOwner.trim() !== ''
      ) {
        const selectedOwnersArray = query.selectedOwner
          .split(',')
          .map((id) => id.trim());
        condition.createdBy = { $in: selectedOwnersArray };
      }
      if (
        typeof query.selectedMeetingType === 'string' &&
        query.selectedMeetingType.trim() !== ''
      ) {
        const selectedMeetingTypesArray = query.selectedMeetingType
          .split(',')
          .map((id) => id.trim());
        condition.meetingType = { $in: selectedMeetingTypesArray };
      }
      this.logger.debug(`getAllMeetings condtion for fetching ${condition}`);
      // console.log('condition', condition);
      const result = await this.MeetingModel.find(condition)
        .populate('meetingSchedule')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(query.limit);
      // console.log('result', result);
      this.logger.debug(`fetched result ${result?.length}`);
      const count = await this.MeetingModel.countDocuments(condition);
      let res = [];

      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
      });
      // console.log('activeuser', activeuser);
      const users = await this.prisma.user.findMany({
        where: {
          organizationId: activeuser.organizationId,
          deleted: false,
        },
        select: {
          firstname: true,
          lastname: true,
          email: true,
          username: true,
          id: true,
        },
      });

      for (let meet of result) {
        this.logger.debug(`processing meeting ${meet}`);
        let meetingTypeInfo = {};
        if ((meet.meetingSchedule as any)?.meetingType) {
          meetingTypeInfo = await this.keyAgendaModel
            .findOne({
              _id: (meet.meetingSchedule as any).meetingType,
            })
            .select('name');
        }
        this.logger.debug(`getching meeting type infor ${meetingTypeInfo}`);

        let groupedActionItems = [];

        const agendaItems: any = meet.agenda || [];

        for (const agendaItem of agendaItems) {
          this.logger.debug(`processing agenda ${agendaItem} for grouping`);
          // Look for action items associated with this specific agenda and decision combination
          const relatedActionItems = await this.actionitems.find({
            organizationId: activeuser.organizationId,
            source: 'MRM',
            referenceId: meet._id.toString(),
            'additionalInfo.agenda': agendaItem.agenda,
            'additionalInfo.decisionPoint': agendaItem.decision,
          });

          if (relatedActionItems.length > 0) {
            // If action items exist for this agenda, group them
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A', // Use decisionPoint if available
              agenda: agendaItem.agenda || 'No agenda available', // Use agenda name or default
              decision: agendaItem.decision || 'No decision made', // Use decision or default
              status: relatedActionItems.every(
                (action) => action.status === true,
              )
                ? 'Open'
                : relatedActionItems.every((action) => action.status === false)
                ? 'Closed'
                : 'In Progress',
              actionItems: relatedActionItems, // Attach the related action items
            });
          } else {
            // If no action items exist for this agenda, add it with default "Open" status
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: 'Open', // Default status when no action items exist
              actionItems: [], // No action items, so empty array
            });
          }
        }
        this.logger.debug(`grouped action items ${groupedActionItems}`);
        // If no action items exist, iterate over agenda items and add default values
        let participants: any = meet.meetingSchedule;
        let scheduledParticipants = participants?.attendees || [];
        let actualParticipants = meet?.participants || [];

        let attendedCount = scheduledParticipants.filter((scheduled: any) =>
          actualParticipants.some(
            (actual: any) => actual.id?.toString() === scheduled.id?.toString(),
          ),
        ).length;

        let attendancePercentage = scheduledParticipants.length
          ? ((attendedCount / scheduledParticipants.length) * 100).toFixed(2)
          : 'N/A';
        // console.log('attendance percentg', attendancePercentage);
        const owneraccess = meet.createdBy == activeuser.id ? true : false;
        const access = await this.getOwnerForSchedule(
          meet?.meetingSchedule?._id,
          uuid,
          userid,
          query.unitId,
        );
        let roles = [];

        let meetingSchedule: any = meet?.meetingSchedule;

        // Check if the active user is the creator
        if (meet.createdBy.toString() === activeuser.id.toString()) {
          roles.push('Meeting Owner');
        }

        // Check if the active user is a participant
        if (
          meet?.participants?.some(
            (participant: any) =>
              participant?.id?.toString() === activeuser?.id?.toString(),
          )
        ) {
          roles.push('Participant');
        }

        // Check if the active user is an agenda owner
        if (
          meetingSchedule?.keyAgendaId?.some((agenda) =>
            agenda?.owner?.some(
              (owner) => owner?.id?.toString() === activeuser.id,
            ),
          )
        ) {
          roles.push('Agenda Owner');
        }

        const data1: any = {
          _id: meet._id,
          organizationId: meet.organizationId,
          meetingSchedule: meet.meetingSchedule,
          meetingName: meet.meetingName,
          agenda: meet.agenda,
          createdBy: users.find((user) => user.id === meet.createdBy),
          year: meet.year,
          meetingdate: meet.meetingdate,
          minutesofMeeting: meet.minutesofMeeting,
          participants: meet.participants,
          externalparticipants: meet.externalparticipants,
          attachments: meet.attachments,
          access: access || owneraccess,
          status: meet.status,
          actionItem: groupedActionItems,
          roleName: roles,
          meetingType: meetingTypeInfo,
          percentage: attendancePercentage,
        };
        this.logger.debug(`formed result json for ${meet?._id} is ${data1}`);
        res.push(data1);
      }

      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getallmeetings/ successful`,
        'getallMeeting',
      );

      return { res: res, count: count };
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid}GET /api/mrm/getallmeetings failed${error}`,
        'createMeeting',
      );
    }
  }

  async getAllActionPoints(query, uuid) {
    try {
      const skip = (query.page - 1) * query.limit;
      let condition;
      this.logger.debug(`getallActionPoints service started ${query}`);
      if (query.unitId === 'All' || query.unitId === '') {
        condition = {
          organizationId: query.orgId,
          year: query.currentYear ? query.currentYear : moment().year(),
        };
      } else {
        condition = {
          organizationId: query.orgId,
          locationId: query.unitId,
          year: query.currentYear ? query.currentYear : moment().year(),
        };
      }
      this.logger.debug(`framed conditon for querying ${condition}`);
      const result = await this.ActionPointMRMModel.find(condition)
        .populate('meetingId')
        .skip(skip)
        .limit(query.limit)
        .populate('mrmId');
      const count = await this.ActionPointMRMModel.countDocuments(condition);
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getallactionpoints/ successful`,
        'getallactionpoints',
      );
      return { result: result, count: count };
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid}GET /api/mrm/getallactionpoint failed ${error}`,
        'getallactionpoint',
      );
    }
  }
  async deleteMeeting(id, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    try {
      this.logger.debug(`deleteMeeting service started for ${activeUser}`);
      // const auditTrail = await auditTrial(
      //   'meetings',
      //   'MRM',
      //   'Minutes Of Meeting',
      //   user.user,
      //   activeUser,
      //   uuid,
      // );
      // setTimeout(async () => {
      const result = await this.MeetingModel.findByIdAndDelete(id);
      this.logger.log(
        `trace id = ${uuid} deleteMeeting is successfull  ${id} for ${activeUser}`,
        'MRMService',
      );
      return result;
      // }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} delete failed for id=${id} initated by ${activeUser} error=${error}`,
        error,
      );
    }
  }
  async deleteActionPointById(id, uuid) {
    try {
      this.logger.debug(`deleteActionPointById/${id} service started`);
      const result = await this.actionitems.findByIdAndDelete(id);
      this.logger.log(
        `trace id = ${uuid} deleteActionPointByID is successfull  ${id}`,
        'MRMService',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} deleteActionPointById failed for id=${id} error=${error}`,
        'MRMService',
      );
    }
  }
  async getPeriodForMeetingType(id) {
    try {
      // //console.log('id', id);
      this.logger.debug(`getPEriodForMeeting type service started`);
      const periodsData = await this.MRMModel.findOne({
        keyAgendaId: new ObjectId(id),
      }).select('mrmPlanData');

      if (!periodsData) {
        return 'No matching document found for the provided ID';
      }

      const { mrmPlanData } = periodsData;

      const periodArray = [
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

      // //console.log('mrmPlanData', mrmPlanData);

      // Assuming mrmPlanData is an array of true/false values
      const itemPeriods = mrmPlanData
        .map((value, index) => (value ? periodArray[index] : null))
        .filter(Boolean);

      ////console.log('periods months', itemPeriods);
      this.logger.debug(`getPeriodForMeetingType fetched ${itemPeriods}`);
      return itemPeriods;
    } catch (error) {
      this.logger.debug(`getPEriodForMeetingType failed ${error} for ${id}`);
      // console.error('Error in getPeriodForMeetingType:', error);
      return error;
    }
  }
  async getMyMeetings(query, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    try {
      this.logger.debug(
        `getMyMeetings service started for ${activeUser} andquery ${query}`,
      );
      // console.log('query', query);

      // if (query.page !== 1) {
      //   query.page = 1;
      // }
      const skip = (query.page - 1) * query.limit;
      let condition;

      condition = {
        organizationId: query.orgId,
        year: query.currentYear,
        createdBy: activeUser.id,
      };
      this.logger.debug(`frmaed condtion ${condition}`);
      //  //console.log('condition', condition);
      const count = await this.MeetingModel.countDocuments(condition);
      const result = await this.MeetingModel.find(condition)
        .populate('meetingSchedule')
        .skip(skip)
        .limit(query.limit);
      // .sort({ createdAt: -1 });
      // console.log('result', result);
      this.logger.debug(`fetched meetings ${result?.length}`);
      let res = [];
      for (let meet of result) {
        // //console.log('result', meet);
        this.logger.debug(`processing meeting ${meet}`);

        let groupedActionItems = [];

        const agendaItems: any = meet.agenda || [];

        for (const agendaItem of agendaItems) {
          this.logger.debug(`processing agenda ${agendaItem}`);
          // Look for action items associated with this specific agenda and decision combination
          const relatedActionItems = await this.actionitems.find({
            organizationId: activeUser.organizationId,
            source: 'MRM',
            referenceId: meet._id.toString(),
            'additionalInfo.agenda': agendaItem.agenda,
            'additionalInfo.decisionPoint': agendaItem.decision,
          });

          if (relatedActionItems.length > 0) {
            // If action items exist for this agenda, group them
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A', // Use decisionPoint if available
              agenda: agendaItem.agenda || 'No agenda available', // Use agenda name or default
              decision: agendaItem.decision || 'No decision made', // Use decision or default
              status: relatedActionItems.every(
                (action) => action.status === true,
              )
                ? 'Open'
                : relatedActionItems.every((action) => action.status === false)
                ? 'Closed'
                : 'In Progress',
              actionItems: relatedActionItems, // Attach the related action items
            });
          } else {
            // If no action items exist for this agenda, add it with default "Open" status
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: 'Open', // Default status when no action items exist
              actionItems: [], // No action items, so empty array
            });
          }
        }
        this.logger.debug(`grouped action items ${groupedActionItems}`);
        let meetingTypeInfo = {};
        if ((meet.meetingSchedule as any)?.meetingType) {
          meetingTypeInfo = await this.keyAgendaModel
            .findOne({
              _id: (meet.meetingSchedule as any).meetingType, // Assuming meetingType holds the id in meetingSchedule
            })
            .select('name');
        }
        this.logger.debug(`fetched meeting type info ${meetingTypeInfo}`);
        let participants: any = meet.meetingSchedule;
        let scheduledParticipants = participants?.attendees || [];
        let actualParticipants = meet?.participants || [];

        let attendedCount = scheduledParticipants.filter((scheduled: any) =>
          actualParticipants.some(
            (actual: any) => actual.id?.toString() === scheduled.id?.toString(),
          ),
        ).length;

        let attendancePercentage = scheduledParticipants.length
          ? ((attendedCount / scheduledParticipants.length) * 100).toFixed(2)
          : 'N/A';
        const owneraccess = meet.createdBy == activeUser.id ? true : false;
        const access = await this.getOwnerForSchedule(
          meet?.meetingSchedule?._id,
          uuid,
          user,
          query.unitId,
        );
        let roles = [];
        let meetingSchedule: any = meet?.meetingSchedule;
        // Check if the active user is the creator
        if (meet.createdBy?.toString() === activeUser?.id?.toString()) {
          roles.push('Meeting Owner');
        }

        // Check if the active user is a participant
        if (
          meet?.participants?.some(
            (participant: any) =>
              participant?.id?.toString() === activeUser.id.toString(),
          )
        ) {
          roles.push('Participant');
        }

        // Check if the active user is an agenda owner
        if (
          meetingSchedule?.keyAgendaId?.some((agenda) =>
            agenda.owner.some(
              (owner) => owner?.id?.toString() === activeUser.id?.toString(),
            ),
          )
        ) {
          roles.push('Agenda Owner');
        }
        const data1: any = {
          _id: meet._id,
          organizationId: meet.organizationId,
          meetingSchedule: meet.meetingSchedule,
          meetingName: meet.meetingName,
          agenda: meet.agenda,
          createdBy: await this.userService.getUserById(meet.createdBy),
          year: meet.year,
          meetingdate: meet.meetingdate,
          minutesofMeeting: meet.minutesofMeeting,
          participants: meet.participants,
          externalparticipants: meet.externalparticipants,
          access: access || owneraccess,
          status: meet.status,
          actionItem: groupedActionItems,
          roleName: roles,
          meetingType: meetingTypeInfo,
          percentage: attendancePercentage,
        };
        this.logger.debug(`formed data ${data1}`);
        res.push(data1);
      }

      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getallmeetings/ successful`,
        'getallMeeting',
      );
      return { res: res, count: count };
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid}GET /api/mrm/getallmeeting failed ${error}`,
        'createMeeting',
      );
    }
  }
  async getMyActionPoints(query, user, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user,
      },
    });
    try {
      this.logger.debug(
        `getMyActionPoints service started ${query} for ${activeUser}`,
      );
      // console.log('query', query);

      if (query.page !== 1) {
        query.page = 1;
      }
      // //console.log('activeuser', activeUser);
      const skip = (query.page - 1) * query.limit;
      let condition;

      condition = {
        organizationId: query?.orgId,
        year: query?.currentYear ? query?.currentYear : moment().year(),
        source: 'MRM',
      };
      this.logger.debug(`formed condtion fr querying ${condition}`);
      // //console.log('condition', condition);
      // const count = await this.ActionPointMRMModel.countDocuments(condition);
      const result = await this.actionitems
        .find({
          ...condition,
          'owner.id': activeUser.id,
        })

        .skip(skip)
        .sort({ createdAt: -1 })

        .limit(query.limit);
      // console.log('result', result);
      this.logger.debug(`fetched result ${result?.length}`);
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getmyactionpoints/ successful`,
        'getallMeeting',
      );
      return { result: result, count: result?.length };
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid}GET /api/mrm/getmyactionpoints failed for ${activeUser} ${error}`,
        'createMeeting',
      );
    }
  }
  async searchMeetings(query, userid, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid.id,
      },
    });
    try {
      this.logger.debug(
        `searchMeetings service started fr ${activeUser} with ${query}`,
      );

      // console.log('querysearchmeeting', query);
      const page = 1; // Default to page 1 if not provided
      const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided

      // Meeting schedule filtering based on entityId and unitId if they are provided
      let meetingSchedule: any = await this.ScheduleMRMModel.find({
        organizationId: query.orgId,
        currentYear: query.year,
        meetingName: { $regex: query.text, $options: 'i' },
        ...(query.entityId && query.entityId !== 'All' && query.entityId !== ''
          ? { entityId: query.entityId }
          : { entityId: activeUser.entityId }),
        ...(query.unitId && query.unitId !== 'All' && query.unitId !== ''
          ? { unitId: query.unitId }
          : { unitId: activeUser.locationId }),
      }).exec();

      const scheduleIds = meetingSchedule?.map((item) => item?._id);
      this.logger.debug(`fetched meeting schedule ${scheduleIds}`);
      // console.log('schedule ids', scheduleIds);

      // User filtering based on entityId and unitId
      let users: any = await this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: query.orgId },
            {
              OR: [{ username: { contains: query.text, mode: 'insensitive' } }],
            },
            ...(query.entityId &&
            query.entityId !== 'All' &&
            query.entityId !== ''
              ? [{ entityId: query.entityId }]
              : []),
            ...(query.unitId && query.unitId !== 'All' && query.unitId !== ''
              ? [{ locationId: query.unitId }]
              : []),
          ],
        },
      });

      const userIds = users.map((item) => item.id);
      this.logger.debug(`fetched userids ${userIds}`);
      // console.log('userids', userIds);

      // Meeting filtering based on organizationId, year, entityId, unitId, and other conditions
      const meetings = await this.MeetingModel.find({
        $and: [
          { organizationId: query.orgId },
          { year: query.year },
          ...(query.entityId &&
          query.entityId !== 'All' &&
          query.entityId !== ''
            ? [{ entityId: query.entityId }]
            : [{ entityId: activeUser.entityId }]), // Default to activeUser.entityId if query.entityId is not set or is 'All'/''
          ...(query.unitId && query.unitId !== 'All' && query.unitId !== ''
            ? [{ locationId: query.unitId }]
            : [{ locationId: activeUser.locationId }]), // Default to activeUser.locationId if query.unitId is not set or is 'All'/''
          // {
          //   $or: [
          //     { meetingName: { $regex: query.text, $options: 'i' } },
          //     { agenda: { $elemMatch: { $regex: query.text, $options: 'i' } } },
          //     {
          //       decision: { $elemMatch: { $regex: query.text, $options: 'i' } },
          //     },
          //   ],
          // },
        ],
        $or: [
          { meetingSchedule: { $in: scheduleIds } },
          { createdBy: { $in: userIds } },
          { meetingName: { $regex: query.text, $options: 'i' } },
          { agenda: { $elemMatch: { $regex: query.text, $options: 'i' } } },
          {
            decision: { $elemMatch: { $regex: query.text, $options: 'i' } },
          },
        ],
      })
        .populate('meetingSchedule')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
      this.logger.debug(`ferched meetings ${meetings?.length}`);
      let res = [];
      for (let meet of meetings) {
        this.logger.debug(`processing meeting ${meet}`);
        let meetingTypeInfo = {};
        if ((meet.meetingSchedule as any)?.meetingType) {
          meetingTypeInfo = await this.keyAgendaModel
            .findOne({
              _id: (meet.meetingSchedule as any).meetingType, // Assuming meetingType holds the id in meetingSchedule
            })
            .select('name');
        }
        this.logger.debug(`fetched meeting type ${meetingTypeInfo}`);
        let groupedActionItems = [];

        const agendaItems: any = meet.agenda || [];

        for (const agendaItem of agendaItems) {
          this.logger.debug(`processing agenda ${agendaItem}`);
          // Look for action items associated with this specific agenda and decision combination
          const relatedActionItems = await this.actionitems.find({
            organizationId: activeUser.organizationId,
            source: 'MRM',
            referenceId: meet._id.toString(),
            'additionalInfo.agenda': agendaItem.agenda,
            'additionalInfo.decisionPoint': agendaItem.decision,
          });

          if (relatedActionItems.length > 0) {
            // If action items exist for this agenda, group them
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A', // Use decisionPoint if available
              agenda: agendaItem.agenda || 'No agenda available', // Use agenda name or default
              decision: agendaItem.decision || 'No decision made', // Use decision or default
              status: relatedActionItems.every(
                (action) => action.status === true,
              )
                ? 'Open'
                : relatedActionItems.every((action) => action.status === false)
                ? 'Closed'
                : 'In Progress',
              actionItems: relatedActionItems, // Attach the related action items
            });
          } else {
            // If no action items exist for this agenda, add it with default "Open" status
            groupedActionItems.push({
              decisionPoint: agendaItem.decisionPoint || 'N/A',
              agenda: agendaItem.agenda || 'No agenda available',
              decision: agendaItem.decision || 'No decision made',
              status: 'Open', // Default status when no action items exist
              actionItems: [], // No action items, so empty array
            });
          }
        }
        this.logger.debug(`grouped action items ${groupedActionItems}`);
        let participants: any = meet.meetingSchedule;
        let scheduledParticipants = participants?.attendees || [];
        let actualParticipants = meet?.participants || [];

        let attendedCount = scheduledParticipants.filter((scheduled: any) =>
          actualParticipants.some(
            (actual: any) => actual.id?.toString() === scheduled.id?.toString(),
          ),
        ).length;

        let attendancePercentage = scheduledParticipants.length
          ? ((attendedCount / scheduledParticipants.length) * 100).toFixed(2)
          : 'N/A';
        const owneraccess = meet.createdBy == activeUser.id ? true : false;
        const access = await this.getOwnerForSchedule(
          meet?.meetingSchedule._id,
          uuid,
          userid,
          query.unitId,
        );
        let roles = [];
        let meetingSchedule: any = meet?.meetingSchedule;

        if (meet.createdBy.toString() === activeUser.id.toString()) {
          roles.push('Creator');
        }

        if (
          meet?.participants?.some(
            (participant: any) =>
              participant.id.toString() === activeUser.id.toString(),
          )
        ) {
          roles.push('Participant');
        }

        if (
          meetingSchedule.keyAgendaId.some((agenda) =>
            agenda.owner.some(
              (owner) => owner.id.toString() === activeUser.id.toString(),
            ),
          )
        ) {
          roles.push('Agenda Owner');
        }

        const data1: any = {
          _id: meet._id,
          organizationId: meet.organizationId,
          meetingSchedule: meet.meetingSchedule,
          meetingName: meet.meetingName,
          agenda: meet.agenda,
          createdBy: await this.userService.getUserById(meet.createdBy),
          year: meet.year,
          meetingdate: meet.meetingdate,
          minutesofMeeting: meet.minutesofMeeting,
          participants: meet.participants,
          externalparticipants: meet.externalparticipants,
          access: access || owneraccess,
          status: meet.status,
          actionItem: groupedActionItems,
          roleName: roles,
          meetingType: meetingTypeInfo,
          percentage: attendancePercentage,
        };
        this.logger.debug(`framed data json ${data1}`);
        res.push(data1);
      }

      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/searchmeetings/ successful`,
        'searchmeetings',
      );

      return { res: res, count: res.length };
    } catch (err) {
      this.logger.error(
        `GET trace id=${uuid}GET /api/mrm/searchmeeting failed ${err}`,
        'searchMeeting',
      );
      throw new InternalServerErrorException();
    }
  }

  async searchActionPoint(query, userid, uuid) {
    try {
      this.logger.debug(`searchActionpoint service started ${query}`);
      const page = 1; // Default to page 1 if not provided
      const limit = Number(query.limit) || 10; // Default to a limit of 10 if not provided

      // Normalize user-provided target date input (if any) from query.text
      let targetDateFilter = null;

      // Regex to capture dates like MM/DD/YYYY, DD/MM/YYYY, MM-DD-YYYY, DD-MM-YYYY
      const dateRegex = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/;
      const dateMatch = query.text.match(dateRegex);

      if (dateMatch) {
        const month = dateMatch[2].padStart(2, '0'); // Pad month to two digits
        const day = dateMatch[1].padStart(2, '0'); // Pad day to two digits
        const year = dateMatch[3]; // Use the captured year

        // Construct the full date in "YYYY-MM-DD" format
        const fullDate = `${year}-${month}-${day}`;
        targetDateFilter = fullDate;
      }

      let meetingSchedule = await this.ScheduleMRMModel.find({
        organizationId: query.orgId,
        meetingName: { $regex: query.text, $options: 'i' },
      }).exec();

      const scheduleIds = meetingSchedule?.map((item) => item._id);

      // Perform search for meetings
      let meetings = await this.MeetingModel.find({
        organizationId: query.orgId,
        meetingName: { $regex: query.text, $options: 'i' },
      }).exec();

      const meetingIds = meetings.map((item) => item._id);

      // Perform search for users
      let users = await this.prisma.user.findMany({
        where: {
          AND: [
            { organizationId: query.orgId },
            {
              OR: [{ username: { contains: query.text, mode: 'insensitive' } }],
            },
          ],
        },
      });

      const userIds = users.map((item) => item.id);

      // Construct the action point query
      const actionPoints = await this.actionitems
        .find({
          $and: [
            {
              $or: [
                {
                  'additionalInfo.actionPoint': {
                    $regex: query.text,
                    $options: 'i',
                  },
                },
                {
                  'additionalInfo.decisionPoint': {
                    $regex: query.text,
                    $options: 'i',
                  },
                },
                { 'additionalInfo.mrmId': { $in: scheduleIds } },
                { owner: { $elemMatch: { id: { $in: userIds } } } },
                { 'additionalInfo.meetingId': { $in: meetingIds } },
                ...(targetDateFilter ? [{ targetDate: targetDateFilter }] : []),
              ],
            },
            { organizationId: query.orgId },
            { year: query.year },
            ...(query.entityId &&
            query.entityId !== 'All' &&
            query.entityId !== ''
              ? [{ entityId: query.entityId }]
              : []),
            ...(query.locationId &&
            query.locationId !== 'All' &&
            query.locationId !== ''
              ? [{ locationId: query.locationId }]
              : []),
          ],
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Count total documents
      const totalCount = await this.actionitems
        .find({
          $and: [
            {
              $or: [
                {
                  'additionalInfo.actionPoint': {
                    $regex: query.text,
                    $options: 'i',
                  },
                },
                {
                  'additionalInfo.decisionPoint': {
                    $regex: query.text,
                    $options: 'i',
                  },
                },
                { 'additionalInfo.mrmId': { $in: scheduleIds } },
                { owner: { $elemMatch: { id: { $in: userIds } } } },
                { 'additionalInfo.meetingId': { $in: meetingIds } },
                ...(targetDateFilter ? [{ targetDate: targetDateFilter }] : []),
              ],
            },
            { organizationId: query.orgId },
            { year: query.year },
            ...(query.entityId &&
            query.entityId !== 'All' &&
            query.entityId !== ''
              ? [{ entityId: query.entityId }]
              : []),
            ...(query.locationId &&
            query.locationId !== 'All' &&
            query.locationId !== ''
              ? [{ locationId: query.locationId }]
              : []),
          ],
        })
        .countDocuments();
      this.logger.debug(`fetched action points ${actionPoints?.length}`);

      this.logger.log(
        `GET trace id=${uuid} GET /api/mrm/searchActionPoints/ successful`,
        'searchActionPoints',
      );

      return { actionPoints: actionPoints, count: totalCount };
    } catch (err) {
      // Log error in case of failure
      this.logger.error(
        `GET trace id=${uuid} GET /api/mrm/searchActionPoints failed ${err}`,
        'searchActionPoints',
      );
      throw new InternalServerErrorException();
    }
  }

  //   async createCalendarEvent(){
  //     const { ClientCredentialAuthenticationProvider, Client } = require('@microsoft/microsoft-graph-client');

  // const clientId = 'YOUR_CLIENT_ID';
  // const clientSecret = 'YOUR_CLIENT_SECRET';
  // const tenantId = 'YOUR_TENANT_ID';

  // const authProvider = new ClientCredentialAuthenticationProvider({
  //   auth: {
  //     clientId: clientId,
  //     clientSecret: clientSecret,
  //     authority: `https://login.microsoftonline.com/${tenantId}`,
  //   },
  // });

  // const client = Client.initWithMiddleware({
  //   authProvider: authProvider,
  // });
  //     const event = {
  //       subject: 'Meeting with Client',
  //       body: {
  //         content: 'Discuss project details',
  //         contentType: 'Text',
  //       },
  //       start: {
  //         dateTime: '2023-01-01T14:00:00',
  //         timeZone: 'Pacific Standard Time',
  //       },
  //       end: {
  //         dateTime: '2023-01-01T15:00:00',
  //         timeZone: 'Pacific Standard Time',
  //       },
  //       location: {
  //         displayName: 'Client Office',
  //       },
  //     };

  //   }
  async getPendingActionPointsForMeetingType(id, uuid) {
    try {
      //get all schedules for this meeting
      this.logger.debug(
        `getPEndingActionPointsForMeetingType service started ${id}`,
      );
      const schedules = await this.ScheduleMRMModel.find({ meetingType: id });
      this.logger.debug(`fetched schedules ${schedules?.length}`);
      //console.log('schedules', schedules);
      const oid = new ObjectId(id);
      const meetingType = await this.keyAgendaModel
        .findById(oid)
        .select('name');
      this.logger.debug(`fetched meetingType ${meetingType}`);
      // //console.log('meetintype', meetingType.name);
      let open = [];
      for (let schedule of schedules) {
        this.logger.debug(`processing schedule ${schedule}`);
        //  //console.log('scheduleid', schedule);
        const query = {
          $and: [
            { 'additionalInfo.mrmId': schedule._id.toString() },
            { status: true },
          ],
        };
        this.logger.debug(`formed conditon ${query}`);
        // //console.log('Executing Query:', query);

        const actionpoints = await this.actionitems.find(query);
        this.logger.debug(`action points fetched ${actionpoints}`);
        // //console.log('Action Points:', actionpoints);
        open.push(...actionpoints);
      }
      // //console.log('open', open);

      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/getpendingactionpoints/ successful`,
        'searchmeetings',
      );

      return await { open: open, meetingtypename: meetingType?.name };
    } catch (error) {
      this.logger.error(
        `getPEndingActionpointsfor meeting type failed for id=${id}`,
        error?.stack || error?.message,
      );
      throw error;
    }
  }

  async getActionPointsForMeetingType(id, uuid) {
    try {
      //get all schedules for this meeting

      const actionPoints = await this.ActionPointMRMModel.find({
        meetingId: id,
      });
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/geActionPointsForMeetingType/${id} successful`,
        'eActionPointsForMeetingType',
      );

      return actionPoints;
    } catch (error) {
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/geActionPointsForMeetingType/${id} failed`,
        'eActionPointsForMeetingType',
      );
      throw error;
    }
  }
  async uploadAttachments(
    files: (Express.Multer.File & { objectName: string })[],
  ) {
    try {
      // Use files[i].objectName as needed, for example, save it to the database.
      // const savedAttachment = await this.saveAttachmentToDatabase(files[i].objectName, otherData);

      const paths = files.map((file) => getExactPath(file.path));
      return files.map((file, index) => ({
        name: file.originalname,
        path: paths[index],
        objectName: file.objectName,
      }));
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  async uploadAttachment(
    files: Express.Multer.File[],
    user,
    id,
  ): Promise<string[]> {
    // Handle the array of files here, you might want to save them, process them, etc.
    const uploadedFiles: any[] = [];
    for (const file of files) {
      const url = await this.saveFile(file, user, id);
      uploadedFiles.push({
        uid: `-${uploadedFiles.length + 1}`,
        name: file.originalname,
        url: url,
        // Add other properties if needed
      });
    }

    return uploadedFiles;
  }

  private async saveFile(file: Express.Multer.File, user, id): Promise<any> {
    // Return the URL or path where the file is saved

    const location = `${user.location?.locationName}`.toLowerCase();

    return `${process.env.SERVER_IP}/${user?.organization?.realmName}/${location}/${file.filename}`;
  }
  async addDocumentToOS(files, user, randomName, id) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
      include: {
        organization: true,
        location: true,
      },
    });
    const getRealmLicenseCount = await this.licenseModel.findOne({
      organizationId: activeUser?.organization?.id,
    });
    if (
      !!getRealmLicenseCount &&
      getRealmLicenseCount?.addedDocs <= getRealmLicenseCount?.authorizedDocs
    ) {
      if (process.env.IS_OBJECT_STORE === 'true') {
        ////console.log('inside');
        const fs = require('fs');
        const getObjectStoreContents =
          await this.prisma.connectedApps.findFirst({
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
        const uploadedFiles = [];

        for (const file of files) {
          // //console.log('inside files for', file);
          const objectName =
            process.env.OB_ORG_NAME +
            activeUser.location.locationName +
            '/' +
            id +
            '/' +
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
          if (
            ['png', 'jpg', 'jpeg'].includes(file.originalname.split('.').pop())
          ) {
            contentType = 'image/jpeg'; // assuming JPEG content type, you can adjust as needed
          }
          const fileContent = fs.readFileSync(file.path);
          client.putObject({
            namespaceName: process.env.NAMESPACE,
            bucketName: bucketName,
            objectName: objectName,
            putObjectBody: fileContent,
            contentType: contentType,
          });

          uploadedFiles.push({
            uid: `-${uploadedFiles.length + 1}`,
            name: file.originalname,
            url: objectName,
            // Add other properties if needed
          });
        }
        if (files && files.length > 0) {
          await this.licenseModel.findOneAndUpdate(
            { organizationId: activeUser?.organization?.id },
            { $inc: { addedDocs: files.length } }, // Increment by the number of files uploaded
            { new: true },
          );
        }

        return uploadedFiles;
      }
      // this part should be called when object storage is set to false
      else {
        //console.log('not object storage');
        const uploadedFiles = await this.uploadAttachment(
          files,
          activeUser,
          id,
        );
        if (files && files.length > 0) {
          await this.licenseModel.findOneAndUpdate(
            { organizationId: activeUser?.organization?.id },
            { $inc: { addedDocs: files.length } }, // Increment by the number of files uploaded
            { new: true },
          );
        }
        return uploadedFiles;
      }
    } else {
      throw new NotFoundException();
    }
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

  async deleteOBJ(documentLink, uuid) {
    ////console.log('documentlink', documentLink);
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

      const getObjectContent = await client.deleteObject({
        namespaceName: process.env.NAMESPACE,
        bucketName: bucketName,
        objectName: objectName,
      });

      this.logger.log(
        `trace id = ${uuid} Getting Document for Download from Object Storage Sucessful`,
        'document.service.ts',
      );
    } catch {
      this.logger.log(
        `trace id = ${uuid} Getting Document for Download from Object Storage Failed`,
        'document.service.ts',
      );
    }
  }

  async getAgendaDecisionForOwner(id1, id2, userid, uuid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    try {
      this.logger.debug(`getAgendaDecisionForOwner started for ${activeUser}`);
      const result = await this.ScheduleMRMModel.find({ _id: id1 });
      let agendas = [];
      let agendaDecisions = [];
      this.logger.debug(`fetche dmeeting schedule ${result}`);
      // First check if the logged-in user is the owner of this meeting schedule
      if (result[0].organizer === activeUser.id) {
        agendas = result
          ? result[0].keyAgendaId?.map((item: any) => item.agenda)
          : [];
      } else {
        const data1 = result[0].keyAgendaId;

        data1.forEach((item: any) => {
          if (item.owner) {
            for (let user of item.owner) {
              if (user.id === activeUser.id) {
                agendas.push(item.agenda);
              }
            }
          }
        });
      }

      const meeting = await this.MeetingModel.findById(id2);
      const meetingagendas = meeting?.agenda;
      // console.log('meetingagendas', meetingagendas);

      // Iterate over agendas to collect all matching decisions
      for (let agenda of agendas) {
        this.logger.debug(`processing agenda ${agenda}`);
        // Find all matching agendas in the meeting
        let matchingAgendas = meetingagendas.filter(
          (meetingAgenda: any) => meetingAgenda?.agenda === agenda,
        );

        if (matchingAgendas.length > 0) {
          // Collect all decisions for the matching agenda
          let decisions = matchingAgendas.map((meetingAgenda: any) => ({
            decision: meetingAgenda.decision,
            id: meetingAgenda.id,
          }));

          agendaDecisions.push({
            agenda: agenda,
            decisions: decisions,
          });
        }
      }

      this.logger.log(
        `GET trace id=${uuid} GET /api/mrm/getagendadecision/ successful`,
        'createMeeting',
      );
      this.logger.debug(`fetched agenda decisons ${agendaDecisions}`);
      // console.log('agendaDecisions', agendaDecisions);
      return agendaDecisions;
    } catch (error) {
      this.logger.error(`${uuid}/api/mrm/getagendadecision failed ${error} `);
      return error;
    }
  }

  async getColumnFilterList(user, randomNumber, query) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    try {
      this.logger.debug(
        `getColumnFilterlist service started for ${activeUser}`,
      );
      // console.log('query', query);
      const scheduleData = await this.ScheduleMRMModel.find({
        organizationId: activeUser.organizationId,
        ...(query.unitId && query.unitId !== 'All'
          ? { unitId: query.unitId }
          : {}),
        ...(query.entityId && query.entityId !== 'All'
          ? { entityId: query.entityId }
          : {}),
        ...(query.unitId === 'All' && !query.entityId
          ? { unitId: activeUser.locationId }
          : {}),
        ...(query.entityId === 'All' && !query.unitId
          ? { entityId: activeUser.entityId }
          : {}),
      }).select('organizer meetingType');
      this.logger.debug(`fetched scheudleData ,${scheduleData?.length}`);
      // console.log('scheduledata', scheduleData);

      const organizerIds = scheduleData.map((item) => item.organizer);
      const meetingTypeIds = scheduleData.map((item) => item.meetingType);
      // console.log('meetingtyoeids', meetingTypeIds);

      const usernames = await this.prisma.user.findMany({
        where: {
          id: {
            in: organizerIds,
          },
        },
        orderBy: {
          username: 'asc',
        },
      });

      // Convert string IDs to ObjectId
      const objectIds = meetingTypeIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      const meetingTypes = await this.keyAgendaModel
        .find({
          _id: { $in: objectIds }, // Correctly use $in for the query
        })
        .select('name');

      // Map _id to id and select only name
      const mappedMeetingTypes = meetingTypes.map((meetingType) => ({
        id: meetingType._id.toString(), // Convert ObjectId to string
        name: meetingType.name,
      }));
      this.logger.debug(`mapped meetingtypes ${meetingTypes}`);
      // console.log('meetingtyep', meetingTypes);

      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForSchedule successful`,
        'MRM-Controller',
      );
      return { usernames: usernames, meetingTypes: mappedMeetingTypes };
    } catch (err) {
      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForSchedule failed`,
        'MRM-Controller',
      );
    }
  }
  async getMomColumnFilterList(user, query, randomNumber) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    try {
      this.logger.debug(
        `getMomColumnFilterList service started for ${activeUser} with ${query}`,
      );
      // console.log('query', query);
      const meetingData = await this.MeetingModel.find({
        organizationId: activeUser.organizationId,
        ...(query.unitId && query.unitId !== 'All'
          ? { locationId: query.unitId }
          : {}),
        ...(query.entityId && query.entityId !== 'All'
          ? { entityId: query.entityId }
          : {}),
        ...(query.unitId === 'All' && !query.entityId
          ? { locationId: activeUser.locationId }
          : {}),
        ...(query.entityId === 'All' && !query.unitId
          ? { entityId: activeUser.entityId }
          : {}),
      }).select('createdBy meetingType');
      this.logger.debug(`meetingData fetched ${meetingData?.length}`);
      // console.log('scheduleData', meetingData);
      const organizerIds = meetingData.map((item) => item.createdBy);
      const meetingTypeIds = meetingData.map((item) => item?.meetingType);
      // console.log('organizerids', organizerIds);
      const objectIds = meetingTypeIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      const meetingTypes = await this.keyAgendaModel
        .find({
          _id: { $in: objectIds }, // Correctly use $in for the query
        })
        .select('name');

      // Map _id to id and select only name
      const mappedMeetingTypes = meetingTypes.map((meetingType) => ({
        id: meetingType._id.toString(), // Convert ObjectId to string
        name: meetingType.name,
      }));
      const usernames = await this.prisma.user.findMany({
        where: {
          id: {
            in: organizerIds,
          },
        },
        orderBy: {
          username: 'asc',
        },
      });
      this.logger.log(
        `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForMeeting successful`,
        'MRM-Controller',
      );
      this.logger.debug(
        `fetched ${usernames},meetingtypes=${mappedMeetingTypes}`,
      );
      // console.log('usernames', usernames, mappedMeetingTypes);
      return { usernames: usernames, meetingTypes: mappedMeetingTypes };
    } catch (err) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/mrm/getColumnFilterListForMeeting failed ${err}`,
        'MRM-Controller',
      );
    }
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
    const { code, state, error, mrmId } = urlData;
    if (mrmId) {
      const accessToken = await this.getAccessTokenMsCal(code);
      const scheduleData = await this.getScheduleById(mrmId, user, 12);

      for (let schedule of scheduleData.value.date) {
        const date = schedule.date;
        const fromTime = schedule.from;
        const toTime = schedule.to;

        const [fromHours, fromMinutes] = fromTime.split(':').map(Number);
        const [toHours, toMinutes] = toTime.split(':').map(Number);

        const dateFromTime = new Date(date);
        dateFromTime.setHours(fromHours);
        dateFromTime.setMinutes(fromMinutes);
        dateFromTime.setSeconds(0);

        const dateToTime = new Date(date);
        dateToTime.setHours(toHours);
        dateToTime.setMinutes(toMinutes);
        dateToTime.setSeconds(0);

        // Format the date in the desired format
        const formattedFromDateTime = dateFromTime.toISOString().slice(0, 19);
        const formattedToDateTime = dateToTime.toISOString().slice(0, 19);
        const transformedAttendees = scheduleData.value.attendees.map(
          (attendee) => ({
            emailAddress: {
              address: attendee.email,
              name: attendee.fullname,
            },
            type: 'required',
          }),
        );

        const eventData = {
          subject: scheduleData.value.meetingName,
          start: {
            dateTime: formattedFromDateTime,
            timeZone: 'UTC',
          },
          end: {
            dateTime: formattedToDateTime,
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
  async getUsersForLocations(userid, query, randomNumber) {
    try {
      let whereCondition: any = { organizationId: query.orgId, deleted: false };
      // console.log('query.location', query.location);
      if (query.location !== 'All') {
        const locations = query.location ? query.location.split(',') : [];

        whereCondition = {
          locationId: { in: locations },
        };
      }
      this.logger.debug(
        `getUsersForLocations ervice started ${query} conditon=${whereCondition}`,
      );
      const users = await this.prisma.user.findMany({
        where: {
          ...whereCondition,
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });
      // console.log('users', users);
      this.logger.log(
        `trace id=${uuid()}, GET '/mrm/getUserForLocations ${
          query.location
        }  success`,
        '',
      );

      return users;
    } catch (error) {
      this.logger.error(
        `trace id=${uuid()}, GET /mrm/getUserForLocations payload ${
          query.location
        }  failed with error ${error} `,
      );
      throw new InternalServerErrorException();
    }
  }
  async getLocationforOrg(realmName: string, user: any) {
    try {
      const organization = await this.prisma.organization.findFirst({
        where: { realmName },
      });

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user?.id },
        include: {
          entity: true,
          location: true,
          organization: true,
        },
      });

      if (!activeUser) throw new NotFoundException('Active user not found');

      const userRoles = user.kcRoles?.roles ?? [];

      // Non-global users
      if (activeUser.userType !== 'globalRoles') {
        // ORG-ADMIN has the highest precedence
        if (userRoles.includes('ORG-ADMIN')) {
          if (!organization)
            throw new NotFoundException('Organization not found');

          const locations = await this.prisma.location.findMany({
            where: {
              organizationId: organization.id,
              deleted: false,
              type: 'Unit',
            },
            select: {
              id: true,
              locationId: true,
              locationName: true,
            },
            orderBy: { locationName: 'asc' },
          });

          return locations;
        }

        // MR role only if not ORG-ADMIN
        if (userRoles.includes('MR')) {
          const locationIds = [
            ...(activeUser.locationId ? [activeUser.locationId] : []),
            ...(activeUser?.entity?.locationId
              ? [activeUser.entity.locationId]
              : []),
            ...(Array.isArray(activeUser.additionalUnits)
              ? activeUser.additionalUnits
              : []),
          ];

          const uniqueLocIds = [...new Set(locationIds)];

          const locations = await this.prisma.location.findMany({
            where: {
              id: { in: uniqueLocIds },
              deleted: false,
              type: 'Unit',
            },
            orderBy: { locationName: 'asc' },
          });

          return locations;
        }

        // Other non-global roles
        const locId = activeUser?.locationId ?? activeUser.entity?.locationId;

        if (!locId) throw new NotFoundException('No location found for user');

        const location = await this.prisma.location.findFirst({
          where: {
            id: locId,
            deleted: false,
          },
        });

        if (!location) throw new NotFoundException('Location not found');

        return [location];
      }

      // For globalRoles userType
      const additionalUnits = activeUser.additionalUnits;

      let locations;

      if (Array.isArray(additionalUnits) && additionalUnits.includes('All')) {
        locations = await this.prisma.location.findMany({
          where: {
            organizationId: activeUser.organizationId,
            deleted: false,
            type: 'Unit',
          },
          orderBy: { locationName: 'asc' },
        });
      } else {
        locations = await this.prisma.location.findMany({
          where: {
            id: {
              in: Array.isArray(additionalUnits) ? additionalUnits : [],
            },
            deleted: false,
            type: 'Unit',
          },
          orderBy: { locationName: 'asc' },
        });
      }

      return locations;
    } catch (error) {
      // Add proper error logging here if needed
      throw error;
    }
  }

  async sendMailToParticipants(
    owner,
    meetingSchedule,
    attendeesEmails,
    mailService,
  ) {
    const dates = meetingSchedule?.date;

    const formattedDates = dates?.map((dateObj: any) => {
      const { date, from, to } = dateObj;
      const formattedDate = date ? moment(date).format('DD/MM/YYYY') : '';
      const formattedFrom = from ? from : '';
      const formattedTo = to ? to : '';
      return `Date: ${formattedDate} From: ${formattedFrom} - To: ${formattedTo}`;
    });

    let agendaOwnerMappings;
    if (meetingSchedule.keyAgendaId?.length > 0) {
      agendaOwnerMappings = meetingSchedule.keyAgendaId.map((agendaItem) => {
        const agenda = agendaItem.agenda;
        let owners;
        if (agendaItem?.owner?.length > 0) {
          owners = agendaItem?.owner?.map((owner) => {
            return `${owner.fullname} (${owner.email})`;
          });
          const ownersString = owners.join(', ');
          return `${agenda} - <strong>Agenda Owner</strong>: ${ownersString}`;
        }
      });
    }

    // Generate the ICS content for the meeting
    const icsContent = await this.generateICS(meetingSchedule, owner, owner);
    const cleanDescription = meetingSchedule?.description?.replace(
      /<[^>]*>/g,
      '',
    );
    const participantsList =
      meetingSchedule?.attendees
        ?.map((participant, index) => `<li>${participant?.fullname} </li>`)
        .join('') || '';
    const emailMessageIP = `
      <html>
        <body>
          <p>Dear User,</p>
          <p><strong>${
            meetingSchedule?.meetingName
          }</strong> has been scheduled on <strong>${formattedDates?.join(
      '<br>',
    )}</strong> by <strong>${owner?.firstname}</strong> at <strong>${
      meetingSchedule?.venue
    }</strong>.</p>
          <p><strong>Agenda:</strong></p>
          <ol>
            ${agendaOwnerMappings?.map((item) => `<li>${item}</li>`).join('')}
          </ol>
          <p><strong>Meeting Description:</strong></p>
          <p style="font-style: italic; color: #555;">${cleanDescription}</p>
                  <p><strong>Participants:</strong></p>
        <ol>
          ${participantsList}
        </ol>
          <p>Here is the link for more details: <a href="${
            process.env.PROTOCOL
          }://${
      process.env.REDIRECT
    }/mrm/mrm" target="_blank">Click here</a></p>
        </body>
      </html>
    `;
    this.logger.debug(`email content ${emailMessageIP}`);
    // Prepare attachments array (including ICS content)
    const attachments = [
      {
        filename: 'meeting.ics',
        content: Buffer.from(icsContent).toString('base64'), // Ensure ICS content is base64 encoded
        encoding: 'base64',
        contentType: 'text/calendar',
      },
    ];

    // Fetch and handle additional attachments if any
    if (meetingSchedule.files && meetingSchedule.files.length > 0) {
      for (const attachment of meetingSchedule.files) {
        if (attachment?.url) {
          // Fetch the file from object storage or URL based on the environment
          try {
            const fileContent = await this.fetchFileContent(attachment?.url);

            // Ensure that the file content is properly base64-encoded
            attachments.push({
              filename: attachment?.name || 'attachment.pdf',
              content: fileContent, // fileContent is already base64-encoded
              encoding: 'base64',
              contentType: attachment?.contentType || 'application/pdf',
            });
          } catch (error) {
            console.error('Error fetching file from storage or URL:', error);
          }
        } else if (attachment?.content) {
          // If content is directly provided, attach it as is
          attachments.push({
            filename: attachment?.name || 'attachment.pdf',
            content: attachment?.content,
            encoding: 'base64', // Ensure content is base64-encoded
            contentType: attachment?.contentType || 'application/pdf',
          });
        }
      }
    }
    this.logger.debug(`attachments ${attachments}`);
    const msg: any = {
      to: owner.email,
      cc: [...new Set(attendeesEmails)],
      from: process.env.FROM,
      subject: `${meetingSchedule?.meetingName} Meeting has been scheduled`,
      html: `<div>${emailMessageIP}</div>`,
      attachments: attachments,
    };

    // Ensure there are no duplicates between `to` and `cc`
    const toEmails = new Set([owner.email, ...msg.cc]);
    const uniqueEmails = Array.from(toEmails);
    msg.to = uniqueEmails[0]; // `to` should only have one email
    msg.cc = uniqueEmails.slice(1);

    try {
      if (process.env.MAIL_SYSTEM === 'IP_BASED') {
        const result = await this.emailService.sendEmailwithICSandFiles(
          uniqueEmails[0],
          uniqueEmails.slice(1),
          `${meetingSchedule?.meetingName} Meeting has been scheduled`,
          'This is the plain text version of the email',
          emailMessageIP,
          attachments.map((attachment) => ({
            filename: attachment.filename,
            content: attachment.content,
            encoding: attachment.encoding,
            contentType: attachment.contentType,
          })),
        );
      } else {
        try {
          const finalResult = await sgMail.send(msg);
          console.log('Sent mail');
        } catch (error) {
          console.error('Error sending email:', error);
          throw error;
        }
      }
    } catch (error) {
      if (error.response && error.response.body && error.response.body.errors) {
        console.error('SendGrid Error:', error.response.body.errors);
      } else {
        console.error('An error occurred:', error.message);
      }
    }
  }

  async fetchFileContent(url) {
    if (process.env.IS_OBJECT_STORE === 'true') {
      // console.log('inside if', url);
      // Fetch from object store
      const fileResponse = await this.getDocumentOBJ(url, '1234');
      const buffer = fileResponse;
      return buffer.toString('base64');
    } else {
      // Fetch from URL
      // console.log('inside else');
      const fileResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(fileResponse.data).toString('base64');
    }
  }

  async generateICS(meetingSchedule, owner, activeUser) {
    const { meetingName, venue, date } = meetingSchedule;

    // Generate VEVENT entries for each date
    const events = date
      .map((dateObj, index) => {
        const { date, from, to } = dateObj;

        // Format start and end times with timezone
        const start = moment
          .tz(`${date} ${from}`, 'Asia/Kolkata')
          .format('YYYYMMDDTHHmmss');
        const end = moment
          .tz(`${date} ${to}`, 'Asia/Kolkata')
          .format('YYYYMMDDTHHmmss');

        return [
          'BEGIN:VEVENT',
          `SUMMARY:${meetingName}`,
          `LOCATION:${venue}`,
          `DESCRIPTION:Meeting organized by ${activeUser.firstname}`,
          `UID:${owner.email}-${start}-${index}`,
          `DTSTART;TZID=Asia/Kolkata:${start}`,
          `DTEND;TZID=Asia/Kolkata:${end}`,
          'END:VEVENT',
        ].join('\r\n');
      })
      .join('\r\n');

    // Create the full calendar file with timezone info
    const calendarLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Your Organization//NONSGML v1.0//EN',
      'BEGIN:VTIMEZONE',
      'TZID:Asia/Kolkata',
      'BEGIN:STANDARD',
      'TZOFFSETFROM:+0530',
      'TZOFFSETTO:+0530',
      'TZNAME:IST',
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE',
      events, // Include all events
      'END:VCALENDAR',
    ];

    return calendarLines.join('\r\n');
  }
  async uniqueActionPoint(query) {
    try {
      // console.log('query', query);
      this.logger.debug(`uniqueActionPoint sevice started ${query}`);
      const actionItems = query.referenceid
        ? await this.actionitems.aggregate([
            {
              $match: {
                source: 'MRM',
                referenceId: query.referenceid,
                'additionalInfo.agenda': query.agenda,
                'additionalInfo.decisionPoint': query.decision,
              },
            },
          ])
        : [];
      this.logger.debug(`fetched action points ${actionItems}`);
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/uniqueactionpoints/${query} successful`,
        '',
      );
      // console.log('actionitems', actionItems);
      return actionItems;
    } catch (error) {
      this.logger.error(
        `GET trace id=${uuid}GET /api/mrm/uniqueactionpoints/${query} failed`,
        '',
      );
    }
  }
  async handleMailForActionItems(id, userid) {
    const currentUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
      select: {
        firstname: true,
        lastname: true,
        email: true,
      },
    });
    try {
      this.logger.debug(
        `mailing for action items started for ${currentUser} and id=${id}`,
      );
      const actionItemDetails = await this.actionitems.findById(id);
      // console.log('actionItemDetials', actionItemDetails);
      const meetingDetails = await this.MeetingModel.findById(
        actionItemDetails.referenceId,
      ).select('meetingName meetingDate participants');
      this.logger.debug(`fetched meetingdetails ${meetingDetails}`);
      let date = moment(meetingDetails?.meetingdate ?? new Date());
      let dateComponent = date.format('DD-MM-YYYY');

      const attendees: any = [
        ...new Set(
          [
            ...(meetingDetails.participants?.map(
              (attendee: any) => attendee.email,
            ) || []),
            currentUser?.email,
            ...(actionItemDetails?.owner?.map((owner: any) => owner.email) ||
              []),
          ]
            .filter(Boolean)
            .filter((email, index, self) => self.indexOf(email) === index),
        ),
      ];
      let actionFiles: any = actionItemDetails?.additionalInfo;
      const emailMessageIP = `
      <html>
        <body>
          <p>Dear User,</p>
          
          <p>It is to inform you that the action item titled <strong>"${
            actionItemDetails?.title
          }"</strong> has been initiated by <strong>${currentUser?.firstname} ${
        currentUser?.lastname
      }</strong>. This action item was created in relation to the agenda <strong>"${
        actionFiles?.agenda
      }"</strong> and the decision point <strong>"${
        actionFiles?.decisionPoint
      }"</strong> from the meeting, <strong>${
        actionFiles?.meetingName
      }</strong> conducted on <strong>${dateComponent}</strong>.</p>
        
          <p>The following individual(s) are responsible for completing this action item:</p>
          <ul>
            ${actionItemDetails?.owner
              ?.map((person: any) => {
                return `<li><strong>${person?.fullname}</strong></li>`;
              })
              .join('')}
          </ul>
          
          <p>The target date for completion of this action item is <strong>${
            actionItemDetails?.targetDate
          }</strong>.</p>
          
          <p>To view further details about this action item, please click on the following link:</p>
          <p><a href="${process.env.PROTOCOL}://${
        process.env.REDIRECT
      }/mrm/mrm">Click here to view details</a></p>
        
          <p>Best regards,<br>${currentUser?.firstname} ${
        currentUser?.lastname
      }</p>
        </body>
      </html>
    `;
      const emailMessageIPClosed = `
    <html>
      <body>
        <p>Dear User,</p>
        
        <p>It is to inform you that the action item titled <strong>"${actionItemDetails?.title}"</strong> has been closed by <strong>${currentUser?.firstname} ${currentUser?.lastname}</strong>. This action item was created in relation to the agenda <strong>"${actionFiles?.agenda}"</strong> and the decision point <strong>"${actionFiles?.decisionPoint}"</strong> from the meeting, <strong>${actionFiles?.meetingName}</strong> conducted on <strong>${dateComponent}</strong>.</p>
            <p>The target date for completion of this action item is ${actionItemDetails?.targetDate} and this was closed by <strong>${currentUser?.firstname} ${currentUser?.lastname} today</p>
        
        <p>To view further details about this action item, please click on the following link:</p>
        <p><a href="${process.env.PROTOCOL}://${process.env.REDIRECT}/mrm/mrm">Click here to view details</a></p>
      
    
      </body>
    </html>
  `;
      let emailMessage =
        actionItemDetails?.status === true
          ? emailMessageIP
          : emailMessageIPClosed;
      let subjectOpened = `Action ${actionItemDetails?.title} has been initiated for ${meetingDetails?.meetingName}`;
      let subjectClosed = `Action ${actionItemDetails?.title} has been closed for ${meetingDetails?.meetingName}`;
      let subject =
        actionItemDetails?.status === true ? subjectOpened : subjectClosed;
      const msg = {
        to: attendees[0],
        cc: attendees,
        from: process.env.FROM,
        subject: subject,
        html: `<div>${emailMessage}</div>`,

        attachments: [],
        // Directly use the passed ccList
      };
      const toEmails = new Set([currentUser.email, ...msg.cc]);
      const uniqueEmails = Array.from(toEmails);
      msg.to = uniqueEmails[0]; // `to` should only have one email
      msg.cc = uniqueEmails.slice(1);
      // Add attachments to the email (if any)
      let attachments = [];

      if (actionFiles?.files && actionFiles?.files?.length > 0) {
        for (const attachment of actionFiles?.files) {
          if (attachment?.url) {
            // Fetch the file from object storage or URL based on the environment
            try {
              const fileContent = await this.fetchFileContent(attachment?.url);

              // Ensure that the file content is properly base64-encoded
              attachments.push({
                filename: attachment?.name || 'attachment.pdf',
                content: fileContent, // fileContent is already base64-encoded
                encoding: 'base64',
                contentType: attachment?.contentType || 'application/pdf',
              });
            } catch (error) {
              console.error('Error fetching file from storage or URL:', error);
            }
          } else if (attachment?.content) {
            // If content is directly provided, attach it as is
            attachments.push({
              filename: attachment?.name || 'attachment.pdf',
              content: attachment?.content,
              encoding: 'base64', // Ensure content is base64-encoded
              contentType: attachment?.contentType || 'application/pdf',
            });
          }
        }
      }
      msg.attachments = attachments;
      this.logger.debug(`framed msg ${msg}, emails=${uniqueEmails}`);
      // console.log('msg', msg);
      // Sending email via IP-based system or SendGrid
      try {
        if (process.env.MAIL_SYSTEM === 'IP_BASED') {
          await this.emailService.sendEmailMRM(
            uniqueEmails[0],
            uniqueEmails.slice(1),
            `Action ${actionItemDetails?.title} has been initiated for ${meetingDetails?.meetingName}`,
            '',
            emailMessageIP,
            attachments,
          );
          // console.log('Mail sent via IP-based system');
        } else {
          await sgMail.send(msg);
          // console.log('Email sent via SendGrid');
        }
      } catch (error) {
        console.error('Error sending email:', error);
      }
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/handleMailForActionItems/${id} successful`,
        '',
      );
    } catch (error) {
      this.logger.log(
        `GET trace id=${uuid}GET /api/mrm/handleMailForActionItems/${id} failed ${error}`,
        '',
      );
    }
  }
}
