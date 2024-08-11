import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api/likes')
@Controller('api/likes')
export class LikesController {
  constructor(private readonly likeService: LikesService) {}

  @Get('/user')
  @UseGuards(JwtAuthGuard)
  getMyLikes(@Req() { user }: { user: User }) {
    return this.likeService.getUserLikes(user.id);
  }

  @Get('/user/:userId')
  getUsersLike(@Param('userId') userId: string) {
    return this.likeService.getUserLikes(userId);
  }

  @Get('/post/:postId')
  getPostsLike(@Param('postId') postId: string) {
    return this.likeService.getPostLikes(postId);
  }

  @Post('/post/:postId')
  @UseGuards(JwtAuthGuard)
  async likePost(
    @Param('postId') postId: string,
    @Req() request: { user: User },
  ) {
    return this.likeService.likePost(request.user.id, postId);
  }

  @Delete('/post/:postId')
  @UseGuards(JwtAuthGuard)
  async unlikePost(
    @Param('postId') postId: string,
    @Req() request: { user: User },
  ) {
    return this.likeService.unlikePost(request.user.id, postId);
  }
}
