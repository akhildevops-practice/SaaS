import { axiosKc } from './../utils/axios.global';
import {
  BadRequestException,
  Injectable,
  HttpException,
  ConflictException,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
//import { Prisma } from '@prisma/client';
import { CreateOrgDto } from './dto/create-organization.dto';
import { v4 as uuid } from 'uuid';

//import { updateBusinessConfig } from './dto/update-business-config.dto';

import { filterOrganizations, getCurrentDate } from '../utils/helper';
import { createRolesInKc, createdBy } from '../utils/helper';

import { BusinessConfig } from './dto/business-config.dto';
import { CreateOrganizationEnums } from './constants/organization.enum';
import { Role } from '../authentication/roles/roles.enum';
import { resolve } from 'path';
import { createFieldsPairsFilter } from '../utils/filterGenerator';
import { includeObj } from 'src/utils/constants';
import { inspect } from 'util';
import { logger } from 'src/utils/logger';
import { createBusinessConfigItem } from './helpers/organization.helper';
import { InjectModel } from '@nestjs/mongoose';
import { System, SystemDocument } from '../systems/schema/system.schema';
import { Model } from 'mongoose';
import { generateNumbering } from 'src/documents/utils';

const fs = require('fs');

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    @InjectModel(System.name) private SystemModel: Model<SystemDocument>,
  ) {}

  async createOrg(body: CreateOrgDto, file, res: any, token: any, req) {
    //Extracting realm name from the instance url by splitting instance url
    const fs = require('fs');
    let logoUrl: Buffer | null = null;
    if (file) {
      logoUrl = fs.readFileSync(file.path);
    }
    let createdOrg;
    let iurl = body.instanceUrl.split('://');
    iurl = iurl[1].split('.');
    const realmName = iurl[0];
    const createRealmPayload = {
      ...CreateOrganizationEnums.createRealmDefaultPayload,
      ...{ realm: realmName },
    };
    ////////////////console.log('createRealmPayload', createRealmPayload);
    const createRealmKcApi = `${process.env.KEYCLOAK_API}${process.env.CREATE_ORGANIZATION}`;
    try {
      const createKcRealm = await axiosKc(
        createRealmKcApi,
        'POST',
        token,
        createRealmPayload,
      );

      if (createKcRealm.status === 201) {
        //Realm created successfully in keycloak
        // console.log('inside create');

        const getRealmUrl = process.env.GET_ORGANIZATION + '/' + realmName;
        const getCreatedRealmIdKCApi = `${process.env.KEYCLOAK_API}${getRealmUrl}`;

        try {
          //Get Id of the created Realm for further subsequent requests to the KC API
          const getKcRealmId = await axiosKc(
            getCreatedRealmIdKCApi,
            'GET',
            token,
          );

          if (getKcRealmId.status === 200) {
            //Create Organisation in our database
            const { realm, instanceUrl, principalGeography, digitalSignature } =
              body;

            const logoutUrlKc =
              process.env.KEYCLOAK_API +
              '/auth/realms/' +
              realmName +
              '/protocol/openid-connect/logout';
            const date = getCurrentDate();
            const createOrgData = {
              kcId: getKcRealmId.data.id,
              organizationName: realm,
              instanceUrl: instanceUrl,
              realmName: realmName,
              principalGeography: principalGeography,
              logoutUrl: logoutUrlKc,
              logoUrl: logoUrl,
              digitalSignature:
                String(body?.digitalSignature).toLowerCase() === 'true',
              orgAdminTitle: body?.orgAdminTitle ? body?.orgAdminTitle : 'MCOE',
              applicationAdminTitle: body?.applicationAdminTitle
                ? body?.applicationAdminTitle
                : 'IMS Coordinator',
            };
            // console.log('inside here', createOrgData);
            createdOrg = await this.prisma.organization.create({
              data: createOrgData,
            });
            // console.log('createdORg', createdOrg);
            const arrayData = ['oneDrive', 'Google', 'ObjectStore'];
            for (let data of arrayData) {
              await this.prisma.connectedApps.create({
                data: {
                  organizationId: createdOrg.id,
                  sourceName: data,
                  clientId: uuid(),
                  clientSecret: uuid(),
                  baseURL: data,
                  description: data, // Add missing required field
                  createdModifiedBy: data, // Add missing required field
                  Status: true, // Add missing required field
                },
              });
            }
            //(createdOrg)
            //const updatedOrg = await createdBy(this.prisma.user, this.prisma.organization, createdOrg.id, req)

            if (createdOrg) {
              //Creating peredefined Realm Roles in KC from a array of roles defined as array in Enums constanst
              const roles = CreateOrganizationEnums.predefinedRolesArray;
              const createRoleKcApi =
                process.env.KEYCLOAK_API +
                '/auth/admin/realms/' +
                realmName +
                '/roles';
              const destination = `${
                process.env.FOLDER_PATH
              }/${realmName.toLowerCase()}`;
              fs.mkdirSync(destination, { recursive: true });
              try {
                //Roles create api call to keycloak
                await createRolesInKc(roles, token, createRoleKcApi);

                const getAllRolesKcApi =
                  process.env.KEYCLOAK_API +
                  process.env.BASE +
                  realmName +
                  '/roles';

                //Get all Roles from Keycloak
                const getRolesfromKc = await axiosKc(
                  getAllRolesKcApi,
                  'GET',
                  token,
                );

                //Create roles in our database after fetching them from keycloak

                const orgPromise = [];
                orgPromise.push(
                  getRolesfromKc.data.map(async (role) => {
                    let data: any = {
                      kcId: role.id,
                      roleName: role.name,
                      organization: {
                        connect: {
                          id: createdOrg.id,
                        },
                      },
                    };
                    try {
                      await this.prisma.role.create({ data });
                    } catch (err) {
                      res.status(400).send({
                        status: err.message,
                        message: 'Unable to create role in database',
                      });
                    }
                  }),
                );
                await Promise.all(orgPromise);
                //Get admin cli Details from keycloak to make some admin cli settings
                const getAdminCliClientIdKcApi =
                  process.env.KEYCLOAK_API +
                  process.env.BASE +
                  realmName +
                  '/clients?clientId=admin-cli';

                const getAdminCliId = await axiosKc(
                  getAdminCliClientIdKcApi,
                  'GET',
                  token,
                );
                //Update admin cli settings and set the redirect url property to the instance url
                //So once the user logs in to the database he will be redirect to the correct instance url for the application
                const updateAdminCliKcApi =
                  process.env.KEYCLOAK_API +
                  process.env.BASE +
                  realmName +
                  `/clients/${getAdminCliId.data[0].id}`;

                const updateAdminCliPayload = {
                  ...getAdminCliId.data[0],
                  standardFlowEnabled: true,
                  rootUrl: `${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}`,
                  baseUrl: `${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/*`,
                  surrogateAuthRequired: false,
                  enabled: true,
                  alwaysDisplayInConsole: false,
                  clientAuthenticatorType: 'client-secret',
                  redirectUris: [
                    `${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}/*`,
                  ],
                  webOrigins: [
                    `${process.env.PROTOCOL}://${realmName}.${process.env.REDIRECT}`,
                  ],
                };

                const updateClient = await axiosKc(
                  updateAdminCliKcApi,
                  'PUT',
                  token,
                  updateAdminCliPayload,
                );
                if (updateClient.status === 204) {
                  const roles = getRolesfromKc.data;
                  const addRealmRolesKcApi =
                    process.env.KEYCLOAK_API +
                    process.env.BASE +
                    realmName +
                    '/clients/' +
                    getAdminCliId.data[0].id +
                    '/scope-mappings/realm';

                  const addRealmRolestoToken = await axiosKc(
                    addRealmRolesKcApi,
                    'POST',
                    token,
                    roles,
                  );
                  if (addRealmRolestoToken.status === 204) {
                    // await logger(req.user,'POST','ORG-MASTER',{action:"Created a organization"},"SUCCESS",this.prisma)
                    res.status(201).send(createdOrg);
                  }
                } else {
                  await this.deleteOrganization(createdOrg.id, token);
                  throw new HttpException(
                    'Updating client failed please delete the organization, and try creating again',
                    400,
                  );
                }
              } catch (err) {
                await this.deleteOrganization(createdOrg.id, token);
                throw new BadRequestException(err.message);
              }
            }
          } else {
            await this.deleteOrganization(createdOrg.id, token);
            throw new Error('Cant get realm id');
          }
        } catch (err) {
          await this.deleteOrganization(createdOrg.id, token);
          throw new BadRequestException(err.message);
        }
      } else {
        await this.deleteOrganization(createdOrg.id, token);
        throw new BadRequestException('Unable to create realm in kc');
      }
    } catch (err) {
      // await this.deleteOrganization(createdOrg.id,token)
      res.status(409).send(err.message);
      // throw new HttpException(err.message,409)
    }
  }

  async editLogo(body: CreateOrgDto, file, id, res) {
    //Extracting realm name from the instance url by splitting instance url
    // console.log('body', body);
    const fs = require('fs');
    let logoUrl: Buffer | null = null;
    if (file) {
      logoUrl = fs.readFileSync(file?.path);
    }
    // let flag=body?.digitalSignature==="true"?true:false
    // console.log('type if', typeof body.digitalSignature);
    const editOrgData = {
      logoUrl: logoUrl,
      digitalSignature: String(body?.digitalSignature).toLowerCase() === 'true',
      orgAdminTitle: body?.orgAdminTitle ? body?.orgAdminTitle : 'MCOE',
      applicationAdminTitle: body?.applicationAdminTitle
        ? body?.applicationAdminTitle
        : 'IMS Coordinator',
    };

    const edit = await this.prisma.organization.update({
      where: {
        id: id,
      },
      data: editOrgData,
    });
    res.status(201).send(edit);
  }

  /**
   *
   * @param businessConfig contains all the fields requied for creating a business config
   * @param id auto generated uuid of organization
   * @returns the created business config
   */
  async createBusinessConfig(
    businessConfig: BusinessConfig,
    id: string,
    res,
  ): Promise<any> {
    const { entityType, section, systemType } = businessConfig;
    const errorMsg = [];

    // duplication check for array entries in businessConfig
    for (const [key, val] of Object.entries(businessConfig)) {
      const arrMap = {};
      if (Array.isArray(businessConfig[key])) {
        const arr = val.map((item) => item.name);
        // looping through all items and adding count to arrMap
        arr.forEach((item) => {
          if (arrMap[item]) {
            arrMap[item] += 1;
          } else {
            arrMap[item] = 1;
          }
        });
        // looping through arrMap to check for the items repeating more than once
        for (const item in arrMap) {
          if (arrMap[item] > 1) {
            errorMsg.push(`${key} consists duplicate entries`);
          }
        }
      }
    }
    if (errorMsg.length > 0) {
      throw new ConflictException('Duplicate entries exists');
    }
    try {
      //business
      //await createBusinessConfigItem(business, this.prisma.business, id);
      // for (let data1 of businessData) {
      //   const btid = await this.prisma.businessType.create({
      //     data: { name: data1.businessType, organizationId: id },
      //   });
      //   for (let info of data1?.business) {
      //     const bdata = await this.prisma.business.create({
      //       data: {
      //         name: info,
      //         businessTypeId: btid.id ? btid.id : null,
      //         organizationId: id,
      //       },
      //     });
      //   }
      // }
      //entityType
      await createBusinessConfigItem(
        [{ name: 'Department' }, ...entityType],
        this.prisma.entityType,
        id,
      );
      // //section
      await createBusinessConfigItem(section, this.prisma.section, id);
      //functions
      // await createBusinessConfigItem(functions, this.prisma.functions, id);
      // //systemType
      await createBusinessConfigItem(systemType, this.prisma.systemType, id);
      //return updated organization
      //////////////console.log('businessconfig', businessConfig);
      await this.updateFiscalYearQuarters({
        where: { id: String(id) },
        data: businessConfig,
      });
      await this.updateFiscalYearFormat({
        where: { id: String(id) },
        data: businessConfig,
      });

      await this.updateAuditYear({
        where: { id: String(id) },
        data: businessConfig,
      });

      const updatedData = await this.prisma.organization.findUnique({
        where: {
          id: id,
        },
        include: {
          //business: true,
          //businessType: true,
          section: true,
          // function: true,
          systemType: true,
          entityType: true,
        },
      });
      res.send(updatedData);
      return updatedData;
    } catch (err) {
      throw new HttpException(
        'Error Occured While creating the businessConfig',
        400,
      );
    }
  }

  /**
   *
   * @param params contains unique user id and data
   * @returns back the desired HTTP response
   */
  async updateFiscalYearQuarters(params: { where: any; data: any }) {
    const { data, where } = params;
    let newData = { fiscalYearQuarters: data.fiscalYearQuarters };
    try {
      return await this.prisma.organization.update({ data: newData, where });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updateAIConfig(data: any) {
    try {
      return await this.prisma.organization.update(data);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  /**
   *
   * @param params contains unique org id and data
   * @returns back the desired HTTP response
   */
  async updateAuditYear(params: { where: any; data: any }) {
    const { data, where } = params;
    let newData = { auditYear: data.auditYear };
    try {
      return await this.prisma.organization.update({ data: newData, where });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
  async updateFiscalYearFormat(params: { where: any; data: any }) {
    const { data, where } = params;
    ////////////////console.log('fiscalyearformat', data.fiscalYearFormat);
    let newData = { fiscalYearFormat: data.fiscalYearFormat };
    try {
      return await this.prisma.organization.update({ data: newData, where });
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  async updateBusinessConfigNew(businessConfig: BusinessConfig, id: string) {
    const { entityType, section, systemType } = businessConfig;
    // console.log('businessconfig', businessConfig);
    const errorMsg = [];
    // duplication check for array entries in businessConfig
    for (const [key, val] of Object.entries(businessConfig)) {
      const arrMap = {};
      // ////////////////console.log('keyandvalue', key, val);
      // ////////////////console.log('test key', key);
      // if (key !== 'businessData') {
      if (Array.isArray(businessConfig[key])) {
        const arr = val.map((item) => item.name);
        // looping through all items and adding count to arrMap
        arr.forEach((item) => {
          if (arrMap[item]) {
            arrMap[item] += 1;
          } else {
            arrMap[item] = 1;
          }
        });
        // looping through arrMap to check for the items repeating more than once
        for (const item in arrMap) {
          if (arrMap[item] > 1) {
            errorMsg.push(`${key} consists duplicate entries`);
          }
        }
      }
    }
    if (errorMsg.length > 0) {
      throw new ConflictException('Duplicate entries exists');
    }
    try {
      //entityType
      await createBusinessConfigItem(entityType, this.prisma.entityType, id);
      // //section
      await createBusinessConfigItem(section, this.prisma.section, id);

      // //systemType
      await createBusinessConfigItem(systemType, this.prisma.systemType, id);
      //return updated organization

      console.log('businessConfig', businessConfig);

      await this.updateFiscalYearQuarters({
        where: { id: String(id) },
        data: businessConfig,
      });
      await this.updateFiscalYearFormat({
        where: { id: String(id) },
        data: businessConfig,
      });

      await this.updateAuditYear({
        where: { id: String(id) },
        data: businessConfig,
      });

      // console.log('businses config ai config --->', businessConfig.aiConfig);

      const updatedAIConfig = await this.updateAIConfig({
        where: { id: String(id) },
        data: {
          aiConfig: businessConfig?.aiConfig,
        },
      });

      // console.log('updatedAiConfig------>', updatedAIConfig);

      const updatedData = await this.prisma.organization.findUnique({
        where: {
          id: id,
        },
        include: {
          // business: true,
          // businessType: true,
          section: true,
          // function: true,
          systemType: true,
          entityType: true,
        },
      });
      return updatedData;
    } catch (err) {
      // console.log('ERRRRPRR', err);

      throw new HttpException(
        'Error Occured While updating the businessConfig',
        400,
      );
    }
  }

  /**
   *
   * @param entityToBeDeleted array of entity
   */
  async deleteEntity(entityToBeDeleted) {
    new Promise((resolve) => {
      const entityPromise = [];
      entityToBeDeleted.forEach(async (en, index) => {
        entityPromise.push(
          await this.prisma.entityType.delete({
            where: {
              id: en.id,
            },
          }),
        );
        if (entityToBeDeleted.length - 1 === index) {
          resolve(entityPromise);
        }
      });
    });
  }

  /**
   *
   * @param systemTypeToBeDeleted array of systemType
   */
  async deleteSystemType(systemTypeToBeDeleted) {
    new Promise((resolve) => {
      const systemTypePromise = [];
      systemTypeToBeDeleted.forEach(async (en, index) => {
        systemTypePromise.push(
          await this.prisma.systemType.delete({
            where: {
              id: en.id,
            },
          }),
        );
        if (systemTypeToBeDeleted.length - 1 === index) {
          resolve(systemTypePromise);
        }
      });
    });
  }

  /**
   *
   * @param sectionToBeDeleted array of section
   */
  async deleteSection(sectionToBeDeleted) {
    new Promise((resolve) => {
      const sectionPromise = [];
      sectionToBeDeleted.forEach(async (sc, index) => {
        sectionPromise.push(
          await this.prisma.section.delete({
            where: {
              id: sc.id,
            },
          }),
        );
        if (sectionToBeDeleted.length - 1 === index) {
          resolve(sectionPromise);
        }
      });
    });
  }
  async deleteFunction(functionToBeDeleted) {
    new Promise((resolve) => {
      const functionPromise = [];
      functionToBeDeleted.forEach(async (sc, index) => {
        functionPromise.push(
          await this.prisma.functions.delete({
            where: {
              id: sc.id,
            },
          }),
        );
        if (functionToBeDeleted.length - 1 === index) {
          resolve(functionPromise);
        }
      });
    });
  }
  /**
   *
   * @param orgName name of the organization
   * @param orgAdmin name of the organization admin
   * @returns all the organization/filtered organizations
   */
  async getOrganizations(
    orgName?: string,
    orgAdmin?: string,
    page?: number,
    limit?: number,
  ) {
    const skipValue = (Number(page) - 1) * Number(limit);

    //filtering of organization both by orgName and orgAdmin
    //filtering of organization both by orgName and orgAdmin
    try {
      ////console.log(`orgName ${orgName}  and orgadmin ${orgAdmin} `);
      if (orgName && orgAdmin) {
        ////console.log('first if');
        const nameArr = orgAdmin?.split(' ');
        if (nameArr.length === 1 || 2) {
          const firstName = nameArr[0];
          const lastName = nameArr[1];

          const filteredData = await filterOrganizations(
            skipValue,
            Number(limit),
            this.prisma.organization,
            orgName,
            firstName,
            lastName,
          );

          return filteredData;
        }
        //filtering if only orgName is provided
      } else if (orgName && !orgAdmin) {
        ////console.log('second if');
        const filteredData = await filterOrganizations(
          skipValue,
          Number(limit),
          this.prisma.organization,
          orgName,
        );
        return filteredData;

        //filtering if only orgAdmin is provided
      } else if (!orgName && orgAdmin) {
        ////console.log('3 if');
        const nameArr = orgAdmin?.split(' ');
        if (nameArr.length === 1 || 2) {
          const firstName = nameArr[0];
          const lastName = nameArr[1];
          const filteredData = await filterOrganizations(
            skipValue,
            Number(limit),
            this.prisma.organization,
            false,
            firstName,
            lastName,
          );
          return filteredData;
        }
        //No filtering returns all the organization
      } else {
        ////console.log('else');
        const dataCount = (await this.prisma.organization.findMany({})).length;

        const data = await this.prisma.organization.findMany({
          skip: skipValue,
          take: Number(limit),
          include: {
            entityType: true,
            // businessType: true,
            business: true,
            section: true,
            user: {
              where: {
                // assignedRole: {
                //   some: {
                //     role: {
                //       roleName: {
                //         equals: 'ORG-ADMIN',
                //       },
                //     },
                //   },
                // },
              },
              select: {
                email: true,
              },
            },
          },
          orderBy: {
            organizationName: 'asc',
          },
        });
        return { data, dataCount };
      }
    } catch (err) {
      throw new BadRequestException();
    }
  }

  /**
   *
   * @param orgId auto generated uuid of organization
   * @param res to send back the desired HTTP response
   * @param token token requied for authentication which is recieved from keycloak
   * @returns back the desired HTTP response
   */
  async deleteOrganization(orgId: string, token: string) {
    try {
      if (!orgId) throw new BadRequestException('Orgid is required');
      //Find the organization to be deleted by id
      const organization = await this.prisma.organization.findUnique({
        where: {
          id: orgId,
        },
      });
      if (organization) {
        //If organization is found delete all related roles and users for the organization
        const deletedUserAndRoles = await this.prisma.organization.update({
          where: {
            id: orgId,
          },
          data: {
            role: {
              deleteMany: {},
            },
            user: {
              deleteMany: {},
            },
          },
        });
        if (deletedUserAndRoles) {
          //Once all related roles and users are deleted for the organisation
          //Making a call to kc api to delete all the realm in keycloak
          const realm = organization.realmName;
          const deleteRealmKcApi =
            process.env.KEYCLOAK_API + process.env.BASE + realm;

          await axiosKc(deleteRealmKcApi, 'DELETE', token);
          //Once the realm is deleted in keycloak , we finally delete the organization from our database
          await this.prisma.organization.delete({
            where: {
              id: orgId,
            },
          });
          return { msg: 'Organization deleted successfully' };
        }
      } else {
        return {
          msg: 'The organization you are trying to delete does not exist!!',
        };
      }
    } catch (err) {
      throw new BadRequestException({ description: err.message });
    }
  }

  /**
   *
   * @param realmName name of the realm
   * @returns a single organization
   */
  async getOrganization(realmName: string) {
    // try {
    const org = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
      include: {
        // entity: true,
        entityType: true,
        business: true,
        // businessType: true,
        function: true,
        systemType: true,
        section: true,
      },
    });
    if (org.logoUrl) {
      // Convert Buffer to Base64
      const logoBase64: any = `data:image/png;base64,${org.logoUrl.toString(
        'base64',
      )}`;
      org.logoUrl = logoBase64;
    }
    return org;
    // } catch (err) {
    //   throw new HttpException(err.message, 400);
    // }
  }

  async getBusiness(realmName: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    if (organization) {
      const business = await this.prisma.business.findMany({
        where: {
          organizationId: organization.id,
        },
      });

      return business;
    } else {
      throw new NotFoundException();
    }
  }
  async getEntityTypeById(id) {
    try {
      // console.log('result', id);
      const res = await this.prisma.entityType.findFirst({
        where: {
          id: id,
        },
        select: {
          name: true,
        },
      });
      return res;
    } catch (error) {}
  }
  async getEntityType(realmName: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    if (organization) {
      const entityType = await this.prisma.entityType.findMany({
        where: {
          organizationId: organization.id,
        },
      });

      return entityType;
    } else {
      throw new NotFoundException();
    }
  }

  async getSystemType(realmName: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    if (organization) {
      const systemType = await this.prisma.systemType.findMany({
        where: {
          organizationId: organization.id,
        },
      });

      return systemType;
    } else {
      throw new NotFoundException();
    }
  }

  async getSystemTypeGroupedByType(realmName: string, kcId: string) {
    const response = [];
    // getting user info
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: kcId,
      },
      include: {
        entity: true,
      },
    });

    // getting location ID of user
    const locId = user?.locationId ?? user.entity?.locationId;
    // getting organization info
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });
    // if organization exists
    if (organization) {
      const systemType = await this.prisma.systemType.findMany({
        where: {
          organizationId: organization.id,
        },
      });
      // getting all systems of certain system type
      for (let i = 0; i < systemType.length; i++) {
        const type: any = systemType[i];
        const systems = await this.SystemModel.find({
          organizationId: organization.id,
          'applicable_locations.id': locId,
          type: type.id,
        });
        // adding found systems into system type
        type.systems = systems;
        response.push(type);
      }

      return response;
    } else {
      throw new NotFoundException();
    }
  }

  async getSystemTypeById(systemId: string) {
    const systemType = await this.prisma.systemType.findUnique({
      where: {
        id: systemId,
      },
    });

    return systemType;
  }

  async getSection(realmName: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    if (organization) {
      const section = await this.prisma.section.findMany({
        where: {
          organizationId: organization.id,
        },
      });

      return section;
    } else {
      throw new NotFoundException();
    }
  }

  async getDepartment(realmName: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    if (organization) {
      const department = await this.prisma.entityType.findFirst({
        where: {
          AND: [{ organizationId: organization.id }, { name: 'Department' }],
        },
      });
      return department;
    } else {
      throw new NotFoundException();
    }
  }
  async getFunction(realmName: string) {
    const organization = await this.prisma.organization.findFirst({
      where: {
        realmName: realmName,
      },
    });

    if (organization) {
      const functions = await this.prisma.functions.findMany({
        where: {
          organizationId: organization.id,
        },
      });

      return functions;
    } else {
      throw new NotFoundException();
    }
  }

  async getOrgById(id: string) {
    return await this.prisma.organization.findUnique({
      where: {
        id: id,
      },
    });
  }
  async addActiveModules(realmName, updateArray: string[]) {
    // try {
    console.log('update array', updateArray);
    const organizationName = await this.prisma.organization.findFirst({
      where: {
        realmName,
      },
    });

    const updateOrg = await this.prisma.organization.update({
      where: {
        id: organizationName.id,
      },
      data: {
        activeModules: updateArray,
      },
    });
    // console.log('updated org', updateOrg);
    return updateOrg;
    // } catch (err) {
    //   throw new BadGatewayException(err);
    // }
  }

  async getAllActiveModules(realmName: string) {
    try {
      // //////////console.log('relamname', realmName);
      const organizationName = await this.prisma.organization.findFirst({
        where: {
          realmName,
        },
      });

      const finalResult = await this.prisma.organization.findFirst({
        where: {
          id: organizationName.id,
        },
        select: {
          activeModules: true,
        },
      });
      return finalResult;
    } catch (err) {
      throw new BadGatewayException(err);
    }
  }
  async getFiscalYear(orgId, searchyear) {
    const year = await this.prisma.organization.findUnique({
      where: {
        id: orgId,
      },
      select: {
        fiscalYearQuarters: true,
        fiscalYearFormat: true,
      },
    });

    const isAprilToMarch = year.fiscalYearQuarters === 'April - Mar';

    const date = new Date();
    const currentMonth = date.getMonth() + 1; // Adding 1 because getMonth() returns zero-based month

    // Check if the fiscal year starts in April (April-March)
    const isBeforeApril = isAprilToMarch && currentMonth < 4;

    if (!searchyear) {
      let cYear = date.getFullYear();
      let nYear = cYear + 1;

      if (isBeforeApril) {
        // If current date is before April, adjust the previous fiscal year
        cYear--;
        nYear--;
      }
      const clastTwoDigits = cYear.toString().slice(-2);
      const nlastTwoDigits = nYear.toString().slice(-2);

      switch (year.fiscalYearFormat) {
        case 'YYYY':
          return cYear;
        case 'YY-YY+1':
          return `${clastTwoDigits}-${nlastTwoDigits}`;
        case 'YYYY-YY+1':
          return `${cYear}-${nlastTwoDigits}`;
        case 'YY+1':
          return `${nlastTwoDigits}`;
      }
    } else {
      let inputYear = parseInt(searchyear, 10);
      if (isBeforeApril) {
        // If current date is before April, adjust the previous fiscal year
        inputYear--;
        searchyear--;
      }
      const nYear = inputYear + 1;

      const clastTwoDigits = searchyear.toString().slice(-2);
      const nlastTwoDigits = nYear.toString().slice(-2);

      switch (year?.fiscalYearFormat) {
        case 'YYYY':
          return searchyear;
        case 'YY-YY+1':
          return `${clastTwoDigits}-${nlastTwoDigits}`;
        case 'YYYY-YY+1':
          return `${searchyear}-${nlastTwoDigits}`;
        case 'YY+1':
          return `${nlastTwoDigits}`;
      }
    }
  }

  async getOrganizationLogo(realmId: string) {
    try {
      const org = await this.prisma.organization.findFirst({
        where: {
          id: realmId,
        },
      });
      if (org.logoUrl) {
        const logoBase64: any = `data:image/png;base64,${org.logoUrl.toString(
          'base64',
        )}`;
        org.logoUrl = logoBase64;
      }
      return org.logoUrl;
    } catch (err) {
      throw new HttpException(err.message, 400);
    }
  }
}
