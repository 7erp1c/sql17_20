import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from '../../posts/aplication/posts.service';
import { CommentCreateDto } from '../../blogs/api/models/input/input';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsDb, CommentsDb as Comments } from '../domain/comments.entity';
import { CommentUpdateInputModel } from '../api/input/comments.input.model';
import { UsersService } from '../../../users/application/users.service';
import { DateCreate } from '../../../../base/adapters/get-current-date';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected userService: UsersService,
    protected postService: PostsService,
    protected dateCreate: DateCreate,
  ) {}

  async getCommentById(id: string) {
    return await this.commentsRepository.getCommentById(id);
  }

  async createComment(createDto: CommentCreateDto): Promise<string> {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    const user = await this.userService.getUserById(createDto.userId);
    if (!user) throw new BadRequestException();

    //let commentCreateModel: Comment;
    const commentCreateModel: CommentsDb = {
      content: createDto.content,
      postId: createDto.postId,
      commentatorInfo: {
        userId: createDto.userId,
        userLogin: user.login,
      },
      createdAt: createdAt,
    };
    return await this.commentsRepository.createComment(commentCreateModel);
  }
  async updateComment(
    id: string,
    updateModel: CommentUpdateInputModel,
    userId: string,
  ) {
    const findCommentId = await this.getCommentById(id);
    if (!findCommentId) throw new NotFoundException('Comment not found');
    if (userId !== findCommentId.commentatorInfo.userId)
      throw new ForbiddenException('You are not the owner of the comment');
    return await this.commentsRepository.updateComment(id, updateModel);
  }

  async deleteComment(id: string, userId: string) {
    const findCommentId = await this.getCommentById(id);

    if (!findCommentId) throw new NotFoundException('Comment not found');
    if (userId !== findCommentId.commentatorInfo.userId)
      throw new ForbiddenException('You are not the owner of the comment');

    //deleted:
    return await this.commentsRepository.deleteComments(id);
  }
}
