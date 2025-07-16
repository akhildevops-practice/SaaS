import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { Model } from 'mongoose';
import { Configuration } from 'src/configuration/schema/configuration.schema';
import { NpdRegister } from 'src/Npd/schema/registerNpd.schema';
import { entity } from 'src/organization/dto/business-config.dto';
import { PrismaService } from 'src/prisma.service';
import { Logger } from 'winston';

@Injectable()
export class SerialNumberService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: Logger,
    @InjectModel(Configuration.name)
    private configModule: Model<Configuration>,
    @InjectModel(NpdRegister.name)
    private npdModule: Model<NpdRegister>,
  ) {}
  async createPrefixSuffix(data) {
    try {
      const {
        moduleType,
        prefix,
        suffix,
        location,
        createdBy,
        organizationId,
        flag,
      } = data;
      let newprefix, newsuffix;
      if (
        moduleType === 'CAPA' ||
        moduleType === 'Audit Report' ||
        moduleType === 'Audit Findings' ||
        moduleType === 'HIRA' ||
        moduleType === 'AI'
      ) {
        newprefix = prefix.join('-');
        newsuffix = suffix.join('-');
      } else {
        newprefix = prefix;
        newsuffix = suffix;
      }
      const result = await this.prisma.prefixSuffix.create({
        data: {
          moduleType,
          prefix: newprefix,
          suffix: newsuffix,
          location,
          createdBy,
          organizationId,
        },
      });
      this.logger.log(
        `creating prefix suffix for the module ${data}`,
        'SerialNumberService',
      );
      return result.id;
    } catch (error) {
      this.logger.error(
        `error creating prefix suffix ${error} `,
        'SerialNumberService',
      );
      throw new InternalServerErrorException(error);
    }
  }
  //this api is used to get prefix and suffix for the given moduletype and location
  async getPrefixSuffix(id, id1) {
    try {
      this.logger.log(
        'getting prefix and suffix for the module and location',
        'SerialNumberService',
      );

      const result = await this.prisma.prefixSuffix.findFirst({
        where: {
          moduleType: id,
          location: id1,
        },
      });
      return result;
    } catch (error) {
      this.logger.error(`not found exception ${error}`, 'getPrefixSuffix');
      return error;
    }
  }
  //this api is used to update the prefix suffix,parameter-id of the entry in prefixsuffix table
  async updatePrefixSuffix(id, data) {
    try {
      this.logger.log('update prefix and suffix', 'updatePrefixSuffix');
      const {
        moduleType,
        location,
        prefix,
        suffix,
        createdBy,
        organizationId,
      } = data;
      const newprefix = prefix.join('-');
      const newsuffix = suffix.join('-');
      const result = await this.prisma.prefixSuffix.update({
        where: { id },
        data: {
          moduleType,
          prefix: newprefix,
          suffix: newsuffix,
          location,
          createdBy,
          organizationId,
        },
      });
      return result.id;
    } catch (error) {
      this.logger.error(
        `error updating prefix and suffix${error}`,
        'updatePrefixSuffix',
      );
      return error;
    }
  }
  //this api is used to delete an entry in prefixSuffix table,parameter:id of the row
  async deletePrefixSuffix(id) {
    try {
      this.logger.log(
        'inside deletePrefixSuffix deleting the record',
        'deletePrefixSuffix',
      );
      const result = await this.prisma.prefixSuffix.delete({ where: { id } });
      return result.id;
    } catch (error) {
      this.logger.error(
        `deletePrefixSuffix called but could not delete for the given id${error}`,
        'deletePrefixSuffix',
      );
      return error;
    }
  }

  //this api is used to get prefix and suffix based on only moduletype
  async getPrefixSuffixonModuleType(moduleType, orgId) {
    try {
      this.logger.log(
        'getPrefixSuffixonmoduleType',
        'getPrefixSuffixonModuleType',
      );
      const result = await this.prisma.prefixSuffix.findFirst({
        where: {
          moduleType: moduleType,
          organizationId: orgId,
        },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `getPrefixSuffixonmoduletype called:exception generated${error}`,
        'getPrefixSuffixonModuleType',
      );
      return error;
    }
  }

  //this api is used to get all prefix and suffix of all the module types in a given organization
  async getAllPrefixSuffix(organizationId) {
    try {
      this.logger.log('getAllPrefixSuffix:fetching data', 'getAllPrefixSuffix');
      const result = await this.prisma.prefixSuffix.findMany({
        where: {
          organizationId,
        },
      });
      return result;
    } catch (error) {
      this.logger.error(
        `getAllPrefixSuffix:exception occured${error}`,
        'getAllPrefixSuffix',
      );
      return error;
    }
  }

  //this api is used to generate serialnumber for the given transaction(audit plan,template,nc,observation etc ids)
  async generateSerialNumber(query) {
    const { moduleType, location, createdBy, organizationId, entity, year } =
      query;
    const prefixsuffix = await this.getPrefixSuffixonModuleType(
      moduleType,
      organizationId,
    );
    if (prefixsuffix) {
      try {
        this.logger.log(
          'inside generateSerialNumber:generating serial number',
          'SerialNumberService',
        );
        const currentSerialNumber = await this.prisma.serialNumber.findFirst({
          where: {
            moduleType: moduleType,
            location: location,
            entity: entity,
            year: year,
          },
          select: {
            id: true,
            serialNumber: true,
          },
        });
        if (currentSerialNumber) {
          const newserial = await this.prisma.serialNumber.update({
            where: {
              id: currentSerialNumber.id,
            },
            data: {
              serialNumber: currentSerialNumber.serialNumber + 1,
            },
          });
          if (prefixsuffix.suffix === '') {
            return prefixsuffix.prefix + '-' + newserial.serialNumber;
          } else if (prefixsuffix.prefix === '') {
            newserial.serialNumber + '-' + prefixsuffix.suffix;
          }
          //return the generated serial number along with prefix and suffix number in the format prefix/serialnumber/suffix
          else {
            return (
              prefixsuffix.prefix +
              '-' +
              newserial.serialNumber +
              '-' +
              prefixsuffix.suffix
            );
          }
        } else {
          const payload = {};
          const serialnumber = await this.prisma.serialNumber.create({
            data: {
              moduleType: moduleType,
              location: location,
              entity: entity,
              year: year,
              createdBy: createdBy,
              organizationId: organizationId,
            },
          });
          if (prefixsuffix.suffix === '') {
            return prefixsuffix.prefix + '-' + serialnumber.serialNumber + '-';
          } else if (prefixsuffix.prefix === '') {
            serialnumber.serialNumber + '-' + prefixsuffix.suffix;
          }
          //return the generated serial number along with prefix and suffix number in the format prefix/serialnumber/suffix
          else {
            return (
              prefixsuffix.prefix +
              '-' +
              serialnumber.serialNumber +
              '-' +
              prefixsuffix.suffix
            );
          }
        }
      } catch (error) {
        this.logger.error(
          `inside generateSerialNumber api,unable to generate serial number${error}`,
          'SerialNumberService',
        );
        return error;
      }
    } else {
      this.logger.error(
        `inside generate serialnumber:no prefixsuffix found for this muduletype and location..`,
      );
    }
  }

  async generateSerialNumberClone(query) {
    console.log('serial number doc called');
    const { moduleType, location, createdBy, entity, year, organizationId } =
      query;
    console.log('query', query);
    const prefixsuffix = await this.getPrefixSuffixonModuleType(
      moduleType,
      organizationId,
    );
    if (prefixsuffix) {
      // try {
      this.logger.log(
        'inside generateSerialNumber:generating serial number',
        'SerialNumberService',
      );
      const currentSerialNumber = await this.prisma.serialNumber.findFirst({
        where: {
          moduleType: moduleType,
          location: location,
          entity: entity,
          // year: year,
        },
        select: {
          id: true,
          serialNumber: true,
        },
      });

      if (currentSerialNumber) {
        const newserial = await this.prisma.serialNumber.update({
          where: {
            id: currentSerialNumber.id,
          },
          data: {
            serialNumber: currentSerialNumber.serialNumber + 1,
          },
        });
        if (prefixsuffix.suffix === '') {
          return newserial.serialNumber;
        } else if (prefixsuffix.prefix === '') {
          newserial.serialNumber;
        }
        //return the generated serial number along with prefix and suffix number in the format prefix/serialnumber/suffix
        else {
          return newserial.serialNumber;
        }
      } else {
        console.log('inside else');
        const serialnumber = await this.prisma.serialNumber.create({
          data: {
            moduleType: moduleType,
            location: location,
            entity: entity,
            year: year,
            createdBy: createdBy,
            organizationId: organizationId,
          },
        });
        if (prefixsuffix.suffix === '') {
          return serialnumber.serialNumber;
        } else if (prefixsuffix.prefix === '') {
          serialnumber.serialNumber;
        }
        //return the generated serial number along with prefix and suffix number in the format prefix/serialnumber/suffix
        else {
          return serialnumber.serialNumber;
        }
      }
      // } catch (error) {
      //   this.logger.error(
      //     'inside generateSerialNumber api,unable to generate serial number',
      //     'SerialNumberService',
      //   );
      //   return error;
      // }
    } else {
      this.logger.error(
        'inside generate serialnumber:no prefixsuffix found for this muduletype and location..',
      );
    }
  }
  // async getSerialNumber(query) {
  //   const { moduleType, location } = query;
  //   try {
  //     this.logger.log('inside getSerialNumber', 'getSerialNumber');
  //     const prefixsuffix = await this.getPrefixSuffixonModuleType(moduleType);
  //     const serialnumber = await this.prisma.serialNumber.findFirst({
  //       where: {
  //         moduleType: moduleType,
  //         location: location,
  //       },
  //       select: { serialNumber: true },
  //     });
  //     //return the generated serial number along with prefix and suffix number in the format prefix/serialnumber/suffix
  //     return (
  //       prefixsuffix.prefix +
  //       '/' +
  //       serialnumber.serialNumber +
  //       '/' +
  //       prefixsuffix.suffix
  //     );
  //   } catch (error) {
  //     this.logger.log(
  //       'getSerialNumber:error getting serial number',
  //       'getSerialNumber',
  //     );
  //   }
  // }
  //this api is used todelete an entry in serial number model with id as the key
  async deleteSerialNumber(id) {
    try {
      this.logger.log(
        'deleteSerialnumber():deleting serial number',
        'deleteSerialNumber',
      );
      const result = await this.prisma.serialNumber.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error(
        'deleteSerialNumber:error deleting serial number entry',
        'deleteSerialNumber',
      );
      return error;
    }
  }
  //api to generate serial number for npd
  async generateSerialNumberForNPD(query) {
    const { moduleType, location, tid, createdBy, organizationId } = query;
    const config: any = await this.configModule.find({
      organizationId: organizationId,
    });
    const prefixSuffix = config[0].numbering[0];
    const currentSerialNumber = await this.prisma.serialNumber.findFirst({
      where: {
        moduleType: moduleType,
      },
      select: {
        id: true,
        serialNumber: true,
      },
    });
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
    const day = date.getDate().toString().padStart(2, '0'); // pad with leading zero if needed

    const formattedDate = `${year}${month}${day}`;

    if (currentSerialNumber) {
      const newSerial = await this.prisma.serialNumber.update({
        where: {
          id: currentSerialNumber.id,
        },
        data: {
          serialNumber: currentSerialNumber.serialNumber + 1,
        },
      });

      // Pad the serial number to always have 3 digits
      const paddedSerial = newSerial.serialNumber.toString().padStart(3, '0');

      // Return the generated serial number with prefix, date, and padded serial number
      return `${prefixSuffix.pre}-${formattedDate}-${paddedSerial}`;
    } else {
      const serialnumber = await this.prisma.serialNumber.create({
        data: {
          moduleType: moduleType,
          tid: tid,
          location: location,
          createdBy: createdBy,
          organizationId: organizationId,
        },
      });

      // Pad the serial number to always have 3 digits
      const paddedSerial = serialnumber.serialNumber
        .toString()
        .padStart(3, '0');

      // Return the generated serial number with prefix and padded serial number
      return `${prefixSuffix.pre}-${formattedDate}-${paddedSerial}`;
    }
  }
}
