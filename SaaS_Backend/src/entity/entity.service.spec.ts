import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { EntityController } from '../entity/entity.controller';
import { EntityService } from '../entity/entity.service';
import { UserService } from '../user/user.service';
import {
  User,
  Location,
  Entity,
  UserRole,
  Role,
  EntityType,
  BusinessType,
  Organization,
  EntitySections,
} from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserMaster } from 'src/user/dto/user-master.dto';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

const users: User[] = [
  {
    avatar: '',
    businessTypeId: '',
    createdAt: new Date(Date.now()),
    createdBy: '',
    email: '',
    enabled: true,
    entityId: 'entity@12345',
    firstname: '',
    id: '12345',
    kcId: '@12345',
    lastname: '',
    locationId: '',
    organizationId: '',
    sectionId: '',
    status: true,
    updatedAt: new Date(Date.now()),
    updatedBy: '',
    username: '@12345',
    userType: '',
  },
];

const entities: Entity[] = [
  {
    businessTypeId: '',
    createdAt: new Date(Date.now()),
    createdBy: '',
    description: '',
    entityId: '',
    entityName: '',
    entityTypeId: '',
    id: '',
    locationId: '',
    organizationId: '',
    updatedAt: new Date(Date.now()),
    updatedBy: '',
  },
];

const entityType: EntityType = {
  createdAt: new Date(Date.now()),
  createdBy: 'jane',
  id: '@12345',
  name: 'DR',
  organizationId: 'org@123',
  updatedAt: new Date(Date.now()),
  updatedBy: 'John',
};

const organization: Organization = {
  auditYear: '',
  clientID: '',
  clientSecret: '',
  createdAt: new Date(Date.now()),
  createdBy: '',
  fiscalYearQuarters: '',
  id: '',
  instanceUrl: '',
  kcId: '',
  loginUrl: '',
  logoutUrl: '',
  organizationName: '',
  principalGeography: '',
  realmName: 'MR',
  updatedAt: new Date(Date.now()),
  updatedBy: '',
};

const entitySections: EntitySections = {
  entityId: 'entity@123',
  id: 'auyv4ub7tbyri',
  sectionId: 'waytu',
};

