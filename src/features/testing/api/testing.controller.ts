import { Controller, Delete, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TestingService } from '../aplication/testing.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('Testing')
@Controller('testing')
export class TestingController {
  constructor(
    protected testingService: TestingService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  // @Delete('/all-data')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteAllData() {
  //   await this.testingService.deleteAllData();
  //   return;
  // }
  //Каскадное удаление шоб ключи не ругались на неопнятные связи😁
  @Delete('/all-data')
  @HttpCode(204)
  async clearBd(): Promise<void> {
    await this.dataSource.query(`DELETE FROM public."BlackList" CASCADE`);
    await this.dataSource.query(`DELETE FROM public."Sessions" CASCADE`);
    await this.dataSource.query(`DELETE FROM public."Users" CASCADE`);
    await this.dataSource.query(`DELETE  FROM public."CommentsLikes" CASCADE`);
    await this.dataSource.query(`DELETE  FROM public."Comments" CASCADE`);
    await this.dataSource.query(`DELETE FROM public."PostsLikes" CASCADE`);
    await this.dataSource.query(`DELETE  FROM public."Posts" CASCADE`);
    await this.dataSource.query(`DELETE FROM public."Blogs" CASCADE`);

    return;
  }
}
