import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { DateCreate } from '../../../base/adapters/get-current-date';
import { BcryptAdapter } from '../../../base/adapters/bcrypt.adapter';
import { User } from '../domain/user.entity';
import {
  ConfirmationCodeInputModel,
  LoginOrEmailInputModel,
  NewPasswordInputModel,
  UserEmailInputModel,
} from '../../security/auth/api/model/input/loginOrEmailInputModel';
//import { UsersRepositorySql } from '../sql.infrastructure/user.repository.sql';

// Для провайдера всегда необходимо применять декоратор @Injectable() и регистрировать в модуле
@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    protected dateCreate: DateCreate,
  ) {}
  async getUserByLoginOrEmail(inputModelDto: LoginOrEmailInputModel) {
    return await this.usersRepository.getUserByLoginOrEmail(inputModelDto);
  }

  async getUserByCode(code: string) {
    return await this.usersRepository.getUserByCode(code);
  }

  async updateRecovery(email: string, code: string) {
    const createdAtPlus = await this.dateCreate.getDateInISOStringFormat();
    return await this.usersRepository.updateRecovery(
      email,
      code,
      createdAtPlus,
    );
  }
  async updateConfirmationStatus(inputModelDto: ConfirmationCodeInputModel) {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    return await this.usersRepository.updateConfirmationStatus(
      inputModelDto.code,
      createdAt,
    );
  }
  async updateUserConfirmationCodeAndData(
    inputModelDto: UserEmailInputModel,
    RecoveryCode: string,
  ) {
    const createdAtPlus = await this.dateCreate.getDateInISOStringFormat();
    return await this.usersRepository.updateUserConfirmationAccount(
      inputModelDto.email,
      RecoveryCode,
      createdAtPlus,
    );
  }

  async getUserById(userId: string) {
    return await this.usersRepository.getUserById(userId);
  }
  async getUserByEmail(email: string): Promise<User> {
    return await this.usersRepository.getUserByEmail(email);
  }
}
