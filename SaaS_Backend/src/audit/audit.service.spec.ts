import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { EntityService } from '../entity/entity.service';
import { LocationService } from '../location/location.service';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { AuthenticationModule } from '../authentication/authentication.module';
import { DocumentsModule } from '../documents/documents.module';
import { EntityModule } from '../entity/entity.module';
import { LocationModule } from '../location/location.module';
import { OrganizationModule } from '../organization/organization.module';
import { SystemsModule } from '../systems/systems.module';
import { UserModule } from '../user/user.module';
import { AuditService } from './audit.service';
import { Audit, AuditDocument } from './schema/audit.schema';
import {
  AuditorRating,
  AuditorRatingDocument,
} from './schema/auditorRating.schema';
import { NcComment, NcCommentDocument } from './schema/NcComment.schema';
import {
  NcWorkflowHistory,
  NcWorkflowHistoryDocument,
} from './schema/NcWorkflowHistory.schema';
import {
  Nonconformance,
  NonconformanceDocument,
} from './schema/nonconformance.schema';
import { UniqueId, UniqueIdDocument } from './schema/UniqueId.schema';
import { SystemsService } from '../systems/systems.service';
import { DocumentsService } from '../documents/documents.service';
import { Global, Module } from '@nestjs/common';
import { System, SystemSchema } from '../systems/schema/system.schema';
import { MongoMemoryServer } from "mongodb-memory-server";
import { OrganizationService } from '../organization/organization.service';

// @Global()
// @Module({
//     providers: [
//     {
//         provide: SystemsService,
//         useFactory: () => {},
//     },
//     ],
// })
// class MockModule {
// }

// jest.mock('../systems/systems.module', () => {
//   return {
//     SystemsModule: {
//       forRootAsync: jest.fn().mockImplementation(() => MockModule),
//     },
//   };
// });

jest.mock('./helpers/email.helper', () => {
  return {
    sendAuditorNcAcceptanceEmail: jest.fn().mockResolvedValue({ done: "ok"}), 
    sendMrNcAcceptanceEmail: jest.fn().mockResolvedValue({ done: "ok"}), 
    sendNcAcceptedEmail: jest.fn().mockResolvedValue({ done: "ok"}), 
    sendNcClosureEmail: jest.fn().mockResolvedValue({ done: "ok"}), 
    sendNcRaisedEmail: jest.fn().mockResolvedValue({ done: "ok"}), 
    sendNcRejectedEmail: jest.fn().mockResolvedValue({ done: "ok"}) 
  }
})

