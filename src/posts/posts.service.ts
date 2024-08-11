import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { Post } from './entities/post.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { PageOptionsDto } from './dto/pagination-post.dto';
import { PageDto } from './dto/page.dto';
import { PageMetaDto } from './dto/page-meta.dto';
import { plainToInstance } from 'class-transformer';
import { GetPostResponseDto } from './dto/get-post-response.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly userService: UsersService,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const {
      description,
      title,
      user: userInformation,
      messageId,
    } = createPostDto;
    // 트랜잭션 사용
    return await this.postRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const post = transactionalEntityManager.create(Post);

        // 데이터 유효성 검사
        if (!description || !title || !userInformation.email) {
          throw new Error('Invalid input data');
        }

        const user = await this.userService.findOrCreateUser(
          userInformation,
          transactionalEntityManager,
        );

        if (!user) {
          throw new Error('Group or User not found');
        }

        post.user = user;
        post.description = description;
        post.title = title;
        post.messageId = messageId;

        const result = await transactionalEntityManager.save(post);

        return result;
      },
    );
  }

  async paginate(
    pageOptionsDto: Partial<PageOptionsDto>,
    where?: Pick<FindManyOptions<Post>, 'where'>,
  ): Promise<PageDto<GetPostResponseDto>> {
    const [posts, total] = await this.postRepository.findAndCount({
      take: pageOptionsDto.take,
      skip: pageOptionsDto.skip,
      relations: ['user', 'likes', 'comments'],
      order: { order: 'ASC', createdAt: 'DESC' },
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

    const result = plainToInstance(GetPostResponseDto, posts, {});

    if (last_page >= pageMetaDto.page) {
      return new PageDto(result, pageMetaDto);
    } else {
      throw new NotFoundException('해당 페이지는 존재하지 않습니다');
    }
  }

  async getDetailPost(id: string) {
    const post = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .select([
        'user.id',
        'user.userName',
        'post.id',
        'post.title',
        'post.description',
        'post.createdAt',
      ])
      .where('post.id = :id', { id })
      .getOne();

    return post;
  }

  async findOne(id: string, options?: Omit<FindOneOptions<Post>, 'where'>) {
    return this.postRepository.findOne({ where: { id }, ...options });
  }

  update(id: string) {
    return `This action updates a #${id} post`;
  }

  async remove(id: string, userId: User['id']) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (post.user.id !== userId) {
      throw new Error('작성자만 삭제 할 수 있습니다.');
    }

    const result = await this.postRepository.delete({ id: post.id });

    return result;
  }
}
