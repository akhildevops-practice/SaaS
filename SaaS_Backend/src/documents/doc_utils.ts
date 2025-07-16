import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import * as common from 'oci-common';
import * as objectstorage from 'oci-objectstorage';
import * as st from 'stream';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from '../prisma.service';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { Express } from 'express';
import { Multer } from 'multer';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import { DocumentAttachmentHistory } from './schema/DocumentAttachmentHistory.schema';
import { Doctype } from 'src/doctype/schema/doctype.schema';
import { docWorkflowHistoy } from './schema/docWorkflowHistory.schema';
import { GlobalRoles } from 'src/user/schema/globlaRoles.schema';
@Injectable()
export class DocUtils {
  constructor(
    private prisma: PrismaService,
    @InjectModel(DocumentAttachmentHistory.name)
    private DocumentAttachmentHistoryModel: Model<DocumentAttachmentHistory>,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(System.name) private System: Model<SystemDocument>,
    @InjectModel(Doctype.name)
    private doctypeModel: Model<Doctype>,
    @InjectModel(docWorkflowHistoy.name)
    private docWorkflowHistoyModel: Model<docWorkflowHistoy>,
    @InjectModel(GlobalRoles.name)
    private readonly globalRolesModel: Model<GlobalRoles>,
  ) {}
  async createEntryInDocumentAttachmentHistory(
    documentId,
    updatedLink,
    updatedBy,
  ) {
    try {
      const documentAttachmentHistory =
        await this.DocumentAttachmentHistoryModel.create({
          documentId,
          updatedLink,
          updatedBy,
        });
      return documentAttachmentHistory;
    } catch (error) {
      this.logger.error(
        `Error creating entry in DocumentAttachmentHistory: ${error}`,
      );
    }
  }

  async createEntryInDocWorkflowHistory(
    documentId,
    actionBy,
    actionName,
    digiSign?,
  ) {
    const docWorkflowHistory = await this.docWorkflowHistoyModel.create({
      documentId,
      actionBy,
      actionName,
      digiSign,
    });
    return docWorkflowHistory;
  }

  async getDoctypeDetailsWithSystems(
    doctypeId: string,
    organizationId: string,
  ) {
    const doctype: any = await this.doctypeModel.findById(doctypeId).lean();
    if (!doctype) return null;

    const systemIds =
      doctype?.applicable_systems?.filter((id: string) => id !== 'All') || [];

    const systems = await this.System.find({
      organizationId,
      _id: { $in: systemIds },
    })
      .select('_id name docCreateAccess docCreateAccessIds')
      .lean();

    return {
      id: doctype._id,
      documentTypeName: doctype.name || doctype.documentTypeName,
      applicable_systems: systems,
      workflowId: doctype.workflowId,
      docCreateAccess: doctype.docCreateAccess,
      docCreateAccessIds: doctype.docCreateAccessIds,
      whoCanDownload: doctype?.whoCanDownload,
      whoCanDownloadIds: doctype?.whoCanDownloadIds || [],
    };
  }

