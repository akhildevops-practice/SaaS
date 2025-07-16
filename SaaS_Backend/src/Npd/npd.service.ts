import { query } from 'express';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma.service';
import { NpdGanttChart } from './schema/ganttChart.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Inject, InternalServerErrorException } from '@nestjs/common';
import { retry } from 'rxjs';
import { NpdRegister } from './schema/registerNpd.schema';
import { ObjectId } from 'bson';
import { npdConfig } from 'src/configuration/schema/departmentActivity.schema';
import { addDepartmentGantt } from './schema/addDepartmentGantt';
import { MinutesOfMeeting } from './schema/minutesOfMeeting.schema';
import { DiscussionItem } from './schema/discussionItem.schema';
import { ActionPlan } from './schema/actionPlan.schema';
import { DelayedItem } from './schema/delayedItem.schema';
import { DelayedItemActionPlan } from './schema/delayedItemActionPlanes.Schema';
import { RiskPrediction } from './schema/riskPrediction.schema';
import { RiskPredictionActionPlan } from './schema/riskPredictionActionPlanes.schema';
import { Configuration } from 'src/configuration/schema/configuration.schema';
import { createdBy } from 'src/utils/helper';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { Logger } from 'winston';
import { SvarGantt } from './schema/SvarGantt.schema';

