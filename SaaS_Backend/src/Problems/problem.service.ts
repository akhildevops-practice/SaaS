import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { createFieldsPairsFilter } from '../utils/filterGenerator';
import { includeObjLoc } from '../utils/constants';

import { getBTDetails } from '../user/helper';

import { problemDto } from './dto/problem.dto';
import { convertDate } from 'src/utils/dateFormatter';
// import { User } from '../../dist/authentication/user.model';

@Injectable()
export class ProblemService {
  constructor(private prisma: PrismaService, private user: UserService) {}

  async createProblem(problemData: problemDto, user: any) {
    const { problem } = problemData;
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const createdProblem1 = await this.prisma.problem.findFirst({
      where: {
        problem: problem,
      },
    });
    if (createdProblem1) {
      throw new HttpException(
        'Duplicate entries found while creating problem',
        409,
      );
    } else {
      const createdProblem = await this.prisma.problem.create({
        data: {
          problem,
          createdAt: convertDate(Date.now()),
          organization: {
            connect: {
              id: activeUser.organizationId,
            },
          },
        },
      });
      const getCreatedModel = await this.prisma.problem.findFirst({
        where: {
          id: createdProblem.id,
        },
      });
      if (getCreatedModel) {
        return getCreatedModel;
      } else {
        return;
      }
    }
  }

  // // User master api

  // //get location by id
  async getProblemById(id) {
    try {
      const problemData = await this.prisma.problem.findUnique({
        where: {
          id: id,
        },
      });

      return problemData;
    } catch {
      throw new NotFoundException('Error while fetching location');
    }
  }

  async getProblems(
    page?: number,
    limit?: number,
    user?: any,
    search?: string,
  ) {
    const activeUser = await this.prisma.user.findFirst({
      where: {
        kcId: user.id,
      },
    });
    const skipValue = (page - 1) * Number(limit);

    try {
      let allProblems;
      if (search && search.length > 0) {
        allProblems = await this.prisma.problem.findMany({
          skip: skipValue,
          take: Number(limit),
          orderBy: {
            problem: 'asc',
          },
          where: {
            organizationId: activeUser.organizationId,
            problem: {
              contains: search,
              mode: 'insensitive',
            },
          },
        });
      } else {
        allProblems = await this.prisma.problem.findMany({
          skip: skipValue,
          take: Number(limit),
          orderBy: {
            problem: 'asc',
          },
          where: { organizationId: activeUser.organizationId },
        });
      }

      //console.log(allProblems);
      allProblems = allProblems.sort((a: any, b: any) => a.problem - b.problem);
      //console.log(allProblems)
      const noPageProblems = await this.prisma.problem.findMany({});
      return { data: allProblems, length: noPageProblems.length };
    } catch (err) {
      console.error(err);
      throw new BadRequestException();
    }
  }
  async updateProblem(problemData: problemDto, id: string) {
    const { problem } = problemData;

    const isProblemExist = await this.prisma.problem.findUnique({
      where: {
        id: id,
      },
    });

    if (isProblemExist) {
      const updateProblem = await this.prisma.problem.update({
        where: {
          id: id,
        },
        data: {
          problem,
        },
      });

      return updateProblem;
    } else {
      throw new NotFoundException();
    }
  }

  async deleteProblem(id: string) {
    const problemData = await this.prisma.problem.findUnique({
      where: {
        id: id,
      },
      include: {
        investigations: true,
      },
    });
    if (problemData) {
      //console.log(problemData,"problemData")
      const deleteInvestigations = await this.prisma.investigation.deleteMany({
        where: {
          id: {
            in: problemData.investigations.map((el: any) => el.id),
          },
        },
      });
      const deletedProblem = await this.prisma.problem.delete({
        where: {
          id: id,
        },
      });
      ////console.log(deletedLocation.id);
      return deletedProblem.id;
      ////console.log(deletedLocation.id);
      return deletedProblem.id;
    } else {
      throw new NotFoundException();
    }
  }
}
