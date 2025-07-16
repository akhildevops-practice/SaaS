import {
  Injectable,
  ConflictException,
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDoctypeDto } from './dto/create-doctype.dto';
import { UpdateDoctypeDto } from './dto/update-doctype.dto';
import {
  adminsSeperators,
  doctypeAdminsCreator,
  formatDoctypes,
  getUserDetails,
} from './utils';
import { Model } from 'mongoose';
import { NotificationService } from 'src/notification/notification.service';

import {
  notificationEvents,
  notificationTypes,
} from 'src/utils/notificationEvents.global';
import { CreateNotificationDto } from 'src/notification/dto/create-notification.dto';
import { SerialNumberService } from 'src/serial-number/serial-number.service';
import { create } from 'domain';
import { Doctype, DoctypeSchema } from './schema/doctype.schema';
import auditTrial from '../watcher/changesStream';
import { InjectModel } from '@nestjs/mongoose';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { GlobalWorkflowService } from 'src/global-workflow/global-workflow.service';
@Injectable()
export class DoctypeService {
  constructor(
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
    @InjectModel(Doctype.name)
    private doctypeModel: Model<Doctype>,
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private serialNumberService: SerialNumberService,
    private readonly globalWorkflowService: GlobalWorkflowService,
  ) {}
  // async createDoctypeOld(createDoctypeDto: CreateDoctypeDto, user: any) {
  //   //GET THE CURRENT ACTIVE USER
  //   const activeUser = await this.prisma.user.findFirst({
  //     where: {
  //       kcId: user.id,
  //     },
  //   });
  //   const auditTrail = await auditTrial(
  //     'Doctype',
  //     'Document Control',
  //     'Document Type',
  //     user,
  //     activeUser,
  //     '',
  //   );
  //   //Org id of the doctype

  //   ////////////////console.log('createDocType', createDoctypeDto);
  //   let organizationOfDoctype;

  //   //LocationID of doctype to be linked
  //   let locationOfDoctype;
  //   //DepartmentId of doctype to be linked
  //   let departmentOfDoctype;
  //   //Creator of the doctype
  //   let docTypeCreatorId;
  //   //For loc admin
  //   if (
  //     user.kcRoles.roles.includes('LOCATION-ADMIN') &&
  //     !user.kcRoles.roles.includes('ORG-ADMIN')
  //   ) {
  //     //pull the location admin from db
  //     const locationAdmin = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: user.id,
  //       },
  //     });
  //     //get location admins location Id and department id and his own id
  //     locationOfDoctype = locationAdmin.locationId;
  //     departmentOfDoctype = locationAdmin.entityId;
  //     docTypeCreatorId = locationAdmin.id;
  //     organizationOfDoctype = locationAdmin.organizationId;
  //   } else if (user.kcRoles.roles.includes('ORG-ADMIN')) {
  //     const orgAdmin = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: user.id,
  //       },
  //     });
  //     locationOfDoctype = createDoctypeDto.locationIdOfDoctype;
  //     docTypeCreatorId = orgAdmin.id;
  //     organizationOfDoctype = orgAdmin.organizationId;
  //   } else if (
  //     user.kcRoles.roles.includes('PLANT-HEAD') ||
  //     (user.kcRoles.roles.includes('MR') &&
  //       !user.kcRoles.roles.includes('ORG-ADMIN') &&
  //       !user.kcRoles.roles.includes('LOCATION-ADMIN'))
  //   ) {
  //     const activeUser = await this.prisma.user.findFirst({
  //       where: {
  //         kcId: user.id,
  //       },
  //     });
  //     locationOfDoctype = [activeUser.locationId];

  //     docTypeCreatorId = activeUser.id;
  //     organizationOfDoctype = activeUser.organizationId;
  //   }
  //   if (createDoctypeDto.document_classification != null) {
  //     const isDuplicate = await this.prisma.doctype.findFirst({
  //       where: {
  //         organizationId: organizationOfDoctype,
  //         document_classification: createDoctypeDto.document_classification,
  //       },
  //     });

  //     if (isDuplicate) {
  //       throw new ConflictException(
  //         'Please choose a unique name for Document Classification',
  //       );
  //     }
  //   }
  //   //Prefic and suffix convert to strings
  //   const prefix = createDoctypeDto.prefix.join('-');
  //   const suffix = createDoctypeDto.suffix.join('-');

