import { ApiTags } from '@nestjs/swagger';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CreateBlogInputModel,
  UpdateBlogInputModel,
} from './models/input/create.blog.input.model';
import { BlogsService } from '../aplication/blogs.service';
import { BlogTypeOutput } from './models/output/output';
import { QueryBlogsRequestType } from './models/input/input';
import { BlogsQueryRepository } from '../infrastructure/blogs.query-repository';
import { CreatePostInputModelByBlog } from '../../posts/api/models/input/create.post.input.models';
import { PostsService } from '../../posts/aplication/posts.service';
import { PostsQueryRepository } from '../../posts/infrastructure/posts.query-repository';

import { Request } from 'express';
import { AdminAuthGuard } from '../../../../common/guards/auth.admin.guard';
import { QueryUsersRequestType } from '../../../users/api/models/input/input';
import { createQuery } from '../../../../base/adapters/query/create.query';
import { BlindGuard } from '../../../../common/guards/blind.guard.token';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected postsService: PostsService,
  ) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  // @ApiResponse({
  //   status: 201,
  //   description: 'The record has been successfully created.',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getAllBlogs(@Query() query: QueryBlogsRequestType) {
    const { sortData, searchData } = createQuery(query);
    return await this.blogsQueryRepository.getAllBlogs(sortData, searchData);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createBlog(
    @Body() CreateModel: CreateBlogInputModel,
  ): Promise<BlogTypeOutput> {
    return await this.blogsService.createBlog(CreateModel);
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BlindGuard)
  async getAllPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryUsersRequestType,
    @Req() req: Request,
  ) {
    const { sortData, searchData } = createQuery(query);
    const findBlogById = await this.blogsService.findBlogById(blogId);
    if (!findBlogById) {
      throw new BadRequestException('Sorry bro, blog not found');
    }
    if (req.user && req.user.userId) {
      return await this.postsQueryRepository.getAllPosts(
        sortData,
        findBlogById._id.toString(),
        req.user.userId,
      );
    } else {
      return await this.postsQueryRepository.getAllPosts(
        sortData,
        findBlogById._id.toString(),
        undefined,
      );
    }
  }

  @Post(':blogId/posts')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Param('blogId') blogId: string,
    @Body() inputModel: CreatePostInputModelByBlog,
  ) {
    const findBlogById = await this.blogsService.findBlogById(blogId);
    if (!findBlogById) {
      throw new BadRequestException('Sorry bro, blog not found');
    }
    const inputModelPost = {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      blogId: blogId,
    };
    const newPost = await this.postsService.createPost(
      inputModelPost,
      findBlogById.name,
    );
    return await this.postsQueryRepository.getPostById(newPost);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getBlogById(@Param('id') blogId: string) {
    return await this.blogsQueryRepository.findBlogById(blogId);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() UpdateModel: UpdateBlogInputModel,
  ) {
    return await this.blogsService.updateBlog(blogId, UpdateModel);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') blogId: string) {
    return await this.blogsService.deleteBlog(blogId);
  }
}
