import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '../authentication/authentication.module';
import { OrganisationController } from './organization.controller';
import { OrganizationService } from './organization.service'

// describe('OrganisationController', () => {
//   let controller: OrganisationController;

let mockOrganizationService = {
  createOrganization: jest.fn((data, res, token) => {
    return {
      id: '65daf6f7-8a1a-4f79-96d9-b674b72af6c1',
      kcId: '65daf6f7-8a1a-4f79-96d9-b674b7f5e18f',
      organizationName: data.realm,
      instanceUrl: data.instanceUrl,
      principalGeography: data.principalGeography,
    }
  }),
  getOrganizations: jest.fn().mockImplementation((orgName, orgAdmin, page, limit) => ([
    {
      id: '65daf6f7-8a1a-4f79-96d9-b674b72af6c1',
      kcId: '65daf6f7-8a1a-4f79-96d9-b674b7f5e18f',
      orgName,
      instanceUrl: 'http://random.processridge.com',
      principalGeography: 'India',
    }
  ])),
  createBusinessConfig: jest.fn().mockImplementation((data, id) => ({
    ...data
  })),
  updateBusinessConfig: jest.fn().mockImplementation((data, id) => ({
    ...data
  })),
  deleteOrganizations: jest.fn().mockImplementation((id, res, token) => ({
    id: '353726b1-ab95-46ff-844e-cac05b5150f1'
  }))
}

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [AuthenticationModule],
    controllers: [OrganisationController],
    providers: [OrganizationService]
  }).overrideProvider(OrganizationService).useValue(mockOrganizationService).compile();

  //     controller = module.get<OrganisationController>(OrganisationController);
  //   });

  //   it('should be defined', () => {
  //     expect(controller).toBeDefined();
  //   });

  //   it('should create an organizations', () => {
  //     const data = {
  //       realm: "Organisation2",
  //       instanceUrl: "pro/org1",
  //       principalGeography: "india"
  //     }; 
  //     const res = {}; 
  //     const token = 'tokenreceivedfromkeycloak'

  expect(controller.createOrganization(data, res, token)).resolves.toEqual({
    id: expect.any(String),
    kcId: expect.any(String),
    organizationName: data.realm,
    instanceUrl: data.instanceUrl,
    principalGeography: data.principalGeography,
  })
  // expect(mockOrganizationService.createOrganization).toHaveBeenCalled()
})

it('should get all the organization', () => {
  const orgName = { organizationName: 'Organization1' }
  const orgAdmin = { name: 'John' }
  const page = 1
  const limit = 10

  expect(controller.getOrganizations(orgName, orgAdmin, page, limit)).toEqual([
    {
      id: expect.any(String),
      kcId: expect.any(String),
      orgName,
      instanceUrl: 'http://random.processridge.com',
      principalGeography: 'India',
    }
  ])
})

//   it('should create business config', async () => {
//     const data = {
//       businessUnit: [{ name: 'B1'}],
//       entity: [{ name: 'E1'}],
//       section: [{ name: 'S1'}],
//       fiscalYearQuarters: 'Jan-Mar'
//     }
//     const id = '65daf6f7-8a1a-4f79-96d9-b674b72af6c1'
//     expect(controller.createBusinessConfig(data, id)).resolves.toEqual(
//       {
//         businessUnit: expect.any(Array),
//         entity: expect.any(Array),
//         section: expect.any(Array),
//         fiscalYearQuarters: expect.any(String)
//       }
//     )
//   })

//   it('should update business config', async () => {
//     const data = {
//       businessUnit: [{ name: 'B1'}],
//       entity: [{ name: 'E1'}],
//       section: [{ name: 'S1'}],
//       fiscalYearQuarters: 'Jan-Mar'
//     }
//     const id = '65daf6f7-8a1a-4f79-96d9-b674b72af6c1'
//     expect(controller.updateBusinessConfig(data, id)).resolves.toEqual(
//       {
//         businessUnit: expect.any(Array),
//         entity: expect.any(Array),
//         section: expect.any(Array),
//         fiscalYearQuarters: expect.any(String)
//       }
//     )
//   })

//   it('should delete an organization', async () => {
//     const id = '353726b1-ab95-46ff-844e-cac05b5150f1'
//     const res = {}; 
//     const token = 'tokenreceivedfromkeycloak'

//     expect(controller.deleteOrganizations(id, res, token)).resolves.toEqual({
//       id: expect.any(String)
//     })
//   })

//   it('should reject if an organization is not found', async () => {
//     const id = '353726b1-ab95-46ff-844e-cac05b5150f1'
//     const res = {}; 
//     const token = 'tokenreceivedfromkeycloak'

//     expect(controller.deleteOrganizations(id, res, token)).rejects.toEqual(expect.any(Error))
//   })
// });