  //   //Payload for doctype creation
  //   // const allLocations = createDoctypeDto.locationIdOfDoctype.map((value)=>value.id)
  //   if (user.kcRoles.roles.includes('ORG-ADMIN')) {
  //     locationOfDoctype = createDoctypeDto.locationIdOfDoctype.map(
  //       (value: any) => value.id,
  //     );
  //   }

  //   const createDocTypeData = {
  //     locationId: locationOfDoctype,
  //     organization: {
  //       connect: { id: organizationOfDoctype },
  //     },
  //     documentTypeName: createDoctypeDto.documentTypeName,
  //     documentNumbering: createDoctypeDto.documentNumbering,
  //     reviewFrequency: createDoctypeDto.reviewFrequency,
  //     revisionRemind: createDoctypeDto.revisionRemind,
  //     readAccess: createDoctypeDto.readAccess.type,
  //     document_classification: createDoctypeDto.document_classification,
  //     applicable_systems: createDoctypeDto.applicable_systems,
  //     prefix: prefix,
  //     suffix: suffix,
  //     createdBy: user.id,
  //     distributionUsers: createDoctypeDto.distributionUsers,
  //     readAccessUsers: createDoctypeDto.readAccessUsers,
  //     distributionList: createDoctypeDto.distributionList,
  //     currentVersion: createDoctypeDto.currentVersion,
  //     users: createDoctypeDto.readAccess.usersWithAccess,
  //   };

  //   const createdDoctype = await this.prisma.doctype.create({
  //     data: createDocTypeData,
  //   });
  //   // moduleType,
  //   // prefix,
  //   // suffix,
  //   // location,
  //   // createdBy,
  //   // organizationId,

  //   //check if approvers reviewrs etc empty then only pass here

  //   // const linkDoctypeWithApprovers = await doctypeAdminsCreator(
  //   //   createDoctypeDto.approvers,
  //   //   this.prisma.documentAdmins,
  //   //   createdDoctype.id,
  //   //   'APPROVER',
  //   // );
  //   // const linkDoctypeWithReviewers = await doctypeAdminsCreator(
  //   //   createDoctypeDto.reviewers,
  //   //   this.prisma.documentAdmins,
  //   //   createdDoctype.id,
  //   //   'REVIEWER',
  //   // );
  //   // const linkDoctypeWithCreators = await doctypeAdminsCreator(
  //   //   createDoctypeDto.creators,
  //   //   this.prisma.documentAdmins,
  //   //   createdDoctype.id,
  //   //   'CREATOR',
  //   // );
  //   // if (createDoctypeDto.readAccess.type == 'Restricted Access') {
  //   //   const linkDoctypeWithReaders = await doctypeAdminsCreator(
  //   //     createDoctypeDto.readAccess.usersWithAccess,
  //   //     this.prisma.documentAdmins,
  //   //     createdDoctype.id,
  //   //     'READER',
  //   //   );
  //   // }

  //   const doctype = await this.prisma.doctype.findUnique({
  //     where: {
  //       id: createdDoctype.id,
  //     },
  //     // include: {
  //     //   documentAdmins: true,
  //     // },
  //   });

  //   // const documentAdmins = doctype.documentAdmins;

  //   // const seperatedAdmins = adminsSeperators(documentAdmins);
  //   return {
  //     ...doctype,
  //     // creators: seperatedAdmins.creators,
  //     // reviewers: seperatedAdmins.reviewers,
  //     // approvers: seperatedAdmins.approvers,
  //     // readAccess: {
  //     //   type: doctype.readAccess,
  //     //   usersWithAccess: seperatedAdmins.readers,
  //     // },
  //   };
  // }

  async createDoctype(body: CreateDoctypeDto) {
    try {
      const existingDoc = await this.doctypeModel.findOne({
        documentTypeName: body.documentTypeName,
        organizationId: body.organizationId,
      });

      if (existingDoc) {
        throw new ConflictException({
          message: 'Duplicate Doctype',
          error: `A Doc Type with the name "${body.documentTypeName}" already exists.`,
        });
      }

      const createDocTypeData = {
        ...body,
        createdBy: body?.userId,
      };

      const createdDocType = await this.doctypeModel.create(createDocTypeData);

      return {
        message: 'Doctype created successfully',
        data: createdDocType,
      };
    } catch (err) {
      // console.log("Error creating Doctype:", err)
      if (err instanceof ConflictException) {
        return {
          statusCode: 409,
          message: err?.message,
          error: err,
        };
      }

      if (err instanceof HttpException) {
        return {
          error: err,
        };
      }

      return {
        statusCode: 500,
        message: 'Failed to create Doctype',
        error: err.message || 'Unexpected server error',
      };
    }
  }

