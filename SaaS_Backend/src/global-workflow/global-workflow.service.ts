import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Logger } from 'winston';
import { GlobalWorkflow } from 'src/global-workflow/schema/global-workflow.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GlobalRoles } from 'src/user/schema/globlaRoles.schema';
import { EntityService } from 'src/entity/entity.service';
import { Doctype } from 'src/doctype/schema/doctype.schema';

@Injectable()
export class GlobalWorkflowService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(GlobalWorkflow.name)
    private readonly globalWorkflowModel: Model<GlobalWorkflow>,
    @InjectModel(GlobalRoles.name)
    private readonly globalRolesModel: Model<GlobalRoles>,
    private readonly entityService: EntityService,
    @InjectModel(Doctype.name)
    private doctypeModel: Model<Doctype>,
  ) {}

  async createGlobalWorkflow(data, user, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const workflowExist = await this.globalWorkflowModel.findOne({
        organizationId: activeUser.organizationId,
        title: { $regex: new RegExp(`^${data.title}$`, 'i') },
      });
      if (workflowExist) {
        throw new HttpException(
          {
            message: `Workflow with Title: '${data.title}', already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }
      const finalData = {
        ...data,
        organizationId: activeUser.organizationId,
      };
      await this.globalWorkflowModel.create(finalData);
      return {
        responseMessage: 'Workflow Created Successfully',
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Creating Workflow Failed`,
        'global-workflow.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to create Workflow. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateGlobalWorkflow(id, data, user, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const workflowExist = await this.globalWorkflowModel.findOne({
        _id: { $ne: id },
        organizationId: activeUser.organizationId,
        title: { $regex: new RegExp(`^${data.title}$`, 'i') },
      });
      if (workflowExist) {
        throw new HttpException(
          {
            message: `Workflow with Title: '${data.title}', already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }
      await this.globalWorkflowModel.findByIdAndUpdate(id, data);
      return {
        responseMessage: 'Workflow Updated Successfully',
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Updating Workflow Failed`,
        'global-workflow.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to update Workflow. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteGlobalWorkflow(id, randomNumber) {
    try {
      const isWorkflowInDocType = await this.doctypeModel.find({
        workflowId: id,
      });
      if (isWorkflowInDocType.length > 0) {
        throw new HttpException(
          {
            message: `The Workflow you are trying to delete is being used in Document Type: '${isWorkflowInDocType
              .map((item: any) => item.documentTypeName)
              .join(', ')}'`,
          },
          HttpStatus.CONFLICT,
        );
      }
      await this.globalWorkflowModel.findByIdAndDelete(id);
      return {
        responseMessage: 'Workflow Deleted Successfully',
      };
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} Deleting Workflow Failed`,
        'global-workflow.service.ts',
      );
      if (error instanceof HttpException) {
        throw error; // Re-throw if it's a known HttpException
      }
      throw new HttpException(
        {
          message: 'Failed to delete Workflow. Please try again later.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGlobalWorkflowTableData(query, user, randomNumber) {
    try {
      const { page, limit } = query;
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const getAllWorkflow = await this.globalWorkflowModel
        .find({
          organizationId: activeUser.organizationId,
        })
        .sort({ title: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('title');

      const getTotalCount = await this.globalWorkflowModel.count({
        organizationId: activeUser.organizationId,
      });
      return {
        tableData: getAllWorkflow,
        totalCount: getTotalCount,
      };
    } catch (error) {}
  }

  async getGlobalWorkflowById(id, randomNumber) {
    try {
      const getWorkflow = await this.globalWorkflowModel.findById(id);
      return getWorkflow;
    } catch (error) {}
  }

  async getOldGlobalWorkflowForTranscation(id, user, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      const getWorkflow: any = await this.globalWorkflowModel.findById(id);

      // 1. Collect all unique userIds from the workflow
      const userIdsSet = new Set<string>();
      for (const stage of getWorkflow.workflow) {
        if (stage.ownerSettings?.type === 'Named Users') {
          for (const userId of stage.ownerSettings.selectedUsers || []) {
            if (userId) {
              userIdsSet.add(userId);
            }
          }
        }
        if (stage.ownerSettings?.type === 'Dept PIC') {
          const departmentId =
            stage.ownerSettings?.selectedDepartment === 'Creator Department'
              ? activeUser.entityId
              : stage.ownerSettings?.selectedDepartment;
          const getPIC = await this.prisma.entity.findFirst({
            where: {
              id: departmentId,
              organizationId: activeUser.organizationId,
            },
          });
          stage.ownerSettings.selectedUsers = getPIC.pic;
          for (const userId of getPIC.pic || []) {
            if (userId) {
              userIdsSet.add(userId);
            }
          }
        }
        if (stage.ownerSettings?.type === 'Dept Manager') {
          const departmentId =
            stage.ownerSettings?.selectedDepartment === 'Creator Department'
              ? activeUser.entityId
              : stage.ownerSettings?.selectedDepartment;
          const getManager = await this.prisma.entity.findFirst({
            where: {
              id: departmentId,
              organizationId: activeUser.organizationId,
            },
          });
          stage.ownerSettings.selectedUsers = getManager.manager;
          if (getManager.manager) {
            userIdsSet.add(getManager.manager);
          }
        }
        if (stage.ownerSettings?.type === 'Dept User') {
          const departmentId =
            stage.ownerSettings?.selectedDepartment === 'Creator Department'
              ? activeUser.entityId
              : stage.ownerSettings?.selectedDepartment;
          const getDeptUser = await this.prisma.user.findMany({
            where: {
              entityId: departmentId,
              organizationId: activeUser.organizationId,
            },
            select: {
              id: true,
              firstname: true,
              lastname: true,
            },
          });
          stage.ownerSettings.userList = getDeptUser;
        }
      }

      // 2. Fetch all user details in parallel
      const userIds = Array.from(userIdsSet);
      const userDetails = await Promise.all(
        userIds.map((id) =>
          this.prisma.user.findFirst({
            where: { id },
          }),
        ),
      );

      // 3. Map userId to user object
      const userMap = new Map<string, any>();
      userIds.forEach((id, index) => {
        userMap.set(id, userDetails[index]);
      });

      // 4. Replace selectedUsers in each stage
      for (const stage of getWorkflow.workflow) {
        if (stage.ownerSettings?.type === 'Named Users') {
          stage.ownerSettings.selectedUsers =
            stage.ownerSettings.selectedUsers.map((userId: string) =>
              userMap.get(userId),
            );
        }
        if (stage.ownerSettings?.type === 'Dept PIC') {
          stage.ownerSettings.selectedUsers =
            stage.ownerSettings.selectedUsers.map((userId: string) =>
              userMap.get(userId),
            );
        }
        if (stage.ownerSettings?.type === 'Dept Manager') {
          stage.ownerSettings.selectedUsers = userMap.get(
            stage.ownerSettings.selectedUsers,
          );
        }
      }

      return getWorkflow;
    } catch (error) {
      console.error('Error in getWorkflowForTranscation:', error);
      throw error;
    }
  }

  async getGlobalWorkflowForTranscation(id, user, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });

      const getWorkflow: any = await this.globalWorkflowModel
        .findById(id)
        .select('title workflow');

      if (!getWorkflow || !getWorkflow.workflow) {
        return {};
      }

      const userIdsSet = new Set<string>();

      for (const stage of getWorkflow.workflow) {
        if (Array.isArray(stage.ownerSettings)) {
          for (const conditionGroup of stage.ownerSettings) {
            stage.status = 'pending';
            for (const condition of conditionGroup) {
              condition.status = 'pending';
              const type = condition.type;

              if (type === 'Named Users') {
                for (const userId of condition.selectedUsers || []) {
                  if (userId) {
                    userIdsSet.add(userId);
                  }
                }
              }

              if (type === 'PIC Of') {
                let departmentId = condition.selectedDepartment;
                if (
                  condition.selectedDepartment === "From Creator's Organization"
                ) {
                  const getHierarchy =
                    await this.entityService.getFullHierarchy(
                      activeUser.entityId,
                      activeUser.organizationId,
                    );
                  departmentId = getHierarchy.breadcrumb.find(
                    (item: any) =>
                      item.entityTypeId === condition.selectedEntityType,
                  )?.entityId;
                }
                const getPIC = await this.prisma.entity.findFirst({
                  where: {
                    id: departmentId,
                    organizationId: activeUser.organizationId,
                  },
                });
                condition.selectedUsers = getPIC?.pic || [];
                for (const userId of getPIC?.pic || []) {
                  if (userId) {
                    userIdsSet.add(userId);
                  }
                }
              }

              if (type === 'Manager Of') {
                let departmentId = condition.selectedDepartment;
                if (
                  condition.selectedDepartment === "From Creator's Organization"
                ) {
                  const getHierarchy =
                    await this.entityService.getFullHierarchy(
                      activeUser.entityId,
                      activeUser.organizationId,
                    );
                  departmentId = getHierarchy.breadcrumb.find(
                    (item: any) =>
                      item.entityTypeId === condition.selectedEntityType,
                  )?.entityId;
                }
                const getManager = await this.prisma.entity.findFirst({
                  where: {
                    id: departmentId,
                    organizationId: activeUser.organizationId,
                  },
                });
                condition.selectedUsers = [getManager?.manager].filter(Boolean);
                if (getManager?.manager) {
                  userIdsSet.add(getManager.manager);
                }
              }

              if (type === 'Head Of') {
                let departmentId = condition.selectedDepartment;
                if (
                  condition.selectedDepartment === "From Creator's Organization"
                ) {
                  const getHierarchy =
                    await this.entityService.getFullHierarchy(
                      activeUser.entityId,
                      activeUser.organizationId,
                    );
                  departmentId = getHierarchy.breadcrumb.find(
                    (item: any) =>
                      item.entityTypeId === condition.selectedEntityType,
                  )?.entityId;
                }
                const getHead = await this.prisma.entity.findFirst({
                  where: {
                    id: departmentId,
                    organizationId: activeUser.organizationId,
                  },
                });
                condition.selectedUsers = getHead?.users || [];
                for (const userId of getHead?.users || []) {
                  if (userId) {
                    userIdsSet.add(userId);
                  }
                }
              }

              if (type === 'User Of') {
                let departmentId = condition.selectedDepartment;
                if (
                  condition.selectedDepartment === "From Creator's Organization"
                ) {
                  const getHierarchy =
                    await this.entityService.getFullHierarchy(
                      activeUser.entityId,
                      activeUser.organizationId,
                    );
                  departmentId = getHierarchy.breadcrumb.find(
                    (item: any) =>
                      item.entityTypeId === condition.selectedEntityType,
                  )?.entityId;
                }
                const getDeptUser = await this.prisma.user.findMany({
                  where: {
                    entityId: departmentId,
                    organizationId: activeUser.organizationId,
                  },
                  select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    avatar: true,
                  },
                });
                condition.userList = getDeptUser.map((item: any) => ({
                  ...item,
                  value: item.id,
                  label: item.email,
                  userId: item.id,
                }));
              }

              if (type === 'Global Role Of') {
                const getGlobalRole = await this.globalRolesModel.findById(
                  condition.selectedGlobalRole,
                );
                const getGlobalRoleUsers = await this.prisma.user.findMany({
                  where: {
                    id: {
                      in: getGlobalRole.assignedTo,
                    },
                  },
                  select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                    email: true,
                    avatar: true,
                  },
                });
                condition.userList = getGlobalRoleUsers.map((item: any) => ({
                  ...item,
                  value: item.id,
                  label: item.email,
                  userId: item.id,
                }));
              }
            }
          }
        }
      }

      const userIds = Array.from(userIdsSet);
      const userDetails = await Promise.all(
        userIds.map((id) =>
          this.prisma.user.findFirst({
            where: { id },
            select: {
              id: true,
              firstname: true,
              lastname: true,
              email: true,
              avatar: true,
            },
          }),
        ),
      );

      const userMap = new Map<string, any>();
      userIds.forEach((id, index) => {
        const detail = userDetails[index];
        if (detail) {
          userMap.set(id, {
            ...detail,
            value: detail.id,
            label: detail.email,
            userId: detail.id,
          });
        }
      });

      // Replace selectedUsers with user objects
      for (const stage of getWorkflow.workflow) {
        if (Array.isArray(stage.ownerSettings)) {
          for (const conditionGroup of stage.ownerSettings) {
            for (const condition of conditionGroup) {
              if (
                condition.type === 'Named Users' ||
                condition.type === 'PIC Of' ||
                condition.type === 'Manager Of' ||
                condition.type === 'Head Of'
              ) {
                condition.selectedUsers = (condition.selectedUsers || []).map(
                  (userId: string) => userMap.get(userId),
                );
              }
            }
          }
        }
      }

      return getWorkflow;
    } catch (error) {
      console.error('Error in getWorkflowForTranscation:', error);
      throw error;
    }
  }
}
