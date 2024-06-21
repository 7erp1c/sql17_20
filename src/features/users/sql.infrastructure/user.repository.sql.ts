import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../api/models/output/output';
import { User } from '../domain/user.entity';
import { ObjectId } from 'mongodb';
@Injectable()
export class UsersRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(newUserDto: CreateUserDto | User): Promise<string> {
    try {
      const result = await this.dataSource.query(
        `
            INSERT INTO "Users"
            ("login","email","hash")
            values($1,$2,$3)
            RETURNING id
        `,
        [newUserDto.login, newUserDto.email, newUserDto.hash],
      );
      return result[0].id;
    } catch {
      throw new NotFoundException();
    }
  }

  async deleteUser(id: string) {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public."Users"
        WHERE "id" = $1`,
        [id],
      );

      if (!result) throw new NotFoundException('User not found');
      return result;
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  public async valueIsExist(columnName: string, value: string) {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) FROM "Users" WHERE "${columnName}" = \$1`,
      [value],
    );
    const count = parseInt(result[0].count, 10);
    return count > 0;
  }
}
