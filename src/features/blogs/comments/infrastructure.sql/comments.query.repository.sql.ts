import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesInfoType } from '../../likes/api/model/output/output';
import { getCommentsViewSql } from '../api/output/mapper';
import { CommentsLikesQueryRepositorySql } from '../../likes/infrastructure.sql/query/comments.likes.query.repository.sql';

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected commentsLikesQueryRepositorySql: CommentsLikesQueryRepositorySql,
  ) {}
  async getCommentById(commentId: string, userId?: string) {
    try {
      const comment = await this.dataSource.query(
        `SELECT *
          FROM "Comments" 
           WHERE "id" = $1
           AND "isDeleted" = false
        `,
        [commentId],
      );
      console.log(comment[0]);
      if (!comment[0])
        throw new NotFoundException([
          {
            message: 'Comment not found',
            field: 'getCommentById',
          },
        ]);
      const likes: LikesInfoType =
        await this.commentsLikesQueryRepositorySql.getLikes(commentId, userId!);
      return getCommentsViewSql(comment[0], likes);
    } catch (error) {
      throw new NotFoundException([
        {
          message: error,
          field: 'getCommentById',
        },
      ]);
    }
  }
}
