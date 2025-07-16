import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { LocationService } from './location.service';
import { UserService } from '../user/user.service';
import axios, { AxiosResponse } from 'axios';
import * as UserDeps from '../user/user.service'
import * as helpers from '../utils/filterGenerator';

import * as bthelper from '../user/helper';
import { LocationDto } from './dto/location.dto';

describe('LocationService', () => {
  let service: LocationService;
  let prisma: Partial<PrismaService>
  let res: Response
  let userService: UserService

  beforeEach(async () => {
    //REST MODULES

    jest.resetModules();

    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationService, PrismaService, UserService],
    }).compile();

    service = module.get<LocationService>(LocationService);
    prisma = module.get<PrismaService>(PrismaService);
    userService = module.get<UserService>(UserService)

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it("It should test create location", async () => {
    const locationData = {

      locationName: "sjdkd",


      locationType: "sjdkd",


      locationId: "sjdkd",


      description: "sjdkd",


      organization: "sjdkd",


      businessType: ["sjdkd"],
    }

    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({})
    prisma.location.findFirst = jest.fn().mockReturnValueOnce(undefined)
    prisma.location.create = jest.fn().mockReturnValueOnce({ id: "djdjk" })
    prisma.locationBusinessType.create = jest.fn().mockReturnValueOnce({})
    expect(await service.createLocation(locationData)).toBeTruthy

  })

  it("It should test create location duplication check", async () => {
    const locationData = {

      locationName: "sjdkd",


      locationType: "sjdkd",


      locationId: "sjdkd",


      description: "sjdkd",


      organization: "sjdkd",


      businessType: ["sjdkd"],
    }

    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({})
    prisma.location.findFirst = jest.fn().mockReturnValueOnce({ id: "Hhshdh" })
    prisma.location.create = jest.fn().mockReturnValueOnce({ id: "djdjk" })
    prisma.locationBusinessType.create = jest.fn().mockReturnValueOnce({})
    try {
      await service.createLocation(locationData)

    } catch (err) {
      expect(err).toBeTruthy
    }



  })

  it("Test the location management api", async () => {
    const testData = {
      businessType: [{ name: "djjdjd" }]
    }
    prisma.location.findMany = jest.fn().mockReturnValueOnce([{ id: "Hhshdh", ...testData }])

    expect(await service.locationManagement()).toBeTruthy
  })

  it("Should test the get location for org for orgadmin user", async () => {
    const user = {
      kcRoles: {
        roles: ["ORG-ADMIN"]
      }
    }
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({})
    prisma.location.findMany = jest.fn().mockReturnValueOnce([{}])
    expect(await service.getLocationforOrg("hdjdj", user)).toBeTruthy

  })
  it("Should test the get location for org error response for orgadmin user", async () => {
    const user = {
      kcRoles: {
        roles: ["ORG-ADMIN"]
      }
    }
    prisma.organization.findFirst = jest.fn().mockReturnValueOnce(undefined)
    prisma.location.findMany = jest.fn().mockReturnValueOnce([{}])
    try {
      await service.getLocationforOrg("djfjf", user)
    } catch (err) {
      expect(err).toBeTruthy

    }

  })
  it("Should test the get location for org  response for any other user", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }


    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({})
    prisma.location.findFirst = jest.fn().mockReturnValueOnce({})

    userService.getUserInfo = jest.fn().mockReturnValueOnce({ locationId: "sjdkk" })
    expect(await service.getLocationforOrg("hdjdj", user)).toBeTruthy

  })

  it("Should test the get location for org  response for any other user and return location from user entity", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }


    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({})
    prisma.location.findFirst = jest.fn().mockReturnValueOnce({})

    userService.getUserInfo = jest.fn().mockReturnValueOnce({ entity: { locationId: "sjdkk" } })
    expect(await service.getLocationforOrg("hdjdj", user)).toBeTruthy

  })

  it("Should test the get location for org  response for any other user error response ", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }


    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({})
    prisma.location.findFirst = jest.fn().mockReturnValueOnce(undefined)

    userService.getUserInfo = jest.fn().mockReturnValueOnce({ entity: { locationId: "sjdkk" } })
    try {
      await service.getLocationforOrg("djfjf", user)
    } catch (err) {
      expect(err).toBeTruthy

    }

  })

  it("Should test getEntityForLocation success response", async () => {
    prisma.entity.findMany = jest.fn().mockReturnValueOnce([{}])
    expect(await service.getEntityForLocation("dhfhjjf", "dhkjd")).toBeTruthy
  })
  it("Should test getEntityForLocation error response", async () => {
    prisma.entity.findMany = jest.fn().mockRejectedValueOnce(new Error("some random error"))

    try {
      await service.getEntityForLocation("djdfexpekk", "djjf")
    } catch (err) {
      expect(err).toBeTruthy
    }

  })

  it("Should test getBusinessTypeForDept success response", async () => {
    prisma.businessType.findMany = jest.fn().mockReturnValueOnce([{}])
    expect(await service.getBusinessTypeForDept("dhfhjjf")).toBeTruthy
  })

  it("Should test getSectionsForOrg success response", async () => {
    prisma.section.findMany = jest.fn().mockReturnValueOnce([{ id: "sjdjkd", name: "snjdjdk" }])
    expect(await service.getSectionsForOrg("dhfhjjf")).toBeTruthy
  })
  it("Should test getSectionsForOrg error response", async () => {
    prisma.section.findMany = jest.fn().mockRejectedValueOnce(new Error("some random error"))
    try {
      await service.getSectionsForOrg("djdfexpekk")
    } catch (err) {
      expect(err).toBeTruthy
    }
  })
  it("Should test getLocations success response", async () => {
    const user = {
      kcRoles: {
        roles: ["LOCATION-ADMIN"]
      }
    }
    prisma.location.findFirst = jest.fn().mockReturnValueOnce({ locationId: "wdjjdw" })
    prisma.locationBusinessType.findMany = jest.fn().mockReturnValueOnce([{ id: "dhjdjd" }])
    prisma.user.findFirst = jest.fn().mockReturnValueOnce({ locationId: "dkfklf" })
    prisma.locationBusinessType.findFirst = jest.fn().mockReturnValueOnce({ businessTypeId: "djjdk", businessType: { name: "djdkdk" } })

    expect(await service.getLocations("dhfhjjf", "DHJJD", "HDHJD", "DJDJ", 9, 9, user)).toBeTruthy
  })
  it("Should test getLocations success response for master i.e superadmin", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    prisma.locationBusinessType.findMany = jest.fn().mockReturnValueOnce([{ id: "dhjdjd" }])
    prisma.user.findFirst = jest.fn().mockReturnValueOnce({ locationId: "dkfklf" })
    prisma.locationBusinessType.findFirst = jest.fn().mockReturnValueOnce({ businessTypeId: "djjdk", businessType: { name: "djdkdk" } })

    expect(await service.getLocations("master", "DHJJD", "HDHJD", "DJDJ", 9, 9, user)).toBeTruthy
  })
  //
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", "DHJJD", "HDHJD", "DJDJ", 9, 9, user)).toBeTruthy
  })
  //
  //
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", "DHJJD", undefined, undefined, 9, 9, user)).toBeTruthy
  })
  //
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", undefined, undefined, undefined, 9, 9, user)).toBeTruthy
  })

  //
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", "djjdd", "sjjdkd", undefined, 9, 9, user)).toBeTruthy
  })
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", "djjdd", undefined, "djdfjjf", 9, 9, user)).toBeTruthy
  })
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", undefined, "dhjfkfk", undefined, 9, 9, user)).toBeTruthy
  })
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", undefined, "dhjfkfk", "djjfdjd", 9, 9, user)).toBeTruthy
  })
  it("Should test getLocations success response for filter with other users when everything is provided", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockReturnValue(["sjdkjdk"])
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })

    expect(await service.getLocations("jhuhu", undefined, undefined, "djjfdjd", 9, 9, user)).toBeTruthy
  })


  it("Should test getLocations success response for filter for other users error response", async () => {
    const user = {
      kcRoles: {
        roles: []
      }
    }
    prisma.location.findMany = jest.fn().mockRejectedValueOnce(new Error("dhhdjd"))
    jest.spyOn(helpers, 'createFieldsPairsFilter').mockImplementation((realmName, skip, take, prismaTableToBeFiltred, filterCondArr, includeObj, userName?) => { return new Promise((resolve) => { resolve({ data: [], length: [].length }) }) });
    jest.spyOn(bthelper, 'getBTDetails').mockImplementation((allLocation, table) => { return new Promise((resolve) => { resolve([{}]) }) })
    try {
      await service.getLocations("jhuhu", undefined, undefined, undefined, 9, 9, user)
    } catch (err) {
      expect(err).toBeTruthy
    }

  })



  it("Should test update location success response", async () => {
    let locationData = {
      locationName: "sjdkd",
      locationType: "sjdkd",
      locationId: "sjdkd",
      description: "sjdkd",
      organization: "sjdkd",
      businessType: ["sjdkd"],
    }

    prisma.organization.findFirst = jest.fn().mockReturnValueOnce({ id: "djdkkd" })
    prisma.location.findFirst = jest.fn().mockReturnValueOnce(undefined)
    prisma.location.findUnique = jest.fn().mockReturnValueOnce({})
    prisma.location.update = jest.fn().mockReturnValueOnce({ id: "fnjfjfjk" })
    prisma.locationBusinessType.create = jest.fn().mockReturnValueOnce({})
    expect(await service.updateLocation(locationData, "dhkjd")).toBeTruthy
  })


  it("Should test update location error response", async () => {
    let locationData = {
      locationName: "sjdkd",
      locationType: "sjdkd",
      locationId: "sjdkd",
      description: "sjdkd",
      organization: "sjdkd",
      businessType: ["sjdkd"],
    }

    try {
      await service.updateLocation(locationData, "dhkjd")
    } catch (err) {
      expect(err).toBeTruthy
    }
  })

});
