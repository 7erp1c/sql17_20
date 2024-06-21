import {
  SessionInputModel,
  SessionModel,
  SessionUpdateModel,
} from '../api/model/input/session.input.models';

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { DeviceRepository } from '../infrastructure/device.repository';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../auth/setting/constants';
import { RandomNumberService } from '../../../../common/service/random/randomNumberUUVid';
import { TokenService } from '../../../../common/service/jwt/token.service';
@Injectable()
export class DevicesService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
    protected randomNumberService: RandomNumberService,
    private readonly deviceRepository: DeviceRepository,
  ) {}
  async createSession(
    sessionInputModel: SessionInputModel,
    userId: string,
    userName: string,
  ) {
    const deviceId = await this.randomNumberService.generateRandomUUID();
    const tokenAccess = await this.tokenService.createJWT(userId, userName);
    const tokenRefresh = await this.tokenService.createJWTRefresh(
      userId,
      userName,
      deviceId,
    );
    if (!tokenAccess || !tokenRefresh)
      throw new UnauthorizedException('Token not created');
    const tokenData = await this.tokenService.decodeRefreshToken(tokenRefresh);
    if (!tokenData) throw new UnauthorizedException('Token not decoded');

    const sessionModel: SessionModel = {
      userId: userId,
      deviceId: deviceId,
      deviceTitle: sessionInputModel.deviceTitle,
      ip: sessionInputModel.ip,
      lastActiveDate: tokenData.iat,
      refreshToken: {
        createdAt: tokenData.iat,
        expiredAt: tokenData.exp,
      },
    };

    await this.deviceRepository.createNewSession(sessionModel);
    //возвращаем two token:
    return { tokenAccess, tokenRefresh };
  }

  async terminateSession(deviceId: string, refreshTokenValue: string) {
    const payload = await this.jwtService.verifyAsync(refreshTokenValue, {
      secret: jwtConstants.secret,
    });
    if (!payload) throw new UnauthorizedException('Payload empty');
    console.log('deviceId', payload.deviceId, 'userId: ', payload.userId);

    const currentUserId = payload.userId;
    console.log('currentUserId', currentUserId);
    const sessionUserId =
      await this.deviceRepository.getSessionByDeviceId(deviceId);
    console.log('sessionUserId: ', sessionUserId);

    if (!sessionUserId) throw new UnauthorizedException('Session not found');
    if (currentUserId !== sessionUserId)
      throw new ForbiddenException('The session does not belong to the user');

    return await this.deviceRepository.deleteSessionById(deviceId);
  }

  async terminateSessionForLogout(deviceId: string, currentUserId: string) {
    const sessionUserId =
      await this.deviceRepository.getSessionByDeviceId(deviceId);

    if (!sessionUserId) throw new UnauthorizedException('Session not found');
    if (currentUserId !== sessionUserId)
      throw new ForbiddenException('The session does not belong to the user');

    return await this.deviceRepository.deleteSessionById(deviceId);
  }

  async terminateAllSessions(refreshTokenValue: string) {
    const payload = this.jwtService.decode(refreshTokenValue);
    if (!payload) throw new UnauthorizedException();

    const currentUserId = payload.userId;
    console.log('currentUserId', currentUserId);
    const currentSessionDeviceId = payload.deviceId;
    console.log('currentSessionDeviceId', currentUserId);

    await this.deviceRepository.deleteSessionsExpectCurrent(
      currentUserId,
      currentSessionDeviceId,
    );
    return;
  }

  async updateSession(userId: string, deviceId: string, userName: string) {
    const tokenAccess = await this.tokenService.createJWT(userId, userName);
    const tokenRefresh = await this.tokenService.createJWTRefresh(
      userId,
      userName,
      deviceId,
    );
    const tokenData = await this.tokenService.decodeRefreshToken(tokenRefresh);
    if (!tokenData) throw new UnauthorizedException('Token not decoded');
    const sessionUpdateModel: SessionUpdateModel = {
      lastActiveDate: tokenData.iat,
      refreshToken: {
        createdAt: tokenData.iat,
        expiredAt: tokenData.exp,
      },
    };

    await this.deviceRepository.updateExistSession(
      deviceId,
      sessionUpdateModel,
    );
    return { tokenAccess, tokenRefresh };
  }
}
