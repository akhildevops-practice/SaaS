import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import * as common from 'oci-common';
import * as objectstorage from 'oci-objectstorage';
import * as st from 'stream';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectStore } from '../object-store/schema/object-store.schema';
import { PrismaService } from '../prisma.service';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { Express } from 'express';
import { Multer } from 'multer';

@Injectable()
export class OciUtils {
  constructor(
    private prisma: PrismaService,
    @InjectModel(ObjectStore.name)
    private ObjectStoreModel: Model<ObjectStore>,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  async getDocumentOBJ(documentLink, user, uuid) {
    this.logger.log(
      `trace id = ${uuid} Getting Document for Download from Object Storage`,
      'document.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      let getObjectStoreContents = await this.ObjectStoreModel.findOne({
        organizationId: activeUser.organizationId,
      });

      if (!getObjectStoreContents) {
        getObjectStoreContents = await this.ObjectStoreModel.findOne({
          organizationId: 'master',
        });
      }
      const tenancyId = Buffer.from(
        getObjectStoreContents.tenancyId,
        'base64',
      ).toString('ascii');
      const userId = Buffer.from(
        getObjectStoreContents.userId,
        'base64',
      ).toString('ascii');
      const fingerprint = Buffer.from(
        getObjectStoreContents.fingerprint,
        'base64',
      ).toString('ascii');
      const privateKey = getObjectStoreContents.privateKey.toString('ascii');
      const passphrase = null;
      const region = common.Region.fromRegionId(
        Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
      );

      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancyId,
        userId,
        fingerprint,
        privateKey,
        passphrase,
        region,
      );
      const client = new objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider,
      });

      const bucketName = Buffer.from(
        getObjectStoreContents.bucketName,
        'base64',
      ).toString('ascii');
      const namespace = Buffer.from(
        getObjectStoreContents.namespace,
        'base64',
      ).toString('ascii');
      const objectName = documentLink;

      const getObjectContent = await client.getObject({
        namespaceName: namespace,
        bucketName: bucketName,
        objectName: objectName,
      });

      const buffer = await this.streamToBuffer(
        getObjectContent.value as st.Readable,
      );

      this.logger.log(
        `trace id = ${uuid} Getting Document for Download from Object Storage Sucessful`,
        'document.service.ts',
      );
      return buffer;
    } catch {
      this.logger.log(
        `trace id = ${uuid} Getting Document for Download from Object Storage Failed`,
        'document.service.ts',
      );
    }
  }

  async streamToBuffer(stream: st.Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      stream.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  async getViewerOBJ(documentLink, user, uuid) {
    // //console.log('documentLink in getViewerObj', documentLink);
    this.logger.log(
      `trace id = ${uuid} Getting Document for Viewing from Object Storage`,
      'document.service.ts',
    );
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: {
          kcId: user.id,
        },
      });
      let getObjectStoreContents = await this.ObjectStoreModel.findOne({
        organizationId: activeUser.organizationId,
      });

      if (!getObjectStoreContents) {
        getObjectStoreContents = await this.ObjectStoreModel.findOne({
          organizationId: 'master',
        });
      }
      const tenancyId = Buffer.from(
        getObjectStoreContents.tenancyId,
        'base64',
      ).toString('ascii');
      const userId = Buffer.from(
        getObjectStoreContents.userId,
        'base64',
      ).toString('ascii');
      const fingerprint = Buffer.from(
        getObjectStoreContents.fingerprint,
        'base64',
      ).toString('ascii');
      const privateKey = getObjectStoreContents.privateKey.toString('ascii');
      const passphrase = null;
      const region = common.Region.fromRegionId(
        Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
      );
      const provider = new common.SimpleAuthenticationDetailsProvider(
        tenancyId,
        userId,
        fingerprint,
        privateKey,
        passphrase,
        region,
      );
      const client = new objectstorage.ObjectStorageClient({
        authenticationDetailsProvider: provider,
      });

      const bucketName = Buffer.from(
        getObjectStoreContents.bucketName,
        'base64',
      ).toString('ascii');
      const namespace = Buffer.from(
        getObjectStoreContents.namespace,
        'base64',
      ).toString('ascii');
      const objectName = documentLink;

      const date = new Date();

      const createPreauthenticatedRequestDetails = {
        name: 'par-object-' + date,
        objectName: objectName,
        accessType:
          objectstorage.models.CreatePreauthenticatedRequestDetails.AccessType
            .AnyObjectRead,
        timeExpires: new Date(Date.now() + 30000),
      };

      const createPreauthenticatedRequestRequest: objectstorage.requests.CreatePreauthenticatedRequestRequest =
        {
          namespaceName: namespace,
          bucketName: bucketName,
          createPreauthenticatedRequestDetails:
            createPreauthenticatedRequestDetails,
        };

      const createPreauthenticatedRequestResponse =
        await client.createPreauthenticatedRequest(
          createPreauthenticatedRequestRequest,
        );
      this.logger.log(
        `trace id = ${uuid} Getting Document for Viewing from Object Storage Sucessful`,
        'document.service.ts',
      );
      // //console.log(
      //   'return value',
      //   createPreauthenticatedRequestResponse.preauthenticatedRequest.fullPath +
      //     objectName,
      // );
      return (
        createPreauthenticatedRequestResponse.preauthenticatedRequest.fullPath +
        objectName
      );
    } catch {
      this.logger.log(
        `trace id = ${uuid} Getting Document for Viewing from Object Storage Failed`,
        'document.service.ts',
      );
    }
  }

  async addDocumentToOS(file, activeUser, locationName) {
    const fs = require('fs');
    let getObjectStoreContents = await this.ObjectStoreModel.findOne({
      organizationId: activeUser.organizationId,
    });

    if (!getObjectStoreContents) {
      getObjectStoreContents = await this.ObjectStoreModel.findOne({
        organizationId: 'master',
      });
    }

    //console.log('getObjectStoreContents', getObjectStoreContents);
    const tenancyId = Buffer.from(
      getObjectStoreContents.tenancyId,
      'base64',
    ).toString('ascii');
    const userId = Buffer.from(
      getObjectStoreContents.userId,
      'base64',
    ).toString('ascii');
    const fingerprint = Buffer.from(
      getObjectStoreContents.fingerprint,
      'base64',
    ).toString('ascii');
    const privateKey = getObjectStoreContents.privateKey.toString('ascii');
    const passphrase = null;
    const region = common.Region.fromRegionId(
      Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
    );
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancyId,
      userId,
      fingerprint,
      privateKey,
      passphrase,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    const bucketName = Buffer.from(
      getObjectStoreContents.bucketName,
      'base64',
    ).toString('ascii');
    const namespace = Buffer.from(
      getObjectStoreContents.namespace,
      'base64',
    ).toString('ascii');
    const orgName =
      getObjectStoreContents.organizationId === 'master'
        ? `Master/${activeUser.organizationId}/`
        : activeUser.organizationId + '/';
    const objectName =
      orgName +
      locationName +
      '/' +
      uuid() +
      '-' +
      file?.originalname.split(' ').join('');
    let contentType;
    if (file.originalname.split('.').pop() === 'pdf') {
      contentType = 'application/pdf';
    }
    if (file.originalname.split('.').pop() === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    const fileContent = fs.readFileSync(file.path);
    client.putObject({
      namespaceName: namespace,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  async addDocumentToOSNew(file, organizationId, locationName) {
    const fs = require('fs');
    let getObjectStoreContents = await this.ObjectStoreModel.findOne({
      organizationId: organizationId,
    });

    if (!getObjectStoreContents) {
      getObjectStoreContents = await this.ObjectStoreModel.findOne({
        organizationId: 'master',
      });
    }

    //console.log('getObjectStoreContents', getObjectStoreContents);
    const tenancyId = Buffer.from(
      getObjectStoreContents.tenancyId,
      'base64',
    ).toString('ascii');
    const userId = Buffer.from(
      getObjectStoreContents.userId,
      'base64',
    ).toString('ascii');
    const fingerprint = Buffer.from(
      getObjectStoreContents.fingerprint,
      'base64',
    ).toString('ascii');
    const privateKey = getObjectStoreContents.privateKey.toString('ascii');
    const passphrase = null;
    const region = common.Region.fromRegionId(
      Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
    );
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancyId,
      userId,
      fingerprint,
      privateKey,
      passphrase,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    const bucketName = Buffer.from(
      getObjectStoreContents.bucketName,
      'base64',
    ).toString('ascii');
    const namespace = Buffer.from(
      getObjectStoreContents.namespace,
      'base64',
    ).toString('ascii');
    const orgName =
      getObjectStoreContents.organizationId === 'master'
        ? `Master/${organizationId}/`
        : organizationId + '/';
    const objectName =
      orgName +
      locationName +
      '/' +
      uuid() +
      '-' +
      file?.originalname.split(' ').join('');
    let contentType;
    if (file.originalname.split('.').pop() === 'pdf') {
      contentType = 'application/pdf';
    }
    if (file.originalname.split('.').pop() === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    const fileContent = fs.readFileSync(file.path);
    client.putObject({
      namespaceName: namespace,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  async addEditDocumentToOS(file, activeUser, locationName, sameFile) {
    const fs = require('fs');
    const path = require('path');

    let getObjectStoreContents = await this.ObjectStoreModel.findOne({
      organizationId: activeUser.organizationId,
    });

    if (!getObjectStoreContents) {
      getObjectStoreContents = await this.ObjectStoreModel.findOne({
        organizationId: 'master',
      });
    }

    const destDirectory = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'uploads',
      process.env.OB_ORG_NAME.replace('/', '').toLowerCase(),
      locationName.toLowerCase(),
      'document',
    );
    const fileName = file.split('/').pop();

    if (!fs.existsSync(destDirectory)) {
      fs.mkdirSync(destDirectory, { recursive: true });
    }

    const filePath = await this.downloadFile(
      file,
      path.join(destDirectory, fileName),
    );
    const fileContent = fs.readFileSync(filePath);

    const tenancyId = Buffer.from(
      getObjectStoreContents.tenancyId,
      'base64',
    ).toString('ascii');
    const userId = Buffer.from(
      getObjectStoreContents.userId,
      'base64',
    ).toString('ascii');
    const fingerprint = Buffer.from(
      getObjectStoreContents.fingerprint,
      'base64',
    ).toString('ascii');
    const privateKey = getObjectStoreContents.privateKey.toString('ascii');
    const passphrase = null;
    const region = common.Region.fromRegionId(
      Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
    );
    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancyId,
      userId,
      fingerprint,
      privateKey,
      passphrase,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });
    const bucketName = Buffer.from(
      getObjectStoreContents.bucketName,
      'base64',
    ).toString('ascii');
    const namespace = Buffer.from(
      getObjectStoreContents.namespace,
      'base64',
    ).toString('ascii');
    const orgName =
      getObjectStoreContents.organizationId === 'master'
        ? `Master/${activeUser.organizationId}/`
        : activeUser.organizationId + '/';
    let objectName = '';
    if (sameFile) {
      objectName = orgName + locationName + '/' + fileName;
    } else {
      objectName =
        orgName +
        locationName +
        '/' +
        uuid() +
        '-' +
        file.split('/').pop().split('-').pop();
    }
    let contentType;
    if (file.split('/').pop().split('.').pop() === 'pdf') {
      contentType = 'application/pdf';
    }
    if (file.split('/').pop().split('.').pop() === 'docx') {
      contentType =
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    client.putObject({
      namespaceName: namespace,
      bucketName: bucketName,
      objectName: objectName,
      putObjectBody: fileContent,
      contentType: contentType,
    });

    return objectName;
  }

  async downloadFile(urlString, destPath) {
    return new Promise((resolve, reject) => {
      const url = require('url');
      const http = require('http');
      const parsedUrl = url.parse(urlString);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      const file = fs.createWriteStream(destPath);
      const request = protocol
        .get(urlString, (response) => {
          response.pipe(file);
          file.on('finish', () => {
            file.close(() => {
              resolve(destPath);
            });
          });
        })
        .on('error', (error) => {
          fs.unlink(destPath, () => {
            reject(error);
          });
        });
    });
  }

  async deleteDocumentFromOS(objectName: string, organizationId: string) {
    const getObjectStoreContents = await this.ObjectStoreModel.findOne({
      organizationId: organizationId,
    });

    const tenancyId = Buffer.from(
      getObjectStoreContents.tenancyId,
      'base64',
    ).toString('ascii');
    const userId = Buffer.from(
      getObjectStoreContents.userId,
      'base64',
    ).toString('ascii');
    const fingerprint = Buffer.from(
      getObjectStoreContents.fingerprint,
      'base64',
    ).toString('ascii');
    const privateKey = getObjectStoreContents.privateKey.toString('ascii');
    const region = common.Region.fromRegionId(
      Buffer.from(getObjectStoreContents.region, 'base64').toString('ascii'),
    );

    const provider = new common.SimpleAuthenticationDetailsProvider(
      tenancyId,
      userId,
      fingerprint,
      privateKey,
      null,
      region,
    );

    const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
    });

    const bucketName = Buffer.from(
      getObjectStoreContents.bucketName,
      'base64',
    ).toString('ascii');
    const namespace = Buffer.from(
      getObjectStoreContents.namespace,
      'base64',
    ).toString('ascii');

    await client.deleteObject({
      namespaceName: namespace,
      bucketName: bucketName,
      objectName: objectName,
    });
  }
}
