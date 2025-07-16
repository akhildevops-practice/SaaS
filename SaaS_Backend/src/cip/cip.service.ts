import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CIP } from './schema/cip.schema';
import { CIPCategory } from './schema/cip-category.schema';
import { CIPType } from './schema/cip-type.schema';
import { CIPOrigin } from './schema/cip-origin.schema';
import { CIPTeam } from './schema/cip-team.schema';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
import { CIPActionItems } from './schema/cip-actionItems.schema';
import { CIPDocumentComments } from './schema/cip-documentComments.schema';
import { RefsService } from 'src/refs/refs.service';
import {
  sendRevisionReminderMail,
  sendMailForApproval,
  sendMailForReview,
  sendMailForEdit,
  sendMailPublished,
  sendMailForComplete,
  sendMailForVerification,
  sendMailForClosed,
} from './utils';
import { EmailService } from 'src/email/email.service';
import { ActionItems } from 'src/actionitems/schema/actionitems.schema';
import auditTrial from '../watcher/changesStream';
import { ObjectId } from 'mongodb';

@Injectable()
export class CIPService {
  constructor(
    @InjectModel(CIP.name) private CIPModel: Model<CIP>,
    @InjectModel(CIPCategory.name) private CIPCategoryModel: Model<CIPCategory>,
    @InjectModel(CIPType.name) private CIPTypeModel: Model<CIPType>,
    @InjectModel(CIPOrigin.name) private CIPOriginModel: Model<CIPOrigin>,
    @InjectModel(CIPTeam.name) private CIPTeamModel: Model<CIPTeam>,
    @InjectModel(CIPActionItems.name)
    private CIPActionItemsModel: Model<CIPActionItems>,
    @InjectModel(CIPDocumentComments.name)
    private CIPDocumentCommentsModel: Model<CIPDocumentComments>,
    @InjectModel(ActionItems.name) private ActionItemsModel: Model<ActionItems>,
    @Inject('Logger') private readonly logger: Logger,
    private readonly emailService: EmailService,
    private prisma: PrismaService,
    private refsService: RefsService,
  ) {}

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async createCIP(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP `,
      'cip.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    // const auditTrail = await auditTrial(
    //   'cips',
    //   'CIP',
    //   'CIP Documents',
    //   user.user,
    //   activeUser,
    //   randomNumber,
    // );
    await this.delay(1000);
    let {
      title,
      cipCategoryId,
      cipTeamId,
      cipTypeId,
      cipOrigin,
      justification,
      cost,
      tangibleBenefits,
      attachments,
      year,
      location,
      createdBy,
      reviewers,
      approvers,
      cancellation,
      status,
      entity,
      files,
      refsData,
    } = data;
    let payload = data;

    if (data.cipTeamId) {
      data.cipTeamId = cipTeamId.map((item: any) => item.id);
    }

    if (title === undefined) {
      const titleDupCheck = await this.CIPModel.findOne({
        title: { $regex: new RegExp(title, 'i') },
      });
      if (titleDupCheck) {
        return 'DuplicateTitle';
      }
    }

    const createdByUserData = await this.prisma.user.findUnique({
      where: {
        id: createdBy.id,
      },
    });

    if (!data.createdBy.email) {
      data.createdBy.email = createdByUserData?.email || null;
    }

    for (const reviewer of data?.reviewers) {
      reviewer.reviewStatus = null;

      const user = await this.prisma.user.findUnique({
        where: {
          id: reviewer.reviewerId,
        },
      });

      if (!reviewer.email) {
        reviewer.email = user?.email || null;
      }
    }

    for (const approver of data?.approvers) {
      approver.approveStatus = null;

      const user = await this.prisma.user.findUnique({
        where: {
          id: approver.approverId,
        },
      });

      if (!approver.email) {
        approver.email = user?.email || null;
      }
    }

    let createCIP;
    if (data.status === undefined || data.status === 'Draft') {
      createCIP = await this.CIPModel.create(data);
    }
    if (data.status === 'InReview') {
      payload.reviewers.forEach((reviewer) => {
        reviewer.reviewStatus = 'open';
      });

      createCIP = await this.CIPModel.create(data);
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: createCIP.organizationId,
        },
        select: {
          realmName: true,
        },
      });

      const mailData = {
        ...createCIP._doc,
        organization,
      };
      const user = createCIP?.createdBy;
      const mailRecipients = (await this.CIPModel.findById({
        _id: createCIP?._id,
      })) as any;

      for (let users of mailRecipients?.reviewers) {
        if (users) {
          await sendMailForReview(
            user,
            users,
            mailData,
            this.emailService.sendEmail,
          );
        }
      }
    }

    if (refsData) {
      const refs = refsData.map((ref: any) => ({
        ...ref,
        refTo: createCIP?.id,
      }));
      const createRefs = await this.refsService.create(refs);
    }
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Successful`,
      'cip.service.ts',
    );
  }

  async getAllCIP(userId, year, location, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP `,
      'cip.service.ts',
    );
    // console.log('data', data);
    try {
    const { page, limit, search, myCip, entityId } = data;

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    const cipQuery = async () => {
      const orMyCip: any[] = [];
      const orOthers: any[] = [];
      let standardQuery: any = {
        organizationId: activeUser.organizationId,
        year: year,
        //deleted: false,
      };

      if (location !== 'All' && myCip === 'false') {
        standardQuery = {
          ...standardQuery,
          'location.id': { $regex: location, $options: 'i' },
        };
      }

      if (entityId !== 'All' && myCip === 'false') {
        standardQuery = {
          ...standardQuery,
          'entity.id': { $regex: entityId, $options: 'i' },
        };
      }

      if (myCip === 'true') {
        const actionItems = await this.ActionItemsModel.find({
          organizationId: activeUser.organizationId,
          source: 'CIP',
        });
        const actItemCip = actionItems
          .filter((item: any) => item?.owner?.id === activeUser.id)
          .map((item: any) => item.referenceId);
        const actItemCipIds = actItemCip.map((id: string) => ({ _id: id }));
        orMyCip.push(
          { 'createdBy.id': { $regex: activeUser.id, $options: 'i' } },
          {
            reviewers: {
              $elemMatch: {
                reviewerId: { $regex: activeUser.id, $options: 'i' },
              },
            },
          },
          {
            approvers: {
              $elemMatch: {
                approverId: { $regex: activeUser.id, $options: 'i' },
              },
            },
          },
          {
            tangibleBenefits: {
              $elemMatch: {
                'verifier.id': { $regex: activeUser.id, $options: 'i' },
              },
            },
          },
          ...actItemCipIds,
        );
      }

      if (search !== undefined && search !== 'undefined') {
        // console.log('search', search);
        const searchArray = search.split(',').map((value) => value.trim());
        const searchRegex = new RegExp(searchArray.join('|'), 'i');

        if (searchArray.length > 1) {
          orOthers.push(
            { 'cipCategoryId.name': { $regex: searchRegex } },
            { cipTypeId: { $in: searchArray } },
            { 'location.name': { $regex: searchRegex } },
            { 'entity.entityName': { $regex: searchRegex } },
          );
        } else {
          orOthers.push(
            { 'cipCategoryId.name': { $regex: search, $options: 'i' } },
            { cipTypeId: { $regex: search, $options: 'i' } },
            { 'location.name': { $regex: search, $options: 'i' } },
            { 'entity.entityName': { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { status: { $regex: search, $options: 'i' } },
          );
        }
      }
      if (orMyCip.length > 0 && orOthers.length > 0) {
        standardQuery.$and = [{ $or: orMyCip }, { $or: orOthers }];
      } else if (orMyCip.length > 0) {
        standardQuery.$or = orMyCip;
      } else if (orOthers.length > 0) {
        standardQuery.$or = orOthers;
      }
      return standardQuery;
    };

    let query = await cipQuery();
    // console.log('qquery', query);
    let getAllCIP;
    getAllCIP = await this.CIPModel.find(query)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    let totalCip = await this.CIPModel.count(query);
    const cipArray = [];
    for (let cip of getAllCIP) {
      const actionItem = await this.ActionItemsModel.find({
        organizationId: activeUser.organizationId,
        source: 'CIP',
        referenceId: cip._id,
      }).lean();
      const uniqueOwners = [
        ...new Set(actionItem.map((item: any) => item.owner.id)),
      ];

      const getAllOwners = await this.prisma.user.findMany({
        where: {
          id: { in: uniqueOwners },
        },
        select: {
          id: true,
          firstname: true,
          lastname: true,
        },
      });

      const ownersMap = getAllOwners.reduce((acc, own) => {
        acc[own.id] = own.firstname + ' ' + own.lastname;
        return acc;
      }, {});

      let updatedActionItem = actionItem.map((item: any) => ({
        ...item,
        owner: {
          ...item.owner,
          fullName: ownersMap[item.owner.id],
        },
      }));
      let cipTeam = [];
      if (cip?.cipTeamId.length > 0) {
        const cipTeamId = await this.CIPTeamModel.find({
          _id: { $in: cip?.cipTeamId },
        });
        cipTeam = cipTeamId?.map((item: any) => {
          return {
            id: item._id,
            name: item.teamName,
          };
        });
      }
      cipArray.push({
        ...cip,
        actionItem: updatedActionItem,
        cipTeamId: cipTeam,
        ...(activeUser.id === cip.createdBy.id ? { editAccess: true } : {}),
        ...(cip.reviewers.find((reviewer: any) => {
          return (
            reviewer.id === activeUser.id && reviewer.reviewStatus === 'open'
          );
        })
          ? { editAccess: true }
          : {}),
        ...(cip.approvers.find((approver: any) => {
          return (
            approver.id === activeUser.id && approver.approveStatus === 'open'
          );
        })
          ? { editAccess: true }
          : {}),
      });
    }

    //Getting Category List for Column Filter
    const getAllCIPCategory = await this.CIPCategoryModel.find({
      organizationId: activeUser.organizationId,
    });
    const uniqueCategories = new Set();
    getAllCIPCategory.forEach((item: any) =>
      uniqueCategories.add(item.categoryName),
    );

    const sortedUniqueCategories = new Set(
      [...uniqueCategories].sort((a: any, b) => a.localeCompare(b)),
    );

    //Getting Type List for Column Filter
    let getAllCIPType;
    if (location === 'All') {
      getAllCIPType = await this.CIPTypeModel.find({
        organizationId: activeUser.organizationId,
      })
        .select('options location')
        .exec();
    } else {
      getAllCIPType = await this.CIPTypeModel.find({
        organizationId: activeUser.organizationId,
        'location.id': { $in: [location, 'All'] },
      })
        .select('options location')
        .exec();
    }

    const uniqueTypes = new Set(
      getAllCIPType ? getAllCIPType.flatMap((items: any) => items.options) : [],
    );

    const sortedUniqueTypes = new Set(
      [...uniqueTypes].sort((a: any, b) => a.localeCompare(b)),
    );

    //Getting Status List for Column Filter
    const allStatus = [
      'Draft',
      'InReview',
      'InApproval',
      'Approved',
      'InProgress',
      'Complete',
      'InVerification',
      'Closed',
      'Cancel',
      'Dropped',
      'Edit',
    ];

    const result = {
      data: cipArray,
      count: totalCip !== 0 ? totalCip : 1,
      allTypes: Array.from(sortedUniqueTypes),
      allCategories: Array.from(sortedUniqueCategories),
      allStatus: allStatus,
    };

    this.logger.log(
      `trace id = ${randomNumber} All CIP Retrieved Successfully`,
      'cip.service.ts',
    );

    return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} All CIP Failed to Retrieve`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPById(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP by ID : ${id}`,
      'cip.service.ts',
    );
    try {
      let getCIP = await this.CIPModel.findById({
        _id: id,
      }).lean();

      const actionItems = await this.ActionItemsModel.find({
        source: 'CIP',
        referenceId: getCIP._id,
      });

      let cipTeam = [];
      if (getCIP.cipTeamId.length > 0) {
        const cipTeamId = await this.CIPTeamModel.find({
          _id: { $in: getCIP.cipTeamId },
        });
        cipTeam = cipTeamId.map((item: any) => {
          return {
            id: item._id,
            name: item.teamName,
          };
        });
      }
      const updatedCip = {
        ...getCIP,
        actionItems: actionItems,
        cipTeamId: cipTeam,
      };

      this.logger.log(
        `trace id = ${randomNumber} CIP with ID : ${id} Successfully Retrieved`,
        'cip.service.ts',
      );
      return updatedCip;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} CIP with ID : ${id} Failed to Retrieve`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async updateCIP(id, data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Updating CIP of ID : ${id}`,
      'cip.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });
    // const auditTrail = await auditTrial(
    //   'cips',
    //   'CIP',
    //   'CIP Documents',
    //   user.user,
    //   activeUser,
    //   randomNumber,
    // );
    try {
      let {
        title,
        cipCategoryId,
        cipTypeId,
        cipTeamId,
        cipOrigin,
        justification,
        cost,
        tangibleBenefits,
        attachments,
        year,
        location,
        createdBy,
        reviewers,
        approvers,
        cancellation,
        status,
        files,
        //deleted,
        entity,
        refsData,
        otherMembers,
        plannedStartDate,
        plannedEndDate,
        actualStartDate,
        actualEndDate,
        organizationId,
        dropReason,
        projectMembers,
      } = data;

      cipTeamId = cipTeamId.map((item: any) => item.id);

      const getCIP = await this.getCIPById(id, randomNumber);
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: getCIP.organizationId,
        },
        select: {
          realmName: true,
        },
      });

      const getCIPActionItem = await this.ActionItemsModel.find({
        organizationId: getCIP.organizationId,
        source: 'CIP',
        referenceId: id,
      });

      const currentStatus = (await this.CIPModel.findById(id)).status;

      data = {
        ...data,
        organization,
      };

      reviewers?.forEach((reviewer) => {
        if (!reviewer.hasOwnProperty('reviewStatus')) {
          reviewer.reviewStatus = null;
        }
      });
      approvers?.forEach((approver) => {
        if (!approver.hasOwnProperty('approveStatus')) {
          approver.approveStatus = null;
        }
      });
      if (status === 'Edit') {
        reviewers.forEach((reviewer) => {
          reviewer.reviewStatus = null;
        });
        approvers.forEach((approver) => {
          approver.approveStatus = null;
        });
      }
      const allReviewersComplete = reviewers?.every(
        (reviewer) => reviewer.reviewStatus === 'complete',
      );
      const allApproversComplete = approvers?.every(
        (approver) => approver.approveStatus === 'complete',
      );

      if (
        status === 'InReview' &&
        reviewers?.every((reviewer) => reviewer.reviewStatus === null)
      ) {
        reviewers.forEach((reviewer) => {
          reviewer.reviewStatus = 'open';
        });
        const user = createdBy;
        for (let users of reviewers) {
          await sendMailForReview(
            user,
            users,
            data,
            this.emailService.sendEmail,
          );
        }
      } else if (status === 'InReview' && allReviewersComplete) {
        status = 'InApproval';
        approvers.forEach((approver) => {
          approver.approveStatus = 'open';
        });
        reviewers.forEach((reviewer) => {
          reviewer.reviewStatus = 'closed';
        });
        const user = createdBy;
        for (let users of approvers) {
          await sendMailForApproval(
            user,
            users,
            data,
            this.emailService.sendEmail,
          );
        }
      } else if (status === 'InApproval' && allApproversComplete) {
        status = 'Approved';
        approvers.forEach((approver) => {
          approver.approveStatus = 'closed';
        });
        for (let users of reviewers) {
          await sendMailPublished(users, data, this.emailService.sendEmail);
        }
        for (let users of approvers) {
          await sendMailPublished(users, data, this.emailService.sendEmail);
        }
      } else if (status === 'Approved' && actualStartDate) {
        status = 'InProgress';
      } else if (
        status === 'InVerification' &&
        tangibleBenefits.every((item: { verifierStatus: boolean }) => {
          item.verifierStatus === false;
        })
      ) {
        for (let users of tangibleBenefits.verifier) {
          await sendMailForVerification(
            createdBy,
            users,
            data,
            this.emailService.sendEmail,
          );
        }
      } else if (
        status === 'InVerification' &&
        tangibleBenefits.every(
          (item: { verifierStatus: boolean }) => item.verifierStatus === true,
        )
      ) {
        status = 'Closed';
        await sendMailForClosed(
          createdBy,
          createdBy,
          data,
          this.emailService.sendEmail,
        );
        for (let users of approvers) {
          await sendMailForClosed(
            createdBy,
            users,
            data,
            this.emailService.sendEmail,
          );
        }
        for (let users of reviewers) {
          await sendMailForClosed(
            createdBy,
            users,
            data,
            this.emailService.sendEmail,
          );
        }
        for (let users of projectMembers) {
          await sendMailForClosed(
            createdBy,
            users,
            data,
            this.emailService.sendEmail,
          );
        }
      }

      if (currentStatus === 'InProgress' || status === 'InProgress') {
        const actionItemStatus = getCIPActionItem.map((item) => item.status);

        const checkActionItemStatus = actionItemStatus.every(
          (item) => item === false,
        );
        if (checkActionItemStatus) {
          status = 'Complete';
          actualEndDate = new Date();

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
      }

      const updateCIP = await this.CIPModel.findByIdAndUpdate(id, {
        title,
        cipCategoryId,
        cipTeamId,
        cipTypeId,
        cipOrigin,
        justification,
        cost,
        tangibleBenefits,
        attachments,
        year,
        location,
        createdBy,
        reviewers,
        approvers,
        cancellation,
        status,
        files,
        //deleted,
        entity,
        otherMembers,
        plannedStartDate,
        plannedEndDate,
        actualStartDate,
        actualEndDate,
        dropReason,
        projectMembers,
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
      }
      this.logger.log(
        `trace id = ${randomNumber} Updating CIP of ID : ${id} is Successful`,
        'cip.service.ts',
      );
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating CIP of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getActionButton(user, cipId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting Action Button for CIP ID : ${cipId}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      const cipDocument = await this.CIPModel.findById({
        _id: cipId,
      });

      const orgAdminRole = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'ORG-ADMIN',
        },
        select: {
          id: true,
        },
      });

      const mrRole = await this.prisma.role.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          roleName: 'MR',
        },
        select: {
          id: true,
        },
      });

      let isCreator = false;
      let isReviewer = false;
      let isApprover = false;
      let isOrgAdmin = false;
      let isMr = false;
      let optionsArray = [];

      isReviewer = cipDocument.reviewers.some(
        (reviewer: any) => reviewer.reviewerId === activeUser.id,
      );

      isApprover = cipDocument.approvers.some(
        (approver: any) => approver.approverId === activeUser.id,
      );

      isOrgAdmin = activeUser.roleId.includes(orgAdminRole.id);
      isMr =
        activeUser.roleId.includes(mrRole.id) &&
        activeUser.locationId === cipDocument.location?.id;

      if (cipDocument.createdBy.id === activeUser.id) {
        isCreator = true;
        optionsArray.push('Cancel');
      }

      if (cipDocument.status === 'Draft') {
        if (isCreator) {
          optionsArray = optionsArray.filter((item) => item !== 'Cancel');
          optionsArray.push('Save As Draft', 'Send For Review');
        }
      }

      if (cipDocument.status === 'Edit') {
        if (isCreator) {
          optionsArray.push('Save As Draft', 'Send For Review');
        }
      }

      if (cipDocument.status === 'InReview') {
        if (isReviewer) {
          optionsArray.push('Save', 'Send For Edit', 'Review Complete');
        }
      }

      if (cipDocument.status === 'InApproval') {
        if (isApprover) {
          optionsArray.push('Save', 'Send For Edit', 'Approve');
        }
      }

      if (cipDocument.status === 'Approved') {
        optionsArray = optionsArray.filter((option) => option !== 'Cancel');
        if (isCreator) {
          optionsArray.push('Save');
        }
        if (isCreator || isApprover || isOrgAdmin || isMr) {
          optionsArray.push('Drop CIP');
        }
      }

      if (
        cipDocument.status === 'InProgress' ||
        cipDocument.status === 'Complete' ||
        cipDocument.status === 'InVerification'
      ) {
        optionsArray = optionsArray.filter((option) => option !== 'Cancel');
        if (isCreator || isApprover || isOrgAdmin || isMr) {
          optionsArray.push('Save', 'Drop CIP');
        }
      }

      if (
        cipDocument.status === 'Complete' &&
        cipDocument?.tangibleBenefits.every(
          (item: { verifier?: object }) => typeof item.verifier === 'object',
        )
      ) {
        if (isCreator) {
          optionsArray.push('Send for Verification');
        }
      }

      this.logger.log(
        `trace id = ${randomNumber} Getting Action Button for CIP ID : ${cipId} Successful`,
        'cip.service.ts',
      );
      return optionsArray;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting Action Button for CIP ID : ${cipId} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCIP(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Deleting CIP of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'cips',
      //   'CIP',
      //   'CIP Documents',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const deleteCIP = await this.CIPModel.findByIdAndDelete(id);
        this.logger.log(
          `trace id = ${randomNumber} Deleting CIP of ID : ${id} is Successful`,
          'cip.service.ts',
        );
        return `CIP Deleted SucessFully`;
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting CIP of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async createCIPCategory(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Category`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'cipcategories',
      //   'CIP',
      //   'CIP Category',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const create = await this.CIPCategoryModel.create(data);
        this.logger.log(
          `trace id = ${randomNumber} Creating CIP Category Successful`,
          'cip.service.ts',
        );
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating CIP Category Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllCIPCategory(userId, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP Category`,
      'cip.service.ts',
    );
    try {
      const { page, limit } = data;

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getAllCIPCategory = await this.CIPCategoryModel.find({
        organizationId: activeUser.organizationId,
      })
        .sort({ categoryName: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('categoryName options')
        .exec();

      let total = await this.CIPCategoryModel.count({
        organizationId: activeUser.organizationId,
      });

      this.logger.log(
        `trace id = ${randomNumber} Getting All CIP Category Successful`,
        'cip.service.ts',
      );

      return {
        data: getAllCIPCategory,
        total: total,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting All CIP Category Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPCategoryById(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP Category of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const getCIPCategory = this.CIPCategoryModel.findById({
        _id: id,
      }).select('categoryName options');
      this.logger.log(
        `trace id = ${randomNumber} Getting CIP Category of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return getCIPCategory;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP Category of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async updateCIPCategory(id, data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Updating CIP Category of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'cipcategories',
      //   'CIP',
      //   'CIP Category',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      const { categoryName, options } = data;

      setTimeout(async () => {
        const updateCIPCategory = await this.CIPCategoryModel.findByIdAndUpdate(
          id,
          {
            categoryName,
            options,
          },
        );
        this.logger.log(
          `trace id = ${randomNumber} Updating CIP Category of ID : ${id} Successful`,
          'cip.service.ts',
        );
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating CIP Category of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCIPCategory(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Deleting CIP Category of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'cipcategories',
      //   'CIP',
      //   'CIP Category',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const deleteCIPCategory = await this.CIPCategoryModel.findByIdAndDelete(
          id,
        );
        this.logger.log(
          `trace id = ${randomNumber} Deleting CIP Category of ID : ${id} Successful`,
          'cip.service.ts',
        );
        return `CIP Category Deleted SucessFully`;
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting CIP Category of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async createCIPType(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Type`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'ciptypes',
      //   'CIP',
      //   'CIP Methodology',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const create = await this.CIPTypeModel.create(data);
        this.logger.log(
          `trace id = ${randomNumber} Creating CIP Type Successful`,
          'cip.service.ts',
        );
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating CIP Type Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllCIPType(userId, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP Type`,
      'cip.service.ts',
    );
    try {
      const { page, limit } = data;

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getAllCIPType = await this.CIPTypeModel.find({
        organizationId: activeUser.organizationId,
      })
        .sort({ 'location.locationName': 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('typeName options location')
        .exec();

      let total = await this.CIPTypeModel.count({
        organizationId: activeUser.organizationId,
      });

      const newGetAllCIP = getAllCIPType.map((cip) => {
        const { _id, typeName, options, location } = cip;

        return {
          _id,
          typeName,
          options,
          location,
          editAccess: activeUser.locationId === location.id,
        };
      });

      this.logger.log(
        `trace id = ${randomNumber} Getting All CIP Type Successful`,
        'cip.service.ts',
      );

      return {
        data: newGetAllCIP,
        total: total,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting All CIP Type Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPTypeById(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP Type of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const getCIPType = this.CIPTypeModel.findById({
        _id: id,
      }).select('typeName options location');

      this.logger.log(
        `trace id = ${randomNumber} Getting CIP Type of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return getCIPType;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP Type of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPTypeByLocation(id, userId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP Type By Location`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      let whereCondition;

      if (!!id) {
        whereCondition = {
          organizationId: activeUser.organizationId,
          $or: [{ 'location.id': id }, { 'location.id': 'All' }],
        };
      } else {
        whereCondition = {
          organizationId: activeUser.organizationId,
          location: {
            id: 'All',
          },
        };
      }

      const getCIPTypeByLocation = await this.CIPTypeModel.find(whereCondition)
        .select('options location')
        .exec();

      this.logger.log(
        `trace id = ${randomNumber} Getting All CIP Type By Location Successful`,
        'cip.service.ts',
      );
      return getCIPTypeByLocation;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting All CIP Type Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async updateCIPType(id, data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Updating CIP Type of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'ciptypes',
      //   'CIP',
      //   'CIP Methodology',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      const { typeName, options, location } = data;

      setTimeout(async () => {
        const updateCIPType = await this.CIPTypeModel.findByIdAndUpdate(id, {
          typeName,
          options,
          location,
        });

        this.logger.log(
          `trace id = ${randomNumber} Updating CIP Type of ID : ${id} Successful`,
          'cip.service.ts',
        );
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating CIP Type of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCIPType(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Deleting CIP Type of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'ciptypes',
      //   'CIP',
      //   'CIP Methodology',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const deleteCIPType = await this.CIPTypeModel.findByIdAndDelete(id);
        this.logger.log(
          `trace id = ${randomNumber} Deleting CIP Type of ID : ${id} Successful`,
          'cip.service.ts',
        );
      }, 1000);
      return `CIP Category Deleted SucessFully`;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting CIP Type of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async createCIPOrigin(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Origin`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'ciporigins',
      //   'CIP',
      //   'CIP Origin',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const create = await this.CIPOriginModel.create(data);
        this.logger.log(
          `trace id = ${randomNumber} Creating CIP Origin Successful`,
          'cip.service.ts',
        );
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating CIP Origin Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getAllCIPOrigin(userId, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP Origin`,
      'cip.service.ts',
    );
    try {
      const { page, limit } = data;

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getAllCIPOrigin = await this.CIPOriginModel.find({
        organizationId: activeUser.organizationId,
      })
        .sort({ 'location.locationName': 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('originName options location')
        .exec();

      let total = await this.CIPOriginModel.count({
        organizationId: activeUser.organizationId,
      });
      this.logger.log(
        `trace id = ${randomNumber} Getting All CIP Origin Successful`,
        'cip.service.ts',
      );

      return {
        data: getAllCIPOrigin,
        total: total,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting All CIP Origin Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPOriginById(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP Origin of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const getCIPOrigin = this.CIPOriginModel.findById({
        _id: id,
      }).select('originName options location');

      this.logger.log(
        `trace id = ${randomNumber} Getting CIP Origin of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return getCIPOrigin;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP Origin of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPOriginByLocation(id, userId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP Origin By Location`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      let whereCondition;

      if (!!id) {
        whereCondition = {
          organizationId: activeUser.organizationId,
          $or: [{ 'location.id': id }, { 'location.id': 'All' }],
        };
      } else {
        whereCondition = {
          organizationId: activeUser.organizationId,
          location: {
            id: 'All',
          },
        };
      }

      const getCIPOriginByLocation = await this.CIPOriginModel.find(
        whereCondition,
      )
        .select('options location')
        .exec();

      this.logger.log(
        `trace id = ${randomNumber} Getting All CIP Origin By Location Successful`,
        'cip.service.ts',
      );
      return getCIPOriginByLocation;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting All CIP Origin Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async updateCIPOrigin(id, data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Updating CIP Origin of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'ciporigins',
      //   'CIP',
      //   'CIP Origin',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      const { originName, options, location } = data;
      setTimeout(async () => {
        const updateCIPOrigin = await this.CIPOriginModel.findByIdAndUpdate(
          id,
          {
            originName,
            options,
            location,
          },
        );

        this.logger.log(
          `trace id = ${randomNumber} Updating CIP Origin of ID : ${id} Successful`,
          'cip.service.ts',
        );
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating CIP Origin of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCIPOrigin(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Deleting CIP Origin of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      // const auditTrail = await auditTrial(
      //   'ciporigins',
      //   'CIP',
      //   'CIP Origin',
      //   user.user,
      //   activeUser,
      //   randomNumber,
      // );
      setTimeout(async () => {
        const deleteCIPOrigin = await this.CIPOriginModel.findByIdAndDelete(id);
        this.logger.log(
          `trace id = ${randomNumber} Deleting CIP Origin of ID : ${id} Successful`,
          'cip.service.ts',
        );
        return `CIP Category Deleted SucessFully`;
      }, 1000);
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting CIP Origin of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async createCIPActionItem(data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Action Item`,
      'cip.service.ts',
    );
    try {
      const createCIPActionItem = await this.CIPActionItemsModel.create(data);
      this.logger.log(
        `trace id = ${randomNumber} Creating CIP Action Item Successful`,
        'cip.service.ts',
      );
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating CIP Action Item Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getCIPActionItemsByCIPId(cipId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP Action Items of CIPID : ${cipId}`,
      'cip.service.ts',
    );
    try {
      const getCIPActionItems = this.CIPActionItemsModel.find({
        cipId: cipId,
      });
      this.logger.log(
        `trace id = ${randomNumber} Getting CIP Action Items of CIPID : ${cipId} Successful`,
        'cip.service.ts',
      );
      return getCIPActionItems;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP Action Items of CIPID : ${cipId} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async updateCIPActionItem(id, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Updating CIP Action Item of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const {
        actionItem,
        description,
        owner,
        startDate,
        targetDate,
        status,
        attachments,
        activityUpdate,
      } = data;

      const updateCIP = await this.CIPActionItemsModel.findByIdAndUpdate(id, {
        actionItem,
        description,
        owner,
        startDate,
        targetDate,
        status,
        attachments,
        activityUpdate,
      });
      this.logger.log(
        `trace id = ${randomNumber} Updating CIP Action Item of ID : ${id} Successful`,
        'cip.service.ts',
      );
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating CIP Action Item of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async deleteCIPActionItem(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Deleting CIP Action Item of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const deleteCIPActionItem =
        await this.CIPActionItemsModel.findByIdAndDelete(id);
      this.logger.log(
        `trace id = ${randomNumber} Deleting CIP Action Item of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return `CIP Deleted SucessFully`;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting CIP Action Item of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async createCIPDocumentComments(data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Comments for CIP ID ${data.cipId}`,
      'cip.service.ts',
    );
    try {
      const createComments = await this.CIPDocumentCommentsModel.create(data);
      this.logger.log(
        `trace id = ${randomNumber} Creating CIP Comments for CIP ID ${data.cipId} Sucessful`,
        'cip.service.ts',
      );
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating CIP Comments for CIP ID ${data.cipId} Failed`,
        'cip.service.ts',
      );
      throw new InternalServerErrorException(error);
    }
  }

  async getCIPDocumentCommentsByCIPId(cipId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP Document Comments of CIPID : ${cipId}`,
      'cip.service.ts',
    );
    try {
      const getCIPDocumentComments = this.CIPDocumentCommentsModel.find({
        cipId: cipId,
      });
      this.logger.log(
        `trace id = ${randomNumber} Getting CIP Document Comments of CIPID : ${cipId} Successful`,
        'cip.service.ts',
      );
      return getCIPDocumentComments;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP Document Comments of CIPID : ${cipId} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPByLocationId(userId, locationId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP By LocationId : ${locationId}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const getCIP = await this.CIPModel.find({
        'location.id': locationId,
      }).lean();

      const newGetAllCIP = getCIP.map((cip) => ({
        ...cip,
        ...(activeUser.id === cip.createdBy.id ? { editAccess: true } : {}),
        ...(cip.reviewers.find((reviewer: any) => {
          return (
            reviewer.id === activeUser.id && reviewer.reviewStatus === 'open'
          );
        })
          ? { editAccess: true }
          : {}),
        ...(cip.approvers.find((approver: any) => {
          return (
            approver.id === activeUser.id && approver.approveStatus === 'open'
          );
        })
          ? { editAccess: true }
          : {}),
      }));

      this.logger.log(
        `trace id = ${randomNumber} Getting CIP By LocationId : ${locationId} Successful`,
        'cip.service.ts',
      );
      return newGetAllCIP;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP By LocationId : ${locationId} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  //api for cip inbox

  async getCIPInfoForInbox(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user,
      },
    });

    const cip = await this.CIPModel.find({
      $or: [
        // To get CIPs where the user is a reviewer and status is 'InReview'
        {
          reviewers: {
            $elemMatch: { id: activeUser.id, reviewStatus: 'open' },
          },
          status: 'InReview',
        },
        // To get CIPs where the user is an approver and status is 'InApproval'
        {
          approvers: {
            $elemMatch: { id: activeUser.id, approveStatus: 'open' },
          },
          status: 'InApproval',
        },
        // To get CIPs where the user is in the verifier list and status is 'InProgress'
        {
          'tangibleBenefits.verifier.id': activeUser.id,
          status: 'InVerification',
        },
      ],
    });
    return cip;
  }

  // async chartData(filter, user) {
  //   try {
  //     let {
  //       location,
  //       entity,
  //       statusWise,
  //       page,
  //       limit,
  //       businessTypeFilter,
  //       businessFilter,
  //       functionFilter,
  //     } = filter;
  //     const activeUser = await this.prisma.user.findFirst({
  //       where: { kcId: user.id },
  //     });

  //     const whereCondition: any = {};
  //     if (!location && businessTypeFilter && businessTypeFilter !== 'All') {
  //       whereCondition.businessTypeId = businessTypeFilter;
  //     }
  //     if (!location && businessFilter && businessFilter !== 'All') {
  //       whereCondition.business = {
  //         some: {
  //           businessId: businessFilter,
  //         },
  //       };
  //     }
  //     if (!location && functionFilter && functionFilter !== 'All') {
  //       whereCondition.functionId = {
  //         some: (functionId) => ({
  //           equals: functionFilter,
  //         }),
  //       };
  //     }

  //     if (!location) {
  //       const unitFilter = await this.prisma.location.findMany({
  //         where: whereCondition,
  //       });
  //       location = unitFilter.map((item: any) => item.id);
  //     }
  //     let highCostPipeline, statusPipeline;
  //     if (location?.includes('All')) {
  //       highCostPipeline = [
  //         {
  //           $match: {
  //             organizationId: activeUser.organizationId,
  //           },
  //         },
  //         {
  //           $sort: {
  //             cost: -1,
  //             'location.locationName': -1,
  //           },
  //         },
  //         {
  //           $limit: 5,
  //         },
  //         {
  //           $group: {
  //             _id: '$location.id', // Group by location id
  //             locationName: { $first: '$location.name' }, // Include location name
  //             totalCount: { $sum: 1 }, // Total number of documents per location
  //             draftCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0], // Count 'Draft' status
  //               },
  //             },
  //             inReviewCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InReview'] }, 1, 0], // Count 'InReview' status
  //               },
  //             },
  //             inApprovalCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InApproval'] }, 1, 0], // Count 'InApproval' status
  //               },
  //             },
  //             approvedCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0], // Count 'Approved' status
  //               },
  //             },
  //             inProgressCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0], // Count 'InProgress' status
  //               },
  //             },
  //             completeCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Complete'] }, 1, 0], // Count 'Complete' status
  //               },
  //             },
  //             inVerificationCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InVerification'] }, 1, 0], // Count 'InVerification' status
  //               },
  //             },
  //             closedCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0], // Count 'Closed' status
  //               },
  //             },
  //             cancelledCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0], // Count 'Cancelled' status
  //               },
  //             },
  //             droppedCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0], // Count 'Dropped' status
  //               },
  //             },
  //             draftIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Draft'] }, '$_id', null], // Push IDs for 'Draft' status
  //               },
  //             },
  //             inReviewIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InReview'] }, '$_id', null], // Push IDs for 'InReview' status
  //               },
  //             },
  //             inApprovalIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InApproval'] }, '$_id', null], // Push IDs for 'InApproval' status
  //               },
  //             },
  //             approvedIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Approved'] }, '$_id', null], // Push IDs for 'Approved' status
  //               },
  //             },
  //             inProgressIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InProgress'] }, '$_id', null], // Push IDs for 'InProgress' status
  //               },
  //             },
  //             completeIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Complete'] }, '$_id', null], // Push IDs for 'Complete' status
  //               },
  //             },
  //             inVerificationIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InVerification'] }, '$_id', null], // Push IDs for 'InVerification' status
  //               },
  //             },
  //             closedIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Closed'] }, '$_id', null], // Push IDs for 'Closed' status
  //               },
  //             },
  //             cancelledIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Cancelled'] }, '$_id', null], // Push IDs for 'Cancelled' status
  //               },
  //             },
  //             droppedIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Dropped'] }, '$_id', null], // Push IDs for 'Dropped' status
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0, // Exclude the _id field
  //             locationName: 1, // Include location name
  //             totalCount: 1, // Include total count
  //             draftCount: 1, // Include 'Draft' status count
  //             inReviewCount: 1, // Include 'InReview' status count
  //             inApprovalCount: 1, // Include 'InApproval' status count
  //             approvedCount: 1, // Include 'Approved' status count
  //             inProgressCount: 1, // Include 'InProgress' status count
  //             completeCount: 1, // Include 'Complete' status count
  //             inVerificationCount: 1, // Include 'InVerification' status count
  //             closedCount: 1, // Include 'Closed' status count
  //             cancelledCount: 1, // Include 'Cancelled' status count
  //             droppedCount: 1, // Include 'Dropped' status count
  //             draftIds: {
  //               $filter: {
  //                 input: '$draftIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Draft' IDs
  //             inReviewIds: {
  //               $filter: {
  //                 input: '$inReviewIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InReview' IDs
  //             inApprovalIds: {
  //               $filter: {
  //                 input: '$inApprovalIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InApproval' IDs
  //             approvedIds: {
  //               $filter: {
  //                 input: '$approvedIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Approved' IDs
  //             inProgressIds: {
  //               $filter: {
  //                 input: '$inProgressIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InProgress' IDs
  //             completeIds: {
  //               $filter: {
  //                 input: '$completeIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Complete' IDs
  //             inVerificationIds: {
  //               $filter: {
  //                 input: '$inVerificationIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InVerification' IDs
  //             closedIds: {
  //               $filter: {
  //                 input: '$closedIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Closed' IDs
  //             cancelledIds: {
  //               $filter: {
  //                 input: '$cancelledIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Cancelled' IDs
  //             droppedIds: {
  //               $filter: {
  //                 input: '$droppedIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Dropped' IDs
  //           },
  //         },
  //         {
  //           $sort: {
  //             cost: -1, // Sort by cost (descending order)
  //           },
  //         },
  //       ];
  //       statusPipeline = [
  //         {
  //           $match: {
  //             organizationId: activeUser.organizationId,
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: '$location.id', // Group by location id
  //             locationName: { $first: '$location.name' }, // Get the location name
  //             totalCount: { $sum: 1 }, // Total number of documents per location
  //             draftCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0], // Count 'Draft' status
  //               },
  //             },
  //             inReviewCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InReview'] }, 1, 0], // Count 'InReview' status
  //               },
  //             },
  //             inApprovalCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InApproval'] }, 1, 0], // Count 'InApproval' status
  //               },
  //             },
  //             approvedCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0], // Count 'Approved' status
  //               },
  //             },
  //             inProgressCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0], // Count 'InProgress' status
  //               },
  //             },
  //             completeCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Complete'] }, 1, 0], // Count 'Complete' status
  //               },
  //             },
  //             inVerificationCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'InVerification'] }, 1, 0], // Count 'InVerification' status
  //               },
  //             },
  //             closedCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0], // Count 'Closed' status
  //               },
  //             },
  //             cancelledCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0], // Count 'Cancelled' status
  //               },
  //             },
  //             droppedCount: {
  //               $sum: {
  //                 $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0], // Count 'Dropped' status
  //               },
  //             },
  //             draftIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Draft'] }, '$_id', null], // Push IDs for 'Draft' status
  //               },
  //             },
  //             inReviewIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InReview'] }, '$_id', null], // Push IDs for 'InReview' status
  //               },
  //             },
  //             inApprovalIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InApproval'] }, '$_id', null], // Push IDs for 'InApproval' status
  //               },
  //             },
  //             approvedIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Approved'] }, '$_id', null], // Push IDs for 'Approved' status
  //               },
  //             },
  //             inProgressIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InProgress'] }, '$_id', null], // Push IDs for 'InProgress' status
  //               },
  //             },
  //             completeIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Complete'] }, '$_id', null], // Push IDs for 'Complete' status
  //               },
  //             },
  //             inVerificationIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'InVerification'] }, '$_id', null], // Push IDs for 'InVerification' status
  //               },
  //             },
  //             closedIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Closed'] }, '$_id', null], // Push IDs for 'Closed' status
  //               },
  //             },
  //             cancelledIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Cancelled'] }, '$_id', null], // Push IDs for 'Cancelled' status
  //               },
  //             },
  //             droppedIds: {
  //               $push: {
  //                 $cond: [{ $eq: ['$status', 'Dropped'] }, '$_id', null], // Push IDs for 'Dropped' status
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0, // Exclude the _id field
  //             locationName: 1, // Include location name
  //             totalCount: 1, // Include total count
  //             draftCount: 1, // Include 'Draft' status count
  //             inReviewCount: 1, // Include 'InReview' status count
  //             inApprovalCount: 1, // Include 'InApproval' status count
  //             approvedCount: 1, // Include 'Approved' status count
  //             inProgressCount: 1, // Include 'InProgress' status count
  //             completeCount: 1, // Include 'Complete' status count
  //             inVerificationCount: 1, // Include 'InVerification' status count
  //             closedCount: 1, // Include 'Closed' status count
  //             cancelledCount: 1, // Include 'Cancelled' status count
  //             droppedCount: 1, // Include 'Dropped' status count
  //             draftIds: {
  //               $filter: {
  //                 input: '$draftIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Draft' IDs
  //             inReviewIds: {
  //               $filter: {
  //                 input: '$inReviewIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InReview' IDs
  //             inApprovalIds: {
  //               $filter: {
  //                 input: '$inApprovalIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InApproval' IDs
  //             approvedIds: {
  //               $filter: {
  //                 input: '$approvedIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Approved' IDs
  //             inProgressIds: {
  //               $filter: {
  //                 input: '$inProgressIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InProgress' IDs
  //             completeIds: {
  //               $filter: {
  //                 input: '$completeIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Complete' IDs
  //             inVerificationIds: {
  //               $filter: {
  //                 input: '$inVerificationIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'InVerification' IDs
  //             closedIds: {
  //               $filter: {
  //                 input: '$closedIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Closed' IDs
  //             cancelledIds: {
  //               $filter: {
  //                 input: '$cancelledIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Cancelled' IDs
  //             droppedIds: {
  //               $filter: {
  //                 input: '$droppedIds',
  //                 as: 'id',
  //                 cond: { $ne: ['$$id', null] },
  //               },
  //             }, // Filter out nulls for 'Dropped' IDs
  //             completionPercentage: {
  //               $cond: {
  //                 if: { $eq: ['$totalCount', 0] }, // Avoid division by zero
  //                 then: 0,
  //                 else: {
  //                   $multiply: [
  //                     { $divide: ['$approvedCount', '$totalCount'] },
  //                     100,
  //                   ],
  //                 }, // Calculate completion percentage
  //               },
  //             },
  //           },
  //         },
  //         {
  //           $sort: {
  //             locationName: 1, // Sort by location name
  //           },
  //         },
  //       ];
  //     } else {
  //       highCostPipeline = [
  //         {
  //           $match: {
  //             organizationId: activeUser.organizationId,
  //             ...(location &&
  //               !location.includes('All') && {
  //                 'location.id': { $in: location },
  //               }),
  //             ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
  //           },
  //         },
  //         {
  //           $sort: {
  //             cost: -1,
  //           },
  //         },
  //         {
  //           $limit: 5,
  //         },
  //         {
  //           $project: {
  //             _id: 0,
  //             id: '$_id',
  //             cost: 1,
  //             title: '$title',
  //           },
  //         },
  //       ];
  //       statusPipeline = [
  //         {
  //           $match: {
  //             organizationId: activeUser.organizationId,
  //             ...(location &&
  //               location !== 'All' && { 'location.id': { $in: location } }), // Filter by location
  //             ...(entity && entity !== 'All' && { 'entity.id': entity }), // Filter by entity if needed
  //           },
  //         },
  //         {
  //           $group: {
  //             _id: '$status', // Group by the original status field
  //             count: { $sum: 1 },
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 0, // Remove the _id field
  //             status: '$_id', // Retain the status as it is
  //             count: 1,
  //           },
  //         },
  //       ];
  //     }

  //     //commented out grouping logic for status like in approval/in review is grouped under same name in approval
  //     // const statusPipeline: any = [
  //     //   {
  //     //     $match: {
  //     //       organizationId: activeUser.organizationId,
  //     //       ...(location &&
  //     //         !location.includes('All') && { 'location.id': { $in: location } }),
  //     //       ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
  //     //     },
  //     //   },
  //     //   {
  //     //     $project: {
  //     //       status: {
  //     //         $cond: {
  //     //           if: {
  //     //             $in: ['$status', ['InProgress', 'Complete', 'InVerification']],
  //     //           },
  //     //           then: 'In Progress',
  //     //           else: {
  //     //             $cond: {
  //     //               if: { $in: ['$status', ['InReview', 'InApproval']] },
  //     //               then: 'In Approval',
  //     //               else: '$status',
  //     //             },
  //     //           },
  //     //         },
  //     //       },
  //     //     },
  //     //   },
  //     //   {
  //     //     $group: {
  //     //       _id: '$status',
  //     //       count: { $sum: 1 },
  //     //     },
  //     //   },
  //     //   {
  //     //     $project: {
  //     //       _id: 0,
  //     //       status: '$_id',
  //     //       count: 1,
  //     //       id: 1,
  //     //     },
  //     //   },
  //     // ];

  //     let tableData;
  //     if (statusWise) {
  //       let statusQuery;
  //       // if (statusWise === 'In Progress') {
  //       //   statusQuery = {
  //       //     status: { $in: ['InProgress', 'Complete', 'InVerification'] },
  //       //   };
  //       // } else if (statusWise === 'In Approval') {
  //       //   statusQuery = {
  //       //     status: { $in: ['InReview', 'InApproval'] },
  //       //   };
  //       // } else {
  //       //   statusQuery = {
  //       //     status: statusWise,
  //       //   };
  //       // }
  //       statusQuery = {
  //         status: statusWise,
  //       };
  //       const statusTablePipeline: any = [
  //         {
  //           $match: {
  //             organizationId: activeUser.organizationId,
  //             ...(location &&
  //               !location.includes('All') && {
  //                 'location.id': { $in: location },
  //               }),
  //             ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
  //             ...statusQuery, // Apply status filter
  //           },
  //           $sort: {
  //             'location.locationName': -1,
  //           },
  //         },
  //         // Uncomment these lines if pagination (skip and limit) is required
  //         // {
  //         //   $skip: page,
  //         // },
  //         // {
  //         //   $limit: limit,
  //         // },
  //       ];

  //       tableData = await this.CIPModel.aggregate(statusTablePipeline);
  //     }

  //     const highCostWiseData = await this.CIPModel.aggregate(highCostPipeline);
  //     const statusWiseData = await this.CIPModel.aggregate(statusPipeline);
  //     this.logger.log(`GET GET /api/cip/chart data successful`, '');
  //     return {
  //       highCostWiseData,
  //       statusWiseData,
  //       tableData,
  //     };
  //   } catch (error) {
  //     this.logger.error(`GET GET /api/cip/chart data successful`, '');
  //   }
  // }
  async chartData(filter, user) {
    try {
      let {
        location,
        entity,
        statusWise,
        page,
        limit,
        businessTypeFilter,
        businessFilter,
        functionFilter,
      } = filter;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const whereCondition: any = {};
      if (!location && businessTypeFilter && businessTypeFilter !== 'All') {
        whereCondition.businessTypeId = businessTypeFilter;
      }
      if (!location && businessFilter && businessFilter !== 'All') {
        whereCondition.business = {
          some: {
            businessId: businessFilter,
          },
        };
      }
      if (!location && functionFilter && functionFilter !== 'All') {
        whereCondition.functionId = {
          some: (functionId) => ({
            equals: functionFilter,
          }),
        };
      }

      if (!location) {
        const unitFilter = await this.prisma.location.findMany({
          where: whereCondition,
        });
        location = unitFilter.map((item: any) => item.id);
      }
      let highCostPipeline,
        statusPipeline,
        statusAllLocPipeline,
        myLocCount,
        attachmentPipeline;
      if (location?.includes('All')) {
        highCostPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
            },
          },
          {
            $sort: {
              cost: -1,
            },
          },
          {
            $limit: 5,
          },
          {
            $group: {
              _id: '$location.id', // Group by location id
              locationName: { $first: '$location.name' }, // Include location name
              totalCount: { $sum: 1 }, // Total number of documents per location
              draftCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0], // Count 'Draft' status
                },
              },
              inReviewCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InReview'] }, 1, 0], // Count 'InReview' status
                },
              },
              inApprovalCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InApproval'] }, 1, 0], // Count 'InApproval' status
                },
              },
              approvedCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0], // Count 'Approved' status
                },
              },
              inProgressCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0], // Count 'InProgress' status
                },
              },
              completeCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Complete'] }, 1, 0], // Count 'Complete' status
                },
              },
              inVerificationCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InVerification'] }, 1, 0], // Count 'InVerification' status
                },
              },
              closedCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0], // Count 'Closed' status
                },
              },
              cancelledCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Cancel'] }, 1, 0], // Count 'Cancelled' status
                },
              },
              droppedCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0], // Count 'Dropped' status
                },
              },
              editCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Edit'] }, 1, 0], // Count 'Cancelled' status
                },
              },
              draftIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Draft'] }, '$_id', null], // Push IDs for 'Draft' status
                },
              },
              inReviewIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'InReview'] }, '$_id', null], // Push IDs for 'InReview' status
                },
              },
              inApprovalIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'InApproval'] }, '$_id', null], // Push IDs for 'InApproval' status
                },
              },
              approvedIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Approved'] }, '$_id', null], // Push IDs for 'Approved' status
                },
              },
              inProgressIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'InProgress'] }, '$_id', null], // Push IDs for 'InProgress' status
                },
              },
              completeIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Complete'] }, '$_id', null], // Push IDs for 'Complete' status
                },
              },
              inVerificationIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'InVerification'] }, '$_id', null], // Push IDs for 'InVerification' status
                },
              },
              closedIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Closed'] }, '$_id', null], // Push IDs for 'Closed' status
                },
              },
              cancelledIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Cancel'] }, '$_id', null], // Push IDs for 'Cancelled' status
                },
              },
              droppedIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Dropped'] }, '$_id', null], // Push IDs for 'Dropped' status
                },
              },
              editIds: {
                $push: {
                  $cond: [{ $eq: ['$status', 'Edit'] }, '$_id', null], // Push IDs for 'Dropped' status
                },
              },
            },
          },
          {
            $project: {
              _id: 0, // Exclude the _id field
              locationName: 1, // Include location name
              totalCount: 1, // Include total count
              draftCount: 1, // Include 'Draft' status count
              inReviewCount: 1, // Include 'InReview' status count
              inApprovalCount: 1, // Include 'InApproval' status count
              approvedCount: 1, // Include 'Approved' status count
              inProgressCount: 1, // Include 'InProgress' status count
              completeCount: 1, // Include 'Complete' status count
              inVerificationCount: 1, // Include 'InVerification' status count
              closedCount: 1, // Include 'Closed' status count
              cancelledCount: 1, // Include 'Cancelled' status count
              droppedCount: 1, // Include 'Dropped' status count
              editCount: 1,
              draftIds: {
                $filter: {
                  input: '$draftIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Draft' IDs
              inReviewIds: {
                $filter: {
                  input: '$inReviewIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InReview' IDs
              inApprovalIds: {
                $filter: {
                  input: '$inApprovalIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InApproval' IDs
              approvedIds: {
                $filter: {
                  input: '$approvedIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Approved' IDs
              inProgressIds: {
                $filter: {
                  input: '$inProgressIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InProgress' IDs
              completeIds: {
                $filter: {
                  input: '$completeIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Complete' IDs
              inVerificationIds: {
                $filter: {
                  input: '$inVerificationIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InVerification' IDs
              closedIds: {
                $filter: {
                  input: '$closedIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Closed' IDs
              cancelledIds: {
                $filter: {
                  input: '$cancelledIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Cancelled' IDs
              droppedIds: {
                $filter: {
                  input: '$droppedIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Dropped' IDs
              editIds: {
                $filter: {
                  input: '$editIds',
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              },
            },
          },
          {
            $sort: {
              cost: -1, // Sort by cost (descending order)
            },
          },
        ];
        statusPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
            },
          },
          {
            $group: {
              _id: {
                locationId: '$location.id',
                entityId: '$entity.id',
              },
              locationName: { $first: '$location.name' },
              entityName: { $first: '$entity.entityName' },
              totalCount: { $sum: 1 },
              draftCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0], // Count 'Draft' status
                },
              },
              inReviewCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InReview'] }, 1, 0], // Count 'InReview' status
                },
              },
              inApprovalCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InApproval'] }, 1, 0], // Count 'InApproval' status
                },
              },
              approvedCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0], // Count 'Approved' status
                },
              },
              inProgressCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0], // Count 'InProgress' status
                },
              },
              completeCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Complete'] }, 1, 0], // Count 'Complete' status
                },
              },
              inVerificationCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'InVerification'] }, 1, 0], // Count 'InVerification' status
                },
              },
              closedCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0], // Count 'Closed' status
                },
              },
              cancelledCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Cancel'] }, 1, 0], // Count 'Cancelled' status
                },
              },
              droppedCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0], // Count 'Dropped' status
                },
              },
              editCount: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'Edit'] }, 1, 0], // Count 'Dropped' status
                },
              },
              draftIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Draft'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Draft' status
                },
              },
              inReviewIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'InReview'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'InReview' status
                },
              },
              inApprovalIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'InApproval'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'InApproval' status
                },
              },
              approvedIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Approved'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Approved' status
                },
              },
              inProgressIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'InProgress'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'InProgress' status
                },
              },
              completeIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Complete'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Complete' status
                },
              },
              inVerificationIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'InVerification'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'InVerification' status
                },
              },
              closedIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Closed'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Closed' status
                },
              },
              cancelledIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Cancel'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Cancelled' status
                },
              },
              droppedIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Dropped'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Dropped' status
                },
              },
              editIds: {
                $push: {
                  $cond: [
                    { $eq: ['$status', 'Edit'] },
                    { $ifNull: ['$_id', null] },
                    null,
                  ], // Push IDs for 'Dropped' status
                },
              },
            },
          },
          {
            $group: {
              _id: '$_id.locationId', // Group by location id
              locationName: { $first: '$locationName' }, // Get the location name
              totalCount: { $sum: '$totalCount' }, // Total number of documents per location
              draftCount: { $sum: '$draftCount' },
              inReviewCount: { $sum: '$inReviewCount' },
              inApprovalCount: { $sum: '$inApprovalCount' },
              approvedCount: { $sum: '$approvedCount' },
              inProgressCount: { $sum: '$inProgressCount' },
              completeCount: { $sum: '$completeCount' },
              inVerificationCount: { $sum: '$inVerificationCount' },
              closedCount: { $sum: '$closedCount' },
              cancelledCount: { $sum: '$cancelledCount' },
              droppedCount: { $sum: '$droppedCount' },
              editCount: { $sum: '$editCount' },
              draftIds: { $push: '$draftIds' },
              inReviewIds: { $push: '$inReviewIds' },
              inApprovalIds: { $push: '$inApprovalIds' },
              approvedIds: { $push: '$approvedIds' },
              inProgressIds: { $push: '$inProgressIds' },
              completeIds: { $push: '$completeIds' },
              inVerificationIds: { $push: '$inVerificationIds' },
              closedIds: { $push: '$closedIds' },
              cancelledIds: { $push: '$cancelledIds' },
              droppedIds: { $push: '$droppedIds' },
              editIds: { $push: '$editIds' },
              entities: {
                $push: {
                  entityId: '$_id.entityId',
                  entityName: '$entityName',
                  totalCount: '$totalCount',
                  draftCount: '$draftCount',
                  inReviewCount: '$inReviewCount',
                  inApprovalCount: '$inApprovalCount',
                  approvedCount: '$approvedCount',
                  inProgressCount: '$inProgressCount',
                  completeCount: '$completeCount',
                  inVerificationCount: '$inVerificationCount',
                  closedCount: '$closedCount',
                  cancelledCount: '$cancelledCount',
                  droppedCount: '$droppedCount',
                  editCount: '$editCount',
                  draftIds: {
                    $filter: {
                      input: '$draftIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  inReviewIds: {
                    $filter: {
                      input: '$inReviewIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  inApprovalIds: {
                    $filter: {
                      input: '$inApprovalIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  approvedIds: {
                    $filter: {
                      input: '$approvedIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  inProgressIds: {
                    $filter: {
                      input: '$inProgressIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  completeIds: {
                    $filter: {
                      input: '$completeIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  inVerificationIds: {
                    $filter: {
                      input: '$inVerificationIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  closedIds: {
                    $filter: {
                      input: '$closedIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  cancelledIds: {
                    $filter: {
                      input: '$cancelledIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  droppedIds: {
                    $filter: {
                      input: '$droppedIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                  editIds: {
                    $filter: {
                      input: '$editIds',
                      as: 'id',
                      cond: { $ne: ['$$id', null] },
                    },
                  },
                },
              },
            },
          },
          {
            $project: {
              _id: 0, // Exclude the _id field
              locationName: 1, // Include location name
              entities: 1,
              totalCount: 1, // Include total count
              draftCount: 1, // Include 'Draft' status count
              inReviewCount: 1, // Include 'InReview' status count
              inApprovalCount: 1, // Include 'InApproval' status count
              approvedCount: 1, // Include 'Approved' status count
              inProgressCount: 1, // Include 'InProgress' status count
              completeCount: 1, // Include 'Complete' status count
              inVerificationCount: 1, // Include 'InVerification' status count
              closedCount: 1, // Include 'Closed' status count
              cancelledCount: 1, // Include 'Cancelled' status count
              droppedCount: 1, // Include 'Dropped' status count
              editCount: 1,
              draftIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$draftIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Draft' IDs
              inReviewIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$inReviewIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InReview' IDs
              inApprovalIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$inApprovalIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InApproval' IDs
              approvedIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$approvedIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Approved' IDs
              inProgressIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$inProgressIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InProgress' IDs
              completeIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$completeIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Complete' IDs
              inVerificationIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$inVerificationIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'InVerification' IDs
              closedIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$closedIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Closed' IDs
              cancelledIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$cancelledIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Cancelled' IDs
              droppedIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$droppedIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              }, // Filter out nulls for 'Dropped' IDs
              editIds: {
                $filter: {
                  input: {
                    $reduce: {
                      input: {
                        $map: {
                          input: '$editIds',
                          as: 'arr',
                          in: {
                            $cond: [{ $isArray: '$$arr' }, '$$arr', ['$$arr']],
                          },
                        },
                      },
                      initialValue: [],
                      in: { $concatArrays: ['$$value', '$$this'] },
                    },
                  },
                  as: 'id',
                  cond: { $ne: ['$$id', null] },
                },
              },
              completionPercentage: {
                $cond: {
                  if: { $eq: ['$totalCount', 0] }, // Avoid division by zero
                  then: 0,
                  else: {
                    $multiply: [
                      { $divide: ['$approvedCount', '$totalCount'] },
                      100,
                    ],
                  }, // Calculate completion percentage
                },
              },
            },
          },
          {
            $sort: {
              locationName: 1, // Sort by location name
            },
          },
        ];
        attachmentPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
            },
          },
          {
            $project: {
              totalFiles: { $size: { $ifNull: ['$files', []] } },
            },
          },
          {
            $group: {
              _id: null,
              totalFilesCount: { $sum: '$totalFiles' },
            },
          },
        ];
      } else {
        highCostPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
              ...(location &&
                !location.includes('All') && {
                  'location.id': { $in: location },
                }),
              ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
            },
          },
          {
            $sort: {
              cost: -1,
            },
          },
          {
            $limit: 5,
          },
          {
            $project: {
              _id: 0,
              id: '$_id',
              cost: 1,
              title: '$title',
            },
          },
        ];
        statusPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
              ...(location &&
                location !== 'All' && { 'location.id': { $in: location } }), // Filter by location
              ...(entity && entity !== 'All' && { 'entity.id': entity }), // Filter by entity if needed
            },
          },
          {
            $group: {
              _id: '$status', // Group by the original status field
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0, // Remove the _id field
              status: '$_id', // Retain the status as it is
              count: 1,
            },
          },
        ];

        attachmentPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
              ...(location &&
                !location.includes('All') && {
                  'location.id': { $in: location },
                }),
              ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
            },
          },
          {
            $project: {
              totalFiles: { $size: { $ifNull: ['$files', []] } },
            },
          },
          {
            $group: {
              _id: null,
              totalFilesCount: { $sum: '$totalFiles' },
            },
          },
        ];

        statusAllLocPipeline = [
          {
            $match: {
              organizationId: activeUser.organizationId,
              ...(location &&
                location !== 'All' && { 'location.id': { $in: location } }), // Filter by location
            },
          },
          {
            $group: {
              _id: '$status', // Group by the original status field
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0, // Remove the _id field
              status: '$_id', // Retain the status as it is
              count: 1,
            },
          },
        ];

        const totalLoc = await this.CIPModel.aggregate(statusAllLocPipeline);
        myLocCount = totalLoc.reduce((sum, item) => sum + item.count, 0);
      }

      //commented out grouping logic for status like in approval/in review is grouped under same name in approval
      // const statusPipeline: any = [
      //   {
      //     $match: {
      //       organizationId: activeUser.organizationId,
      //       ...(location &&
      //         !location.includes('All') && { 'location.id': { $in: location } }),
      //       ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
      //     },
      //   },
      //   {
      //     $project: {
      //       status: {
      //         $cond: {
      //           if: {
      //             $in: ['$status', ['InProgress', 'Complete', 'InVerification']],
      //           },
      //           then: 'In Progress',
      //           else: {
      //             $cond: {
      //               if: { $in: ['$status', ['InReview', 'InApproval']] },
      //               then: 'In Approval',
      //               else: '$status',
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      //   {
      //     $group: {
      //       _id: '$status',
      //       count: { $sum: 1 },
      //     },
      //   },
      //   {
      //     $project: {
      //       _id: 0,
      //       status: '$_id',
      //       count: 1,
      //       id: 1,
      //     },
      //   },
      // ];

      let tableData;
      if (statusWise) {
        let statusQuery;
        // if (statusWise === 'In Progress') {
        //   statusQuery = {
        //     status: { $in: ['InProgress', 'Complete', 'InVerification'] },
        //   };
        // } else if (statusWise === 'In Approval') {
        //   statusQuery = {
        //     status: { $in: ['InReview', 'InApproval'] },
        //   };
        // } else {
        //   statusQuery = {
        //     status: statusWise,
        //   };
        // }
        statusQuery = {
          status: statusWise,
        };
        const statusTablePipeline: any = [
          {
            $match: {
              organizationId: activeUser.organizationId,
              ...(location &&
                !location.includes('All') && {
                  'location.id': { $in: location },
                }),
              ...(entity && entity !== 'All' && { 'entity.id': entity }), // Add entity filter to match if needed
              ...statusQuery, // Apply status filter
            },
          },
          // Uncomment these lines if pagination (skip and limit) is required
          // {
          //   $skip: page,
          // },
          // {
          //   $limit: limit,
          // },
        ];

        tableData = await this.CIPModel.aggregate(statusTablePipeline);
      }

      const highCostWiseData = await this.CIPModel.aggregate(highCostPipeline);
      const statusWiseData = await this.CIPModel.aggregate(statusPipeline);
      let totalAttachmentCount = await this.CIPModel.aggregate(
        attachmentPipeline,
      );
      totalAttachmentCount = totalAttachmentCount[0].totalFilesCount;
      const myDeptCount = statusWiseData.reduce(
        (sum, item) => sum + item.count,
        0,
      );
      this.logger.log(`GET GET /api/cip/chart data successful`, '');
      return {
        highCostWiseData,
        statusWiseData,
        tableData,
        myDeptCount,
        myLocCount,
        totalAttachmentCount,
      };
    } catch (error) {
      this.logger.error(`GET GET /api/cip/chart data failed`, '');
    }
  }
  async getCipDataForIds(user, randomNumber, query) {
    try {
      const cipIds = query.ids.map((id) => new ObjectId(id));
      const cips: any = await this.CIPModel.find({
        _id: { $in: cipIds },
      });
      this.logger.log(
        `trace id = ${randomNumber} GET api/cip/ getCipDataForIds/${query} successful`,
        'cip.controller.ts',
      );
      return cips;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET api/cip/getCipDataForIds failed for query ${query}`,
        'cip.controller.ts',
      );
    }
  }

  async getDeptwiseChartData(user, randomNumber, query) {
    try {
      const activeuser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: { organization: true },
      });

      //if locationId is All then dont add to the condition
      const locationIds =
        query.locationId && query.locationId !== 'All'
          ? query.locationId
          : [activeuser?.locationId];

      //if entityId is all then dont add to the condition
      const entityIdFilter =
        query.entityId && query.entityId !== 'All'
          ? { entityId: { in: query.entityId } }
          : {};

      const departments = await this.prisma.entity.findMany({
        where: {
          organizationId: activeuser.organizationId,
          locationId: { in: locationIds },
          deleted: false,
        },
      });

      const deptwiseCounts = await this.CIPModel.aggregate([
        {
          $match: {
            ...(query.locationId && query.locationId !== 'All'
              ? { 'location.id': { $in: query.locationId } }
              : {}),

            ...(entityIdFilter.entityId
              ? { 'entity.id': { $in: entityIdFilter.entityId.in } }
              : {}),
          },
        },
        {
          $group: {
            _id: '$entity.id', // Group by department (entityId)
            totalCount: { $sum: 1 }, //draft not included
            draftCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0], // Pending records (Open status)
              },
            },
            inReviewCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'InReview'] }, 1, 0], // Count 'InReview' status
              },
            },
            inApprovalCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'InApproval'] }, 1, 0], // Count 'InApproval' status
              },
            },
            approvedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0], // Count 'Approved' status
              },
            },
            inProgressCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'InProgress'] }, 1, 0], // Count 'InProgress' status
              },
            },
            completeCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Complete'] }, 1, 0], // Count 'Complete' status
              },
            },
            inVerificationCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'InVerification'] }, 1, 0], // Count 'InVerification' status
              },
            },
            closedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Closed'] }, 1, 0], // Count 'Closed' status
              },
            },
            cancelledCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Cancel'] }, 1, 0], // Count 'Cancelled' status
              },
            },
            droppedCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Dropped'] }, 1, 0], // Count 'Dropped' status
              },
            },
            editCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'Edit'] }, 1, 0], // Count 'Dropped' status
              },
            },
            draftIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Draft'] }, '$_id', null], // Push IDs for 'Draft' status
              },
            },
            inReviewIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'InReview'] }, '$_id', null], // Push IDs for 'InReview' status
              },
            },
            inApprovalIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'InApproval'] }, '$_id', null], // Push IDs for 'InApproval' status
              },
            },
            approvedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Approved'] }, '$_id', null], // Push IDs for 'Approved' status
              },
            },
            inProgressIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'InProgress'] }, '$_id', null], // Push IDs for 'InProgress' status
              },
            },
            completeIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Complete'] }, '$_id', null], // Push IDs for 'Complete' status
              },
            },
            inVerificationIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'InVerification'] }, '$_id', null], // Push IDs for 'InVerification' status
              },
            },
            closedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Closed'] }, '$_id', null], // Push IDs for 'Closed' status
              },
            },
            cancelledIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Cancel'] }, '$_id', null], // Push IDs for 'Cancelled' status
              },
            },
            droppedIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Dropped'] }, '$_id', null], // Push IDs for 'Dropped' status
              },
            },
            editIds: {
              $push: {
                $cond: [{ $eq: ['$status', 'Edit'] }, '$_id', null], // Push IDs for 'Dropped' status
              },
            },
          },
        },
        {
          $project: {
            totalCount: {
              $add: [
                '$draftCount',
                '$inReviewCount',
                '$inApprovalCount',
                '$approvedCount',
                '$inProgressCount',
                '$completeCount',
                '$inVerificationCount',
                '$closedCount',
                '$cancelledCount',
                '$droppedCount',
                '$editCount',
              ],
            },
            draftCount: 1,
            inReviewCount: 1,
            inApprovalCount: 1,
            approvedCount: 1,
            inProgressCount: 1,
            completeCount: 1,
            inVerificationCount: 1,
            closedCount: 1,
            cancelledCount: 1,
            droppedCount: 1,
            editCount: 1,
            draftIds: {
              $filter: {
                input: '$draftIds',
                as: 'id',
                cond: { $ne: ['$$id', null] }, //remove null
              },
            },
            inReviewIds: {
              $filter: {
                input: '$inReviewIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            inApprovalIds: {
              $filter: {
                input: '$inApprovalIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            approvedIds: {
              $filter: {
                input: '$approvedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            inProgressIds: {
              $filter: {
                input: '$inProgressIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            completeIds: {
              $filter: {
                input: '$completeIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            inVerificationIds: {
              $filter: {
                input: '$inVerificationIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            closedIds: {
              $filter: {
                input: '$closedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            cancelledIds: {
              $filter: {
                input: '$cancelledIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            droppedIds: {
              $filter: {
                input: '$droppedIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
            editIds: {
              $filter: {
                input: '$editIds',
                as: 'id',
                cond: { $ne: ['$$id', null] },
              },
            },
          },
        },
      ]);

      // map function to get dept names and sort them alphabetically case insensitive
      const deptwiseData = deptwiseCounts
        .map((dept) => {
          const department = departments.find(
            (entity) => entity.id === dept._id,
          );
          const departmentName = department
            ? department.entityName
            : 'Department not found';

          return {
            deptName: departmentName,
            totalCount: dept.totalCount,
            draftCount: dept.draftCount,
            inReviewCount: dept.inReviewCount,
            inApprovalCount: dept.inApprovalCount,
            approvedCount: dept.approvedCount,
            inProgressCount: dept.inProgressCount,
            completeCount: dept.completeCount,
            inVerificationCount: dept.inVerificationCount,
            closedCount: dept.closedCount,
            cancelledCount: dept.cancelledCount,
            droppedCount: dept.droppedCount,
            editCount: dept.editCount,
            draftIds: dept.draftIds,
            inReviewIds: dept.inReviewIds,
            inApprovalIds: dept.inApprovalIds,
            approvedIds: dept.approvedIds,
            inProgressIds: dept.inProgressIds,
            completeIds: dept.completeIds,
            inVerificationIds: dept.inVerificationIds,
            closedIds: dept.closedIds,
            cancelledIds: dept.cancelledIds,
            droppedIds: dept.droppedIds,
            editIds: dept.editIds,
          };
        })
        // Sort department names alphabetically, case insensitive
        .sort((a, b) =>
          a.deptName.toLowerCase().localeCompare(b.deptName.toLowerCase()),
        );

      this.logger.log(
        `trace id = ${randomNumber} GET api/cip/getDeptwiseChartData successful`,
        '',
      );

      return {
        deptwiseData,
      };
    } catch (error) {
      this.logger.log(
        `trace id = ${randomNumber} GET api/cip/getDeptwiseChartData failed ${error}`,
        '',
      );
      throw error;
    }
  }

  async createCIPTeam(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Creating CIP Team`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const teamExist = await this.CIPTeamModel.findOne({
        location: activeUser.locationId,
        $or: [
          { teamName: { $regex: new RegExp(`^${data.teamName}$`, 'i') } },
          //{ teamNo: { $regex: new RegExp(`^${data.teamNo}$`, 'i') } },
        ],
      });
      if (teamExist) {
        const location = await this.prisma.location.findFirst({
          where: {
            id: teamExist.location,
            organizationId: teamExist.organizationId,
          },
        });
        throw new HttpException(
          {
            message: `GRT Team already exists for ${location.locationName} location`,
          },
          HttpStatus.CONFLICT,
        );
      }
      const cipTeamData = {
        ...data,
        location: activeUser.locationId,
        organizationId: activeUser.organizationId,
      };
      await this.CIPTeamModel.create(cipTeamData);
      const getCipTeams = await this.getAllCIPTeams(
        user.user.id,
        { page: 1, limit: 10 },
        randomNumber,
      );
      this.logger.log(
        `trace id = ${randomNumber} CIP Team Created Successfully`,
        'cip.service.ts',
      );
      return {
        response: getCipTeams,
        message: 'GRT Team Created Successfully',
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating CIP Team Failed`,
        'cip.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to create GRT Team. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllCIPTeams(userId, data, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting All CIP Team`,
      'cip.service.ts',
    );
    try {
      const { page, limit, cipCreate } = data;

      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
        select: {
          organizationId: true,
          locationId: true,
          roleId: true,
        },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
      };

      if (!cipCreate) {
        const mcoe = await this.prisma.role.findFirst({
          where: {
            organizationId: activeUser.organizationId,
            roleName: 'ORG-ADMIN',
          },
          select: {
            id: true,
          },
        });

        if (!activeUser.roleId.includes(mcoe.id)) {
          whereCondition = {
            ...whereCondition,
            location: activeUser.locationId,
          };
        }
      } else {
        whereCondition = {
          ...whereCondition,
          location: activeUser.locationId,
        };
      }

      const getAllCIPTeams = await this.CIPTeamModel.find(whereCondition)
        .select('teamName location')
        .sort({ teamName: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec();

      // Extract unique location IDs
      const uniqueLocationIds = [
        ...new Set(getAllCIPTeams.map((team) => team.location)),
      ];

      // Fetch all locations in a single query
      const locations = await this.prisma.location.findMany({
        where: {
          organizationId: activeUser.organizationId,
          id: { in: uniqueLocationIds },
        },
        select: {
          id: true,
          locationName: true,
        },
      });

      // Create a map of location IDs to location names
      const locationMap = locations.reduce((acc, loc) => {
        acc[loc.id] = loc.locationName;
        return acc;
      }, {});

      // Map location names to teams
      const updatedCIPTeams = getAllCIPTeams.map((team) => ({
        ...team,
        locationName: locationMap[team.location] || null,
      }));

      let total = await this.CIPTeamModel.count(whereCondition);

      this.logger.log(
        `trace id = ${randomNumber} Getting All CIP Team Successful`,
        'cip.service.ts',
      );

      return {
        data: updatedCIPTeams,
        total: total,
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting All CIP Team Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async getCIPTeamById(id, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Getting CIP Team of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const getCIPTeam = this.CIPTeamModel.findById({
        _id: id,
      }).select('teamName options');
      this.logger.log(
        `trace id = ${randomNumber} Getting CIP Team of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return getCIPTeam;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Getting CIP Team of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new NotFoundException(error);
    }
  }

  async updateCIPTeam(id, data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Updating CIP Team of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      const teamExist = await this.CIPTeamModel.findOne({
        $and: [
          { location: activeUser.locationId },
          { _id: { $ne: id } },
          {
            $or: [
              { teamName: { $regex: new RegExp(`^${data.teamName}$`, 'i') } },
              //{ teamNo: { $regex: new RegExp(`^${data.teamNo}$`, 'i') } },
            ],
          },
        ],
      });
      if (teamExist) {
        const location = await this.prisma.location.findFirst({
          where: {
            id: teamExist.location,
            organizationId: teamExist.organizationId,
          },
        });
        throw new HttpException(
          {
            message: `GRT Team already exists for ${location.locationName} location`,
          },
          HttpStatus.CONFLICT,
        );
      }

      await this.CIPTeamModel.findByIdAndUpdate(id, data);
      const getCipTeams = await this.getAllCIPTeams(
        user.user.id,
        { page: 1, limit: 10 },
        randomNumber,
      );
      this.logger.log(
        `trace id = ${randomNumber} Updating CIP Team of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return {
        response: getCipTeams,
        message: 'GRT Team Updated Successfully',
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating CIP Team of ID : ${id} Failed`,
        'cip.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to update GRT Team. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteCIPTeam(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} Deleting CIP Team of ID : ${id}`,
      'cip.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });
      await this.CIPTeamModel.findOneAndDelete({
        _id: id,
        organizationId: activeUser.organizationId,
      });
      const getCipTeams = await this.getAllCIPTeams(
        user.user.id,
        { page: 1, limit: 10 },
        randomNumber,
      );
      this.logger.log(
        `trace id = ${randomNumber} Deleting CIP Team of ID : ${id} Successful`,
        'cip.service.ts',
      );
      return {
        response: getCipTeams,
        message: 'GRT Team Deleted Successfully',
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting CIP Team of ID : ${id} Failed`,
        'cip.service.ts',
      );
      throw new HttpException(
        {
          message: 'Failed to delete GRT Team. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
