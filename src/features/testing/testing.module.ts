import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingService } from './aplication/testing.service';
import { TestingRepository } from './infrastructure/testing.repository';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingService, TestingRepository],
  exports: [],
})
export class TestingModule {}
