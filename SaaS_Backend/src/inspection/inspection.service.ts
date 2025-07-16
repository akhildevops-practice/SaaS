import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InspectionSchema, Inspection } from './schema/inspection.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, model } from 'mongoose';
import { PrismaService } from 'src/prisma.service';
import { InspectionCreateDto } from './dto/createInspection.dto';

@Injectable()
export class InspectionService {
  constructor(
    @InjectModel(Inspection.name) private inspectionModel: Model<Inspection>,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: InspectionCreateDto, user) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });

      const finalResult = await this.inspectionModel.create({
        partNumber: data.partNumber,
        cavity: data.cavity,
        sampleQuantity: data.sampleQuantity,
        customer: data.customer,
        supplier: data.supplier,
        reason: data.reason,
        organizationId: activeUser.organizationId,
        partName: data.partName,
        model: data.model,
        productionDate: data.productionDate,
        typeofRequest: data.typeofRequest,
        toDepartment: data.toDepartment,
        requiredDate: data.requiredDate,
        requestDepartment: data.requestDepartment,
        requestBy: data.requestBy,
        email: data.email,
        requestDate: data.requestDate,
        category: data.category,
        changePointDetails: data.changePointDetails,
        typeOfTest: data.typeOfTest,
        remarks: data.remarks,
        attachFiles: data.attachFiles,
        overallRemarks: data.overallRemarks,
        status: data.status,
        receivingStatus: data.receivingStatus,
        editDeleteStatus: data.editDeleteStatus,
        buttonStatusEdit: data.buttonStatusEdit,
        buttonStatusDelete: data.buttonStatusDelete,
        buttonStatusReceiving: data.buttonStatusReceiving,
        buttonStatusReject: data.buttonStatusReject,
        buttonStatusAllocation: data.buttonStatusAllocation,
        receivingData: data.receivingData,
        receivingPurpose: data.receivingPurpose,
        receivingRemarks: data.receivingRemarks,
        clarification: data.clarification,
        targetDate: data.targetDate,
        actualDate: data.actualDate,
        remarksAllocation: data.remarksAllocation,
        attachFilesTable: data.attachFilesTable,
        tableData: data.tableData,
      });
      return finalResult;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }

  async getAll(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    const result = await this.inspectionModel.find({
      organizationId: activeUser.organizationId,
      deletedAt: false,
    });
    return result;
  }

  async deleteById(id) {
    await this.inspectionModel.findByIdAndUpdate(id, { deletedAt: true });
    return 'successfull deleted';
  }

  async update(user, id, data): Promise<any> {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const updatedResult = await this.inspectionModel.updateOne(
        { _id: id },
        {
          partNumber: data.partNumber,
          cavity: data.cavity,
          sampleQuantity: data.sampleQuantity,
          customer: data.customer,
          supplier: data.supplier,
          reason: data.reason,
          organizationId: activeUser.organizationId,
          partName: data.partName,
          model: data.model,
          productionDate: data.productionDate,
          typeofRequest: data.typeofRequest,
          toDepartment: data.toDepartment,
          requiredDate: data.requiredDate,
          requestDepartment: data.requestDepartment,
          requestBy: data.requestBy,
          email: data.email,
          requestDate: data.requestDate,
          category: data.category,
          changePointDetails: data.changePointDetails,
          typeOfTest: data.typeOfTest,
          remarks: data.remarks,
          attachFiles: data.attachFiles,
          overallRemarks: data.overallRemarks,
          status: data.status,
          receivingStatus: data.receivingStatus,
          editDeleteStatus: data.editDeleteStatus,
          buttonStatusEdit: data.buttonStatusEdit,
          buttonStatusDelete: data.buttonStatusDelete,
          buttonStatusReceiving: data.buttonStatusReceiving,
          buttonStatusReject: data.buttonStatusReject,
          buttonStatusAllocation: data.buttonStatusAllocation,
          receivingData: data.receivingData,
          receivingPurpose: data.receivingPurpose,
          receivingRemarks: data.receivingRemarks,
          clarification: data.clarification,
          targetDate: data.targetDate,
          actualDate: data.actualDate,
          remarksAllocation: data.remarksAllocation,
          attachFilesTable: data.attachFilesTable,
          tableData: data.tableData,
        },
      );
      return updatedResult;
    } catch (err) {}
  }

  async getInspectionById(user, id) {
    try {
      const result = await this.inspectionModel.findById(id);
      return result;
    } catch (err) {}
  }

  async getAllModels(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });
    console.log('active', activeUser);
    const models = await this.prisma.models.findMany({
      where: { organizationId: activeUser.organizationId },
    });
    console.log('models', models);
    return models;
  }

  async getAllParts(user) {
    const activeUser = await this.prisma.user.findFirst({
      where: { kcId: user.id },
    });

    const parts = await this.prisma.parts.findMany({
      where: { organizationId: activeUser.organizationId },
    });

    return parts;
  }
}
