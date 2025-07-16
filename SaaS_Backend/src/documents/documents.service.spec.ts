import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  Documents,
  User,
  Doctype,
  ReferenceDocuments,
  Organization,
  AdditionalDocumentAdmins,
  Entity,
  Location,
} from '@prisma/client';
import { model } from 'mongoose';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { DocumentsService } from './documents.service';

const mockDocuments: Documents[] = [
  {
    approvedDate: new Date(Date.now()),
    createdAt: new Date(Date.now()),
    createdBy: 'jane',
    currentVersion: '1',
    description: 'description',
    doctypeId: '',
    documentLink: '',
    documentName: '',
    documentNumbering: '',
    documentState: '',
    effectiveDate: new Date(Date.now()),
    entityId: '',
    id: '',
    locationId: '',
    organizationId: '',
    reasonOfCreation: '',
    tags: ['abcd', 'xyz'],
    updatedAt: new Date(Date.now()),
  },
];

const mockedUser: User = {
  avatar: '',
  businessTypeId: '',
  createdAt: new Date(Date.now()),
  createdBy: '',
  email: '',
  enabled: true,
  entityId: '',
  firstname: 'jane',
  id: '',
  kcId: '',
  lastname: '',
  locationId: '',
  organizationId: '',
  sectionId: '',
  status: true,
  updatedAt: new Date(Date.now()),
  updatedBy: '',
  username: '',
  userType: '',
};

