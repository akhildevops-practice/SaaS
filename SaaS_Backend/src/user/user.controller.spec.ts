import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '../authentication/authentication.module';
import { UserController } from './user.controller';
import { UserService } from './user.service'

describe('OrganisationController', () => {
  let controller: UserController;

  let mockUserService = {
    createOrgAdmin: jest.fn().mockImplementation((data, res, token) => ({
      id: '65daf6f7-8a1a-4f79-96d9-b674b72af6c1',
      kcId: '65daf6f7-8a1a-4f79-96d9-b674b7f5e18f',
      ...data
    })),
    getOrgAdmin: jest.fn().mockImplementation(() => (
      [
        {
          id: '65daf6f7-8a1a-4f79-96d9-b674b72af6c1',
          kcId: '65daf6f7-8a1a-4f79-96d9-b674b7f5e18f',
          username: "johndoe",
          firstName: "John",
          lastName: "Doe",
          email: "johndoe@sample.com"
        }
      ]
    )),
    deleteOrgAdmin: jest.fn().mockImplementation((id, realm, token) => ({
      id: id,
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@sample.com"
    })),
    sendInvite: jest.fn().mockImplementation((id, realm, token) => ({
      msg: "Message sent"
    })),
    updateOrgAdmin: jest.fn().mockImplementation((id, realm, token, res, data) => ({
      id: id,
      ...data
    })),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthenticationModule],
      controllers: [UserController],
      providers: [UserService]
    }).overrideProvider(UserService).useValue(mockUserService).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an organization admin', () => {
    const data = {
      realm: "Organization 1",
      username: "johndoe",
      firstName: "John",
      lastName: "Doe",
      email: "johndoe@sample.com"
    }
    const res = {}
    const token = 'tokenreceivedfromkeycloak'

    expect(controller.createOrgAdmin(data, res, token)).resolves.toEqual({
      id: expect.any(String),
      kcId: expect.any(String),
      ...data
    })
  })

  it('should get all the organization admins', () => {
    const organization = 'Organization2'
    expect(controller.getOrgAdmin(organization)).toEqual([
      {
        id: expect.any(String),
        kcId: expect.any(String),
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@sample.com"
      }
    ])
  })

  it('should delete an organization admin', () => {
    const id = '65daf6f7-8a1a-4f79-96d9-b674b72af6c1'
    const realm = 'organization2'
    const token = 'tokenreceivedfromkeycloak'
    expect(controller.deleteOrgAdmin(id, realm, {}, {})).resolves.toEqual({
        id: expect.any(String),
        username: "johndoe",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@sample.com"
    })
  })

  it('should invite organization admin', async () => {
    const id = '65daf6f7-8a1a-4f79-96d9-b674b72af6c1'
    const realm = 'Organization2'
    const token = 'tokenreceivedfromkeycloak'
    const res = {}
    expect(controller.sendInvite(id, realm, token, res)).resolves.toEqual(
      {
        msg: expect.any(String)
      }
    )
  })

  it('should update org admin', () => {
    const id = '65daf6f7-8a1a-4f79-96d9-b674b72af6c1'
    const realm = 'Organization2'
    const token = 'tokenreceivedfromkeycloak'
    const res = {}
    const data = { 
      firstName: 'John', 
      lastName: 'Doe', 
      email: 'johndoe@sample.com'  
    }
    
    expect(controller.updateOrgAdmin(id, realm, token, res, data)).resolves.toEqual({
      id: expect.any(String),
      ...data
    })
  })
});
