import { Injectable } from '@nestjs/common';
import {
  CreatePostInputModels,
  UpdatePostInputModel,
} from '../api/models/input/create.post.input.models';
import { Post } from '../domain/posts.entity';
import { PostsRepository } from '../infrastructure/posts.repository';
import { DateCreate } from '../../../../base/adapters/get-current-date';

@Injectable()
export class PostsService {
  constructor(
    protected readonly dateCreate: DateCreate,
    protected readonly postsRepository: PostsRepository,
  ) {}

  async createPost(inputModel: CreatePostInputModels, blogName: string) {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();
    const newPosts: Post = {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      blogId: inputModel.blogId,
      blogName: blogName,
      createdAt: createdAt,
    };
    const newPostId = this.postsRepository.createPost(newPosts);
    return newPostId;
  }

  async updateBlog(postId: string, postUpdateDto: UpdatePostInputModel) {
    return await this.postsRepository.updatePost(postId, postUpdateDto);
  }

  async deletePost(postId: string) {
    return await this.postsRepository.deletePost(postId);
  }

  async findPostById(id: string) {
    return await this.postsRepository.findPostById(id);
  }
}
