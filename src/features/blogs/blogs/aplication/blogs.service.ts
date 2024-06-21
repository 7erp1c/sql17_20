import {
  CreateBlogInputModel,
  UpdateBlogInputModel,
} from '../api/models/input/create.blog.input.model';
import { BlogTypeCreate } from '../api/models/input/input';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogTypeOutput } from '../api/models/output/output';
import { Injectable } from '@nestjs/common';
import { DateCreate } from '../../../../base/adapters/get-current-date';

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly dateCreate: DateCreate,
  ) {}
  async createBlog(inputModel: CreateBlogInputModel): Promise<BlogTypeOutput> {
    const createdAt = await this.dateCreate.getCurrentDateInISOStringFormat();

    const newBlog: BlogTypeCreate = {
      name: inputModel.name,
      description: inputModel.description,
      websiteUrl: inputModel.websiteUrl,
      createdAt: createdAt,
      isMembership: false,
    };
    return await this.blogsRepository.createBlog(newBlog);
  }

  async updateBlog(blogId: string, blogUpdateDto: UpdateBlogInputModel) {
    return await this.blogsRepository.updateBlog(blogId, blogUpdateDto);
  }

  async deleteBlog(blogId: string) {
    return await this.blogsRepository.deleteBlog(blogId);
  }

  async findBlogById(blogId: string) {
    return await this.blogsRepository.findBlogById(blogId);
  }
}
