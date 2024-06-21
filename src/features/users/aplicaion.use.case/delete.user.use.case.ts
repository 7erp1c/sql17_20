import { UsersRepository } from '../infrastructure/users.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositorySql } from '../sql.infrastructure/user.repository.sql';
export class DeleteUserUseCaseCommand {
  constructor(public id: string) {}
}
@CommandHandler(DeleteUserUseCaseCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserUseCaseCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersRepositorySql: UsersRepositorySql,
  ) {}
  async execute(command: DeleteUserUseCaseCommand) {
    //return await this.usersRepository.deleteUser(command.id); //mongoose
    return await this.usersRepositorySql.deleteUser(command.id);
  }
}
