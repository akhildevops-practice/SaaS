import {
  Controller,
  Inject,
  Injectable,
  Logger,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, now, Types } from 'mongoose';
import { EmailService } from 'src/email/email.service';
import { MeetingType } from 'src/key-agenda/schema/meetingType.schema';
import { Agenda } from 'src/mrm/schema/agenda.schema';
import { Meeting } from 'src/mrm/schema/meeting.schema';
import { ScheduleMRM } from 'src/mrm/schema/scheduleMrm.schema';
import { PrismaService } from 'src/prisma.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { ActionItems } from './schema/actionitems.schema';
import { CIP } from 'src/cip/schema/cip.schema';
import { sendMailForComplete } from '../cip/utils';

@Injectable()
@Controller('/api/actionitem')
export class ActionitemsService {
  constructor(
    @InjectModel(ActionItems.name) private actionitems: Model<ActionItems>,
    @InjectModel(MeetingType.name) private keyAgendaModel: Model<MeetingType>,
    @InjectModel(ScheduleMRM.name) private ScheduleMRMModel: Model<ScheduleMRM>,
    // @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(Agenda.name) private AgendaModel: Model<Agenda>,
    @InjectModel(Meeting.name) private MeetingModel: Model<Meeting>,
    @InjectModel(CIP.name) private CIPModel: Model<CIP>,
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
    private readonly emailService: EmailService,
  ) {}

  async createActionItem(data, user, uuid) {
    try {
      // //console.log('data in post', data);
      const result = await this.actionitems.create(data);

      if (result.source === 'CIP') {
        await this.updateCIPStatus(result.referenceId, uuid);
      }

      this.logger.log(
        `traceid=${uuid} POST /api/actionitem/createActionItem successful for payload ${data}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} POST /api/actionitem/createActionItem failed for payload ${data} `,
      );
    }
  }

