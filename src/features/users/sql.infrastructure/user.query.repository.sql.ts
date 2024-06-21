import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserOutputDto } from '../api/models/output/output';

@Injectable()
export class UserQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getById(id: string): Promise<UserOutputDto> {
    try {
      const result = await this.dataSource.query(
        `
             SELECT "id", "login", "email", "createdAt" FROM "Users"
             WHERE "id" =  $1`,
        [id],
      );
      return result[0];
    } catch {
      throw new NotFoundException();
    }
  }
}
