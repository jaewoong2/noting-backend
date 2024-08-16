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

@ApiTags('api/conversation')
@Controller('api/conversation')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOkResponse({ type: CreatePostResponseDto })
  @ApiOperation({ summary: 'Create User' })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get('user')
  @ApiOperation({ summary: 'Create User' })
  @ApiOkResponse({ type: GetPostResponse })
  @SuccessMessage()
  async find(@Query() query: PageOptionsDto) {
    const result = await this.postsService.paginate(query, {
      where: { user: { email: query.userEmail }, is_public: true },
    });
    return result;
  }

  @Get()
  @ApiOkResponse({ type: GetPostResponse })
  @SuccessMessage()
  async findAll(@Query() query: PageOptionsDto) {
    return await this.postsService.paginate(query, {
      where: { is_public: true },
    });
  }

  @Get('my-conversations')
  @ApiOkResponse({ type: GetPostResponse })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  async findConversations(
    @Query() query: PageOptionsDto,
    @Req() { user }: { user: User },
  ) {
    const result = await this.postsService.paginate(query, {
      where: { user: { id: user.id } },
    });
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.getDetailPost(id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.postsService.update(id);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() { user }: { user: User }) {
    return this.postsService.remove(id, user.id);
  }
}
