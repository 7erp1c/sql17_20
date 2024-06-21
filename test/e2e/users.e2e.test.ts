import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  afterEach,
  jest,
} from '@jest/globals';
import { initSettings } from '../util/init-settings';
import { UsersService } from '../../src/features/users/application/users.service';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UserServiceMock } from '../__mocks__/users.service.mock';
import { AdminAuthGuard } from '../../src/common/guards/auth.admin.guard';
// const mockUserServiceFactory = () => ({
//   findAll: async () => [{ id: 1, name: 'Test User' }],
// });
//
// const mockUserRepositoryFactory = () => ({
//   find: async () => [{ id: 1, name: 'Test User' }],
// });
describe('test AuthService', () => {
  let app: INestApplication;
  let cleanDb;
  let httpServer;
  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) => {
      moduleBuilder.overrideProvider(UsersService).useClass(UserServiceMock);
    });
    app = result.app;
    cleanDb = result.databaseConnection;
    httpServer = result.httpServer;
  });
  afterEach(async () => {
    await cleanDb;
  });
  afterAll(async () => {
    await cleanDb;
    await app.close();
    // const jestSpyAuthApi = jest
    //   .spyOn(AdminAuthGuard.prototype, 'fetchTokenData')
    //   .mockResolvedValue(tokenData);
  });

  describe('plug', () => {
    it('test', () => {
      expect(true).toBe(true);
    });
  });

  describe('testUsersEndpoint', () => {
    it(' - create user for test posts', async () => {
      const createUser = await request(httpServer)
        .post('/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'Ratmir',
          password: 'qwerty123',
          email: 'ul-tray@bk.ru',
        })
        .expect(HttpStatus.CREATED);
      expect(createUser.body).toMatchObject({
        createdAt: expect.any(String),
        email: expect.any(String),
        id: expect.any(String),
        login: expect.any(String),
      });
    });
  });
});
