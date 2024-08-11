import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postService: PostsService,
    private readonly userService: UsersService,
  ) {}

  async addComment(
    userId: string,
    postId: string,
    content: string,
  ): Promise<Comment> {
    const user = await this.userService.findById(userId);
    const post = await this.postService.findOne(postId);

    if (!user || !post) {
      throw new Error('User or Post not found');
    }

    const comment = this.commentRepository.create({ user, post, content });
    return this.commentRepository.save(comment);
  }

  async getCommentsForPost(postId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'],
    });

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user.id !== userId) {
      throw new Error('You are not authorized to delete this comment');
    }

    await this.commentRepository.remove(comment);
  }
}
