import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async createFavorite(data) {
    try {
      const result = await this.prisma.userPersonalisation.create({
        data,
      });
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async updateFavorite(data, userId) {
    const { targetObjectId } = data;
    const favoList = await this.prisma.userPersonalisation.findFirst({
      where: {
        userId: userId,
      },
    });

    if (favoList) {
      if (favoList.targetObjectId.includes(targetObjectId)) {
        let data = favoList.targetObjectId;
        data = data.filter((item) => item !== targetObjectId);
        const result = await this.prisma.userPersonalisation.update({
          where: {
            userId_targetObject: {
              userId: userId,
              targetObject: 'document',
            },
          },
          data: {
            targetObjectId: data,
          },
        });
        return 'successfully removed document from user list';
      } else {
        const userDocData = await this.prisma.userPersonalisation.update({
          where: {
            userId_targetObject: {
              userId: userId,
              targetObject: 'document',
            },
          },
          data: {
            targetObjectId: {
              push: targetObjectId,
            },
          },
        });
        return `${targetObjectId} is updated to list`;
      }
    } else {
      const orgId = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          organizationId: true,
        },
      });
      const createFavList = await this.prisma.userPersonalisation.create({
        data: {
          user: {
            connect: {
              id: userId,
            },
          },
          Organization: {
            connect: {
              id: orgId.organizationId,
            },
          },
          targetObjectId: [targetObjectId],
          targetObject: 'document',
        },
      });
      return 'New User Favorite List is Created';
    }
  }

  async favoriteAll() {
    const result = await this.prisma.userPersonalisation.findMany();
    if (result) {
      return result;
    } else {
      return 'no data found';
    }
  }

  async deleteFavorite(user, name) {
    const favList = await this.prisma.userPersonalisation.findFirst({
      where: {
        userId: user,
      },
      select: {
        targetObjectId: true,
      },
    });
    let data = favList.targetObjectId;
    data = data.filter((item) => item !== name);
    const result = await this.prisma.userPersonalisation.update({
      where: {
        userId_targetObject: user,
      },
      data: {
        targetObjectId: data,
      },
    });
    return result;
  }

  async getFavoriteByUserId(userId) {
    try {
      const result = await this.prisma.userPersonalisation.findFirst({
        where: {
          userId,
        },
        select: {
          targetObjectId: true,
        },
      });
      if (result.targetObjectId.length === 0) {
        return [];
      } else {
        const documents = await this.prisma.documents.findMany({
          where: {
            id: { in: result.targetObjectId },
            //deleted: false,
          },
          select: {
            documentName: true,
            id: true,
          },
        });
        return documents;
      }
    } catch {
      return [];
    }
  }

  async checkFavorite(userId, fav) {
    try {
      const favList = await this.prisma.userPersonalisation.findFirst({
        where: {
          userId,
        },
      });
      const data = favList.targetObjectId;
      if (data.includes(fav)) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }
}
