import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { PrismaService } from '../prisma.service';
import { UserModule } from '../user/user.module';
import { EntityController } from './entity.controller';
import { EntityService } from './entity.service';
import { EntityChain, EntityChainSchema } from './schema/entityChain.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: EntityChain.name,
                schema: EntityChainSchema
            }
        ]),
        AuthenticationModule, 
        UserModule
    ],
    controllers: [EntityController],
    providers: [EntityService, PrismaService],
    exports: [EntityService]
})
export class EntityModule {}
