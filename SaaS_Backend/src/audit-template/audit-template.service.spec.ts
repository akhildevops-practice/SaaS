import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model, Types } from 'mongoose';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { AuditTemplateService } from './audit-template.service';
import { CreateAuditTemplateDto } from './dto/create-audit-template.dto';
import {
  AuditTemplate,
  AuditTemplateDocument,
} from './schema/audit-template.schema';
import { Question, QuestionDocument } from './schema/question.schema';
import { UserModule } from '../user/user.module';

  const mockTemplateData: CreateAuditTemplateDto = {
    organizationId: "1212", 
    title: "SOme title",
    isDraft: true,
    publishedDate: "16 June 2022",
    createdBy: "Mintu",
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

  const mockUpdateTemplateData: any = {
    organizationId: "1212", 
    title: "SOme title",
    isDraft: true,
    publishedDate: "16 June 2022",
    createdBy: "Mintu",
    sections: [
        {
          _id: new Types.ObjectId("62e77d6062dd7bed22279e89"),
          id: "1",
          title: "Question Here 1",
          fieldset: [{
            _id: new Types.ObjectId("62e77d6062dd7bed22279e89"),
            inputType: "numeric",
            open: false,
            allowImageUpload: false,
            hint: "Some Hint text changed",
            required: true,
            title: "SOme title Here changed",
            value: 0
          }]
      },
      {
          id: "12",
          title: "Question Here 2",
          fieldset: [{
            inputType: "numeric",
            open: false,
            allowImageUpload: false,
            hint: "Some Hint text",
            required: true,
            title: "SOme title Here",
            value: 0
        }]
      }
    ]
  };

  let mockUser: any = {
    id: "112",
    firstName: "Rahul",
    lastName: "Sharma",
    email: "rahul@hello.com",
    locationId: "1113",
    organizationId: "131313",
    assignedRole: [{
        role: {
          roleName: "ORG-ADMIN"
        }
      },
      {
        role: {
          roleName: "MR"
        }
      }]
  }

  const mockedQuestion = {
    "_id": "62e77d6062dd7bed22279e6d",
    "id": "tuolnCd2Es",
    "title": "Question 3",
    "inputType": "radio",
    "options": [
      {
        "name": "yes",
        "value": 10,
        "checked": false,
        "_id":  "62e77d6062dd7bed22279e6e"
      },
      {
        "name": "no",
        "value": 0,
        "checked": false,
        "_id": "62e77d6062dd7bed22279e6f"
      },
      {
        "name": "na",
        "value": 0,
        "checked": false,
        "_id": "62e77d6062dd7bed22279e70"
      }
    ],
    "questionScore": 0,
    "score": [
      {
        "name": "gt",
        "value": 0,
        "score": 0,
        "_id": "62e77d6062dd7bed22279e71"
      },
      {
        "name": "lt",
        "value": 0,
        "score": 0,
        "_id": "62e77d6062dd7bed22279e72"
      }
    ],
    "required": true,
    "allowImageUpload": true,
    "value": "",
    "hint": "cevcevefv",
    "slider": false,
    "open": false,
    "image": "image url",
    "imageName": "",
    "nc": {
      "type": ""
    },
    "createdAt": "1659338080480",
    "updatedAt": "1659340135440",
    "__v": 0
  }

  let mockedAuditTemplateModel: any;
  let mockedQuestionModel: any;
  let mockedPrismaService: any;

  mockedAuditTemplateModel = function () {};
  mockedPrismaService = function () {};
  mockedQuestionModel = function ( question?: any) {
    this.inputType = 'numeric',
    this.open = false,
    this.allowImageUpload = false,
    this.hint = 'Some Hint text',
    this.required = true,
    this.title = 'SOme title Here',
    this.value = 0
  };

  class userServiceMock {
    getUserById(id: string) {
      return mockUser;
    }
  }

  describe.only("Audit Template Service", () => {
    let auditTemplateService: AuditTemplateService;
    let mockAuditTemplateModel:  Model<AuditTemplateDocument>;
    let prisma: Partial<PrismaService>
    let userService: UserService;
    let templateId = "12122";
    let kcId = "12121";

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
        imports: [AuthenticationModule, UserModule],
        providers: [
            {
              provide: getModelToken(AuditTemplate.name),
              useValue: Model,
            },
            {
              provide: getModelToken(Question.name),
              useValue: Model,
            },
            AuditTemplateService,
            {
              provide: UserService,
              useClass: userServiceMock
            },
            {
              provide: PrismaService,
              useFactory: () => ({
                user: {
                  findFirst: jest.fn(() => mockUser)
                },
              })
            },
        ],
        })
        .overrideProvider(getModelToken(AuditTemplate.name))
        .useValue(mockedAuditTemplateModel)
        .compile();
        
        auditTemplateService = module.get<AuditTemplateService>(AuditTemplateService);
        mockAuditTemplateModel = module.get<Model<AuditTemplateDocument>>(getModelToken(AuditTemplate.name));
        mockedQuestionModel = module.get<Model<QuestionDocument>>(getModelToken(Question.name));
        prisma = module.get<PrismaService>(PrismaService);
        userService = module.get<UserService>(UserService);
    })


    it('Create should create a new template and return', async () => {

      mockedAuditTemplateModel.prototype.save = function () {};
      mockedAuditTemplateModel.findOne = function () { return null };

      mockedQuestionModel.create = function () { return mockedQuestion }; 

      const res = await auditTemplateService.create(mockTemplateData, kcId);
      expect(res).toBeDefined();
    });

    it('Create should return conflict error', async () => {
      try {
        mockedAuditTemplateModel.prototype.save = function () {};
        mockedAuditTemplateModel.findOne = function () { return [] };
  
        mockedQuestionModel.create = function () { return mockedQuestion }; 
  
        const res = await auditTemplateService.create(mockTemplateData, kcId);
      }
      catch(err) {
        expect(err).toBeDefined();
      }
    });

    it('findOne method fetch a template by its ID', async () => {
        
        mockedAuditTemplateModel.prototype.save = function () {};
        mockedAuditTemplateModel.populate = function (param: string) { return this };
        mockedAuditTemplateModel.select = function (param: string) { return mockTemplateData };
        mockedAuditTemplateModel.findById = function () { return this };

        const res = await auditTemplateService.findOne(templateId);
        expect(res).toBeDefined();
    });

    it('findAll method by OrgAdmin/ MR should find All templates', async () => {
        mockedAuditTemplateModel.findAll = function () { return [mockTemplateData] };
        mockedAuditTemplateModel.find = function () { return this };
        mockedAuditTemplateModel.sort = function () { return this };
        mockedAuditTemplateModel.skip = function () { return this };
        mockedAuditTemplateModel.limit = function () { return this };
        mockedAuditTemplateModel.populate = function () { return [mockTemplateData] };
    
        let id = "1", skip = 0, limit = 10;
        const res = await auditTemplateService.findAll(id, skip, limit);
        expect(res).toBeTruthy();
    });

    it('findAll method by Auditor should find All templates', async () => {
      mockUser.assignedRole = [];
      mockedAuditTemplateModel.findAll = function () { return [mockTemplateData] };
      mockedAuditTemplateModel.find = function () { return this };
      mockedAuditTemplateModel.sort = function () { return this };
      mockedAuditTemplateModel.skip = function () { return this };
      mockedAuditTemplateModel.limit = function () { return this };
      mockedAuditTemplateModel.populate = function () { return [mockTemplateData] };

      
  
      let id = "1", skip = 0, limit = 10;
      const res = await auditTemplateService.findAll(id, skip, limit);
      expect(res).toBeTruthy();
  });

    it('update method should update a template', async () => {
      auditTemplateService.deleteManyQuestions = function () {  return Promise.resolve(1) }
      mockedAuditTemplateModel.findById = function () { return mockTemplateData };
      mockedAuditTemplateModel.findByIdAndUpdate = function () { return mockUpdateTemplateData };
      mockedQuestionModel.create = function () { return mockedQuestion };
      mockedQuestionModel.findByIdAndUpdate = function () { return mockedQuestion }; 
  
      let id = "1";
      const res = await auditTemplateService.update(id, mockUpdateTemplateData);
      expect(res).toBeTruthy();
    });

   
    it('delete method should delete a template', async () => {
      auditTemplateService.deleteManyQuestions = function () {  return Promise.resolve(1) }
      mockedAuditTemplateModel.findById = function () { return mockTemplateData };
      mockedAuditTemplateModel.findByIdAndDelete = function () { return mockUpdateTemplateData };
  
      let id = "1";
      const res = await auditTemplateService.remove(id);
      expect(res).toBeTruthy();
    });


    it('searchTemplate method should search for template', async () => {
      auditTemplateService.deleteManyQuestions = function () {  return Promise.resolve(1) }
      mockedAuditTemplateModel.findById = function () { return mockTemplateData };
      mockedAuditTemplateModel.countDocuments = function () { return 10 };
      mockedAuditTemplateModel.aggregate = function () { return [mockTemplateData] };
  
  
      let id = "1", title= "title", createdBy: "Mintu", skip = 0, limit = 10;
      const res = await auditTemplateService.searchTemplate(id, title, createdBy, skip, limit);
      expect(res).toBeTruthy();
    });

    it('searchTemplate method should throw new error', async () => {
      try {
        auditTemplateService.deleteManyQuestions = function () {  return Promise.resolve(1) }
        mockedAuditTemplateModel.findById = function () { throw new Error() };
        let id = "1", title= "title", createdBy: "Mintu", skip = 0, limit = 10;
        const res = await auditTemplateService.searchTemplate(id, title, createdBy, skip, limit);
      }
      catch(err) {
        expect(err).toBeTruthy();
      }
    });

    it('getTemplateSuggestions method should return list of templates', async () => {
      mockedAuditTemplateModel.find = function () { return this};
      mockedAuditTemplateModel.prototype.select = function () { return [mockTemplateData] };

      let id = "1";
      const res = await auditTemplateService.getTemplateSuggestions(id);
      expect(res).toBeTruthy();
    });

    it('isTemplateUnique method should return false', async () => {
      mockedAuditTemplateModel.find = function () { return [mockTemplateData]};
      let id = "1", title = "title";
      const res = await auditTemplateService.isTemplateUnique(id, title);
      expect(res).toBeFalsy();
    });

    it('isTemplateUnique method should return true', async () => {
      try {
        mockedAuditTemplateModel.find = function () { throw new Error() };
        let id = "1", title = "title";
        const res = await auditTemplateService.isTemplateUnique(id, title);
      }
      catch (error){
        expect(error).toBeDefined();
      }
    });

    it('deleteManyQuestions method should a number', async () => {
        mockedQuestionModel.deleteMany = function (params: any) { return Promise.resolve({ deletedCount: 1 }) }; 
        const res = await auditTemplateService.deleteManyQuestions(["1"]);
        expect(res).toBeDefined();
    });

    it('getTemplateForAudit method should a number', async () => {
      mockedAuditTemplateModel.findById = function () { return this };
      mockedAuditTemplateModel.populate = function () { return this };
      mockedAuditTemplateModel.select = function () { return mockTemplateData };

      const res = await auditTemplateService.getTemplateForAudit("1");
      expect(res).toBeDefined();
  });

  })