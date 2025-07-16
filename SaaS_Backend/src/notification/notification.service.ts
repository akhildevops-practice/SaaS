import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { notificationEvents } from '../utils/notificationEvents.global';
import { PrismaService } from 'src/prisma.service';
import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const { type, text, style, content, creator, receiver } =
      createNotificationDto;

    try {
      const createdNotification = await this.prisma.notification.create({
        data: {
          type,
          content,
          text,
          style,
          user: {
            connect: {
              id: receiver,
            },
          },
          creator,
        },
      });

      return createdNotification;
    } catch (err) {
      // ////////////////console.log("err", err)
    }
  }

  /**
   * @Desc This method fetches all the notifications of the current user
   * @param id User id
   * @returns All notifications of current user
   */
  async findAll(id: string) {
    // let todayStart = new Date();
    // todayStart.setHours(0,0,0,0);

    // calculating yesterday form today -> new Date()
    let yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);

    let yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // fetching the current user
    const user = await this.prisma.user.findFirst({
      where: {
        kcId: id,
      },
    });

    if (user === null) return [];

    // getting all notifications of today
    const today = await this.prisma.notification.findMany({
      where: {
        receiver: user.id,
        date: {
          gte: yesterdayEnd,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // getting all notifications of yesterday
    const yesterday = await this.prisma.notification.findMany({
      where: {
        receiver: user.id,
        date: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // getting all older notifications. Older than yesterday
    const older = await this.prisma.notification.findMany({
      where: {
        receiver: user.id,
        date: {
          lte: yesterdayStart,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // getting total unread notifications count of the user
    const unreadCount = await this.prisma.notification.count({
      where: {
        receiver: user.id,
        read: false,
      },
    });

    return { today, yesterday, older, unreadCount };
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }

  /**
   * @desc This method sets a notification read status as true by ID
   * @param uid Receiver User ID
   * @param nid Notification ID
   */
  async markAsRead(id: string, nid: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      const notification = await this.prisma.notification.updateMany({
        where: {
          id: nid,
          read: false,
        },
        data: {
          read: true,
        },
      });

      return notification;
    } catch (err) {}
  }

  /**
   * @Desc This method delates all the notifications of a user
   * @param id User ID
   */
  async clearAllNotifications(id: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          kcId: id,
        },
      });

      await this.prisma.notification.deleteMany({
        where: {
          receiver: user.id,
        },
      });

      return;
    } catch (err) {}
  }
}
