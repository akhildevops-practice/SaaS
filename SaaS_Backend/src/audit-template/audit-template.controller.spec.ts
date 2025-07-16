import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuthenticationService } from '../authentication/authentication.service';
import { AuditTemplateController } from './audit-template.controller';
import { AuditTemplateService } from './audit-template.service';
import { CreateAuditTemplateDto } from './dto/create-audit-template.dto';
import { AuditTemplate, AuditTemplateSchema } from './schema/audit-template.schema';

describe('AuditTemplateController', () => {
  let controller: AuditTemplateController;

  const mockTemplateData: CreateAuditTemplateDto = {
    organizationId: "1",
    publishedDate: "16 June 2022",
    createdBy: "Mintu",
    title: "SOme title",
    isDraft: true,
    sections: [{
      id: "1",
      title: "Question Here",
      fieldset: [{
        inputType: "numeric",
        open: false,
        allowImageUpload: false,
        hint: "Some Hint text",
        required: true,
        title: "SOme title Here",
        value: 0
      }]
    }]
  };

  const mockedRequest: any = {
    user: {
      id: "12"
    }
  }

  let mockAuditTemplateService = {
    create: jest.fn((data, res, token) => {
      return mockTemplateData;
    }),

    findAll: jest.fn((data, res, token) => {
      return [mockTemplateData, mockTemplateData]
    }),

    findOne: jest.fn((data, res, token) => {
      return mockTemplateData;
    }),
    update: jest.fn((data, res, token) => {
      return mockTemplateData
    }),
    remove: jest.fn((data, res, token) => {
      return mockTemplateData;
    }),
    findTemplateByName: jest.fn((data, res, token) => {
      return [mockTemplateData];
    }),
    getTemplateSuggestions: jest.fn((data, res, token) => {
      return [mockTemplateData];
    }),
    searchTemplate: jest.fn((data, res, token) => {
      return [mockTemplateData];
    }),
    ifNameUnique: jest.fn((data, res, token) => {
      return true;
    }),
    isTemplateUnique: jest.fn((data, res, token) => {
      return true;
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
      AuthenticationModule],
      controllers: [AuditTemplateController],
      providers: [AuditTemplateService],
    }).overrideProvider(AuditTemplateService).useValue(mockAuditTemplateService).compile();

    controller = module.get<AuditTemplateController>(AuditTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe("create Audit Template", () => {
    
    it("Create action audit template should work", () => {
      expect(controller.create(mockTemplateData, mockedRequest)).toBeTruthy();
    })

  })

  describe("Find Audit Template", () => {
    
    it("Find action audit template should work", () => {
      expect(controller.findAll(1,2, mockedRequest)).toBeTruthy();
    })

  })

  describe("Find All Audit Template", () => {
    
    it("Find All action audit template should work", () => {
      expect(controller.findOne("123")).toBeTruthy();
    })

  })

  describe("Find One Audit Template", () => {
    
    it("Find All action audit template should work", () => {
      expect(controller.findOne("123")).toBeTruthy();
    })

  })

  describe("Update Audit Template", () => {
    
    it("Find All action audit template should work", () => {
      expect(controller.update("123", mockTemplateData)).toBeTruthy();
    })

  })

  describe("Delete Audit Template", () => {
    
    it("Find All action audit template should work", () => {
      expect(controller.remove("123")).toBeTruthy();
    })

  })

  describe("Find  Audit Template By Name", () => {
    
    it("Find All action audit template should work", () => {
      expect(controller.ifNameUnique("mintut", mockedRequest)).toBeDefined()
    })

  
    it("Get all suggestions", () => {
      expect(controller.getSuggestions(mockedRequest)).toBeDefined()
    })

    it("searchTemplate", () => {
      expect(controller.searchTemplate(mockedRequest, "title", "createdBy", 1, 0)).toBeTruthy()
    })
    
  })

});
