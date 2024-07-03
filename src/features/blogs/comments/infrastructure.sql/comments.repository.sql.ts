import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsDb } from '../domain/comments.entity';

@Injectable()
export class CommentsRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createComment(commentDto: CommentsDb): Promise<string> {
    try {
      const newComment = await this.dataSource.query(
        `
      INSERT INTO "Comments"
      ("content","postId","userId","userLogin","createdAt") 
      values($1, $2, $3, $4, $5)
      RETURNING id`,
        [
          commentDto.content,
          commentDto.postId,
          commentDto.commentatorInfo.userId,
          commentDto.commentatorInfo.userLogin,
          commentDto.createdAt,
        ],
      );
      return newComment[0].id;
    } catch {
      throw new NotFoundException([
        {
          message: 'comment not created',
          field: 'CommentsRepositorySql.createComment',
        },
      ]);
    }
  }
}
