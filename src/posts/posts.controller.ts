import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { SuccessMessage } from 'src/core/decorators/custom-message.decorator';
import { PageOptionsDto } from './dto/pagination-post.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { GetPostResponse } from './dto/responses/get-post-response.dto';
import { CreatePostResponseDto } from './dto/get-post-response.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UseOptionalJwtAuthGuard } from 'src/auth/guard/use-optional-auth.guard';
import { SearchPostsQueryDto } from './dto/search-posts-query.dto';

@ApiTags('api/conversation')
@Controller('api/conversation')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOkResponse({ type: CreatePostResponseDto })
  @ApiOperation({ summary: '응답을 저장합니다' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get('user')
  @ApiOperation({ summary: '유저가 저장한 값을 불러옵니다' })
  @ApiOkResponse({ type: GetPostResponse })
  @UseOptionalJwtAuthGuard({ pass: true })
  @SuccessMessage()
  async find(@Query() query: PageOptionsDto, @Req() { user }: { user: User }) {
    const result = await this.postsService.paginate(query, (qb) => {
      qb.where('post.userId = :userId', { userId: query.userId });
      qb.andWhere('post.is_public = true');

      if (user.id === query.userId) {
        qb.orWhere('post.userId = :userId', { userId: user.id });
      }

      return qb;
    });

    return result;
  }

  @Get('/search')
  @ApiOkResponse({ type: GetPostResponse })
  @SuccessMessage()
  async searchPosts(@Query() query: SearchPostsQueryDto) {
    return await this.postsService.searchPosts(query);
  }

  @Get()
  @ApiOkResponse({ type: GetPostResponse })
  @UseOptionalJwtAuthGuard({ pass: true })
  @SuccessMessage()
  async findAll(
    @Query() query: PageOptionsDto,
    @Req() { user }: { user: User },
  ) {
    return await this.postsService.paginate(query, (qb) => {
      if (user && user.id) {
        return qb
          .where('post.is_public = true')
          .orWhere('post.userId = :userId', { userId: user.id });
      } else {
        return qb.where('post.is_public = true'); // userId가 없으면 is_public이 true인 게시글
      }
    });
  }

  @Get('likes')
  @ApiOkResponse({ type: GetPostResponse })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findLikesConversations(
    @Query() query: PageOptionsDto,
    @Req() { user }: { user: User },
  ) {
    const result = await this.postsService.paginate(query, (qb) => {
      return qb.where('likes.userId = :userId', { userId: user?.id }); // userId가 같은 경우 모든 게시글
    });
    return result;
  }

  @Get('my-conversations')
  @ApiOkResponse({ type: GetPostResponse })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findConversations(
    @Query() query: PageOptionsDto,
    @Req() { user }: { user: User },
  ) {
    const result = await this.postsService.paginate(query, (qb) => {
      return qb.where('post.userId = :userId', { userId: user.id }); // userId가 같은 경우 모든 게시글
    });
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.getDetailPost(id);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '응답을 변경 합니다.' })
  @UseGuards(JwtAuthGuard)
  update(
    @Body() updatePostDto: UpdatePostDto,
    @Req() { user }: { user: User },
  ) {
    return this.postsService.update({
      updatePostDto,
      user,
    });
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() { user }: { user: User }) {
    return this.postsService.remove(id, user.id);
  }
}
