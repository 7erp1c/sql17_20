import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikesInfoType } from '../api/model/output/output';
import { LikeStatusType } from '../api/model/input/input.types';
import { PostsLikesDocument } from '../domain/likes.entity';

@Injectable()
export class CommentsLikesQueryRepositorySql {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async getLikes(commentId: string, userId?: string): Promise<LikesInfoType> {
    let likeStatus: LikeStatusType = 'None';

    if (userId) {
      const userLike = await this.dataSource.query(
        `
          SELECT * FROM "CommentsLikes"
            WHERE "commentId" = $1 
            AND "likedUserId" = $2
            `,
        [commentId, userId],
      );
      if (userLike) {
        likeStatus = userLike[0].status;
      }
    }

    const likesResult = await this.dataSource.query(
      `
          SELECT COUNT(*)
            FROM "CommentsLikes"
              WHERE "commentId" = $1 
                AND status = 'Like'`,
      [commentId],
    );
    const likesCount = parseInt(likesResult[0].count, 10);

    const dislikesResult = await this.dataSource.query(
      `
          SELECT COUNT(*)
            FROM "CommentsLikes"
              WHERE "commentId" = $1 
                AND status = 'Dislike'`,
      [commentId],
    );
    const dislikesCount = parseInt(dislikesResult[0].count, 10);
    const newestLikes = await this.dataSource.query(
      `
         SELECT *
            FROM "CommentsLikes"
             WHERE "commentId" = $1 AND status = 'Like'
              ORDER BY "addedAt" DESC
               LIMIT 3
      `,
      [commentId],
    );
    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      myStatus: likeStatus,
    };
  }
}