  async populateDocumentDetails(
    document: any,
    randomNumber: string,
    activeUser: any,
  ) {
    try {
      const userIds: any = new Set();
      const entityIds: any = new Set();
      const locationIds: any = new Set();
      const workflowEntityIds: any = new Set();
      const globalRoleIds: any = new Set();

      document?.reviewers?.forEach((reviewer: any) => userIds.add(reviewer));
      document?.approvers?.forEach((approver: any) => userIds.add(approver));
      document?.entityId && entityIds.add(document?.entityId);
      document?.locationId && locationIds.add(document?.locationId);

      document?.createdBy && userIds.add(document?.createdBy);
      document?.updatedBy && userIds.add(document?.updatedBy);

      if (document?.readAccess?.type === 'Selected Users') {
        document?.readAccess?.ids?.forEach((id: any) => userIds.add(id));
      }

      if (document?.distributionList?.type === 'Selected Users') {
        document?.distributionList?.ids?.forEach((id: any) => userIds.add(id));
      }

      if (
        document?.readAccess?.type === 'All in Entities' ||
        document?.readAccess?.type === 'Respective Entity' ||
        document?.distributionList?.type === 'All in Entities' ||
        document?.distributionList?.type === 'Respective Entity'
      ) {
        document?.readAccess?.ids?.length &&
          document?.readAccess?.ids?.forEach((id: any) => entityIds.add(id));
        document?.distributionList?.ids?.length &&
          document?.distributionList?.ids?.forEach((id: any) =>
            entityIds.add(id),
          );
      }

      if (
        document?.readAccess?.type === 'All in Units' ||
        document?.readAccess?.type === 'Respective Unit' ||
        document?.distributionList?.type === 'All in Units' ||
        document?.distributionList?.type === 'Respective Unit'
      ) {
        document?.readAccess?.ids?.length &&
          document?.readAccess?.ids?.forEach((id: any) => locationIds.add(id));
        document?.distributionList?.ids?.length &&
          document?.distributionList?.ids?.forEach((id: any) =>
            locationIds.add(id),
          );
      }

      if (
        document.workflowDetails &&
        document.workflowDetails !== 'default' &&
        document.workflowDetails !== 'none' &&
        Array.isArray(document.workflowDetails?.workflow)
      ) {
        for (const stage of document.workflowDetails.workflow) {
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

      const docWorkflowHistory = await this.docWorkflowHistoyModel
        .find({ documentId: document._id })
        .sort({ createdAt: 1 })
        .lean();

      // Collect additional userIds from workflow history
      const workflowUserIds = new Set<string>();
      docWorkflowHistory.forEach((entry: any) =>
        workflowUserIds.add(entry.actionBy),
      );

      // Merge all userIds to avoid duplicate fetch
      workflowUserIds.forEach((id) => userIds.add(id));

      // Fetch all user details (already included in your Promise.all)

      // Create workflowPeopleDetails object
      const workflowPeopleDetails = {
        creatorDetails: null,
        reviewerDetails: [],
        approverDetails: [],
      };

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

      const [users, entities, locations] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            OR: [
              { id: { in: Array.from(cleanedUserIds) } },
              { entityId: { in: Array.from(workflowEntityIds) } },
            ],
          },
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            avatar: true,
            entityId: true,
          },
        }),
        this.prisma.entity.findMany({
          where: { id: { in: Array.from(entityIds) } },
          select: {
            id: true,
            entityName: true,
          },
        }),
        this.prisma.location.findMany({
          where: { id: { in: Array.from(locationIds) } },
          select: {
            id: true,
            locationName: true,
          },
        }),
      ]);

      const userMap = new Map(users.map((user) => [user.id, user]));

      if (
        document.workflowDetails !== 'default' &&
        document.workflowDetails !== 'none' &&
        !!document?.workflowDetails
      ) {
        for (const stage of document?.workflowDetails?.workflow) {
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
                      const user = userMap.get(userId);
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
                      const userDetails = userMap.get(user.userId);
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
                    const usersId = users.map((item: any) => {
                      if (item.entityId === condition.selectedDepartment) {
                        return item.id;
                      }
                    });
                    condition.userList = usersId
                      .map((userId: string) => {
                        const user = userMap.get(userId);
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
                        const user = userMap.get(userId);
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

      for (const entry of docWorkflowHistory) {
        const user = userMap.get(entry.actionBy);
        if (!user) continue;

        const action = entry.actionName?.toLowerCase();
        if (action === 'created' && !workflowPeopleDetails.creatorDetails) {
          workflowPeopleDetails.creatorDetails = user;
        } else if (action === 'reviewed') {
          workflowPeopleDetails.reviewerDetails.push(user);
        } else if (action === 'approved') {
          workflowPeopleDetails.approverDetails.push(user);
        }
      }

      // Get doctype details with system info
      const docTypeDetails = document?.doctypeId
        ? await this.getDoctypeDetailsWithSystems(
            document.doctypeId,
            document.organizationId,
          )
        : null;

      const downloadAccess =
        docTypeDetails?.whoCanDownload === 'All Users' ||
        docTypeDetails?.whoCanDownloadIds.includes(activeUser.id) ||
        docTypeDetails?.whoCanDownloadIds.includes(activeUser.locationId) ||
        docTypeDetails?.whoCanDownloadIds.includes(activeUser.entityId) ||
        docTypeDetails?.whoCanDownloadIds.includes('All');
      return {
        ...document,
        createdByDetails: userMap.get(document?.createdBy),
        updatedByDetails: userMap.get(document?.updatedBy),
        entityDetails: entities,
        locationDetails: locations,
        downloadAccess,
        reviewersDetails: document?.reviewers?.map((reviewer: any) =>
          userMap.get(reviewer),
        ),
        approversDetails: document?.approvers?.map((approver: any) =>
          userMap.get(approver),
        ),

        ...(document?.readAccess?.type === 'Selected Users' && {
          readAccessDetails: {
            ...document?.readAccess,
            userDetails: document?.readAccess?.ids?.map((id: any) =>
              userMap.get(id),
            ),
          },
        }),
        ...((document?.readAccess?.type === 'All in Entities' ||
          document?.readAccess?.type === 'Respective Entity') && {
          readAccessDetails: {
            ...document?.readAccess,
            entityDetails: entities,
          },
        }),
        ...((document?.readAccess?.type === 'All in Units' ||
          document?.readAccess?.type === 'Respective Unit') && {
          readAccessDetails: {
            ...document?.readAccess,
            locationDetails: locations,
          },
        }),

        ...(document?.distributionList?.type === 'Selected Users' && {
          distributionListDetails: {
            ...document?.distributionList,
            userDetails: document?.distributionList?.ids?.map((id: any) =>
              userMap.get(id),
            ),
          },
        }),
        ...((document?.distributionList?.type === 'All in Entities' ||
          document?.distributionList?.type === 'Respective Entity') && {
          distributionListDetails: {
            ...document?.distributionList,
            entityDetails: entities,
          },
        }),
        ...((document?.distributionList?.type === 'All in Units' ||
          document?.distributionList?.type === 'Respective Unit') && {
          distributionListDetails: {
            ...document?.distributionList,
            locationDetails: locations,
          },
        }),
        ...(docTypeDetails && { docTypeDetails }),
        ...((workflowPeopleDetails && {
          workflowPeopleDetails: workflowPeopleDetails,
        }) ||
          {}),
      };
    } catch (error) {
      console.log('erorr in populate doc details', error);

      throw new Error(
        `trace id=${randomNumber} Failed to populate document details: ${
          error.message || error
        }`,
      );
    }
  }

  async populateDocumentListDetails(
    documents: any[],
    loggedInUserId: string,
    loggedInUserEntityId: string,
    loggedInUserLocationId: string,
  ): Promise<any[]> {
    try {
      const userIds: Set<string> = new Set();
      const entityIds: Set<string> = new Set();
      const locationIds: Set<string> = new Set();
      const systemIds: Set<string> = new Set();
      const doctypeIds: Set<string> = new Set();

      // Collect all unique IDs
      for (const doc of documents) {
        doc?.createdBy && userIds.add(doc.createdBy);
        doc?.updatedBy && userIds.add(doc.updatedBy);
        doc?.reviewers?.forEach((id: string) => userIds.add(id));
        doc?.approvers?.forEach((id: string) => userIds.add(id));
        doc?.entityId && entityIds.add(doc.entityId);
        doc?.locationId && locationIds.add(doc.locationId);
        doc?.system?.forEach((id: string) => id && systemIds.add(id));
        doc?.doctypeId && doctypeIds.add(doc.doctypeId);
        if (
          doc.workflowDetails !== 'default' &&
          doc.workflowDetails !== 'none'
        ) {
          if (
            doc.documentState !== 'DRAFT' &&
            doc.documentState !== 'PUBLISHED' &&
            doc.documentState !== 'OBSOLETE' &&
            doc.documentState !== 'Sent_For_Edit'
          ) {
            const currentStageWorkflow = doc.workflowDetails.workflow.find(
              (item: any) => item.stage === doc.documentState,
            );
            doc.pendingWith = new Set();
            currentStageWorkflow.ownerSettings.forEach((owners: any) =>
              owners.forEach((users: any) => {
                if (users.ifUserSelect) {
                  users.actualSelectedUsers.forEach((id: any) => {
                    if (id) {
                      userIds.add(id);
                      doc.pendingWith.add(id);
                    }
                  });
                } else {
                  users.selectedUsers.forEach((id: any) => {
                    if (id) {
                      userIds.add(id);
                      doc.pendingWith.add(id);
                    }
                  });
                }
              }),
            );
          }
        }
      }

      const validSystemIds = Array.from(systemIds).filter((id) => !!id);

      // Fetch all data in bulk
      const [users, entities, locations, systems, doctypes] = await Promise.all(
        [
          this.prisma.user.findMany({
            where: { id: { in: Array.from(userIds) } },
            select: {
              id: true,
              username: true,
              email: true,
              firstname: true,
              lastname: true,
              avatar: true,
            },
          }),
          this.prisma.entity.findMany({
            where: { id: { in: Array.from(entityIds) } },
            select: {
              id: true,
              entityName: true,
              pic: true,
              manager: true,
            },
          }),
          this.prisma.location.findMany({
            where: { id: { in: Array.from(locationIds) } },
            select: { id: true, locationName: true },
          }),
          this.System.find({ _id: { $in: validSystemIds } })
            .select('_id name')
            .lean(),
          this.doctypeModel
            .find({ _id: { $in: Array.from(doctypeIds) } })
            .select(
              '_id documentTypeName docCreateAccess docCreateAccessIds docReadAccess docReadAccessIds versionType',
            )
            .lean(),
        ],
      );

      // Create maps for lookups
      const userMap = new Map(users.map((u) => [u.id, u]));
      const entityMap = new Map(entities.map((e) => [e.id, e]));
      const locationMap = new Map(locations.map((l) => [l.id, l]));
      const systemMap = new Map(systems.map((s) => [String(s._id), s]));
      const doctypeMap = new Map(doctypes.map((d) => [String(d._id), d]));

      // Helper: PIC/Head logic
      const isUserPICorHeadForEntities = (
        accessType: string,
        accessIds: string[],
        userId: string,
        allEntities: any[],
      ) => {
        const targetField = accessType.toLowerCase(); // 'pic' or 'head'
        const matchedEntities = allEntities.filter((ent) =>
          accessIds.includes(ent.id),
        );
        for (const entity of matchedEntities) {
          const ids = Array.isArray(entity[targetField])
            ? entity[targetField]
            : [entity[targetField]];
          if (ids.includes(userId)) return true;
        }
        return false;
      };

      // Populate each document
      return documents.map((doc) => {
        const docType: any = doctypeMap.get(String(doc.doctypeId));
        const accessType: any = docType?.docCreateAccess;
        const accessIds: any = docType?.docCreateAccessIds || [];

        let hasCreateAccess = false,
          hasReadAccess = false;

        if (accessType === 'All Users') {
          hasCreateAccess = true;
        } else if (accessType === 'Selected Users') {
          hasCreateAccess = accessIds.includes(loggedInUserId);
        } else if (accessType === 'Selected Entity') {
          hasCreateAccess = accessIds.includes(loggedInUserEntityId);
        } else if (accessType === 'Selected Unit') {
          hasCreateAccess = accessIds.includes(loggedInUserLocationId);
        } else if (accessType === 'All in Entities') {
          // User's entity is included in allowed list
          hasCreateAccess = accessIds.includes(loggedInUserEntityId);
        } else if (accessType === 'All in Units') {
          // User's location is included in allowed list
          hasCreateAccess = accessIds.includes(loggedInUserLocationId);
        } else if (['PIC', 'Head'].includes(accessType)) {
          hasCreateAccess = isUserPICorHeadForEntities(
            accessType,
            accessIds,
            loggedInUserId,
            entities,
          );
        }

        // Read Access // selected entity and selected unit not yet done in frontned
        const readAccessType: any = docType?.docReadAccess;
        const readAccessIds: any = docType?.docReadAccessIds || [];

        if (readAccessType === 'All Users') {
          hasReadAccess = true;
        } else if (readAccessType === 'Selected Users') {
          hasReadAccess = readAccessIds.includes(loggedInUserId);
        } else if (readAccessType === 'Selected Entity') {
          hasReadAccess = readAccessIds.includes(loggedInUserEntityId);
        } else if (readAccessType === 'Selected Unit') {
          hasReadAccess = readAccessIds.includes(loggedInUserLocationId);
        } else if (readAccessType === 'All in Entities') {
          hasReadAccess = readAccessIds.includes(loggedInUserEntityId);
        } else if (readAccessType === 'All in Units') {
          hasReadAccess = readAccessIds.includes(loggedInUserLocationId);
        } else if (['PIC', 'Head'].includes(readAccessType)) {
          hasReadAccess = isUserPICorHeadForEntities(
            readAccessType,
            readAccessIds,
            loggedInUserId,
            entities,
          );
        }

        let pendingWith;
        if (doc.documentState === 'DRAFT') {
          pendingWith = [userMap.get(doc.createdBy)];
        } else {
          if (doc.workflowDetails === 'default') {
            if (doc.documentState === 'IN_REVIEW') {
              pendingWith =
                doc.reviewers?.map((id: string) => userMap.get(id)) ?? [];
            }
            if (doc.documentState === 'IN_APPROVAL') {
              pendingWith =
                doc.approvers?.map((id: string) => userMap.get(id)) ?? [];
            }
          }
          if (
            doc.workflowDetails !== 'default' &&
            doc.workflowDetails !== 'none'
          ) {
            if (
              doc.documentState !== 'PUBLISHED' &&
              doc.documentState !== 'OBSOLETE'
            ) {
              pendingWith =
                Array.from(doc?.pendingWith)?.map((id: string) => {
                  if (id) {
                    return userMap.get(id);
                  }
                }) ?? [];
            }
          }
        }

        return {
          ...(doc.toObject?.() ?? doc),
          createdBy: userMap.get(doc.createdBy),
          updatedBy: userMap.get(doc.updatedBy),
          entityDetails: entityMap.get(doc.entityId),
          locationDetails: locationMap.get(doc.locationId),
          systemDetails:
            doc.system?.map((id: string) => systemMap.get(id)) ?? [],
          reviewersDetails:
            doc.reviewers?.map((id: string) => userMap.get(id)) ?? [],
          approversDetails:
            doc.approvers?.map((id: string) => userMap.get(id)) ?? [],
          ...(doc.doctypeId && { docTypeDetails: docType }),
          hasCreateAccess,
          hasReadAccess,
          pendingWith: pendingWith,
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to populate my documents details: ${error.stack || error}`,
      );
    }
  }

  async populatePublishedListDetails(
    documents: any[],
    loggedInUserId: string,
    loggedInUserEntityId: string,
    loggedInUserLocationId: string,
  ): Promise<any[]> {
    try {
      const doctypeIds: Set<string> = new Set();
      // Collect all unique IDs
      for (const doc of documents) {
        doc?.doctypeId && doctypeIds.add(doc.doctypeId);
      }
      // console.log('doctypeIds', doctypeIds);

      // Fetch all data in bulk
      const [doctypes, entities] = await Promise.all([
        this.doctypeModel.find({ _id: { $in: Array.from(doctypeIds) } }).lean(),
        this.prisma.entity.findMany({
          where: {},
          select: { id: true, pic: true, manager: true },
        }),
      ]);

      const doctypeMap = new Map(doctypes.map((d) => [String(d._id), d]));
      const entityMap = new Map(entities.map((e) => [e.id, e]));

      // Helper: PIC/Head logic
      const isUserPICorHeadForEntities = (
        accessType: string,
        accessIds: string[],
        userId: string,
        allEntities: any[],
      ) => {
        const targetField = accessType.toLowerCase(); // 'pic' or 'head'
        const matchedEntities = allEntities.filter((ent) =>
          accessIds.includes(ent.id),
        );
        for (const entity of matchedEntities) {
          const ids = Array.isArray(entity[targetField])
            ? entity[targetField]
            : [entity[targetField]];
          if (ids.includes(userId)) return true;
        }
        return false;
      };

      // Populate each document
      return documents.map((doc) => {
        const docType: any = doctypeMap.get(String(doc.doctypeId));
        const accessType: any = docType?.docCreateAccess;
        const accessIds: any = docType?.docCreateAccessIds || [];

        // console.log('docType', docType);
        // console.log('accessType', accessType);
        // console.log('accessIds', accessIds);

        let hasCreateAccess = false,
          hasReadAccess = false;

        if (accessType === 'All Users') {
          hasCreateAccess = true;
        } else if (accessType === 'Selected Users') {
          hasCreateAccess = accessIds.includes(loggedInUserId);
        } else if (accessType === 'Selected Entity') {
          hasCreateAccess = accessIds.includes(loggedInUserEntityId);
        } else if (accessType === 'Selected Unit') {
          hasCreateAccess = accessIds.includes(loggedInUserLocationId);
        } else if (accessType === 'All in Entities') {
          // User's entity is included in allowed list
          hasCreateAccess = accessIds.includes(loggedInUserEntityId);
        } else if (accessType === 'All in Units') {
          // User's location is included in allowed list
          hasCreateAccess = accessIds.includes(loggedInUserLocationId);
        } else if (['PIC', 'Head'].includes(accessType)) {
          hasCreateAccess = isUserPICorHeadForEntities(
            accessType,
            accessIds,
            loggedInUserId,
            entities,
          );
        }

        // Read Access // selected entity and selected unit not yet done in frontned
        const readAccessType: any = docType?.docReadAccess;
        const readAccessIds: any = docType?.docReadAccessIds || [];

        if (readAccessType === 'All Users') {
          hasReadAccess = true;
        } else if (readAccessType === 'Selected Users') {
          hasReadAccess = readAccessIds.includes(loggedInUserId);
        } else if (readAccessType === 'Selected Entity') {
          hasReadAccess = readAccessIds.includes(loggedInUserEntityId);
        } else if (readAccessType === 'Selected Unit') {
          hasReadAccess = readAccessIds.includes(loggedInUserLocationId);
        } else if (readAccessType === 'All in Entities') {
          hasReadAccess = readAccessIds.includes(loggedInUserEntityId);
        } else if (readAccessType === 'All in Units') {
          hasReadAccess = readAccessIds.includes(loggedInUserLocationId);
        } else if (['PIC', 'Head'].includes(readAccessType)) {
          hasReadAccess = isUserPICorHeadForEntities(
            readAccessType,
            readAccessIds,
            loggedInUserId,
            entities,
          );
        }
        // console.log('doc', doc, docType);

        return {
          ...(doc.toObject?.() ?? doc),
          docTypeDetails: docType ?? null,
          hasCreateAccess,
          hasReadAccess,
        };
      });
    } catch (error) {
      throw new Error(
        `Failed to populate my documents details: ${error.message || error}`,
      );
    }
  }

  groupDocumentsWithVersions(docs: any[]) {
    // console.log('docs', docs);
    const docMap = new Map<string, any>();
    const groups: Record<string, any[]> = {};

    // Step 1: Build map of all docs by _id for easy lookup
    for (const doc of docs) {
      docMap.set(doc._id.toString(), doc);
    }

    // Step 2: Group by base document (either _id or documentId target)
    for (const doc of docs) {
      const baseId = doc.documentId?.toString() || doc._id.toString();
      if (!groups[baseId]) groups[baseId] = [];
      groups[baseId].push(doc);
    }

    const finalDocs: any[] = [];

    // Step 3: Process each group
    for (const [baseId, group] of Object.entries(groups)) {
      const sortedGroup = [...group].sort((a, b) => {
        // Published first
        const isPublishedA = a.documentState === 'PUBLISHED' ? 1 : 0;
        const isPublishedB = b.documentState === 'PUBLISHED' ? 1 : 0;
        if (isPublishedA !== isPublishedB) return isPublishedB - isPublishedA;

        // Obsolete with countNumber 1 goes last
        const isObsoleteLowA =
          a.documentState === 'Obsolete' && a.countNumber === 1 ? 1 : 0;
        const isObsoleteLowB =
          b.documentState === 'Obsolete' && b.countNumber === 1 ? 1 : 0;
        if (isObsoleteLowA !== isObsoleteLowB)
          return isObsoleteLowA - isObsoleteLowB;

        // Otherwise, sort by countNumber descending
        return b.countNumber - a.countNumber;
      });

      const [parent, ...versions] = sortedGroup;

      finalDocs.push({
        ...parent,
        documentVersions: versions,
      });
    }

    return finalDocs;
  }

  /**
      Expecting filterArray to be like this [
      { filterField: "docTypeId", filterString: "abc123" },
      { filterField: "locationId", filterString: "xyz456" },
        { filterField: "system", filterString: "sys789" }
      ]
  */

  async queryGeneratorForDocumentsFilter(filterArray = []) {
    const filterConditions = [];

    const filterFieldTypes = {
      docTypeId: 'array',
      locationId: 'array',
      entityId: 'array',
      system: 'array',
      documentState: 'array',
      documentName: 'text',
    };

    for (const filter of filterArray) {
      const { filterField, filterString, fieldArr } = filter;

      if (
        !filterField ||
        (!filterString && (!Array.isArray(fieldArr) || fieldArr.length === 0))
      ) {
        continue; // skip invalid filter
      }

      const fieldType = filterFieldTypes[filterField];

      if (!fieldType) {
        continue;
      }

      if (fieldType === 'array') {
        if (fieldArr && fieldArr.length > 0) {
          filterConditions.push({
            [filterField]: { $in: fieldArr },
          });
        }
      } else if (fieldType === 'text') {
        if (filterString) {
          filterConditions.push({
            [filterField]: { $regex: filterString, $options: 'i' },
          });
        }
      }
    }

    return filterConditions;
  }
}
