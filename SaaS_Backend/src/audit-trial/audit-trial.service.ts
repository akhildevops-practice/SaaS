import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { resourceLimits } from 'node:worker_threads';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';
import { auditTrail } from './schema/audit-trial.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuditTrialService {
  constructor(
    @InjectModel(auditTrail.name) private auditTrailModel: Model<auditTrail>,
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
  ) {}
  async createAuditTrail(data) {
    this.logger.log('creating audit trial', 'AuditTrialService');
    try {
      const result = await this.auditTrailModel.create(data);
      return result.id;
    } catch (error) {
      this.logger.error(
        'exception occured while creating audit trial',
        'AuditTrialService',
      );
    }
  }
  async getAuditTrialById(id:any, uuid) {
    this.logger.log('Getting data', 'AuditTrialService');
    try {
      this.logger.log(
        `trace id = ${uuid} auditTrial Service called query for auditTrail`,
        'AuditTrialService',
      );
      const result = await this.prisma.auditTrial.findMany({
        where: { transactionId: id },
      });
      ////console.log("data",result[1].actionBy)
      //////////////////console.log(result);
      this.logger.log(
        `trace id = ${uuid} auditTrial response complete is successfull  ${result}`,
        'AuditTrialService',
      );
      return result;
    } catch (error) {
      this.logger.error(
        `trace id = ${uuid} auditTrial Service failed due to ${error}`,
        'AuditTrialService',
      );
      throw new NotFoundException({"error-message":error})
       }
  }
  async deleteAuditTrialById(id) {
    const result = await this.prisma.auditTrial.delete({
      where: { id },
    });
    return result.id;
  }
  async updateAuditTrialById(id, data) {
    const { moduleType, actionBy, transactionId, actionType } = data;
    const result = await this.prisma.auditTrial.update({
      where: { id },
      data: {
        moduleType,
        actionBy,
        actionType,
        transactionId,
      },
    });
    return result.id;
  }

  async getAuditTrail(id) {
    try{
      const auditTrailDtls = await this.auditTrailModel.find({
        subModuleId: id?.id
      }).sort({ createdAt: -1 });
      const finalResult: any[] = [];
      for (let i = 0; i < auditTrailDtls.length; i++) {
        let auditTrail: any = auditTrailDtls[i]
        const user = await this.prisma.user.findFirst({
          where: {
            id: auditTrailDtls[i].responsibleUser
          }
        });
        if (user) {
          finalResult.push({
            ...auditTrail._doc,
            responsibleUserName: `${user.firstname} ${user.lastname}`,
          });
        }
      }
      return finalResult
    }catch{

    }
  }
}
