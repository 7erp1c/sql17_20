import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesInfoType } from '../../likes/api/model/output/output';
import { CommentView } from '../api/output/type';
import { getCommentsViewSql } from '../api/output/mapper';
import { CommentsLikesQueryRepositorySql } from '../../likes/infrastructure.sql/comments.likes.query.repository.sql';

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
      if (!comment)
        throw new NotFoundException([
          {
            message: 'Comment not found',
            field: 'getCommentById',
          },
        ]);
      const likes: LikesInfoType =
        await this.commentsLikesQueryRepositorySql.getLikes(commentId, userId);
      const comments = comment as unknown as CommentView;
      if (comment) return getCommentsViewSql(comments, likes);
      else return null;
    } catch (err) {
      return null;
    }
  }
}
