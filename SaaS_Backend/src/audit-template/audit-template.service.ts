import {
  Body,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAuditTemplateDto } from './dto/create-audit-template.dto';
import { UpdateAuditTemplateDto } from './dto/update-audit-template.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  AuditTemplate,
  AuditTemplateDocument,
} from './schema/audit-template.schema';
import { AnyKeys, Model } from 'mongoose';
import { filterGenerator } from './helpers/filterGenerator';
import { userInfo } from 'os';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { Question, QuestionDocument } from './schema/question.schema';

@Injectable()
export class AuditTemplateService {
  constructor(
    @InjectModel(AuditTemplate.name)
    private readonly auditTemplateModel: Model<AuditTemplateDocument>,
    @InjectModel(Question.name)
    private readonly questionModel: Model<QuestionDocument>,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  /**
   * @method create
   * @Desc This method creates a new template and saves it to the database.
   * @param createAuditTemplateDto AuditTemplate Data
   */
  async create(createAuditTemplateDto: CreateAuditTemplateDto, id: string) {
    // try {
    // getting the current user
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: id,
      },
    });

    // checking if templates with the given name exists in an organization
    const templates = await this.auditTemplateModel.findOne({
      organizationId: user.organizationId,
      title: { $regex: createAuditTemplateDto.title, $options: 'i' },
    });

    // if template with name exists the we throw error
    if (templates !== null) {
      throw new ConflictException('Conflict');
    }

    // if template name is unique for an organization we craete the template and save to db
    const data = {
      ...createAuditTemplateDto,
      createdBy: user.id,
      organizationId: user.organizationId,
    };

    for (let i = 0; i < data.sections.length; i++) {
      let section: any = data.sections[i];
      const newSection = [];
      for await (const field of section.fieldset) {
        // if question already does not exists
        if (!field.hasOwnProperty('_id')) {
          const newQuestion = await this.questionModel.create(field);
          newSection.push(newQuestion._id.toString());
        } else {
          // if question exists
          newSection.push(field._id);
        }
      }
      section.fieldset = newSection;
    }

    const newTemplate = new this.auditTemplateModel(data);
    await newTemplate.save();
    return newTemplate._id;
    // } catch (err) {
    //   if (err.status === 409) {
    //     throw new ConflictException(
    //       'Audit Template with same name already exists',
    //     );
    //   }

    //   throw new InternalServerErrorException();
    // }
  }

  /**
   * @method findAll
   * @Desc This method fetches all the Audit Templates from the database. Skip and limit are used to paginate the results.
   * @param skip {number}
   * @param limit {number}
   * @returns Array of templates
   */
  async findAll(id: any, skip: number, limit: number, query: any) {
    // try {
    const { search, selectedLoc } = query;
    let response: any = [];
    let count: any;
    let templates: any;

    // getting the current user
    const user: any = await this.prisma.user.findFirst({
      where: {
        kcId: id.id,
      },
    });

    // user roles
    const encodedLoc = JSON.parse(selectedLoc);
    let whereCondition: any = { organizationId: user.organizationId };

    if(encodedLoc.length>0){
      whereCondition={...whereCondition,'locationName.id':{$in:encodedLoc}}
    }
    if (search !== undefined && search !== 'undefined') {
      whereCondition = {
        ...whereCondition,
        title: { $regex: search, $options: 'i' },
      };
    }

   
    if (id.kcRoles.roles.includes('MR')) {
      const locationId = ['All', user.locationId];
      whereCondition = {
        ...whereCondition,
        'locationName.id': { $in: locationId },
      };
    }

    if (
      !id.kcRoles.roles.includes('MR') &&
      !id.kcRoles.roles.includes('ORG-ADMIN')
    ) {
      const locationId = ['All', user.locationId];
      whereCondition = {
        ...whereCondition,
        isDraft: false,

        'locationName.id': { $in: locationId },
      };
    }

    if (id.kcRoles.roles.includes('ORG-ADMIN')) {
      count = await this.auditTemplateModel.countDocuments(whereCondition);
      templates = await this.auditTemplateModel
        .find(whereCondition)
        .sort({ isDraft: 1, createdAt: -1 })
        .skip((skip - 1) * limit)
        .limit(limit)

        .populate('sections.fieldset');

      // populating user from postgres db
      for (let i = 0; i < templates.length; i++) {
        let item: any = templates[i];
        const res = await this.userService.getUserById(templates[i].createdBy);
        response.push({
          ...item._doc,
          createdBy: `${res.firstname} ${res.lastname}`,
          isEdit: true,
        });
      }
    } else if (id.kcRoles.roles.includes('MR')) {
      const locationId = ['All', user.locationId];
      count = await this.auditTemplateModel.countDocuments(whereCondition);
      templates = await this.auditTemplateModel
        .find(whereCondition)
        .sort({ isDraft: 1, createdAt: -1 })
        .skip((skip - 1) * limit)
        .limit(limit)
        .populate('sections.fieldset');

      // populating user from postgres db
      for (let i = 0; i < templates.length; i++) {
        let item: any = templates[i];
        const locids = item.locationName.map((value) => value.id);
        const access = locids.includes(user.locationId);
        const res = await this.userService.getUserById(templates[i].createdBy);
        response.push({
          ...item._doc,
          createdBy: `${res.firstname} ${res.lastname}`,
          isEdit: access,
        });
      }
    } else {
      const locationId = ['All', user.locationId];
      count = await this.auditTemplateModel.countDocuments(whereCondition);
      templates = await this.auditTemplateModel
        .find(whereCondition)
        .sort({ isDraft: 1, createdAt: -1 })
        .skip((skip - 1) * limit)
        .limit(limit)
        .populate('sections.fieldset');

      // populating user from postgres db
      for (let i = 0; i < templates.length; i++) {
        let item: any = templates[i];
        const res = await this.userService.getUserById(templates[i].createdBy);
        response.push({
          ...item._doc,
          createdBy: `${res.firstname} ${res.lastname}`,
          isEdit: false,
        });
      }
    }

    // if (
    //   encodedLoc?.length > 0 &&
    //   encodedLoc !== undefined &&
    //   encodedLoc !== 'undefined'
    // ) {
    //   response = await this.datafilterBasedLoc(response, encodedLoc);
    // }
    return {
      template: response,
      count: count,
    };
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }

  async datafilterBasedLoc(data, loc) {
    try {
      const finalResult = [];
      for (let value of data) {
        const locids = value.locationName.map((value) => value.id);
        if (loc.some((item) => locids.includes(item))) {
          finalResult.push(value);
        }
      }
      return finalResult
    } catch (err) {}
  }
  /**
   * @method findOne
   * @Desc This method finds a template by its ID.
   * @param id Template ID
   * @returns Template or null
   */
  async findOne(id: string) {
    try {
      const template = await this.auditTemplateModel
        .findById(id)
        .populate('sections.fieldset');

      // populating user from postgres db
      let item: any = template;
      const res = await this.userService.getUserById(template.createdBy);
      template.createdBy = `${res.firstname} ${res.lastname}`;

      return template;
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method update
   * @Desc This method updates any template which matches the given ID.
   * @param id Template ID
   * @param updateAuditTemplateDto Updated Template ID
   * @returns Updated template
   */
  async update(id: string, updateAuditTemplateDto: any) {
    try {
      const questionsToDelete = []; // bulk delete

      const template = await this.auditTemplateModel.findById(id);

      // finding all the questions to be deleted
      let sectionsToBeDeleted = template.sections.filter(
        (item1) =>
          !updateAuditTemplateDto.sections.find(
            (item2) => item2._id == item1._id?.toString(),
          ),
      );

      // questions to be deleted from sections
      sectionsToBeDeleted.forEach((item) => {
        item.fieldset.forEach((id) => {
          questionsToDelete.push(item._id);
        });
      });

      // looping through each sections to detect changes to the template
      for (let i = 0; i < updateAuditTemplateDto.sections.length; i++) {
        const section = updateAuditTemplateDto.sections[i];

        const questionsToUpdate = [];
        const questionsToCreate = [];

        if (section.hasOwnProperty('_id')) {
          // section exists already

          // looping through each field
          for (const field of section.fieldset) {
            // if object has an _id property its means the object exists in the db
            if (field.hasOwnProperty('_id')) {
              questionsToUpdate.push(field);
            } else {
              questionsToCreate.push(field);
            }
          }

          const updatePromises = questionsToUpdate.map((item) => {
            return this.questionModel.findByIdAndUpdate(item._id, {
              $set: item,
            });
          });

          const createPromises = questionsToCreate.map((item) => {
            return this.questionModel.create(item);
          });

          const updateResolved = await Promise.all(updatePromises);
          const createResolved = await Promise.all(createPromises);

          // if question created
          if (createResolved.length > 0) {
            const questionIds = createResolved.map((item) => item._id);
            updateAuditTemplateDto.sections[i].fieldset = [
              ...template.sections[i].fieldset,
              ...questionIds,
            ];
          }
        } else {
          const createPromises = section.fieldset.map((item) => {
            return this.questionModel.create(item);
            // return newDoc.save();
          });

          const createResolved = await Promise.all(createPromises);

          // if question created
          if (createResolved.length > 0) {
            const questionIds = createResolved.map((item) => item._id);
            updateAuditTemplateDto.sections[i].fieldset = questionIds;
          }
        }
      }
      // exec
      const deletedDocs = await this.deleteManyQuestions(questionsToDelete);

      return await this.auditTemplateModel.findByIdAndUpdate(
        id,
        {
          $set: updateAuditTemplateDto,
        },
        { new: true },
      );
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method remove
   * @Desc This method deletes the template from the DB which matches the given ID
   * @param id Template ID
   * @returns Deleted Template
   */
  async remove(id: string) {
    const template = await this.auditTemplateModel.findByIdAndDelete(id);
    return template;
  }

  /**
   * @method searchTemplate
   * @Desc This method fetches the matched templates for a search string
   * @param text Search string
   * @returns Returns array of documents
   */
  async searchTemplate(
    id: string,
    title: string,
    createdBy: string,
    skip: number,
    limit: number,
  ) {
    try {
      const response = [];
      // getting the current user
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      const filters: any = filterGenerator({
        organizationId: user.organizationId,
        title,
        createdBy,
        limit,
        skip,
      });
      const count: any = await this.auditTemplateModel.countDocuments(
        filters[0].$match,
      );
      const templates = await this.auditTemplateModel.aggregate(filters);
      // populating user from postgres db
      for (let i = 0; i < templates.length; i++) {
        let item: any = templates[i];
        const res = await this.userService.getUserById(templates[i].createdBy);
        response.push({
          ...item,
          createdBy: `${res.firstname} ${res.lastname}`,
        });
      }
      return { template: response, count };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  /**
   * @method getTemplateSuggestions
   *  This method fetches the suggestions for the search bar
   * @returns Returns array of documents
   */
  async getTemplateSuggestions(userId: string) {
    try {
      // getting the current user
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
      });
      const templates = await this.auditTemplateModel
        .find({ organizationId: user.organizationId })
        .select('title');
      return templates;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async search(userId, text, skip, limit) {
    try {
      const response = [];
      let count: any;
      let templates: any;
      let draftWord;
      if (text === 'published' || text === 'Published') {
        draftWord = false;
      }
      if (text === 'draft' || text === 'Draft') {
        draftWord = true;
      }
      // getting the current user
      const user: any = await this.prisma.user.findFirst({
        where: {
          kcId: userId,
        },
        include: {
          // assignedRole: {
          //   include: {
          //     role: true,
          //   },
          // },
        },
      });

      // user roles
      const roleInfo = await this.prisma.role.findMany({
        where: { id: { in: user.roleId } },
      });
      const userRoles = roleInfo?.map((item) => item.roleName);

      if (userRoles.includes('ORG-ADMIN') || userRoles.includes('MR')) {
        const userInfo = await this.prisma.user.findMany({
          where: {
            AND: [
              { organizationId: user.organizationId },
              { OR: [{ firstname: { contains: text, mode: 'insensitive' } }] },
            ],
          },
        });
        const userIds = userInfo.map((item) => item.id);
        const count: any = await this.auditTemplateModel.countDocuments({
          $and: [{ organizationId: user.organizationId }],
          $or: [
            { title: { $regex: text, $options: 'i' } },
            { isDraft: draftWord },
            { createdBy: { $in: userIds } },
          ],
        });
        const templates = await this.auditTemplateModel
          .find({
            $and: [{ organizationId: user.organizationId }],
            $or: [
              { title: { $regex: text, $options: 'i' } },
              { isDraft: draftWord },
              { createdBy: { $in: userIds } },
            ],
          })
          .skip(skip)
          .limit(limit);

        // populating user from postgres db
        for (let i = 0; i < templates.length; i++) {
          let item: any = templates[i];
          const res = await this.userService.getUserById(
            templates[i].createdBy,
          );
          response.push({
            ...item._doc,
            createdBy: `${res.firstname} ${res.lastname}`,
          });
        }
      } else {
        const userInfo = await this.prisma.user.findMany({
          where: {
            AND: [
              { organizationId: user.organizationId },
              { OR: [{ firstname: { contains: text, mode: 'insensitive' } }] },
            ],
          },
        });
        const userIds = userInfo.map((item) => item.id);
        const count: any = await this.auditTemplateModel.countDocuments({
          $and: [{ organizationId: user.organizationId }],
          $or: [
            { title: { $regex: text, $options: 'i' } },
            { isDraft: draftWord },
            { createdBy: { $in: userIds } },
          ],
        });
        const templates = await this.auditTemplateModel
          .find({
            $and: [{ organizationId: user.organizationId }],
            $or: [
              { title: { $regex: text, $options: 'i' } },
              { isDraft: draftWord },
              { createdBy: { $in: userIds } },
            ],
          })
          .skip(skip)
          .limit(limit);
        // populating user from postgres db
        for (let i = 0; i < templates.length; i++) {
          let item: any = templates[i];
          const res = await this.userService.getUserById(
            templates[i].createdBy,
          );
          response.push({
            ...item._doc,
            createdBy: `${res.firstname} ${res.lastname}`,
          });
        }
      }

      return {
        template: response,
        count: response.length,
      };
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }
  /**
   * @method isTemplateUnique
   *  This method returns true/false if the template name is already taken
   * @param title Template title
   * @returns True/False
   */
  async isTemplateUnique(id: string, title: string) {
    try {
      // getting the current user
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      // checking if templates with the given name exists in an organization
      const templates = await this.auditTemplateModel.find({
        organizationId: { $regex: user.organizationId, $options: 'i' },
        title: { $regex: title, $options: 'i' },
      });

      return templates.length === 0;
    } catch (err) {
      // console.error(err);
      throw new InternalServerErrorException();
    }
  }

  async getAllAuditTemplatesByLocation(user: any, id: string) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: user.id },
      });
      const location = ['All', id];
      const finalData = await this.auditTemplateModel
        .find({
          organizationId: activeUser.organizationId,
          'locationName.id': { $in: location },
          isDraft: false,
        })
        .select('title');

      return finalData;
    } catch (error) {}
  }

  /**
   * @method deleteManyQuestions
   *  This method deletes many questions from a template at once
   * @param ids Array of question ids
   * @returns no of questions deleted
   */
  async deleteManyQuestions(ids: any) {
    const res = await this.questionModel.deleteMany({ _id: { $in: ids } });
    return res.deletedCount;
  }

  /**
   * @method getTemplateForAudit
   *  This method fetches the questions from a template for an audit
   * @param id tmemplate id
   * @returns fetched template
   */
  async getTemplateForAudit(id: string) {
    const template = await this.auditTemplateModel
      .findById(id)
      .populate('sections.fieldset', '-createdAt -updatedAt -__v')
      .select(
        '-__v -createdAt -createdBy -organizationId -updatedAt -isDraft -publishedDate -title',
      );

    const count = template.sections.reduce(
      (prevVal, current) => prevVal + current.fieldset.length,
      0,
    );
    return { sections: template.sections, questionCount: count };
  }

  // async getmultipleTemplates(data: any) {
  //   //console.log('data', data);
  //   const template = await this.auditTemplateModel
  //     .find({ _id: { $in: data } })
  //     .populate('sections.fieldset', '-createdAt -updatedAt -__v')
  //     .select(
  //       '-__v -createdAt -createdBy -organizationId -updatedAt -isDraft -publishedDate -title',
  //     );
  //   //console.log('template', template);
  //   let finalResult = [];
  //   for (let value of template) {
  //     const count = value.sections.reduce(
  //       (prevVal, current) => prevVal + current.fieldset.length,
  //       0,
  //     );
  //     finalResult.push({ sections: value.sections, questionCount: count });
  //   }
  //   return finalResult;
  // }
  async getmultipleTemplates(data: any) {
    //console.log('data', data);
    const template = await this.auditTemplateModel
      .find({ _id: { $in: data } })
      .populate('sections.fieldset', '-createdAt -updatedAt -__v')
      .populate('sections.title', '-createdAt -updatedAt -__v')
      .populate('sections.totalScore', '-createdAt -updatedAt -__v')
      .select('title _id locationName status');
    //console.log('template', template);
    let finalResult = [];
    for (let value of template) {
      const count = value.sections.reduce(
        (prevVal, current) => prevVal + current.fieldset.length,
        0,
      );
      finalResult.push({
        sections: value.sections,
        questionCount: count,
        title: value.title,
        id: value._id,
      });
    }
    return finalResult;
  }

  async getExcelDetails(file, res) {
    const fs = require('fs');
    const XLSX = require('xlsx');

    const fileContent = fs.readFileSync(file.path);
    const workbook = XLSX.read(fileContent, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    let firstIteration = true;
    const responseData = [];

    for (const rowData of excelData) {
      if (firstIteration) {
        firstIteration = false;
        continue;
      }

      const section = rowData[0];
      const question = rowData[1];
      const type = rowData[2];
      const score = rowData[3];
      const slider = rowData[4] === 'true';
      const hint = rowData[5];

      responseData.push({
        section: section,
        question: question,
        type: type,
        score: score,
        slider: slider,
        hint: hint
      });
    }
    return res.status(200).json({ success: true, responseData });
  }

  async getAllLocationsForTemplate(userId) {
    try {
      const activeUser = await this.prisma.user.findFirst({
        where: { kcId: userId.id },
      });

      const result = await this.auditTemplateModel.find({
        organizationId: activeUser.organizationId,
      });
      const resultLocation = [];
      for (let value of result) {
        resultLocation.push(...value?.locationName);
      }
      const uniqueArray = Array?.from(
        new Map(resultLocation?.map((item) => [item?.id, item])).values(),
      );
      return uniqueArray;
    } catch (err) {
      throw new InternalServerErrorException(err);
    }
  }
}
