import { Test, TestingModule } from '@nestjs/testing';
import { MRMService } from './mrm.service';
import { OrganizationService } from '../organization/organization.service';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';

jest.mock('./helpers/email.helper', () => {
  return {
    sendMRMAttendeesEmail: jest.fn().mockResolvedValue({ done: 'ok' }),
  };
});

describe('MRMService', () => {
  let service: MRMService;
  const mockOrgData = {
    id: '1212',
    kcId: '1232',
    organizationName: 'Test Org',
    realmName: 'testOrg',
  };

  const mockSystemType = {
    id: '1212',
    name: 'SYstem Type 1',
  };

  let mockUser: any = {
    id: '112',
    firstName: 'Rahul',
    lastName: 'Sharma',
    email: 'rahul@hello.com',
    locationId: '1113',
    organizationId: '131313',
    assignedRole: [
      {
        role: {
          roleName: 'ORG-ADMIN',
        },
      },
      {
        role: {
          roleName: 'MR',
        },
      },
    ],
  };

  let mockLocationData = {
    id: "12122",
    locationName: "Guwahati",
    locationType: "Internal",
    locationId: "LocId12"
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MRMService,
        {
          provide: OrganizationService,
          useFactory: () => ({
            getSystemTypeById: jest.fn(() => mockSystemType),
            getOrgById: jest.fn(() => mockOrgData),
          }),
        },
        {
          provide: UserService,
          useFactory: () => ({
            getUserInfo: jest.fn(() => mockUser),
            getUserById: jest.fn(() => mockUser),
            getAllMrOfOrg: jest.fn(() => [mockUser]),
          }),
        },
        {
          provide: LocationService,
          useFactory: () => ({
            getLocationById: jest.fn(() => mockLocationData)
          }),
        },
      ],
    }).compile();

    service = module.get<MRMService>(MRMService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
