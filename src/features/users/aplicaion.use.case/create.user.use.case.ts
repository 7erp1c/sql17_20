import { UserCreateInputModel } from '../api/models/input/create.user.input.model';
import { UserType } from '../api/models/output/output';
//import { UsersRepository } from '../infrastructure/users.repository';
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter';
import { DateCreate } from '../../../base/adapters/get-current-date';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositorySql } from '../sql.infrastructure/user.repository.sql';
export class CreateUserUseCaseCommand {
  login: string;
  password: string;
  email: string;
  constructor(public inputModel: UserCreateInputModel) {
    this.login = inputModel.login;
    this.password = inputModel.password;
    this.email = inputModel.email;
  }
}
@CommandHandler(CreateUserUseCaseCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserUseCaseCommand>
{
  constructor(
    //private readonly usersRepository: UsersRepository, // mongoose
    private readonly usersRepositorySql: UsersRepositorySql,
    private readonly bcryptAdapter: BcryptAdapter,
    protected dateCreate: DateCreate,
  ) {}
  async execute(command: CreateUserUseCaseCommand): Promise<string> {
    //const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();//mongoose
    const hash = await this.bcryptAdapter.createHash(
      command.inputModel.password,
    );

    const newUser: UserType = {
      login: command.login,
      email: command.email,
      hash: hash,
      //createdAt: createdAt,//mongoose
    };
    console.log('newUser:', newUser.login);
    //return await this.usersRepository.createUser(newUser); //mongoose
    const userId = await this.usersRepositorySql.createUser(newUser);
    console.log(userId);
    return userId;
  }
}