export class NPDService {
  constructor(
    @InjectModel(NpdGanttChart.name)
    private NpdGanttChartModule: Model<NpdGanttChart>,
    @InjectModel(NpdRegister.name)
    private npdModule: Model<NpdRegister>,
    @InjectModel(npdConfig.name)
    private npdConfigModule: Model<npdConfig>,
    @InjectModel(Configuration.name)
    private configModule: Model<Configuration>,
    @InjectModel(addDepartmentGantt.name)
    private addDepartmentGanttModule: Model<addDepartmentGantt>,
    @InjectModel(MinutesOfMeeting.name)
    private MinutesOfMeetingModule: Model<MinutesOfMeeting>,
    @InjectModel(DiscussionItem.name)
    private DiscussionItemModule: Model<DiscussionItem>,
    @InjectModel(ActionPlan.name)
    private ActionPlanModule: Model<ActionPlan>,
    @InjectModel(DelayedItem.name)
    private DelayedItemModule: Model<DelayedItem>,
    @InjectModel(SvarGantt.name)
    private svarGanttModel: Model<SvarGantt>,
    @InjectModel(DelayedItemActionPlan.name)
    private DelayedItemActionPlanModule: Model<DelayedItemActionPlan>,
    @InjectModel(RiskPrediction.name)
    private RiskPredictionModule: Model<RiskPrediction>,
    @InjectModel(RiskPredictionActionPlan.name)
    private RiskPredictionActionPlanModule: Model<RiskPredictionActionPlan>,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly serialNumberService: SerialNumberService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async createGanttChart(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      console.log('data', data.isInformToPic);
      const createData = await this.NpdGanttChartModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createManyGanttChart(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const pa = await this.configModule.find({
        organizationId: activeUser.organizationId,
      });

      const createData: any = await this.addDepartmentGanttModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      const todayDate = new Date().toISOString().split('T')[0];
      let taskArray = [];
      const TaskData = {
        TaskId: `${createData?._id.toString()}-${createData?.npdId}-${
          createData?.stakeHolder?.value
        }`,
        TaskName: createData?.department.label,
        StartDate: null,
        EndDate: null,
        TimeLog: 0,
        Assignee: createData?.pic,
        Work: 0,
        Progress: 0,
        Status: '',
        Priority: '',
        type: 'department',
        BaselineStartDate: '',
        BaselineEndDate: '',
        evidence: [],
        isSelection: false,
        remarks: [],
        progressData: [],
        npdId: createData?.npdId,
        picId: createData?.pic?.map((ele: any) => ele.id),
        dptId: createData?.department.value,
        ParentId: `${createData?.stakeHolder?.value}-${createData?.npdId}`,
        Component: createData?.stakeHolder?.label,
        category: createData?.category,
        stakeHolderId: createData?.stakeHolder?.value,
        stakeHolderName: createData?.stakeHolder?.label,
        organizationId: activeUser.organizationId,
        isDraggable: false,
        pm: pa[0].pm,
      };
      const mainTask = createData?.departmentData?.map((item: any) => {
        let taskOne = {
          TaskId: `${item.id}-${createData?.npdId}-${createData?.stakeHolder?.value}`,
          TaskName: item.activity,
          StartDate: null,
          EndDate: null,
          TimeLog: 0,
          Work: 0,
          Progress: 0,
          Status: '',
          ParentId: TaskData?.TaskId,
          Priority: '',
          Component: TaskData?.TaskName,
          type: 'activity',
          progressData: [],
          BaselineStartDate: '',
          BaselineEndDate: '',
          evidence: item.evidence,
          isSelection: false,
          remarks: [],
          npdId: createData?.npdId,
          picId: TaskData?.picId,
          dptId: TaskData?.dptId,
          category: createData?.category,
          stakeHolderId: createData?.stakeHolder?.value,
          stakeHolderName: createData?.stakeHolder?.label,
          organizationId: activeUser.organizationId,
          isDraggable: true,
          pm: pa[0].pm,
        };
        const subTaskMap = item.subtask?.map((ele: any) => {
          let data = {
            TaskId: `${ele.id}-${createData?.npdId}-${createData?.stakeHolder?.value}`,
            TaskName: ele.taskName,
            StartDate: null,
            EndDate: null,
            TimeLog: 0,
            Work: 0,
            Progress: 0,
            Status: '',
            ParentId: taskOne.TaskId,
            Priority: '',
            Component: taskOne.TaskName,
            type: 'sub activity',
            BaselineStartDate: '',
            BaselineEndDate: '',
            evidence: [],
            isSelection: false,
            remarks: [],
            progressData: [],
            npdId: createData?.npdId,
            picId: taskOne.picId,
            dptId: taskOne.dptId,
            category: createData?.category,
            stakeHolderId: createData?.stakeHolder?.value,
            stakeHolderName: createData?.stakeHolder?.label,
            organizationId: activeUser.organizationId,
            isDraggable: true,
            pm: pa[0].pm,
          };
          return data;
        });
        taskArray.push(taskOne);
        taskArray.push(...subTaskMap);
      });
      taskArray.push(TaskData);
      const createDataNpd = await this.NpdGanttChartModule.insertMany(
        taskArray,
      );
      return createDataNpd;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateGanttChart(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;

      const status = await this.handlerGanttTaskStatus(data);
      // console.log('status', status);
      const createData = await this.NpdGanttChartModule.findByIdAndUpdate(id, {
        ...data,
        Status: status,
        organizationId: activeUser.organizationId,
      });

      // Task Status Update //

      const whereCondition = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: createData?.npdId,
        Status: { $ne: '' },
      };
      const tasks = await this.NpdGanttChartModule.find(whereCondition);
      const allCompleted = tasks.every((task) => task.Status === 'Completed');
      const anyInProgressOrCompleted = tasks.some(
        (task) => task.Status === 'In Progress' || task.Status === 'Completed',
      );
      const allNotStarted = tasks.every(
        (task) => !task.Status || task.Status === '',
      );
      let overallStatus = 'Registered';
      if (allNotStarted) {
        overallStatus = 'Registered';
      } else if (allCompleted) {
        overallStatus = 'Completed';
      } else if (anyInProgressOrCompleted) {
        overallStatus = 'In Progress';
      }
      const findByUpdate = await this.npdModule.findByIdAndUpdate(
        createData?.npdId,
        {
          status: overallStatus,
        },
      );

      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async handlerGanttTaskStatus(data: any) {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(data.EndDate).toISOString().split('T')[0];
      const baselineStartDate = data.BaselineStartDate
        ? new Date(data.BaselineStartDate).toISOString().split('T')[0]
        : null;
      const baselineEndDate = data.BaselineEndDate
        ? new Date(data.BaselineEndDate).toISOString().split('T')[0]
        : null;
      let Status = data.Status;

      if (
        data.Status !== 'Completed' &&
        (data?.type === 'sub activity' || data?.type === 'activity') &&
        (endDate < todayDate ||
          (baselineStartDate && baselineStartDate > endDate) ||
          (baselineEndDate && baselineEndDate > endDate))
      ) {
        Status = 'Delayed';
      }

      return Status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async handlerSvarGanttTaskStatus(data: any) {
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const endDate = data?.taskDetails?.end
        ? new Date(data?.taskDetails?.end).toISOString().split('T')[0]
        : undefined;
      const baselineStartDate = data.taskDetails?.baseStart
        ? new Date(data.taskDetails?.baseStart).toISOString().split('T')[0]
        : null;
      const baselineEndDate = data.taskDetails?.baseEnd
        ? new Date(data.taskDetails?.baseEnd).toISOString().split('T')[0]
        : null;
      let Status = data.taskDetails?.status;
      // console.log('data', data);
      if (
        data.Status !== 'Completed' &&
        (data?.taskDetails?.type === 'urgent' ||
          data?.taskDetails?.type === 'progress') &&
        baselineEndDate &&
        baselineEndDate < todayDate &&
        endDate === undefined
      ) {
        // console.log('inside if');
        Status = 'Delayed';
      }
      // if (Status === 'In Progress' && Array.isArray(data.taskDetails?.progressdata)) {
      //   const progressData = data.taskDetails.progressdata;

      //   // Assuming each entry has an `updatedDate` or similar
      //   const latestProgressDate = progressData
      //     .map((entry: any) => new Date(entry.updatedDate)) // adjust key as needed
      //     .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];

      //   if (latestProgressDate && data.taskDetails?.baseEnd) {
      //     const baseEndDate = new Date(data.taskDetails.baseEnd);
      //     const delayMs = latestProgressDate.getTime() - baseEndDate.getTime();
      //     const delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24));

      //     if (delayDays > 0) {
      //       console.log(`Task is delayed by ${delayDays} days`);
      //       Status = 'Delayed';
      //     }
      //   }
      // }
      return Status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async checkEvidenceValidation(userId, npdId, id, objId, taskId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: true },
      });
      let Status = false;
      const filterObjectFind = await this.NpdGanttChartModule.findById(taskId);
      const filterObjectByParentTask = await this.NpdGanttChartModule.findOne({
        organizationId: activeUser?.organizationId,
        npdId: npdId,
        TaskId: id,
      });
      const result = await this.NpdGanttChartModule.find({
        organizationId: activeUser?.organizationId,
        npdId: npdId,
        ParentId: id,
      });
      const filterObject = result?.filter((obj) => obj.TaskId !== objId);
      if (
        filterObjectFind?.type === 'activity' &&
        (!filterObjectFind?.evidence?.length ||
          filterObjectFind?.evidence.some(
            (ele: any) =>
              !ele?.evidenceAttachment || ele?.evidenceAttachment?.length === 0,
          ))
      ) {
        Status = true;
      } else if (
        filterObjectByParentTask?.evidence?.length === 0 ||
        filterObjectByParentTask?.evidence?.some(
          (ele: any) =>
            !ele?.evidenceAttachment || ele?.evidenceAttachment?.length === 0,
        )
      ) {
        const allProgressComplete = filterObject?.every(
          (obj) => Number(obj.Progress) === 100,
        );
        Status = allProgressComplete;
      }
      // console.log('Status', Status);
      return Status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateManyGanttCharts(userId, data: any) {
    try {
      const { dptId, picId } = data;
      const arrayOfStrings = picId.split(',');
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.NpdGanttChartModule.updateMany(
        { dptId: dptId },
        { $set: { picId: arrayOfStrings } },
      );
      return 'Successfully';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateManyGanttChartsFreeze(userId, data: any) {
    try {
      const { npdId } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      let status;
      const findFreeze = await this.NpdGanttChartModule.find({
        npdId: npdId,
        planFreeze: true,
      });
      if (findFreeze?.length === 0) {
        const createData = await this.NpdGanttChartModule.updateMany(
          { npdId: npdId },
          { $set: { planFreeze: true } },
        );
        status = ' Plan freezed Successfully';
        try {
          await this.sendMailOnFreeze(npdId, activeUser?.username);
        } catch (error) {
          console.log(error);
        }
      } else {
        const createData = await this.NpdGanttChartModule.updateMany(
          { npdId: npdId },
          { $set: { planFreeze: false } },
        );
        status = ' Plans Unfreezes Successfully';
      }
      return status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async freezeButtonStatus(userId, data: any) {
    try {
      const { npdId } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      let status;
      const findFreeze = await this.NpdGanttChartModule.find({
        npdId: npdId,
        $or: [{ StartDate: null }, { EndDate: null }],
        type: { $in: ['activity', 'sub activity'] },
      });
      if (findFreeze?.length > 0) {
        status = true;
      } else {
        status = false;
      }
      return status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async informToPicButtonStatus(userId, data: any) {
    try {
      const { npdId } = data;
      // Find the active user
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      // Fetch all tasks related to the given npdId
      const allTasks = await this.NpdGanttChartModule.find({
        organizationId: activeUser?.organizationId,
        deletedAt: false,
        npdId: npdId,
      });
      // console.log('allTasks', allTasks);
      // Extract unique categories from the tasks
      const uniqueCategories = [
        ...new Set(
          allTasks
            .map((task: any) => task.category)
            .filter((category: any) => category !== undefined), // Remove undefined
        ),
      ];
      // console.log('uniquecategories', uniqueCategories);
      // Check if each category has at least one milestone
      const status = uniqueCategories.every((category) => {
        return allTasks.some(
          (task: any) =>
            task.category === category && task.isMileStone === true,
        );
      });
      // console.log('status', status);
      return status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateManyGanttChartsInformToPic(userId, data: any) {
    try {
      const { npdId } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      let status;
      const findFreeze = await this.NpdGanttChartModule.find({
        organizationId: activeUser?.organizationId,
        deletedAt: false,
        npdId: npdId,
        isInformToPic: true,
      });
      if (findFreeze?.length === 0) {
        const createData = await this.NpdGanttChartModule.updateMany(
          { npdId: npdId },
          { $set: { isInformToPic: true } },
        );
        status = 'Data Updated Successfully';
        await this.sendMailOnInformToPic(data.npdId);
      }
      return status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateManyGanttChartsDrop(userId, data: any) {
    try {
      const { id, payload } = data;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.NpdGanttChartModule.updateMany(
        { _id: { $in: id } },
        { $set: payload },
      );
      return 'Successfully';
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllGanttChart(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
      };

      const result = await this.NpdGanttChartModule.find(whereCondition);

      return { data: result };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteGanttChart(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const finalResult = await this.NpdGanttChartModule.findById(id);
      if (finalResult.type === 'sub activity') {
        const subData = await this.NpdGanttChartModule.find({
          ParentId: finalResult.TaskId,
        });
        if (subData?.length > 0) {
          await this.NpdGanttChartModule.deleteMany({
            ParentId: finalResult.TaskId,
          });
        }
        await this.NpdGanttChartModule.findByIdAndDelete(id);
      } else if (finalResult.type === 'activity') {
        const activityData = await this.NpdGanttChartModule.find({
          ParentId: finalResult.TaskId,
        });
        if (activityData?.length > 0) {
          await this.NpdGanttChartModule.deleteMany({
            ParentId: finalResult.TaskId,
          });
        }
        await this.NpdGanttChartModule.findByIdAndDelete(id);
      } else if (finalResult.type === 'department') {
        const activityData = await this.NpdGanttChartModule.find({
          ParentId: finalResult.TaskId,
        });
        if (activityData?.length > 0) {
          await this.NpdGanttChartModule.deleteMany({
            ParentId: finalResult.TaskId,
          });
        }
        await this.NpdGanttChartModule.findByIdAndDelete(id);
      } else if (finalResult.type === 'Category') {
        const CategoryData = await this.NpdGanttChartModule.find({
          ParentId: finalResult.TaskId,
          npdId: finalResult.npdId,
        });
        for (let i = 0; i < CategoryData?.length; i++) {
          const itemData = CategoryData[i];
          if (itemData.type === 'department') {
            const activityData = await this.NpdGanttChartModule.find({
              ParentId: itemData.TaskId,
              npdId: itemData.npdId,
              stakeHolderId: itemData.stakeHolderId,
            });
            await this.NpdGanttChartModule.findByIdAndDelete(itemData?._id);
            if (activityData?.length > 0) {
              for (let i = 0; i < activityData?.length; i++) {
                const actData = activityData[i];
                const subActivityData = await this.NpdGanttChartModule.find({
                  ParentId: actData.TaskId,
                  npdId: actData.npdId,
                  stakeHolderId: actData.stakeHolderId,
                });
                await this.NpdGanttChartModule.findByIdAndDelete(actData?._id);
                if (activityData?.length > 0) {
                  for (let i = 0; i < subActivityData?.length; i++) {
                    const subData = subActivityData[i];
                    await this.NpdGanttChartModule.findByIdAndDelete(
                      subData?._id,
                    );
                  }
                }
              }
            }
            await this.NpdGanttChartModule.findByIdAndDelete(id);
          }
        }
      }
      return 'SuccessFully Deleted';
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdGanttChart(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const result = await this.NpdGanttChartModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getByNpdAndCategoryAndDeptGanttChart(
    userId,
    NpdId,
    categoryId,
    deptId,
  ) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const result = await this.NpdGanttChartModule.find({
        npdId: NpdId,
        ParentId: `${categoryId}-${NpdId}`,
        type: 'department',
        dptId: deptId,
      });
      const updateStatus = result?.length === 0 ? false : true;
      return updateStatus;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createNPD(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const pa = await this.configModule.find({
        organizationId: activeUser.organizationId,
      });

      const query = {
        moduleType: 'NPD',
        location: null,
        tid: null,
        createdBy: activeUser?.id,
        organizationId: activeUser?.organizationId,
      };
      const serialNumber =
        await this.serialNumberService.generateSerialNumberForNPD(query);

      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
      const day = String(currentDate.getDate()).padStart(2, '0');
      const year = currentDate.getFullYear();

      const createData = await this.npdModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
        projectName: data?.projectName?.trim().replace(/\s+/g, ' '),
        projectAdmins: pa[0].pm,
        model: data?.model,
        serialNumber: serialNumber,
      });
      if (data?.isDraft === false) {
        await this.convertSvarGanttData(createData, activeUser);
      }
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  //mail api to be called when an npd is registered not in draft state
  async sendMailOnRegister(id) {
    //get npd info
    const npd = await this.npdModule.findById(id);
    if (npd.isDraft === false) {
      //extract pic id from each department/activity/subactivity
      const picIds = npd.departmentData.reduce((acc, deptData: any) => {
        deptData.departments.forEach((department) => {
          acc.push(...department.pic); // Collecting all PIC IDs
        });
        return acc;
      }, []);
      //get their email
      const uniquePicIds = [...new Set(picIds)]; // Removing duplicate picids
      const emails = await this.getUserEmails(uniquePicIds);
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: npd.organizationId,
        },
      });
      //get customer data
      const customers = await this.prisma.entity.findMany({
        where: {
          id: { in: npd.customer }, // Find customers by the IDs stored in npd.customer array
        },
      });

      const customerNames = customers
        .map((customer) => customer.entityName)
        .join(', ');

      //get configuration data
      const config: any = await this.configModule.find({
        organizationId: npd.organizationId,
      });
      const npdRank = config[0].rankType;
      // console.log('npdRank', npdRank);
      const rankObj = npdRank.find((item) => item.id === npd.escRank);
      // console.log('rankobj', rankObj);

      const subject = `NPD ${npd?.projectName} has been successfully registered!`;
      // console.log('emails', emails);
      let link;
      if (process.env.REDIRECT.startsWith('localhost')) {
        link = `${process.env.PROTOCOL}://${organization?.realmName}.${process.env.REDIRECT}/NPDSteeper/${npd?._id}`;
      } else {
        link = `${process.env.PROTOCOL}://${process.env.REDIRECT}/NPDSteeper/${npd?._id}`;
      }
      const projectTypeLabel: any = npd.projectTypeData; // Use optional chaining to avoid errors if projectTypeData is undefined or null
      if (!projectTypeLabel) {
        console.log('Project Type Label is not defined or missing.');
      }
      const table = `
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th style="text-align: left;">NPD No.</th>
          <th style="text-align: left;">Project Type</th>
          <th style="text-align: left;">Project Name</th>
          <th style="text-align: left;">Customer</th>
          <th style="text-align: left;">ESC Rank</th>
          <th style="text-align: left;">ESC No.</th>
          <th style="text-align: left;">Link</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${npd._id}</td>
          <td>${projectTypeLabel.label}</td>
          <td>${npd.projectName}</td>
          <td>${customerNames}</td>
          <td>${rankObj?.rank}</td>
          <td>${npd.escNumber}</td>
          <td><a href="${link}" target="_blank">View NPD</a></td>
        </tr>
      </tbody>
    </table>
  `;

      const text = `
    <p>Dear San!,</p>
    <p>Following NPD has been registered:</p>
    ${table}
  `;

      const msg = {
        recipients: emails,
        from: process.env.FROM,
        subject: `${subject}`,
        text: '',
        html: `<div>${text}</div>`,
      };
      // console.log("emails",emails,text,table)
      try {
        const sendMail = await this.emailService.sendBulkEmails(
          emails,
          subject,
          '',
          text,
        );
        // console.log('sendmail', sendMail);
        if (sendMail) {
          console.log('mail sent');
        }
      } catch (error) {}
    }
  }
  //mail api to be called when an npd is registered not in draft state
  async sendMailOnInactive(id) {
    //get npd info
    const npd = await this.npdModule.findById(id);
    if (npd.isActive === false) {
      //extract pic id from each department/activity/subactivity
      const picIds = npd.departmentData.reduce((acc, deptData: any) => {
        deptData.departments.forEach((department) => {
          acc.push(...department.pic); // Collecting all PIC IDs
        });
        return acc;
      }, []);
      //get their email
      const uniquePicIds = [...new Set(picIds)]; // Removing duplicate picids
      const emails = await this.getUserEmails(uniquePicIds);
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: npd.organizationId,
        },
      });
      //get customer data
      const customers = await this.prisma.entity.findMany({
        where: {
          id: { in: npd.customer }, // Find customers by the IDs stored in npd.customer array
        },
      });

      const customerNames = customers
        .map((customer) => customer.entityName)
        .join(', ');

      //get configuration data
      const config: any = await this.configModule.find({
        organizationId: npd.organizationId,
      });
      const npdRank = config[0].rankType;
      // console.log('npdRank', npdRank);
      const rankObj = npdRank.find((item) => item.id === npd.escRank);
      // console.log('rankobj', rankObj);

      const subject = `NPD ${npd?.projectName} has been InActivated!`;
      // console.log('emails', emails);
      let link;
      if (process.env.REDIRECT.startsWith('localhost')) {
        link = `${process.env.PROTOCOL}://${organization?.realmName}.${process.env.REDIRECT}/NPDSteeper/${npd?._id}`;
      } else {
        link = `${process.env.PROTOCOL}://${process.env.REDIRECT}/NPDSteeper/${npd?._id}`;
      }
      const projectTypeLabel: any = npd.projectTypeData; // Use optional chaining to avoid errors if projectTypeData is undefined or null
      if (!projectTypeLabel) {
        console.log('Project Type Label is not defined or missing.');
      }
      const table = `
    <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
      <thead>
        <tr>
          <th style="text-align: left;">NPD No.</th>
          <th style="text-align: left;">Project Type</th>
          <th style="text-align: left;">Project Name</th>
          <th style="text-align: left;">Customer</th>
          <th style="text-align: left;">ESC Rank</th>
          <th style="text-align: left;">ESC No.</th>
          <th style="text-align: left;">Link</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${npd._id}</td>
          <td>${projectTypeLabel.label}</td>
          <td>${npd.projectName}</td>
          <td>${customerNames}</td>
          <td>${rankObj?.rank}</td>
          <td>${npd.escNumber}</td>
          <td><a href="${link}" target="_blank">View NPD</a></td>
        </tr>
      </tbody>
    </table>
  `;

      const text = `
    <p>Dear San!,</p>
    <p>Following NPD has been inactivated. For the following reason:${npd.inActivateReason}</p>
    ${table}
  `;

      const msg = {
        recipients: emails,
        from: process.env.FROM,
        subject: `${subject}`,
        text: '',
        html: `<div>${text}</div>`,
      };

      try {
        const sendMail = await this.emailService.sendBulkEmails(
          emails,
          subject,
          '',
          text,
        );
        // console.log('sendmail', sendMail);
        if (sendMail) {
          console.log('mail sent');
        }
      } catch (error) {}
    }
  }
  //mail to be called when an npd plan is freezed

  async sendMailOnFreeze(id, activeUser) {
    // Get NPD info
    const npd = await this.npdModule.findById(id);
    if (npd.isDraft === false) {
      // Extract PIC ids from each department/activity/subactivity
      const picIds = npd.departmentData.reduce((acc, deptData: any) => {
        deptData.departments.forEach((department) => {
          acc.push(...department.pic); // Collecting all PIC IDs
        });
        return acc;
      }, []);

      // Get their emails
      const uniquePicIds = [...new Set(picIds)]; // Removing duplicate pic ids
      const emails = await this.getUserEmails(uniquePicIds);

      // Get all department IDs
      const deptIds = npd.departmentData.reduce((acc, deptData: any) => {
        deptData.departments.forEach((department) => {
          acc.push(department?.department);
        });
        return acc;
      }, []);
      const uniqueDeptIds = [...new Set(deptIds)];
      // console.log('deptIds', deptIds);
      // Get organization info
      const organization = await this.prisma.organization.findFirst({
        where: {
          id: npd.organizationId,
        },
      });

      // Get department data
      const departments = await this.prisma.entity.findMany({
        where: {
          id: { in: uniqueDeptIds },
        },
      });
      // console.log('departments', departments);

      // Get target dates (EndDates) from npdGanttChart for each department
      const departmentTargetDates = await Promise.all(
        departments.map(async (dept) => {
          const ganttData = await this.NpdGanttChartModule.find({
            deptId: dept.id, // Filter by deptId
            npdId: npd._id, // Filter by the specific NPD ID
          });
          // console.log('ganttData', ganttData);
          // Create a list of departments with their respective target dates
          return ganttData.map((data) => ({
            department: dept.entityName,
            targetDate: data.EndDate,
          }));
        }),
      );

      const allDepartmentData = departmentTargetDates.flat();

      const tableRows = allDepartmentData
        .map((data) => {
          return `
          <tr>
            <td></td> <!-- Empty cell for NPD No. (merged) -->
            <td></td> <!-- Empty cell for Project Type (merged) -->
            <td></td> <!-- Empty cell for Project Name (merged) -->
            <td>${data.department}</td>
            <td>${data.targetDate}</td>
            <td><a href="${process.env.PROTOCOL}://${organization?.realmName}.${process.env.REDIRECT}/GanttIndex" target="_blank">View Gantt</a></td>
          </tr>
        `;
        })
        .join('');

      const subject = `NPD: Schedule for ${npd?.projectName} is finalized. Kindly complete the activities on time`;
      const projectTypeLabel: any = npd.projectTypeData; // Use optional chaining to avoid errors if projectTypeData is undefined or null
      if (!projectTypeLabel) {
        console.log('Project Type Label is not defined or missing.');
      }
      // Table structure with NPD info and multiple rows for departments
      const table = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
          <thead>
            <tr>
              <th rowspan="2" style="text-align: left;">NPD No.</th>
              <th rowspan="2" style="text-align: left;">Project Type</th>
              <th rowspan="2" style="text-align: left;">Project Name</th>
              <th colspan="3" style="text-align: left;">Departments & Target Dates</th>
            </tr>
            <tr>
              <th style="text-align: left;">Department</th>
              <th style="text-align: left;">Target Date of Completion</th>
              <th style="text-align: left;">Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="${allDepartmentData.length + 1}">${npd._id}</td>
              <td rowspan="${allDepartmentData.length + 1}">${
        projectTypeLabel?.label
      }</td>
              <td rowspan="${allDepartmentData.length + 1}">${
        npd.projectName
      }</td>
            </tr>
            ${tableRows}
          </tbody>
        </table>
      `;
      // console.log('table', table);
      // Construct email text body
      const text = `
        "Dear San!,
  
        Following NPD's schedule has been finalized by ${activeUser}.
        Please add activity updates for your department and complete activities on or before the target date of completion.
  
        "
        ${table}
      `;

      const msg = {
        recipients: emails,
        from: process.env.FROM,
        subject: subject,
        text: '',
        html: `<div>${text}</div>`,
      };

      try {
        const sendMail = await this.emailService.sendBulkEmails(
          emails,
          subject,
          '',
          text,
        );

        if (sendMail) {
          console.log('Mail sent successfully');
        }
      } catch (error) {
        console.error('Error sending mail:', error);
      }
    }
  }

  //mail api to send when a customer milestone as been added
  async sendMailOnInformToPic(id) {
    // Get npd info
    const npd = await this.npdModule.findById(id);

    // Extract pic id from each department/activity/subactivity
    const picIds = npd.departmentData.reduce((acc, deptData: any) => {
      deptData.departments.forEach((department) => {
        acc.push(...department.pic); // Collecting all PIC IDs
      });
      return acc;
    }, []);

    // Get their email
    const uniquePicIds = [...new Set(picIds)]; // Removing duplicate picids
    const emails = await this.getUserEmails(uniquePicIds);

    const organization = await this.prisma.organization.findFirst({
      where: { id: npd.organizationId },
    });

    // Get milestone info
    const milestones = await this.NpdGanttChartModule.find({
      npdId: id,
      isMileStone: true,
    });

    // console.log('milestones', milestones);

    const subject = `NPD ${npd?.projectName}: Kindly add plan start and end dates for your department activities!`;

    let link;
    if (process.env.REDIRECT.startsWith('localhost')) {
      link = `${process.env.PROTOCOL}://${organization?.realmName}.${process.env.REDIRECT}/NPDSteeper/${npd?._id}`;
    } else {
      link = `${process.env.PROTOCOL}://${process.env.REDIRECT}/NPDSteeper/${npd?._id}`;
    }

    const projectTypeLabel: any = npd.projectTypeData; // Use optional chaining to avoid errors if projectTypeData is undefined or null
    if (!projectTypeLabel) {
      console.log('Project Type Label is not defined or missing.');
    }

    let milestoneRows = '';
    const milestoneMap = {};

    milestones.forEach((milestone) => {
      const category = milestone.category || 'General'; // Use 'General' if category is missing
      if (!milestoneMap[category]) {
        milestoneMap[category] = [];
      }
      milestoneMap[category].push(milestone);
    });

    // Iterate over grouped milestones and create table rows
    Object.entries(milestoneMap).forEach(([category, categoryMilestones]) => {
      // Ensure categoryMilestones is an array
      if (!Array.isArray(categoryMilestones)) {
        console.error(
          'categoryMilestones is not an array:',
          categoryMilestones,
        );
        return;
      }

      let milestoneCells = '';

      categoryMilestones.forEach((milestone) => {
        // Ensure milestone properties exist before using them
        const milestoneName = milestone.TaskName || 'No Name';
        const milestoneDate: any = milestone.StartDate
          ? new Date(milestone.StartDate)
          : null;

        let formattedDate = 'No Date';
        if (milestoneDate && !isNaN(milestoneDate)) {
          const day = milestoneDate.getDate().toString().padStart(2, '0'); // Add leading zero if necessary
          const month = (milestoneDate.getMonth() + 1)
            .toString()
            .padStart(2, '0'); // Months are zero-based, so add 1
          const year = milestoneDate.getFullYear();

          formattedDate = `${day}/${month}/${year}`;
        }

        milestoneCells += `
                <td colspan="3" style="text-align: center;">${milestoneName}</td>
                <td>${formattedDate}</td>
            `;
      });

      milestoneRows += `
            <tr>
                <td rowspan="${categoryMilestones.length}">${category}</td>
                ${milestoneCells}
            </tr>
        `;
    });

    const table = `
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
            <thead>
                <tr>
                    <th style="text-align: left;">NPD No.</th>
                    <th style="text-align: left;">Project Type</th>
                    <th style="text-align: left;">Project Name</th>
                    <th style="text-align: left;">Milestone Name</th>
                    <th style="text-align: left;">Milestone Date</th>
                    <th style="text-align: left;">Link</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${npd._id}</td>
                    <td>${projectTypeLabel.label}</td>
                    <td>${npd.projectName}</td>
                    <td><a href="${link}" target="_blank">View NPD</a></td>
                </tr>
                ${milestoneRows}
            </tbody>
        </table>
    `;
    // console.log('table', table);
    const text = `
    <p>Dear San!,</p>
    <p>Following NPD has been registered:</p>
    ${table}
    `;

    const msg = {
      recipients: emails,
      from: process.env.FROM,
      subject: `${subject}`,
      text: '',
      html: `<div>${text}</div>`,
    };

    try {
      const sendMail = await this.emailService.sendBulkEmails(
        emails,
        subject,
        '',
        text,
      );
      if (sendMail) {
        console.log('mail sent');
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
  //mail api to send delayed items through mail
  async sendMailForDelayedItems() {
    try {
      const today = new Date();

      // Find delayed tasks
      const delayedTasks = await this.NpdGanttChartModule.find({
        Status: 'Delayed',
        EndDate: { $lt: today },
        Progress: { $lt: 100 },
      });

      // console.log('delayed tasks', delayedTasks);

      let picIds = [];
      const tableData = await Promise.all(
        delayedTasks.map(async (task: any) => {
          const npdDetails = await this.npdModule.findById(task.npdId);
          // console.log('npd details', npdDetails);

          const departmentName = await this.prisma.entity.findFirst({
            where: { id: task.dptId },
            select: { entityName: true },
          });
          // console.log('departmentData', departmentName);

          const delayDays: number = Math.ceil(
            (today.getTime() - new Date(task.EndDate).getTime()) /
              (1000 * 3600 * 24),
          );
          // console.log('delayDays', delayDays);

          // If picId is an array, push all of them into picIds
          if (Array.isArray(task.picId)) {
            picIds = [...picIds, ...task.picId];
          } else {
            picIds.push(task.picId);
          }

          let projectypename: any = npdDetails.projectTypeData;
          return {
            ProjectType: projectypename?.label,
            ProjectName: npdDetails.projectName,
            DepartmentName: departmentName.entityName,
            DelayedTaskName: task.TaskName,
            DelayByDays: delayDays,
            TargetDate: task.EndDate.toISOString().split('T')[0], // Extract only the date part from EndDate
          };
        }),
      );

      // console.log('tableData', tableData);
      // console.log('picIds', picIds);
      const uniquePicIds = [...new Set(picIds)]; // Removing duplicate pic ids
      const emails = await this.getUserEmails(uniquePicIds);

      const subject = `NPD: Kindly complete the delayed activities asap `;
      const table = `
        <table border="1">
          <thead>
            <tr>
              <th>Project Type</th>
              <th>Project Name</th>
              <th>Department Name</th>
              <th>Delayed Task Name</th>
              <th>Delay By (in Days)</th>
              <th>Target Date</th>
            </tr>
          </thead>
          <tbody>
            ${tableData
              .map(
                (row: any) => `
                  <tr>
                    <td>${row.ProjectType}</td>
                    <td>${row.ProjectName}</td>
                    <td>${row.DepartmentName}</td>
                    <td>${row.DelayedTaskName}</td>
                    <td>${row.DelayByDays}</td>
                    <td>${row.TargetDate}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      `;
      const text = `
     "Dear San!
Following activities are delayed. Kindly take action asap."
      ${table}
    `;
      // console.log('emails,table', emails, table, text);
      const msg = {
        recipients: emails,
        from: process.env.FROM,
        subject: subject,
        text: '',
        html: `<div>${text}</div>`,
      };

      try {
        const sendMail = await this.emailService.sendBulkEmails(
          emails,
          subject,
          '',
          text,
        );

        if (sendMail) {
          console.log('Mail sent successfully');
        }
      } catch (error) {
        console.error('Error sending mail:', error);
      }
    } catch (error) {
      console.error('Error sending mail for delayed items:', error);
    }
  }
  async sendMailForMom(id) {
    try {
    } catch (error) {}
  }

  async getUserEmails(picIds) {
    try {
      const users = await this.prisma.user.findMany({
        where: { id: { in: picIds } },
      });
      const emails = users.map((user) => user.email);
      return emails;
    } catch (error) {
      console.error('Error querying users:', error);
    }
  }

  async duplicateProjectName(userId, data) {
    try {
      let status = false;
      const specialCharRegex = /^[^a-zA-Z0-9\s].*|.*[^a-zA-Z0-9\s]$/;

      if (specialCharRegex.test(data?.name)) {
        return (status = true);
      }
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const findByName = await this.npdModule.findOne({
        projectName: { $regex: `^${data?.name}$`, $options: 'i' },
        deletedAt: false,
      });

      if (findByName) {
        return (status = true);
      }
      return status;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateNPD(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;
      const pa = await this.configModule.find({
        organizationId: activeUser.organizationId,
      });
      let createData;
      createData = await this.npdModule.findByIdAndUpdate(id, {
        ...data,
        organizationId: activeUser.organizationId,
        projectName: data?.projectName.trim().replace(/\s+/g, ' '),
        projectAdmins: pa[0].pm,
      });
      if (data?.isDraft === false && createData !== undefined) {
        const getDataId: any = await this.npdModule.findById(createData?._id);
        await this.convertGanttData(getDataId, activeUser);
      }
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateNPDStatus(data, id) {
    // console.log('aoi called', data);
    try {
      const update = await this.npdModule.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true },
      );

      if (!update) {
        console.log('Document not found');
        return null;
      }

      //after update notify pics,commented as of now
      // if(update?._id){
      //   try{
      //     const res=await this.sendMailOnInactive(update?._id)
      //   }catch(error){

      //   }
      // }
      return update._id;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error; // Optionally throw error or handle it as needed
    }
  }

  async getAllNPD(userId, query) {
    try {
      const {
        skip,
        limit,
        searchTerm,
        projectTypeFilter,
        customerFilter,
        statusFilter,
      } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser?.organizationId,
        deletedAt: false,
        isActive: true,
      };

      if (
        searchTerm &&
        searchTerm !== '' &&
        searchTerm !== undefined &&
        searchTerm !== null
      ) {
        let users: any = await this.prisma.user.findMany({
          where: {
            AND: [
              { organizationId: activeUser.organizationId },
              {
                OR: [
                  { username: { contains: searchTerm, mode: 'insensitive' } },
                  { firstname: { contains: searchTerm, mode: 'insensitive' } },
                  { lastname: { contains: searchTerm, mode: 'insensitive' } },
                  { email: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
            ],
          },
        });

        const userIds = users.map((item) => item.id);

        whereCondition = {
          ...whereCondition,
          $or: [
            { projectName: { $regex: new RegExp(searchTerm, 'i') } }, // Regex search on projectName
            { createdBy: { $in: userIds } }, // Check if projectAdmin is in the userIds array
          ],
        };
      }

      if (
        projectTypeFilter &&
        projectTypeFilter !== '' &&
        projectTypeFilter !== undefined &&
        projectTypeFilter !== null
      ) {
        const selectedProjectTypes = projectTypeFilter.split(',');
        whereCondition = {
          ...whereCondition,
          projectType: { $in: selectedProjectTypes },
        };
      }

      if (
        customerFilter &&
        customerFilter !== '' &&
        customerFilter !== undefined &&
        customerFilter !== null
      ) {
        const selectedCustomers = customerFilter.split(',');
        whereCondition = {
          ...whereCondition,
          customer: { $in: selectedCustomers },
        };
      }

      if (
        statusFilter &&
        statusFilter !== '' &&
        statusFilter !== undefined &&
        statusFilter !== null
      ) {
        const selectedStatus = statusFilter.split(',');
        whereCondition = {
          ...whereCondition,
          status: { $in: selectedStatus },
        };
      }

      let result: any = await this.npdModule
        .find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean()
        .sort({ createdAt: -1, _id: -1 });

      // result.reverse();

      const finalResult: any = [];

      // Loop through the result and enhance the data
      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        let model = [...item?.customer];
        const modelList = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: model },
          },
        });

        const user = await this.prisma.user.findFirst({
          where: { id: item?.createdBy },
        });

        finalResult.push({
          ...item,
          npdNo: item?.serialNumber,
          createdBy: user?.username,
          customer: modelList?.map((ele: any) => ele.entityName),
          pendingWith: '',
        });
      }

      const total = await this.npdModule.count(whereCondition);
      return { data: finalResult, total };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteNPD(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.npdModule.findByIdAndUpdate(id, {
        deletedAt: true,
      });
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdNPD(user, id) {
    try {
      // const activeUser = await this.prisma.user.findFirst({
      //   where: { kcId: userId.id },
      // });
      const result = await this.npdModule.findById(id);
      let npdDptData, entityData;
      if (result?.departmentData) {
        npdDptData = Array.from(
          new Set(
            result?.departmentData?.flatMap((ele: any) =>
              ele?.departments?.map((eles: any) => eles?.department),
            ),
          ),
        );
        npdDptData = npdDptData.filter((department) => department !== null);

        entityData = await this.prisma.entity.findMany({
          where: {
            id: { in: npdDptData },
            organizationId: user.organizationId,
          },
        });
      }

      let data = {
        _id: result._id,
        projectType: result.projectType,
        projectName: result.projectName,
        customer: result.customer,
        sopDate: result.sopDate,
        sopQuantity: result.sopQuantity,
        escNumber: result.escNumber,
        escRank: result.escRank,
        justification: result.justification,
        meetingDate: result.meetingDate,
        partDetails: result.partDetails,
        departmentData: result.departmentData,
        attachFiles: result.attachFiles,
        organizationId: result.organizationId,
        createdBy: result.createdBy,
        updatedBy: result.updatedBy,
        status: result.status,
        isDraft: result.isDraft,
        createdAt: result.createdAt,
        deletedAt: result.deletedAt,
        updatedAt: result.updatedAt,
        model: result.model,
        customerSopDate: result.customerSopDate,
        departmentFullData: entityData,
      };
      return data;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async convertGanttData(data: any, activeUser: any) {
    let taskArray = [];

    // NPD Data Object
    let npdData = {
      TaskId: data?._id.toString(),
      TaskName: data?.projectName,
      StartDate: '',
      EndDate: '',
      TimeLog: 0,
      Work: 0,
      Progress: 0,
      Status: '',
      Priority: '',
      type: 'npd',
      isSelection: false,
      organizationId: activeUser.organizationId,
      createdBy: activeUser.id,
      npdId: data?._id,
      pm: data?.projectAdmins,
      isDraggable: false,
    };

    // Check if NPD Data already exists
    const existingNpd = await this.NpdGanttChartModule.findOne({
      TaskId: npdData?.TaskId,
    });
    if (!existingNpd) {
      taskArray.push(npdData);
    }

    for (let catData of data?.departmentData) {
      let categoryData = {
        TaskId: `${catData?.stakeHolderId}-${data?._id.toString()}`,
        TaskName: catData?.stakeHolderName,
        StartDate: '',
        EndDate: '',
        TimeLog: 0,
        Work: 0,
        Progress: 0,
        Status: '',
        Priority: '',
        type: 'Category',
        category: catData?.category,
        stakeHolderId: catData?.stakeHolderId,
        stakeHolderName: catData?.stakeHolderName,
        ParentId: npdData.TaskId,
        Component: npdData.TaskName,
        isSelection: false,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
        npdId: data?._id,
        pm: data?.projectAdmins,
        isDraggable: false,
      };

      const findByCategory = await this.NpdGanttChartModule.findOne({
        TaskId: categoryData?.TaskId,
      });
      if (!findByCategory) {
        taskArray.push(categoryData);
      }

      const departmentPromises = catData?.departments.map(
        async (value: any) => {
          if (value?.npdConfigId !== '') {
            const npdConfigData: any = await this.npdConfigModule.findById(
              value.npdConfigId,
            );
            const entityData = await this.prisma.entity.findFirst({
              where: { id: npdConfigData?.deptId },
            });
            const userData: any = await this.prisma.user.findMany({
              where: {
                organizationId: npdConfigData.organizationId,
                id: { in: [...value?.pic] },
              },
            });

            let taskData = {
              TaskId: `${npdConfigData?._id.toString()}-${data?._id.toString()}-${
                catData?.id
              }`,
              TaskName: entityData.entityName,
              StartDate: null,
              EndDate: null,
              Assignee: userData,
              TimeLog: 0,
              Work: 0,
              Progress: 0,
              Status: '',
              Priority: '',
              ParentId: categoryData?.TaskId,
              Component: categoryData?.TaskName,
              type: 'department',
              BaselineStartDate: '',
              BaselineEndDate: '',
              evidence: [],
              isSelection: false,
              remarks: [],
              progressData: [],
              category: catData?.category,
              stakeHolderId: catData?.stakeHolderId,
              stakeHolderName: catData?.stakeHolderName,
              organizationId: activeUser.organizationId,
              createdBy: activeUser.id,
              npdId: data?._id,
              dptId: entityData?.id,
              picId: userData?.map((item: any) => item.id),
              pm: data?.projectAdmins,
              isDraggable: false,
            };

            const findByTaskData = await this.NpdGanttChartModule.findOne({
              TaskId: taskData?.TaskId,
            });
            if (!findByTaskData) {
              taskArray.push(taskData);
            }

            const activityPromises = npdConfigData?.activity?.map(
              async (item: any) => {
                let taskOne = {
                  TaskId: `${item.id}-${data?._id.toString()}-${catData?.id}`,
                  TaskName: item.activity,
                  StartDate: null,
                  EndDate: null,
                  TimeLog: 0,
                  Work: 0,
                  Progress: 0,
                  Status: '',
                  ParentId: taskData.TaskId,
                  Priority: '',
                  Component: taskData.TaskName,
                  type: 'activity',
                  BaselineStartDate: '',
                  BaselineEndDate: '',
                  evidence: item?.evidence,
                  isSelection: false,
                  remarks: [],
                  progressData: [],
                  category: catData?.category,
                  stakeHolderId: catData?.stakeHolderId,
                  stakeHolderName: catData?.stakeHolderName,
                  organizationId: activeUser.organizationId,
                  createdBy: activeUser.id,
                  npdId: data?._id,
                  dptId: taskData?.dptId,
                  picId: taskData?.picId,
                  pm: data?.projectAdmins,
                  isDraggable: true,
                };

                const subTaskPromises = item.subActivity?.map(
                  async (ele: any) => {
                    let subData = {
                      TaskId: `${ele.id}-${data?._id.toString()}-${
                        catData?.id
                      }`,
                      TaskName: ele.title,
                      StartDate: null,
                      EndDate: null,
                      TimeLog: 0,
                      Work: 0,
                      Progress: 0,
                      Status: '',
                      ParentId: taskOne.TaskId,
                      Priority: '',
                      Component: taskOne.TaskName,
                      type: 'sub activity',
                      BaselineStartDate: '',
                      BaselineEndDate: '',
                      evidence: [],
                      isSelection: false,
                      remarks: [],
                      progressData: [],
                      category: catData?.category,
                      stakeHolderId: catData?.stakeHolderId,
                      stakeHolderName: catData?.stakeHolderName,
                      organizationId: activeUser.organizationId,
                      createdBy: activeUser.id,
                      npdId: data?._id,
                      dptId: taskOne?.dptId,
                      picId: taskOne.picId,
                      pm: data?.projectAdmins,
                      isDraggable: true,
                    };
                    const findByTaskSub =
                      await this.NpdGanttChartModule.findOne({
                        TaskId: subData?.TaskId,
                      });
                    if (!findByTaskSub) {
                      taskArray.push(subData);
                    }
                  },
                );

                await Promise.all(subTaskPromises);
                const findByTaskOne = await this.NpdGanttChartModule.findOne({
                  TaskId: taskOne?.TaskId,
                });
                if (!findByTaskOne) {
                  taskArray.push(taskOne);
                }
              },
            );

            await Promise.all(activityPromises);
          } else {
            // handle case for departments without npdConfigId
            const entityData: any = await this.prisma.entity.findFirst({
              where: { id: value?.department },
            });
            let userData: any = await this.prisma.user.findMany({
              where: {
                organizationId: activeUser?.organizationId,
                id: { in: [...value?.pic] },
              },
            });

            let taskData = {
              TaskId: `${value?.id}-${data?._id.toString()}-${catData?.id}`,
              TaskName: entityData?.entityName,
              StartDate: null,
              EndDate: null,
              Assignee: userData,
              TimeLog: 0,
              Work: 0,
              Progress: 0,
              Status: '',
              Priority: '',
              ParentId: categoryData?.TaskId,
              Component: categoryData?.TaskName,
              type: 'department',
              BaselineStartDate: '',
              BaselineEndDate: '',
              evidence: [],
              isSelection: false,
              remarks: [],
              progressData: [],
              category: catData?.category,
              stakeHolderId: catData?.stakeHolderId,
              stakeHolderName: catData?.stakeHolderName,
              organizationId: activeUser.organizationId,
              createdBy: activeUser.id,
              npdId: data?._id,
              dptId: entityData?.id,
              picId: userData?.map((item: any) => item.id),
              pm: data?.projectAdmins,
              isDraggable: false,
            };

            const findByOne = await this.NpdGanttChartModule.findOne({
              TaskId: taskData?.TaskId,
            });
            if (!findByOne) {
              taskArray.push(taskData);
            }
          }
        },
      );

      await Promise.all(departmentPromises);
    }

    // Insert all tasks into database at once
    await this.NpdGanttChartModule.insertMany(taskArray);
  }
  async convertSvarGanttData(data: any, activeUser: any) {
    let taskArray = [];
    try {
      // console.log('data', data);  { id: "task", label: "NPD" },
      // { id: "progress", label: "Activity" },
      // { id: "milestone", label: "Milestone" },
      // { id: "summary", label: "Department" },
      // { id: "urgent", label: "Sub-Activity" },
      // { id: "category", label: "Category" },
      // NPD Data Object
      let npdData = {
        id: data?._id,
        type: 'task',
        start: '',
        end: '',
        progress: '',
        duration: '',
        text: data?.projectName,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
        npdId: data?._id,
        baseStart: '',
        baseEnd: '',
        open: true,

        lazy: false,
      };

      // Check if NPD Data already exists
      // const existingNpd = await this.svarGanttModel.findOne({

      //   _id: npdData?.id,
      // });
      // if (!existingNpd) {
      taskArray.push(npdData);
      // }

      for (let catData of data?.departmentData) {
        let categoryData = {
          id: `${catData?.stakeHolderId}-${data?._id.toString()}`,
          text: catData?.stakeHolderName,
          start: '',
          end: '',
          duration: 0,
          baseStart: '',
          baseEnd: '',
          progress: 0,

          type: 'category',

          parent: npdData.id,
          parentName: npdData.text,

          organizationId: activeUser.organizationId,
          createdBy: activeUser.id,
          npdId: data?._id,
          open: true,
          lazy: false,
        };

        taskArray.push(categoryData);

        const departmentPromises = catData?.departments.map(
          async (value: any) => {
            if (value?.npdConfigId !== '') {
              const npdConfigData: any = await this.npdConfigModule.findById(
                value.npdConfigId,
              );
              const entityData = await this.prisma.entity.findFirst({
                where: { id: npdConfigData?.deptId },
              });
              const userData: any = await this.prisma.user.findMany({
                where: {
                  organizationId: npdConfigData.organizationId,
                  id: { in: [...value?.pic] },
                },
              });

              let taskData = {
                id: `${npdConfigData?._id.toString()}-${data?._id.toString()}-${
                  catData?.id
                }`,
                text: entityData.entityName,

                start: '',
                end: '',
                progress: '',
                duration: '',
                assignee: userData,
                dptId: entityData?.id,
                picId: userData?.map((item: any) => item.id),
                organizationId: activeUser.organizationId,
                createdBy: activeUser.id,
                npdId: data?._id,
                evidence: [],
                baseStart: '',
                baseEnd: '',
                remarks: [],
                progressData: [],
                lazy: false,
                parent: categoryData?.id,
                parentName: categoryData?.text,
                open: true,
                type: 'summary',
              };

              // const findByTaskData = await this.svarGanttModel.findOne({
              //   id: taskData?.id,
              // });
              // if (!findByTaskData) {
              taskArray.push(taskData);
              // }

              const activityPromises = npdConfigData?.activity?.map(
                async (item: any) => {
                  // console.log('activty map', item.activity);
                  let taskOne = {
                    id: `${item.id}-${data?._id.toString()}-${catData?.id}`,
                    text: item.activity,

                    type: 'progress',
                    start: '',
                    end: '',
                    progress: '',
                    duration: '',
                    remarks: [],
                    progressData: [],
                    baseStart: '',
                    baseEnd: '',
                    evidence: item?.evidence,
                    organizationId: activeUser.organizationId,
                    createdBy: activeUser.id,
                    npdId: data?._id,
                    dptId: taskData?.dptId,
                    picId: taskData?.picId,
                    lazy: false,
                    parent: taskData.id,
                    parentName: taskData?.text,
                    Priority: '',
                    open: true,
                  };

                  const subTaskPromises = item.subActivity?.map(
                    async (ele: any) => {
                      let subData = {
                        id: `${ele.id}-${data?._id.toString()}-${catData?.id}`,
                        text: ele.title,

                        type: 'urgent',
                        start: '',
                        end: '',
                        progress: '',
                        duration: '',
                        baseStart: '',
                        baseEnd: '',

                        organizationId: activeUser.organizationId,
                        createdBy: activeUser.id,
                        npdId: data?._id,
                        evidence: [],
                        isSelection: false,
                        remarks: [],
                        progressData: [],
                        dptId: taskOne?.dptId,
                        picId: taskOne.picId,
                        lazy: false,
                        parent: taskOne.id,
                        parentName: taskOne.text,
                        Priority: '',
                      };

                      taskArray.push(subData);
                    },
                  );

                  await Promise.all(subTaskPromises);
                  // const findByTaskOne = await this.NpdGanttChartModule.findOne({
                  //   TaskId: taskOne?.TaskId,
                  // });
                  // if (!findByTaskOne) {
                  taskArray.push(taskOne);
                  // }
                },
              );

              await Promise.all(activityPromises);
            } else {
              // handle case for departments without npdConfigId
              const entityData: any = await this.prisma.entity.findFirst({
                where: { id: value?.department },
              });
              let userData: any = await this.prisma.user.findMany({
                where: {
                  organizationId: activeUser?.organizationId,
                  id: { in: [...value?.pic] },
                },
              });

              let taskData = {
                id: `${value?.id}-${data?._id.toString()}-${catData?.id}`,
                text: entityData?.entityName,
                start: '',
                end: '',
                progress: '',
                duration: '',
                baseStart: '',
                baseEnd: '',
                organizationId: activeUser.organizationId,
                createdBy: activeUser.id,
                npdId: data?._id,

                lazy: false,
                parent: categoryData?.id,
                parentName: categoryData?.text,
                type: 'summary',
                // open: true,
              };

              // const findByOne = await this.NpdGanttChartModule.findOne({
              //   TaskId: taskData?.id,
              // });
              // if (!findByOne) {
              taskArray.push(taskData);
              // }
            }
          },
        );

        await Promise.all(departmentPromises);
      }
      // console.log('task array', taskArray);
      // Insert all tasks into database at once
      await this.svarGanttModel.insertMany(taskArray);
    } catch (error) {}
  }
  async getByIdNPDID(userId, id, query) {
    try {
      const { skip, limit, departmentId, user } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: true, organization: true },
      });

      let whereCondition: any = {
        organizationId: activeUser?.organizationId,
        npdId: id,
      };
      const pa = await this.configModule.find({
        organizationId: activeUser.organizationId,
      });

      let deptId;
      if (
        departmentId === undefined ||
        departmentId === '' ||
        departmentId === null
      ) {
        whereCondition.dptId = activeUser?.entity.id;
      } else if (departmentId !== 'All') {
        if (departmentId === undefined) {
          deptId = activeUser?.entity.id;
        }
        whereCondition.dptId = departmentId ? departmentId : deptId;
      }
      if (!user || user === null || user === '') {
        whereCondition.$or = [
          { pm: activeUser?.id },
          { picId: activeUser?.id },
        ];
      } else if (user !== 'All') {
        whereCondition.$or = [{ pm: user }, { picId: user }];
      }

      let dataAll: any = [];
      if (departmentId === 'All' && user === 'All') {
        dataAll = await this.NpdGanttChartModule.find({
          organizationId: activeUser?.organizationId,
          npdId: id,
        });
      } else {
        dataAll = await this.NpdGanttChartModule.find(whereCondition);

        const findByCategory = dataAll?.find(
          (ele: any) => ele?.type === 'department',
        );
        const findCategoryData = await this.NpdGanttChartModule.find({
          TaskId: Array.isArray(findByCategory)
            ? { $in: findByCategory?.map((ele) => ele?.ParentId) }
            : findByCategory?.ParentId,
          npdId: id,
        });

        dataAll = [
          ...dataAll,
          ...findCategoryData.filter(
            (task) =>
              !dataAll.some(
                (existingTask) => existingTask.TaskId === task.TaskId,
              ),
          ),
        ];

        const findByNpdData = await this.NpdGanttChartModule.find({
          type: 'npd',
          npdId: id,
        });

        dataAll = [
          ...dataAll,
          ...findByNpdData.filter(
            (task) =>
              !dataAll.some(
                (existingTask) => existingTask.TaskId === task.TaskId,
              ),
          ),
        ];
      }

      const count = await this.NpdGanttChartModule.count(whereCondition);
      const activeUserOrganization = activeUser.organization?.realmName;
      const categoryOrder: Record<string, number> = {
        Customer: 1,
        [activeUserOrganization]: 2,
        Supplier: 3,
      };

      const sortedData = [...dataAll].sort((a, b) => {
        const categoryDiff =
          categoryOrder[a.category] - categoryOrder[b.category];
        if (categoryDiff !== 0) return categoryDiff;

        if (
          a.category === activeUser.organization.realmName &&
          b.category === activeUser.organization.realmName
        ) {
          const milestoneDiff = Number(b.isMileStone) - Number(a.isMileStone);
          if (milestoneDiff !== 0) return milestoneDiff;
        }
        return a.TaskId.localeCompare(b.TaskId);
      });

      const includeParents = (tasks: any[]) => {
        const taskMap = new Map(tasks.map((task) => [task.TaskId, task]));
        const finalTasks = new Set(tasks);

        tasks.forEach((task) => {
          let currentParentId = task.ParentId;
          while (currentParentId && !taskMap.has(currentParentId)) {
            const parentTask = dataAll.find(
              (t) => t.TaskId === currentParentId,
            );
            if (parentTask) {
              finalTasks.add(parentTask);
              currentParentId = parentTask.ParentId;
            } else {
              break;
            }
          }
        });
        return Array.from(finalTasks);
      };

      let paginatedResults;
      if (limit !== '0') {
        const startIndex = (skip - 1) * Number(limit);
        const endIndex = Math.min(
          startIndex + Number(limit),
          sortedData.length,
        );
        const paginated = sortedData.slice(startIndex, endIndex);
        paginatedResults = includeParents(paginated); // Include parents
      } else {
        paginatedResults = sortedData;
      }

      const finalResult = [];

      for (let i = 0; i < sortedData?.length; i++) {
        const item = sortedData[i];
        let paFillStatus;
        let findStatus;
        if (item?.type === 'sub activity' && item?.paStatus === false) {
          paFillStatus = await this.validateTask(item);
          const payload = {
            paStatus: paFillStatus ? true : false,
          };
          const updateData = await this.NpdGanttChartModule.findByIdAndUpdate(
            item?._id,
            payload,
          );
        }
        finalResult?.push({
          ...item?.toObject(),
          paStatus: paFillStatus ? true : item?.paStatus,
          totalRecords: count,
        });
      }

      return { result: finalResult, count };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getNPDbyIdForSvar(userId, id, query) {
    try {
      const { skip, limit, departmentId, user } = query;

      // Fetch the active user along with their entity and organization
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
        include: { entity: true, organization: true },
      });

      // Fetch all users in the active user's organization
      const users = await this.prisma.user.findMany({
        where: {
          organizationId: activeUser?.organizationId,
        },
        select: {
          id: true,
          username: true,
        },
      });

      // Create a map of user IDs to usernames for quick lookup
      const userMap = new Map(users.map((user) => [user.id, user.username]));

      // Fetch the data from the svarGanttModel
      const data = await this.svarGanttModel.find({
        organizationId: activeUser?.organizationId,
        npdId: id,
      });

      // Map the picId array to usernames for each data item
      const enrichedData = data.map((item) => {
        const picUsernames = (item.picId || [])
          .map((picId) => userMap.get(picId))
          .filter(Boolean);
        return {
          ...item.toObject(),
          picUsernames,
        };
      });

      return enrichedData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async addTaskForSvar(userid, id, data) {
    try {
      // console.log('data', data, id);
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid,
        },
      });
      const parentName = await this.svarGanttModel
        .findOne({
          id: data?.taskDetails.parent,
        })
        .select('text');
      const payload: any = {
        id: `${data?.taskDetails?.parent}-${Math.floor(
          Math.random() * 1000000,
        )}`,
        text: data?.taskDetails?.text,
        type: data?.taskDetails?.type,
        parent: data?.taskDetails?.parent,
        parentName: parentName?.text,
        start: data?.taskDetails?.start,
        end: data?.taskDetails?.end,
        duration: data?.taskDetails?.duration,
        progress: data?.taskDetails?.progress,
        npdId: data?.taskDetails?.npdId,
        organizationId: activeUser?.organizationId,
        createdBy: activeUser?.id,
        baseStart: data?.taskDetails?.baseStart,
        baseEnd: data?.taskDetails?.baseEnd,
      };
      const res = await this.svarGanttModel.create(payload);
      return res;
    } catch (error) {}
  }
  async updateTaskForSvar(userid, id, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userid,
        },
      });
      let status;
      // console.log('update task for svar', data);
      if (data?.taskDetails?.start) {
        status = await this.handlerSvarGanttTaskStatus(data);
      } else {
        status = data?.taskDetails?.status;
      }
      // Calculate progress based on progressData
      const progressData = data?.taskDetails?.progressData || [];
      const totalProgress = Math.min(
        progressData.reduce((sum, item) => {
          const value = parseFloat(item?.taskProgress);
          return sum + (isNaN(value) ? 0 : value);
        }, 0),
        100,
      );
      if (totalProgress !== 100 && status === 'Completed') {
        return new InternalServerErrorException({
          status: 500,
          message: `Progress is not 100%.`,
        });
      }
      const payload: any = {
        text: data?.taskDetails?.text,
        type: data?.taskDetails?.type,
        parent: data?.taskDetails?.parent,
        baseStart: data?.taskDetails?.baseStart,
        baseEnd: data?.taskDetails?.baseEnd,
        start: data?.taskDetails?.start,
        end: data?.taskDetails?.end,
        duration: data?.taskDetails?.duration,
        progress: totalProgress,
        npdId: data?.taskDetails?.npdId,
        organizationId: activeUser?.organizationId,
        updatedBy: activeUser?.id,
        picId: data?.taskDetails?.picId,
        status: status,
        progressData: progressData,
      };

      const res = await this.svarGanttModel.findByIdAndUpdate(id, payload);
      const whereCondition = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: res?.npdId,
        Status: { $ne: '' },
      };
      const tasks = await this.svarGanttModel.find(whereCondition);
      const allCompleted = tasks.every((task) => task.status === 'Completed');
      const anyInProgressOrCompleted = tasks.some(
        (task) => task.status === 'In Progress' || task.status === 'Completed',
      );
      const allNotStarted = tasks.every(
        (task) => !task.status || task.status === '',
      );
      let overallStatus = 'Registered';
      if (allNotStarted) {
        overallStatus = 'Registered';
      } else if (allCompleted) {
        overallStatus = 'Completed';
      } else if (anyInProgressOrCompleted) {
        overallStatus = 'In Progress';
      }
      // console.log('overallstau', overallStatus);
      const findByUpdate = await this.npdModule.update(
        { npdId: res.npdId },
        { $set: { status: overallStatus } },
      );

      // console.log('findbyupdate', findByUpdate);

      return res;
    } catch (error) {
      console.error('Error updating task for Svar:', error);
      throw error;
    }
  }

  async getTaskForSvar(userid, id) {
    // console.log('data', data, id);
    try {
      const res = await this.svarGanttModel.findOne({
        id: id,
      });
      return res;
    } catch (error) {}
    // const activeUser = await this.prisma.user.findFirst({
    //   where: {
    //     kcId: userid,
    //   },
    // });
  }
  async deleteTaskForSvar(userid, id) {
    // console.log('data', data, id);
    // const activeUser = await this.prisma.user.findFirst({
    //   where: {
    //     kcId: userid,
    //   },
    // });
    try {
      const res = await this.svarGanttModel.findOneAndDelete({
        id: id,
      });
      return res;
    } catch (error) {}
  }
  async moveTaskForSvar(userid, id, query) {
    try {
      const res = await this.svarGanttModel.findOneAndUpdate(
        {
          id: id,
        },
        { $set: { parent: query.parent } },
      );
    } catch (error) {}
  }
  async updateDatesForSvarTask(userid, id, query) {
    try {
      // console.log('query', query);
      const res = await this.svarGanttModel.findOneAndUpdate(
        {
          id: id,
        },
        { $set: { start: query.start, end: query.end } },
      );
    } catch (error) {}
  }
  async getMileStoneNpdGantt(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      let whereCondition: any = {
        organizationId: activeUser?.organizationId,
        npdId: id,
        isMileStone: true,
        deletedAt: false,
        picId: { $exists: false },
      };
      const result = await this.NpdGanttChartModule.find(whereCondition);
      const finalResult = [];

      for (let i = 0; i < result?.length; i++) {
        let item = result[i];
        const labelName =
          item?.category === 'Customer'
            ? `${item?.TaskName} (Cx)`
            : item?.category === 'DNKI'
            ? `${item?.TaskName} (DNKI)`
            : item?.category === 'Supplier'
            ? `${item?.TaskName} (Sup)`
            : item?.TaskName;
        finalResult?.push({
          date: item?.StartDate,
          label: labelName,
          category: item?.category,
        });
      }
      return finalResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getDataByIdNpdGantt(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      let whereCondition: any = {
        organizationId: activeUser?.organizationId,
        npdId: id,
      };
      const result = await this.NpdGanttChartModule.find(whereCondition);

      let ListData: any = [];
      ListData.push({
        ID: 'All',
        Text: 'All',
        value: 'All',
      });
      result
        ?.filter((item: any) => item.type === 'department')
        ?.map((ele: any) => {
          ListData.push({
            ID: ele?.TaskName,
            Text: ele?.TaskName,
            value: ele?.dptId,
          });
        });
      let userListData: any = [];
      userListData.push({
        ID: 'All',
        Text: 'All',
        value: 'All',
      });
      result
        ?.filter((item: any) => item.type === 'department')
        ?.map((ele: any) => {
          ele?.Assignee?.map((eles: any) => {
            userListData.push({
              ID: eles?.username,
              Text: eles?.username,
              value: eles?.id,
            });
          });
        });
      const finalUserList = Array.from(
        new Set(userListData.map((item: any) => item.ID)),
      ).map((id) => userListData.find((item: any) => item.ID === id));
      const finalDataSet = Array.from(
        new Set(ListData.map((item: any) => item.ID)),
      ).map((id) => ListData.find((item: any) => item.ID === id));
      return { userList: finalUserList, departmentList: finalDataSet };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async checkTask(task: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isEndDateValid = task?.EndDate;
    const endDate = isEndDateValid ? new Date(task?.EndDate) : null;
    let status = task?.Status;
    if (task?.type === 'sub activity' || task?.type === 'activity') {
      // if (!status || status === 'In Progress') {
      if (endDate && endDate < today && task?.Progress < 100) {
        status = 'Delayed';
        // }
      }
    }
    return status;
  }

  async validateTask(task: any) {
    return (
      task?.isMileStone === false &&
      Number(task?.TimeLog) !== 0 &&
      task?.Priority !== ''
    );
  }

  async getAllNPDList(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
      };

      const result = await this.npdModule
        .aggregate([
          {
            $match: {
              organizationId: activeUser.organizationId,
              deletedAt: false,
              isDraft: false,
              isActive: true,
            },
          },
          // {
          //   $sort: { projectName: 1 },
          // },
          {
            $sort: { createdAt: -1, _id: -1 },
          },
        ])
        .collation({ locale: 'en', strength: 2 })
        .exec();

      const finalResult = [];

      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        finalResult.push({
          label: item?.projectName,
          value: item?._id,
          latest: i === 0,
        });
      }
      return finalResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllNPDDptList(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      const result = await this.NpdGanttChartModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
      }).lean();
      const filterByDpt = result?.filter(
        (item: any) => item.type === 'department',
      );
      const finalResult = [];
      finalResult.push({
        ID: 'All',
        Text: 'All',
      });
      for (let i = 0; i < filterByDpt.length; i++) {
        const item = filterByDpt[i];
        finalResult.push({
          ID: item?.TaskName,
          Text: item?.TaskName,
        });
      }
      const finalDataSet = Array.from(
        new Set(finalResult.map((item: any) => item.ID)),
      ).map((id) => finalResult.find((item: any) => item.ID === id));

      return finalDataSet;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNPDDptList(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      const result = await this.NpdGanttChartModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: id,
      }).lean();
      let finalDataSet;
      finalDataSet = result.map((item: any) => ({
        type: item.type,
        taskId: item.TaskId,
        id: item._id,
        value: item.dptId,
        TaskName: item?.TaskName,
        StartDate: item?.StartDate,
        EndDate: item?.EndDate,
        parentId: item.parentId,
        npdId: item.npdId,
        Status: item?.Status,
        picId: item?.picId,
      }));

      return finalDataSet;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateGanttChartTask(userId, data, id) {
    try {
      // console.log('data', data, id);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      const updateData = await this.NpdGanttChartModule.findByIdAndUpdate(id, {
        StartDate: data.StartDate,
        EndDate: data.EndDate,
      });
      let updateParentId: any = updateData;
      while (updateParentId?.type !== 'npd') {
        if (updateParentId?.type === 'sub activity') {
          await this.NpdGanttChartModule.updateOne(
            { TaskId: updateParentId?.ParentId },
            {
              StartDate: data.StartDate,
              EndDate: data.EndDate,
            },
          );
          const updateDataLoop = await this.NpdGanttChartModule.findOne({
            TaskId: updateParentId?.ParentId,
          });
          updateParentId = updateDataLoop;
        } else if (updateParentId?.type === 'activity') {
          await this.NpdGanttChartModule.updateOne(
            { TaskId: updateParentId?.ParentId },
            {
              StartDate: data.StartDate,
              EndDate: data.EndDate,
            },
          );
          const updateDataLoop = await this.NpdGanttChartModule.findOne({
            TaskId: updateParentId?.ParentId,
          });
          updateParentId = updateDataLoop;
        } else if (updateParentId?.type === 'department') {
          await this.NpdGanttChartModule.updateOne(
            { TaskId: updateParentId?.ParentId },
            {
              StartDate: data.StartDate,
              EndDate: data.EndDate,
            },
          );
          const updateDataLoop = await this.NpdGanttChartModule.findOne({
            TaskId: updateParentId?.ParentId,
          });
          updateParentId = updateDataLoop;
        } else if (updateParentId?.type === 'npd') {
          await this.NpdGanttChartModule.updateOne(
            { _id: new ObjectId(updateParentId?.ParentId) },
            {
              StartDate: data.StartDate,
              EndDate: data.EndDate,
            },
          );
          const updateDataLoop = await this.NpdGanttChartModule.findOne({
            TaskId: updateParentId?.ParentId,
          });
          updateParentId = updateDataLoop;
          return;
        }
      }
      // updateParentId = updateDataLoop.ParentId
      return;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateSingleGanttTask(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      // console.log('data===>', data);
      const updateData = await this.NpdGanttChartModule.findByIdAndUpdate(
        id,
        data,
      );

      // console.log('updateData', updateData);
      return updateData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async dateConvert(dateString: any) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  /*******Minutes of Meeting********/

  async createMinutesOfMeeting(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.MinutesOfMeetingModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      return createData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateMinutesOfMeeting(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;
      const createData = await this.MinutesOfMeetingModule.findByIdAndUpdate(
        id,
        {
          ...data,
          organizationId: activeUser.organizationId,
        },
      );
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteMinutesOfMeeting(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.MinutesOfMeetingModule.findByIdAndUpdate(
        id,
        {
          deletedAt: true,
        },
      );
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdMinutesOfMeeting(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.MinutesOfMeetingModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllMinutesOfMeeting(userId, query) {
    // console.log('called');
    try {
      const {
        skip,
        limit,
        pic,
        searchTerm,
        associatedDeptFilter,
        selectedNpd,
        meetingDates,
      } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
      };

      if (
        searchTerm !== undefined &&
        searchTerm !== 'undefined' &&
        searchTerm !== ''
      ) {
        let users: any = await this.prisma.user.findMany({
          where: {
            AND: [
              { organizationId: activeUser.organizationId },
              {
                OR: [
                  { username: { contains: searchTerm, mode: 'insensitive' } },
                  { firstname: { contains: searchTerm, mode: 'insensitive' } },
                  { lastname: { contains: searchTerm, mode: 'insensitive' } },
                  { email: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
            ],
          },
        });

        const userIds = users.map((item) => item.id);
        whereCondition = {
          ...whereCondition,
          $or: [
            { meetingName: { $regex: new RegExp(searchTerm, 'i') } },
            { 'meetingOwner.id': { $in: userIds } },
          ],
        };
      }

      if (pic !== undefined && pic !== 'undefined' && pic.length > 0) {
        whereCondition = {
          ...whereCondition,
          'meetingOwner.id': { $in: pic?.split(',') },
        };
      }

      if (
        associatedDeptFilter !== undefined &&
        associatedDeptFilter !== 'undefined' &&
        associatedDeptFilter.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          presentDpt: { $in: associatedDeptFilter?.split(',') },
        };
      }

      if (
        selectedNpd !== undefined &&
        selectedNpd !== 'undefined' &&
        selectedNpd !== ''
      ) {
        whereCondition = {
          ...whereCondition,
          npdIds: { $elemMatch: { $eq: selectedNpd } },
        };
      }

      // if (
      //   meetingDates !== undefined &&
      //   meetingDates !== 'undefined' &&
      //   meetingDates !== ''
      // ) {
      //   const [startDate, endDate] = meetingDates.split(',').map((date) => {
      //     const [day, month, year] = date.split('-');
      //     return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
      //   });
      //   whereCondition = {
      //     meetingDateFrom: {
      //       $gte: startDate.toISOString(),
      //       $lte: endDate.toISOString(),
      //     },
      //   };
      // }
      // console.log('where condition', whereCondition);
      const result = await this.MinutesOfMeetingModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean()
        .sort({ createdAt: -1, _id: -1 });

      // console.log('result', result);
      // result.reverse();

      const finalResult = [];

      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        let picUsers = [...item?.npdIds];
        const userData: any = await this.npdModule.find({
          organizationId: activeUser.organizationId,
          _id: { $in: picUsers },
        });

        let dptData = item?.presentDpt;
        const presentDptData = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: dptData },
          },
        });

        let dataNpds = userData?.map((ele: any) => {
          let data = {
            id: ele._id,
            name: ele.projectName,
          };
          return data;
        });

        const actionPlansData = await this.ActionPlanModule.find({
          organizationId: activeUser.organizationId,
          momId: item?._id,
        });
        // console.log('npddata', dataNpds, presentDptData, actionPlansData);
        finalResult.push({
          ...item,
          npdData: dataNpds,
          presentDptData: presentDptData,
          actionPlans: actionPlansData?.map((ele: any) => ele?._id),
        });
      }
      const total = await this.MinutesOfMeetingModule.count(whereCondition);
      // console.log('result', finalResult);
      return { data: finalResult, total };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllDiscussedAndDelayedItemsByNpdId(user, id, query) {
    try {
      const { skip, limit, status, criticality } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: id,
        currentVersion: true,
      };

      if (status !== undefined && status !== 'undefined' && status.length > 0) {
        whereCondition = {
          ...whereCondition,
          status: { $in: status?.split(',') },
        };
      }

      if (
        criticality !== undefined &&
        criticality !== 'undefined' &&
        criticality.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          criticality: { $in: criticality?.split(',') },
        };
      }

      const result = await this.DiscussionItemModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean();

      result.reverse();

      const finalResult = [];

      for (let i = 0; i < result?.length; i++) {
        const item = result[i];
        let momDataFind;
        if (item?.momId) {
          const objectId = new ObjectId(item?.momId);
          momDataFind = await this.MinutesOfMeetingModule.findById(objectId);
        }
        finalResult.push({
          ...item,
          momTitle: momDataFind?.meetingName,
          momDateForm: momDataFind?.meetingDateForm,
          momDateTo: momDataFind?.meetingDateTo,
        });
      }
      const total = await this.DiscussionItemModule.count(whereCondition);
      return {
        data: finalResult,
        total: total,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /*******Discussion Items********/

  async createDiscussionItems(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.DiscussionItemModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      return createData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateDiscussionItems(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;
      const createData = await this.DiscussionItemModule.findByIdAndUpdate(id, {
        ...data,
        organizationId: activeUser.organizationId,
      });
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteDiscussionItems(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.DiscussionItemModule.findByIdAndUpdate(
        id,
        {
          deletedAt: true,
        },
      );
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdDiscussionItems(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.DiscussionItemModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllDiscussionItems(userId, query) {
    try {
      const { skip, limit } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
      };

      const result = await this.DiscussionItemModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
      }).lean();

      // const finalResult = [];
      // // if (result.length > 1) {
      // //   finalResult.push({
      // //     label: 'All',
      // //     value: 'All',
      // //   });
      // // }
      // for (let i = 0; i < result.length; i++) {
      //   const item = result[i];

      //   finalResult.push({
      //     label: item?.projectName,
      //     value: item?._id,
      //   });
      // }

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllMomIdItems(user, id, npdId, query) {
    try {
      const {
        skip,
        limit,
        deptFilter,
        criticalityFilter,
        impactFilter,
        statusFilter,
      } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        momId: id,
        npdId: npdId,
        deletedAt: false,
      };

      if (
        deptFilter !== undefined &&
        deptFilter !== 'undefined' &&
        deptFilter !== ''
      ) {
        whereCondition = {
          ...whereCondition,
          selectedDptId: { $in: deptFilter?.split(',') },
        };
      }

      if (
        criticalityFilter !== undefined &&
        criticalityFilter !== 'undefined' &&
        criticalityFilter !== ''
      ) {
        whereCondition = {
          ...whereCondition,
          criticality: { $in: criticalityFilter?.split(',') },
        };
      }

      if (
        impactFilter &&
        impactFilter !== '' &&
        impactFilter !== undefined &&
        impactFilter !== null
      ) {
        const selectedImpact = impactFilter.split(',');
        whereCondition = {
          ...whereCondition,
          impact: { $in: selectedImpact },
        };
      }

      if (
        statusFilter &&
        statusFilter !== '' &&
        statusFilter !== undefined &&
        statusFilter !== null
      ) {
        const selectedStatus = statusFilter.split(',');
        whereCondition = {
          ...whereCondition,
          status: { $in: selectedStatus },
        };
      }

      const result = await this.DiscussionItemModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit);

      result.reverse();
      const finalResult = [];

      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        const selectedDpt = await this.prisma.entity.findFirst({
          where: { id: item?.selectedDptId },
        });
        const data: any = {
          ...item?.toObject(),

          dptData: selectedDpt,
        };
        finalResult.push(data);
      }
      const total = await this.DiscussionItemModule.count({
        organizationId: activeUser.organizationId,
        momId: id,
        npdId: npdId,
      });
      // console.log('finalresult', finalResult);
      return { data: finalResult, total: total };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /*******Action Plans********/

  async createActionPlans(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.ActionPlanModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      return createData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateActionPlans(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;
      const createData = await this.ActionPlanModule.findByIdAndUpdate(id, {
        ...data,
        organizationId: activeUser.organizationId,
      });
      // console.log('createdata', data, createData);
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteActionPlans(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.ActionPlanModule.findByIdAndUpdate(id, {
        deletedAt: true,
      });
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdActionPlans(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.ActionPlanModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllActionPlans(userId, query) {
    try {
      const { skip, limit, search, responseDpt, pic, targetDate, status } =
        query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
      };

      if (search !== undefined && search !== 'undefined' && search !== '') {
        const npd = await this.npdModule.find({
          projectName: { $regex: search, $options: 'i' },
        });
        let npdIds = npd.map((item: any) => item?._id);
        let itemName;
        const discussionItem = await this.DiscussionItemModule.find({
          discussedItem: { $regex: search, $options: 'i' },
        });
        const delayedItem = await this.DelayedItemModule.find({
          delayedItem: { $regex: search, $options: 'i' },
        });
        if (discussionItem?.length > 0) {
          itemName = discussionItem?.map((ele: any) => ele?._id);
        } else {
          itemName = delayedItem?.map((ele: any) => ele?._id);
        }

        let users: any = await this.prisma.user.findMany({
          where: {
            AND: [
              { organizationId: activeUser.organizationId },
              {
                OR: [
                  { username: { contains: search, mode: 'insensitive' } },
                  { firstname: { contains: search, mode: 'insensitive' } },
                  { lastname: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            ],
          },
        });
        const userIds = users.map((item) => item.id);
        let departments: any = await this.prisma.entity.findMany({
          where: {
            AND: [
              { organizationId: activeUser.organizationId },
              {
                OR: [{ entityName: { contains: search, mode: 'insensitive' } }],
              },
            ],
          },
        });
        const departmentIds = departments?.map((ele: any) => ele?.id);

        const idsData =
          itemName?.map((id) => new mongoose.Types.ObjectId(id)) || [];

        whereCondition = {
          ...whereCondition,
          $or: [
            { actionPlanName: { $regex: search, $options: 'i' } },
            {
              npdId: { $in: npdIds },
            },
            { 'pic.id': { $in: userIds } },
            { selectedDptId: { $in: departmentIds } },
            { itemId: { $in: idsData } },
          ],
        };
      }

      if (
        responseDpt !== undefined &&
        responseDpt !== 'undefined' &&
        responseDpt.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          selectedDptId: { $in: responseDpt?.split(',') },
        };
      }

      if (pic !== undefined && pic !== 'undefined' && pic.length > 0) {
        whereCondition = {
          ...whereCondition,
          'pic.id': { $in: pic?.split(',') },
        };
      }

      if (
        targetDate !== undefined &&
        targetDate !== 'undefined' &&
        targetDate.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          targetDate: targetDate,
        };
      }

      if (status !== undefined && status !== 'undefined' && status.length > 0) {
        whereCondition = {
          ...whereCondition,
          status: { $in: status?.split(',') },
        };
      }

      const result = await this.ActionPlanModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean();

      result.reverse();
      const finalResult = [];

      for (let i = 0; i < result.length; i++) {
        const item: any = result[i];
        let itemData;
        if (item?.type === 'discussedItem') {
          itemData = await this.DiscussionItemModule.findById(item?.itemId);
        } else {
          itemData = await this.DelayedItemModule.findById(item?.itemId);
        }
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().split('T')[0];
        const targetDate = new Date(item.targetDate)
          .toISOString()
          .split('T')[0];
        // console.log("status", item.status === 'Open', targetDate === formattedDate, targetDate , formattedDate ,typeof targetDate, typeof formattedDate )
        if (item.status === 'Open' && targetDate === formattedDate) {
          const update = await this.ActionPlanModule.findByIdAndUpdate(
            item._id,
            {
              status: 'Delayed',
            },
          );
        }
        const npdName = await this.npdModule
          .findById(item?.npdId)
          .select('projectName');

        const selectedDptData = await this.prisma.entity.findFirst({
          where: {
            organizationId: activeUser.organizationId,
            id: item?.selectedDptId,
          },
        });

        finalResult.push({
          ...item,
          itemName: itemData?.discussedItem || itemData?.delayedItem,
          deptData: selectedDptData?.entityName,
          npdName: npdName.projectName,
        });
      }
      const total = await this.ActionPlanModule.count(whereCondition);

      return { data: finalResult, total };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllDiscussionIdItems(user, id, filter) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const discussionItem = await this.DiscussionItemModule.findById(id);
      // console.log('item', discussionItem);
      let result;
      if (discussionItem?.currentVersion === false) {
        result = await this.ActionPlanModule.find({
          organizationId: activeUser.organizationId,
          itemId: id,
          deletedAt: false,
        });
      } else if (discussionItem?.currentVersion === true) {
        result = await this.ActionPlanModule.find({
          organizationId: activeUser.organizationId,
          _id: { $in: discussionItem?.actionPlansIds },
          deletedAt: false,
        });
      }
      // console.log('result', result);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllDelayedIdItems(user, id, filter) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const delayedItem = await this.DelayedItemModule.findById(id);
      // console.log('item', discussionItem);
      let result;
      if (delayedItem?.currentVersion === false) {
        result = await this.ActionPlanModule.find({
          organizationId: activeUser.organizationId,
          itemId: id,
          deletedAt: false,
        });
      } else if (delayedItem?.currentVersion === true) {
        result = await this.ActionPlanModule.find({
          organizationId: activeUser.organizationId,
          _id: { $in: delayedItem?.actionPlansIds },
          deletedAt: false,
        });
      }
      // console.log('result', result);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllActionPointsByNpd(user, id, query) {
    try {
      const { skip, limit, responseDpt, pic, targetDate, status } = query;

      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: id,
      };

      if (
        responseDpt !== undefined &&
        responseDpt !== 'undefined' &&
        responseDpt.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          selectedDptId: { $in: responseDpt?.split(',') },
        };
      }

      if (pic !== undefined && pic !== 'undefined' && pic.length > 0) {
        whereCondition = {
          ...whereCondition,
          'pic.id': { $in: pic?.split(',') },
        };
      }

      if (
        targetDate !== undefined &&
        targetDate !== 'undefined' &&
        targetDate.length > 0
      ) {
        whereCondition = {
          ...whereCondition,
          targetDate: targetDate,
        };
      }

      if (status !== undefined && status !== 'undefined' && status.length > 0) {
        whereCondition = {
          ...whereCondition,
          status: { $in: status?.split(',') },
        };
      }

      const result = await this.ActionPlanModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean();

      result.reverse();

      // let startIndex;
      // let endIndex;
      // let paginatedResults;
      // if (limit === '0') {
      //   paginatedResults = result;
      // } else {
      //   startIndex = (skip - 1) * limit;
      //   endIndex = startIndex + limit;
      //   paginatedResults = result.slice(startIndex, endIndex);
      // }

      const finalResult = [];
      for (let i = 0; i < result.length; i++) {
        const item: any = result[i];

        const selectedDptData = await this.prisma.entity.findFirst({
          where: {
            organizationId: activeUser.organizationId,
            id: item?.selectedDptId,
          },
        });

        let itemData;
        if (item?.type === 'discussedItem') {
          itemData = await this.DiscussionItemModule.findById(item?.itemId);
        } else {
          itemData = await this.DelayedItemModule.findById(item?.itemId);
        }

        finalResult.push({
          ...item,
          selectedDptData: selectedDptData,
          discussionItemData: itemData?.discussedItem || itemData?.delayedItem,
        });
      }

      const total = await this.ActionPlanModule.count(whereCondition);
      return { data: finalResult, total };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async filterListActionPointsByNpd(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.ActionPlanModule.find({
        organizationId: activeUser.organizationId,
        npdId: id,
      });

      let dptIds = [...result?.map((ele: any) => ele?.selectedDptId)];
      const selectedDptData = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          id: { in: dptIds },
        },
      });

      const dptList = selectedDptData?.map((ele: any) => {
        let data = {
          id: ele.id,
          name: ele.entityName,
        };
        return data;
      });

      const picList = result
        ?.map((ele: any) => ({
          id: ele?.pic?.id,
          name: ele?.pic?.username,
        }))
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id),
        );

      return {
        dptList,
        picList,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async filterListActionPointsAll(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.ActionPlanModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
      });

      let dptIds = [...result?.map((ele: any) => ele?.selectedDptId)];
      const selectedDptData = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          id: { in: dptIds },
        },
      });

      const dptList = selectedDptData?.map((ele: any) => {
        let data = {
          id: ele.id,
          name: ele.entityName,
        };
        return data;
      });

      const picList = result
        ?.map((ele: any) => ({
          id: ele?.pic?.id,
          name: ele?.pic?.username,
        }))
        .filter(
          (value, index, self) =>
            index === self.findIndex((t) => t.id === value.id),
        );

      return {
        dptList,
        picList,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /*******Delayed Items ********/
  async getAllDelayedItems(userId, id, momId, query) {
    try {
      const { skip, limit } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      const getByNpdToGanttData = await this.svarGanttModel.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: id,
        status: 'Delayed',
      });

      // console.log("getByNpdToGanttData",getByNpdToGanttData)
      // const filteredTasks = await this.filterTasks(getByNpdToGanttData);

      const finalResult = [];
      for (let i = 0; i < getByNpdToGanttData.length; i++) {
        const item: any = getByNpdToGanttData[i];

        const itemExists: any = await this.DelayedItemModule.findOne({
          organizationId: activeUser.organizationId,
          deletedAt: false,
          npdId: id,
          delayedItemId: item?._id,
        });

        const picUsers = await this.prisma.user.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: item?.picId },
          },
        });

        if (!itemExists) {
          const findByTaskGantt = await this.svarGanttModel.findById(item?._id);

          const latestProgressDate = findByTaskGantt.progressData
            .map((entry: any) => new Date(entry.updatedDate)) // adjust key as needed
            .sort((a: Date, b: Date) => b.getTime() - a.getTime())[0];
          let delayDays;
          if (latestProgressDate && findByTaskGantt.baseEnd) {
            const baseEndDate = new Date(findByTaskGantt.baseEnd);
            const delayMs =
              latestProgressDate.getTime() - baseEndDate.getTime();
            delayDays = Math.ceil(delayMs / (1000 * 60 * 60 * 24));
          }
          const dateConvert = await this.dateConvertAtDD(
            findByTaskGantt?.baseEnd,
          );
          finalResult.push({
            selectedDptId: item?.dptId,
            momId: '',
            delayedItem: item?.text,
            delayedItemDescription: item?.delayedItemDescription,
            delayedItemId: item?._id,
            delayedItemType: item?.type,
            delayedBy: delayDays,
            criticality: '',
            impact: [],
            riskPrediction: '',
            status: '',
            targetDate: dateConvert,
            pic: picUsers,
            riskHistory: [],
            actionPlans: [],
            actionPlansIds: [],
            dropDptValue: [],
            addButtonStatus: true,
            buttonStatus: true,
            npdId: item?.npdId,
            report: '',
          });
        }
      }
      if (finalResult.length > 0) {
        await this.DelayedItemModule.insertMany(finalResult);
      }
      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
        npdId: id,
        // momId: { $in: [momId, ""] },
        $or: [
          {
            momId: momId,
            status: 'Close',
          },
          {
            status: { $in: ['Open', ''] },
          },
        ],
        // status : { $in: ["Open","Close", ""]}
      };

      const result = await this.DelayedItemModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean();

      result.reverse();

      const finalResultLast = [];

      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        const selectedDpt = await this.prisma.entity.findFirst({
          where: { id: item?.selectedDptId },
        });
        let dataUpdate;

        const findByTask = await this.NpdGanttChartModule.findById(
          new ObjectId(item?.delayedItemId),
        );
        if (
          findByTask?.Status === 'Completed' &&
          ['Open', ''].includes(item?.status || '')
        ) {
          dataUpdate = await this.DelayedItemModule.findByIdAndUpdate(
            item?._id,
            {
              status: 'Close',
              notes: 'Item Closed in Gnatt Chart',
              momId: momId,
            },
          );
        }

        finalResultLast.push({
          ...item,
          status: dataUpdate?.status || item.status,
          dptData: selectedDpt,
        });
      }
      const total = finalResultLast?.length;
      return { data: finalResultLast, total };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  // async getAllDelayedItems(userId, id, momId, query) {
  //   try {
  //     const { skip, limit } = query;
  //     const activeUser = await this.prisma.user.findFirst({
  //       where: { kcId: userId.id },
  //     });

  //     const getByNpdToGanttData = await this.NpdGanttChartModule.find({
  //       organizationId: activeUser.organizationId,
  //       deletedAt: false,
  //       npdId: id,
  //       Status: 'Delayed',
  //     });

  //     // console.log("getByNpdToGanttData",getByNpdToGanttData)
  //     // const filteredTasks = await this.filterTasks(getByNpdToGanttData);

  //     const finalResult = [];
  //     for (let i = 0; i < getByNpdToGanttData.length; i++) {
  //       const item: any = getByNpdToGanttData[i];

  //       const itemExists: any = await this.DelayedItemModule.findOne({
  //         organizationId: activeUser.organizationId,
  //         deletedAt: false,
  //         npdId: id,
  //         delayedItemId: item?._id,
  //       });

  //       const picUsers = await this.prisma.user.findMany({
  //         where: {
  //           organizationId: activeUser.organizationId,
  //           id: { in: item?.picId },
  //         },
  //       });

  //       if (!itemExists) {
  //         const findByTaskGantt = await this.NpdGanttChartModule.findById(
  //           item?._id,
  //         );
  //         const dateConvert = await this.dateConvertAtDD(
  //           findByTaskGantt?.EndDate,
  //         );
  //         finalResult.push({
  //           selectedDptId: item?.dptId,
  //           momId: '',
  //           delayedItem: item?.TaskName,
  //           delayedItemDescription: item?.delayedItemDescription,
  //           delayedItemId: item?._id,
  //           delayedItemType: item?.type,
  //           delayedBy: item?.EndDate,
  //           criticality: '',
  //           impact: [],
  //           riskPrediction: '',
  //           status: '',
  //           targetDate: dateConvert,
  //           pic: picUsers,
  //           riskHistory: [],
  //           actionPlans: [],
  //           actionPlansIds: [],
  //           dropDptValue: [],
  //           addButtonStatus: true,
  //           buttonStatus: true,
  //           npdId: item?.npdId,
  //           report: '',
  //         });
  //       }
  //     }
  //     if (finalResult.length > 0) {
  //       await this.DelayedItemModule.insertMany(finalResult);
  //     }
  //     let whereCondition: any = {
  //       organizationId: activeUser.organizationId,
  //       deletedAt: false,
  //       npdId: id,
  //       // momId: { $in: [momId, ""] },
  //       $or: [
  //         {
  //           momId: momId,
  //           status: 'Close',
  //         },
  //         {
  //           status: { $in: ['Open', ''] },
  //         },
  //       ],
  //       // status : { $in: ["Open","Close", ""]}
  //     };

  //     const result = await this.DelayedItemModule.find(whereCondition)
  //       .limit(limit)
  //       .skip((skip - 1) * limit)
  //       .lean();

  //     result.reverse();

  //     const finalResultLast = [];

  //     for (let i = 0; i < result.length; i++) {
  //       const item = result[i];
  //       const selectedDpt = await this.prisma.entity.findFirst({
  //         where: { id: item?.selectedDptId },
  //       });
  //       let dataUpdate;

  //       const findByTask = await this.NpdGanttChartModule.findById(
  //         new ObjectId(item?.delayedItemId),
  //       );
  //       if (
  //         findByTask?.Status === 'Completed' &&
  //         ['Open', ''].includes(item?.status || '')
  //       ) {
  //         dataUpdate = await this.DelayedItemModule.findByIdAndUpdate(
  //           item?._id,
  //           {
  //             status: 'Close',
  //             notes: 'Item Closed in Gnatt Chart',
  //             momId: momId,
  //           },
  //         );
  //       }

  //       finalResultLast.push({
  //         ...item,
  //         status: dataUpdate?.status || item.status,
  //         dptData: selectedDpt,
  //       });
  //     }
  //     const total = finalResultLast?.length;
  //     return { data: finalResultLast, total };
  //   } catch (error) {
  //     throw new InternalServerErrorException(error);
  //   }
  // }

  async dateConvertAtDD(dateData: any) {
    const date = new Date(dateData);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async getByIdDelayedItem(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.DelayedItemModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateDelayedItem(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.DelayedItemModule.findByIdAndUpdate(id, {
        ...data,
        organizationId: activeUser.organizationId,
      });
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteDelayedItem(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.DelayedItemModule.findByIdAndUpdate(id, {
        deletedAt: true,
      });
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  // async filterTasks(tasks: any[]) {
  //   const today = new Date();
  //   return tasks?.filter((task) => {
  //     const progress = Number(task?.Progress);
  //     if (isNaN(progress)) return false;
  //     const endDate = new Date(task?.EndDate);
  //     if (isNaN(endDate.getTime())) return false;
  //     const baselineEndDate = task?.BaselineEndDate
  //       ? new Date(task?.BaselineEndDate)
  //       : null;
  //     if (task?.BaselineEndDate && isNaN(baselineEndDate.getTime()))
  //       return false;
  //     const condition1 = progress < 100;
  //     const condition2 = endDate < today;
  //     const condition3 = task?.Status !== 'Completed';
  //     const condition4 = task?.Status !== '';
  //     return condition1 && condition2 && condition3 && condition4;
  //   });
  // }

  async filterTasks(tasks: any[]) {
    const today = new Date();
    return tasks?.filter((task) => {
      const progress = Number(task?.Progress);
      if (isNaN(progress)) return false;
      const endDate = task?.EndDate ? new Date(task?.EndDate) : null;
      if (!endDate || isNaN(endDate.getTime())) return false;
      const condition1 = progress < 100;
      const condition2 = endDate < today;
      const condition3 = task?.Status !== 'Completed';
      const condition4 = endDate !== null;
      const condition5 =
        task?.type === 'activity' || task?.type === 'sub activity';
      return condition1 && condition2 && condition3 && condition4 && condition5;
    });
  }

  /*******Delayed Items Action Plans  ********/

  async createDelayedActionPlans(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.DelayedItemActionPlanModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      return createData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateDelayedActionPlans(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;
      const createData =
        await this.DelayedItemActionPlanModule.findByIdAndUpdate(id, {
          ...data,
          organizationId: activeUser.organizationId,
        });
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteDelayedActionPlans(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult =
        await this.DelayedItemActionPlanModule.findByIdAndUpdate(id, {
          deletedAt: true,
        });
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdDelayedActionPlans(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.DelayedItemActionPlanModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllDelayedActionPlans(userId, query) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        deletedAt: false,
      };

      const result = await this.DelayedItemActionPlanModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
      }).lean();

      // const finalResult = [];
      // // if (result.length > 1) {
      // //   finalResult.push({
      // //     label: 'All',
      // //     value: 'All',
      // //   });
      // // }
      // for (let i = 0; i < result.length; i++) {
      //   const item = result[i];

      //   finalResult.push({
      //     label: item?.projectName,
      //     value: item?._id,
      //   });
      // }
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllActionPlansByDelayedIdItems(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.DelayedItemActionPlanModule.find({
        organizationId: activeUser.organizationId,
        delayedItemId: id,
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  /*******Risk Items ********/

  async createRiskPrediction(userId, data) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const createData = await this.RiskPredictionModule.create({
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      });
      return createData;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async updateRiskPrediction(userId, data, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const { projectEventId } = data;
      const createData = await this.RiskPredictionModule.findByIdAndUpdate(id, {
        ...data,
        organizationId: activeUser.organizationId,
      });
      return createData;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findByParentIdAndUpdate(userId, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      const update = await this.RiskPredictionModule.updateMany(
        {
          itemId: id?.toString(),
        },
        {
          $set: { currentVersion: false },
        },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteRiskPrediction(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.RiskPredictionModule.findByIdAndUpdate(
        id,
        {
          deletedAt: true,
        },
      );
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getByIdRiskPrediction(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.RiskPredictionModule.findById(id);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getByIdRiskPredictionHistory(user, id, query) {
    try {
      const { skip, limit } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const result = await this.RiskPredictionModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        itemId: id,
        currentVersion: false,
      })
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean();

      result.reverse();

      const finalResult = [];

      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        const userData: any = await this.npdModule.findById(item?.npdId);

        finalResult.push({
          ...item,
          npdData: userData?.projectName,
        });
      }

      const count = await this.RiskPredictionModule.count({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        itemId: id,
        currentVersion: false,
      });

      return { data: finalResult, count: count };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllRiskPrediction(userId, query) {
    try {
      const {
        skip,
        limit,
        searchTerm,
        typeFilter,
        impactFilter,
        riskPredictionFilter,
        statusFilter,
      } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });
      let whereCondition: any = {
        organizationId: activeUser?.organizationId,
        deletedAt: false,
        currentVersion: true,
      };
      if (
        searchTerm &&
        searchTerm !== '' &&
        searchTerm !== undefined &&
        searchTerm !== null
      ) {
        let users: any = await this.prisma.user.findMany({
          where: {
            AND: [
              { organizationId: activeUser.organizationId },
              {
                OR: [
                  { username: { contains: searchTerm, mode: 'insensitive' } },
                  { firstname: { contains: searchTerm, mode: 'insensitive' } },
                  { lastname: { contains: searchTerm, mode: 'insensitive' } },
                  { email: { contains: searchTerm, mode: 'insensitive' } },
                ],
              },
            ],
          },
        });

        const userIds = users.map((item) => item.id);

        whereCondition = {
          ...whereCondition,
          $or: [
            { itemName: { $regex: new RegExp(searchTerm, 'i') } },
            { 'pic.id': { $in: userIds } }, //
          ],
        };
      }

      if (
        typeFilter &&
        typeFilter !== '' &&
        typeFilter !== undefined &&
        typeFilter !== null
      ) {
        const selectedTypes = typeFilter.split(',');
        whereCondition = {
          ...whereCondition,
          riskType: { $in: selectedTypes },
        };
      }

      if (
        impactFilter &&
        impactFilter !== '' &&
        impactFilter !== undefined &&
        impactFilter !== null
      ) {
        const selectedImpact = impactFilter.split(',');
        whereCondition = {
          ...whereCondition,
          impact: { $in: selectedImpact },
        };
      }

      if (
        riskPredictionFilter &&
        riskPredictionFilter !== '' &&
        riskPredictionFilter !== undefined &&
        riskPredictionFilter !== null
      ) {
        const selectedRiskPrediction = riskPredictionFilter.split(',');
        whereCondition = {
          ...whereCondition,
          riskPrediction: { $in: selectedRiskPrediction },
        };
      }

      if (
        statusFilter &&
        statusFilter !== '' &&
        statusFilter !== undefined &&
        statusFilter !== null
      ) {
        const selectedStatus = statusFilter.split(',');
        whereCondition = {
          ...whereCondition,
          status: { $in: selectedStatus },
        };
      }

      const result = await this.RiskPredictionModule.find(whereCondition)
        .limit(limit)
        .skip((skip - 1) * limit)
        .lean();

      result.reverse();
      const finalResult = [];

      for (let i = 0; i < result.length; i++) {
        const item = result[i];
        const objectId = new ObjectId(item?.npdId);
        const userData: any = await this.npdModule.findById(objectId);

        finalResult.push({
          ...item,
          npdData: userData?.projectName,
        });
      }

      const count = await this.RiskPredictionModule.count({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        currentVersion: true,
      });

      return { data: finalResult, count: count };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllOpenItemByNpdId(user, id, momId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const findByDup = await this.DiscussionItemModule.find({
        organizationId: activeUser.organizationId,
        npdId: id,
        momId: momId,
        // currentVersion: true,
      });
      let momIdBy: any = id;
      if (findByDup?.length > 0) {
        return findByDup;
      } else {
        const result = await this.DiscussionItemModule.find({
          organizationId: activeUser.organizationId,
          npdId: id,
          status: 'Open',
          currentVersion: true,
        });

        const finalResult = [];
        for (let i = 0; i < result.length; i++) {
          const item = result[i];

          await this.DiscussionItemModule.findByIdAndUpdate(item?._id, {
            currentVersion: false,
          });

          await this.DiscussionItemModule.updateOne(
            {
              parentId: item?._id.toString(),
            },
            {
              $set: { currentVersion: false },
            },
          );

          finalResult.push({
            selectedDptId: item?.selectedDptId,
            discussedItem: item?.discussedItem,
            discussedItemDescription: item?.discussedItemDescription,
            criticality: item?.criticality,
            impact: item?.impact,
            riskPrediction: item?.riskPrediction,
            status: item?.status,
            targetDate: item?.targetDate,
            pic: item?.pic,
            actionPlans: item?.actionPlans,
            actionPlansIds: item?.actionPlansIds,
            dropDptValue: item?.dropDptValue,
            addButtonStatus: item?.addButtonStatus,
            buttonStatus: item?.buttonStatus,
            report: item?.report,
            npdId: item?.npdId,
            momId: momId,
            parentId: item?._id,
            currentVersion: true,
          });
        }
        const createManyBynPD = await this.DiscussionItemModule.insertMany(
          finalResult,
        );
        const findByMomId = await this.MinutesOfMeetingModule.findById(momId);
        let npdIds: string[] = Array.isArray(findByMomId?.npdIds)
          ? findByMomId.npdIds
          : [];
        let payload = {
          npdIds: npdIds.includes(id) ? npdIds : [...npdIds, id],
        };
        const updateNpdId = await this.MinutesOfMeetingModule.findByIdAndUpdate(
          momId,
          payload,
        );
        return createManyBynPD;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAllOpenDelayedItemByNpdId(user, id, momId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const findByDup = await this.DelayedItemModule.find({
        organizationId: activeUser.organizationId,
        npdId: id,
        momId: momId,
        // currentVersion: true,
      });
      let momIdBy: any = id;
      if (findByDup?.length > 0) {
        return findByDup;
      } else {
        const result = await this.DelayedItemModule.find({
          organizationId: activeUser.organizationId,
          npdId: id,
          status: 'Open',
          currentVersion: true,
        });

        const finalResult = [];
        for (let i = 0; i < result.length; i++) {
          const item = result[i];

          await this.DelayedItemModule.findByIdAndUpdate(item?._id, {
            currentVersion: false,
          });

          await this.DelayedItemModule.updateOne(
            {
              parentId: item?._id.toString(),
            },
            {
              $set: { currentVersion: false },
            },
          );

          finalResult.push({
            selectedDptId: item?.selectedDptId,
            delayedItem: item?.delayedItem,
            delayedItemDescription: item?.delayedItemDescription,
            criticality: item?.criticality,
            impact: item?.impact,
            riskPrediction: item?.riskPrediction,
            status: item?.status,
            targetDate: item?.targetDate,
            pic: item?.pic,
            actionPlans: item?.actionPlans,
            actionPlansIds: item?.actionPlansIds,
            dropDptValue: item?.dropDptValue,
            addButtonStatus: item?.addButtonStatus,
            buttonStatus: item?.buttonStatus,
            report: item?.report,
            npdId: item?.npdId,
            momId: momId,
            parentId: item?._id,
            currentVersion: true,
          });
        }
        const createManyBynPD = await this.DelayedItemModule.insertMany(
          finalResult,
        );
        const findByMomId = await this.MinutesOfMeetingModule.findById(momId);
        let npdIds: string[] = Array.isArray(findByMomId?.npdIds)
          ? findByMomId.npdIds
          : [];
        let payload = {
          npdIds: npdIds.includes(id) ? npdIds : [...npdIds, id],
        };
        const updateNpdId = await this.MinutesOfMeetingModule.findByIdAndUpdate(
          momId,
          payload,
        );
        return createManyBynPD;
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async dashBoardData(user, id, query) {
    try {
      const { skip, limit, year, projectType } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const yearPipeline: any = [
        {
          $match: {
            deletedAt: false,
          },
        },
        {
          $project: {
            createdAt: 1,
            projectTypeData: 1,
            year: { $year: { $toDate: '$createdAt' } },
          },
        },
        {
          $match: {
            year: { $ne: null }, // Filter out documents with null year
          },
        },
        {
          $group: {
            _id: {
              year: '$year',
              projectTypeData: '$projectTypeData.label',
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.year',
            Domestic: {
              $sum: {
                $cond: [
                  { $eq: ['$_id.projectTypeData', 'Domestic'] },
                  '$count',
                  0,
                ],
              },
            },
            Export: {
              $sum: {
                $cond: [
                  { $eq: ['$_id.projectTypeData', 'Export'] },
                  '$count',
                  0,
                ],
              },
            },
            count: { $sum: '$count' },
          },
        },
        {
          $project: {
            _id: 0,
            year: '$_id',
            Domestic: 1,
            Export: 1,
            count: 1,
          },
        },
        {
          $sort: { year: 1 },
        },
      ];

      const departmentProgressPipeLine = [
        {
          $match: {
            isMileStone: false,
            npdId: id,
            type: 'department',
          },
        },
        {
          $group: {
            _id: { TaskName: '$TaskName' },
            totalProgress: { $sum: { $toInt: '$Progress' } },
            taskCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            TaskName: '$_id.TaskName',
            totalProgress: 1,
            taskCount: 1,
          },
        },
      ];

      const mileStonePipeLine = [
        {
          $match: {
            isMileStone: true,
            npdId: id,
          },
        },
        {
          $group: {
            _id: {
              category: '$category',
              milestoneType: '$TaskName',
            },
            StartDate: { $first: '$StartDate' },
            taskCount: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$_id.category', // Group by category
            milestones: {
              $push: {
                milestoneType: '$_id.milestoneType',
                StartDate: '$StartDate',
                taskCount: '$taskCount',
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            category: '$_id',
            milestones: 1,
          },
        },
      ];
      let whereCondition: any = {
        organizationId: activeUser?.organizationId,
        deletedAt: false,
        isActive: true,
      };

      if (
        projectType &&
        projectType !== '' &&
        projectType !== undefined &&
        projectType !== null
      ) {
        whereCondition = {
          ...whereCondition,
          'projectTypeData.label': projectType,
        };
      }

      if (year) {
        const startDate = new Date(`${Number(year)}-01-01T00:00:00.000Z`); // Jan 1, 2025
        const endDate = new Date(`${Number(year)}-12-31T23:59:59.999Z`); // Dec 31, 2025
        whereCondition.createdAt = { $gte: startDate, $lte: endDate };
      }

      let result: any = await this.npdModule
        .find(whereCondition)
        .limit(Number(limit))
        .skip((Number(skip) - 1) * Number(limit))
        .lean()
        .sort({ createdAt: -1, _id: -1 });

      let count: number = await this.npdModule.countDocuments(whereCondition);
      const finalResult: any = [];
      // Loop through the result and enhance the data
      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        let model = [...item?.customer];
        const modelList = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            id: { in: model },
          },
        });

        const user = await this.prisma.user.findFirst({
          where: { id: item?.createdBy },
        });

        finalResult.push({
          ...item,
          npdNo: item?.serialNumber,
          createdBy: user?.username,
          customer: modelList?.map((ele: any) => ele.entityName),
          pendingWith: '',
        });
      }

      const yearWiseData = await this.npdModule.aggregate(yearPipeline);
      const departmentWiseData = await this.NpdGanttChartModule.aggregate(
        departmentProgressPipeLine,
      );
      const mileStoneData = await this.NpdGanttChartModule.aggregate(
        mileStonePipeLine,
      );
      const radarChartData = await this.getNpdIdDataRadarChartData(user, id);
      const totalNpd = await this.npdModule.count({
        organizationId: activeUser.organizationId,
        deletedAt: false,
      });
      const totalNpdData = await this.npdModule.findById(id);
      const milestoneColors: any = {
        SOP: '#8884d8', // Purple
        PPT: '#ff6666', // Red
        MPT: '#82ca9d', // Green
        PT: '#ffcc00', // Yellow
      };

      const categories: any = {
        Customer: 3,
        DNKI: 2,
        Supplier: 1,
      };
      const status = totalNpdData?.status;
      const dataBy = mileStoneData.flatMap(
        (item) =>
          item.milestones
            .map((milestone) => {
              const startDate = milestone?.StartDate;
              if (!startDate) {
                console.warn(`Missing StartDate for milestone:`, milestone);
                return null; // Skip invalid milestones
              }
              const date = new Date(startDate);
              const month = date.toLocaleString('en-US', { month: 'short' });
              const day = date.getDate();
              return {
                x: month,
                y: categories[item.category] || 0, // Default to 0 if category is missing
                milestoneType: milestone?.milestoneType || 'Unknown', // Provide fallback value
                milestoneDate: `${month} ${day}`,
                fill: milestoneColors[milestone?.milestoneType] || '#000', // Default color
                mileStoneCategory: item?.category || 'Unknown',
                mileStoneDateBy: startDate,
              };
            })
            .filter(Boolean), // Remove null values
      );

      const sortedData = dataBy.sort((a, b) => {
        const monthOrder = {
          Jan: 1,
          Feb: 2,
          Mar: 3,
          Apr: 4,
          May: 5,
          Jun: 6,
          Jul: 7,
          Aug: 8,
          Sep: 9,
          Oct: 10,
          Nov: 11,
          Dec: 12,
        };
        const monthComparison = monthOrder[a.x] - monthOrder[b.x];
        if (monthComparison !== 0) return monthComparison;

        const dateA = new Date(a.mileStoneDateBy);
        const dateB = new Date(b.mileStoneDateBy);
        return dateA.getTime() - dateB.getTime();
      });

      return {
        yearWiseData,
        departmentWiseData,
        mileStoneData: sortedData,
        radarChartData,
        totalNpd,
        status,
        tableData: { data: finalResult, total: count },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getNpdIdDataRadarChartData(user, id) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const result: any = await this.RiskPredictionModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        status: 'Open',
        npdId: id,
        currentVersion: true,
      }).lean();

      const groupData = result?.reduce((acc: any, item: any) => {
        if (!acc[item?.selectedDptId]) {
          acc[item?.selectedDptId] = [];
        }
        acc[item?.selectedDptId].push(item?.riskPrediction);
        return acc;
      }, {});

      const minValues = Object.keys(groupData)?.map((dept) => {
        return {
          dept,
          riskScore: Math.min(...groupData[dept]),
        };
      });

      const finalResult = [];

      for (let i = 0; i < minValues.length; i++) {
        const item = minValues[i];

        const entityData = await this.prisma.entity.findMany({
          where: {
            id: item?.dept,
            organizationId: user.organizationId,
          },
        });
        finalResult.push({
          ...item,
          dept: entityData?.map((ele: any) => ele?.entityName),
        });
      }
      const findDepartment: any = await this.NpdGanttChartModule.find({
        organizationId: activeUser.organizationId,
        deletedAt: false,
        type: 'department',
        npdId: id,
      });
      // if(minValues?.length !== 0 ){
      const filterByDept = findDepartment?.map((ele: any) => {
        let data = {
          dept: [ele?.TaskName],
          riskScore: 5,
        };
        finalResult.push(data);
      });
      // }
      const filteredResult = finalResult?.filter((item, index, self) => {
        const firstIndex = self?.findIndex(
          (obj) => obj?.dept[0]?.trim() === item?.dept[0]?.trim(),
        );
        return firstIndex === index || item?.riskScore !== 5;
      });

      return filteredResult;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