describe('AuditService', () => {
  let mongod: MongoMemoryServer;
  let mongoURI: string;

  let auditService: AuditService;
  let mockedAuditModel: any = function () {
    this._doc = mockAuditData
  };
  let mockedNonconformanceModel: any = function () {};
  let mockedNcCommentModel: any = function () {};
  let mockedNcWorkflowHistoryModel: any = function () {};
  let mockedUniqueIdModel: any = function () {};
  let mockedAuditorRatingModel: any = function () {};

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

  const mockAuditData: any = {
    _id: '62ecb21bb7a2be9fef9d977a',
    isDraft: false,
    auditName: 'asdfasdfasdfasdfa',
    auditNumber: '5a',
    auditType: '5ed63796-1caa-4154-955b-40e549c5c08b',
    system: {
      $oid: '62e77f37ce424034173b34ca',
    },
    date: '1659679200000',
    organization: 'c3d7cd44-445b-4dc8-9a71-b560d5b7d738',
    location: 'cc11e87c-1408-402a-bf13-701f881c282d',
    auditYear: '2022 - 2023',
    auditors: ['b459e8a7-181b-431c-90d6-79599ab067dc'],
    auditees: ['0a756bfc-cfcf-4b9a-b57a-c306858da5f4'],
    sections: [
      {
        title: 'Section 1',
        fieldset: [
          {
            nc: '62ecb21cb7a2be9fef9d977d',
            _id: '62e77d6062dd7bed22279e5f',
            id: 'V7j9aOm2vL',
            title: 'Question 1',
            inputType: 'numeric',
            options: [
              {
                name: 'yes',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e60',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e61',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e62',
              },
            ],
            questionScore: 10,
            score: [
              {
                name: 'gt',
                value: 5,
                score: 10,
                _id: '62e77d6062dd7bed22279e63',
              },
              {
                name: 'lt',
                value: 4,
                score: 5,
                _id: '62e77d6062dd7bed22279e64',
              },
            ],
            required: true,
            allowImageUpload: false,
            value: 8,
            hint: 'okmnepceverv',
            slider: true,
            open: false,
            image: '',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9781',
            _id: '62e77d6062dd7bed22279e66',
            id: 'Fq1jg5lBGq',
            title: 'Question 2',
            inputType: 'text',
            options: [
              {
                name: 'yes',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e67',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e68',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e69',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e6a',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e6b',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'cevevevev',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9785',
            _id: '62e77d6062dd7bed22279e6d',
            id: 'tuolnCd2Es',
            title: 'Question 3',
            inputType: 'radio',
            options: [
              {
                name: 'yes',
                value: 10,
                checked: false,
                _id: '62e77d6062dd7bed22279e6e',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e6f',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e70',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e71',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e72',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'cevcevefv',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9789',
            _id: '62e77d6062dd7bed22279e74',
            id: 'yCUfPjHf3A',
            title: 'Question 4',
            inputType: 'checkbox',
            options: [
              {
                name: 'yes',
                value: 10,
                checked: false,
                _id: '62e77d6062dd7bed22279e75',
              },
              {
                name: 'no',
                value: 5,
                checked: false,
                _id: '62e77d6062dd7bed22279e76',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e77',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e78',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e79',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'wedwed',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
        ],
        _id: '62e77d6062dd7bed22279e8a',
      },
      {
        title: 'Section 2',
        fieldset: [
          {
            nc: '62ecb21cb7a2be9fef9d978d',
            _id: '62e77d6062dd7bed22279e7b',
            id: 'bFOkeVxsFM',
            title: 'Question 1',
            inputType: 'numeric',
            options: [
              {
                name: 'yes',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e7c',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e7d',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e7e',
              },
            ],
            questionScore: 10,
            score: [
              {
                name: 'gt',
                value: 5,
                score: 10,
                _id: '62e77d6062dd7bed22279e7f',
              },
              {
                name: 'lt',
                value: 4,
                score: 5,
                _id: '62e77d6062dd7bed22279e80',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: 8,
            hint: 'qwdwcwcwcwc',
            slider: true,
            open: false,
            image: 'image url',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9791',
            _id: '62e77d6062dd7bed22279e82',
            id: '5pOs6xyfUx',
            title: 'Question 3',
            inputType: 'checkbox',
            options: [
              {
                name: 'yes',
                value: 10,
                checked: false,
                _id: '62e77d6062dd7bed22279e83',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e84',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e85',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e86',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e87',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'dwedwdwd',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
        ],
        _id: '62e77d6062dd7bed22279e8b',
      },
    ],
    totalScore: 20,
    auditedEntity: 'c0e51cce-4aa2-42d0-a133-73c6e22430a5',
    auditedClauses: [
      {
        name: 'clause one',
        id: '62e77f37ce424034173b34cb',
        number: 'cl1',
      },
    ],
    auditedDocuments: ['20014f9c-f163-48e4-8664-454ca5b0dace'],
    createdAt: 1659679260052,
    updatedAt: '1659679260052',
    __v: 0,
    _doc: {
      _id: '62ecb21bb7a2be9fef9d977a',
    isDraft: false,
    auditName: 'asdfasdfasdfasdfa',
    auditNumber: '5a',
    auditType: '5ed63796-1caa-4154-955b-40e549c5c08b',
    system: {
      $oid: '62e77f37ce424034173b34ca',
    },
    date: '1659679200000',
    organization: 'c3d7cd44-445b-4dc8-9a71-b560d5b7d738',
    location: 'cc11e87c-1408-402a-bf13-701f881c282d',
    auditYear: '2022 - 2023',
    auditors: ['b459e8a7-181b-431c-90d6-79599ab067dc'],
    auditees: ['0a756bfc-cfcf-4b9a-b57a-c306858da5f4'],
    sections: [
      {
        title: 'Section 1',
        fieldset: [
          {
            nc: '62ecb21cb7a2be9fef9d977d',
            _id: '62e77d6062dd7bed22279e5f',
            id: 'V7j9aOm2vL',
            title: 'Question 1',
            inputType: 'numeric',
            options: [
              {
                name: 'yes',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e60',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e61',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e62',
              },
            ],
            questionScore: 10,
            score: [
              {
                name: 'gt',
                value: 5,
                score: 10,
                _id: '62e77d6062dd7bed22279e63',
              },
              {
                name: 'lt',
                value: 4,
                score: 5,
                _id: '62e77d6062dd7bed22279e64',
              },
            ],
            required: true,
            allowImageUpload: false,
            value: 8,
            hint: 'okmnepceverv',
            slider: true,
            open: false,
            image: '',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9781',
            _id: '62e77d6062dd7bed22279e66',
            id: 'Fq1jg5lBGq',
            title: 'Question 2',
            inputType: 'text',
            options: [
              {
                name: 'yes',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e67',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e68',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e69',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e6a',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e6b',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'cevevevev',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9785',
            _id: '62e77d6062dd7bed22279e6d',
            id: 'tuolnCd2Es',
            title: 'Question 3',
            inputType: 'radio',
            options: [
              {
                name: 'yes',
                value: 10,
                checked: false,
                _id: '62e77d6062dd7bed22279e6e',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e6f',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e70',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e71',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e72',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'cevcevefv',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
          {
            nc: null,
            _id: '62e77d6062dd7bed22279e74',
            id: 'yCUfPjHf3A',
            title: 'Question 4',
            inputType: 'checkbox',
            options: [
              {
                name: 'yes',
                value: 10,
                checked: false,
                _id: '62e77d6062dd7bed22279e75',
              },
              {
                name: 'no',
                value: 5,
                checked: false,
                _id: '62e77d6062dd7bed22279e76',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e77',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e78',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e79',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'wedwed',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
        ],
        _id: '62e77d6062dd7bed22279e8a',
      },
      {
        title: 'Section 2',
        fieldset: [
          {
            nc: '62ecb21cb7a2be9fef9d978d',
            _id: '62e77d6062dd7bed22279e7b',
            id: 'bFOkeVxsFM',
            title: 'Question 1',
            inputType: 'numeric',
            options: [
              {
                name: 'yes',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e7c',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e7d',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e7e',
              },
            ],
            questionScore: 10,
            score: [
              {
                name: 'gt',
                value: 5,
                score: 10,
                _id: '62e77d6062dd7bed22279e7f',
              },
              {
                name: 'lt',
                value: 4,
                score: 5,
                _id: '62e77d6062dd7bed22279e80',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: 8,
            hint: 'qwdwcwcwcwc',
            slider: true,
            open: false,
            image: 'image url',
            imageName: '',
          },
          {
            nc: '62ecb21cb7a2be9fef9d9791',
            _id: '62e77d6062dd7bed22279e82',
            id: '5pOs6xyfUx',
            title: 'Question 3',
            inputType: 'checkbox',
            options: [
              {
                name: 'yes',
                value: 10,
                checked: false,
                _id: '62e77d6062dd7bed22279e83',
              },
              {
                name: 'no',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e84',
              },
              {
                name: 'na',
                value: 0,
                checked: false,
                _id: '62e77d6062dd7bed22279e85',
              },
            ],
            questionScore: 0,
            score: [
              {
                name: 'gt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e86',
              },
              {
                name: 'lt',
                value: 0,
                score: 0,
                _id: '62e77d6062dd7bed22279e87',
              },
            ],
            required: true,
            allowImageUpload: true,
            value: '',
            hint: 'dwedwdwd',
            slider: false,
            open: false,
            image: 'image url',
            imageName: '',
          },
        ],
        _id: '62e77d6062dd7bed22279e8b',
      },
    ],
    totalScore: 20,
    auditedEntity: 'c0e51cce-4aa2-42d0-a133-73c6e22430a5',
    auditedClauses: [
      {
        name: 'clause one',
        id: '62e77f37ce424034173b34cb',
        number: 'cl1',
      },
    ],
    auditedDocuments: ['20014f9c-f163-48e4-8664-454ca5b0dace'],
    createdAt: 1659679260052,
    updatedAt: '1659679260052',
    __v: 0,
    }
  };

  const createAuditDto: any = {
    "isDraft": false,
    "auditType": "5ed63796-1caa-4154-955b-40e549c5c08b",
    "system": "62e77f37ce424034173b34ca",
    "auditors": [
        {
            "id": "b459e8a7-181b-431c-90d6-79599ab067dc",
            "kcId": "f76c4259-0755-4180-8a74-4cada615c434",
            "email": "mridul1024@gmail.com",
            "username": "auditor",
            "firstname": "Mridul",
            "lastname": "auditor",
            "createdAt": "2022-08-01T07:06:06.705Z",
            "createdBy": null,
            "updatedAt": "2022-08-26T07:01:30.788Z",
            "updatedBy": null,
            "enabled": null,
            "organizationId": "c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
            "locationId": "cc11e87c-1408-402a-bf13-701f881c282d",
            "businessTypeId": "ea05f177-fc5b-4d83-a92e-867208f18a1a",
            "sectionId": "9b9c6e80-a00d-45f7-9808-2a400a409621",
            "entityId": "c0e51cce-4aa2-42d0-a133-73c6e22430a5",
            "userType": "IDP",
            "status": true,
            "avatar": "21f828f4-0a55-4244-9e5c-a5b2088221a1.jpg"
        }
    ],
    "location": "",
    "auditNumber": "12313",
    "auditYear": "2021 - 2022",
    "auditName": "Some Name Here",
    "date": "2022-08-27T12:16",
    "auditedEntity": "c0e51cce-4aa2-42d0-a133-73c6e22430a5",
    "auditees": [
        {
            "id": "0a756bfc-cfcf-4b9a-b57a-c306858da5f4",
            "kcId": "69798397-606d-4c89-b339-76c276918cf9",
            "email": "jintu@techvariable.com",
            "username": "entityhead",
            "firstname": "JIntu",
            "lastname": "Entity Head",
            "createdAt": "2022-08-01T07:02:58.463Z",
            "createdBy": null,
            "updatedAt": "2022-08-01T07:02:58.464Z",
            "updatedBy": null,
            "enabled": null,
            "organizationId": "c3d7cd44-445b-4dc8-9a71-b560d5b7d738",
            "locationId": "cc11e87c-1408-402a-bf13-701f881c282d",
            "businessTypeId": null,
            "sectionId": null,
            "entityId": "c0e51cce-4aa2-42d0-a133-73c6e22430a5",
            "userType": null,
            "status": true,
            "avatar": null,
            "assignedRole": [
                {
                    "id": "8409c72b-fc8e-4f1d-a046-3859771944d5",
                    "userId": "0a756bfc-cfcf-4b9a-b57a-c306858da5f4",
                    "roleId": "f88e41db-609a-47b3-aa34-c7006197415d",
                    "role": {
                        "id": "f88e41db-609a-47b3-aa34-c7006197415d",
                        "kcId": "514d89d5-cc9d-4c3b-9edb-bcd0c74d9f27",
                        "roleName": "ENTITY-HEAD",
                        "createdAt": "2022-08-01T06:45:03.054Z",
                        "createdBy": null,
                        "updatedAt": "2022-08-01T06:45:03.054Z",
                        "updatedBy": null,
                        "organizationId": "c3d7cd44-445b-4dc8-9a71-b560d5b7d738"
                    }
                }
            ]
        }
    ],
    "auditedClauses": [
        {
            "item": {
                "name": "clause one",
                "id": "62e77f37ce424034173b34cb",
                "number": "cl1"
            }
        },
        {
            "item": {
                "name": "clause two",
                "id": "62e77f37ce424034173b34cc",
                "number": "cl2 "
            }
        }
    ],
    "auditedDocuments": [
        {
            "item": {
                "name": "HR-1 Doc",
                "id": "20014f9c-f163-48e4-8664-454ca5b0dace",
                "number": ""
            }
        }
    ],
    "sections": [
        {
            "title": "Section 1",
            "fieldset": [
                {
                    "nc": {
                        "type": "NC",
                        "severity": "Major",
                        "clause": {
                            "id": "62e77f37ce424034173b34cb",
                            "clauseName": "clause one",
                            "clauseNumber": "cl1"
                        },
                        "comment": "fmkrgniperg"
                    },
                    "_id": "62e77d6062dd7bed22279e5f",
                    "id": "V7j9aOm2vL",
                    "title": "Question 1",
                    "inputType": "numeric",
                    "options": [
                        {
                            "name": "yes",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e60"
                        },
                        {
                            "name": "no",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e61"
                        },
                        {
                            "name": "na",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e62"
                        }
                    ],
                    "questionScore": 5,
                    "score": [
                        {
                            "name": "gt",
                            "value": 5,
                            "score": 10,
                            "_id": "62e77d6062dd7bed22279e63"
                        },
                        {
                            "name": "lt",
                            "value": 4,
                            "score": 5,
                            "_id": "62e77d6062dd7bed22279e64"
                        }
                    ],
                    "required": true,
                    "allowImageUpload": false,
                    "value": 3,
                    "hint": "okmnepceverv",
                    "slider": true,
                    "open": false,
                    "image": "",
                    "imageName": ""
                },
                {
                    "nc": {
                        "type": ""
                    },
                    "_id": "62e77d6062dd7bed22279e66",
                    "id": "Fq1jg5lBGq",
                    "title": "Question 2",
                    "inputType": "text",
                    "options": [
                        {
                            "name": "yes",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e67"
                        },
                        {
                            "name": "no",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e68"
                        },
                        {
                            "name": "na",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e69"
                        }
                    ],
                    "questionScore": 0,
                    "score": [
                        {
                            "name": "gt",
                            "value": 0,
                            "score": 0,
                            "_id": "62e77d6062dd7bed22279e6a"
                        },
                        {
                            "name": "lt",
                            "value": 0,
                            "score": 0,
                            "_id": "62e77d6062dd7bed22279e6b"
                        }
                    ],
                    "required": true,
                    "allowImageUpload": true,
                    "value": "fmwekifnowfe",
                    "hint": "cevevevev",
                    "slider": false,
                    "open": false,
                    "image": "/attachments/436fad38-7729-428a-8b87-9bd2f62edc4c.png",
                    "imageName": "www.chartjs.org_docs_latest_samples_other-charts_stacked-bar-line.html.png"
                },
                {
                    "nc": {
                        "type": "Observation",
                        "clause": "",
                        "severity": "",
                        "comment": "fwefwefwef"
                    },
                    "_id": "62e77d6062dd7bed22279e6d",
                    "id": "tuolnCd2Es",
                    "title": "Question 3",
                    "inputType": "radio",
                    "options": [
                        {
                            "name": "yes",
                            "value": 10,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e6e"
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
                    "value": "no",
                    "hint": "cevcevefv",
                    "slider": false,
                    "open": false,
                    "image": "image url",
                    "imageName": ""
                },
                {
                    "nc": {
                        "type": ""
                    },
                    "_id": "62e77d6062dd7bed22279e74",
                    "id": "yCUfPjHf3A",
                    "title": "Question 4",
                    "inputType": "checkbox",
                    "options": [
                        {
                            "name": "yes",
                            "value": 10,
                            "checked": true,
                            "_id": "62e77d6062dd7bed22279e75"
                        },
                        {
                            "name": "no",
                            "value": 5,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e76"
                        },
                        {
                            "name": "na",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e77"
                        }
                    ],
                    "questionScore": 10,
                    "score": [
                        {
                            "name": "gt",
                            "value": 0,
                            "score": 0,
                            "_id": "62e77d6062dd7bed22279e78"
                        },
                        {
                            "name": "lt",
                            "value": 0,
                            "score": 0,
                            "_id": "62e77d6062dd7bed22279e79"
                        }
                    ],
                    "required": true,
                    "allowImageUpload": true,
                    "value": "",
                    "hint": "wedwed",
                    "slider": false,
                    "open": false,
                    "image": "image url",
                    "imageName": ""
                }
            ],
            "_id": "62e77d6062dd7bed22279e8a"
        },
        {
            "title": "Section 2",
            "fieldset": [
                {
                    "nc": {
                        "type": "NC",
                        "clause": {
                            "id": "62e77f37ce424034173b34cb",
                            "clauseName": "clause one",
                            "clauseNumber": "cl1"
                        },
                        "comment": "efwfwfwf",
                        "severity": "Minor"
                    },
                    "_id": "62e77d6062dd7bed22279e7b",
                    "id": "bFOkeVxsFM",
                    "title": "Question 1",
                    "inputType": "numeric",
                    "options": [
                        {
                            "name": "yes",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e7c"
                        },
                        {
                            "name": "no",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e7d"
                        },
                        {
                            "name": "na",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e7e"
                        }
                    ],
                    "questionScore": 5,
                    "score": [
                        {
                            "name": "gt",
                            "value": 5,
                            "score": 10,
                            "_id": "62e77d6062dd7bed22279e7f"
                        },
                        {
                            "name": "lt",
                            "value": 4,
                            "score": 5,
                            "_id": "62e77d6062dd7bed22279e80"
                        }
                    ],
                    "required": true,
                    "allowImageUpload": true,
                    "value": 3,
                    "hint": "qwdwcwcwcwc",
                    "slider": true,
                    "open": false,
                    "image": "image url",
                    "imageName": ""
                },
                {
                    "nc": {
                        "type": ""
                    },
                    "_id": "62e77d6062dd7bed22279e82",
                    "id": "5pOs6xyfUx",
                    "title": "Question 3",
                    "inputType": "checkbox",
                    "options": [
                        {
                            "name": "yes",
                            "value": 10,
                            "checked": true,
                            "_id": "62e77d6062dd7bed22279e83"
                        },
                        {
                            "name": "no",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e84"
                        },
                        {
                            "name": "na",
                            "value": 0,
                            "checked": false,
                            "_id": "62e77d6062dd7bed22279e85"
                        }
                    ],
                    "questionScore": 10,
                    "score": [
                        {
                            "name": "gt",
                            "value": 0,
                            "score": 0,
                            "_id": "62e77d6062dd7bed22279e86"
                        },
                        {
                            "name": "lt",
                            "value": 0,
                            "score": 0,
                            "_id": "62e77d6062dd7bed22279e87"
                        }
                    ],
                    "required": true,
                    "allowImageUpload": true,
                    "value": "",
                    "hint": "dwedwdwd",
                    "slider": false,
                    "open": false,
                    "image": "image url",
                    "imageName": ""
                }
            ],
            "_id": "62e77d6062dd7bed22279e8b",
        }
    ],
    "questionCount": 6,
    "totalScore": 30,
    "_doc": {
      _id: "62e77d6062dd7bed22279e8b"
    }
}

  const mockUniqueId = {
    "_id": "62e797f0baecdd7da54abf1f",
    "ncId": 1103,
    "obsId": 1041,
    "__v": 0
  }

  let mockedNcData = {
    "_id": "62ecb21cb7a2be9fef9d977d",
    "id": "NC1069",
    "date":  "1659678934268",
    "audit": "62ecb21bb7a2be9fef9d977a",
    "type": "NC",
    "comment": "asdfasdfasdf",
    "clause": [
      {
        "id": "62e77f37ce424034173b34cb",
        "clauseName": "clause one",
        "clauseNumber": "cl1"
      }
    ],
    "severity": "Minor",
    "status": "CLOSED",
    "questionNumber": "0.0",
    "closureDate": {
      "$date": "1659679663243"
    },
    "document": "",
    "ncComments": [],
    "workflowHistory": [{
        "_id": "62ecb2a3b7a2be9fef9d97d9",
        "nc": "62ecb21cb7a2be9fef9d977d",
        "action": "ACCEPTED",
        "user": "0a756bfc-cfcf-4b9a-b57a-c306858da5f4",
        "createdAt": "1659679395570",
        "updatedAt": "1659679395570"
      }
    ],
    "currentlyUnder": "AUDITEE",
    "auditeeAccepted": true,
    "auditorAccepted": true,
    "mrAccepted": true,
    "createdAt": {
      "$date": "1659679260004"
    },
    "updatedAt": {
      "$date": "1659679663243"
    },
    "__v": 0,
    "correctiveAction": {
      "date": "1659679395591",
      "proofDocument": "/attachments/efba68c5-dbcc-41a2-92d8-1f12674879c6.png",
      "documentName": "Screenshot from 2022-08-04 18-07-39.png",
      "comment": "faaasdf",
      "isDraft": false,
      "_id": "62ecb2a3b7a2be9fef9d97db"
    },
    "auditorReview": {
      "date": "1659830400000",
      "comment": "wefwefwfwfefwf",
      "isDraft": false,
      "_id": "62ecb3867c8eeddd1b5428ba"
    }
  }

  let mockLocationData = {
    id: "12122",
    locationName: "Guwahati",
    locationType: "Internal",
    locationId: "LocId12"
  }

  let mockEntityData = {
    id: "12121",
    entityName: "Departement",
    description: "This is a desc.",
    entityType: "2121321313"
  }

  let mockDocumentData = {
    id: "2131313",
    doctypeId: "12312123",
    organizationId: "1231232",
    documentName: "Some Name" 
  }

  const mockAuditFilterQuery = {
    "auditYear": "2021 - 2022",
    "location": "cc11e87c-1408-402a-bf13-701f881c282d",
    "auditType": "9cf65598-4b22-4b39-8236-c78ff500aa61",
    "system": "",
    "auditor": "b459e8a7-181b-431c-90d6-79599ab067dc",
    "skip": 0,
    "limit": 25
  }

  const mockSystemData = {
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
    "createdAt":  "1659338551324",
    "updatedAt":  "1659338551324",
    "__v": 0
  }

  const mockAuditorRating = {
    "_id": "62ff1f18b941723b4e88d1b8",
    "audit":  "62ecb21bb7a2be9fef9d977a",
    "user": "b459e8a7-181b-431c-90d6-79599ab067dc",
    "rating": 3,
    "comment": "as you like",
    "ratedBy": "0a756bfc-cfcf-4b9a-b57a-c306858da5f4",
    "createdAt": "1660886808487",
    "updatedAt": "1660902097422",
  }

  const ncFilterQuery = {
    skip: 0,
    limit: 25,
    location: "cc11e87c-1408-402a-bf13-701f881c282d",
    auditType: "5ed63796-1caa-4154-955b-40e549c5c08b",
    auditor: "b459e8a7-181b-431c-90d6-79599ab067dc",
    system: "62e77f37ce424034173b34ca",
    from: "2022-08-01T00:00:00.000Z",
    to: "2022-08-31T00:00:00.000Z",
    clauseNumber: "62e77f37ce424034173b34cb",
    sort: ""
  }

  const mockNcCommentData = {
    "_id": "62ecb5c87c8eeddd1b5429f4",
    "nc": "62ecb21cb7a2be9fef9d9781",
    "comment": "asdfasdfasdfa",
    "user": "600df5d3-ad82-4122-b0aa-33d0859f6b31",
    "createdAt": "1659680200496",
    "updatedAt": "1659680200496"
  }

  const mockNcWorkflowHistory = {
    "_id":  "62ecb2a3b7a2be9fef9d97d9",
    "nc": "62ecb21cb7a2be9fef9d977d",
    "action": "ACCEPTED",
    "user": "0a756bfc-cfcf-4b9a-b57a-c306858da5f4",
    "createdAt": "1659679395570",
    "updatedAt": "1659679395570"
  }

  const mockOrgData = {
    id: "1212",
    kcId: "1232",
    organizationName: "Test Org",
    realmName: "testOrg"
  }

  const mockSystemType = {
    id: "1212",
    name: "SYstem Type 1"
  }

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    mongoURI = mongod.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoURI),
        OrganizationModule,
        LocationModule,
        UserModule,
        AuthenticationModule,
        EntityModule,
        DocumentsModule,
        SystemsModule,

      ],
      providers: [
        AuditService,
        {
          provide: getModelToken(Audit.name),
          useValue: Model,
        },
        {
          provide: getModelToken(Nonconformance.name),
          useValue: Model,
        },
        {
          provide: getModelToken(AuditorRating.name),
          useValue: Model,
        },
        {
          provide: getModelToken(NcComment.name),
          useValue: Model,
        },
        {
          provide: getModelToken(NcWorkflowHistory.name),
          useValue: Model,
        },
        {
          provide: getModelToken(UniqueId.name),
          useValue: Model,
        },
        {
          provide: PrismaService,
          useFactory: () => ({
            user: {
              findFirst: jest.fn(() => []),
            },
            organization: {
              findUnique: jest.fn(() => mockOrgData)
            }
          }),
        },
        {
          provide: LocationService,
          useFactory: () => ({
            getLocationById: jest.fn(() => mockLocationData)
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
          provide: SystemsService,
          useFactory: () => ({
              findFirst: jest.fn(() => []),
              findById: jest.fn(() => mockSystemData),
          }),
        },
        {
          provide: EntityService,
          useFactory: () => ({
            getEntityById: jest.fn(() => mockEntityData)
          }),
        },
        {
          provide: DocumentsService,
          useFactory: () => ({
            findOne: jest.fn(() => mockDocumentData)
          }),
        },
        {
          provide: OrganizationService,
          useFactory: () => ({
            getSystemTypeById: jest.fn(() => mockSystemType),
            getOrgById: jest.fn(() => mockOrgData)
          }),
        },
      ],
    })
      .overrideProvider(getModelToken(Audit.name))
      .useValue(mockedAuditModel)
      .overrideProvider(getModelToken(Nonconformance.name))
      .useValue(mockedNonconformanceModel)
      .overrideProvider(getModelToken(NcComment.name))
      .useValue(mockedNcCommentModel)
      .overrideProvider(getModelToken(UniqueId.name))
      .useValue(mockedUniqueIdModel)
      .overrideProvider(getModelToken(AuditorRating.name))
      .useValue(mockedAuditorRatingModel)
      .overrideProvider(getModelToken(NcWorkflowHistory.name))
      .useValue(mockedNcWorkflowHistoryModel)
      .compile();

    auditService = module.get<AuditService>(AuditService);
    // mockedAuditModel = module.get<Model<AuditDocument>>(
    //   getModelToken(Audit.name),
    // );
    // mockedNonconformanceModel = module.get<Model<NonconformanceDocument>>(
    //   getModelToken(Nonconformance.name),
    // );
    // mockedNcCommentModel = module.get<Model<NcCommentDocument>>(
    //   getModelToken(NcComment.name),
    // );
    // mockedNcWorkflowHistoryModel = module.get<Model<NcWorkflowHistoryDocument>>(
    //   getModelToken(NcComment.name),
    // );
    // mockedUniqueIdModel = module.get<Model<UniqueIdDocument>>(
    //   getModelToken(UniqueId.name),
    // );
    // mockedAuditorRatingModel = module.get<Model<AuditorRatingDocument>>(
    //   getModelToken(AuditorRating.name),
    // );
  });


  it('create should return create a new audit', async () => {

    mockedAuditModel.populate = function(params: any) { return mockAuditData }
    mockedAuditModel.find = function(params: any) { return this };
    mockedAuditModel.prototype.save = function() { return mockAuditData }

    mockedUniqueIdModel.findOne = function() { return mockUniqueId }
    mockedUniqueIdModel.findByIdAndUpdate = function() { return mockUniqueId }

    mockedNonconformanceModel.create = function() { return this }
    mockedNonconformanceModel.populate = function() { return mockedNcData }
    mockedNonconformanceModel.find = function() { return [mockedNcData] }
  
    const res = await auditService.create(createAuditDto, "122",{});
    expect(res).toBeTruthy();
  });

  it('findAll method should return an array audits', async () => {
    mockedAuditModel.find = function(params: any) { return [mockAuditData] };
  
    const res = await auditService.findAll("113");
    expect(res).toBeTruthy();
  });

  it('findOne method should return an audit', async () => {
    mockedAuditModel.populate = function(params: any) { return mockAuditData }
    mockedAuditModel.findById = function(params: any) { return this };
  
    const res = await auditService.findOne("113");
    expect(res).toBeTruthy();
  });

  it('update method should update an audit and return', async () => {
    mockedAuditModel.findById = function(params: any) { return mockAuditData };
    mockedAuditModel.findByIdAndUpdate = function(params: any) { return mockAuditData };

    mockedUniqueIdModel.findOne = function () { return mockUniqueId }
    mockedUniqueIdModel.findByIdAndUpdate = function () { return mockUniqueId }

    mockedNonconformanceModel.create = function() { return this }
    mockedNonconformanceModel.populate = function() { return mockedNcData }

    const res = await auditService.update("62e77f37ce424034173b34cb", createAuditDto, "112");
    expect(res).toBeTruthy();
  });

  it('remove method should delete an audit and return', async () => {
    mockedAuditModel.findByIdAndRemove = function(params: any) { return mockAuditData };
  
    const res = await auditService.remove("113");
    expect(res).toBeTruthy();
  });


  it('findAllCalendarView method should return an array of audits', async () => {
    mockedAuditModel.find = function(params: any) { return this };
    mockedAuditModel.select = function(params: any) { return mockAuditData };
  
    const res = await auditService.findAllCalendarView("113");
    expect(res).toBeTruthy();
  });
  

  it('getNcByAuditId method should return an array of ncs/obs', async () => {
    mockedNonconformanceModel.find = function(params: any) { return [mockedNcData] };
  
    const res = await auditService.getNcByAuditId("113");
    expect(res).toBeTruthy();
  });

  it('updateNcById method should update and return an ncs/obs', async () => {
    mockedNonconformanceModel.findByIdAndUpdate = function(params: any) { return mockedNcData };
  
    const res = await auditService.updateNcById("113", mockedNcData);
    expect(res).toBeTruthy();
  });
  
  it('deleteNcById method should delete and return an ncs/obs', async () => {
  
    mockedAuditModel.findById = function() { return {...mockAuditData, save: function() { return mockAuditData } } };
    mockedNonconformanceModel.findById = function() { return mockedNcData };
    mockedNonconformanceModel.findByIdAndDelete = function() { return mockedNcData };
  
    const res = await auditService.deleteNcById("113", mockUser);
    expect(res).toBeTruthy();
  });

  it('search method should return an array of audits', async () => {
    mockedAuditModel.countDocuments = function() {  return 20 }
    mockedAuditModel.aggregate = function() {  return [mockAuditData] }
    mockedNonconformanceModel.findByIdAndUpdate = function(params: any) { return mockedNcData };

    mockedAuditorRatingModel.findOne = function() { return this }
    mockedAuditorRatingModel.select = function () { return mockAuditorRating }
    mockedAuditorRatingModel.aggregate = function () { return [mockAuditorRating] }
  
    const res = await auditService.search(mockAuditFilterQuery, "1212");
    expect(res).toBeTruthy();
  });


  it("uploadAttachment method should upload image and return success", async () => {
    const file = {
      originalName: "SOme name",
      path: "/../../"
    }
      const res = await auditService.uploadAttachment(file);
      expect(res).toBeTruthy();
  })

  it("deleteAttachment method should throw an error", async () => {
    try {
      const res = await auditService.deleteAttachment("../dwd.jpg");
    }
    catch(err) {
      expect(err).toBeTruthy();
    }
  })

  it("isAuditNumberUnique method should return true", async () => {
    mockedAuditModel.find = function () { return []}
    const res = await auditService.isAuditNumberUnique("1212", "12121");
    expect(res).toBeTruthy();
  })

  it("rateAuditor method should create a auditor rating and return", async () => {
  
    mockedAuditorRatingModel.findByIdAndUpdate = function () { return mockAuditorRating }

    const rating = {
      user: "1212",
      rating: 4,
      comment: "Some text here"
    }

    const res = await auditService.rateAuditor("1212", "131313", rating);
    expect(res).toBeTruthy();
  })

  it("rateAuditor method should create a auditor rating and return", async () => {
  
    mockedAuditorRatingModel.findByIdAndUpdate = function () { return mockAuditorRating }
    mockedAuditorRatingModel.findOne = function () { return null }
    mockedAuditorRatingModel.create = function () { return mockAuditorRating }

    const rating = {
      user: "1212",
      rating: 4,
      comment: "Some text here"
    }

    const res = await auditService.rateAuditor("1212", "131313", rating);
    expect(res).toBeTruthy();
  })

  it("checkIfAuditee method returns true", async () => {
      mockedAuditModel.find = function() { return [mockAuditData]}
      const res = await auditService.checkIfAuditee("62e77f37ce424034173b34cb", "11313");
      expect(res).toBeTruthy();
  })

  it("checkIfAuditor method returns true", async () => {
    mockedAuditModel.find = function() { return [mockAuditData]}
    const res = await auditService.checkIfAuditor("62e77f37ce424034173b34cb", "11313");
    expect(res).toBeTruthy();
  })

  it("filterNcSummary method returns an array of NCs / Obs", async () => {

    mockedNonconformanceModel.countDocuments = function () { return 10 };
    mockedNonconformanceModel.aggregate = function () { return this };
    mockedNonconformanceModel.lookup = function() { return [ {...mockedNcData, audit: [mockAuditData] } ] }

    const res = await auditService.filterNcSummary(ncFilterQuery, "12131");
    expect(res).toBeTruthy();
  })

  it("getNcById method returns an NC/Obs", async () => {

    mockedNonconformanceModel.findById = function () { return this };
    mockedNonconformanceModel.populate = function() { return this }
    mockedNonconformanceModel.toObject = function() { return  {...mockedNcData, audit: mockAuditData } }

    const res = await auditService.getNcById("12131");
    expect(res).toBeTruthy();
  })

  it("createNewNcComment method create a new comment returns", async () => {
      mockedNcCommentModel.create = function() { return this }
      mockedNcCommentModel.toObject = function() { return mockNcCommentData }

      const res = await auditService.createNewNcComment("1212", "Comment string", "123123");
  })

  it("createNewNcComment method should throw error", async () => {
    try {
      mockedNcCommentModel.create = function() { return this }
      mockedNcCommentModel.toObject = function() { return mockNcCommentData }
  
      mockedNonconformanceModel.findByIdAndUpdate = function() { return false }
      const res = await auditService.createNewNcComment("1212", "Comment string", "123123");  
    }
    catch(err) {
      expect(err).toBeTruthy();
    }
  })

  it("createNewNcComment method should throw error", async () => {
    try {
      mockedNcCommentModel.create = function() { return this }
      mockedNcCommentModel.toObject = function() { return mockNcCommentData }
  
      mockedNonconformanceModel.findByIdAndUpdate = function() { return false }
      const res = await auditService.createNewNcComment("1212", "Comment string", "123123");  
    }
    catch(err) {
      expect(err).toBeTruthy();
    }
  })

  it("ncAcceptHandler method by MR", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["MR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: false, 
      userId: "123123", 
      date: "12-12-2022"
    }

    mockedAuditModel.findById = function() {  return this }
    mockedAuditModel.toObject = function() { return mockAuditData}

    mockedNcWorkflowHistoryModel.create = function() { return mockNcWorkflowHistory }

    const res = await auditService.ncAcceptHandler("62ecb21cb7a2be9fef9d9781", user, body);
    
  })

  it("ncAcceptHandler method by AUDITEE and DRAFT", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["MR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: true, 
      userId: "123123", 
      date: "12-12-2022"
    }

    mockedAuditModel.findById = function() {  return this }
    mockedAuditModel.toObject = function() { return mockAuditData}

    mockedNcWorkflowHistoryModel.create = function() { return mockNcWorkflowHistory }

    const res = await auditService.ncAcceptHandler("62ecb21cb7a2be9fef9d9781", user, body);
    
  })


  it("ncAcceptHandler method by Auditor", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["AUDITOR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: false, 
      userId: "123123", 
      date: "12-12-2022"
    }

    mockedAuditModel.findById = function() {  return this }
    mockedAuditModel.toObject = function() { return mockAuditData}

    mockedNcWorkflowHistoryModel.create = function() { return mockNcWorkflowHistory }

    const res = await auditService.ncAcceptHandler("62ecb21cb7a2be9fef9d9781", user, body);

  })

  it("ncRejectHandler method should reject as a AUditee", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["GENERAL-USER"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: false, 
      userId: "123123", 
      date: "12-12-2022"
    }

    mockedAuditModel.findById = function() { return mockAuditData }
    mockedNcWorkflowHistoryModel.prototype.save = function() { return mockNcWorkflowHistory }
    
    const res = await auditService.ncRejectHandler("62ecb21cb7a2be9fef9d9781", user, body);
    expect(res).toBeTruthy();
  })

  it("ncRejectHandler method should reject as a MR", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["MR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: false, 
      userId: "123123", 
      date: "12-12-2022"
    }

    mockedAuditModel.findById = function() { return mockAuditData }
    mockedAuditModel.find = function() { return [] }
    mockedNcWorkflowHistoryModel.prototype.save = function() { return mockNcWorkflowHistory }
    
    const res = await auditService.ncRejectHandler("62ecb21cb7a2be9fef9d9781", user, body);
    expect(res).toBeTruthy();
  })


  it("ncCloseHandler method closes an NC", async () => {
    
    const user = {
      id: "11313",
      kcRoles: {
        roles:["MR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: false, 
      userId: "123123", 
      date: "12-12-2022"
    }

    mockedNcData.currentlyUnder = "MR";

    mockedNonconformanceModel.findById = function() { return mockedNcData }
    mockedNonconformanceModel.findByIdAndUpdate = function () { return { _id: "62ecb21cb7a2be9fef9d9781" } }
    mockedNonconformanceModel.populate = function() { return this }
    mockedNonconformanceModel.toObject = function() { return  {...mockedNcData, audit: mockAuditData } }

    mockedNcWorkflowHistoryModel.prototype.save = function() { return mockNcWorkflowHistory}

    try {
      const res = await auditService.ncCloseHandler("62ecb21cb7a2be9fef9d9781", user, body);
      expect(res).toBeTruthy();
    }
    catch(err) {

    }

  })

  it("obsSubmitHandler method should update and nc and return", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["AUDITOR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: false, 
      userId: "123123", 
      date: "12-12-2022"
    }

    const res = await auditService.obsSubmitHandler("62ecb21cb7a2be9fef9d9781", user, body);
  })

  it("obsSubmitHandler method should update and nc and return as draft", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["AUDITOR"]
      }
    }

    const body = {
      proofDocument: "Some thing here", 
      documentName: "Doc Name", 
      comment: "Some string", 
      isDraft: true, 
      userId: "123123", 
      date: "12-12-2022"
    }

    const res = await auditService.obsSubmitHandler("62ecb21cb7a2be9fef9d9781", user, body);
  })

  it("getNcUniqueId method shoukd return a new NC Uid", async () => {

    mockedUniqueIdModel.findOne = function() { return null }
    mockedUniqueIdModel.prototype.save = function() { return mockUniqueId }

    const res = await auditService.getNcUniqueId();
    expect(res).toBeTruthy();
  })

  it("getObsUniqueId method shoukd return a new OBS Uid", async () => {

    mockedUniqueIdModel.findOne = function() { return null }
    mockedUniqueIdModel.prototype.save = function() { return mockUniqueId }

    const res = await auditService.getObsUniqueId();
    expect(res).toBeTruthy();
  })


  it("ncBtnStatusHandler by MR", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["MR"]
      }
    }

    mockedNcData.currentlyUnder = "MR";
    mockedNonconformanceModel.findById = function () { return mockedNcData };

    const res = await auditService.ncBtnStatusHandler("62ecb21cb7a2be9fef9d9781", user, "12121");
  })

  it("ncBtnStatusHandler by MR and auditorAccepted- false", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["MR"]
      }
    }

    mockedNcData.currentlyUnder = "MR";
    mockedNcData.auditorAccepted = false
    mockedNonconformanceModel.findById = function () { return mockedNcData };

    const res = await auditService.ncBtnStatusHandler("62ecb21cb7a2be9fef9d9781", user, "12121");
  })

  it("ncBtnStatusHandler by AUDITEE", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["AUDITEE"]
      }
    }

    mockedNcData.currentlyUnder = "AUDITEE";
    mockedNonconformanceModel.findById = function () { return mockedNcData };

    const res = await auditService.ncBtnStatusHandler("62ecb21cb7a2be9fef9d9781", user, "12121");
  })

  it("ncBtnStatusHandler by MR", async () => {
    const user = {
      id: "11313",
      kcRoles: {
        roles:["AUDITOR"]
      }
    }

    mockedNcData.currentlyUnder = "AUDITOR";
    mockedNonconformanceModel.findById = function () { return mockedNcData };

    const res = await auditService.ncBtnStatusHandler("62ecb21cb7a2be9fef9d9781", user, "12121");
  })


})