  async updateActionItem(data, id, user, uuid) {
    try {
      // //console.log('data in patch', data, id);
      // const oid = new Types.ObjectId(id);
      const result = await this.actionitems.findByIdAndUpdate(id, data);

      if (result.source === 'CIP') {
        await this.updateCIPStatus(result.referenceId, uuid);
      }

      this.logger.log(
        `traceid=${uuid} PATCH /api/actionitem/updateActionItem/${id} successful for payload ${data}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} PATCH /api/actionitem/updateActionItem/${id} failed for payload ${data} `,
      );
    }
  }
  async getActionItem(id, uuid) {
    try {
      // //console.log('data in get', id);
      const result = await this.actionitems.findById(id);

      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getActionItem/${id} successful`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} GET /api/actionitem/getActionItem/${id}failed `,
      );
    }
  }
  async getActionItemForReference(id, uuid) {
    try {
      // //console.log('data in get', id);
      const result = await this.actionitems.find({
        referenceId: id,

        deleted: false,
      });

      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getActionItemForReference/${id} successful`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} GET /api/actionitem/getActionItemForReference/${id}failed `,
      );
    }
  }
  async deleteActionItem(id, uuid) {
    try {
      // //console.log('data in get', id);
      const data: any = {
        deleted: true,
        deletedAt: now(),
      };
      const result = await this.actionitems.findByIdAndDelete(id);

      this.logger.log(
        `traceid=${uuid} DELETE /api/actionitem/deleteActionItem/${id} successful`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} DELETE /api/actionitem/deleteActionItem/${id}failed `,
      );
    }
  }
  async getActionItemById(id, uuid) {
    try {
      // //console.log('data in get', id);

      const result = await this.actionitems.findById(id);

      this.logger.log(
        `traceid=${uuid} DELETE /api/actionitem/getActionItem/${id} successful`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} DELETE /api/actionitem/getActionItem/${id}failed `,
      );
    }
  }
  async getAllActionItemsForSource(query, uuid) {
    try {
      // console.log('data in get', typeof query.selectedMeetingType);
      let result1 = query.source.replace(/^"|"$/g, '');
      if (!!query.selectedOwner) {
        query.page = 1;
      }
      const skip = (query.page - 1) * query.limit;
      let result2 = [],
        result = [],
        condition;

      if (query.unitId === 'All' || query.unitId === '') {
        condition = {
          organizationId: query.orgId,
          year: query.currentYear,
          source: query.source,
          deleted: false,
          // locationId:query.locationId
        };
      } else {
        if (query?.entityId === 'All' || query.entityId === '') {
          condition = {
            organizationId: query.orgId,
            year: query.currentYear,
            locationId: query.unitId,
            source: query.source,
            deleted: false,
          };
        } else {
          condition = {
            organizationId: query.orgId,
            year: query.currentYear,
            locationId: query.unitId,
            entityId: query.entityId,
            source: query.source,
            deleted: false,
          };
        }
      }

      if (
        typeof query.selectedOwner === 'string' &&
        query.selectedOwner !== undefined &&
        query.selectedOwner !== ''
      ) {
        const selectedOwnersArray = query.selectedOwner
          .split(',')
          .map((id) => id.trim());
        condition['owner.id'] = { $in: selectedOwnersArray };
      }
      result2 = await this.actionitems
        .find({
          $and: [condition],
        })
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(query.limit);
      // //console.log('actionpoints', result2);

      const count = await this.actionitems.countDocuments(condition);
      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getActionItemForSource/${query} successful`,
      );
      return { result: result2, count: count };

      // return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} DELETE /api/actionitem/getActionItemForSource/${query} failed `,
      );
    }
  }
  //modify the above api to work for meetingtype column filter for MRM above is generic
  async getAllActionItemsForSourceMRM(query, uuid) {
    try {
      let result1 = query.source.replace(/^"|"$/g, '');
      if (!!query.selectedOwner) {
        query.page = 1;
      }

      const skip = (query.page - 1) * query.limit;
      let result2 = [],
        result = [],
        condition;

      // Construct the condition based on unitId, entityId, and other query parameters
      if (query.unitId === 'All' || query.unitId === '') {
        condition = {
          organizationId: query.orgId,
          year: query.currentYear,
          source: query.source,
          deleted: false,
        };
      } else {
        if (query?.entityId === 'All' || query.entityId === '') {
          condition = {
            organizationId: query.orgId,
            year: query.currentYear,
            locationId: query.unitId,
            source: query.source,
            deleted: false,
          };
        } else {
          condition = {
            organizationId: query.orgId,
            year: query.currentYear,
            locationId: query.unitId,
            entityId: query.entityId,
            source: query.source,
            deleted: false,
          };
        }
      }

      // Apply selectedOwner filter if provided
      if (
        typeof query.selectedOwner === 'string' &&
        query.selectedOwner !== undefined &&
        query.selectedOwner !== ''
      ) {
        const selectedOwnersArray = query.selectedOwner
          .split(',')
          .map((id) => id.trim());
        condition['owner.id'] = { $in: selectedOwnersArray };
      }

      // Apply selectedMeetingType filter if provided and it's an array
      if (
        typeof query.selectedMeetingType === 'string' &&
        query.selectedMeetingType !== undefined &&
        query.selectedMeetingType !== ''
      ) {
        const selectedMeetingTypeArray = query.selectedMeetingType
          .split(',')
          .map((id) => id.trim());
        condition['additionalInfo.meetingTypeId'] = {
          $in: selectedMeetingTypeArray,
        };
      }

      result2 = await this.actionitems
        .find(condition)
        .skip(skip)
        .sort({ createdAt: -1 })
        .limit(query.limit);

      const count = await this.actionitems.countDocuments(condition);

      // Log the successful request
      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getActionItemForSourceMMR/${JSON.stringify(
          query,
        )} successful`,
      );

      return { result: result2, count: count };
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} GET /api/actionitem/getActionItemForSourceMRM/${JSON.stringify(
          query,
        )} failed `,
      );
      // Optionally, you could return an error response or throw the error
      throw new Error('Failed to retrieve action items for MRM source');
    }
  }

  async getAllActionItemsForOwner(id, uuid, userid) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid.id,
        },
        include: {
          organization: true,
        },
      });
      const result = await this.actionitems
        .find({
          'owner.id': activeUser.id,
          organizationId: activeUser.organizationId,
          status: true,
        })
        .sort({ createdAt: -1 });
      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getActionItemForOwner/${id} successful`,
      );
      ////console.log('result', result);
      return result;

      // return result;
    } catch (error) {
      this.logger.error(
        `traceid=${uuid} GET /api/actionitem/getActionItemForOwner/${id} failed `,
      );
    }
  }

  async updateCIPStatus(id, randomNumber) {
    try {
      this.logger.log(
        `traceid=${randomNumber} GET /api/actionitem/updateCIPStatus/${id}`,
      );
      const getCIPActionItem = await this.actionitems.find({
        source: 'CIP',
        referenceId: id,
      });

      const actionItemStatus = getCIPActionItem.map((item) => item.status);

      const checkActionItemStatus = actionItemStatus.every(
        (item) => item === false,
      );

      const getCip = await this.CIPModel.findById(id);

      if (checkActionItemStatus && getCip.status === 'InProgress') {
        await this.CIPModel.findByIdAndUpdate(id, {
          status: 'Complete',
          actualEndDate: new Date(),
        });
        const getCIP = await this.CIPModel.findById({
          _id: id,
        });

        await sendMailForComplete(
          getCIP.createdBy,
          getCIP.createdBy,
          getCIP,
          this.emailService.sendEmail,
        );
        for (let users of getCIP.approvers) {
          await sendMailForComplete(
            getCIP.createdBy,
            users,
            getCIP,
            this.emailService.sendEmail,
          );
        }
        for (let users of getCIP.reviewers) {
          await sendMailForComplete(
            getCIP.createdBy,
            users,
            getCIP,
            this.emailService.sendEmail,
          );
        }
        if (getCIP.projectMembers) {
          for (let users of getCIP.projectMembers) {
            await sendMailForComplete(
              getCIP.createdBy,
              users,
              getCIP,
              this.emailService.sendEmail,
            );
          }
        }
      }

      this.logger.log(
        `traceid=${randomNumber} GET /api/actionitem/updateCIPStatus/${id} successful`,
      );
    } catch (error) {
      this.logger.error(
        `traceid=${randomNumber} GET /api/actionitem/updateCIPStatus/${id} failed `,
      );
    }
  }

  async getFilterListForMRM(uuid, randomNumber, query) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: uuid,
        },
        include: {
          organization: true,
        },
      });

      const actionItemConditions: any = {
        source: 'MRM',
        organizationId: activeUser.organizationId,
      };

      if (query.unitId && query.unitId !== 'All') {
        actionItemConditions.locationId = query.unitId;
      }

      if (query.entityId && query.entityId !== 'All') {
        actionItemConditions.entityId = query?.entityId;
      }

      // Fetch action items based on dynamic conditions
      const actionitemdata = await this.actionitems
        .find(actionItemConditions)
        .select('owner additionalInfo');

      const ownerIdArray = actionitemdata.flatMap((item) =>
        item?.owner?.map((ownerItem: any) => ownerItem.id),
      );

      // Extract meetingTypeId from additionalInfo
      const meetingTypeIds = actionitemdata.map(
        (item: any) => item.additionalInfo?.meetingTypeId,
      );

      const objectIds = meetingTypeIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      // Fetch meeting types based on meetingTypeIds
      const meetingTypes = await this.keyAgendaModel
        .find({
          _id: { $in: objectIds },
        })
        .select('name');

      // Fetch usernames for the owner ids
      const usernames = await this.prisma.user.findMany({
        where: {
          id: {
            in: ownerIdArray,
          },
        },
        select: {
          id: true,
          username: true,
        },
        orderBy: {
          username: 'asc',
        },
      });
      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getFilterListForMRM/${JSON.stringify(
          query,
        )} successful`,
      );
      return { usernames: usernames, meetingType: meetingTypes };
    } catch (error) {
      this.logger.log(
        `traceid=${uuid} GET /api/actionitem/getFilterListForMRM/${JSON.stringify(
          query,
        )} failed ${error}`,
      );
    }
  }
}