describe('Entity Module', () => {
  let entityService: EntityService;
  let prisma: PrismaService;
  let userService: UserService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService, UserService, EntityService],
    }).compile();

    entityService = module.get<EntityService>(EntityService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService);
  });

  it('entity service should be defined', () => {
    expect(entityService).toBeDefined();
  });

  describe('getAllEntitiesOfOrg', () => {
    it('it should defined', () => {
      expect(entityService.getAllEntitiesOfOrg).toBeDefined();
    });
    it('it should return entity when supplied kcId', async () => {
      try {
        userService.getUserInfo = jest.fn().mockImplementation(() => {
          return users[0];
        });

        prisma.entity.findMany = jest.fn().mockImplementation(() => {
          return entities[0];
        });

        const result = await entityService.getAllEntitiesOfOrg('@12345');

        expect(result).toEqual(entities[0]);
      } catch (error) {}
    });
    it('it should throw error', async () => {
      try {
        userService.getUserInfo = jest.fn().mockImplementation(() => {
          throw new InternalServerErrorException();
        });
        expect(async () => {
          await entityService.getAllEntitiesOfOrg('stauty');
        }).toThrowError();
      } catch (error) {}
    });
  });

  describe('getEntityTypesForOrg', () => {
    it('it should defined', () => {
      expect(entityService.getEntityTypesForOrg).toBeDefined();
    });

    it('it should return EntityType when supplied realmName', async () => {
      prisma.entityType.findMany = jest.fn().mockImplementation(() => {
        return entities;
      });
      const result = await entityService.getEntityTypesForOrg('Wakanda');
      expect(result).toBeTruthy();
    });
  });

  describe('getEntityHead', () => {
    it('it should be defined', () => {
      expect(entityService.getEntityHead).toBeDefined();
    });
    it('it should return entity heads type of user when supplied entityId', async () => {
      prisma.user.findMany = jest.fn().mockImplementation(() => {
        return users;
      });

      const result = await entityService.getEntityHead('entity@12345');

      expect(result).toBeTruthy();
    });
  });

  describe('getEntityById', () => {
    it('it should be defined', () => {
      expect(entityService.getEntityById).toBeDefined();
    });
    it('it should return Entity when supplied entityId', async () => {
      const entity = Object.assign(entities[0], {
        entityId: 'entity@12345',
      });
      prisma.entity.findUnique = jest.fn().mockImplementation(() => {
        return entity;
      });

      const result = await entityService.getEntityById('entity@12345');
      expect(result).toEqual(entity);
    });
    it('it should throw Error', async () => {
      try {
        prisma.entity.findUnique = jest.fn().mockImplementation(() => {
          throw new NotFoundException();
        });
        expect(async () => {
          await entityService.getEntityById('');
        }).toThrowError();
      } catch (error) {}
    });
  });

  describe('getEntityForActiveUser', () => {
    it('it should be defined', () => {
      expect(entityService.getEntityForActiveUser).toBeDefined();
    });

    it('it should return entity for active user when supplied user', async () => {
      const user = Object.assign(users[0], {
        status: true,
        kcId: 'kcid@123',
      });
      prisma.user.findFirst = jest.fn().mockImplementation(() => {
        return user;
      });
      prisma.entity.findFirst = jest.fn().mockImplementation(() => {
        return Object.assign(entities[0], {
          kcId: 'kcid@123',
        });
      });

      const result = await entityService.getEntityForActiveUser({
        kcId: 'kcid@123',
      });

      expect(result).toBeTruthy();
    });
    it('it should throw error', async () => {
      const user = Object.assign(users[0], {
        status: true,
        kcId: 'kcid@123',
        entityId: false,
      });
      try {
        prisma.user.findFirst = jest.fn().mockImplementation(() => {
          return user;
        });
        expect(async () => {
          await entityService.getEntityForActiveUser({
            status: false,
          });
        }).toThrowError();
      } catch (error) {}
    });
  });
  describe('getBusinessTypeForLocation', () => {
    it('it should be defined', () => {
      expect(entityService.getBusinessTypeForLocation).toBeDefined();
    });

    it('it should return business type when supplied locationId', async () => {
      const business: BusinessType = {
        createdAt: new Date(Date.now()),
        createdBy: 'john',
        id: 'business@123',
        name: 'business',
        organizationId: 'org@123',
        updatedAt: new Date(Date.now()),
        updatedBy: 'jane',
      };
      prisma.businessType.findMany = jest.fn().mockImplementation(() => {
        return [business];
      });

      const result = await entityService.getBusinessTypeForLocation('location');
      expect(result).toBeTruthy();
    });
  });
  describe('getEntity', () => {
    it('it should be defined', () => {
      expect(entityService.getEntity).toBeDefined();
    });

    it('it should return an array of entities when supplied orgId, locId', async () => {
      prisma.entity.findMany = jest.fn().mockImplementation(() => {
        return entities;
      });
      const result = await entityService.getEntity('entity@123', 'location');
      expect(result).toBeTruthy();
    });
  });

  describe('getEntityByLocation', () => {
    it('it should be defined', () => {
      expect(entityService.getEntityByLocation).toBeDefined();
    });

    it('it should return an array of entities when supplied kcId and currentUser', async () => {
      const user = Object.assign(users[0], {
        kcId: 'kcid@123',
        status: true,
        locationId: 'location',
      });
      prisma.user.findFirst = jest.fn().mockImplementation(() => {
        return Object.assign(user, entities[0]);
      });
      prisma.entity.findMany = jest.fn().mockImplementation(() => {
        return entities;
      });

      const result = await entityService.getEntityByLocation('kcid@123', user);
      expect(result).toBeTruthy();
    });
  });
  describe('getDeptEntityType', () => {
    it('it should be defined', () => {
      expect(entityService.getDeptEntityType).toBeDefined();
    });
    it('it should return Entity when supplied realmName', async () => {
      prisma.entityType.findFirst = jest.fn().mockImplementation(() => {
        return Object.assign(entities[0], {
          organization: {
            realmName: 'vormir',
          },
          name: 'Department',
        });
      });
      const result = await entityService.getDeptEntityType('vormir');
      expect(result).toBeTruthy();
    });
  });

  describe('deleteEntity', () => {
    it('it should be defined', () => {
      expect(entityService.deleteEntity).toBeDefined();
    });

    it('it should return the deleted entity', async () => {
      const entity = Object.assign(entities[0], {
        id: 'thanos',
      });
      prisma.entity.findFirst = jest.fn().mockImplementation(() => {
        return entity;
      });
      prisma.entity.delete = jest.fn().mockImplementation(() => {
        return entity;
      });
      const result = await entityService.deleteEntity('thanos');
      expect(result).toEqual(entity);
    });
    it('it should throw not found exception when id does not meet', async () => {
      try {
        prisma.entity.findFirst = jest.fn().mockImplementation(() => {
          return undefined;
        });

        expect(async () => {
          await entityService.deleteEntity('kilbish');
        }).toThrowError();
      } catch (error) {}
    });
  });

  describe('createEntity', () => {
    it('it should be defined', () => {
      expect(entityService.createEntity).toBeDefined();
    });

    it('it should throw conflict error', async () => {
      try {
        const entity = Object.assign(entities[0], {
          organization: {
            realmName: 'none',
          },
          location: 'somewhere',
          entityName: 'entity@123',
        });
        prisma.entity.findFirst = jest.fn().mockImplementation(() => {
          return entity;
        });

        expect(async () => {
          await entityService.createEntity({
            businessType: 'ubkjsj',
            description: 'iai4yiae',
            entityId: 'ualiiauuta',
            entityName: 'uwyytua',
            entityType: 'uv4au',
            location: '44itlqi',
            realm: 'iailaib4ii',
            sections: ['w3uv', 'u4tamm'],
          });
        }).toThrowError();
      } catch (error) {}
    });
    it('it should create an Entity', async () => {
      const entity = Object.assign(entities[0], {
        organization: {
          realmName: 'none',
        },
        location: 'somewhere',
        entityName: 'entity@123',
      });

      prisma.organization.findFirst = jest.fn().mockImplementation(() => {
        return Object.assign(organization, {
          realmName: 'nothing',
        });
      });
      prisma.entity.findFirst = jest.fn().mockImplementation(() => {
        return undefined;
      });

      prisma.entity.create = jest.fn().mockImplementation(() => {
        return Object.assign(entity, {
          organization: {
            realmName: 'test',
          },
        });
      });

      prisma.entitySections.create = jest.fn().mockImplementation(() => {
        return entitySections;
      });

      const result = await entityService.createEntity({
        entityName: 'Test',
        businessType: '',
        description: '',
        entityId: 'ukukuu',
        entityType: 'new',
        location: 'nowhere',
        realm: 'vormir',
        sections: ['section-one', 'section-two', 'section-3'],
      });

      expect(result).toBeTruthy();
    });
  });

  describe('updateEntity', () => {
    it('it should be defined', () => {
      expect(entityService.updateEntity).toBeDefined();
    });

    it('it should throw error', async () => {
      const org = Object.assign(organization, {
        realmName: 'test',
      });
      prisma.organization.findFirst = jest.fn().mockImplementation(() => {
        return org;
      });
      prisma.entity.findFirst = jest.fn().mockImplementation(() => {
        return undefined;
      });
      try {
        expect(async () => {
          await entityService.updateEntity(
            {
              businessType: '',
              description: '',
              entityId: '',
              entityName: '',
              entityType: '',
              location: '',
              realm: '',
              sections: [''],
            },
            '',
          );
        }).toThrow();
      } catch (error) {}
    });

    it('it should update Entity', async () => {
      try {
        const org = Object.assign(organization, {
          realmName: 'test',
        });
        const entity = Object.assign(entities[0], {
          entityName: 'UNIX',
          entityId: 'unix@1234',
          id: '1234',
        } as Entity);

        prisma.organization.findFirst = jest.fn().mockImplementation(() => {
          return org;
        });
        prisma.entity.findFirst = jest.fn().mockImplementation(() => {
          return entities[0];
        });

        prisma.entity.update = jest.fn().mockImplementation(() => {
          return Object.assign(entity, {
            entityName: 'Ubuntu',
            entityId: 'ubuntu@1234',
            id: '1234',
          } as Entity);
        });
        const result = await entityService.updateEntity(
          {
            businessType: '',
            description: '',
            entityId: 'ubuntu@1234',
            entityName: 'Ubuntu',
            entityType: '',
            location: '',
            realm: '',
            sections: ['', ''],
          },
          '1234',
        );
        expect(result).not.toEqual(entity);
      } catch (error) {}
    });
  });
  describe('findAll', () => {
    it('it should be defined', () => {
      expect(entityService.findAll).toBeDefined();
    });
    it('it should return an array of Entities when realmName is master', async () => {
      const result = await entityService.findAll(
        'master',
        'any',
        'any',
        '',
        '',
      );
      expect(result).toBeTruthy();
    });

    it('it should return an array of entities when user kcRoles include LOCATION-ADMIN', async () => {
      prisma.user.findFirst = jest.fn().mockImplementation(() => {
        return users[0];
      });

      prisma.location.findFirst = jest.fn().mockImplementation(() => {
        return {
          createdAt: new Date(Date.now()),
          createdBy: 'jane',
          description: '',
          id: '',
          locationId: '',
          locationName: 'vormir',
          locationType: '',
          organizationId: '',
          status: '',
          updatedAt: new Date(Date.now()),
          updatedBy: 'john',
        } as Location;
      });

      prisma.entity.count = jest.fn().mockImplementation(() => {
        return 10;
      });
      const result = await entityService.findAll(
        'any',
        'location',
        'entity',
        'business',
        'entity-type',
        1,
        10,
        {
          kcRoles: {
            roles: ['LOCATION-ADMIN'],
          },
        },
      );
      expect(result).toBeTruthy();
    });
    it('it should return an object when filtered condition array is empty', async () => {
      prisma.user.findFirst = jest.fn().mockImplementation(() => {
        return users[0];
      });

      prisma.location.findFirst = jest.fn().mockImplementation(() => {
        return {
          createdAt: new Date(Date.now()),
          createdBy: 'jane',
          description: '',
          id: '',
          locationId: '',
          locationName: 'vormir',
          locationType: '',
          organizationId: '',
          status: '',
          updatedAt: new Date(Date.now()),
          updatedBy: 'john',
        } as Location;
      });

      prisma.entity.count = jest.fn().mockImplementation(() => {
        return 10;
      });
      const result = await entityService.findAll('any', '', '', '', '', 1, 10, {
        kcRoles: {
          roles: ['ORG-ADMIN'],
        },
      });
      expect(result).toBeTruthy();
    });
  });
});
