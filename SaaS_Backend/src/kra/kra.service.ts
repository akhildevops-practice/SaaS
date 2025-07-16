import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ObjectId } from 'bson';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { objectiveMaster } from 'src/objective/schema/objectiveMaster.schema';
import { ReviewComments } from 'src/objective/schema/reviewComments.schema';
import { OwnerComments } from 'src/objective/schema/ownerComments.schema';
import { KRA } from './schema/kra.schema';
import { createKra } from './dto/createKra.dto';

@Injectable()
export class KraService {
  constructor(
    @InjectModel(objectiveMaster.name)
    private objectiveMaster: Model<objectiveMaster>,
    @InjectModel(ReviewComments.name)
    private reviewComments: Model<ReviewComments>,
    @InjectModel(OwnerComments.name)
    private ownerComments: Model<OwnerComments>,
    @InjectModel(KRA.name)
    private kra: Model<KRA>,
    private readonly prisma: PrismaService,
  ) {}

  async create(userId, data: createKra) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const {
        KraName,
        ObjectiveId,
        Target,
        TargetType,
        UnitOfMeasure,
        TargetDate,
        StartDate,
        EndDate,
        Status,
        Comments,
        UserName,
        ForEntity,
        KpiReportId,
        objectiveCategories,
        objective,
        description,
        associatedKpis,
      } = data;
      console.log('data', data);
      const result = await this.kra.create({
        KraName,
        ObjectiveId,
        Target,
        TargetType,
        UnitOfMeasure,
        description,
        TargetDate,
        StartDate,
        EndDate,
        Status,
        Comments,
        UserName,
        ForEntity,
        KpiReportId,
        objective,
        objectiveCategories,
        ModifiedBy: activeUser.username,
        ModifiedDate: Date.now(),
        OrganizationId: activeUser.organizationId,
        associatedKpis,
      });
      console.log('result', result);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getAll(id, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = await this.kra.find({
        OrganizationId: activeUser.organizationId,
        ObjectiveId: id,
      });
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getKraById(id, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = await this.kra.findById({ _id: id });
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async updateKraById(id, userId, data) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const {
        KraName,
        ObjectiveId,
        Target,
        UnitOfMeasure,
        TargetDate,
        StartDate,
        EndDate,
        Status,
        Comments,
        UserName,
        ForEntity,
        TargetType,
        KpiReportId,
        objectiveCategories,
        description,
        associatedKpis,
      } = data;
      const result = await this.kra.findByIdAndUpdate(id, {
        KraName,
        ObjectiveId,
        Target,
        UnitOfMeasure,
        TargetDate,
        StartDate,
        EndDate,
        description,
        Status,
        Comments,
        UserName,
        ForEntity,
        KpiReportId,
        TargetType,
        objectiveCategories,
        associatedKpis,
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteKra(id, userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = await this.kra.findByIdAndDelete({
        _id: id,
      });
      return {
        result: result,
        status: 'successful',
      };
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async getUOM(userId) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: userId,
      },
    });
    try {
      const result = await this.prisma.kpi.findMany({
        where: {
          organizationId: activeUser.organizationId,
        },
      });
      return result;
    } catch (error) {
      throw new NotFoundException(error);
    }
  }
}
