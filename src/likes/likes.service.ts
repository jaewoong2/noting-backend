import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    private readonly postService: PostsService,
    private readonly userService: UsersService,
  ) {}

  async likePost(userId: string, postId: string): Promise<Like> {
    const user = await this.userService.findById(userId);
    const post = await this.postService.findOne(postId);

    if (!user || !post) {
      throw new Error('User or Post not found');
    }

    // Check if the user already liked the post
    const existingLike = await this.likeRepository.findOne({
      where: { user, post },
    });

    if (existingLike) {
      throw new Error('User has already liked this post');
    }

    const like = this.likeRepository.create({ user, post });
    return this.likeRepository.save(like);
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const user = await this.userService.findById(userId);
    const post = await this.postService.findOne(postId);

    if (!user || !post) {
      throw new Error('User or Post not found');
    }

    // Find the like entity
    const like = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!like) {
      throw new Error('Like not found');
    }

    await this.likeRepository.remove(like);
  }

  async getPostLikes(postId: string): Promise<Like[]> {
    return this.likeRepository.find({
      where: { post: { id: postId } },
      relations: ['user'],
    });
  }

  async getUserLikes(userId: string): Promise<Like[]> {
    return this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
    });
  }
}
