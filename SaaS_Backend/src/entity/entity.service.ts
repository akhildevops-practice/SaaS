import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  createFieldsPairsFilterUsers,
  queryGeneratorDept,
} from '../utils/filterGenerator';
import { EntityCreateDto } from './dto/entity-create.dto';
import { includeObj, includeObjDept } from '../utils/constants';
import { createFieldsPairsFilterDept } from '../utils/filterGenerator';
import { entity, section } from '../organization/dto/business-config.dto';
// import { identity } from 'rxjs';
import { UserService } from '../user/user.service';
import { roles } from '../utils/roles.global';
import { MongoClient, ObjectId } from 'mongodb';
import { EntityChain } from './schema/entityChain.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EntityService {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService,
    @InjectModel(EntityChain.name)
    private entityChainModel: Model<EntityChain>,
  ) {}

  async createEntity(entityPayload: EntityCreateDto) {
    let {
      realm,
      entityName,
      entityTypeId,
      description,
      location,
      functionId,
      entityId,
      parentId,
      users,
      pic,
      notification,
      additionalAuditee,
      sections,

      manager,
    } = entityPayload;
    const locationInfo: any = location?.id;
    const functioninfo: any = functionId?.id;
    const userinfo = users?.map((value: any) => value?.id);
    let picData = [];
    const entity = await this.prisma.entity.findFirst({
      where: {
        AND: [
          {
            organization: {
              realmName: realm,
            },
            locationId: locationInfo,
          },
          {
            OR: [{ entityName: entityName }, { entityId: entityId }],
          },
        ],
      },
    });

    if (entity) {
      throw new ConflictException(
        'Duplicate Department, please give a differnt department name',
      );
    }

    if (parentId) {
      const parentEntity = await this.prisma.entity.findUnique({
        where: { id: parentId },
        select: { hierarchyChain: true },
      });

      if (!parentEntity) {
        throw new NotFoundException('Parent entity not found');
      }

      // hierarchyChain = [...(parentEntity.hierarchyChain || [])];
    }

    if (pic?.length > 0) {
      picData = pic.map((value: any) => value?.id);
    }

    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realm,
      },
    });

    // Compute hierarchyChain based on parentId
    let hierarchyChain: string[] = [];
    if (parentId) {
      const parentEntity = await this.prisma.entity.findUnique({
        where: { id: parentId },
        select: { hierarchyChain: true },
      });

      if (!parentEntity) {
        throw new NotFoundException('Parent entity not found');
      }

      hierarchyChain = [...(parentEntity.hierarchyChain || []), parentId];
    }

    const data: any = {
      organization: {
        connect: {
          id: organization.id,
        },
      },
      entityName: entityName,
      entityType: {
        connect: {
          id: entityTypeId.id,
        },
      },
      notification,
      additionalAuditee,
      description: description,
      entityId: entityId,
      function: functioninfo ? { connect: { id: functioninfo } } : undefined,
      pic: picData || [],
      // functionId,
      users: userinfo,
      sections: sections,
      deleted: false,
      parentId: parentId,
      hierarchyChain: hierarchyChain,
      location: {
        connect: {
          id: locationInfo,
        },
      },
      // hierarchyChain: hierarchyChain,
      ...(pic?.length ? { pic: pic.map((value: any) => value.id) } : {}),
      ...(manager?.id ? { manager: manager?.id } : {}),
    };

    const createdEntity = await this.prisma.entity.create({
      data: data,
    });

    return createdEntity;
  }
  catch(error) {
    // console.error('Error creating entity:', error);
    throw new InternalServerErrorException(
      'An error occurred while creating the entity',
    );
  }

  async getEntityUsedData(user, id) {
    try {
      const client = new MongoClient(process.env.MONGO_DB_URI1);
      const db = client.db(process.env.MONGO_DB_NAME);
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const documentCount = await db.collection('Documents').countDocuments({
        organizationId: activeUser.organizationId,
        entityId: id,
        // deleted: false,
      });

      const auditCount = await db.collection('audits').countDocuments({
        organizationId: activeUser.organizationId,
        entityId: id,
        // deleted: false,
      });

      const hiraCount = await db.collection('hiraregisters').countDocuments({
        organizationId: activeUser.organizationId,
        entityId: id,
        // deleted: false,
      });

      const caraCount = await db.collection('caras').countDocuments({
        organizationId: activeUser.organizationId,
        entityId: id,
        // deleted: false,
      });
      return {
        documentCount,
        auditCount,
        hiraCount,
        caraCount,
      };

      // caras
      // hiraregisters
    } catch (err) {}
  }

  async getEntity(orgid: string, locid: string) {
    const entityData = await this.prisma.entity.findMany({
      include: {
        location: {
          select: {
            locationName: true,
          },
        },
        function: {
          select: {
            name: true,
          },
        },
      },
      where: {
        AND: [{ locationId: locid }, { organizationId: orgid }],
        deleted: false,
      },
      orderBy: {
        entityName: 'asc', // Order by entityName in ascending order
      },
    });
    return entityData;
  }

  async getBusinessTypeForLocation(locationId: string) {
    const business = await this.prisma.business.findMany({
      where: {
        location: {
          some: {
            location: {
              id: {
                contains: locationId,
              },
            },
          },
        },
        deleted: false,
      },
    });

    return business;
  }

  async searchDepartment(organizationId, querystring, user) {
    const query = querystring.query;
    //////console.log('query', query);
    const aggregationPipeline = [];
    const limit = Number(querystring?.limit) || 10;
    const page = Number(querystring?.page) || 1;
    const skip = Number((page - 1) * limit);

    const locationId = await this.prisma.location.findFirst({
      where: {
        locationName: {
          contains: query,
          mode: 'insensitive',
        },
      },
    });
    const entityArray = await this.prisma.entity.findMany({
      where: {
        OR: [
          { id: { contains: query, mode: 'insensitive' } },
          { entityName: { contains: query, mode: 'insensitive' } },
          { entityId: { contains: query, mode: 'insensitive' } },
          { locationId: locationId?.id },
        ],
        organizationId: organizationId,
        deleted: false,
      },
      include: {
        function: true,
        entityType: true,
        location: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    //////console.log('cursor from agg', entityArray);
    const filteredEntitys = entityArray.map((value) => {
      if (user.kcRoles.roles.includes('ORG-ADMIN')) {
        return { ...value, access: true };
      } else if (
        value.locationId === activeUser.locationId &&
        user.kcRoles.roles.includes('MR')
      ) {
        return { ...value, access: true };
      } else {
        return { ...value, access: false };
      }
    });
    return { data: filteredEntitys, length: filteredEntitys.length };
  }

  //get department for the active user
  async getEntityForActiveUser(activeUserFromReq) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: activeUserFromReq.id,
      },
    });

    if (!activeUser.entityId) {
      throw new BadRequestException(
        'The user does not belong to any department',
      );
    }

    const activeUsersEntity = await this.prisma.entity.findFirst({
      where: {
        id: activeUser.entityId,
        deleted: false,
      },
      include: {
        function: true,
        location: true,
        entityType: true,
      },
    });

    return activeUsersEntity;
  }
  //get department by id

  //get location by id
  async getEntityById(id: string) {
    if (!id) {
      throw new BadRequestException('Entity ID is required');
    }

    const department = await this.prisma.entity.findUnique({
      where: { id },
      include: {
        function: true,
        location: true,
        entityType: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Entity not found');
    }

    // Fetch users and pic data in parallel
    const [users, picUsers, manager, parentEntity] = await Promise.all([
      department.users?.length
        ? this.prisma.user.findMany({ where: { id: { in: department.users } } })
        : Promise.resolve([]),

      department.pic?.length
        ? this.prisma.user.findMany({ where: { id: { in: department.pic } } })
        : Promise.resolve([]),

      department.manager
        ? this.prisma.user.findUnique({ where: { id: department.manager } })
        : Promise.resolve(null),

      department.parentId
        ? this.prisma.entity.findUnique({ where: { id: department.parentId } })
        : Promise.resolve(null),
    ]);

    const userInfo = users.map((u) => ({
      id: u.id,
      name: u.username,
      email: u.email,
      avatar: u.avatar,
    }));

    const picData = picUsers.map((u) => ({
      id: u.id,
      name: u.username,
      avatar: u.avatar,
      email: u.email,
    }));

    return {
      ...department,
      users: userInfo,
      pic: picData,
      parentId: parentEntity ?? null,
      manager: manager
        ? {
            id: manager.id,
            name: manager.username,
            avatar: manager.avatar,
            email: manager.email,
          }
        : null,
    };
  }

  async getSelectedEntity(id: string) {
    if (!id) {
      throw new BadRequestException('Entity ID is required');
    }

    const department = await this.prisma.entity.findUnique({
      where: { id },
      include: {
        // function: true,
        // location: true,
        entityType: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Entity not found');
    }

    // Fetch users and pic data in parallel
    // const [users, picUsers, manager, parentEntity] = await Promise.all([
    //   department.users?.length
    //     ? this.prisma.user.findMany({ where: { id: { in: department.users } } })
    //     : Promise.resolve([]),

    //   department.pic?.length
    //     ? this.prisma.user.findMany({ where: { id: { in: department.pic } } })
    //     : Promise.resolve([]),

    //   department.manager
    //     ? this.prisma.user.findUnique({ where: { id: department.manager } })
    //     : Promise.resolve(null),

    //   department.parentId
    //     ? this.prisma.entity.findUnique({ where: { id: department.parentId } })
    //     : Promise.resolve(null),
    // ]);

    // const userInfo = users.map((u) => ({
    //   id: u.id,
    //   name: u.username,
    //   email: u.email,
    //   avatar: u.avatar,
    // }));

    // const picData = picUsers.map((u) => ({
    //   id: u.id,
    //   name: u.username,
    //   avatar: u.avatar,
    //   email: u.email,
    // }));

    return {
      ...department,
      // users: userInfo,
      // pic: picData,
      // parentId: parentEntity ?? null,
      // manager: manager
      //   ? {
      //       id: manager.id,
      //       name: manager.username,
      //       avatar: manager.avatar,
      //       email: manager.email,
      //     }
      //   : null,
    };
  }

  async findAll(
    realmName,
    locationName?: string,
    entityName?: string,
    functionId?: string,
    entityType?: string,
    page?: number,
    limit?: number,
    user?,
    location?: any,
    search?: any,
  ) {
    let locationId;
    let finalQuery;
    const skipValue = (page - 1) * Number(limit);

    if (search !== undefined) {
      locationId = await this.prisma.location.findFirst({
        where: {
          locationName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      });
    }

    if (realmName === 'master') {
      const allLocations = await this.prisma.entity.findMany({
        skip: skipValue,
        take: Number(limit),
        orderBy: {
          entityName: 'asc',
        },
        where: {
          deleted: false,
        },
      });
      const noPageLocations = await this.prisma.entity.findMany({});

      return { data: allLocations, length: noPageLocations.length };
    }

    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    let filterConditons = [];

    if (locationName) {
      filterConditons.push({
        filterField: 'locationName',
        filterString: locationName,
      });
    }

    if (entityName) {
      filterConditons.push({
        filterField: 'entityName',
        filterString: entityName,
      });
    }

    if (entityType) {
      filterConditons.push({
        filterField: 'entityType',
        filterString: entityType,
      });
    }

    const query = this.queryGeneratorForEntityFilter(filterConditons);

    if (filterConditons.length > 0) {
      if (search !== undefined) {
        finalQuery = {
          AND: [
            {
              organization: {
                realmName: realmName,
              },
              deleted: false,
            },
            ...query,
          ],
          OR: [
            { id: { contains: search, mode: 'insensitive' } },
            { entityName: { contains: search, mode: 'insensitive' } },
            { entityId: { contains: search, mode: 'insensitive' } },
            { locationId: locationId?.id },
          ],
        };
      } else {
        finalQuery = {
          AND: [
            {
              organization: {
                realmName: realmName,
              },
              deleted: false,
            },
            ...query,
          ],
        };
      }

      //////////////console.log('typeof', typeof skipValue);
      //////////////console.log('typeoflimit', typeof limit);
      let filteredEntitys: any = await this.prisma.entity.findMany({
        skip: skipValue,
        take: Number(limit),
        where: finalQuery,
        include: {
          function: true,
          entityType: true,
          location: true,
        },
        orderBy: {
          entityName: 'asc',
        },
      });
      filteredEntitys.sort((a: any, b: any) =>
        a.entityName.toLowerCase().localeCompare(b.entityName.toLowerCase()),
      );

      const totalFilteredLength = await this.prisma.entity.count({
        where: finalQuery,
      });
      // if (user.kcRoles.roles.includes('MR')) {
      // filteredEntitys = filteredEntitys.map(async (value) =>
      let finalResult = [];
      for (let value of filteredEntitys) {
        const entityHead = await this.prisma.user.findMany({
          where: { id: { in: value?.users } },
          select: { email: true, username: true },
        });
        const sectionData = await this.prisma.section.findMany({
          where: { id: { in: value?.sections || [] } },
        });

        if (user.kcRoles.roles.includes('ORG-ADMIN')) {
          finalResult.push({ ...value, access: true, entityHead });
        } else if (
          (value.locationId === activeUser.locationId ||
            activeUser.additionalUnits.includes(value?.locationId)) &&
          user.kcRoles.roles.includes('MR')
        ) {
          finalResult.push({ ...value, sectionData, access: true, entityHead });
        } else {
          finalResult.push({
            ...value,
            sectionData,
            access: false,
            entityHead,
          });
        }
      }
      // }
      filteredEntitys.push({
        data: filteredEntitys,
        length: totalFilteredLength,
      });
    } else {
      //////////////console.log('typeof', typeof skipValue);
      //////////////console.log('typeoflimit', typeof limit);
      let filteredEntitys;
      let finalResult = [];

      if (location?.length > 0) {
        if (search !== undefined) {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                locationId: { in: location },
              },
              {
                deleted: false,
              },
            ],
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { entityName: { contains: search, mode: 'insensitive' } },
              { entityId: { contains: search, mode: 'insensitive' } },
              { locationId: locationId?.id },
            ],
          };
        } else {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                locationId: { in: location },
              },
              {
                deleted: false,
              },
            ],
          };
        }
        filteredEntitys = await this.prisma.entity.findMany({
          skip: Number(skipValue),
          take: Number(limit),
          where: finalQuery,
          include: {
            function: true,
            entityType: true,
            location: true,
          },
          orderBy: {
            entityName: 'asc',
          },
        });
        filteredEntitys.sort((a: any, b: any) =>
          a.entityName.toLowerCase().localeCompare(b.entityName.toLowerCase()),
        );
      } else {
        if (search !== undefined) {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                deleted: false,
              },
            ],
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { entityName: { contains: search, mode: 'insensitive' } },
              { entityId: { contains: search, mode: 'insensitive' } },
              { locationId: locationId?.id },
            ],
          };
        } else {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                deleted: false,
              },
            ],
          };
        }
        filteredEntitys = await this.prisma.entity.findMany({
          skip: Number(skipValue),
          take: Number(limit),
          where: finalQuery,
          include: {
            function: true,
            entityType: true,
            location: true,
          },
          orderBy: {
            entityName: 'asc',
          },
        });
        filteredEntitys.sort((a: any, b: any) =>
          a.entityName.toLowerCase().localeCompare(b.entityName.toLowerCase()),
        );
      }

      let totalFilteredLength;
      if (location?.length > 0) {
        if (search !== undefined) {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                locationId: { in: location },
              },
              {
                deleted: false,
              },
            ],
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { entityName: { contains: search, mode: 'insensitive' } },
              { entityId: { contains: search, mode: 'insensitive' } },
              { locationId: locationId?.id },
            ],
          };
        } else {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                locationId: { in: location },
              },
              {
                deleted: false,
              },
            ],
          };
        }
        totalFilteredLength = await this.prisma.entity.count({
          where: finalQuery,
        });
      } else {
        if (search !== undefined) {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                deleted: false,
              },
            ],
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { entityName: { contains: search, mode: 'insensitive' } },
              { entityId: { contains: search, mode: 'insensitive' } },
              { locationId: locationId?.id },
            ],
          };
        } else {
          finalQuery = {
            AND: [
              {
                organization: {
                  realmName: realmName,
                },
              },
              {
                deleted: false,
              },
            ],
          };
        }
        totalFilteredLength = await this.prisma.entity.count({
          where: finalQuery,
        });
      }

      // filteredEntitys = filteredEntitys.map(async (value) =>
      for (let value of filteredEntitys) {
        const entityHead = await this.prisma.user.findMany({
          where: { id: { in: value.users } },
          select: { email: true, username: true },
        });
        const sectionData = await this.prisma.section.findMany({
          where: { id: { in: value?.sections || [] } },
        });

        if (user.kcRoles.roles.includes('ORG-ADMIN')) {
          finalResult.push({ ...value, sectionData, access: true, entityHead });
        } else if (
          (value.locationId === activeUser.locationId ||
            activeUser?.additionalUnits?.includes(value?.locationId)) &&
          user.kcRoles.roles.includes('MR')
        ) {
          finalResult.push({ ...value, sectionData, access: true, entityHead });
        } else {
          finalResult.push({
            ...value,
            sectionData,
            access: false,
            entityHead,
          });
        }
      }

      return { data: finalResult, length: totalFilteredLength };
    }
  }

  queryGeneratorForEntityFilter(filter) {
    const queryList = [];
    for (const item of filter) {
      if (item.filterField == 'locationName') {
        queryList.push({
          location: {
            locationName: {
              contains: item.filterString,
              mode: 'insensitive',
            },
          },
        });
      } else if (item.filterField == 'entityName') {
        queryList.push({
          entityName: {
            contains: item.filterString,
            mode: 'insensitive',
          },
        });
      }
      // else if (item.filterField == 'business') {
      //   queryList.push({
      //     business: {
      //       name: {
      //         contains: item.filterString,
      //         mode: 'insensitive',
      //       },
      //     },
      //   });
      // }
      else if (item.filterField == 'entityType') {
        queryList.push({
          entityType: {
            name: {
              contains: item.filterString,
              mode: 'insensitive',
            },
          },
        });
      }
    }

    return queryList;
  }

  async updateEntity(entityPayload: EntityCreateDto, id: string) {
    try {
      const {
        realm,
        entityName,
        entityTypeId,
        description,
        location,
        functionId,
        entityId,
        users,
        sections,
        notification,
        additionalAuditee,
        auditees,
        parentId, // New parentId field
        pic = [], // Default to empty array
        manager,
      } = entityPayload;
      let picData = [];
      // Extract IDs
      const userInfo = users?.map((value: any) => value.id);
      const auditeesInfo = auditees?.map((value: any) => value.id);
      const picInfo = pic?.map((value: any) => value.id);
      const managerId = manager?.id || null;
      const locationInfo = location?.id || location;

      const organization = await this.prisma.organization.findFirst({
        where: {
          realmName: realm,
        },
      });

      const entity = await this.prisma.entity.findFirst({
        where: { id },
      });

      if (!entity) {
        throw new NotFoundException('Entity not found');
      }

      // Compute updated hierarchyChain based on parentId
      // let hierarchyChain: string[] = [];
      if (parentId) {
        const parentEntity = await this.prisma.entity.findUnique({
          where: { id: parentId },
          select: { hierarchyChain: true },
        });

        if (!parentEntity) {
          throw new NotFoundException('Parent entity not found');
        }

        // hierarchyChain = [...(parentEntity.hierarchyChain || []), parentId];
      }

      if (pic.length > 0) {
        picData = pic.map((value: any) => value?.id);
      }
      const data: any = {
        organization: {
          connect: {
            id: organization.id,
          },
        },
        entityName,
        notification: notification || [],
        additionalAuditee: additionalAuditee || [],
        entityType: {
          connect: { id: entityTypeId.id },
        },
        description: description,
        entityId: entityId,
        function: functionId ? { connect: { id: functionId } } : undefined,
        users: userInfo,
        auditees: auditeesInfo,
        sections: sections,
        location: {
          connect: { id: locationInfo },
        },
        parentId: parentId, // Update parentId
        // hierarchyChain: hierarchyChain, // Update hierarchyChain
        pic: picData || [], // Update pic only if available
        ...(managerId ? { manager: managerId } : {}), // Update manager only if available
      };

      const updatedEntity = await this.prisma.entity.update({
        where: { id },
        data,
      });

      return updatedEntity;
    } catch (error) {
      console.log('Error updating entity:', error);
      throw new InternalServerErrorException(
        'An error occurred while updating the entity',
      );
    }
  }

  async deleteEntity(id: string) {
    const entity = await this.prisma.entity.findFirst({
      where: {
        id: id,
      },
    });
    if (entity) {
      const deletedEntity = await this.prisma.entity.update({
        where: {
          id: id,
        },
        data: {
          deleted: true,
        },
      });
      return deletedEntity;
    } else {
      throw new NotFoundException();
    }
  }
  async restoreEntity(id: string) {
    const entity = await this.prisma.entity.findFirst({
      where: {
        id: id,
      },
    });
    if (entity) {
      const deletedEntity = await this.prisma.entity.update({
        where: {
          id: id,
        },
        data: {
          deleted: false,
        },
      });
      return deletedEntity;
    } else {
      throw new NotFoundException();
    }
  }
  async permanentDeleteEntity(id: string) {
    const entity = await this.prisma.entity.findFirst({
      where: {
        id: id,
      },
    });
    if (entity) {
      const deletedEntity = await this.prisma.entity.delete({
        where: {
          id: id,
        },
      });
      return deletedEntity;
    } else {
      throw new NotFoundException();
    }
  }
  async getEntitiesForEntityType(id, query) {
    try {
      // Step 1: Get all entity types
      // console.log('query', query);
      const entityTypes = await this.prisma.entityType.findMany({
        where: {
          organizationId: id,
          deleted: false,
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Step 2: Build where clause for entities
      const entityWhere: any = {
        organizationId: id,
        deleted: false,
      };

      if (query?.locationId && query.locationId !== 'All') {
        entityWhere.locationId = query.locationId;
      }

      // Step 3: Get all entities with optional location filter
      const entities = await this.prisma.entity.findMany({
        where: entityWhere,
        select: {
          id: true,
          entityName: true,
          entityTypeId: true,
        },
      });

      // Step 4: Group entities under entityType name
      const grouped: Record<string, { id: string; name: string }[]> = {};

      entityTypes.forEach((type) => {
        grouped[type.name] = entities
          .filter((e) => e.entityTypeId === type.id)
          .map((e) => ({
            id: e.id,
            name: e.entityName,
          }));
      });

      return grouped;
    } catch (error) {
      console.error('Error grouping entities by type:', error);
      throw new Error('Failed to group entities by entity type.');
    }
  }
  // async getSelectedEntity(id: string) {
  //   if (!id) {
  //     throw new BadRequestException('Entity ID is required');
  //   }

  //   const department = await this.prisma.entity.findUnique({
  //     where: { id },
  //     include: {
  //       // function: true,
  //       // location: true,
  //       entityType: true,
  //     },
  //   });

  //   if (!department) {
  //     throw new NotFoundException('Entity not found');
  //   }

  //   // Fetch users and pic data in parallel
  //   // const [users, picUsers, manager, parentEntity] = await Promise.all([
  //   //   department.users?.length
  //   //     ? this.prisma.user.findMany({ where: { id: { in: department.users } } })
  //   //     : Promise.resolve([]),

  //   //   department.pic?.length
  //   //     ? this.prisma.user.findMany({ where: { id: { in: department.pic } } })
  //   //     : Promise.resolve([]),

  //   //   department.manager
  //   //     ? this.prisma.user.findUnique({ where: { id: department.manager } })
  //   //     : Promise.resolve(null),

  //   //   department.parentId
  //   //     ? this.prisma.entity.findUnique({ where: { id: department.parentId } })
  //   //     : Promise.resolve(null),
  //   // ]);

  //   // const userInfo = users.map((u) => ({
  //   //   id: u.id,
  //   //   name: u.username,
  //   //   email: u.email,
  //   //   avatar: u.avatar,
  //   // }));

  //   // const picData = picUsers.map((u) => ({
  //   //   id: u.id,
  //   //   name: u.username,
  //   //   avatar: u.avatar,
  //   //   email: u.email,
  //   // }));

  //   return {
  //     ...department,
  //     // users: userInfo,
  //     // pic: picData,
  //     // parentId: parentEntity ?? null,
  //     // manager: manager
  //     //   ? {
  //     //       id: manager.id,
  //     //       name: manager.username,
  //     //       avatar: manager.avatar,
  //     //       email: manager.email,
  //     //     }
  //     //   : null,
  //   };
  // }

  async getDeptEntityType(realmName: string) {
    const deptEntityTypeForRealm = await this.prisma.entityType.findFirst({
      where: {
        organization: {
          realmName: realmName,
        },
        name: 'Department',
      },
    });

    return deptEntityTypeForRealm;
  }

  /**
   * @method getEntityHead
   *  This method gets all heads of a particular entity
   * @param id Entity ID
   * @returns Array of users
   */
  async getEntityHead(id: string) {
    const entityHeads = await this.prisma.entity.findFirst({
      where: {
        id: id,
      },
    });
    const result = await this.prisma.user.findMany({
      where: {
        id: {
          in: entityHeads.users,
        },
      },
    });

    return result;
  }

  /**
   * @method getEntityTypesForOrg
   *  This method gets all the entity types of an organization
   * @param realmName Realm name
   * @returns Array of entity types
   */

  async getEntityTypesForOrg(realmName) {
    let entityTypes = await this.prisma.entityType.findMany({
      where: {
        organization: {
          realmName: realmName,
        },
      },
    });
    entityTypes = entityTypes.filter(
      (item: any) =>
        item?.name !== '' || item?.name !== undefined || item?.name !== null,
    );
    return entityTypes;
  }

  /**
   * @method getEntityByLocation
   *  This method gets all the entities of a particular location
   * @param kcId User kcId
   * @returns Array of entities
   */
  async getEntityByLocation(kcId: string, currentUser: any) {
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: kcId,
      },
      include: {
        entity: true,
      },
    });

    const locId = user?.locationId ?? user?.entity?.locationId;
    const entity = await this.prisma.entity.findMany({
      where: {
        organizationId: user.organizationId,
        locationId: locId,
        deleted: false,
      },
    });

    return entity;
  }

  /**
   * @method getAllEntitiesOfOrg
   *  This method gets all the entities of an organization
   * @param kcId User KcId
   * @returns Array of entities
   */
  async getAllEntitiesOfOrg(kcId: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: kcId,
        },
      });
      const entity = await this.prisma.entity.findMany({
        where: {
          organizationId: user.organizationId,
          deleted: false,
        },
      });
      return entity;
    } catch (err) {
      // console.error(err);
      throw new InternalServerErrorException();
    }
  }

  async importEntity(file, realm, res) {
    const fs = require('fs');
    const XLSX = require('xlsx');

    const fileContent = fs.readFileSync(file.path);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let invalidDepartments = [
      [
        'Unit',
        'DepartmentName',
        'DepartmentID',
        'Function',
        'DepartmentHeads',
        'Description',
        'Reason',
      ],
    ];
    const departmentFormat = [
      'Unit',
      'DepartmentName',
      'DepartmentID',
      'Function',
      'DepartmentHeads',
      'Description',
    ];

    let firstIteration = true;
    for (const rowData of excelData) {
      let users = [];
      let functionId = undefined;
      if (firstIteration) {
        if (
          !rowData.every((value, index) => value === departmentFormat[index])
        ) {
          return res.status(200).json({ wrongFormat: true });
        }
        firstIteration = false;
        continue;
      }

      const location = await this.prisma.location.findFirst({
        where: {
          locationName: {
            contains: rowData[0]?.trim(),
            mode: 'insensitive',
          },
        },
      });

      if (location === null) {
        rowData[6] = 'Location Does Not Exist';
        invalidDepartments.push(rowData);
        continue;
      }
      const locationId = location.id;
      const entityName = rowData[1]?.trim();
      const entityId = rowData[2]?.trim();
      if (rowData[2]?.trim().length > 6) {
        rowData[6] = 'Department ID Is More Than 6 Characters';
        invalidDepartments.push(rowData);
        continue;
      }

      if (rowData[3] !== undefined) {
        const functionObj = await this.prisma.functions.findFirst({
          where: {
            name: {
              contains: rowData[3]?.trim(),
              mode: 'insensitive',
            },
          },
        });
        functionId = functionObj.id;
      }

      const usersEmails = rowData[4]
        ?.split(',')
        .map((item: any) => item.trim())
        .filter((item) => item !== '');
      if (usersEmails) {
        for (const user of usersEmails) {
          const userExists = await this.getUserDetails(user);
          if (userExists === null) {
            users = [];
            break;
          }
          users.push(userExists);
        }
      }

      const description = rowData[5] ? rowData[5]?.trim() : '';

      const entity = await this.prisma.entity.findFirst({
        where: {
          AND: [
            {
              organization: {
                realmName: realm,
              },
              locationId: locationId,
              // deleted: false,
            },
            {
              OR: [
                { entityName: { contains: entityName, mode: 'insensitive' } },
                { entityId: { contains: entityId, mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      if (entity) {
        rowData[6] = 'Department Already Exists';
        invalidDepartments.push(rowData);
        continue;
      }

      const organization = await this.prisma.organization.findFirst({
        where: {
          realmName: realm,
        },
      });

      const entityTypeId = await this.prisma.entityType.findFirst({
        where: {
          name: {
            contains: 'Department',
            mode: 'insensitive',
          },
          organization: {
            realmName: realm,
          },
        },
      });

      const data: any = {
        organization: {
          connect: {
            id: organization.id,
          },
        },
        entityName: entityName,
        entityType: {
          connect: {
            id: entityTypeId.id,
          },
        },
        // description: null,
        deleted: false,
        description: description,
        entityId: entityId,
        function: functionId ? { connect: { id: functionId } } : undefined,
        // functionId,
        users: users,
        location: {
          connect: {
            id: locationId,
          },
        },
      };
      const createdEntity = await this.prisma.entity.create({
        data: data,
      });
    }
    if (invalidDepartments.length > 1) {
      return res.status(200).json({ success: true, invalidDepartments });
    }
    return res.sendStatus(200);
  }

  async getUserDetails(userEmail) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email: {
            contains: userEmail,
            mode: 'insensitive',
          },
        },
      });
      if (user !== null) return user.id;
      else return null;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async getUsersNames(usersIds, res) {
    let usersEmails = '';
    for (const userId of usersIds) {
      try {
        const user = await this.prisma.user.findFirst({
          where: {
            id: {
              contains: userId,
              mode: 'insensitive',
            },
          },
        });
        usersEmails = usersEmails + user.email + ', ';
      } catch (err) {
        throw new InternalServerErrorException();
      }
    }
    return res.status(200).json({ usersEmails: usersEmails });
  }

  async getEntityForLocations(query) {
    // //console.log('query.locid', query.locid);
    if (query.locid.includes('All') && query.searchDepartment) {
      const entityData = await this.prisma.entity.findMany({
        include: {
          location: {
            select: {
              locationName: true,
            },
          },
          function: {
            select: {
              name: true,
            },
          },
        },
        where: {
          AND: [
            { organizationId: query.orgid },

            {
              entityName: {
                contains: query.searchDepartment,
                mode: 'insensitive',
              },
            },
            { deleted: false },
          ],
        },
      });
      return entityData;
    } else {
      const entityData = await this.prisma.entity.findMany({
        include: {
          location: {
            select: {
              locationName: true,
            },
          },
          function: {
            select: {
              name: true,
            },
          },
        },
        where: {
          AND: [
            { locationId: { in: JSON.parse(query.locid) } }, // Use "in" to filter by multiple locations
            { organizationId: query.orgid },
            { deleted: false },
          ],
        },
      });
      if (
        query.searchDepartment == 'undefined' ||
        query.searchDepartment == null
      ) {
        return entityData;
      } else if (query.searchDepartment) {
        const allEntity = await this.prisma.entity.findMany({
          where: {
            AND: {
              organizationId: query.orgid,
              locationId: { in: JSON.parse(query.locid) },
              deleted: false,
              entityName: {
                contains: query.searchDepartment,
                mode: 'insensitive',
              },
            },
          },
        });
        return allEntity;
      }
    }
  }

  /**
   * @method getEntityByLocationId
   *  This method gets all the entities of a particular location
   * @Query locationId
   * @returns Array of entities
   */
  async getEntityByLocationId(query: any, locationId: string) {
    // const { orgId } = query;
    const entityTypeId = await this.prisma.entityType.findFirst({
      where: {
        // organizationId: orgId,
        deleted: false,
        name: {
          equals: 'Department',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });
    // console.log('entityyt[eis', entityTypeId);
    const entities = await this.prisma.entity.findMany({
      where: {
        // organizationId: orgId,
        locationId: locationId,
        deleted: false,
        entityTypeId: entityTypeId?.id,
      },
      include: { entityType: true },
      orderBy: {
        entityName: 'asc',
      },
    });

    return entities;
  }

  async getEntityByLocationIdNew(locationId: string, user: any) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user?.id },
    });
    // const { orgId } = query;
    const entityTypeId = await this.prisma.entityType.findFirst({
      where: {
        organizationId: activeUser.organizationId,
        deleted: false,
        name: {
          equals: 'Department',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
      },
    });
    // console.log('entityyt[eis', entityTypeId);
    const entities = await this.prisma.entity.findMany({
      where: {
        organizationId: activeUser.organizationId,
        locationId: locationId,
        deleted: false,
        // entityTypeId: entityTypeId?.id,
      },
      include: { entityType: true },
      orderBy: {
        entityName: 'asc',
      },
    });

    return entities;
  }

  async getFunctionByLocation(locId, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const locationData = await this.prisma.location.findFirst({
        where: { id: locId, organizationId: activeUser.organizationId },
      });
      const functionData = await this.prisma.functions.findMany({
        where: {
          id: { in: locationData.functionId },
          organizationId: activeUser.organizationId,
        },
        orderBy: { name: 'asc' },
      });
      return functionData;
    } catch (err) {}
  }

  async getAllEntityByOrg(orgId: any, query) {
    try {
      let entities: any = await this.prisma.entity.findMany({
        where: {
          organizationId: orgId,
          ...(query?.location?.length && {
            locationId: {
              in: query?.location,
            },
          }),
          deleted: false,
        },
        orderBy: {
          entityName: 'asc',
        },
        select: {
          id: true,
          entityName: true,
        },
      });
      const sectionIds = entities
        .flatMap((item) => item.sections)
        .filter(Boolean);

      const sectionData = await this.prisma.section.findMany({
        where: { id: { in: sectionIds } },
      });

      entities?.map((value) => {
        const sectionDataForEntity = sectionData.filter((item) =>
          value.sections.includes(item?.id),
        );

        return {
          ...value,
          sectionData: sectionDataForEntity,
        };
      });
      entities.sort((a: any, b: any) =>
        a.entityName.toLowerCase().localeCompare(b.entityName.toLowerCase()),
      );

      return { data: entities };
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async findAllEntititesOfEntityType(
    realmName: string,
    name: string,
    locationName?: string,
    entityName?: string,
    functionId?: string,
    entityType?: string,
    page?: number,
    limit?: number,
    user?: any,
    location?: any,
    search?: string,
  ) {
    const skipValue = (page - 1) * Number(limit);
    // console.log('location', user);
    const aactiveuser = await this.prisma.user.findFirst({
      where: {
        kcId: user?.id,
      },
    });
    // console.log('userid', aactiveuser);
    let locationId;
    let finalQuery: any = {};

    // Searching for location if search term is provided
    if (search) {
      locationId = await this.prisma.location.findFirst({
        where: { locationName: { contains: search, mode: 'insensitive' } },
      });
    }

    // Base query to get the entities based on realmName
    const baseQuery = {
      organization: { realmName },
      deleted: false,
      entityTypeId: name,
    };

    if (search) {
      finalQuery = {
        ...baseQuery,
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { entityName: { contains: search, mode: 'insensitive' } },
          { entityId: { contains: search, mode: 'insensitive' } },
          { locationId: locationId?.id },
        ],
      };
    } else {
      finalQuery = { ...baseQuery };
    }

    // Adding location filter if location is provided
    if (location && location.length > 0 && location[0] !== 'null') {
      finalQuery = {
        ...finalQuery,
        locationId: { in: location },
      };
    }

    // Fetch entities with the necessary filters
    const [filteredEntitys, totalFilteredLength] = await Promise.all([
      this.prisma.entity.findMany({
        skip: skipValue,
        take: Number(limit),
        where: finalQuery,
        include: {
          function: true,
          entityType: true,
          location: true,
        },
        orderBy: {
          entityName: 'asc', // Sorting by entityName in the database itself
        },
      }),
      this.prisma.entity.count({ where: finalQuery }), // Counting entities for pagination
    ]);
    // console.log('entity', filteredEntitys);
    // Fetching entity heads in bulk for better performance
    const entityHeadIds = filteredEntitys.flatMap((entity) => entity.users);
    const sectionIds = filteredEntitys
      .flatMap((item) => item.sections)
      .filter(Boolean);
    // console.log('entityHeadIDs', entityHeadIds);
    const entityHeads = await this.prisma.user.findMany({
      where: { id: { in: entityHeadIds } },
      select: { email: true, username: true, id: true },
    });

    const sectionData = await this.prisma.section.findMany({
      where: { id: { in: sectionIds } },
    });
    // console.log('entityHEads', entityHeads);
    const finalResult = filteredEntitys.map((entity) => {
      const entityHead = entityHeads.filter((head: any) =>
        entity.users.includes(head.id),
      );
      const sectionDataForEntity = sectionData.filter((item) =>
        entity.sections.includes(item?.id),
      );
      const hasAccess =
        user.kcRoles?.roles.includes('ORG-ADMIN') ||
        (user.kcRoles?.roles.includes('MR') &&
          (entity.locationId === aactiveuser.locationId ||
            aactiveuser.additionalUnits?.includes(entity.locationId)));
      // console.log('hasaccess', entityHead);
      return {
        ...entity,
        access: hasAccess,
        entityHead,
        sectionData: sectionDataForEntity,
      };
    });

    return { data: finalResult, length: totalFilteredLength };
  }
  async getEntitiesForLocations(query) {
    try {
      const locationArray = Array.isArray(query.location)
        ? query.location
        : query.location?.split(',').map((loc) => loc.trim());

      const whereClause: any = {
        organizationId: query.organizationId, // Always filter by organization
      };

      if (!locationArray.includes('All')) {
        whereClause.locationId = {
          in: locationArray,
        };
      }

      const result = await this.prisma.entity.findMany({
        where: whereClause,
        select: {
          id: true,
          entityId: true,
          entityName: true,
        },
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  // async getEntitiesForEntityType(id, query) {
  //   try {
  //     // Step 1: Get all entity types
  //     // console.log('query', query);
  //     const entityTypes = await this.prisma.entityType.findMany({
  //       where: {
  //         organizationId: id,
  //         deleted: false,
  //       },
  //       select: {
  //         id: true,
  //         name: true,
  //       },
  //     });

  //     // Step 2: Build where clause for entities
  //     const entityWhere: any = {
  //       organizationId: id,
  //       deleted: false,
  //     };

  //     if (query?.locationId && query.locationId !== 'All') {
  //       entityWhere.locationId = query.locationId;
  //     }

  //     // Step 3: Get all entities with optional location filter
  //     const entities = await this.prisma.entity.findMany({
  //       where: entityWhere,
  //       select: {
  //         id: true,
  //         entityName: true,
  //         entityTypeId: true,
  //       },
  //     });

  //     // Step 4: Group entities under entityType name
  //     const grouped: Record<string, { id: string; name: string }[]> = {};

  //     entityTypes.forEach((type) => {
  //       grouped[type.name] = entities
  //         .filter((e) => e.entityTypeId === type.id)
  //         .map((e) => ({
  //           id: e.id,
  //           name: e.entityName,
  //         }));
  //     });

  //     return grouped;
  //   } catch (error) {
  //     console.error('Error grouping entities by type:', error);
  //     throw new Error('Failed to group entities by entity type.');
  //   }
  // }

  async createHierarchyForEntity(body: any) {
    try {
      const { newEntityId, parentId, organizationId, createdBy } = body;
      if (!newEntityId || !parentId) {
        throw new BadRequestException(
          'Both newEntityId and parentId are required',
        );
      }

      const parentPaths = await this.entityChainModel.find({
        childId: parentId,
      });

      const newPaths = parentPaths.map((p) => ({
        parentId: p.parentId,
        childId: newEntityId,
        depth: p.depth + 1,
        organizationId,
        createdBy,
      }));

      newPaths.push({
        parentId,
        childId: newEntityId,
        depth: 1,
        organizationId,
        createdBy,
      });

      newPaths.push({
        parentId: newEntityId,
        childId: newEntityId,
        depth: 0,
        organizationId,
        createdBy,
      });

      // Prevent duplicates
      for (const path of newPaths) {
        await this.entityChainModel.updateOne(
          { parentId: path.parentId, childId: path.childId },
          { $setOnInsert: path },
          { upsert: true },
        );
      }

      return { message: 'Entity hierarchy created/updated' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create entity hierarchy: ${error.message}`,
      );
    }
  }

  // 2. Called when the parent of an entity changes
  async updateParent(body: any) {
    try {
      const { entityId, newParentId, organizationId, updatedBy } = body;
      if (!entityId || !newParentId) {
        throw new BadRequestException(
          'Both entityId and newParentId are required',
        );
      }

      // 1. Find all descendants of entityId
      const subTree = await this.entityChainModel.find({ parentId: entityId });

      const subtreeChildIds = [entityId, ...subTree.map((e) => e.childId)];

      // 2. Remove paths: ancestor -> subtree nodes
      await this.entityChainModel.deleteMany({
        childId: { $in: subtreeChildIds },
        parentId: { $nin: subtreeChildIds },
      });

      // 3. Rebuild path from new parent to entity
      await this.createHierarchyForEntity({
        newEntityId: entityId,
        parentId: newParentId,
        organizationId,
        createdBy: updatedBy,
      });

      // 4. Rebuild for direct children
      for (const child of subTree.filter((c) => c.parentId === entityId)) {
        await this.createHierarchyForEntity({
          newEntityId: child.childId,
          parentId: entityId,
          organizationId,
          createdBy: updatedBy,
        });
      }

      return { message: 'Hierarchy updated successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update hierarchy: ${error.message}`,
      );
    }
  }

  // 3. Called when an entity is removed or detached from hierarchy
  async removeEntityFromHierarchy(entityId: string) {
    try {
      if (!entityId) throw new BadRequestException('entityId is required');

      const result = await this.entityChainModel.deleteMany({
        $or: [{ parentId: entityId }, { childId: entityId }],
      });

      if (!result?.deletedCount) {
        throw new NotFoundException('No hierarchy links found to delete');
      }

      return {
        message: 'Hierarchy links removed',
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to remove hierarchy: ${error.message}`,
      );
    }
  }

  // 4. Fetch full hierarchy for an entity: all parents and child entities
  async getFullHierarchy(entityId: string, orgId: string) {
    try {
      if (!entityId) throw new BadRequestException('entityId is required');
      const id = String(entityId);

      const [parents, children, allChains] = await Promise.all([
        this.entityChainModel.find({ childId: id, depth: { $gt: 0 } }),
        this.entityChainModel.find({ parentId: id, depth: { $gt: 0 } }),
        this.entityChainModel.find({
          //organizationId: orgId,
          depth: { $gt: 0 },
        }), // needed for breadcrumb traversal
      ]);

      const entityIds = new Set<string>();
      parents.forEach((p) => entityIds.add(p.parentId));
      children.forEach((c) => entityIds.add(c.childId));
      entityIds.add(entityId); // include self in lookup

      const entities = await this.prisma.entity.findMany({
        where: { id: { in: Array.from(entityIds) } },
        select: {
          id: true,
          entityName: true,
          entityTypeId: true,
          pic: true,
          manager: true,
          users: true,
        },
      });

      const entityMap = new Map(entities.map((e) => [e.id, e]));

      const userIds = new Set<string>();
      entities.forEach((e) => {
        [...(e.pic || []), ...(e.users || [])].forEach((id) => userIds.add(id));
      });

      const users = await this.prisma.user.findMany({
        where: { id: { in: Array.from(userIds) } },
        select: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      const mapUserIds = (ids?: string[]) =>
        (ids || []).map((id) => userMap.get(id)).filter(Boolean);

      const formatEntity = (id: string, depth: number) => {
        const e = entityMap.get(id);
        return {
          entityId: id,
          entityName: e?.entityName,
          entityTypeId: e?.entityTypeId,
          depth,
          pic: mapUserIds(e?.pic),
          users: mapUserIds(e?.users),
        };
      };

      const formattedParents = [
        ...new Map(
          parents.map((p) => [
            `${p.parentId}_${p.depth}`,
            formatEntity(p.parentId, p.depth),
          ]),
        ).values(),
      ];

      const formattedChildren = [
        ...new Map(
          children.map((c) => [
            `${c.childId}_${c.depth}`,
            formatEntity(c.childId, c.depth),
          ]),
        ).values(),
      ];

      //
      let breadcrumb: any[] = [];
      const parentMap = new Map<
        string,
        { parentId: string; depth: number }[]
      >();
      allChains.forEach((e) => {
        if (!parentMap.has(e.childId)) parentMap.set(e.childId, []);
        parentMap
          .get(e.childId)!
          .push({ parentId: e.parentId, depth: e.depth });
      });

      let currentId = id;
      while (parentMap.has(currentId)) {
        const possibleParents = parentMap.get(currentId)!;
        const directParent = possibleParents.find((p) => p.depth === 1); // immediate parent
        if (!directParent) break;

        breadcrumb.unshift(formatEntity(directParent.parentId, 0));
        currentId = directParent.parentId;
      }

      breadcrumb.push(formatEntity(id, 0));

      return {
        parents: formattedParents,
        children: formattedChildren,
        breadcrumb,
      };
    } catch (error) {
      // console.log('error inside getFullHierarchy', error);
      throw new InternalServerErrorException(
        `Failed to fetch hierarchy: ${error.message}`,
      );
    }
  }

  async getEntitysForEntityType(id) {
    try {
      // Step 1: Get all entity types
      // console.log('query', query);
      const entityType = await this.prisma.entityType.findFirst({
        where: {
          id: id,
          deleted: false,
        },
        select: {
          id: true,
          name: true,
        },
      });

      // Step 3: Get all entities with optional location filter
      const entities = await this.prisma.entity.findMany({
        where: {
          entityTypeId: entityType.id,
        },
        select: {
          id: true,
          entityName: true,
          entityTypeId: true,
        },
      });

      return entities;
    } catch (error) {
      console.error('Error grouping entities by type:', error);
      throw new Error('Failed to group entities by entity type.');
    }
  }

  async allEntityTypes(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const allEntityTypes = await this.prisma.entityType.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
      });
      return allEntityTypes;
    } catch (error) {
      throw new Error('Failed to get Entity Types');
    }
  }

  async getCreatorsDepartments(user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      const allDept = await this.prisma.entity.findMany({
        where: {
          organizationId: activeUser.organizationId,
          OR: [
            {
              id: activeUser.entityId,
            },
            {
              users: {
                has: activeUser.id, // checks if activeUser.id is in the array
              },
            },
            {
              pic: {
                has: activeUser.id, // checks if activeUser.id is in the array
              },
            },
            {
              manager: activeUser.id, // direct string comparison
            },
          ],
        },
        select: {
          id: true,
          entityName: true,
        },
      });
      return allDept;
    } catch (error) {
      throw new Error('Failed to get Entity Types');
    }
  }
}
