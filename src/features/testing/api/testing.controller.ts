import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestingService } from '../aplication/testing.service';
@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(protected testingService: TestingService) {}
  @Delete('/all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllData() {
    await this.testingService.deleteAllData();
    return;
  }
}
