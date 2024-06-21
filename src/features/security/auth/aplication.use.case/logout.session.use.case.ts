import { jwtConstants } from '../setting/constants';
import { UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../../devices/aplication/devices.service';
import { RefreshTokenBlackRepository } from '../infrastructure/refresh.token.black.repository';
export class LogoutSessionUseCaseCommand {
  constructor(public oldRefreshToken: string) {}
}
@CommandHandler(LogoutSessionUseCaseCommand)
export class LogoutSessionUseCase
  implements ICommandHandler<LogoutSessionUseCaseCommand>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenBlack: RefreshTokenBlackRepository,
    private readonly devicesService: DevicesService,
  ) {}

  async execute(command: LogoutSessionUseCaseCommand) {
    const payload = await this.jwtService.verifyAsync(command.oldRefreshToken, {
      secret: jwtConstants.secret,
    });
    console.log('controller', payload);
    const isInBlackList = await this.tokenBlack.findInBlackList(
      command.oldRefreshToken,
    );

    if (!payload || isInBlackList) throw new UnauthorizedException();

    await this.tokenBlack.addToBlackList(command.oldRefreshToken);
    await this.devicesService.terminateSessionForLogout(
      payload.deviceId,
      payload.userId,
    );
  }
}
