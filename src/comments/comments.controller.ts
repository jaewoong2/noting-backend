import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('api/comments')
@Controller('api/comments')
export class CommentsController {
  constructor(private readonly commentService: CommentsService) {}

  @Post('post/:postId')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @Req() request: { user: User },
    @Param('postId') postId: string,
    @Body('content') content: string,
  ) {
    return this.commentService.addComment(request.user.id, postId, content);
  }

  @Get('post/:postId')
  async getCommentsForPost(@Param('postId') postId: string) {
    return this.commentService.getCommentsForPost(postId);
  }

  @Delete(':commentId/user')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() request: { user: User },
  ) {
    return this.commentService.deleteComment(commentId, request.user.id);
  }
}
