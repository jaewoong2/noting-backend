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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api/conversation')
@Controller('api/conversation')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  @SuccessMessage()
  async findAll(@Query() query: PageOptionsDto) {
    return await this.postsService.paginate(query, {
      where: { is_public: true },
    });
  }

  @Get('user')
  @SuccessMessage()
  async find(@Query() query: PageOptionsDto) {
    const result = await this.postsService.paginate(query, {
      where: { user: { email: query.userEmail }, is_public: true },
    });
    return result;
  }

  @Get('my-conversations')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() { user }: { user: User }) {
    return this.postsService.remove(id, user.id);
  }
}
