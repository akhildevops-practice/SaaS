import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import { LocationModule } from '../location/location.module';
import { UserModule } from '../user/user.module';
import { DocumentsService } from '../documents/documents.service';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';
import { SystemsService } from './systems.service';
import { OrganizationModule } from '../organization/organization.module';
import { System } from './schema/system.schema';
import { CreateSystemDto } from './dto/create-system.dto';

describe('SystemsService', () => {
  let systemsService: SystemsService;

  //mocked models
  let mockedSystemModel: any = function () {}

  // mocked data
  let mockedUserData: any = {
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

  let mockDocumentData = {
    id: "2131313",
    doctypeId: "12312123",
    organizationId: "1231232",
    documentName: "Some Name" 
  }

  let mockedSystemData:any = {
    "_id": "62e77f37ce424034173b34ca",
    "type": "5ed63796-1caa-4154-955b-40e549c5c08b",
    "name": "System Three",
    "clauses": [
      {
        "number": "cl1",
        "name": "clause one",
        "description": "clause one description",
        "_id": "62e77f37ce424034173b34cb"
      },
      {
        "number": "cl2 ",
        "name": "clause two",
        "description": "clause two description ",
        "_id": "62e77f37ce424034173b34cc"
      }
    ],
    "applicable_locations": [
      {
        "id": "cc11e87c-1408-402a-bf13-701f881c282d",
        "_id": "62e77f37ce424034173b34cd"
      }
    ],
    "description": "asdfasdfas",
    "organizationId": "c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
    "createdAt": "1659338551324",
    "updatedAt": "1659338551324"
  }

  let mockLocationData = {
    id: "12122",
    locationName: "Guwahati",
    locationType: "Internal",
    locationId: "LocId12"
  }


  beforeAll(async () => {
    
    const mongod = await MongoMemoryServer.create();
    const mongoURI = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoURI),
        LocationModule,
        UserModule,
        OrganizationModule
      ],
      providers: [
        SystemsService,
        {
          provide: getModelToken(System.name),
          useValue: Model,
        },
        {
          provide: LocationService,
          useFactory: () => ({
            getLocationById: jest.fn(() => mockLocationData),
            getLocationforOrg: jest.fn(() => [mockLocationData]),
          }),
        },
        {
          provide: UserService,
          useFactory: () => ({
            getUserInfo: jest.fn(() => mockedUserData),
            getUserById: jest.fn(() => mockedUserData),
            getAllMrOfOrg: jest.fn(() => [mockedUserData]),
          })
        },
        {
          provide: DocumentsService,
          useFactory: () => ({
            findOne: jest.fn(() => mockDocumentData)
          }),
        },
      ],
    })
    .overrideProvider(getModelToken(System.name))
    .useValue(mockedSystemModel)
    .compile();

    systemsService = module.get<SystemsService>(SystemsService);
  });


  it("create method should create a new system and return", async () => {
      const data: CreateSystemDto = {
        type: "1212",
        name: "Some Name",
        description: "Some Desc",
        applicable_locations: [ { id: "12212"} ],
        clauses: [{
          number: "N21212",
          name: "Some Name",
          description: "Desc here"
        }],
        organizationId: "12113"
      }

      mockedSystemModel.find = function() { return [] }
      mockedSystemModel.prototype.save = function() { return mockedSystemData }

      const res = await systemsService.create("12212", data);
  })

  it("create method should throw an error", async () => {
      const data: CreateSystemDto = {
        type: "1212",
        name: "Some Name",
        description: "Some Desc",
        applicable_locations: [ { id: "12212"} ],
        clauses: [{
          number: "N21212",
          name: "Some Name",
          description: "Desc here"
        }],
        organizationId: "12123"
      }

      mockedSystemModel.find = function() { return ["231231"] }
      mockedSystemModel.prototype.save = function() { return mockedSystemData }

      try {
        const res = await systemsService.create("12212", data);
      }
      catch(err) {
        expect(err).toBeTruthy();
      }
  })

  it('findById method should find a system by ID and return', async () => {
      mockedSystemModel.findById = function() { return mockedSystemData }
      const res = await systemsService.findById("123123");
      expect(res).toBeTruthy();
  });

  it('findAll method should return an Array of systems', async () => {
      
      mockedSystemModel.countDocuments = function() { return 10 }
      mockedSystemModel.find = function() { return this }
      mockedSystemModel.skip = function() { return this }
      mockedSystemModel.limit = function() { return [mockedSystemData] }
      
      const res = await systemsService.findAll("123123", 0, 10);
      expect(res).toBeTruthy();
  });

  it('update method should update an item  and return', async () => {

    const data: CreateSystemDto = {
      type: "1212",
      name: "Some Name",
      description: "Some Desc",
      applicable_locations: [ { id: "12212"} ],
      clauses: [{
        number: "N21212",
        name: "Some Name",
        description: "Desc here"
      }],
      organizationId: "12123"
    }
      
    
    mockedSystemModel.findByIdAndUpdate = function() { return mockedSystemData }
    
    const res = await systemsService.update("123123", data, "10");
    expect(res).toBeTruthy();
});


it('remove method should delete an system', async () => {
      
  mockedSystemModel.findByIdAndRemove = function() { return mockedSystemData }
  
  const res = await systemsService.remove("123123");
  expect(res).toBeTruthy();
});

it('searchSystem method should return array of systems', async () => {
    const query = {
      type: "5ed63796-1caa-4154-955b-40e549c5c08b",
      name: "system",
      location: "Guwahati",
      skip: 0,
      limit: 25
    }
    mockedSystemModel.aggregate = function() { return [mockedSystemData] }
    
    const res = await systemsService.searchSystem(query, "123123", "benq");
    expect(res).toBeTruthy();
});

it('duplicateSystem method should return array of systems', async () => {
 
  mockedSystemModel.findById = function() { return this }
  mockedSystemModel.select = function() { return mockedSystemData}
  
  const res = await systemsService.duplicateSystem("123123");
  expect(res).toBeTruthy();
});

it('AddNewClause method add clauses to a system', async () => {
 
  mockedSystemModel.findByIdAndUpdate = function() { return mockedSystemData}
  
  const res = await systemsService.AddNewClause("123123", { });
  expect(res).toBeTruthy();
});

it('updateClauses method updates clauses in a system', async () => {
 
  mockedSystemModel.findOneAndUpdate = function() { return mockedSystemData }
  
  const res = await systemsService.updateClauses("1212", "123123", { 
    number: "1212",
    name: "SOme name",
    description: "Some desc"
  });
  expect(res).toBeTruthy();
});

it('removeClauses method reomves clauses from a system', async () => {
 
  mockedSystemModel.findOneAndUpdate = function() { return mockedSystemData }
  
  const res = await systemsService.removeClause("1212", "123123");
  expect(res).toBeTruthy();
});


it("getSystemBySystemType method returns by an array of systems", async () => {
    mockedSystemModel.find = function() { return [mockedSystemData] }
    const res = await systemsService.getSystemBySystemType("qwsadasd");
    expect(res).toBeTruthy();
})


it("getClauses method returns an array of clauses", async () => {
  mockedSystemModel.findById = function() { return this }
  mockedSystemModel.select = function() { return mockedSystemData }
  const res = await systemsService.getClauses("123123");
  expect(res).toBeTruthy();
})

it("getClauseById method returns an array of clauses", async () => {
  mockedSystemModel.aggregate = function() { return [mockedSystemData] }
  const res = await systemsService.getClauseById("62e77f37ce424034173b34ca");
  expect(res).toBeTruthy();
})

});
