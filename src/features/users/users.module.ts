import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './application/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { BcryptAdapter } from '../../base/adapters/bcrypt.adapter';
import { UsersQueryRepository } from './infrastructure/users.query-repository';
import { DateCreate } from '../../base/adapters/get-current-date';
import { RandomNumberService } from '../../common/service/random/randomNumberUUVid';
import { InputUniqDataIsExistConstraint } from '../../common/decorators/validate/uniqueness/uniqInDb-is-exist.decorator';
import { CreateUserUseCase } from './aplicaion.use.case/create.user.use.case';
import { DeleteUserUseCase } from './aplicaion.use.case/delete.user.use.case';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRepositorySql } from './sql.infrastructure/user.repository.sql';
import { UserQueryRepositorySql } from './sql.infrastructure/user.query.repository.sql';

const useCases = [CreateUserUseCase, DeleteUserUseCase];
const usersProviders = [
  UsersService,
  UsersRepository,
  UsersQueryRepository,
  UsersRepositorySql,
  UserQueryRepositorySql,
];
//
// const queryCases = [GetAllUsersUseCase];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    ...usersProviders,
    RandomNumberService,
    DateCreate,
    BcryptAdapter,
    InputUniqDataIsExistConstraint,
    ...useCases,
    // ...queryCases,
  ],
  exports: [UsersService, UsersQueryRepository],
})
export class UsersModule {}
