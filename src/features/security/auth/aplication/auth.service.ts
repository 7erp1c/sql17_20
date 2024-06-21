import {
  BadRequestException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfirmationCodeInputModel,
  NewPasswordInputModel,
  UserEmailInputModel,
} from '../api/model/input/loginOrEmailInputModel';
import { Error } from 'mongoose';
import { DevicesService } from '../../devices/aplication/devices.service';
import { RefreshTokenBlackRepository } from '../infrastructure/refresh.token.black.repository';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../setting/constants';
import { UsersService } from '../../../users/application/users.service';
import { BcryptAdapter } from '../../../../base/adapters/bcrypt.adapter';
import { RandomNumberService } from '../../../../common/service/random/randomNumberUUVid';
import { EmailsManager } from '../../../../common/service/email/email-manager';
import { DateCreate } from '../../../../base/adapters/get-current-date';
import { CommandBus } from '@nestjs/cqrs';
import { UpdatePasswordUseCaseCommand } from '../../../users/aplicaion.use.case/update.password.use.case';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptAdapter: BcryptAdapter,
    private readonly randomNumberService: RandomNumberService,
    private readonly emailsManager: EmailsManager,
    private readonly dateCreate: DateCreate,
    private readonly devicesService: DevicesService,
    private readonly tokenBlack: RefreshTokenBlackRepository,
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
  ) {}

  async newPassword(inputModelDto: NewPasswordInputModel) {
    const user = await this.usersService.getUserByCode(inputModelDto.code);
    //сравним input-password и hash c Db, незя использовать старый
    const compareHash = await this.bcryptAdapter.compareHash(
      inputModelDto.password,
      user.hash,
    );
    if (!compareHash)
      throw new BadRequestException(
        `status: ${HttpStatus.NOT_FOUND}, Method: newPassword, field: compareHash, hash&hash`,
      );
    //проверим не протух ли код:
    const currentDate = await this.dateCreate.getCurrentDateInISOStringFormat();
    if (user.recoveryPassword.expirationDate < currentDate)
      throw new BadRequestException(
        `status: ${HttpStatus.NOT_FOUND}, Method: newPassword, field: currentDate, currentDate&expirationDate`,
      );
    //......
    const updatePassword = await this.commandBus.execute(
      new UpdatePasswordUseCaseCommand(inputModelDto),
    );
    if (!updatePassword)
      throw new BadRequestException(
        `status: ${HttpStatus.NOT_FOUND}, Method: newPassword, field: updatePassword, not update`,
      );
    return;
  }

  async passwordRecovery(inputModelDto: UserEmailInputModel) {
    const user = await this.usersService.getUserByEmail(inputModelDto.email);
    if (!user.recoveryPassword.isUsed) {
      //проверим не протух ли код:
      const currentDate =
        await this.dateCreate.getCurrentDateInISOStringFormat();
      if (user.recoveryPassword.expirationDate < currentDate)
        throw new BadRequestException(
          `status: ${HttpStatus.NOT_FOUND}, Method: newPassword, field: currentDate, currentDate&expirationDate`,
        );
      const sendEmail = this.emailsManager.emailsManagerRecovery(
        user.email,
        user.recoveryPassword.recoveryCode,
      );
      if (!sendEmail)
        throw new Error('The email has not been delivered to the soap.');
      return sendEmail;
    }
    if (user.recoveryPassword.isUsed) {
      const RecoveryCode = await this.randomNumberService.generateRandomUUID();
      const updateRecoveryUser = this.usersService.updateRecovery(
        user.email,
        RecoveryCode,
      );
      if (!updateRecoveryUser) throw new Error('Not update recovery code');
      const sendEmail = this.emailsManager.emailsManagerRecovery(
        user.email,
        RecoveryCode,
      );
      if (!sendEmail)
        throw new Error('The email has not been delivered to the soap.');
      return sendEmail;
    }
  }

  async registrationConfirmation(inputModelDto: ConfirmationCodeInputModel) {
    const user = await this.usersService.getUserByCode(inputModelDto.code);
    const currentDate = await this.dateCreate.getCurrentDateInISOStringFormat();
    if (
      !user ||
      user.emailConfirmation.confirmationCode !== inputModelDto.code ||
      user.emailConfirmation.isConfirmed ||
      user.emailConfirmation.expirationDate < currentDate
    )
      throw new BadRequestException([
        {
          message: 'code already exist',
          field: 'code',
        },
      ]);
    const updateConfirmationStatus =
      this.usersService.updateConfirmationStatus(inputModelDto);
    if (!updateConfirmationStatus)
      throw new Error('Not updated confirmation status');
    return updateConfirmationStatus;
  }

  async registrationEmailResending(inputModelDto: UserEmailInputModel) {
    const RecoveryCode = await this.randomNumberService.generateRandomUUID();
    const user = await this.usersService.getUserByEmail(inputModelDto.email);
    if (!user || user.emailConfirmation.isConfirmed)
      throw new BadRequestException([
        {
          message: 'code already exist',
          field: 'email',
        },
      ]);
    const updateUserConfirmationData =
      await this.usersService.updateUserConfirmationCodeAndData(
        inputModelDto,
        RecoveryCode,
      );
    if (!updateUserConfirmationData) throw new Error('User not updated');
    this.emailsManager.sendMessageWitchConfirmationCode(
      user.email,
      user.login,
      RecoveryCode,
    );
    return updateUserConfirmationData;
  }

  async updatePairToken(oldRefreshToken: string) {
    //ищем в блэклисте
    const isInBlackList =
      await this.tokenBlack.findInBlackList(oldRefreshToken);
    //протухани и достаём payload
    const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
      secret: jwtConstants.secret,
    });
    if (!payload || isInBlackList) throw new UnauthorizedException();
    await this.tokenBlack.addToBlackList(oldRefreshToken);

    const deviceId = payload.deviceId;
    const userId = payload.userId;
    const userName = payload.loginUser;

    return await this.devicesService.updateSession(userId, deviceId, userName);
  }
}
