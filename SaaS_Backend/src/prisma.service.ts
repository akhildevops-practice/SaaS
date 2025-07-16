import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
// import { PrismaClient } from '@prisma/client';
// import { PrismaClient as MongoPrismaClient } from 'prisma/generated/client1';
import { PrismaClient as MySQLPrismaClient } from '../prisma/generated/client2';
import { PrismaClient as MongoPrismaClient } from '../prisma/generated/client1';



@Injectable()
export class PrismaService extends MongoPrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error(err);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async (): Promise<void> => {
      // Use 'as never' to workaround the type inference issue
      await app.close();
    });
  }
}

export class MySQLPrismaService extends MySQLPrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.error(err);
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as never, async (): Promise<void> => {
      // Use 'as never' to workaround the type inference issue
      await app.close();
    });
  }
}