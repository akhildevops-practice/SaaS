import { Injectable } from '@nestjs/common';
import { Stats } from './schema/stats.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Stats.name) private statsModel: any,
    private readonly prisma: PrismaService,
  ) {}

  async createEntryInStats(body: any) {
    const createdStats = await this.statsModel.create(body);

    return createdStats;
  }

  async getAllEntriesInStats(query: any) {
    try {
      const findQuery: any = {};
      if (query.start && query.end) {
        findQuery.createdAt = {
          $gte: new Date(query.start),
          $lte: new Date(query.end),
        };
      }

      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Use aggregation to get counts
      const statsWithCount = await this.statsModel.aggregate([
        { $match: findQuery },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            lastEntry: { $last: '$$ROOT' }, // Get the last entry for each user
          },
        },
        {
          $replaceRoot: {
            newRoot: { $mergeObjects: ['$lastEntry', { count: '$count' }] },
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);

      // Extract unique userIds
      const uniqueUserIds = statsWithCount.map((stat) => stat.userId);

      // console.log('uniqueUserIds', uniqueUserIds);

      // Fetch user details for the unique userIds
      const userDetails = await this.prisma.user.findMany({
        where: {
          id: { in: uniqueUserIds },
        },
        select: {
          id: true,
          username: true,
          email: true,
          firstname: true,
          lastname: true,
          avatar: true,
        },
      });

      // console.log('userDetails', userDetails);

      // Create a map of userId to user details
      const userMap = userDetails.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      // console.log('userMap', userMap);

      // Map user details to stats
      const enrichedStats = statsWithCount.map((stat) => {
        return {
          ...stat,
          user: userMap[stat.userId],
        };
      });

      const total = await this.statsModel.countDocuments(findQuery);

      return { stats: enrichedStats, total };
    } catch (error) {
      console.log('error', error);
    }
  }

  async getAllTransactions(query: any) {
    try {
      console.log('query in getAlltransactions', query);

      let findQuery: any = {};
      if (query.start && query.end) {
        findQuery.createdAt = {
          $gte: new Date(query.start),
          $lte: new Date(query.end),
        };
      }
      let locationWhereQuery = {};
      if (query.location) {
        locationWhereQuery = {
          locationId: { $in: query.location },
        };
      }
      findQuery = {
        ...findQuery,
        ...locationWhereQuery,
      };

      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Find all entries in the stats table
      const statsEntries = await this.statsModel
        .find(findQuery)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by createdAt in descending order

      let userIds: any = new Set();
      statsEntries.forEach((entry) => {
        userIds.add(entry.userId);
      });

      // Fetch user details for the unique userIds
      const userDetails = await this.prisma.user.findMany({
        where: {
          id: { in: Array.from(userIds) },
        },
        include: { location: { select: { id: true, locationName: true } } },
      });
      // Create a map of userId to user details
      const userMap = userDetails.reduce((acc, user) => {
        acc[user.id] = {
          id: user.id,
          username: user.username,
          email: user.email,
          firstname: user.firstname,
          lastname: user.lastname,
          avatar: user.avatar,
          location: user.location,
        };
        return acc;
      }, {});

      // Map user details to stats entries
      const enrichedStats = statsEntries.map((entry) => {
        return {
          ...entry.toObject(), // Convert Mongoose document to plain object
          user: userMap[entry.userId],
        };
      });

      const total = await this.statsModel.countDocuments(findQuery);

      return { stats: enrichedStats, total };
    } catch (error) {
      console.error('Error in getAllEntriesWithUserDetails:', error);
      throw error;
    }
  }
}
