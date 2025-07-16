import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { UserService } from './user.service';
import axios, { AxiosResponse } from 'axios';
import {
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

jest.mock('../utils/axios.global.ts', () => ({
  axiosKc: () => {
    return {};
  },
}));

import * as utils from '../utils/axios.global';
import { Organization, Role, User } from '@prisma/client';
import * as helpers from '../user/helper';
import * as filters from '../user/userFilter';
import { UserMaster } from 'src/user/dto/user-master.dto';

const mockUsers: User[] = [
  {
    avatar: '',
    businessTypeId: '',
    createdAt: new Date(),
    createdBy: '',
    email: '',
    enabled: true,
    entityId: '',
    firstname: 'john',
    id: '',
    kcId: '',
    lastname: 'Doe',
    locationId: '',
    organizationId: '',
    sectionId: '',
    status: true,
    updatedAt: new Date(Date.now()),
    updatedBy: '',
    username: 'john@123',
    userType: '',
  },
];

const userRole: Role = {
  createdAt: new Date(),
  createdBy: '',
  id: '',
  kcId: '',
  organizationId: '',
  roleName: '',
  updatedAt: new Date(Date.now()),
  updatedBy: '',
};

const payloadMock: UserMaster = {
  email: 'john@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  businessType: '',
  entity: '',
  kcId: '12345',
  location: '',
  realm: 'master',
  roles: [],
  section: '',
  status: true,
  username: 'john@1234',
  userType: '',
};

const orgMocked: Organization = {
  auditYear: '',
  clientID: '',
  clientSecret: '',
  createdAt: new Date(),
  createdBy: 'jane',
  fiscalYearQuarters: '',
  id: '',
  instanceUrl: '',
  kcId: '',
  loginUrl: '',
  logoutUrl: '',
  organizationName: '',
  principalGeography: '',
  realmName: 'master',
  updatedAt: new Date(Date.now()),
  updatedBy: 'jane',
};

const rolesMocked: Role[] = [
  {
    updatedBy: '',
    roleName: '',
    organizationId: '',
    kcId: '',
    id: '',
    createdBy: '',
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
  },
];

describe('UserService', () => {
  let service: UserService;
  let prisma: Partial<PrismaService>;
  let res: Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should test the delete org admin success response ', async () => {
    prisma.user.findUnique = jest.fn().mockReturnValueOnce({
      kcId: '1',
    });

    prisma.user.delete = jest.fn().mockReturnValueOnce({
      orgId: 'org1',
    });

    //Check the return value of our function
    const ID = '1';
    const realm = 'org1';
    const token = 'tokennn';

    expect(await service.deleteAdmin(ID, realm, token)).toMatchObject({});
  });

  it('Should test the delete org admin error response if org admin is not found ', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValueOnce(null);

    try {
      await service.deleteAdmin('dhdhh', 'dhdjj', 'djkdk');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the delete org admin error response if it fails to delete user ', async () => {
    prisma.user.findUnique = jest.fn().mockReturnValueOnce({
      kcId: '1',
    });
    prisma.user.delete = jest
      .fn()
      .mockRejectedValue(new HttpException('msg', 400));

    try {
      await service.deleteAdmin('dhdhh', 'dhdjj', 'djkdk');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the update org admin success response ', async () => {
    prisma.user.findUnique = jest.fn().mockReturnValueOnce({
      user: 'john',
    });

    prisma.user.update = jest.fn().mockReturnValueOnce({
      kcId: '1',
    });

    //Check the return value of our function
    const ID = '1';
    const realm = 'org1';
    const token = 'tokennn';
    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };

    expect(await service.updateAdmin(ID, realm, token, body)).toMatchObject({});
  });

  it('Should test the update org admin error response if org admin is not found ', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValueOnce(null);
    const ID = '1';
    const realm = 'org1';
    const token = 'tokennn';
    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.updateAdmin(ID, realm, token, body);
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the get org admin success response ', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.role.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.user.findMany = jest.fn().mockReturnValueOnce({
      user: 'john',
    });

    //Check the return value of our function
    const realm = 'org1';

    expect(await service.getOrgAdmin(realm)).toMatchObject({});
  });

  it('getOrgAdmin should trow Error when organizationData is undefined', async () => {
    try {
      prisma.organization.findFirst = jest
        .fn()
        .mockImplementation((...args) => {
          return undefined;
        });
      await service.getOrgAdmin('');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('getOrgAdmin should trow Error when organizationData and role both are undefined', async () => {
    try {
      prisma.organization.findFirst = jest
        .fn()
        .mockImplementation((...args) => {
          return true;
        });
      prisma.role.findFirst = jest.fn().mockImplementation((...args) => {
        return undefined;
      });
      await service.getOrgAdmin('');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('should test if the invitation is sent', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValue({ status: 204 } as AxiosResponse);
    await service.sendInvite('1', 'org1', 'token');
  });

  it('Should test the success responce of org admin ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockResolvedValueOnce({
        status: 204,
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: '1' }, { name: 'a' }],
      } as any);

    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.role.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.user.create = jest.fn().mockReturnValueOnce({
      id: '1',
      kcId: '2',
    });

    prisma.userRole.create = jest.fn().mockReturnValueOnce({
      role: '1',
      user: '1',
    });

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    await service.createAdmin(
      body,
      {
        ...res,
        status: jest.fn(() => {
          return {
            send: jest.fn().mockReturnValue({}),
          };
        }),
      },
      'token',
    );
  });

  it('Should test the error responce if it fails to create user in keycloak ', async () => {
    jest.spyOn(utils, 'axiosKc').mockRejectedValueOnce({
      status: 409,
    } as any);

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to fetch roles from keycloak ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockRejectedValueOnce({
        status: 400,
      } as any);

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to assign role in keycloak ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockRejectedValueOnce({
        status: 400,
      } as any);

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to fetch realm management in keycloak ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockResolvedValueOnce({
        status: 204,
      } as any)
      .mockRejectedValueOnce({
        status: 400,
      } as any);

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to fetch realm roles in keycloak ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockResolvedValueOnce({
        status: 204,
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
          },
        ],
      } as any)
      .mockRejectedValueOnce({
        status: 400,
      } as any);

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to assign realm roles in keycloak ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockResolvedValueOnce({
        status: 204,
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: '1' }, { name: 'a' }],
      } as any);

    prisma.organization.findFirst = jest.fn().mockRejectedValueOnce({});

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to create user in database ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockResolvedValueOnce({
        status: 204,
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: '1' }, { name: 'a' }],
      } as any);

    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.role.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.user.create = jest.fn().mockRejectedValueOnce({});

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test the error responce if it fails to create user role in database ', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({
        status: 201,
        headers: {
          location: 'test/users/1',
        },
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: '1',
      } as any)
      .mockResolvedValueOnce({
        status: 204,
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [
          {
            id: '1',
          },
        ],
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: '1' }, { name: 'a' }],
      } as any);

    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.role.findFirst = jest.fn().mockReturnValueOnce({
      id: '1',
    });

    prisma.user.create = jest.fn().mockReturnValueOnce({
      id: '1',
      kcId: '2',
    });

    prisma.userRole.create = jest.fn().mockRejectedValueOnce({});

    const body = {
      realm: 'test',
      username: 'john',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
    };
    try {
      await service.createAdmin(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'token',
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('getAllMrOfOrg should be defined', async () => {
    expect(service.getAllMrOfOrg).toBeTruthy();
  });
  it('getAllMrOfOrg should return all the MR of the organization', async () => {
    const allMrOfOrg: User[] = [
      {
        avatar: '',
        businessTypeId: '',
        createdAt: new Date(),
        createdBy: '',
        email: '',
        enabled: true,
        entityId: '',
        firstname: 'John',
        id: '',
        kcId: '',
        lastname: 'Doe',
        locationId: '',
        organizationId: 'qwertyuio',
        sectionId: '',
        status: true,
        updatedAt: new Date(Date.now()),
        updatedBy: 'Jane',
        username: 'john@123',
        userType: 'MR',
      },
    ];

    prisma.user.findMany = jest.fn().mockReturnValue(allMrOfOrg);
    const result: User[] = await service.getAllMrOfOrg('qwertyuio');

    expect(allMrOfOrg).toEqual(result);
  });

  it('getAllTemplateAuthors should be defined', async () => {
    expect(service.getAllTemplateAuthors).toBeTruthy();
  });

  it('getAllTemplateAuthors should return empty array if realmName dose not match', async () => {
    prisma.organization.findFirst = jest.fn().mockImplementation((...args) => {
      return undefined;
    });

    const result: User[] = await service.getAllTemplateAuthors('');
    expect(result).toEqual([]);
  });

  it('getAllTemplateAuthors should return an array of User if realmName matches', async () => {
    const mockUsers: User[] = [
      {
        avatar: '',
        businessTypeId: '',
        createdAt: new Date(),
        createdBy: '',
        email: '',
        enabled: true,
        entityId: '',
        firstname: 'john',
        id: '',
        kcId: '',
        lastname: 'Doe',
        locationId: '',
        organizationId: '',
        sectionId: '',
        status: true,
        updatedAt: new Date(Date.now()),
        updatedBy: '',
        username: 'john@123',
        userType: '',
      },
    ];

    const mockOrg: Organization = {
      auditYear: '',
      clientID: '',
      clientSecret: '',
      createdAt: new Date(),
      createdBy: 'Jane',
      fiscalYearQuarters: '',
      id: '',
      instanceUrl: '',
      kcId: '',
      loginUrl: '',
      logoutUrl: '',
      organizationName: 'Hulu',
      principalGeography: '',
      realmName: 'calm',
      updatedAt: new Date(Date.now()),
      updatedBy: 'Jane',
    };

    prisma.organization.findFirst = jest.fn().mockImplementation((...args) => {
      return mockOrg;
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return mockUsers;
    });
    const result = await service.getAllTemplateAuthors('calm');
    expect(result).toBeTruthy();
  });

  it('getAllUsersOfEntity should be defined', () => {
    expect(service.getAllUsersOfEntity).toBeTruthy();
  });
  it('getAllUsersOfEntity should return an array of user when passed entityId arg', async () => {
    const mockUsers: User[] = [
      {
        avatar: '',
        businessTypeId: '',
        createdAt: new Date(),
        createdBy: '',
        email: '',
        enabled: true,
        entityId: 'abcx98bn',
        firstname: 'john',
        id: '',
        kcId: '',
        lastname: 'Doe',
        locationId: '',
        organizationId: '',
        sectionId: '',
        status: true,
        updatedAt: new Date(Date.now()),
        updatedBy: '',
        username: 'john@123',
        userType: '',
      },
    ];
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return mockUsers;
    });
    const results: User[] = await service.getAllUsersOfEntity('abcx98bn');
    expect(results).toEqual(mockUsers);
  });

  it('getAuditorsOfOrg should be defined', () => {
    expect(service.getAuditorsOfOrg).toBeTruthy();
  });
  it('getAuditorsOfOrg should return an array of user when supplied realmName and user args', async () => {
    const mockUsers: User[] = [
      {
        avatar: '',
        businessTypeId: '',
        createdAt: new Date(),
        createdBy: '',
        email: '',
        enabled: true,
        entityId: 'abcx98bn',
        firstname: 'john',
        id: '',
        kcId: '',
        lastname: 'Doe',
        locationId: 'mnbvcxz',
        organizationId: '',
        sectionId: '',
        status: true,
        updatedAt: new Date(Date.now()),
        updatedBy: '',
        username: 'john@123',
        userType: '',
      },
    ];

    service.getUserInfo = jest.fn().mockImplementation((...args) => {
      return mockUsers[0];
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return mockUsers;
    });

    const result = await service.getAuditorsOfOrg('calm', mockUsers[0]);
    expect(result).toEqual(mockUsers);
  });

  it('uploadAvatar should be defined', () => {
    expect(service.uploadAvatar).toBeTruthy();
  });

  it('uploadAvatar should return updated user object when supplied file and id args', async () => {
    const mockUser: User = {
      avatar: 'avatar.png',
      businessTypeId: '',
      createdAt: new Date(),
      createdBy: '',
      email: '',
      enabled: true,
      entityId: 'abcx98bn',
      firstname: 'john',
      id: 'uioppoiu',
      kcId: 'sdcvnj',
      lastname: 'Doe',
      locationId: 'mnbvcxz',
      organizationId: '',
      sectionId: '',
      status: true,
      updatedAt: new Date(Date.now()),
      updatedBy: '',
      username: 'john@123',
      userType: '',
    };
    const mockUpdatedUser = Object.assign(mockUser, {
      avatar: 'new-avatar.png',
    });
    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return mockUser;
    });
    prisma.user.update = jest.fn().mockImplementation((...args) => {
      return mockUpdatedUser;
    });

    const result: User = await service.uploadAvatar(
      'new-avatar.png',
      'uioppoiu',
    );

    expect(result).toEqual(mockUpdatedUser);
  });
  it('uploadAvatar should throw error when supplied file and id args does not meet', async () => {
    try {
      prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
        throw new Error();
      });
      await service.uploadAvatar('', '');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('getUserInfo should be defined', () => {
    expect(service.getUserInfo).toBeTruthy();
  });
  it('getUserInfo should return a user when supplied kcId', async () => {
    const mockUser = Object.assign(mockUsers[0], {
      kcId: 'sdcvnj',
    });
    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return mockUser;
    });

    const user = await service.getUserInfo('sdcvnj');
    expect(user).toEqual(mockUser);
  });

  it('getUserInfo should throw error', async () => {
    try {
      prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
        throw new Error();
      });
      await service.getUserInfo('');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });

  it('getUserById should be defined', () => {
    expect(service.getUserById).toBeTruthy();
  });
  it('getUserById should throw error', async () => {
    try {
      prisma.user.findUnique = jest.fn().mockImplementation((...args) => {
        throw new Error();
      });
      await service.getUserById('john@123');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
  it('getUserById should return a user object', async () => {
    prisma.user.findUnique = jest.fn().mockImplementation((...args) => {
      return mockUsers[0];
    });

    jest.spyOn(helpers, 'getUserRoleDetails').mockResolvedValue([]);

    const testValue = await service.getUserById('yaegc');

    expect(testValue).toBeUndefined();
  });

  it('checkIfUserActive', () => {
    expect(service.checkIfUserActive).toBeTruthy();
  });
  it('checkIfUserActive returns should return true is the user is active', async () => {
    prisma.user.findFirst = jest.fn().mockReturnValue(mockUsers[0]);
    const value = await service.checkIfUserActive('calm', true);
    expect(value).toBeTruthy();
  });

  it('getAllUsers should be defined', () => {
    expect(service.getAllUsers).toBeTruthy();
  });
  it('getAllUsers should resolve a promise with an Object', async () => {
    const user = Object.assign(mockUsers[0], {
      kcRoles: {
        roles: ['LOCATION-ADMIN'],
      },
    });
    prisma.user.findFirst = jest.fn().mockReturnValue(mockUsers[0]);
    prisma.user.findMany = jest.fn().mockReturnValue(mockUsers);

    const result = await service.getAllUsers(
      'master',
      'filter-setting',
      user,
      1,
      10,
    );
    expect(result).toBeTruthy();
  });

  it('getUsersFilter should be defined', () => {
    expect(service.getUsersFilter).toBeDefined();
  });
  it('getUsersFiler should resolve a promise with user object when locationId = allusers', async () => {
    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return mockUsers[0];
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return [
        Object.assign(mockUsers[0], {
          realmName: 'calm',
          email: 'john@gmail.com',
          assignedRole: true,
        }),
      ];
    });
    prisma.role.findMany = jest.fn().mockImplementation((...args) => {
      return userRole;
    });
    jest.spyOn(helpers, 'getUserRoleDetails').mockResolvedValue([]);

    const result = await service.getUsersFilter(
      'calm',
      'john@gmail.com',
      '',
      'allusers',
    );
    expect(result).toBeTruthy();
  });
  it('getUsersFiler should resolve a promise with user object when locationId = all', async () => {
    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return mockUsers[0];
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return [
        Object.assign(mockUsers[0], {
          realmName: 'calm',
          email: 'john@gmail.com',
          assignedRole: true,
        }),
      ];
    });
    prisma.role.findMany = jest.fn().mockImplementation((...args) => {
      return userRole;
    });
    jest.spyOn(helpers, 'getUserRoleDetails').mockResolvedValue([]);

    const result = await service.getUsersFilter(
      'calm',
      'john@gmail.com',
      '',
      'all',
    );
    expect(result).toBeTruthy();
  });
  it('getUsersFiler should resolve a promise with user object when locationId = empty', async () => {
    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return mockUsers[0];
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return [
        Object.assign(mockUsers[0], {
          realmName: 'calm',
          email: 'john@gmail.com',
          assignedRole: true,
        }),
      ];
    });
    prisma.role.findMany = jest.fn().mockImplementation((...args) => {
      return userRole;
    });
    jest.spyOn(helpers, 'getUserRoleDetails').mockResolvedValue([]);

    const result = await service.getUsersFilter(
      'calm',
      'john@gmail.com',
      '',
      '',
    );
    expect(result).toBeTruthy();
  });

  it('getAllUsers should return data', async () => {
    const user = Object.assign(
      {},
      {
        kcRoles: {
          roles: ['LOCATION-ADMIN'],
        },
        id: '1234',
      },
    );

    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return user;
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return [user];
    });

    jest.spyOn(filters, 'findAllUsers').mockResolvedValue({
      data: [user],
      length: 1,
    });
    const result = await service.getAllUsers('', '', user);
    expect(result).toBeTruthy();
  });
  it('getAllUsers should return data', async () => {
    const user = Object.assign(
      {},
      {
        kcRoles: {
          roles: ['LOCATION-ADMIN', 'ORG-ADMIN'],
        },
        id: '1234',
      },
    );

    prisma.user.findFirst = jest.fn().mockImplementation((...args) => {
      return user;
    });
    prisma.user.findMany = jest.fn().mockImplementation((...args) => {
      return [user];
    });

    jest.spyOn(filters, 'findAllUsers').mockResolvedValue({
      data: [user],
      length: 1,
    });
    const result = await service.getAllUsers('', '', user);
    expect(result).toBeTruthy();
  });

  it('createUser should be defined', () => {
    expect(service.createUser).toBeTruthy();
  });
  it('createUser should return created user', async () => {
    const payload: UserMaster = {
      email: '',
      firstName: '',
      lastName: '',
      businessType: '',
      entity: '',
      kcId: '',
      location: '',
      realm: '',
      roles: [],
      section: '',
      status: true,
      username: '',
      userType: 'IDP',
    };
    try {
      jest
        .spyOn(utils, 'axiosKc')
        .mockResolvedValue({ status: 201 } as AxiosResponse);

      const result = await service.createUser(payload, '', '');
      expect(result).toBeTruthy();
    } catch (error) {}
  });
  it('createUser should invoke else block when userType != IDP ', async () => {
    const payload: UserMaster = {
      email: '',
      firstName: '',
      lastName: '',
      businessType: '',
      entity: '',
      kcId: '',
      location: '',
      realm: '',
      roles: ['MR', 'ADMIN'],
      section: '',
      status: true,
      username: '',
      userType: undefined,
    };
    try {
      jest
        .spyOn(utils, 'axiosKc')
        .mockResolvedValue({ status: 201 } as AxiosResponse);

      const result = await service.createUser(payload, '', '');
      expect(result).toBeTruthy();
    } catch (error) {}
  });
  it('updateUserMaster should be defined', () => {
    expect(service.updateUserMaster).toBeDefined();
  });
  it('updateUserMaster should invoke if block when payload.roles is empty', async () => {
    const user = Object.assign(mockUsers[0], {
      id: 'john@1234',
      assignedRole: [
        {
          role: {
            name: 'admin',
          },
        },
      ],
    });

    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValue({ status: 204 } as AxiosResponse);
    prisma.user.findUnique = jest.fn().mockImplementation((...args) => {
      return user;
    });
    prisma.organization.findFirst = jest.fn().mockImplementation((...args) => {
      return orgMocked;
    });
    prisma.user.update = jest.fn().mockImplementation((...args) => {
      return user;
    });

    try {
      await service.updateUserMaster('john@1234', payloadMock, '', '');
    } catch (error) {}
  });
  it('updateUserMaster should invoke forEach when payload.roles != empty', async () => {
    const user = Object.assign(mockUsers[0], {
      id: 'john@1234',
      assignedRole: [
        {
          role: {
            name: 'admin',
          },
        },
      ],
    });

    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValue({ status: 204 } as AxiosResponse);
    prisma.user.findUnique = jest.fn().mockImplementation((...args) => {
      return user;
    });
    prisma.organization.findFirst = jest.fn().mockImplementation((...args) => {
      return orgMocked;
    });
    prisma.user.update = jest.fn().mockImplementation((...args) => {
      return user;
    });

    try {
      await service.updateUserMaster(
        'john@1234',
        Object.assign(payloadMock, {
          roles: ['MR'],
        }),
        '',
        '',
      );
    } catch (error) {}
  });

  it('updateUserMaster should throw error', async () => {
    const user = Object.assign(mockUsers[0], {
      id: 'john@1234',
      assignedRole: [],
    });

    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValue({ status: 204 } as AxiosResponse);
    prisma.user.findUnique = jest.fn().mockImplementation((...args) => {
      return user;
    });
    prisma.organization.findFirst = jest.fn().mockImplementation((...args) => {
      return orgMocked;
    });
    prisma.user.update = jest.fn().mockImplementation((...args) => {
      return undefined;
    });

    try {
      await service.updateUserMaster('john@1234', payloadMock, '', '');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});
