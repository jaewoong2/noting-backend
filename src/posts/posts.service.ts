import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, SelectQueryBuilder } from 'typeorm';
import { Post } from './entities/post.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { PageOptionsDto } from './dto/pagination-post.dto';
import { PageDto } from './dto/page.dto';
import { PageMetaDto } from './dto/page-meta.dto';
import { plainToInstance } from 'class-transformer';
import {
  CreatePostResponseDto,
  GetPostResponseDto,
} from './dto/get-post-response.dto';
import { OpenaiService } from 'src/openai/openai.service';
import { TagsService } from 'src/tags/tags.service';
import { UpdatePostDto } from './dto/update-post.dto';
import {
  AlereadyExistException,
  AuthroizationException,
  EntityNotFoundException,
} from 'src/core/filters/exception/service.exception';
import {
  ResponsePostsQueryDto,
  SearchPostsQueryDto,
} from './dto/search-posts-query.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly userService: UsersService,
    private readonly tagService: TagsService,
    private readonly openAIService: OpenaiService,
  ) {}

  async searchPosts(searchPostsQueryDto: SearchPostsQueryDto) {
    const { query } = searchPostsQueryDto;

    const posts = await this.postRepository
      .createQueryBuilder('post')
      .select(['post.title', 'post.description', 'post.createdAt', 'post.id'])
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.tags', 'tags')
      .where('post.is_public = :isPublic', { isPublic: true })
      .andWhere('(post.title LIKE :query OR post.description LIKE :query)', {
        query: `%${query}%`,
      })
      .getMany();

    const postsWithMatchSource = posts.map((post) => {
      let matchSource = '';
      let snippet = '';

      if (post.title.includes(query)) {
        matchSource = 'title';
        snippet = post.description.substring(0, 40); // description의 앞 20글자 추출
      } else if (post.description.includes(query)) {
        matchSource = 'description';
        const index = post.description.indexOf(query);
        const start = Math.max(0, index - 20);
        const end = Math.min(
          post.description.length,
          index + query.length + 20,
        );
        snippet = post.description.substring(start, end);
      }

      return {
        ...post,
        matchSource,
        snippet,
      };
    });

    return plainToInstance(ResponsePostsQueryDto, postsWithMatchSource);
  }

  async create(createPostDto: CreatePostDto) {
    const { description, user: userInformation, messageId } = createPostDto;

    const post = await this.postRepository.findOne({ where: { messageId } });

    if (post) {
      throw AlereadyExistException('이미 저장된 응답 입니다.');
    }

    // 데이터 유효성 검사
    if (!description || !userInformation.email) {
      throw EntityNotFoundException(
        `유효하지 않은 값 입니다. ${JSON.stringify({ description, email: userInformation.email })}`,
      );
    }

    // 트랜잭션 사용
    return await this.postRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const post = transactionalEntityManager.create(Post);

        const user = await this.userService.findOrCreateUser(
          userInformation,
          transactionalEntityManager,
        );

        if (!user) {
          throw EntityNotFoundException(
            `잘못된 유저 정보 입니다. ${userInformation}`,
          );
        }

        const { getTitle } = this.openAIService.useOpenAPI();
        const results = await getTitle(description);

        post.user = user;
        post.description = description;
        post.title = results.message.content;
        post.messageId = messageId;
        post.tags = [
          await this.tagService.findOrCreateTag(
            results.message.content.match(/\[(.*?)\]/)[1],
          ),
        ];

        const result = await transactionalEntityManager.save(post);

        return plainToInstance(CreatePostResponseDto, result);
      },
    );
  }

  async paginate(
    pageOptionsDto: Partial<PageOptionsDto>,
    attach: (qb: SelectQueryBuilder<Post>) => SelectQueryBuilder<Post>,
  ): Promise<PageDto<GetPostResponseDto>> {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.user', 'user')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('post.tags', 'tags');

    attach(qb)
      .orderBy('post.order', 'ASC')
      .addOrderBy('post.createdAt', 'DESC')
      .take(pageOptionsDto.take)
      .skip(pageOptionsDto.skip);

    // 결과를 가져오기
    const [posts, total] = await qb.getManyAndCount();

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

    if (result.length === 0) {
      return new PageDto(result, pageMetaDto);
    }

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
      .leftJoinAndSelect('post.tags', 'tags')
      .select([
        'tags.name',
        'user.id',
        'user.userName',
        'user.avatar',
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

  async update({
    updatePostDto,
    user,
  }: {
    updatePostDto: UpdatePostDto;
    user: User;
  }) {
    const post = await this.postRepository.findOne({
      where: { id: updatePostDto.id },
      relations: ['user'],
      select: ['user'],
    });

    if (post.user.id !== user.id) {
      throw AuthroizationException('작성자만 변경 할 수 있습니다.');
    }

    const result = await this.postRepository.update(
      {
        id: updatePostDto.id,
      },
      updatePostDto,
    );

    return result;
  }

  async remove(id: string, userId: User['id']) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (post.user.id !== userId) {
      throw AuthroizationException('작성자만 삭제 할 수 있습니다.');
    }

    const result = await this.postRepository.delete({ id: post.id });

    return result;
  }
}
