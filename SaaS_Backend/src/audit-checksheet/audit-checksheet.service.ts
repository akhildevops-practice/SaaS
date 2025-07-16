import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AuditChecksheetTemplate } from './schema/audit-checksheet-template.schema';
import { AuditChecksheets } from './schema/audit-checksheet.schema';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
import { RefsService } from 'src/refs/refs.service';
import { EmailService } from 'src/email/email.service';
import auditTrial from '../watcher/changesStream';
import { AppField } from 'src/app-field/schema/app-field.schema';
import { createdBy } from 'src/utils/helper';
import { auditTrail } from 'src/audit-trial/schema/audit-trial.schema';
import { GlobalRoles } from 'src/user/schema/globlaRoles.schema';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AuditChecksheetService {
  constructor(
    @InjectModel(AuditChecksheetTemplate.name)
    private AuditChecksheetTemplateModel: Model<AuditChecksheetTemplate>,
    @InjectModel(AuditChecksheets.name)
    private AuditChecksheetsModel: Model<AuditChecksheets>,
    @InjectModel(AppField.name)
    private appFieldModel: Model<AppField>,
    @InjectModel(auditTrail.name)
    private auditTrailModel: Model<auditTrail>,
    @Inject('Logger') private readonly logger: Logger,
    private readonly emailService: EmailService,
    private prisma: PrismaService,
    private refsService: RefsService,
    @InjectModel(GlobalRoles.name)
    private readonly globalRolesModel: Model<GlobalRoles>,
  ) {}

  async createAuditChecksheetTemplate(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/createAuditChecksheetTemplate`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    const createTemplate = {
      ...data,
      organizationId: activeUser.organizationId,
    };

    await this.AuditChecksheetTemplateModel.create(createTemplate);
  }

  async getAuditChecksheetTemplates(user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheetTemplates`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    const getAllTemplates = await this.AuditChecksheetTemplateModel.find({
      organizationId: activeUser.organizationId,
    }).sort({ createdAt: -1 });
    return getAllTemplates;
  }

  async getAuditChecksheetTemplateById(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheetTemplateById`,
      'audit-checksheet.service.ts',
    );
    const getTemplate = await this.AuditChecksheetTemplateModel.findById(id);

    return getTemplate;
  }

  async updateAuditChecksheetTemplate(id, data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/updateAuditChecksheetTemplate`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    await this.AuditChecksheetTemplateModel.findByIdAndUpdate(id, data);
  }

  async checksheetAppField(userId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/checksheetAppField`,
      'audit-checksheet.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });

      const appField = await this.appFieldModel.find({
        organizationId: activeUser.organizationId,
      });

      const entityType = await this.prisma.entityType.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
      });

      const combinedResults = [
        ...appField.map((field) => ({
          id: field._id.toString(), // or field.id depending on the structure
          name: field.name,
          type: 'appFields',
        })),
        ...entityType.map((entity) => ({
          id: entity.id,
          name: entity.name,
          type: 'entityType',
        })),
      ];

      return combinedResults;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async getAppfieldOptions(query, userId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAppfieldOptions`,
      'audit-checksheet.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const { fieldId, type } = query;
      let options;

      if (type === 'appFields') {
        const appFieldOptions = await this.appFieldModel.findById(fieldId);
        options = appFieldOptions.options;
      }

      if (type === 'entityType') {
        const entityTypeOptions = await this.prisma.entity.findMany({
          where: {
            organizationId: activeUser.organizationId,
            entityTypeId: fieldId,
          },
        });
        options = entityTypeOptions.map((item: any) => {
          return {
            id: item.id,
            name: item.entityName,
          };
        });
      }
      return options;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  async createAuditChecksheet(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/createAuditChecksheet`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    const auditTrail = await auditTrial(
      'auditchecksheets',
      'Audit Checksheet',
      'Audit Checksheet Transaction',
      user.user,
      activeUser,
      randomNumber,
    );

    setTimeout(async () => {
      const create = {
        ...data,
        organizationId: activeUser.organizationId,
        createdBy: activeUser.id,
      };

      const result = await this.AuditChecksheetsModel.create(create);
      return result;
    }, 1000);
  }

  async updateAuditCheckSheet(id, data, user, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} POST api/auditchecksheet/updateAuditChecksheetTemplate`,
        'audit-checksheet.service.ts',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.user.id,
        },
      });

      const auditTrail = await auditTrial(
        'auditchecksheets',
        'Audit Checksheet',
        'Audit Checksheet Transaction',
        user.user,
        activeUser,
        randomNumber,
      );

      setTimeout(async () => {
        const result = await this.AuditChecksheetsModel.findByIdAndUpdate(
          id,
          data,
        );
        return result;
      }, 1000);
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAuditChecksheets(query, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheets`,
      'audit-checksheet.service.ts',
    );

    let { year, ids, dates }: any = query;

    year = await this.yearFormater(year);

    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    let whereCondition: any = {
      organizationId: activeUser.organizationId,
    };

    if (ids) {
      whereCondition.auditChecksheetTemplateId = ids;
    }

    if (dates && typeof dates === 'string' && dates.includes(',')) {
      const dateArray = dates.split(',').map((date) => {
        const [day, month, year] = date.split('-').map(Number);
        return new Date(year, month - 1, day); // Convert to JavaScript Date
      });
      whereCondition.createdAt = {
        $gte: dateArray[0], // First date as $gte
        $lte: dateArray[1], // Second date as $lte
      };
    } else {
      whereCondition.createdAt = {
        $gte: new Date(year[0]),
        $lte: new Date(year[1]),
      };
    }

    const getAll = await this.AuditChecksheetsModel.find(whereCondition).sort({
      createdAt: -1,
    });

    for (let i = 0; i < getAll.length; i++) {
      const createdBy = await this.prisma.user.findFirst({
        where: {
          organizationId: activeUser.organizationId,
          id: getAll[i].createdBy,
        },
      });
      getAll[i].createdBy = createdBy.firstname + ' ' + createdBy.lastname;
    }
    return getAll;
  }

  async getAuditChecksheetById(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheetById`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    const getChecksheet: any = await this.AuditChecksheetsModel.findById(id);

    // 1. Collect all unique entityTypeIds
    const entityTypeIds = new Set<string>();
    const appFieldIds = new Set<string>();
    const userIds = new Set<string>();
    const workflowEntityIds: any = new Set();
    const globalRoleIds: any = new Set();

    //From Workflow
    if (
      getChecksheet.workflowDetails &&
      getChecksheet.workflowDetails !== 'default' &&
      getChecksheet.workflowDetails !== 'none' &&
      Array.isArray(getChecksheet.workflowDetails?.workflow)
    ) {
      for (const stage of getChecksheet.workflowDetails.workflow) {
        if (Array.isArray(stage.ownerSettings)) {
          for (const group of stage.ownerSettings) {
            for (const condition of group) {
              if (
                condition.type === 'Named Users' ||
                condition.type === 'PIC Of' ||
                condition.type === 'Manager Of' ||
                condition.type === 'User Of' ||
                condition.type === 'Head Of' ||
                condition.type === 'Global Role Of'
              ) {
                (condition.selectedUsers || []).forEach((user: string) => {
                  userIds.add(user);
                });
                if (condition.type === 'User Of') {
                  workflowEntityIds.add(condition.selectedDepartment);
                }
                if (condition.type === 'Global Role Of') {
                  globalRoleIds.add(condition.selectedGlobalRole);
                }
              }
            }
          }
        }
      }
    }

    let globalRoles;
    if (globalRoleIds.size > 0) {
      globalRoles = await this.globalRolesModel
        .find({
          _id: { $in: Array.from(globalRoleIds) },
        })
        .select('assignedTo');
      const getUsersId = globalRoles.flatMap((item: any) => item.assignedTo);
      getUsersId.forEach((user: string) => {
        userIds.add(user);
      });
    }

    const cleanedUserIds = new Set([...userIds].filter((id) => id !== null));

    // From formHeader
    for (const formFields of getChecksheet.formHeaderContents) {
      if (formFields.datatype === 'entityType') {
        entityTypeIds.add(formFields.dataOptions);
      }
      if (formFields.datatype === 'appFields') {
        appFieldIds.add(formFields.dataOptions);
      }
      if (formFields.datatype === '@user') {
        userIds.add(formFields.userId);
      }
    }

    // From tableFields
    for (const tableField of getChecksheet.tableFieldsContents) {
      if (tableField.tableId) {
        for (const row of tableField.tableContent) {
          for (const cell of row.cells) {
            if (cell.datatype === 'entityType') {
              entityTypeIds.add(cell.dataOptions);
            }
            if (cell.datatype === 'appFields') {
              appFieldIds.add(cell.dataOptions);
            }
          }
        }
      } else if (tableField.sectionId) {
        for (const element of tableField?.sectionContent) {
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'entityType'
          ) {
            entityTypeIds.add(element.dataOptions);
          }
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'appFields'
          ) {
            appFieldIds.add(element.dataOptions);
          }
        }
      }
    }

    getChecksheet?.workflowDetails?.workflowHistory?.forEach((user: string) => {
      userIds.add(user);
    });

    // 2. Fetch all entity options in one go
    const allEntities = await this.prisma.entity.findMany({
      where: {
        entityTypeId: { in: Array.from(entityTypeIds) },
      },
    });

    const allAppFields = await this.appFieldModel.find({
      organizationId: activeUser.organizationId,
      _id: { $in: Array.from(appFieldIds) },
    });

    const allUsers = await this.prisma.user.findMany({
      where: {
        OR: [
          { id: { in: Array.from(cleanedUserIds) } },
          { entityId: { in: Array.from(workflowEntityIds) } },
        ],
      },
    });

    // 3. Group entities by entityTypeId
    const entityOptionsMap = new Map<string, any[]>();
    for (const entity of allEntities) {
      if (!entityOptionsMap.has(entity.entityTypeId)) {
        entityOptionsMap.set(entity.entityTypeId, []);
      }
      entityOptionsMap.get(entity.entityTypeId).push({
        id: entity.id,
        name: entity.entityName,
      });
    }

    const appFieldOptionsMap = new Map<string, any[]>();
    for (const field of allAppFields) {
      appFieldOptionsMap.set(field._id.toString(), field.options || []);
    }

    const usersMap = new Map<string, string>();
    const userMapWorkflow = new Map(allUsers.map((user) => [user.id, user]));
    for (const user of allUsers) {
      usersMap.set(user.id, `${user.firstname} ${user.lastname}`);
    }

    if (
      getChecksheet.workflowDetails !== 'default' &&
      getChecksheet.workflowDetails !== 'none' &&
      !!getChecksheet?.workflowDetails
    ) {
      for (const history of getChecksheet?.workflowDetails?.workflowHistory) {
        history.actionByName = usersMap.get(history.actionBy);
      }
      for (const stage of getChecksheet?.workflowDetails?.workflow) {
        if (Array.isArray(stage.ownerSettings)) {
          for (const group of stage.ownerSettings) {
            for (const condition of group) {
              if (
                condition.type === 'Named Users' ||
                condition.type === 'PIC Of' ||
                condition.type === 'Manager Of' ||
                condition.type === 'User Of' ||
                condition.type === 'Head Of' ||
                condition.type === 'Global Role Of'
              ) {
                condition.selectedUsers = (condition.selectedUsers || [])
                  .map((userId: string) => {
                    const user = userMapWorkflow.get(userId);
                    return user
                      ? {
                          ...user,
                          value: user.id,
                          label: user.email,
                          userId: user.id,
                        }
                      : null;
                  })
                  .filter(Boolean);

                condition.completedBy = (condition.completedBy || [])
                  .map((user: any) => {
                    const userDetails = userMapWorkflow.get(user.userId);
                    return userDetails
                      ? {
                          ...userDetails,
                          value: userDetails.id,
                          label: userDetails.email,
                          userId: userDetails.id,
                          completedDate: new Date(user.completedDate),
                        }
                      : null;
                  })
                  .filter(Boolean);
                if (condition.type === 'User Of') {
                  const usersId = allUsers.map((item: any) => {
                    if (item.entityId === condition.selectedDepartment) {
                      return item.id;
                    }
                  });
                  condition.userList = usersId
                    .map((userId: string) => {
                      const user = userMapWorkflow.get(userId);
                      return user
                        ? {
                            ...user,
                            value: user.id,
                            label: user.email,
                            userId: user.id,
                          }
                        : null;
                    })
                    .filter(Boolean);
                }
                if (condition.type === 'Global Role Of') {
                  const usersId = globalRoles.find(
                    (item: any) =>
                      item._id.toString() === condition.selectedGlobalRole,
                  )?.assignedTo;
                  condition.userList = usersId
                    ?.map((userId: string) => {
                      const user = userMapWorkflow.get(userId);
                      return user
                        ? {
                            ...user,
                            value: user.id,
                            label: user.email,
                            userId: user.id,
                          }
                        : null;
                    })
                    .filter(Boolean);
                }
              }
            }
          }
        }
      }
    }

    for (const formFields of getChecksheet.formHeaderContents) {
      if (formFields.datatype === 'entityType') {
        formFields.options = entityOptionsMap.get(formFields.dataOptions) || [];
      }

      if (formFields.datatype === 'appFields') {
        formFields.options =
          appFieldOptionsMap.get(formFields.dataOptions) || [];
      }

      if (formFields.datatype === '@user') {
        formFields.value = usersMap.get(formFields.userId) || [];
      }
    }

    for (const tableField of getChecksheet.tableFieldsContents) {
      if (tableField.tableId) {
        for (const row of tableField.tableContent) {
          for (const cell of row.cells) {
            if (cell.datatype === 'entityType') {
              cell.options = entityOptionsMap.get(cell.dataOptions) || [];
            }
            if (cell.datatype === 'appFields') {
              cell.options = appFieldOptionsMap.get(cell.dataOptions) || [];
            }
          }
        }
      } else if (tableField.sectionId) {
        for (const element of tableField?.sectionContent) {
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'entityType'
          ) {
            element.options = entityOptionsMap.get(element.dataOptions) || [];
          }
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'appFields'
          ) {
            element.options = appFieldOptionsMap.get(element.dataOptions) || [];
          }
        }
      }
    }

    return getChecksheet;
  }

  async getAuditChecksheetTemplateDetails(id, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheetTemplateDetails`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    const getTemplate: any = await this.AuditChecksheetTemplateModel.findById(
      id,
    );

    // 1. Collect all unique entityTypeIds
    const entityTypeIds = new Set<string>();
    const appFieldIds = new Set<string>();

    // From formHeader
    for (const item of getTemplate.formHeader) {
      if (item.datatype === 'entityType') {
        entityTypeIds.add(item.dataOptions);
      }
      if (item.datatype === 'appFields') {
        appFieldIds.add(item.dataOptions);
      }
    }

    // From tableFields
    for (const tableField of getTemplate.tableFields) {
      if (tableField.tableId) {
        for (const row of tableField?.tableContent) {
          for (const cell of row.cells) {
            if (cell.datatype === 'entityType') {
              entityTypeIds.add(cell.dataOptions);
            }
            if (cell.datatype === 'appFields') {
              appFieldIds.add(cell.dataOptions);
            }
          }
        }
      } else if (tableField.sectionId) {
        for (const element of tableField?.sectionContent) {
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'entityType'
          ) {
            entityTypeIds.add(element.dataOptions);
          }
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'appFields'
          ) {
            appFieldIds.add(element.dataOptions);
          }
        }
      }
    }

    // 2. Fetch all entity options in one go
    const allEntities = await this.prisma.entity.findMany({
      where: {
        entityTypeId: { in: Array.from(entityTypeIds) },
      },
    });

    const allAppFields = await this.appFieldModel.find({
      organizationId: activeUser.organizationId,
      _id: { $in: Array.from(appFieldIds) },
    });

    // 3. Group entities by entityTypeId
    const entityOptionsMap = new Map<string, any[]>();
    for (const entity of allEntities) {
      if (!entityOptionsMap.has(entity.entityTypeId)) {
        entityOptionsMap.set(entity.entityTypeId, []);
      }
      entityOptionsMap.get(entity.entityTypeId).push({
        id: entity.id,
        name: entity.entityName,
      });
    }

    const appFieldOptionsMap = new Map<string, any[]>();
    for (const field of allAppFields) {
      appFieldOptionsMap.set(field._id.toString(), field.options || []);
    }

    for (const formFields of getTemplate.formHeader) {
      if (formFields.datatype === 'entityType') {
        formFields.options = entityOptionsMap.get(formFields.dataOptions) || [];
      }

      if (formFields.datatype === 'appFields') {
        formFields.options =
          appFieldOptionsMap.get(formFields.dataOptions) || [];
      }

      if (formFields.datatype === 'currentDate') {
        const today = new Date();
        const formattedDate = `${today
          .getDate()
          .toString()
          .padStart(2, '0')}/${(today.getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${today.getFullYear()}`;
        formFields.value = formattedDate;
      }

      if (formFields.datatype === '@user') {
        formFields.userId = activeUser.id;
        formFields.value = activeUser.firstname + ' ' + activeUser.lastname;
      }
    }

    for (const tableField of getTemplate.tableFields) {
      if (tableField.tableId) {
        for (const row of tableField.tableContent) {
          for (const cell of row.cells) {
            if (cell.datatype === 'entityType') {
              cell.options = entityOptionsMap.get(cell.dataOptions) || [];
            }
            if (cell.datatype === 'appFields') {
              cell.options = appFieldOptionsMap.get(cell.dataOptions) || [];
            }
            if (cell.datatype === 'currentDate') {
              const today = new Date();
              const formattedDate = `${today
                .getDate()
                .toString()
                .padStart(2, '0')}/${(today.getMonth() + 1)
                .toString()
                .padStart(2, '0')}/${today.getFullYear()}`;

              row.cells = row.cells.map((item: any) => {
                if (item.columnType === 'value') {
                  return {
                    ...item,
                    value: formattedDate,
                  };
                } else {
                  return item;
                }
              });
            }
          }
        }
      } else if (tableField.sectionId) {
        for (const element of tableField?.sectionContent) {
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'entityType'
          ) {
            element.options = entityOptionsMap.get(element.dataOptions) || [];
          }
          if (
            element.id === 'MultipleTypes' &&
            element.datatype === 'appFields'
          ) {
            element.options = appFieldOptionsMap.get(element.dataOptions) || [];
          }
        }
      }
    }

    return getTemplate;
  }

  async getAuditChecksheetReportFilterOptions(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheetReportFilterOptions`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    let { templateId, headerIds, numericFunction } = data;
    numericFunction = numericFunction
      ? numericFunction.split(',')
      : numericFunction;
    headerIds = headerIds.split(',');
    const template = await this.AuditChecksheetTemplateModel.findById(
      templateId,
    );
    let result: any = [];
    for (const headerId of headerIds) {
      const isInFormHeader = template?.formHeader?.some(
        (item: any) => item?.id === headerId,
      );
      const isInTableHeader = template?.tableFields
        ?.flatMap((field: any) => field.tableHeader)
        .some((item: any) => item?.id === headerId);
      let options;
      let colName: any;
      let headerType = '';
      if (isInFormHeader) {
        headerType = 'formHeader';
        const runTimeList = await this.AuditChecksheetsModel.find({
          organizationId: activeUser.organizationId,
          auditChecksheetTemplateId: templateId,
        });
        options = await Promise.all(
          runTimeList.map(async (item: any) => {
            const formHeader = item.formHeaderContents.find(
              (item) => item.id === headerId,
            );
            if (formHeader) {
              if (formHeader?.datatype === 'entityType') {
                const getEntity = await this.prisma.entity.findFirst({
                  where: {
                    id: formHeader.entityId,
                  },
                });
                return {
                  id: formHeader?.valueId,
                  name: getEntity.entityName,
                };
              } else {
                return {
                  id: formHeader?.valueId,
                  name: formHeader?.value,
                };
              }
            }
          }),
        );
        options = options.filter((item: any) => item);
        const colDtls: any = template.formHeader.find(
          (item: any) => item.id === headerId,
        );
        colName = colDtls.attributeName;
      }
      // if (isInTableHeader) {
      //   if (numericFunction.includes('Yield')) {
      //     headerType = 'tableHeader';
      //     options = template.tableContent.map((item: any) => {
      //       const col = item.cells.find(
      //         (cellItem) =>
      //           cellItem?.tableHeaderId === headerId &&
      //           item.cells.some((contents) => contents.datatype === 'number'),
      //       );
      //       return {
      //         id: col?.id,
      //         tableHeaderId: col?.tableHeaderId,
      //         name: col?.value,
      //       };
      //     });
      //     options = options.filter((item: any) => item.id);
      //     const colDtls: any = template.tableHeader.find(
      //       (item: any) => item.id === headerId,
      //     );
      //     colName = colDtls.attributeName;
      //   } else if (numericFunction.length > 0) {
      //     headerType = 'tableHeader';
      //     options = template.tableContent.map((item: any) => {
      //       const col = item.cells.find(
      //         (cellItem) =>
      //           cellItem?.tableHeaderId === headerId &&
      //           item.cells.some(
      //             (contents) =>
      //               contents.datatype === 'number' ||
      //               contents.datatype === 'numberRange',
      //           ),
      //       );
      //       return {
      //         id: col?.id,
      //         tableHeaderId: col?.tableHeaderId,
      //         name: col?.value,
      //       };
      //     });
      //     options = options.filter((item: any) => item.id);
      //     const colDtls: any = template.tableHeader.find(
      //       (item: any) => item.id === headerId,
      //     );
      //     colName = colDtls.attributeName;
      //   } else {
      //     headerType = 'tableHeader';
      //     options = template.tableContent.map((item: any) => {
      //       const col = item.cells.find(
      //         (item) => item?.tableHeaderId === headerId,
      //       );
      //       return {
      //         id: col?.id,
      //         tableHeaderId: col.tableHeaderId,
      //         name: col?.value,
      //       };
      //     });
      //     const colDtls: any = template.tableHeader.find(
      //       (item: any) => item.id === headerId,
      //     );
      //     colName = colDtls.attributeName;
      //   }
      // }

      result.push({
        id: headerId,
        colName: colName,
        options: options,
        headerType: headerType,
      });
    }

    return result;
  }

  async getDashboardReport(data, user, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/getDashboardReport`,
      'audit-checksheet.service.ts',
    );
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.user.id,
      },
    });

    let year;
    let {
      dateRange,
      templateId,
      formHeaderIds,
      tableHeaderIds,
      numericFunction,
    } = data;
    if (
      dateRange?.length > 0 &&
      dateRange !== undefined &&
      dateRange !== null &&
      dateRange !== 'undefined' &&
      dateRange !== ' , ' &&
      dateRange !== ','
    ) {
      const arrDate = dateRange.split(',');
      const dateParts1 = arrDate[0].split('-');
      const dateParts2 = arrDate[1].split('-');
      const year1 = parseInt(dateParts1[2]);
      const year2 = parseInt(dateParts2[2]);
      const month1 = parseInt(dateParts1[1]) - 1;
      const month2 = parseInt(dateParts2[1]) - 1;
      const day1 = parseInt(dateParts1[0]);
      const day2 = parseInt(dateParts2[0]);
      const date1 = new Date(year1, month1, day1);
      const date2 = new Date(year2, month2, day2);
      year = [date1, date2];
    } else {
      const orgInfo = await this.prisma.organization.findUnique({
        where: {
          id: activeUser.organizationId,
        },
      });
      if (orgInfo.fiscalYearQuarters === 'April - Mar') {
        const startYear = new Date().getFullYear() % 100;
        const endYear = (startYear + 1) % 100;
        year = await this.yearFormater(
          `${startYear.toString().padStart(2, '0')}-${endYear
            .toString()
            .padStart(2, '0')}`,
        );
      } else {
        year = await this.yearFormater(new Date().getFullYear());
      }
    }

    formHeaderIds = formHeaderIds?.split(',');
    tableHeaderIds = tableHeaderIds?.split(',');

    let pipeline;
    if (formHeaderIds.length === 1 && formHeaderIds[0] === '') {
      pipeline = [
        {
          $match: {
            $and: [
              { organizationId: activeUser.organizationId },
              { auditChecksheetTemplateId: templateId },
              {
                createdAt: {
                  $gte: year[0],
                  $lte: year[1],
                },
              },
              {
                tableFieldsContents: {
                  $elemMatch: {
                    tableContent: {
                      $elemMatch: {
                        cells: { $elemMatch: { id: { $in: tableHeaderIds } } },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      ];
    } else if (tableHeaderIds.length === 1 && tableHeaderIds[0] === '') {
      pipeline = [
        {
          $match: {
            $and: [
              { organizationId: activeUser.organizationId },
              { auditChecksheetTemplateId: templateId },
              {
                createdAt: {
                  $gte: year[0],
                  $lte: year[1],
                },
              },
              {
                formHeaderContents: {
                  $elemMatch: {
                    valueId: { $in: formHeaderIds },
                  },
                },
              },
            ],
          },
        },
      ];
    } else {
      pipeline = [
        {
          $match: {
            $and: [
              { organizationId: activeUser.organizationId },
              { auditChecksheetTemplateId: templateId },
              {
                createdAt: {
                  $gte: year[0],
                  $lte: year[1],
                },
              },
              {
                formHeaderContents: {
                  $elemMatch: {
                    valueId: { $in: formHeaderIds },
                  },
                },
              },
              {
                tableFieldsContents: {
                  $elemMatch: {
                    tableContent: {
                      $elemMatch: {
                        cells: { $elemMatch: { id: { $in: tableHeaderIds } } },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      ];
    }

    const results = await this.AuditChecksheetsModel.aggregate(pipeline);
    let combinedTableContentValues: any[] = [];
    if (tableHeaderIds.length === 1 && tableHeaderIds[0] === '') {
      const getTableData = await Promise.all(
        results.map(async (auditChecksheet: any) => {
          // Collect all tableContent objects from tableFieldsContents
          const allTableContents = auditChecksheet.tableFieldsContents.flatMap(
            (tableFieldsContent: any) => tableFieldsContent.tableContent,
          );

          // Loop through each tableContent to fetch entity names if applicable
          for (const tableContent of allTableContents) {
            const hasSpecDataType = tableContent.cells.some(
              (cell) =>
                cell.columnType === 'specification' &&
                cell.datatype === 'entityType',
            );

            if (hasSpecDataType) {
              const valueCells = tableContent.cells.filter(
                (cell) => cell.columnType === 'value',
              );

              // Fetch entities for each value cell with entityId
              const entities = await Promise.all(
                valueCells
                  .filter((cell) => !!cell.entityId) // Ensure entityId is not null
                  .map((cell) =>
                    this.prisma.entity
                      .findUnique({
                        where: { id: cell.entityId },
                      })
                      .catch((error) => {
                        console.error(
                          `Failed to find entity with ID: ${cell.entityId}`,
                          error,
                        );
                        return null; // Return null if there's an error
                      }),
                  ),
              );

              // Map the entity names back to the value cells
              entities.forEach((entity, index) => {
                if (entity) {
                  valueCells[index].value = entity.entityName;
                  const cellIndex = tableContent.cells.findIndex(
                    (cell) => cell.id === valueCells[index].id,
                  );
                  if (cellIndex !== -1) {
                    tableContent.cells[cellIndex] = valueCells[index];
                  }
                }
              });
            }

            // Append the created date to each tableContent
            tableContent.date = auditChecksheet.createdAt;
          }

          // Return all tableContent objects
          return allTableContents;
        }),
      );

      // Flatten the result and assign to combinedTableContentValues
      combinedTableContentValues = combinedTableContentValues.concat(
        ...getTableData,
      );
    } else {
      for (const headerId of tableHeaderIds) {
        const getTableData = await Promise.all(
          results.map(async (auditChecksheet: any) => {
            // 🚀 Filter `tableFieldsContents` to include only those containing the matching `headerId` in tableContent cells
            let filteredTableFieldsContents =
              auditChecksheet.tableFieldsContents.flatMap(
                (tableFieldsContent: any) =>
                  tableFieldsContent.tableContent.filter((tableContent: any) =>
                    tableContent.cells.some(
                      (cell: any) => cell.id === headerId, // Filtering based on headerId
                    ),
                  ),
              );

            // 🔄 Loop through the filtered content and handle entityType specifications
            for (const tableContent of filteredTableFieldsContents) {
              const hasSpecDataType = tableContent.cells.some(
                (cell) =>
                  cell.columnType === 'specification' &&
                  cell.datatype === 'entityType',
              );

              if (hasSpecDataType) {
                const valueCells = tableContent.cells.filter(
                  (cell) => cell.columnType === 'value',
                );

                // 🌐 Fetch entities for each value cell with `entityId`
                const entities = await Promise.all(
                  valueCells
                    .filter((cell) => !!cell.entityId) // Ensure `entityId` is not null
                    .map((cell) =>
                      this.prisma.entity
                        .findUnique({
                          where: { id: cell.entityId },
                        })
                        .catch((error) => {
                          console.error(
                            `Failed to find entity with ID: ${cell.entityId}`,
                            error,
                          );
                          return null; // Return null if there's an error
                        }),
                    ),
                );

                // 📝 Update value cells with entity names if found
                entities.forEach((entity, index) => {
                  if (entity) {
                    valueCells[index].value = entity.entityName;
                    const cellIndex = tableContent.cells.findIndex(
                      (cell) => cell.id === valueCells[index].id,
                    );
                    if (cellIndex !== -1) {
                      tableContent.cells[cellIndex] = valueCells[index];
                    }
                  }
                });
              }

              // 📌 Attach the `createdAt` date to each tableContent
              tableContent.date = auditChecksheet.createdAt;
            }

            // 🔄 Return the filtered table contents
            return filteredTableFieldsContents;
          }),
        );

        // 🚀 Flatten the result and assign to combinedTableContentValues
        combinedTableContentValues = combinedTableContentValues.concat(
          ...getTableData,
        );
      }
    }
    const finalResult = {
      tableHeader: results[0]?.tableFieldsContents.map(
        (item: any) => item.tableHeader,
      ),
      tableContentValues: combinedTableContentValues,
      type: results[0]?.type,
      formLayout: results[0]?.formLayout,
      formHeader: results.map((item: any) => item.formHeaderContents),
      formHeaderTitle: results[0]?.formHeaderTitle,
    };
    return finalResult;
  }

  async yearFormater(currentYear) {
    try {
      let startDate: Date;
      let endDate: Date;

      // Format 1: YYYY (e.g., 2024)
      if (/^\d{4}$/.test(currentYear)) {
        startDate = new Date(Date.UTC(parseInt(currentYear, 10), 0, 1));
        endDate = new Date(
          Date.UTC(parseInt(currentYear, 10), 11, 31, 23, 59, 59, 999),
        );
      }
      // Format 2: YY-YY+1 (e.g., 24-25)
      else if (/^\d{2}-\d{2}$/.test(currentYear)) {
        const startYear = 2000 + parseInt(currentYear.split('-')[0], 10);
        startDate = new Date(Date.UTC(startYear, 3, 1)); // April of the start year
        endDate = new Date(Date.UTC(startYear + 1, 2, 31, 23, 59, 59, 999)); // March of the next year
      }
      // Format 3: YYYY-YY+1 (e.g., 2024-25)
      else if (/^\d{4}-\d{2}$/.test(currentYear)) {
        const startYear = parseInt(currentYear.split('-')[0], 10);
        startDate = new Date(Date.UTC(startYear, 3, 1)); // April of the start year
        endDate = new Date(Date.UTC(startYear + 1, 2, 31, 23, 59, 59, 999)); // March of the next year
      }
      // Format 4: YY+1 (e.g., 25)
      else if (/^\d{2}$/.test(currentYear)) {
        const startYear = 2000 + parseInt(currentYear, 10) - 1; // Convert to the corresponding year
        startDate = new Date(Date.UTC(startYear, 3, 1)); // April of the start year
        endDate = new Date(Date.UTC(startYear + 1, 2, 31, 23, 59, 59, 999)); // March of the next year
      } else {
        throw new Error('Invalid year format');
      }

      return [startDate, endDate];
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAuditCheckSheetAuditTrail(id: string) {
    try {
      // Fetch the audit trail for the specified subModuleId
      const auditTrails: any = await this.auditTrailModel
        .find({ subModuleId: id })
        .lean();

      // Collect all unique user IDs
      const userIds: any = Array.from(
        new Set(auditTrails.map((trail) => trail.responsibleUser)),
      );

      // Fetch user details
      const users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstname: true,
          lastname: true,
        },
      });

      // Map users by ID for easy lookup
      const userMap = users.reduce((acc, user) => {
        acc[user.id] = `${user.firstname} ${user.lastname}`;
        return acc;
      }, {} as Record<string, string>);

      const entityIds = new Set<string>();

      auditTrails.forEach((audit) => {
        ['beforeState', 'afterState'].forEach((stateKey) => {
          const state = audit[stateKey];
          if (state?.formHeaderContents?.length) {
            state.formHeaderContents.forEach((content) => {
              if (content.entityId) entityIds.add(content.entityId);
            });
          }
        });
      });

      const allEntities = await this.prisma.entity.findMany({
        where: {
          id: { in: Array.from(entityIds) },
        },
      });

      // Create a lookup map
      const entityMap = new Map(
        allEntities.map((entity) => [entity.id, entity.entityName]),
      );

      const enhancedAuditTrail: any = auditTrails.map((audit: any) => {
        const processState = (state: any) => {
          if (!state?.formHeaderContents) return state;

          return {
            ...state,
            formHeaderContents: state.formHeaderContents.map((content) => {
              return {
                ...content,
                value:
                  content.datatype === 'entityType'
                    ? entityMap.get(content.entityId) || 'Entity Not Found'
                    : content.value,
              };
            }),
          };
        };

        return {
          ...audit,
          beforeState: processState(audit.beforeState),
          afterState: processState(audit.afterState),
        };
      });

      // Loop through each audit trail and filter changes
      const modifiedAuditTrails = enhancedAuditTrail.map((trail: any) => {
        // Common structure
        const baseStructure: any = {
          responsibleUser: trail.responsibleUser,
          responsibleUserName: userMap[trail.responsibleUser] || 'Unknown User',
          timestamp: trail.timestamp,
          subModuleId: trail.subModuleId,
          actionType: trail.actionType,
        };

        if (trail.actionType === 'insert') {
          // For "insert", just return the base structure
          return baseStructure;
        }

        if (trail.actionType === 'update') {
          baseStructure.changes = [];

          // If formHeaderContents is present in both states
          if (
            trail.beforeState?.formHeaderContents &&
            trail.afterState?.formHeaderContents
          ) {
            const beforeHeaders = trail.beforeState.formHeaderContents;
            const afterHeaders = trail.afterState.formHeaderContents;

            // Compare each object in formHeaderContents
            afterHeaders.forEach((afterItem) => {
              const beforeItem = beforeHeaders.find(
                (item) => item.id === afterItem.id,
              );

              if (beforeItem && beforeItem.value !== afterItem.value) {
                baseStructure.changes.push({
                  id: afterItem.id,
                  attributeName: afterItem.attributeName,
                  beforeValue: beforeItem.value,
                  afterValue: afterItem.value,
                  type: 'Form Fields',
                });
              }
            });
          }

          // If status exists and is different, add it to changes
          if (
            trail.beforeState?.status &&
            trail.afterState?.status &&
            trail.beforeState.status !== trail.afterState.status
          ) {
            baseStructure.changes.push({
              attributeName: 'Status',
              beforeValue: trail.beforeState.status,
              afterValue: trail.afterState.status,
              type: 'Status',
            });
          }

          // Check for tableFieldsContents and just mark as CHANGED if there are any differences
          if (
            trail.beforeState?.tableFieldsContents &&
            trail.afterState?.tableFieldsContents
          ) {
            const beforeTable = trail.beforeState.tableFieldsContents;
            const afterTable = trail.afterState.tableFieldsContents;

            if (JSON.stringify(beforeTable) !== JSON.stringify(afterTable)) {
              baseStructure.changes.push({
                attributeName: 'Table',
                beforeValue: 'CHANGED',
                afterValue: 'CHANGED',
                type: 'Table Content',
              });
            }
          }

          // Return only if there are changes
          return baseStructure.changes.length > 0 ? baseStructure : null;
        }

        return null;
      });

      // Remove null entries and return
      return modifiedAuditTrails.filter((item) => item !== null);
    } catch (error) {
      console.error('Error fetching audit trails:', error);
      throw new Error('Could not fetch audit trails.');
    }
  }
  async getAuditChecksheetsForInbox(id, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: id },
        include: { organization: true },
      });

      const auditSheets: any = await this.AuditChecksheetsModel.find({
        organizationId: activeUser.organizationId,
      });
      // console.log('auditsheets', auditSheets);
      const matchedSheets = [];

      for (const sheet of auditSheets) {
        const workflowStages: any = sheet.workflowDetails?.workflow || [];

        for (const stage of workflowStages) {
          // console.log('stage', stage);
          if (stage.status === 'complete') continue;

          const { type, selectedUsers, selectedDepartment } =
            stage.ownerSettings;

          // 1. Named Users
          // console.log('selectedUSer', selectedUsers);
          // if (type === 'Named Users') {
          const userIds = selectedUsers.map((user) => user?.id);
          // console.log('userids', userIds);
          // console.log('sheet', sheet);
          if (userIds.includes(activeUser.id)) {
            matchedSheets.push({
              ...sheet.toObject(),
              url: await this.buildAuditUrl(sheet?._id, activeUser),
            });
            break;
          }
          // }

          // 2. Department Roles
          // let roleKey = null;
          // if (type === 'Dept PIC') roleKey = 'pic';
          // else if (type === 'Dept Manager') roleKey = 'manager';
          // else if (type === 'Dept User') roleKey = 'users';

          // if (roleKey && selectedDepartment) {
          //   const entity = await this.prisma.entity.findUnique({
          //     where: { id: selectedDepartment },
          //     select: { [roleKey]: true },
          //   });

          //   const userIds: any = entity?.[roleKey] || [];

          //   if (userIds.includes(activeUser.id)) {
          //     // console.log('sheet', sheet);
          //     matchedSheets.push({
          //       ...sheet.toObject(),
          //       url: await this.buildAuditUrl(sheet?._id, activeUser),
          //     });
          //     break;
          //   }
          // }
        }
      }

      this.logger.log(
        `trace id = ${randomNumber} POST api/auditchecksheet/getAuditChecksheetsForInbox`,
        'audit-checksheet.service.ts',
      );

      return matchedSheets;
    } catch (error) {
      console.log('error', error);
    }
  }
  async buildAuditUrl(id, activeUser) {
    let url;
    //http://apple.localhost:3000/audit/auditschedule/auditscheduleform/schedule/65fbf804569a970e4dec207b
    if (process.env.MAIL_SYSTEM === 'IP_BASED') {
      url = `${process.env.PROTOCOL}://${process.env.REDIRECT}/runTimeChecksheets/${id}`;
    } else {
      url = `${process.env.PROTOCOL}://${activeUser.organization?.realmName}.${process.env.REDIRECT}/runTimeChecksheets/${id}`;
    }
    console.log('url build', url);
    return url;
  }

  async deleteAuditChecksheetForm(id, userId, randomNumber) {
    try {
      this.logger.log(
        `trace id = ${randomNumber} POST api/auditchecksheet/deleteAuditChecksheetForm - Id: ${id}`,
        'audit-checksheet.service.ts',
      );
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      await this.AuditChecksheetTemplateModel.deleteOne({
        organizationId: activeUser.organizationId,
        _id: id,
      });
      return 'Form Deleted Successfully';
    } catch {
      this.logger.error(
        `trace id = ${randomNumber} POST api/auditchecksheet/deleteAuditChecksheetForm - Id: ${id} Failed`,
        'audit-checksheet.service.ts',
      );
      return 'Something went wrong, Please try again later';
    }
  }

  async auditChecksheetViewForBeml(userId, randomNumber) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const getAllReports = await this.AuditChecksheetsModel.find({
        organizationId: activeUser.organizationId,
      });
      const viewResult = getAllReports.flatMap((report: any) => {
        return report?.tableFieldsContents
          ?.filter((section: any) => {
            if (!section.sectionId) return false;

            const getValue = (label: string) =>
              section.sectionContent.find((el: any) => el.value === label)
                ?.runtimeValue || '';

            // Check all three fields have runtimeValue
            return (
              getValue('Model') ||
              getValue('Chassis No') ||
              getValue('Engine No')
            );
          })
          .map((section: any) => {
            const getValue = (label: string) =>
              section.sectionContent.find((el: any) => el.value === label)
                ?.runtimeValue || '';

            return {
              model: getValue('Model'),
              chassisNo: getValue('Chassis No'),
              engineNo: getValue('Engine No'),
              reportName: report.title,
              reportId: report._id,
              date: report.createdAt,
            };
          });
      });

      return viewResult.filter((item: any) => item);
    } catch {
      return 'Something went wrong, Please try again later';
    }
  }

  async copyAuditChecksheetForm(id, userId, randomNumber) {
    this.logger.log(
      `trace id = ${randomNumber} POST api/auditchecksheet/copyAuditChecksheetForm - Id: ${id}`,
      'audit-checksheet.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const getForm = await this.AuditChecksheetTemplateModel.findOne({
        organizationId: activeUser.organizationId,
        _id: id,
      });

      // Convert Mongoose document to plain JS object and remove _id
      const plainForm = getForm.toObject();
      delete plainForm._id;

      // Update tableFields based on type (table vs section)
      const newTableFields = plainForm.tableFields.map((field) => {
        // Case 1: Table object
        if ('tableId' in field) {
          const newTableId = uuid();
          const headerIdMap = new Map<string, string>();

          const newTableHeader = (field.tableHeader || []).map((header) => {
            const newHeaderId = uuid();
            headerIdMap.set(header.id, newHeaderId);
            return {
              ...header,
              id: newHeaderId,
            };
          });

          const newTableContent = (field.tableContent || []).map((row) => {
            const newCells = row.cells.map((cell) => ({
              ...cell,
              id: uuid(),
              tableId: newTableId,
              tableHeaderId:
                headerIdMap.get(cell.tableHeaderId) || cell.tableHeaderId,
            }));

            return { ...row, cells: newCells };
          });

          return {
            ...field,
            tableId: newTableId,
            tableHeader: newTableHeader,
            tableContent: newTableContent,
          };
        }

        // Case 2: Section object
        if ('sectionId' in field) {
          return {
            ...field,
            sectionId: uuid(),
          };
        }

        return field;
      });

      this.logger.debug(
        `Table Fields tableId and tableHeaderId change ${newTableFields}`,
      );

      const modifyForm = {
        ...plainForm,
        title: plainForm.title + ' - Copy',
        tableFields: newTableFields,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.AuditChecksheetTemplateModel.create(modifyForm);

      this.logger.debug(
        `New Template created with change in tableId and tableHeaderId ${modifyForm}`,
      );
    } catch {
      this.logger.error(
        `trace id = ${randomNumber} POST api/auditchecksheet/copyAuditChecksheetForm - Id: ${id} Failed`,
        'audit-checksheet.service.ts',
      );
    }
  }
}
