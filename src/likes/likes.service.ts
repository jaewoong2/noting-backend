import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';
import { PageOptionsDto } from 'src/posts/dto/pagination-post.dto';
import { PageDto } from 'src/posts/dto/page.dto';
import { GetLikeResponseDto } from './dto/get-like-response.dto';
import { PageMetaDto } from 'src/posts/dto/page-meta.dto';
import { plainToInstance } from 'class-transformer';

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

  async paginate(
    pageOptionsDto: Partial<PageOptionsDto>,
    where?: Pick<FindManyOptions<Like>, 'where'>,
  ) {
    const [likes, total] = await this.likeRepository.findAndCount({
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      relations: ['user', 'posts'],
      order: { createdAt: 'DESC' },
      where: where.where,
    });

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: {
        skip: pageOptionsDto.skip,
        page: pageOptionsDto.page,
        take: pageOptionsDto.take,
      },
      total,
    });

    const last_page = pageMetaDto.last_page;

    const result = plainToInstance(GetLikeResponseDto, likes, {});

    if (result.length === 0) {
      return new PageDto(result, pageMetaDto);
    }

    if (last_page >= pageMetaDto.page) {
      return new PageDto(result, pageMetaDto);
    } else {
      throw new NotFoundException('해당 페이지는 존재하지 않습니다');
    }
  }
}
