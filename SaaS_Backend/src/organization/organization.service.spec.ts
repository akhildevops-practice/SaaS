import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationService } from './organization.service';
import { PrismaService } from '../prisma.service';
import axios, { AxiosResponse } from 'axios';
//import { HelperService } from './organization.helper';
//import { businessUnit, section } from './dto/update-organization.dto';
import { Prisma } from '@prisma/client';
import * as helpers from '../utils/helper';
import * as utils from '../utils/axios.global';
import * as helperDeps from './helpers/organization.helper';
import { Response, response } from 'express';
import { BadRequestException } from '@nestjs/common';
import { createBusinessConfigItem } from './utils';
import { System } from '../systems/schema/system.schema';
import { getModelToken } from '@nestjs/mongoose';

// jest.mock("../utils/axios.global.ts", () => ({
//   axiosKc: jest.fn()
// }));
// jest.mock("../utils/axios.global")

describe('OrganisationService', () => {
  let service: OrganizationService;
  let prisma: Partial<PrismaService>;
  let res: Response;
  // let fakePrisma :Partial<PrismaService>

  beforeEach(async () => {
    jest.resetModules();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationService,
        {
          provide: getModelToken('System'),
          useValue: () => {},
        },
        PrismaService,
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
    prisma = module.get<PrismaService>(PrismaService);
    res = response;
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  //delete

  it('Should test the delete org success response ', async () => {
    const id: any = 1;

    prisma.organization.findUnique = jest.fn().mockReturnValueOnce({
      orgId: 'org1',
    });

    prisma.organization.update = jest.fn().mockReturnValueOnce({
      orgId: 'org1',
    });
    prisma.organization.delete = jest.fn().mockReturnValueOnce({
      orgId: 'org1',
    });

    axios.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });
    //Check the return value of our function
    const orgId = 'org1';
    const token = 'tokennn';

    expect(await service.deleteOrganization(orgId, token)).toMatchObject({
      msg: 'Organization deleted successfully',
    });
  });

  it('Should test the delete org error response ', async () => {
    try {
      const id: any = 1;

      prisma.organization.findUnique = jest
        .fn()
        .mockRejectedValueOnce(new BadRequestException());

      prisma.organization.update = jest.fn().mockReturnValueOnce({
        orgId: 'org1',
      });
      prisma.organization.delete = jest.fn().mockReturnValueOnce({
        orgId: 'org1',
      });

      axios.delete = jest.fn().mockReturnValueOnce({
        status: 201,
      });
      //Check the return value of our function
      const orgId = 'org1';
      const token = 'tokennn';

      await service.deleteOrganization(orgId, token);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
  it('Should test the delete org error response ', async () => {
    try {
      const id: any = 1;

      prisma.organization.findUnique = jest
        .fn()
        .mockRejectedValueOnce(undefined);

      prisma.organization.update = jest.fn().mockReturnValueOnce({
        orgId: 'org1',
      });
      prisma.organization.delete = jest.fn().mockReturnValueOnce({
        orgId: 'org1',
      });

      axios.delete = jest.fn().mockReturnValueOnce({
        status: 201,
      });
      //Check the return value of our function
      const orgId = 'org1';
      const token = 'tokennn';

      await service.deleteOrganization(orgId, token);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  //get organizations
  it('Should test the get organization and respective filters when both orgName and orgAdmin are provided ', async () => {
    const id: any = 1;

    prisma.organization.findMany = jest.fn().mockReturnValueOnce({
      orgs: [],
    });

    axios.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });
    //Check the return value of our function
    const orgName = 'org1';
    const orgAdmin = 'tokennn';
    // (await service.getOrganizations(orgName, orgAdmin))
    expect(await service.getOrganizations(orgName, orgAdmin)).toEqual({});
  });
  it('Should test the get organization and respective filters when orgName is provided', async () => {
    const id: any = 1;

    prisma.organization.findMany = jest.fn().mockReturnValueOnce({
      orgs: [],
    });

    axios.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });
    //Check the return value of our function
    const orgName = 'org1';

    expect(await service.getOrganizations(orgName)).toEqual({});
  });

  it('Should test the get organization and respective filters when  orgAdmin is provided ', async () => {
    const id: any = 1;

    prisma.organization.findMany = jest.fn().mockReturnValueOnce({
      orgs: [],
    });

    axios.delete = jest.fn().mockReturnValueOnce(
      new Promise((resolve) => {
        return resolve({});
      }),
    );
    //Check the return value of our function

    const orgAdmin = 'tokennn hjsdjhsd';

    expect(await service.getOrganizations(null, orgAdmin)).toEqual({});
  });

  it('Should test the get organization and respective filters when both orgName and orgAdmin are provided ', async () => {
    const id: any = 1;

    prisma.organization.findMany = jest.fn().mockReturnValueOnce({
      orgs: [],
    });

    axios.delete = jest.fn().mockReturnValueOnce(
      new Promise((resolve) => {
        return resolve({});
      }),
    );

    const orgName = 'org1';
    const orgAdmin = 'tokennn';

    expect(await service.getOrganizations()).toEqual({});
  });

  it('Should test create businessConfig', async () => {
    const input = {
      businessUnit: [{ name: 'hello' }],

      entityType: [{ name: 'hello' }],

      section: [{ name: 'hello' }],

      systemType: [{ name: 'hello' }],

      fiscalYearQuarters: 'ddfff',

      auditYear: 'dsd',
    };
    prisma.organization.update = jest.fn().mockReturnValueOnce({});
    service.updateFiscalYearQuarters = jest
      .fn()
      .mockImplementation(
        (params: { where: Prisma.OrganizationWhereUniqueInput; data: any }) => {
          return {};
        },
      );

    jest
      .spyOn(helperDeps, 'createBusinessConfigItem')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve();
        });
      });

    try {
      expect(
        await service.createBusinessConfig(input, 'djmd', { send: () => {} }),
      ).toBeTruthy;
    } catch (error) {}
  });

  it('Should test update businessConfig', async () => {
    const input = {
      businessUnit: [{ name: 'hello' }],

      entityType: [{ name: 'hello' }],

      section: [{ name: 'hello' }],

      systemType: [{ name: 'hello' }],

      fiscalYearQuarters: 'ddfff',

      auditYear: 'dsd',
    };
    prisma.organization.update = jest.fn().mockReturnValueOnce({});
    service.updateFiscalYearQuarters = jest
      .fn()
      .mockImplementation(
        (params: { where: Prisma.OrganizationWhereUniqueInput; data: any }) => {
          return {};
        },
      );

    jest
      .spyOn(helperDeps, 'createBusinessConfigItem')
      .mockImplementation(() => {
        return new Promise((resolve) => {
          resolve();
        });
      });
    try {
      expect(await service.updateBusinessConfigNew(input, 'djmd')).toBeTruthy;
    } catch (error) {}
  });

  it('Should test the deleteEntity', async () => {
    prisma.entity.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });

    expect(await service.deleteEntity([])).resolves.toBeTruthy;
  });

  it('Should test the deleteSystem type', async () => {
    prisma.systemType.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });

    expect(await service.deleteSystemType([])).resolves.toBeTruthy;
  });

  it('Should test the businessUNIT', async () => {
    prisma.businessType.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });

    expect(await service.deleteBusinessUnit([])).resolves.toBeTruthy;
  });

  it('Should test the deleteSection', async () => {
    prisma.section.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });

    expect(await service.deleteSection([])).toBeTruthy;
  });
  it('Should test the deleteBusinessUnit', async () => {
    prisma.section.delete = jest.fn().mockReturnValueOnce({
      status: 201,
    });

    expect(await service.deleteSection(['h'])).resolves.toBeTruthy;
    expect(prisma.section.delete).toBeCalled();
  });

  it('Shoud test update fiscalyear function', async () => {
    prisma.organization.update = jest.fn().mockReturnValueOnce({});
    expect(
      await service.updateFiscalYearQuarters({
        where: { id: String('9089765432') },
        data: {},
      }),
    ).toEqual({});
  });

  it('Should test createOrg', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({ status: 201 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 200, data: { id: 1 } } as AxiosResponse)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'name' }],
      } as AxiosResponse)
      .mockResolvedValueOnce({ data: [{ id: 0 }] } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse);

    jest
      .spyOn(helpers, 'createRolesInKc')
      .mockResolvedValue({} as Promise<any>);

    prisma.organization.create = jest.fn().mockReturnValueOnce({});
    prisma.organization.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.role.create = jest.fn().mockReturnValueOnce([]);

    const body = {
      realm: 'realmm',
      instanceUrl: 'http://realhghhxmsbdmh.localhost.com',
      principalGeography: 'India',
    };

    expect(
      await service.createOrg(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'hd',
        {},
      ),
    ).toBeUndefined;
  });
  it('Should test createOrg , error while creating role', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({ status: 201 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 200, data: { id: 1 } } as AxiosResponse)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'name' }],
      } as AxiosResponse)
      .mockResolvedValueOnce({ data: [{ id: 0 }] } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse);

    jest
      .spyOn(helpers, 'createRolesInKc')
      .mockResolvedValue({} as Promise<any>);

    prisma.organization.create = jest.fn().mockReturnValueOnce({});
    prisma.organization.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.role.create = jest.fn().mockRejectedValueOnce(new Error());

    const body = {
      realm: 'realmm',
      instanceUrl: 'http://realhghhxmsbdmh.localhost.com',
      principalGeography: 'India',
    };

    try {
      await service.createOrg(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'hd',
        {},
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });
  it('Should test createOrg , error while update client call', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({ status: 201 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 200, data: { id: 1 } } as AxiosResponse)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'name' }],
      } as AxiosResponse)
      .mockResolvedValueOnce({ data: [{ id: 0 }] } as AxiosResponse)
      .mockResolvedValueOnce({ status: 203 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse);

    jest
      .spyOn(helpers, 'createRolesInKc')
      .mockResolvedValue({} as Promise<any>);

    prisma.organization.create = jest.fn().mockReturnValueOnce({});
    prisma.organization.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.role.create = jest.fn().mockRejectedValueOnce(new Error());
    const body = {
      realm: 'realmm',
      instanceUrl: 'http://realhghhxmsbdmh.localhost.com',
      principalGeography: 'India',
    };

    try {
      await service.createOrg(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'hd',
        {},
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });
  it('Should test createOrg , error while update client call', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({ status: 201 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 200, data: { id: 1 } } as AxiosResponse)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'name' }],
      } as AxiosResponse)
      .mockResolvedValueOnce({ data: [{ id: 0 }] } as AxiosResponse)
      .mockResolvedValueOnce({ status: 203 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse);

    jest
      .spyOn(helpers, 'createRolesInKc')
      .mockResolvedValue({} as Promise<any>);

    prisma.organization.create = jest.fn().mockReturnValueOnce({});
    prisma.organization.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.role.create = jest.fn().mockRejectedValueOnce(new Error());

    const body = {
      realm: 'realmm',
      instanceUrl: 'http://realhghhxmsbdmh.localhost.com',
      principalGeography: 'India',
    };

    try {
      await service.createOrg(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'hd',
        {},
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test createOrg , error while creating roles in kc', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({ status: 201 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 200, data: { id: 1 } } as AxiosResponse)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'name' }],
      } as AxiosResponse)
      .mockResolvedValueOnce({ data: [{ id: 0 }] } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse);

    jest.spyOn(helpers, 'createRolesInKc').mockRejectedValueOnce(new Error());

    prisma.organization.create = jest.fn().mockReturnValueOnce({});
    prisma.organization.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.role.create = jest.fn().mockRejectedValueOnce(new Error());

    const body = {
      realm: 'realmm',
      instanceUrl: 'http://realhghhxmsbdmh.localhost.com',
      principalGeography: 'India',
    };

    try {
      await service.createOrg(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'hd',
        {},
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('Should test createOrg , error while creating org in database', async () => {
    jest
      .spyOn(utils, 'axiosKc')
      .mockResolvedValueOnce({ status: 201 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 200, data: { id: 1 } } as AxiosResponse)
      .mockResolvedValueOnce({
        status: 200,
        data: [{ id: 1, name: 'name' }],
      } as AxiosResponse)
      .mockResolvedValueOnce({ data: [{ id: 0 }] } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse)
      .mockResolvedValueOnce({ status: 204 } as AxiosResponse);

    jest
      .spyOn(helpers, 'createRolesInKc')
      .mockReturnValueOnce({} as Promise<any>);

    prisma.organization.create = jest.fn().mockResolvedValueOnce(undefined);
    prisma.organization.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.role.create = jest.fn().mockRejectedValueOnce(new Error());

    const body = {
      realm: 'realmm',
      instanceUrl: 'http://realhghhxmsbdmh.localhost.com',
      principalGeography: 'India',
    };

    try {
      await service.createOrg(
        body,
        {
          ...res,
          status: jest.fn(() => {
            return {
              send: jest.fn().mockReturnValue({}),
            };
          }),
        },
        'hd',
        {},
      );
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('It should test getOrganization', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({});

    expect(await service.getOrganization('helo')).toEqual({});
  });
  it('It should test getOrganization error response', async () => {
    prisma.organization.findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error());

    try {
      await service.getOrganization('helo');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('It should test branching of get Organization', async () => {
    prisma.organization.findFirst = jest.fn().mockResolvedValueOnce(undefined);
    try {
      expect(await service.getOrganization('helo'));
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('It should test get Business Type', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({});
    prisma.businessType.findMany = jest.fn().mockReturnValueOnce([]);

    expect(await service.getBusinessType('helo')).toEqual([]);
  });
  it('It should test get businessType error response', async () => {
    prisma.organization.findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error());

    try {
      await service.getBusinessType('helo');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('It should test branching of getBusiness Type', async () => {
    prisma.organization.findFirst = jest.fn().mockResolvedValueOnce(undefined);
    try {
      expect(await service.getBusinessType('helo'));
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('It should test get Entity Type', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({});
    prisma.entityType.findMany = jest.fn().mockReturnValueOnce([]);

    expect(await service.getEntityType('helo')).toBeTruthy;
  });
  it('It should test get entityType error response', async () => {
    prisma.organization.findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error());

    try {
      await service.getEntityType('helo');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });

  it('It should test branching of get Entity Type', async () => {
    prisma.organization.findFirst = jest.fn().mockResolvedValueOnce(undefined);
    try {
      expect(await service.getEntityType('helo'));
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('It should test get Section', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({});
    prisma.section.findMany = jest.fn().mockReturnValueOnce([]);

    expect(await service.getSection('helo')).toBeTruthy;
  });
  it('It should test get section error response', async () => {
    prisma.organization.findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error());

    try {
      await service.getSection('helo');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });
  it('It should test branching of get section', async () => {
    prisma.organization.findFirst = jest.fn().mockResolvedValueOnce(undefined);
    try {
      expect(await service.getSection('helo'));
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  it('It should test get System Type', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({});
    prisma.entityType.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.systemType.findMany = jest.fn().mockResolvedValue([]);

    expect(await service.getSystemType('helo')).toBeTruthy;
  });
  it('It should test get system error response', async () => {
    prisma.organization.findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error());

    try {
      await service.getSystemType('helo');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });
  it('It should test branching of getSystemType', async () => {
    prisma.organization.findFirst = jest.fn().mockResolvedValueOnce(undefined);
    try {
      expect(await service.getSystemType('helo'));
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
  it('It should test get System Type by id', async () => {
    prisma.organization.findUnique = jest.fn().mockReturnValueOnce({});
    prisma.systemType.findUnique = jest.fn().mockResolvedValue({});

    expect(await service.getSystemTypeById('helo')).toBeTruthy;
  });

  it('It should test get department', async () => {
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({});
    prisma.entityType.findMany = jest.fn().mockReturnValueOnce([]);
    prisma.entityType.findFirst = jest.fn().mockResolvedValue({});

    expect(await service.getDepartment('helo')).toBeTruthy;
  });
  it('It should test get department error response', async () => {
    prisma.organization.findFirst = jest
      .fn()
      .mockRejectedValueOnce(new Error());

    try {
      await service.getDepartment('helo');
    } catch (err) {
      expect(err).toBeTruthy;
    }
  });
  it('It should test branching of get department', async () => {
    prisma.organization.findFirst = jest.fn().mockResolvedValueOnce(undefined);
    try {
      expect(await service.getDepartment('helo'));
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