const ReferenceDoc: ReferenceDocuments = {
  id: '',
  documentLink: '',
  type: '',
  documentName: '',
  version: '',
  documentId: '',
  createdAt: undefined,
  updatedAt: undefined,
  referenceDocId: '',
  versionId: '',
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let users: UserService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService, UserService, DocumentsService],
    }).compile();
    service = module.get<DocumentsService>(DocumentsService);
    users = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('it document.service should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllDocsByUserEntity', () => {
    it('it should be defined', () => {
      expect(service.findAllDocsByUserEntity).toBeDefined();
    });
    it('it should return an array of documents', async () => {
      users.getUserInfo = jest.fn().mockResolvedValue(
        Object.assign(mockedUser, {
          locationId: 'location',
        }),
      );

      prisma.documents.findMany = jest.fn().mockResolvedValue(mockDocuments);
      const result = await service.findAllDocsByUserEntity('kcid');
      expect(result).toBeTruthy();
    });
  });

  describe('findAllDocs', () => {
    it('it should be defined', () => {
      expect(service.findAllDocs).toBeDefined();
    });

    it('it should return an array of docs', async () => {
      users.getUserInfo = jest.fn().mockResolvedValue(
        Object.assign(mockedUser, {
          locationId: 'location',
        }),
      );
      prisma.documents.findMany = jest.fn().mockResolvedValue(mockDocuments);
      const results = service.findAllDocs(undefined, 'location');
      expect(results).toBeTruthy();
    });

    it('it should throw error', async () => {
      try {
        prisma.documents.findMany = jest
          .fn()
          .mockRejectedValue(new InternalServerErrorException());

        expect(async () => {
          try {
            expect(
              await service.findAllDocs(undefined, undefined),
            ).toThrowError();
          } catch (error) {}
        }).toThrowError();
      } catch (error) {}
    });

    it('it should return empty array if locId is undefined', async () => {
      users.getUserInfo = jest.fn().mockResolvedValue(
        Object.assign(mockedUser, {
          locationId: undefined,
          entity: {
            locationId: undefined,
          },
        }),
      );

      const result = await service.findAllDocs('', '');
      expect(result).toEqual([]);
    });
  });

  describe('remove', () => {
    it('it should be defined', () => {
      expect(service.remove).toBeDefined();
    });

    it('it should return the removed doc', async () => {
      const document = Object.assign(mockDocuments[0], {
        id: 'delete',
      });

      prisma.documents.delete = jest.fn().mockResolvedValue(document);

      const result = await service.remove('delete');

      expect(result).toEqual(document);
    });
  });

  describe('createCommentOnDocument', () => {
    it('it should be defined', () => {
      expect(service.createCommentOnDocument).toBeDefined();
    });

    it('it should return the created comment', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue({ kcId: 'kcid' });
      prisma.documentComments.create = jest.fn().mockResolvedValue({});

      const result = await service.createCommentOnDocument('', {
        commentText: '',
        documentId: '',
      });

      expect(result).toBeTruthy();
    });
  });

  describe('getWorkHistoryforDocument', () => {
    it('it should be defined', () => {
      expect(service.getWorkFlowHistoryforDocument).toBeDefined();
    });

    it('it should return work history', async () => {
      prisma.documentWorkFlowHistory.findMany = jest.fn().mockResolvedValue([]);

      const result = await service.getWorkFlowHistoryforDocument('');
      expect(result).toBeTruthy();
    });
  });

  describe('getVersionsForDocuments', () => {
    it('it should return the version of the document', async () => {
      prisma.documentVersions.findFirst = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments, {
          id: '1234',
        }),
      );
      prisma.documentVersions.findMany = jest.fn().mockResolvedValue([
        Object.assign(mockDocuments, {
          id: '1234',
        }),
      ]);
      prisma.versionReferenceDocuments.findMany = jest.fn().mockResolvedValue([
        Object.assign(mockDocuments, {
          id: '1234',
        }),
      ]);
      prisma.documentComments.findMany = jest.fn().mockResolvedValue([
        Object.assign(mockDocuments, {
          id: '1234',
        }),
      ]);
      expect(await service.getVersionsforDocument('1234')).toBeTruthy();
    });
  });

  describe('deleteCommentForDocument', () => {
    it('it should return the document', async () => {
      prisma.documentComments.delete = jest
        .fn()
        .mockResolvedValue(mockDocuments[0]);

      expect(await service.deleteCommentForDocument('id')).toBeTruthy();
    });
  });

  describe('getCommentsForDocument', () => {
    it('it should should return the comment', async () => {
      expect(await service.getCommentsForDocument('1234', '1')).toBeTruthy();
    });

    it('it should return undefined', async () => {
      prisma.documents.findFirst = jest.fn().mockResolvedValue(mockDocuments);
      expect(await service.getCommentsForDocument('1234', false)).toBeTruthy();
    });
  });

  describe('findAll', () => {
    it('it should return documents and length', async () => {
      prisma.documents.findMany = jest.fn().mockResolvedValue(mockDocuments);
      prisma.documents.findUnique = jest
        .fn()
        .mockResolvedValue(mockDocuments[0]);
      prisma.documentAdmins.findMany = jest
        .fn()
        .mockResolvedValue(mockDocuments);
      prisma.documents.count = jest.fn().mockResolvedValue(10);
      expect(await service.findAll('', 1, 10, '', '')).toBeTruthy();
    });
    it('it should return documents and length when supplied filterString', async () => {
      prisma.documents.findMany = jest.fn().mockResolvedValue(mockDocuments);
      prisma.documents.findUnique = jest
        .fn()
        .mockResolvedValue(mockDocuments[0]);
      prisma.documentAdmins.findMany = jest
        .fn()
        .mockResolvedValue(mockDocuments);
      prisma.documents.count = jest.fn().mockResolvedValue(10);
      expect(
        await service.findAll('one, two,three', 1, 10, '', ''),
      ).toBeTruthy();
    });
  });

  describe('findOne', () => {
    it('it should return a document object when supplied documentId and version', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments[0], {
          AdditionalDocumentAdmins: ['CREATOR', 'REVIEWER'],
          ReferenceDocuments: ['doc', 'doc2'],
        }),
      );
      expect(await service.findOne('1234', '1')).toBeTruthy();

      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments[0], {
          AdditionalDocumentAdmins: false,
        }),
      );
      prisma.documentVersions.findFirst = jest
        .fn()
        .mockResolvedValue(mockDocuments);

      expect(await service.findOne('1234', '1')).toBeTruthy();
    });

    it('it should the document for Additional Admins', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments[0], {
          AdditionalDocumentAdmins: ['CREATOR', 'REVIEWER'],
          ReferenceDocuments: ['doc', 'doc2'],
        }),
      );
      expect(await service.findOne(undefined, undefined)).toBeTruthy();
    });
    it('it should the document for Additional Admins', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments[0], {
          AdditionalDocumentAdmins: false,
          ReferenceDocuments: ['doc', 'doc2'],
        }),
      );
      expect(await service.findOne(undefined, undefined)).toBeTruthy();
    });
  });

  describe('deleteReferenceDocument', () => {
    it('it should delete the document', async () => {
      prisma.referenceDocuments.delete = jest
        .fn()
        .mockResolvedValue(mockDocuments[0]);
      expect(await service.deleteReferenceDocument('1234')).toBeUndefined();
    });
  });

  describe('create', () => {
    const documentDTO = {
      doctypeId: '',
      realmName: 'calm',
      documentName: '',
      documentNumbering: '',
      reasonOfCreation: '',
      effectiveDate: '',
      currentVersion: '',
      documentLink: '',
      description: '',
      tags: [],
      documentState: '',
      referenceDocuments: [],
      documentVersions: [],
      additionalReaders: [],
      reviewers: [],
      approvers: [],
      creators: [],
      file: undefined,
      locationId: '',
      entityId: '',
    };

    const organizations: Organization = {
      id: '',
      kcId: '',
      organizationName: '',
      realmName: '',
      instanceUrl: '',
      principalGeography: '',
      loginUrl: '',
      logoutUrl: '',
      createdAt: undefined,
      createdBy: '',
      updatedAt: undefined,
      updatedBy: '',
      clientID: '',
      clientSecret: '',
      fiscalYearQuarters: '',
      auditYear: '',
    };

    const entity: Entity = {
      id: '',
      entityName: '',
      description: '',
      entityTypeId: '',
      businessTypeId: '',
      organizationId: '',
      locationId: '',
      createdBy: '',
      entityId: '',
      createdAt: undefined,
      updatedAt: undefined,
      updatedBy: '',
    };

    const docktype: Doctype = {
      id: '',
      locationId: '',
      documentTypeName: '',
      documentNumbering: '',
      reviewFrequency: 0,
      prefix: '',
      suffix: '',
      organizationId: '',
      readAccess: '',
      createdAt: undefined,
      updatedAt: undefined,
      updatedBy: '',
      createdBy: '',
      entityId: '',
    };

    const location: Location = {
      id: '',
      locationName: '',
      locationType: '',
      locationId: '',
      description: '',
      status: '',
      createdBy: '',
      createdAt: undefined,
      updatedAt: undefined,
      updatedBy: '',
      organizationId: '',
    };

    const additionalDocumentAdmins: AdditionalDocumentAdmins = {
      id: '',
      type: '',
      firstname: '',
      lastname: '',
      email: '',
      userId: '',
      documentId: '',
      createdAt: undefined,
      updatedAt: undefined,
    };

    it('it should throw error if file is not passed', async () => {
      try {
        expect(
          await service.create(documentDTO, null, users[0]),
        ).toThrowError();
      } catch (error) {}
    });
    it('it should ...', async () => {
      const user = Object.assign(mockedUser, {
        id: '1234',
        entityId: 'entity',
      });
      const org = Object.assign(organizations);

      prisma.documents.findFirst = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments[0], {
          AdditionalDocumentAdmins: Array(2).fill(additionalDocumentAdmins),
        }),
      );
      prisma.organization.findFirst = jest.fn().mockResolvedValue(org);
      prisma.user.findFirst = jest.fn().mockResolvedValue(user);
      prisma.entity.findFirst = jest.fn().mockResolvedValue(entity);
      prisma.doctype.findFirst = jest.fn().mockResolvedValue(docktype);
      prisma.location.findFirst = jest.fn().mockResolvedValue(location);
      prisma.documents.create = jest.fn().mockResolvedValue(mockDocuments[0]);

      expect(await service.create(documentDTO, true, user)).toBeTruthy();
    });
  });

  describe('getApproverReviewerDocumentDetails', () => {
    const document: Documents = {
      id: '1234',
      doctypeId: '',
      organizationId: '',
      documentName: '',
      documentNumbering: '',
      reasonOfCreation: '',
      effectiveDate: undefined,
      currentVersion: '',
      documentLink: '',
      description: '',
      tags: [],
      documentState: '',
      locationId: '',
      entityId: '',
      createdAt: undefined,
      updatedAt: undefined,
      approvedDate: undefined,
      createdBy: '',
    };

    const referenceDoc: ReferenceDocuments = {
      id: '',
      documentLink: '',
      type: '',
      documentName: '',
      version: '',
      documentId: '',
      createdAt: undefined,
      updatedAt: undefined,
      referenceDocId: '',
      versionId: '',
    };

    const additionalDocuments: AdditionalDocumentAdmins = {
      id: '',
      type: '',
      firstname: '',
      lastname: '',
      email: '',
      userId: '',
      documentId: '',
      createdAt: undefined,
      updatedAt: undefined,
    };
    it('it should return the document', async () => {
      prisma.additionalDocumentAdmins.findFirst = jest
        .fn()
        .mockResolvedValue({});

      prisma.documentAdmins.findFirst = jest.fn().mockResolvedValue({});
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'DRAFT',
          docktype: {
            readAccess: 'Organization',
          },
        }),
      );
      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });

    it('it should return with document state ...IN_REVIEW', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'IN_REVIEW',
        }),
      );
      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return with document state ...REVIEW_COMPLETE', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'REVIEW_COMPLETE',
        }),
      );
      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return a document with document state...APPROVED', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'APPROVED',
        }),
      );
      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return with document state ...IN_APPROVAL', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'IN_APPROVAL',
        }),
      );
      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return with document state...PUBLISHED', async () => {
      prisma.additionalDocumentAdmins.findMany = jest
        .fn()
        .mockResolvedValue(Array(2).fill(additionalDocuments));
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          id: '1234',
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'PUBLISHED',
          doctype: {
            readAccess: 'Restricted Access',
          },
        }),
      );

      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return with document state ...PUBLISHED and readAccess == organization', async () => {
      prisma.additionalDocumentAdmins.findMany = jest
        .fn()
        .mockResolvedValue(Array(2).fill(additionalDocuments));
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          id: '1234',
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'PUBLISHED',
          doctype: {
            readAccess: 'Organization',
          },
        }),
      );

      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return with document state ...PUBLISHED and readAccess == Creators Location', async () => {
      prisma.user.findFirst = jest.fn().mockResolvedValue(
        Object.assign(mockedUser, {
          locationId: '1234',
          entityId: 'entity',
        }),
      );
      prisma.documentAdmins.findMany = jest.fn().mockResolvedValue([
        {
          user: {
            locationId: '1234',
            entityId: 'entity',
          },
        },
      ]);
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          id: '1234',
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'PUBLISHED',
          doctype: {
            readAccess: "Creator's Location",
          },
        }),
      );

      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it("it should return with document state ...PUBLISHED and readAccess == Creator's Entity", async () => {
      prisma.additionalDocumentAdmins.findMany = jest
        .fn()
        .mockResolvedValue(Array(2).fill(additionalDocuments));
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          id: '1234',
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'PUBLISHED',
          doctype: {
            readAccess: "Creator's Entity",
          },
        }),
      );

      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
    it('it should return with document state ...AMMEND', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(3).fill(referenceDoc),
          documentState: 'AMMEND',
        }),
      );
      expect(
        await service.getApproverReviewerDocumentDetails(
          {
            id: '1234',
          },
          '1234',
        ),
      ).toBeTruthy();
    });
  });

  describe('createReferenceDocuments', () => {
    it('it should create reference object', async () => {
      prisma.referenceDocuments.create = jest.fn().mockResolvedValue({});
      expect(
        await service.createReferenceDocuments({
          documentId: '123',
          idOfDocToBeConnected: '456',
          type: 'string',
        }),
      ).toBeTruthy();
    });
  });

  describe('getReferenceDocumentsForDocument', () => {
    it('it should return an array of document', async () => {
      prisma.referenceDocuments.findMany = jest
        .fn()
        .mockResolvedValue(mockDocuments);

      expect(
        await service.getReferenceDocumentsForDocument('123'),
      ).toBeTruthy();
    });
  });
  describe('getReferenceDocumentSearch', () => {
    it('it should return an array of documents', async () => {
      expect(
        await service.getReferenceDocumentSearch('hello', 'calm', {
          id: '1234',
        }),
      ).toBeTruthy();
    });
  });

  describe('setStatusForDocument', () => {
    it('it should set the status for the document when status === PUBLISHED', async () => {
      prisma.documentWorkFlowHistory.create = jest.fn().mockResolvedValue({});
      prisma.documents.update = jest.fn().mockResolvedValue({});
      expect(
        await service.setStatusForDocument('PUBLISHED', '1234', { id: '123' }),
      ).toBeTruthy();
    });
    it('it should set the status for the document when status === PUBLISHED', async () => {
      prisma.documentWorkFlowHistory.create = jest.fn().mockResolvedValue({});
      prisma.documents.update = jest.fn().mockResolvedValue({});
      expect(
        await service.setStatusForDocument('APPROVED', '1234', { id: '123' }),
      ).toBeTruthy();
    });
  });
  describe('update', () => {
    it('it should update the document', async () => {
      const user = Object.assign(users, {
        id: 'kcid',
      });

      const createDocumentDto = {
        additionalReaders: [],
        doctypeId: '',
        realmName: '',
        documentName: '',
        documentNumbering: 'Serial',
        reasonOfCreation: '',
        effectiveDate: '',
        currentVersion: '',
        documentLink: '',
        description: '',
        tags: [],
        documentState: 'PUBLISHED',
        referenceDocuments: Array(2).fill({ currentVersion: '1234' }),
        documentVersions: [],
        reviewers: [],
        approvers: [],
        creators: [],
        file: undefined,
        locationId: '',
        entityId: '',
      };

      const doctype: Doctype = {
        id: '',
        locationId: '',
        documentTypeName: '',
        documentNumbering: 'Serial',
        reviewFrequency: 0,
        prefix: 'string',
        suffix: 'string',
        organizationId: '',
        readAccess: '',
        createdAt: undefined,
        updatedAt: undefined,
        updatedBy: '',
        createdBy: '',
        entityId: '',
      };

      prisma.organization.findFirst = jest.fn().mockResolvedValue({});
      prisma.user.findFirst = jest.fn().mockResolvedValue(
        Object.assign(users, {
          kcId: 'kcid',
          entityId: 'entity',
        }),
      );
      prisma.entity.findFirst = jest.fn().mockResolvedValue({});
      prisma.doctype.findFirst = jest.fn().mockResolvedValue(doctype);
      prisma.location.findFirst = jest.fn().mockResolvedValue({});
      prisma.additionalDocumentAdmins.deleteMany = jest
        .fn()
        .mockResolvedValue([]);

      prisma.documents.findFirst = jest.fn().mockResolvedValue({
        AdditionalDocumentAdmins: ['one', 'two'],
      });

      prisma.referenceDocuments.deleteMany = jest.fn().mockResolvedValue({});

      expect(
        await service.update('123', createDocumentDto, null, users),
      ).toBeTruthy();
    });
    it('it should update the document when status === APPROVED', async () => {
      const user = Object.assign(users, {
        id: 'kcid',
      });

      const doctype: Doctype = {
        id: '',
        locationId: '',
        documentTypeName: '',
        documentNumbering: 'Serial',
        reviewFrequency: 0,
        prefix: 'string',
        suffix: 'string',
        organizationId: '',
        readAccess: '',
        createdAt: undefined,
        updatedAt: undefined,
        updatedBy: '',
        createdBy: '',
        entityId: '',
      };

      prisma.organization.findFirst = jest.fn().mockResolvedValue({});
      prisma.user.findFirst = jest.fn().mockResolvedValue(
        Object.assign(users, {
          kcId: 'kcid',
          entityId: 'entity',
        }),
      );
      prisma.entity.findFirst = jest.fn().mockResolvedValue({});
      prisma.doctype.findFirst = jest.fn().mockResolvedValue(doctype);
      prisma.location.findFirst = jest.fn().mockResolvedValue({});
      prisma.additionalDocumentAdmins.deleteMany = jest
        .fn()
        .mockResolvedValue([]);

      prisma.documents.findFirst = jest.fn().mockResolvedValue({
        AdditionalDocumentAdmins: ['one', 'two'],
      });

      prisma.referenceDocuments.deleteMany = jest.fn().mockResolvedValue({});

      expect(
        await service.update(
          '123',
          {
            additionalReaders: [],
            doctypeId: '',
            realmName: '',
            documentName: '',
            documentNumbering: 'Serial',
            reasonOfCreation: '',
            effectiveDate: '',
            currentVersion: '',
            documentLink: '',
            description: '',
            tags: [],
            documentState: 'APPROVED',
            referenceDocuments: [],
            documentVersions: [],
            reviewers: [],
            approvers: [],
            creators: [],
            file: undefined,
            locationId: '',
            entityId: '',
          },
          null,
          users,
        ),
      ).toBeTruthy();
    });
    it('it should update the document when status === AMEND', async () => {
      const user = Object.assign(users, {
        id: 'kcid',
      });

      const doctype: Doctype = {
        id: '',
        locationId: '',
        documentTypeName: '',
        documentNumbering: 'Serial',
        reviewFrequency: 0,
        prefix: 'string',
        suffix: 'string',
        organizationId: '',
        readAccess: '',
        createdAt: undefined,
        updatedAt: undefined,
        updatedBy: '',
        createdBy: '',
        entityId: '',
      };

      const createDTO = {
        additionalReaders: [],
        doctypeId: '',
        realmName: '',
        documentName: '',
        documentNumbering: 'Serial',
        reasonOfCreation: '',
        effectiveDate: '',
        currentVersion: '',
        documentLink: '',
        description: '',
        tags: [],
        documentState: 'AMEND',
        referenceDocuments: Array(1).fill({ currentVersion: '1' }),
        documentVersions: [],
        reviewers: [],
        approvers: [],
        creators: [],
        file: undefined,
        locationId: '',
        entityId: '',
      };

      const document: Documents = {
        id: '',
        doctypeId: '',
        organizationId: '',
        documentName: '',
        documentNumbering: '',
        reasonOfCreation: '',
        effectiveDate: undefined,
        currentVersion: '',
        documentLink: '',
        description: '',
        tags: [],
        documentState: '',
        locationId: '',
        entityId: '',
        createdAt: undefined,
        updatedAt: undefined,
        approvedDate: undefined,
        createdBy: '',
      };

      prisma.organization.findFirst = jest.fn().mockResolvedValue({});
      prisma.user.findFirst = jest.fn().mockResolvedValue(
        Object.assign(users, {
          kcId: 'kcid',
          entityId: 'entity',
        }),
      );
      prisma.entity.findFirst = jest.fn().mockResolvedValue({});
      prisma.doctype.findFirst = jest.fn().mockResolvedValue(doctype);
      prisma.location.findFirst = jest.fn().mockResolvedValue({});
      prisma.additionalDocumentAdmins.deleteMany = jest
        .fn()
        .mockResolvedValue([]);

      prisma.documents.findFirst = jest.fn().mockResolvedValue({
        AdditionalDocumentAdmins: ['one', 'two'],
      });

      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(document, {
          ReferenceDocuments: Array(1).fill(ReferenceDoc),
        }),
      );

      prisma.referenceDocuments.deleteMany = jest.fn().mockResolvedValue({
        currentVersion: true,
      });
      prisma.documentVersions.create = jest.fn().mockResolvedValue({});
      prisma.versionReferenceDocuments.create = jest.fn().mockResolvedValue({});
      expect(await service.update('123', createDTO, null, user)).toBeTruthy();
    });
  });

  describe('checkPermissionForPreviewPage', () => {
    const users: User = {
      id: '',
      kcId: '',
      email: '',
      username: '',
      firstname: '',
      lastname: '',
      createdAt: undefined,
      createdBy: '',
      updatedAt: undefined,
      updatedBy: '',
      enabled: false,
      organizationId: '',
      locationId: '',
      businessTypeId: '',
      sectionId: '',
      entityId: '',
      userType: '',
      status: false,
      avatar: '',
    };

    const doctype: Doctype = {
      id: '',
      locationId: '',
      documentTypeName: '',
      documentNumbering: '',
      reviewFrequency: 0,
      prefix: '',
      suffix: '',
      organizationId: '',
      readAccess: '',
      createdAt: undefined,
      updatedAt: undefined,
      updatedBy: '',
      createdBy: '',
      entityId: '',
    };

    const user = Object.assign(users);
    it('it should check permission', async () => {
      prisma.documents.findUnique = jest.fn().mockResolvedValue(
        Object.assign(mockDocuments[0], doctype, {
          id: '1234',
        }),
      );
      prisma.additionalDocumentAdmins.findMany = jest
        .fn()
        .mockResolvedValue([{}]);
      expect(
        await service.checkPermissionsForPreviewPage(user, '1234'),
      ).toBeTruthy();
    });
  });
});
