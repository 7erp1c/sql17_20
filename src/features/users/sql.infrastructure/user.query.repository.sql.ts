import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { UserOutputDto } from '../api/models/output/output';
import {
  QuerySearchType,
  QuerySortType,
} from '../../../base/adapters/query/types';

@Injectable()
export class UserQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllUsers(sortData: QuerySortType, searchData: QuerySearchType) {
    let sortKey = '';
    const searchConditions: string[] = [];

    // Создание условий поиска
    if (searchData.searchLoginTerm) {
      searchConditions.push(`'login' ILIKE '%${searchData.searchLoginTerm}%'`);
    }
    if (searchData.searchEmailTerm) {
      searchConditions.push(`'email' ILIKE '%${searchData.searchEmailTerm}%'`);
    }

    // Определение ключа сортировки
    switch (sortData.sortBy) {
      case 'login':
        sortKey = `"login"`;
        break;
      case 'email':
        sortKey = `"email"`;
        break;
      default:
        sortKey = `"createdAt"`;
        break;
    }
    sortKey += sortData.sortDirection === 'asc' ? ' ASC' : ' DESC';

    // Подсчет общего количества пользователей
    const documentsTotalCountQuery = `
    SELECT COUNT(*)
    FROM "Users"
    WHERE ${searchConditions.length ? searchConditions.join(' OR ') : '1=1'}
    `;
    const documentsTotalCountResult = await this.dataSource.query(
      documentsTotalCountQuery,
    );
    const documentsTotalCount = parseInt(documentsTotalCountResult[0].count);

    // Расчет смещения для пагинации
    const skippedDocuments = (sortData.pageNumber - 1) * sortData.pageSize;

    // Получение пользователей из базы данных
    const usersQuery = `
    SELECT *
    FROM "Users"
    WHERE ${searchConditions.length ? searchConditions.join(' OR ') : '1=1'}
    ORDER BY ${sortKey}
    OFFSET ${skippedDocuments}
    LIMIT ${sortData.pageSize}
  `;
    const users = await this.dataSource.query(usersQuery);

    // Расчет количества страниц
    const pageCount = Math.ceil(documentsTotalCount / sortData.pageSize);

    return {
      pagesCount: pageCount,
      page: sortData.pageNumber,
      pageSize: sortData.pageSize,
      totalCount: documentsTotalCount,
      items: users.map((item) => ({
        id: item.id,
        login: item.login,
        email: item.email,
        createdAt: item.createdAt,
      })),
    };
  }
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
