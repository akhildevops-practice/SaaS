import {
    Inject,
    Injectable,
    InternalServerErrorException,
  } from '@nestjs/common';
import { Model } from 'mongoose';
import { Logger } from 'winston';
import { InjectModel } from '@nestjs/mongoose';
import { moduleHelp } from './schema/moduleHelp.schema';
import { topicHelp } from './schema/topicHelp.schema';
import { unlinkSync } from 'fs';


@Injectable()
export class moduleHelpService {
  constructor(
    @InjectModel(moduleHelp.name) private moduleHelpModel: Model<moduleHelp>,
    @InjectModel(topicHelp.name) private topicHelpModel: Model<topicHelp>,
    @Inject('Logger') private readonly logger: Logger,
  ) {}

  async createModule(data, randomNumber) {
    try{
        const createModule = await this.moduleHelpModel.create(data)

        this.logger.log(
            `trace id = ${randomNumber} POST api/moduleHelp/createModule payload = ${data} Successful`,
            'moduleHelp.service.ts',
          );
    } catch(error){
        this.logger.error(
            `trace id = ${randomNumber} POST api/moduleHelp/createModule payload = ${data} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async getAllModules(randomNumber){
    try{
        const allModules = await this.moduleHelpModel.find()

        this.logger.log(
            `trace id = ${randomNumber} GET api/moduleHelp/getAllModules Successful`,
            'moduleHelp.service.ts',
          );
        return allModules
    } catch(error){
        this.logger.error(
            `trace id = ${randomNumber} GET api/moduleHelp/getAllModules Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async getModuleById (id,randomNumber){
    try{
       const getModuleById = await this.moduleHelpModel.findById(id)

       this.logger.log(
        `trace id = ${randomNumber} GET api/moduleHelp/getModuleById Successful`,
        'moduleHelp.service.ts',
      );
      return getModuleById
    } catch(error){
      this.logger.error(
        `trace id = ${randomNumber} GET api/moduleHelp/getModuleById Failed`,
        'moduleHelp.service.ts',
      )
      throw new InternalServerErrorException(error)
    }
  }

  async getTopicsByModuleId(id,randomNumber){
    try{
        const getTopics = await this.topicHelpModel.find({ moduleId : id })
        const getTopicOrder = await this.getModuleById(id, randomNumber)

        getTopics.sort(( a : any, b : any) => {
          return getTopicOrder.topicOrder.indexOf(a._id.toString())  - getTopicOrder.topicOrder.indexOf(b._id.toString())
        })

        this.logger.log(
            `trace id = ${randomNumber} GET api/moduleHelp/getTopicsByModuleId/${id} Successful`,
            'moduleHelp.service.ts',
          );
        return getTopics
    } catch(error){
        this.logger.error(
            `trace id = ${randomNumber} GET api/moduleHelp/getTopicsByModuleId/${id} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async updateModule(id,data,randomNumber){
    try{
        const updateModule = await this.moduleHelpModel.findByIdAndUpdate(id,data)

        this.logger.log(
            `trace id = ${randomNumber} PUT api/moduleHelp/updateModule/${id} payload = ${data} Successful`,
            'moduleHelp.service.ts',
        );
    }catch(error){
        this.logger.error(
            `trace id = ${randomNumber} PUT api/moduleHelp/updateModule/${id} payload = ${data} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async deleteModule(id,randomNumber){
    try{
        const deleteModule = await this.moduleHelpModel.findByIdAndRemove(id)

        this.logger.log(
            `trace id = ${randomNumber} DELETE api/moduleHelp/deleteModule/${id} Successful`,
            'moduleHelp.service.ts',
        );
    }catch(error){
        this.logger.error(
            `trace id = ${randomNumber} DELETE api/moduleHelp/deleteModule/${id} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async createTopic(file, data, randomNumber) {
    try{
        let payload = data
        if(file){
          const fs = require('fs');
          const fileStream = fs.createReadStream(file.path);
          const fileContent = await this.streamToBuffer(fileStream)

          payload = {
            ...data,
            "fileContent" : fileContent
          }
        }
        const createTopic = await this.topicHelpModel.create(payload)
        
        const addTopicOrderToModule = await this.getModuleById(data.moduleId,randomNumber)

        addTopicOrderToModule.topicOrder.push(createTopic._id)

        await this.updateModule(data.moduleId,addTopicOrderToModule,randomNumber)

        if(file){
          unlinkSync(file.path);
        }

        this.logger.log(
            `trace id = ${randomNumber} POST api/moduleHelp/createTopic payload = ${data} Successful`,
            'moduleHelp.service.ts',
          );
    } catch(error){
        this.logger.error(
            `trace id = ${randomNumber} POST api/moduleHelp/createTopic payload = ${data} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async updateTopic(id,file,data,randomNumber){
    try{
        let payload = data
        if(file){
          const fs = require('fs');
          const fileStream = fs.createReadStream(file.path);
          const fileContent = await this.streamToBuffer(fileStream)

          payload = {
            ...data,
            "fileContent" : fileContent
          }
        }

        const updateTopic = await this.topicHelpModel.findByIdAndUpdate(id,payload)

        this.logger.log(
            `trace id = ${randomNumber} PUT api/moduleHelp/updateTopic/${id} payload = ${data} Successful`,
            'moduleHelp.service.ts',
        );
    }catch(error){
        this.logger.error(
            `trace id = ${randomNumber} PUT api/moduleHelp/updateTopic/${id} payload = ${data} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async deleteTopic(id,randomNumber){
    try{

        const deleteTopic = await this.topicHelpModel.findByIdAndRemove(id)

        this.logger.log(
            `trace id = ${randomNumber} DELETE api/moduleHelp/deleteTopic/${id} Successful`,
            'moduleHelp.service.ts',
        );
    }catch(error){
        this.logger.error(
            `trace id = ${randomNumber} DELETE api/moduleHelp/deleteTopic/${id} Failed`,
            'moduleHelp.service.ts',
          );
        throw new InternalServerErrorException(error);
    }
  }

  async streamToBuffer(stream): Promise<Buffer> {
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
}