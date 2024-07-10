import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { appSettings } from './settings/app-settings';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ThrottlerModule } from '@nestjs/throttler';
import cookieParser from 'cookie-parser';

import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { SecurityModule } from './features/security/security.module';
import { TestingModule } from './features/testing/testing.module';
import process from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
//const URI = appSettings.api.MONGO_CONNECTION_URI;
//console.log(URI, 'URI**');
import bcrypt from 'bcrypt';

const mongoModule = MongooseModule.forRoot(
  appSettings.env.isTesting()
    ? appSettings.api.MONGO_CONNECTION_URI_FOR_TESTS
    : appSettings.api.MONGO_CONNECTION_URI,
);
const throttleModule = ThrottlerModule.forRoot([
  {
    ttl: 10000,
    limit: 5,
  },
]);

const typeOrmModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'su',
  database: 'postgres',
  autoLoadEntities: true,
  synchronize: false,
  // logging: true,
  //ssl: true,
});
const appModules = [UsersModule, BlogsModule, SecurityModule];
//дабы не заюзать
if (process.env.ENV !== 'PRODUCTION') {
  appModules.push(TestingModule);
}
@Module({
  // Регистрация модулей
  imports: [
    typeOrmModule,
    mongoModule,
    throttleModule,
    ...appModules,
    // TestingModule.register(),
  ],
  providers: [],
  controllers: [],
})
export class AppModule implements NestModule {
  // https://docs.nestjs.com/middleware#applying-middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')
      .apply(cookieParser())
      .forRoutes('*');
  }
}

const run = async () => {
  const hash = '$2a$10$Vn9PcYBKm2y0GeJK.Kzn6.0TKig9rHLd0ssxfijvKidM4OLwlr0jS';
  const passwords = [
    '123',
    'qwerty',
    'password',
    'superpassword',
    'anykibeniky',
    'belarus',
  ];

  for (const password of passwords) {
    const result = await bcrypt.compare(password, hash);
    if (result) {
      console.log('correct password: ', password);
      break;
    }
  }
};

run();
