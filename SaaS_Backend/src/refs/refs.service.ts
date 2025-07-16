import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Refs } from './schema/refs.schema';
import { PrismaService } from 'src/prisma.service';
import { System, SystemDocument } from 'src/systems/schema/system.schema';
import {
  Clauses,
  ClausesSchema,
  ClauseDocument,
} from 'src/systems/schema/clauses.schema';
import { ObjectId } from 'mongodb';
@Injectable()
export class RefsService {
  constructor(
    @InjectModel(Refs.name) private refsModel: Model<Refs>,
    @InjectModel(System.name) private systemModel: Model<SystemDocument>,
    @InjectModel(Clauses.name) private clauseModel: Model<ClauseDocument>,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: any) {
    try {
      // ////////////////console.log('data in refs', data);

      const insertData = await this.refsModel.insertMany(data);
      // ////////////////console.log('data insert in refs', insertData);
      return insertData;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async update(data: any) {
    try {
      // ////////////////console.log('data in update refs', data);
      const { refs, id } = data;
      // 1. Fetch all the references based on the refTo value.
      const existingRefs = await this.refsModel.find({ refTo: id }).exec();
      // ////////////////console.log('existingRefs in refs', existingRefs);

      // 2. If they exist, delete them.
      if (existingRefs && existingRefs.length > 0) {
        const deleteRefs = await this.refsModel
          .deleteMany({ refTo: id })
          .exec();
        // ////////////////console.log('deleteRefs', deleteRefs);
      }
      const insertData = await this.refsModel.insertMany(refs);
      // ////////////////console.log('data insert in refs', insertData);
      return insertData;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
  async getAllById(id: any) {
    try {
      let references: any = await this.refsModel.find({ refTo: id }).exec();
      let finalData = [];
      for (let value of references) {
        let systemData, clauseData;
        if (value?.type === 'Clause') {
          clauseData = await this.clauseModel.findById(value?.refId);
          systemData = await this.systemModel.findById(clauseData?.systemId);
        }
        finalData.push({
          _id: value?._id,
          organizationId: value?.organizationId,
          type: value?.type,
          name: value?.name,
          comments: value?.comments,
          refTo: value?.refTo,
          refId: value?.refId,
          link: value?.link,
          createdBy: value?.createdBy,
          updatedBy: value?.updatedBy,
          createdAt: value?.createdAt,
          updatedAt: value?.updatedAt,
          systemName: systemData?.name || '',
          number: clauseData?.number,
          isFlagged : value?.isFlagged || false,
          refToModule: value?.refToModule,
        });
      }
      return finalData;
    } catch (error) {
      ////////////////console.log('error in refs', error);

      throw new InternalServerErrorException();
    }
  }

  async deleteAllById(id: string) {
    try {
      const deleteRefs = await this.refsModel.deleteMany({ refTo: id }).exec();
      return deleteRefs?.acknowledged;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async flagReference(data: any) {
    try {
      // ////////////////console.log('data in update refs', data);
      const { refId } = data;
      console.log("ref id to be upfdated", data?._id);
      
      // 1. Fetch all the references based on the refTo value.
      const updateRef = await this.refsModel
        .updateOne(
          { _id: new ObjectId(data?._id) },
          {
            isFlagged: true,
          }, 
        )
        .exec();
        console.log('updateRef', updateRef);
        
      return updateRef?.acknowledged;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }
}
