import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BoM } from './schema/bom.schema';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { BoMEntity } from './schema/bomEntities.schema';

@Injectable()
export class BomService {
  constructor(
    @InjectModel(BoM.name) private bomModel: Model<BoM>,
    @InjectModel(BoMEntity.name) private bomEntityModel: Model<BoMEntity>,
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  async createBomEntity(userid, entityPayload) {
    const {
      organizationId,
      entityName,
      entityTypeId,
      description,
      location,
      functionId,
      entityId,
      users,
      sections,
      picture,
      parentEntityId,
      familyId,
    } = entityPayload;
    console.log('entityPyaload', entityPayload);

    let familyIds;
    if (entityTypeId?.name === 'Product') {
      familyIds = [uuid()]; // Create a new array with a single UUID
    } else {
      familyIds = Array.isArray(familyId) ? familyId : [familyId]; // Ensure familyId is an array
    }
    console.log('familyIDs', familyIds);
    const userinfo = users?.map((value: any) => value?.id);
    const entity = await this.bomEntityModel.exists({
      organizationId: organizationId,
      locationId: location,
      entityName: { $regex: new RegExp('^' + entityName + '$', 'i') },
    });
    console.log('entity', entity);
    if (entity) {
      throw new ConflictException(
        'Duplicate Department, please give a differnt department name',
      );
    }

    const data: any = {
      entityName: entityName,
      entityTypeId: entityTypeId?.id,
      description: description,
      entityId: entityId,
      function: functionId,
      // functionId,
      users: userinfo,
      sections: sections,
      deleted: false,
      picture: picture,
      parentEntityId: parentEntityId,
      organizationId: organizationId,
      familyId: familyIds,
      locationId: location,
    };

    const createdEntity = await this.bomEntityModel.create(data);

    // sections.forEach(async (section) => {
    //   await this.prisma.entitySections.create({
    //     data: {
    //       entity: {
    //         connect: {
    //           id: createdEntity.id,
    //         },
    //       },
    //       section: {
    //         connect: {
    //           id: section,
    //         },
    //       },
    //     },
    //   });
    // });

    return createdEntity;
  }
  async updateBomEntity(userid, entityPayload, id) {
    console.log('inside update', entityPayload);
    const {
      organizationId,
      entityName,
      entityTypeId,
      description,
      location,
      functionId,
      entityId,
      users,
      sections,
      picture,
      parentEntityId,
      familyId,
    } = entityPayload;

    const userinfo = users?.map((value: any) => value?.id);

    // console.log('entity', entity);
    // if (entity) {
    //   throw new ConflictException(
    //     'Duplicate Department, please give a differnt department name',
    //   );
    // }

    const data: any = {
      entityName: entityName,
      entityTypeId: entityTypeId,
      description: description,
      entityId: entityId,
      function: functionId,
      // functionId,
      users: userinfo,
      sections: sections,
      deleted: false,
      picture: picture,
      parentEntityId: parentEntityId,

      familyId: familyId,
      locationId: location,
    };

    const updatedEntity = await this.bomEntityModel.findByIdAndUpdate(
      id,
      data,
      {
        new: true, // This ensures that the updated document is returned
      },
    );

    return updatedEntity;
  }
  async getBomEntity(userid, id) {
    const result = await this.bomEntityModel.findById(id);
    console.log('result', result);
    let data;
    const entityTypeInfo = await this.prisma.entityType.findFirst({
      where: {
        id: result.entityTypeId,
      },
    });
    const locationInfo = await this.prisma.location.findFirst({
      where: {
        id: result.locationId,
      },
    });
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: result?.users || [],
        },
      },
    });
    const userInfo = users?.map((value: any) => {
      return {
        id: value?.id,
        name: value.username,
        email: value.email,
        avatar: value.avatar,
      };
    });
    const familyInfo: any = await this.bomModel.find({
      entityId: id,
    });
    console.log('entityInfo', familyInfo);

    data = {
      result,
      location: locationInfo,
      entityType: entityTypeInfo,
      users: userInfo,
      familyInfo: familyInfo[0]?.childId,
    };
    console.log('data', data);
    return data;
  }
  async getBomEntityWithoutDetails(userid, id) {
    const result = await this.bomEntityModel.findById(id);
    console.log('result', result);

    return result;
  }
  async createBom(userid, data) {
    try {
      console.log('data', data);
      const {
        entityName,
        entityId,
        parentId,
        description,
        picture,
        createdBy,
        organizationId,
        childId,
        entityTypeId,
        locationId,
        owners,
        category,
        familyId,
      } = data.data;

      const result = await this.bomModel.create({
        entityName,
        entityId: entityId,
        parentId,
        description,
        picture,
        createdBy,
        organizationId,
        childId,
        entityTypeId,
        category,
        locationId,
        owners,
        familyId,
      });
      if (result) {
        return result._id;
      }
    } catch (error) {}
  }
  async updateBom(userid, id, data) {
    try {
      // console.log('data', data);
      const {
        entityId,
        entityName,
        parentId,
        description,
        picture,
        createdBy,
        organizationId,
        childId,
        entityTypeId,
        category,
        locationId,
        owners,
        familyId,
      } = data.data;
      const result = await this.bomModel.findByIdAndUpdate(id, {
        entityId: entityId,
        entityName,
        parentId,
        description,
        picture,
        createdBy,
        locationId,
        owners,
        organizationId,
        childId,
        entityTypeId,
        category,

        familyId,
      });
      if (result) {
        return result._id;
      }
    } catch (error) {}
  }
  async getAllBom(userid, query) {
    try {
      const page = query.page || 1;
      const limit = Number(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Fetch initial BOMs based on the query parameters
      const result = await this.bomModel
        .find({
          organizationId: query.organizationId,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      let final = [];
      console.log('Fetched BOMs:', result);

      // Use Promise.all to fetch entities and family data in parallel
      const finalData = await Promise.all(
        result.map(async (bom) => {
          try {
            console.log('Processing BOM:', bom._id);

            // Fetch entity by ID
            const entity = await this.bomEntityModel.findById(bom.entityId);
            console.log('Fetched entity:', entity);

            // Ensure familyId is always an array
            const familyQuery = Array.isArray(bom.familyId)
              ? bom.familyId
              : [bom.familyId];

            // Fetch family entities
            const family = await this.bomEntityModel.find({
              familyId: { $in: familyQuery },
            });

            console.log('Fetched family:', family);

            // Prepare the data to return
            return {
              bom,
              entity,
              family,
            };
          } catch (error) {
            console.error('Error processing BOM', bom._id, error);
            // If an error occurs, return null or handle it as needed
            return null;
          }
        }),
      );

      // Filter out null results caused by errors during processing
      final = finalData.filter((item) => item !== null);

      console.log('Final result:', final);
      return final;
    } catch (error) {
      console.error('Error in getAllBom:', error);
      // Handle the error at the top level and throw it to notify the caller
      throw error;
    }
  }

  async getBoMById(id) {
    const bom = await this.bomModel.findById({
      id,
    });
    console.log('bom', bom);
  }
  async getEntityTypesWithEntities(userid) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userid,
      },
    });
    console.log('activeuser', activeUser);
    const result = await this.prisma.entityType.findMany({
      where: {
        organizationId: activeUser.organizationId,
        deleted: false,
      },
      select: {
        name: true,
        id: true,
      },
      orderBy: {
        name: 'asc', // Order by entityName in ascending order
      },
    });
    console.log('enityTypes', result);
    const entityTypesWithEntities = await Promise.all(
      result.map(async (entityType) => {
        const entities = await this.bomEntityModel.find({
          entityTypeId: entityType.id,
          deleted: false,
        });

        return {
          ...entityType, // Include the entityType fields
          entities, // Include the entities related to this entityType
        };
      }),
    );
    // console.log('entities', entityTypesWithEntities);
    return entityTypesWithEntities;
  }
  async getAllEntityTypeswithEntitiesForBom(userid, id) {
    const bom = await this.bomModel.findById(id);

    // Fetch entities related to the BOM family
    const bomFamily = await this.bomEntityModel.find({
      familyId: { $in: [bom.familyId] },
    });

    // Initialize an empty object to store the results, grouped by entityTypeId
    const groupedByEntityType = {};

    // Loop through each entity in the bomFamily array
    for (const entity of bomFamily) {
      const entityTypeId = entity.entityTypeId;

      // Fetch the entityType from Prisma for each entity
      const entityType = await this.prisma.entityType.findFirst({
        where: {
          id: entity.entityTypeId, // Fetch the entityType based on entityTypeId
        },
      });

      // Fetch the location from Prisma for each entity
      const location = await this.prisma.location.findFirst({
        where: {
          id: entity.locationId, // Fetch the location based on locationId
        },
      });

      // If the entityTypeId is not already in the result object, initialize it
      if (!groupedByEntityType[entityTypeId]) {
        groupedByEntityType[entityTypeId] = {
          entityType, // Store the entityType details
          entities: [], // Initialize an empty list for entities under this type
        };
      }

      // Add the entity details to the appropriate entityType group
      groupedByEntityType[entityTypeId].entities.push({
        id: entity.id,
        entityName: entity.entityName,
        entityTypeId: entity.entityTypeId,
        organizationId: entity.organizationId,
        locationId: entity.locationId,
        locationName: location?.locationName || '', // Location name from Prisma
        // createdAt: entity.createdAt,
        // updatedAt: entity.updatedAt,
        deleted: entity.deleted || false,
        picture: entity.picture || null,
        // parentEntityId: entity.parentEntityId,
        familyId: entity.familyId,
        childId: entity.childId || [],
        users: entity.users || [],

        location: {
          id: location?.id || null,
          locationName: location?.locationName || '',
          locationType: location?.locationType || '',
        },
      });
    }

    // Convert the grouped data into an array to match the desired format
    const result = Object.values(groupedByEntityType).map((group: any) => ({
      ...group.entityType,
      entities: group.entities,
    }));

    // Log and return the result
    console.log(result);
    return result;
  }

  async getEntityById(id) {
    // try {
    const department = await this.prisma.entity.findUnique({
      where: {
        id: id,
      },
      include: {
        function: true,
        location: true,
        entityType: true,
      },
    });
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: department?.users || [],
        },
      },
    });
    const userInfo = users?.map((value: any) => {
      return {
        id: value?.id,
        name: value.username,
        email: value.email,
        avatar: value.avatar,
      };
    });
    const familyInfo: any = await this.bomModel.find({
      entityId: id,
    });
    console.log('entityInfo', familyInfo);
    const data: any = {
      ...department,
      users,
      familyInfo,
    };
    // console.log('data', data);
    return {
      ...department,
      users: userInfo,
      familyInfo: familyInfo[0]?.childId,
    };
    // } catch {
    //   throw new NotFoundException('Error while fetching Entity');
    // }
  }
  async deleteBom(id) {
    try {
      const bomresult = await this.bomModel.findById(id);
      const familyQuery = Array.isArray(bomresult.familyId)
        ? bomresult.familyId
        : [bomresult.familyId];

      // Fetch family entities
      const family = await this.bomEntityModel.find({
        familyId: { $in: familyQuery },
      });
    } catch (error) {}
  }
}
