import { UserCreateInputModel } from '../../../users/api/models/input/create.user.input.model';
import { CreateUserUseCaseCommand } from '../../../users/aplicaion.use.case/create.user.use.case';
import { BadRequestException } from '@nestjs/common';
import { Error } from 'mongoose';
import { UsersService } from '../../../users/application/users.service';
import { EmailsManager } from '../../../../common/service/email/email-manager';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class RegistrationUserUseCaseCommand {
  constructor(public inputModel: UserCreateInputModel) {}
}
@CommandHandler(RegistrationUserUseCaseCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserUseCaseCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly emailsManager: EmailsManager,
    private readonly commandBus: CommandBus,
  ) {}
  async execute(userModelDto: RegistrationUserUseCaseCommand) {
    const createUser = await this.commandBus.execute(
      new CreateUserUseCaseCommand(userModelDto.inputModel),
    );
    const user = await this.usersService.getUserByEmail(createUser.email);
    if (!createUser) throw new BadRequestException();
    const sendEmail = await this.emailsManager.sendMessageWitchConfirmationCode(
      createUser.email,
      createUser.login,
      user.emailConfirmation.confirmationCode,
    );
    if (!sendEmail)
      throw new Error('The email has not been delivered to the soap.');

    return true;
  }
}
