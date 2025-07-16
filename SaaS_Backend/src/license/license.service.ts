import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { License, licenseDocument } from './schema/license.schema';
import { Model } from 'mongoose';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';

@Injectable()
export class LicenseService {
  constructor(
    @InjectModel(License.name)
    private readonly licenseModel: Model<licenseDocument>,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  async createRealmLicense(data, userId, randomNumber) {
    try {
      // console.log('data', data);
      const result = await this.licenseModel.create(data);
      this.logger.log(
        `trace id = ${randomNumber} POST /api/license/createRealmLicense for ${data} successful`,
        '',
      );
      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/license/createRealmLicense for ${data} failed for error ${error}`,
        '',
      );
    }
  }
  async updateRealmLicense(id, data, userId, randomNumber) {
    try {
      const result = await this.licenseModel.findByIdAndUpdate(id, data);
      this.logger.log(
        `trace id = ${randomNumber} POST /api/license/updateRealmLicense for ${data} successful`,
        '',
      );
      return result._id;
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} POST /api/license/createRealmLicense for ${data} failed for error ${error}`,
        '',
      );
    }
  }
  async getRealmLicenseDetails(id, randomNumber) {
    try {
      let result;
      if (id !== 'master') {
        result = await this.licenseModel.find({
          organizationId: id,
        });
        this.logger.log(
          `trace id = ${randomNumber} GET /api/license/getRealmLicenseDetails/${id} successful`,
          '',
        );
        return result[0]; // Return the first document that matches the organizationId
      } else {
        // When id is 'master', count addedUsers and addedDocs across all collections
        result = await this.licenseModel.aggregate([
          {
            $group: {
              _id: null,
              totalAddedUsers: { $sum: '$addedUsers' }, // Sum up the addedUsers
              totalAddedDocs: { $sum: '$addedDocs' }, // Sum up the addedDocs
            },
          },
        ]);
        const masterResult = await this.licenseModel.findOne({
          organizationId: 'master',
        });

        if (result.length > 0) {
          // If aggregation results are returned, construct the response in the same format
          const aggregatedResult = result[0];

          return {
            _id: masterResult?._id,
            organizationId: 'master',
            createdBy: masterResult.createdBy,
            authorizedUsers: masterResult.authorizedUsers,
            authorizedDocs: masterResult.authorizedDocs,
            openAiKey: masterResult.openAiKey,
            togetherAIKey: masterResult.togetherAIInputTokens,
            anthropicKey: masterResult.anthropicKey,
            openAiInputTokens: masterResult.openAiInputTokens,
            openAiOutputTokens: masterResult.openAiOutputTokens,
            anthropicInputTokens: masterResult.anthropicInputTokens,
            anthropicOutputTokens: masterResult.anthropicOutputTokens,
            togetherAIInputTokens: masterResult.togetherAIInputTokens,
            togetherAIOutputTokens: masterResult.togetherAIOutputTokens,

            addedDocs: aggregatedResult.totalAddedDocs,
            addedUsers: aggregatedResult.totalAddedUsers,
          };
        } else {
          return {
            _id: masterResult?._id,
            organizationId: 'master',
            createdBy: masterResult.createdBy,
            authorizedUsers: masterResult.authorizedUsers,
            authorizedDocs: masterResult.authorizedDocs,
            openAiKey: masterResult.openAiKey,
            togetherAIKey: masterResult.togetherAIInputTokens,
            anthropicKey: masterResult.anthropicKey,
            openAiInputTokens: masterResult.openAiInputTokens,
            openAiOutputTokens: masterResult.openAiOutputTokens,
            anthropicInputTokens: masterResult.anthropicInputTokens,
            anthropicOutputTokens: masterResult.anthropicOutputTokens,
            togetherAIInputTokens: masterResult.togetherAIInputTokens,
            togetherAIOutputTokens: masterResult.togetherAIOutputTokens,

            addedDocs: masterResult.addedDocs,
            addedUsers: masterResult.addedUsers,
          };
        }
      }
    } catch (error) {
      this.logger.error(
        `trace id = ${randomNumber} GET /api/license/getRealmLicenseDetails/${id} failed error-${error}`,
        '',
      );
      throw error; // You may want to throw the error or handle it differently
    }
  }

  //fun to get count to be used in user module or doc module
  async getRealmLicenseCount(id) {
    try {
      // console.log('id', id);

      const res = await this.licenseModel
        .findOne({ organizationId: id })
        .select('authorizedUsers authorizedDocs addedUsers addedDocs');
      return res;
    } catch (error) {}
  }
}