  async getDoctypeId(user: any, id: string) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    // if (locationId?.length > 0) {

    const docType = await this.prisma.doctype.findFirst({
      where: { id },
      include: {
        documentAdmins: true,
      },
      orderBy: [
        {
          documentTypeName: 'asc',
        },
      ],
    });
    let location;
    if (docType.locationId.includes('All')) {
      location = [{ id: 'All', locationName: 'All' }];
    } else {
      location = await this.prisma.location.findMany({
        where: { id: { in: docType.locationId } },
      });
    }

    return { ...docType, locationId: location };

    // return { data: docTypes, length: docTypes.length };
  }
  async getDoctypesForLocation(
    locationId: any[],
    page?: number,
    limit?: number,
    user?,
  ) {
    const skipValue = (page - 1) * Number(limit);
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    if (locationId?.length > 0) {
      let whereCondition: any = {
        organizationId: activeUser.organizationId,
        // deleted: false,
      };

      if (!locationId.includes('All')) {
        whereCondition = {
          ...whereCondition,
          locationId: {
            hasEvery: locationId,
          },
        };
      }
      const docTypes = await this.prisma.doctype.findMany({
        skip: skipValue,
        take: Number(limit),
        where: whereCondition,
        include: {
          documentAdmins: true,
        },
        orderBy: [
          {
            documentTypeName: 'asc',
          },
        ],
      });

      const totalDoctypes = await this.prisma.doctype.count({
        where: whereCondition,
      });

      return { data: docTypes, length: totalDoctypes };
    } else {
      return { data: [], length: 0 };
    }

    // return { data: docTypes, length: docTypes.length };
  }

  // async getDoctypesForLocation(
  //   locationIds: any,
  //   page = 1,
  //   limit = 10,
  //   orgId: any,
  // ) {
  //   try {
  //     // console.log("locationIds", locationIds);
  //     const skipValue = (page - 1) * Number(limit);

  //     let whereCondition: any = {
  //       organizationId: orgId,
  //     };

  //     if (locationIds?.length && !locationIds.includes('All')) {
  //       whereCondition = {
  //         ...whereCondition,
  //         applicable_locations: { $all: locationIds },
  //       };
  //     }

  //     const docTypes = await this.doctypeModel
  //       .find(whereCondition)
  //       .select(
  //         'documentTypeName reviewFrequency revisionRemind docReadAccess documentNumbering',
  //       )
  //       .sort({ createdAt: 1 })
  //       .skip(skipValue)
  //       .limit(Number(limit))
  //       .lean();

  //     const totalDoctypes = await this.doctypeModel.countDocuments(
  //       whereCondition,
  //     );

  //     return {
  //       success: true,
  //       message: 'Doctypes fetched successfully',
  //       data: docTypes,
  //       length: totalDoctypes,
  //     };
  //   } catch (err) {
  //     // console.error('Error fetching doctypes:', err);
  //     return {
  //       success: false,
  //       message: 'Failed to fetch doctypes',
  //       error: err.message || 'Unexpected server error',
  //       data: [],
  //       length: 0,
  //     };
  //   }
  // }

  async findOneOld(id: string) {
    const doctype = await this.prisma.doctype.findUnique({
      where: {
        id: id,
      },
      include: {
        documentAdmins: true,
      },
    });
    const documentAdmins = doctype.documentAdmins;

    const allLocations = doctype.locationId.map(async (value) => {
      if (value === 'All') {
        return { id: 'All', locationName: 'All' };
      } else {
        const locs = await this.prisma.location.findFirst({
          where: {
            id: value,
          },
          select: {
            id: true,
            locationName: true,
          },
        });

        return locs;
      }
    });
    const seperatedAdmins = adminsSeperators(documentAdmins);
    return {
      ...doctype,
      creators: seperatedAdmins.creators,
      reviewers: seperatedAdmins.reviewers,
      approvers: seperatedAdmins.approvers,
      readAccess: {
        type: doctype.readAccess,
        usersWithAccess: seperatedAdmins.readers,
      },
    };
  }

  async findOne(id: string) {
    try {
      const doctype: any = await this.doctypeModel.findById(id).lean();
      if (!doctype) {
        return {
          success: false,
          message: 'Doctype not found',
          data: null,
        };
      }

      const {
        organizationId,
        applicable_locations = [],
        applicable_systems = [],
        docReadAccess,
        docReadAccessIds = [],
        docCreateAccess,
        docCreateAccessIds = [],
        docDistributionList,
        docDistributionListIds = [],
      } = doctype;

      const userIds = new Set<string>();
      const locationIds = new Set<string>();
      const entityIds = new Set<string>();

      // Collect IDs based on access strings
      if (docReadAccess === 'Selected Users')
        docReadAccessIds.forEach((id) => userIds.add(id));
      if (docReadAccess === 'All in Units')
        docReadAccessIds.forEach((id) => locationIds.add(id));
      if (docReadAccess === 'All in Entites')
        docReadAccessIds.forEach((id) => entityIds.add(id));

      // Collect IDs based on Create Access type
      if (docCreateAccess === 'Selected Users')
        docCreateAccessIds.forEach((id) => userIds.add(id));
      if (docCreateAccess === 'Selected Entity')
        docCreateAccessIds.forEach((id) => entityIds.add(id));
      if (docCreateAccess === 'Selected Unit')
        docCreateAccessIds.forEach((id) => locationIds.add(id));
      if (['PIC', 'Head'].includes(docCreateAccess))
        docCreateAccessIds.forEach((id) => entityIds.add(id));

      if (docDistributionList === 'Selected Users') {
        (Array.isArray(docDistributionListIds)
          ? docDistributionListIds
          : [docDistributionListIds]
        ).forEach((id) => userIds.add(id));
      }
      if (docDistributionList === 'Respective Unit') {
        (Array.isArray(docDistributionListIds)
          ? docDistributionListIds
          : [docDistributionListIds]
        ).forEach((id) => locationIds.add(id));
      }
      if (docDistributionList === 'Respective Entity') {
        (Array.isArray(docDistributionListIds)
          ? docDistributionListIds
          : [docDistributionListIds]
        ).forEach((id) => entityIds.add(id));
      }

      // Prepare Prisma filters
      const systemIds = applicable_systems?.filter(
        (id: string) => id !== 'All',
      );
      const locationFilter: any = { organizationId, deleted: false };
      if (!applicable_locations.includes('All')) {
        locationFilter.id = { in: applicable_locations };
      }

      // Fetch all required data in parallel
      const [locations, systems, users, entities] = await Promise.all([
        this.prisma.location.findMany({
          where: locationFilter,
          select: { id: true, locationName: true },
        }),
        this.SystemModel.find({
          organizationId,
          id: { $in: systemIds },
        })
          .select('_id name')
          .lean(),
        this.prisma.user.findMany({
          where: { id: { in: Array.from(userIds) } },
          select: {
            id: true,
            username: true,
            firstname: true,
            lastname: true,
            email: true,
            avatar: true,
          },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: { id: true, entityName: true },
        }),
      ]);

      // Create lookup maps
      const userMap = new Map(users.map((u) => [u.id, u]));
      const entityMap = new Map(entities.map((e) => [e.id, e.entityName]));
      const locationMap = new Map(locations.map((l) => [l.id, l.locationName]));
      const systemMap = new Map(systems.map((s) => [s._id, s.name]));

      // Map full details
      const mapIds = (
        ids: string[] | string,
        map: Map<string, any>,
        labelField = 'label',
      ) => {
        return (Array.isArray(ids) ? ids : [ids]).map((id) => {
          if (id === 'All') {
            return { id, [labelField]: 'All' };
          }

          const value = map.get(id);
          if (!value) {
            return { id, [labelField]: 'Unknown' };
          }

          // If value is a string (like entityName), wrap it
          if (typeof value === 'string') {
            return { id, [labelField]: value };
          }

          // If it's an object with full user/entity info, keep as is
          return { id, ...value };
        });
      };

      return {
        success: true,
        message: 'Doctype fetched successfully',
        data: {
          ...doctype,
          applicable_locations_details: applicable_locations.map((id) => ({
            id,
            locationName:
              id === 'All' ? 'All' : locationMap.get(id) || 'Unknown',
          })),
          applicable_systems_details: systemIds.map((id) => ({
            id,
            name: systemMap.get(id) || 'Unknown',
          })),
          docReadAccessDetails:
            docReadAccess === 'Selected Users'
              ? mapIds(docReadAccessIds, userMap)
              : docReadAccess === 'All in Units'
              ? mapIds(docReadAccessIds, locationMap, 'locationName')
              : docReadAccess === 'All in Entites'
              ? mapIds(docReadAccessIds, entityMap, 'entityName')
              : [],

          docCreateAccessDetails:
            docCreateAccess === 'Selected Users'
              ? mapIds(docCreateAccessIds, userMap)
              : docCreateAccess === 'Selected Entity'
              ? mapIds(docCreateAccessIds, entityMap, 'entityName')
              : docCreateAccess === 'Selected Unit'
              ? mapIds(docCreateAccessIds, locationMap, 'locationName')
              : ['PIC', 'Head'].includes(docCreateAccess)
              ? mapIds(docCreateAccessIds, entityMap, 'entityName')
              : [],

          docDistributionListDetails:
            docDistributionList === 'Selected Users'
              ? mapIds(docDistributionListIds, userMap)
              : docDistributionList === 'Respective Unit'
              ? mapIds(docDistributionListIds, locationMap, 'locationName')
              : docDistributionList === 'Respective Entity'
              ? mapIds(docDistributionListIds, entityMap, 'entityName')
              : [],
        },
      };
    } catch (err) {
      // console.error('Error finding doctype:', err);
      return {
        success: false,
        message: 'Failed to fetch doctype',
        error: err.message || 'Unexpected server error',
        data: null,
      };
    }
  }

  async updateDoctypeOld(id: string, updateDoctypeDto: any, user: any) {
    //GET THE CURRENT ACTIVE USER
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    // const auditTrail = await auditTrial(
    //   'Doctype',
    //   'Document Control',
    //   'Document Type',
    //   user,
    //   activeUser,
    //   '',
    // );
    let docTypeCreatorId;
    //For loc admin
    const locations = updateDoctypeDto.locationIdOfDoctype.map(
      (value: any) => value?.id,
    );

    const prefix = updateDoctypeDto.prefix.join('-');
    const suffix = updateDoctypeDto.suffix.join('-');

    const updateDocTypeData = {
      documentTypeName: updateDoctypeDto.documentTypeName,
      documentNumbering: updateDoctypeDto.documentNumbering,
      reviewFrequency: updateDoctypeDto.reviewFrequency,
      revisionRemind: updateDoctypeDto.revisionRemind,
      applicable_systems: updateDoctypeDto.applicable_systems,
      prefix: prefix,
      suffix: suffix,
      readAccess: updateDoctypeDto.readAccess.type,
      document_classification: updateDoctypeDto.document_classification,
      updatedBy: docTypeCreatorId,
      distributionList: updateDoctypeDto.distributionList,
      distributionUsers: updateDoctypeDto.distributionUsers,
      users: updateDoctypeDto.readAccess.usersWithAccess,
      readAccessUsers: updateDoctypeDto.readAccessUsers,
      whoCanDownload: updateDoctypeDto.whoCanDownload,
      whoCanDownloadUsers: updateDoctypeDto.whoCanDownloadUsers || [],
      locationId: locations,
      whoCanCreate: updateDoctypeDto.whoCanCreate,
      whoCanCreateUsers: updateDoctypeDto.whoCanCreateUsers || [],
    };
    const updatedDoctype = await this.prisma.doctype.update({
      where: {
        id: id,
      },
      data: updateDocTypeData,
    });

    const doctype = await this.prisma.doctype.findUnique({
      where: {
        id: updatedDoctype.id,
      },
      include: {
        documentAdmins: true,
      },
    });

    return {
      ...doctype,

      readAccess: {
        type: doctype.readAccess,
        usersWithAccess: doctype.users,
      },
    };
  }

  async updateDoctype(id: string, body: UpdateDoctypeDto) {
    try {
      // await auditTrail(
      //   'Doctype',
      //   'Document Control',
      //   'Document Type',
      //   user,
      //   activeUser,
      //   '',
      // );
      // console.log('body', body?.whoCanDownload,body?.whoCanDownloadIds);
      const updateDocTypeData: any = {
        ...body,
        whoCanDownload: body?.whoCanDownload,
        whoCanDownloadIds: body?.whoCanDownloadIds,
        updatedBy: body.userId,
      };

      const updatedDoctype = await this.doctypeModel
        .findByIdAndUpdate(id, updateDocTypeData, { new: true })
        .lean();

      if (!updatedDoctype) {
        return {
          success: false,
          message: 'Doctype not found or update failed',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Doctype updated successfully',
        data: {
          ...updatedDoctype,
        },
      };
    } catch (err) {
      // console.error('Error updating doctype:', err);
      return {
        success: false,
        message: 'Failed to update Doctype',
        error: err.message || 'Unexpected server error',
        data: null,
      };
    }
  }

  async deleteDoctypeOld(id: string, user) {
    //GET THE CURRENT ACTIVE USER
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    // const auditTrail = await auditTrial(
    //   'Doctype',
    //   'Document Control',
    //   'Document Type',
    //   user,
    //   activeUser,
    //   '',
    // );
    setTimeout(async () => {
      const deleteDoctype = await this.prisma.doctype.delete({
        where: {
          id: id,
        },
      });

      return deleteDoctype.id;
    }, 1000);
  }
  async getDefaultDoctype(id) {
    try {
      const defaultDoctype = await this.doctypeModel.find({
        organizationId: id,
        default: true,
      });
      return defaultDoctype;
    } catch (error: any) {}
  }

  async deleteDoctype(id: string, user: any) {
    try {
      // const activeUser = await this.prisma.user.findFirst({
      //   where: {
      //     kcId: user.id,
      //   },
      // });

      // await auditTrail(
      //   'Doctype',
      //   'Document Control',
      //   'Document Type',
      //   user,
      //   activeUser,
      //   '',
      // );
      await this.doctypeModel.findByIdAndDelete(id);

      return {
        success: true,
        message: 'Doctype deletion initiated',
        data: id,
      };
    } catch (err) {
      // console.error('Error deleting doctype:', err);
      return {
        success: false,
        message: 'Failed to delete doctype',
        error: err.message || 'Unexpected server error',
        data: null,
      };
    }
  }

  async restoreDoctypeOld(id: string) {
    const deleteDoctype = await this.prisma.doctype.update({
      where: {
        id: id,
      },
      data: {
        // deleted: false,
      },
    });

    return deleteDoctype.id;
  }

  async restoreDoctype(id: string) {
    try {
      const restored = await this.doctypeModel.findByIdAndUpdate(
        id,
        {
          deletedAt: null,
        },
        { new: true },
      );

      return {
        success: true,
        message: 'Doctype restored',
        data: restored?._id,
      };
    } catch (err) {
      // console.error('Error restoring doctype:', err);
      return {
        success: false,
        message: 'Failed to restore doctype',
        error: err.message || 'Unexpected server error',
        data: null,
      };
    }
  }

  async permanentDeleteDoctypeOld(id: string) {
    const deleteDoctype = await this.prisma.doctype.delete({
      where: {
        id: id,
      },
    });

    return deleteDoctype.id;
  }

  async permanentDeleteDoctype(id: string) {
    try {
      const deleted = await this.doctypeModel.findByIdAndDelete(id);

      if (!deleted) {
        return {
          success: false,
          message: 'Doctype not found or already deleted',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Doctype permanently deleted',
        data: deleted._id,
      };
    } catch (err) {
      // console.error('Error permanently deleting doctype:', err);
      return {
        success: false,
        message: 'Failed to delete doctype permanently',
        error: err.message || 'Unexpected server error',
        data: null,
      };
    }
  }

  //TODO
  async getDoctypeCreatorDetails(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
        include: {
          location: true,
          entity: true,
        },
      });
      //console.log('activeUser', activeUser);
      let doctypes;
      if (activeUser.userType !== 'globalRoles') {
        // console.log('inside if');
        doctypes = await this.prisma.doctype.findMany({
          where: {
            locationId: {
              hasSome: ['All', activeUser.locationId],
            },
            organizationId: activeUser.organizationId,
            // deleted: false,
          },
          // include: {
          //   documentAdmins: true,
          // },
        });
        if (!doctypes) {
          throw new HttpException(
            'The user does not belong to a location',
            404,
          );
        }

        // let doctypesWhereActiveUserIsCreator = doctypes.filter((data) =>
        //   data.documentAdmins.some(
        //     (item: any) => item.email == activeUser.email && item.type == 'CREATOR',
        //   ),
        // );

        if (doctypes?.length > 0) {
          return {
            doctypes: doctypes,
            userLocation: activeUser?.location,
            userDepartment: activeUser?.entity,
          };
        } else {
          throw new HttpException(
            'The user doesnt has permission to create Documents',
            404,
          );
        }
      } else {
        if (activeUser?.additionalUnits?.includes('All')) {
          doctypes = await this.prisma.doctype.findMany({
            where: {
              organizationId: activeUser.organizationId,
              // deleted: false,
            },
            // include: {
            //   documentAdmins: true,
            // },
          });
        } else {
          doctypes = await this.prisma.doctype.findMany({
            where: {
              locationId: {
                hasSome: activeUser.additionalUnits,
              },
              organizationId: activeUser.organizationId,
              // deleted: false,
            },
            // include: {
            //   documentAdmins: true,
            // },
          });
        }
        // console.log('doctypes', doctypes);
        if (!doctypes) {
          throw new HttpException(
            'The user does not belong to a location',
            404,
          );
        }

        // let doctypesWhereActiveUserIsCreator = doctypes.filter((data) =>
        //   data.documentAdmins.some(
        //     (item: any) => item.email == activeUser.email && item.type == 'CREATOR',
        //   ),
        // );

        if (doctypes?.length > 0) {
          return {
            doctypes: doctypes,
            userLocation: activeUser?.location,
            userDepartment: activeUser?.entity,
          };
        } else {
          throw new HttpException(
            'The user doesnt has permission to create Documents',
            404,
          );
        }
      }
    } catch (error) {}
  }

  //TODO
  async uniqueCheck(userId, text) {
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    //////////////console.log('text', text);
    //  try {
    if (text != null) {
      const result = await this.prisma.doctype.findMany({
        where: {
          organizationId: user.organizationId,
          document_classification: {
            contains: text,
            mode: 'insensitive',
          },
          // deleted: false,
        },
      });
      const finalResult = result.length === 0 ? true : false;

      return finalResult;
    } else {
      return true;
    }
    // } catch (error) {
    //   return {
    //     error: error.message,
    //   };
    // }
  }

  //TODO
  async getSystemsForDocuments(userId, docType) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    const result = await this.prisma.doctype.findMany({
      where: {
        organizationId: orgId.organizationId,
        documentTypeName: {
          contains: docType,
          mode: 'insensitive',
        },
        // deleted: false,
      },
      select: {
        id: true,
        applicable_systems: true,
      },
    });

    return result;
  }

  //TODO
  async getDocClassfication(system, docType, userId) {
    const orgId = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });

    try {
      const finalResult = await this.prisma.doctype.findFirst({
        where: {
          organizationId: orgId.organizationId,
          applicable_systems: { has: system },
          documentTypeName: docType,
        },
      });
      return finalResult;
    } catch (error) {
      throw new ConflictException(error);
    }
  }

  //TODO
  async getDocTypeByName(docType, location, department, section, kcId, userId) {
    let orgId;
    if (kcId) {
      orgId = await this.prisma.user.findFirst({
        where: {
          kcId: kcId,
        },
      });
    } else {
      orgId = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
      });
    }

    let docTypeDetails;
    let locDetails;
    let deptDetails;
    let sectionDetails;
    let finalResult;

    docTypeDetails = await this.doctypeModel.findOne({
      organizationId: orgId.organizationId,
      documentTypeName: docType,
    });
    if (!docTypeDetails) {
      return { message: `"${docType}" Document Type does not exist` };
    }

    const systems = docTypeDetails.applicable_systems.map(
      (item: any) => item.id,
    );

    locDetails = await this.prisma.location.findFirst({
      where: {
        organizationId: orgId.organizationId,
        locationName: {
          equals: location,
          mode: 'insensitive',
        },
      },
    });
    if (!locDetails) {
      return { message: `"${location}" location does not exist` };
    }

    deptDetails = await this.prisma.entity.findFirst({
      where: {
        organizationId: orgId.organizationId,
        locationId: locDetails.id,
        entityName: {
          equals: department,
          mode: 'insensitive',
        },
      },
    });
    if (!deptDetails) {
      return {
        message: `"${department}" department not found for "${location}" location`,
      };
    }

    const applicableSystems = deptDetails.sections;
    sectionDetails = await this.prisma.section.findFirst({
      where: {
        organizationId: orgId.organizationId,
        name: {
          equals: section,
          mode: 'insensitive',
        },
        id: {
          in: applicableSystems,
        },
      },
    });
    if (!sectionDetails) {
      finalResult = {
        docTypeId: docTypeDetails._id?.toString(),
        systems,
        locationId: locDetails.id,
        entityId: deptDetails.id,
        docTypeDetails,
      };
      return {
        message: `Document Created but "${section}" section not found for department "${department}"`,
        finalResult,
      };
    }
    finalResult = {
      docTypeId: docTypeDetails._id?.toString(),
      systems,
      locationId: locDetails.id,
      entityId: deptDetails.id,
      docTypeDetails,
      sectionName: sectionDetails.name,
      section: sectionDetails.id,
    };
    return { message: `Document Created Successfully`, finalResult };
  }

  async getFirstDocType(orgId: any) {
    try {
      const doctype = await this.doctypeModel.findOne({
        organizationId: orgId,
      });
      return {
        success: true,
        message: 'Doctype fetched successfully',
        data: doctype,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch doctype',
        error: error.message,
      };
    }
  }

  async getUserAccessibleDoctypes(userDetails, selectedEntity: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { kcId: userDetails.id },
        select: {
          id: true,
          locationId: true,
          entityId: true,
          organizationId: true,
          kcId: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          data: null,
        };
      }

      // Get all doctypes for the organization
      const doctypes = await this.doctypeModel
        .find({
          organizationId: user.organizationId,
          deletedAt: null,
        })
        .lean();

      if (!doctypes || doctypes.length === 0) {
        return {
          success: true,
          message: 'No doctypes found for this organization',
          data: [],
        };
      }

      const accessibleDoctypes = (
        await Promise.all(
          doctypes.map(async (doctype: any) => {
            const { docCreateAccess, docCreateAccessIds = [] } = doctype;

            let isAccessible = false;

            if (docCreateAccess === 'All Users') {
              isAccessible = true;
            } else if (
              docCreateAccess === 'Selected Users' &&
              docCreateAccessIds.includes(user.id)
            ) {
              isAccessible = true;
            } else if (
              docCreateAccess === 'Selected Entity' &&
              //user.entityId &&
              docCreateAccessIds.includes(selectedEntity)
            ) {
              isAccessible = true;
            } else if (
              docCreateAccess === 'Selected Unit' &&
              user.locationId &&
              docCreateAccessIds.includes(user.locationId)
            ) {
              isAccessible = true;
            } else if (docCreateAccess === 'PIC') {
              const entities = await this.prisma.entity.findMany({
                where: {
                  id: { in: docCreateAccessIds },
                  deleted: false,
                },
                select: {
                  id: true,
                  pic: true,
                },
              });
              const userIsPIC = entities.some((entity) =>
                entity.pic.includes(user.id),
              );
              if (userIsPIC) isAccessible = true;
            } else if (docCreateAccess === 'Head') {
              const entities = await this.prisma.entity.findMany({
                where: {
                  id: { in: docCreateAccessIds },
                  deleted: false,
                  manager: user.id,
                },
                select: {
                  id: true,
                  manager: true,
                },
              });
              if (entities.length > 0) isAccessible = true;
            } else if (
              docCreateAccess === 'All in Entities' &&
              //user.entityId &&
              docCreateAccessIds.includes(selectedEntity)
            ) {
              isAccessible = true;
            } else if (
              docCreateAccess === 'All in Units' &&
              user.locationId &&
              docCreateAccessIds.includes(user.locationId)
            ) {
              isAccessible = true;
            }

            if (!isAccessible) return null;

            // Now fetch applicable systems with name and id
            let applicableSystems = [];
            if (
              doctype.applicable_systems &&
              doctype.applicable_systems.length > 0
            ) {
              const systems = await this.SystemModel.find({
                _id: { $in: doctype.applicable_systems },
                organizationId: user.organizationId,
              }).lean();

              applicableSystems = systems.map((system: any) => ({
                id: system._id,
                name: system.name,
              }));
            }

            const workflowDetails =
              doctype?.workflowId !== 'default' &&
              doctype?.workflowId !== 'none'
                ? await this.globalWorkflowService.getGlobalWorkflowForTranscation(
                    doctype?.workflowId,
                    { id: user.kcId },
                    '',
                  )
                : doctype?.workflowId;

            return {
              id: doctype._id,
              name: doctype.documentTypeName,
              initialVersion: doctype?.initialVersion,
              workflowDetails: workflowDetails,
              workFlowId: doctype?.workFlowId ? doctype?.workFlowId : 'default',
              distributionList: doctype?.docDistributionList,
              distributionListUsers: doctype?.docDistributionListIds,
              readAccessType: doctype?.docReadAccess,
              readAccessList: doctype?.docReadAccessIds,

              applicableSystems,
            };
          }),
        )
      ).filter(Boolean); // Remove nulls

      return {
        success: true,
        message: 'Doctypes with create access retrieved successfully',
        data: accessibleDoctypes,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to get doctypes with create access',
        error: error.message || 'Unexpected server error',
        data: null,
      };
    }
  }
}
